/**
 * journalReflection: the Conversation Journal's reflection partner, on Gemini.
 * Rebuilds the Base44 agent "conversation_journal_reflection" with its instructions unchanged, plus the
 * shared participant protections from the Discovery Companion and answer feedback.
 *
 * Participant controls, enforced here:
 *  - The function never reads the journal. It sees only the text the person sends (entries they chose to
 *    bring in are part of that message) and this conversation's earlier messages.
 *  - Nothing is saved anywhere except the person's own conversation row. Nothing goes to the Life Map
 *    or the journal. Replies are shown, not acted on.
 *  - If Gemini fails, nothing is saved and the person's text stays in their box.
 */
import { REFLECTION_AGENT_INSTRUCTIONS, REFLECTION_SHARED_PROTECTIONS } from './prompts.js';
import { json, HOUR_MS } from './http.js';
import { geminiKey, geminiModel, thinkingLevel, callGemini, extractReply, describeFailure, upstreamReason, redact, recentWindow } from './gemini.js';
import { programContext } from './knowledge.js';

export const MAX_MESSAGE_CHARS = 20_000; // a handful of entries plus a sentence
export const CONTEXT_CHAR_BUDGET = 24_000;
export const MAX_REPLIES_PER_HOUR = 20;
export const MAX_OUTPUT_TOKENS = 2048;
const COLUMNS = 'id, created_date, name, messages';

export function reflectionSystem(moduleSlug) {
  const background = programContext({ moduleSlug, brief: true });
  return [REFLECTION_AGENT_INSTRUCTIONS, REFLECTION_SHARED_PROTECTIONS, background].filter(Boolean).join('\n\n');
}

/** Stored messages -> Gemini turns. Stored roles are user / assistant; Gemini wants user / model. */
export function toTurns(messages) {
  return (messages || [])
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && String(m.content || '').trim())
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', text: String(m.content) }));
}

function shape(row) {
  return { id: row.id, created_date: row.created_date, metadata: { name: row.name }, messages: row.messages || [] };
}

export async function handleReflection({ payload, auth, env, fetchImpl, now = Date.now() }) {
  try {
    if (!auth?.user?.id) return json({ error: 'Sign in to use the reflection partner.' }, 401);
    const apiKey = geminiKey(env);
    if (!apiKey) return json({ error: 'The reflection partner isn’t set up yet.' }, 503);

    const conversationId = String(payload?.conversation_id || '').slice(0, 100);
    const content = String(payload?.content ?? '').trim();
    if (!conversationId) return json({ error: 'Something is missing. Try again.' }, 400);
    if (!content) return json({ error: 'Write a little first, or bring in an entry.' }, 400);
    if (content.length > MAX_MESSAGE_CHARS) return json({ error: 'That’s a lot to send at once. Bring in fewer entries, or send them in parts.' }, 413);

    // Row-level security means this only ever finds the signed-in person's own conversation.
    const { data: row, error: loadError } = await auth.client.from('reflection_conversation').select(COLUMNS).eq('id', conversationId).maybeSingle();
    if (loadError) {
      console.error('Reflection load failed', loadError.code || loadError.message);
      return json({ error: 'That conversation didn’t open. Try again in a moment.' }, 500);
    }
    if (!row) return json({ error: 'That conversation wasn’t found.' }, 404);

    // Keep usage reasonable: replies per person per hour, counted across their recent conversations.
    try {
      const cutoff = now - HOUR_MS;
      const { data: recent } = await auth.client
        .from('reflection_conversation')
        .select('messages')
        .gte('updated_date', new Date(cutoff).toISOString())
        .limit(20);
      const replies = (recent || []).flatMap((r) => r.messages || []).filter((m) => m.role === 'assistant' && m.created_date && new Date(m.created_date).getTime() > cutoff).length;
      if (replies >= MAX_REPLIES_PER_HOUR) return json({ error: 'That’s a lot of reflecting for one hour. Take a break and come back a little later.' }, 429);
    } catch (error) {
      console.error('Reflection rate check failed', error?.message);
    }

    const history = toTurns(row.messages);
    const turns = [...history, { role: 'user', text: content }];
    const { window, omitted } = recentWindow(turns, CONTEXT_CHAR_BUDGET);

    let res;
    try {
      ({ res } = await callGemini({
        fetchImpl, apiKey, model: geminiModel(env), system: reflectionSystem(payload?.module), turns: window,
        level: thinkingLevel(env), temperature: 0.6, maxOutputTokens: MAX_OUTPUT_TOKENS,
      }));
    } catch (error) {
      console.error('Reflection request error', error?.name === 'AbortError' ? 'timeout' : redact(error?.message));
      return json({ error: 'That didn’t send. Nothing was lost. Try again in a moment.' }, 504);
    }
    if (!res.ok) {
      const { status, googleStatus } = await describeFailure(res);
      console.error('Reflection Gemini error', status, googleStatus);
      return json({ error: 'That didn’t send. Nothing was lost. Try again in a moment.', detail: upstreamReason(status) }, 502);
    }
    const data = await res.json();
    if (data?.promptFeedback?.blockReason) {
      return json({ error: 'The reflection partner couldn’t respond to that one. Nothing was lost. You can rephrase, or skip it.' }, 422);
    }
    const { reply } = extractReply(data);
    if (!reply) return json({ error: 'That didn’t come back. Nothing was lost. Try again.' }, 502);

    const stamp = new Date(now).toISOString();
    const id = () => globalThis.crypto.randomUUID();
    const messages = [
      ...(row.messages || []),
      { id: id(), role: 'user', content, created_date: stamp },
      { id: id(), role: 'assistant', content: reply.slice(0, 8000), created_date: stamp },
    ];
    const { data: saved, error: saveError } = await auth.client.from('reflection_conversation').update({ messages }).eq('id', conversationId).select(COLUMNS).single();
    if (saveError) {
      console.error('Reflection save failed', saveError.code || saveError.message);
      return json({ error: 'That didn’t save. Nothing was lost. Try again in a moment.' }, 500);
    }
    return json({ ok: true, conversation: shape(saved), context: { turns_sent: window.length, turns_not_resent: omitted } });
  } catch (error) {
    console.error('journalReflection failed', redact(error?.message));
    return json({ error: 'Something went wrong. Nothing was lost.' }, 500);
  }
}
