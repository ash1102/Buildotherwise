/**
 * Journal reflection partner. Gemini follows the original Base44 agent's instructions.
 * It sees only the messages in this request. It does not read the journal, and it does not log them.
 */
import { JOURNAL_INSTRUCTIONS } from '../server/journalInstructions.js';
import {
  apiKey,
  generateWithFallback,
  logStatus,
  modelId,
  rateLimited,
  replyFrom,
  recentWindow,
  thinkingLevel,
} from '../server/gemini.js';
import { readJson, sendJson } from '../server/http.js';
import { requireUser } from '../server/session.js';

const MAX_BODY_BYTES = 120_000;
const MAX_TURN_CHARS = 12_000;
const CONTEXT_CHAR_BUDGET = 12_000;
const MAX_OUTPUT_TOKENS = 1024;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_CALLS_PER_WINDOW = 30;
const UNAVAILABLE = 'The reflection partner isn’t available right now.';

function validateMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return { error: 'Write a message first.' };
  const turns = [];
  for (const item of raw) {
    const role = item?.role === 'assistant' || item?.role === 'model' ? 'model' : item?.role;
    if (role !== 'user' && role !== 'model') return { error: 'Something was wrong with that message. Try again.' };
    const text = String(item?.content ?? item?.text ?? '').trim();
    if (!text) continue;
    if (text.length > MAX_TURN_CHARS) return { error: 'That message is too long. Send a shorter note.' };
    turns.push({ role, text });
  }
  if (!turns.length || turns[turns.length - 1].role !== 'user') return { error: 'Write a message first.' };
  return { turns };
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Use POST.' });

    const session = await requireUser(req, {
      signedOut: 'Sign in to use the reflection partner.',
      unavailable: UNAVAILABLE,
    });
    if (session.error) return sendJson(res, session.status, { error: session.error });

    const key = apiKey();
    if (!key) return sendJson(res, 503, { error: UNAVAILABLE });

    const body = await readJson(req, MAX_BODY_BYTES);
    if (body.error) {
      const error = body.status === 413 ? 'That note is too long to send. Try a shorter one.' : body.error;
      return sendJson(res, body.status, { error });
    }

    const checked = validateMessages(body.payload.messages);
    if (checked.error) return sendJson(res, 400, { error: checked.error });

    if (rateLimited('journal', session.user.id, MAX_CALLS_PER_WINDOW, WINDOW_MS)) {
      return sendJson(res, 429, { error: 'That’s a lot of reflection for one hour. Try again a little later.' });
    }

    const { window } = recentWindow(checked.turns, CONTEXT_CHAR_BUDGET);
    let response;
    try {
      const generated = await generateWithFallback(globalThis.fetch, {
        apiKey: key,
        model: modelId(),
        systemInstruction: JOURNAL_INSTRUCTIONS,
        turns: window,
        thinkingLevel: thinkingLevel(),
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      });
      response = generated.res;
    } catch (error) {
      logStatus('journalReflection: request error', error?.name === 'AbortError' ? 'timeout' : 'network');
      return sendJson(res, 504, { error: UNAVAILABLE });
    }

    if (!response.ok) {
      logStatus('journalReflection: Gemini error', response.status);
      try {
        await response.body?.cancel?.();
      } catch {
        /* ignore */
      }
      return sendJson(res, 502, { error: UNAVAILABLE });
    }

    const data = await response.json();
    const parsed = replyFrom(data);
    if (parsed.block || !parsed.reply) {
      logStatus('journalReflection: empty reply', parsed.block || 'empty');
      return sendJson(res, 502, { error: UNAVAILABLE });
    }

    return sendJson(res, 200, {
      ok: true,
      reply: parsed.reply.slice(0, 6000),
      model: data?.modelVersion || modelId(),
    });
  } catch {
    logStatus('journalReflection failed', 'unexpected');
    return sendJson(res, 500, { error: UNAVAILABLE });
  }
}
