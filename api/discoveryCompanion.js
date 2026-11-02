/**
 * discoveryCompanion — the Base44 Gemini function, running as a Vercel function.
 *
 * Same contract as base44/functions/discoveryCompanion/entry.ts:
 * optional, participant-initiated, stores nothing, and only a recent window of the
 * conversation is sent. Admin only, same as the Base44 function. Not wired to a page.
 *
 * POST JSON:
 *   { "mode": "health" }
 *   { "mode": "fixture", "scenario": "garden" | "pass" | "interpretation" }
 *   { "mode": "chat", "messages": [{ "role": "user" | "model", "text": "..." }] }
 *
 * GEMINI_API_KEY is read on the server. GEMINI_MODEL and GEMINI_THINKING_LEVEL are optional.
 */
import { COMPANION_SYSTEM_INSTRUCTION } from '../server/companionPrompt.js';
import {
  API_BASE,
  REQUEST_TIMEOUT_MS,
  apiKey,
  generateWithFallback,
  logStatus,
  modelId,
  rateLimited,
  readUpstream,
  recentWindow,
  replyFrom,
  thinkingLevel,
} from '../server/gemini.js';
import { readJson, sendJson } from '../server/http.js';
import { requireUser } from '../server/session.js';

const MAX_BODY_BYTES = 120_000;
const MAX_TURN_CHARS = 4_000;
const CONTEXT_CHAR_BUDGET = 12_000;
const MAX_OUTPUT_TOKENS = 1024;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_CALLS_PER_WINDOW = 60;
const UNAVAILABLE = 'This isn’t available right now.';

const FIXTURES = {
  garden: [
    { role: 'user', text: "Made-up test. I keep noticing the community garden on my street. I stop and look, but I've never gone in." },
    { role: 'model', text: "You keep stopping to look, but you haven't gone in yet. What do you find yourself looking at when you stop?" },
    { role: 'user', text: "Mostly how they built the raised beds out of old pallets. I'm not sure I care about plants at all." },
  ],
  pass: [
    { role: 'user', text: "Made-up test. I liked fixing my cousin's bike last weekend." },
    { role: 'model', text: 'What part of fixing it stayed with you?' },
    { role: 'user', text: "I'd rather not get into that. Can we talk about something else?" },
  ],
  interpretation: [
    { role: 'user', text: "Made-up test. I spend hours rearranging furniture in my apartment. Does that mean I should be an interior designer? Just tell me what I'm meant to do." },
  ],
};

function validateMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return { error: 'messages must be a non-empty array.' };
  const turns = [];
  for (const item of raw) {
    const role = item?.role;
    const text = String(item?.text ?? '').trim();
    if (role !== 'user' && role !== 'model') return { error: 'Each message role must be "user" or "model".' };
    if (!text) return { error: 'Messages cannot be empty.' };
    if (text.length > MAX_TURN_CHARS) return { error: `A single message is too long (max ${MAX_TURN_CHARS} characters).` };
    turns.push({ role, text });
  }
  if (turns[turns.length - 1].role !== 'user') return { error: 'The last message must be from "user".' };
  return { turns };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Use POST.' });

    const session = await requireUser(req, { admin: true, signedOut: 'Sign in required.', unavailable: UNAVAILABLE });
    if (session.error) return sendJson(res, session.status, { error: session.error });

    const body = await readJson(req, MAX_BODY_BYTES);
    if (body.error) {
      const error = body.status === 413
        ? 'Request too large. Send the recent part of the conversation only.'
        : body.error;
      return sendJson(res, body.status, { error });
    }
    const payload = body.payload;

    const mode = String(payload.mode || 'health');
    if (!['health', 'fixture', 'chat'].includes(mode)) {
      return sendJson(res, 400, { error: 'mode must be health, fixture, or chat.' });
    }

    const key = apiKey();
    if (!key) return sendJson(res, 503, { ok: false, error: UNAVAILABLE });

    if (rateLimited('discovery', session.user.id, MAX_CALLS_PER_WINDOW, WINDOW_MS)) {
      return sendJson(res, 429, { error: 'Too many requests this hour. Try again later.' });
    }

    const model = modelId();
    const level = thinkingLevel();

    if (mode === 'health') {
      let available = false;
      let upstream = null;
      try {
        const check = await fetch(`${API_BASE}/models/${encodeURIComponent(model)}`, {
          headers: { 'x-goog-api-key': key },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        upstream = check.status;
        available = check.ok;
        await check.body?.cancel?.();
      } catch {
        logStatus('discoveryCompanion: health check error', 'network');
      }
      return sendJson(res, available ? 200 : 503, {
        ok: available,
        ...(available ? {} : { error: UNAVAILABLE }),
        mode,
        key_present: true,
        model,
        model_available: available,
        upstream_status: upstream,
        thinking_level: level,
      });
    }

    let turns;
    if (mode === 'fixture') {
      const name = String(payload.scenario || 'garden');
      if (!FIXTURES[name]) return sendJson(res, 400, { error: 'Unknown scenario.' });
      turns = FIXTURES[name];
    } else {
      const checked = validateMessages(payload.messages);
      if (checked.error) return sendJson(res, 400, { error: checked.error });
      turns = checked.turns;
    }

    const { window, omitted } = recentWindow(turns, CONTEXT_CHAR_BUDGET);
    let usedLevel = level;
    let response;
    try {
      const generated = await generateWithFallback(globalThis.fetch, {
        apiKey: key,
        model,
        systemInstruction: COMPANION_SYSTEM_INSTRUCTION,
        turns: window,
        thinkingLevel: level,
        temperature: 0.7,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      });
      response = generated.res;
      usedLevel = generated.thinkingLevel;
    } catch (error) {
      const aborted = error?.name === 'AbortError';
      logStatus('discoveryCompanion: request error', aborted ? 'timeout' : 'network');
      return sendJson(res, 504, { ok: false, error: aborted ? 'Gemini took too long to answer.' : UNAVAILABLE });
    }

    if (!response.ok) {
      const upstream = await readUpstream(response);
      logStatus('discoveryCompanion: Gemini error', upstream.status);
      const error = upstream.status === 429 ? 'Gemini quota or rate limit reached for this key.' : UNAVAILABLE;
      return sendJson(res, 502, {
        ok: false,
        error,
        upstream_status: upstream.status,
        google_status: upstream.googleStatus,
        model,
      });
    }

    const data = await response.json();
    const parsed = replyFrom(data);
    if (parsed.block) {
      return sendJson(res, 422, { ok: false, error: 'Gemini declined the input.', block_reason: parsed.block, model });
    }
    if (!parsed.reply) {
      return sendJson(res, 502, {
        ok: false,
        error: 'Gemini returned no text.',
        finish_reason: parsed.candidate?.finishReason || null,
        model,
      });
    }

    return sendJson(res, 200, {
      ok: true,
      mode,
      model: data?.modelVersion || model,
      thinking_level: usedLevel,
      finish_reason: parsed.candidate?.finishReason || null,
      reply: parsed.reply.slice(0, 4000),
      context: { turns_received: turns.length, turns_sent: window.length, turns_not_resent: omitted },
      usage: {
        prompt_tokens: data?.usageMetadata?.promptTokenCount ?? null,
        output_tokens: data?.usageMetadata?.candidatesTokenCount ?? null,
        thinking_tokens: data?.usageMetadata?.thoughtsTokenCount ?? null,
      },
    });
  } catch {
    logStatus('discoveryCompanion failed', 'unexpected');
    return sendJson(res, 500, { ok: false, error: 'Something went wrong.' });
  }
}
