/**
 * Feedback on one answer the signed-in person chose to send.
 * Same instructions as base44/functions/answerFeedback (previously Claude). Gemini writes the reply.
 * The answer is saved on their account as an AnswerFeedback row. It is not logged.
 */
import { FEEDBACK_SYSTEM_PROMPT } from '../server/feedbackPrompt.js';
import {
  apiKey,
  generateWithFallback,
  logStatus,
  modelId,
  replyFrom,
  thinkingLevel,
} from '../server/gemini.js';
import { readJson, sendJson } from '../server/http.js';
import { requireUser } from '../server/session.js';

const SOURCE_TYPES = new Set(['workbook_answer', 'discovery_record']);
const HOUR_MS = 60 * 60 * 1000;
const MAX_PER_HOUR = 15;
const MAX_BODY_BYTES = 20_000;
const UNAVAILABLE = 'Feedback isn’t available right now. Your answer is unchanged.';

function clean(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

function cleanList(value, maxItems) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => clean(item, 600)).filter(Boolean).slice(0, maxItems);
}

function parseReply(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Use POST' });

    const session = await requireUser(req, {
      signedOut: 'Sign in to get feedback.',
      unavailable: UNAVAILABLE,
    });
    if (session.error) return sendJson(res, session.status, { error: session.error });

    const key = apiKey();
    if (!key) return sendJson(res, 503, { error: UNAVAILABLE });

    const body = await readJson(req, MAX_BODY_BYTES);
    if (body.error) return sendJson(res, body.status, { error: body.status === 413 ? UNAVAILABLE : body.error });
    const payload = body.payload;

    const sourceType = clean(payload.source_type, 40);
    const sourceKey = clean(payload.source_key, 300);
    const sourceLabel = clean(payload.source_label, 600);
    const lessonTitle = clean(payload.lesson_title, 300);
    const text = clean(payload.text, 6000);

    if (!SOURCE_TYPES.has(sourceType) || !sourceKey) {
      return sendJson(res, 400, { error: 'Something is missing. Try again from the answer.' });
    }
    if (text.length < 10) {
      return sendJson(res, 400, { error: 'Write a little more first. A sentence is enough.' });
    }

    try {
      const { data: recent, error } = await session.client
        .from('answer_feedback')
        .select('created_date')
        .order('created_date', { ascending: false })
        .limit(MAX_PER_HOUR);
      if (error) {
        logStatus('answerFeedback rate check failed', 'query');
      } else {
        const cutoff = Date.now() - HOUR_MS;
        const count = (recent || []).filter(
          (row) => row?.created_date && new Date(row.created_date).getTime() > cutoff
        ).length;
        if (count >= MAX_PER_HOUR) {
          return sendJson(res, 429, { error: 'That’s a lot of feedback for one hour. Try again a little later.' });
        }
      }
    } catch {
      logStatus('answerFeedback rate check failed', 'network');
    }

    const model = modelId();
    const kindLabel = sourceType === 'discovery_record' ? 'A Discovery Record entry' : 'A workbook answer';
    const userMessage = [
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

    let response;
    try {
      const generated = await generateWithFallback(globalThis.fetch, {
        apiKey: key,
        model,
        systemInstruction: FEEDBACK_SYSTEM_PROMPT,
        turns: [{ role: 'user', text: userMessage }],
        thinkingLevel: thinkingLevel(),
        maxOutputTokens: 800,
        responseMimeType: 'application/json',
      });
      response = generated.res;
    } catch (error) {
      logStatus('answerFeedback: request error', error?.name === 'AbortError' ? 'timeout' : 'network');
      return sendJson(res, 504, { error: UNAVAILABLE });
    }

    if (!response.ok) {
      const upstream = response.status;
      try {
        await response.body?.cancel?.();
      } catch {
        /* ignore */
      }
      logStatus('answerFeedback: Gemini error', upstream);
      return sendJson(res, 502, { error: UNAVAILABLE });
    }

    const data = await response.json();
    const parsedReply = replyFrom(data);
    if (parsedReply.block || !parsedReply.reply) {
      logStatus('answerFeedback: empty reply', parsedReply.block || 'empty');
      return sendJson(res, 502, { error: UNAVAILABLE });
    }
    const parsed = parseReply(parsedReply.reply);
    if (!parsed) {
      logStatus('answerFeedback: unreadable reply', 'unreadable');
      return sendJson(res, 502, { error: 'Feedback came back unreadable. Try again.' });
    }

    const summary = clean(parsed.summary, 1200);
    const observations = cleanList(parsed.observations, 3);
    const questions = cleanList(parsed.questions, 2);
    const record = {
      source_type: sourceType,
      source_key: sourceKey,
      source_label: sourceLabel,
      lesson_title: lessonTitle,
      answer_snapshot: text,
      summary,
      observations,
      questions,
      model: data?.modelVersion || model,
      description: `Feedback: ${(sourceLabel || lessonTitle || 'answer').slice(0, 120)}`,
    };

    const { data: saved, error: saveError } = await session.client
      .from('answer_feedback')
      .insert(record)
      .select()
      .single();
    if (saveError || !saved) {
      logStatus('answerFeedback: save failed', saveError?.code || 'save');
      return sendJson(res, 500, { error: 'Something went wrong. Your answer is unchanged.' });
    }

    return sendJson(res, 200, { ok: true, feedback: saved });
  } catch {
    logStatus('answerFeedback failed', 'unexpected');
    return sendJson(res, 500, { error: 'Something went wrong. Your answer is unchanged.' });
  }
}
