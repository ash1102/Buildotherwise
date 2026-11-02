/**
 * answerFeedback: Gemini's feedback on one answer the signed-in person chose to send.
 * Ported from base44/functions/answerFeedback (same prompt, reply format, limits, and wording); the
 * provider changed from Anthropic to Gemini. No Anthropic key is needed.
 * Dependencies are passed in so the logic can be tested without a network.
 */
import { FEEDBACK_SYSTEM_PROMPT } from './prompts.js';
import { clean, cleanList, recentCount, json } from './http.js';
import { geminiKey, geminiModel, thinkingLevel, callGemini, extractReply, describeFailure, redact } from './gemini.js';

export const SOURCE_TYPES = new Set(['workbook_answer', 'discovery_record']);
export const MAX_PER_HOUR = 15;
export const MAX_OUTPUT_TOKENS = 2048; // room for thinking plus a ~170 word reply

export function parseReply(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function buildUserMessage({ sourceType, lessonTitle, sourceLabel, text }) {
  const kindLabel = sourceType === 'discovery_record' ? 'A Discovery Record entry' : 'A workbook answer';
  return [
    `${kindLabel}.`,
    lessonTitle ? `Step: ${lessonTitle}` : null,
    sourceLabel ? `Question or title: ${sourceLabel}` : null,
    '',
    '<answer>',
    text,
    '</answer>',
  ]
    .filter((line) => line !== null)
    .join('\n');
}

/**
 * @param {{ payload: object, auth: {user:object, client:object}|null, env: object, fetchImpl: Function }} deps
 */
export async function handleAnswerFeedback({ payload, auth, env, fetchImpl }) {
  try {
    if (!auth?.user) return json({ error: 'Sign in to get feedback.' }, 401);

    const apiKey = geminiKey(env);
    if (!apiKey) return json({ error: 'Feedback is not set up yet.' }, 503);

    const sourceType = clean(payload?.source_type, 40);
    const sourceKey = clean(payload?.source_key, 300);
    const sourceLabel = clean(payload?.source_label, 600);
    const lessonTitle = clean(payload?.lesson_title, 300);
    const text = clean(payload?.text, 6000);

    if (!SOURCE_TYPES.has(sourceType) || !sourceKey) {
      return json({ error: 'Something is missing. Try again from the answer.' }, 400);
    }
    if (text.length < 10) {
      return json({ error: 'Write a little more first. A sentence is enough.' }, 400);
    }

    // Keep usage reasonable: a few requests per person per hour. Row-level security means this
    // only ever sees the signed-in person's own records.
    try {
      const { data: recent } = await auth.client
        .from('answer_feedback')
        .select('created_date')
        .order('created_date', { ascending: false })
        .limit(MAX_PER_HOUR);
      if (recentCount(recent) >= MAX_PER_HOUR) {
        return json({ error: 'That’s a lot of feedback for one hour. Try again a little later.' }, 429);
      }
    } catch (error) {
      console.error('Feedback rate check failed', error?.message);
    }

    const model = geminiModel(env);
    let res;
    try {
      ({ res } = await callGemini({
        fetchImpl,
        apiKey,
        model,
        system: FEEDBACK_SYSTEM_PROMPT,
        turns: [{ role: 'user', text: buildUserMessage({ sourceType, lessonTitle, sourceLabel, text }) }],
        level: thinkingLevel(env),
        temperature: 0.5,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        json: true,
      }));
    } catch (error) {
      console.error('Gemini request error', error?.name === 'AbortError' ? 'timeout' : redact(error?.message));
      return json({ error: 'Feedback isn’t available right now. Your answer is unchanged.' }, 502);
    }

    if (!res.ok) {
      const { status, googleStatus } = await describeFailure(res);
      console.error('Gemini error', status, googleStatus);
      return json({ error: 'Feedback isn’t available right now. Your answer is unchanged.' }, 502);
    }

    const data = await res.json();
    const { reply: replyText } = extractReply(data);
    const parsed = parseReply(replyText);
    if (!parsed) {
      console.error('Unreadable feedback reply');
      return json({ error: 'Feedback came back unreadable. Try again.' }, 502);
    }

    const row = {
      source_type: sourceType,
      source_key: sourceKey,
      source_label: sourceLabel,
      lesson_title: lessonTitle,
      answer_snapshot: text,
      summary: clean(parsed.summary, 1200),
      observations: cleanList(parsed.observations, 3),
      questions: cleanList(parsed.questions, 2),
      model: data?.modelVersion || model,
      description: `Feedback: ${(sourceLabel || lessonTitle || 'answer').slice(0, 120)}`,
    };
    const { data: saved, error: saveError } = await auth.client.from('answer_feedback').insert(row).select().single();
    if (saveError) {
      console.error('Feedback save failed', saveError.code || saveError.message);
      return json({ error: 'Something went wrong. Your answer is unchanged.' }, 500);
    }
    return json({ ok: true, feedback: saved });
  } catch (error) {
    console.error('answerFeedback failed', error?.message);
    return json({ error: 'Something went wrong. Your answer is unchanged.' }, 500);
  }
}
