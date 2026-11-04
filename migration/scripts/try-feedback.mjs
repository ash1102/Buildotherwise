/**
 * Fictional answer-feedback calls. Nothing is written to a database.
 *
 * Live (needs GEMINI_API_KEY, uses GEMINI_MODEL when set):
 *   node migration/scripts/try-feedback.mjs
 *
 * Dry run (no network, no key required). Prints the outgoing request and token estimates:
 *   node migration/scripts/try-feedback.mjs --dry-run
 *
 * Results are written next to this file as try-feedback.results.json (live)
 * or try-feedback.preview.json (dry run). The API key is never printed or saved.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleAnswerFeedback } from '../../api/_lib/feedback.js';
import { geminiModel } from '../../api/_lib/gemini.js';

const dryRun = process.argv.includes('--dry-run');
const here = path.dirname(fileURLToPath(import.meta.url));
const outFile = path.join(here, dryRun ? 'try-feedback.preview.json' : 'try-feedback.results.json');

const key = process.env.GEMINI_API_KEY || process.env.Gemini_key || '';
if (!dryRun && !key) {
  console.log('GEMINI_API_KEY is not set. No feedback was requested.');
  process.exit(0);
}

const env = {
  ...process.env,
  GEMINI_API_KEY: dryRun ? (key || 'dry-run-not-a-real-key') : key,
};

/** In-memory stand-in. It never opens Supabase. */
function stubAuth() {
  return {
    user: { id: 'fictional-user' },
    role: 'user',
    client: {
      from() {
        return {
          select() {
            const chain = { order: () => chain, limit: async () => ({ data: [] }) };
            return chain;
          },
          insert(row) {
            return { select: () => ({ single: async () => ({ data: { id: 'local-only', ...row }, error: null }) }) };
          },
        };
      },
    },
  };
}

const scenarios = [
  {
    id: 'o1-uncertain',
    lesson_code: 'O.1',
    prompt_id: '0',
    source_label: 'What do you want to be true about how you take part?',
    text: 'I do not know yet. I might leave after this page.',
  },
  {
    id: 'o4-support',
    lesson_code: 'O.4',
    prompt_id: '1',
    source_label: 'What would make taking part workable?',
    text: 'Shorter pages, and a way to skip a question without it counting against me. I am not looking for a job or a business here.',
  },
  {
    id: 'm1-uncertain',
    lesson_code: 'M1-L1',
    prompt_id: 'stood-out',
    source_label: 'What, if anything, stood out?',
    text: 'I keep walking past the library. I cannot tell if I am noticing the building, the quiet, or just the route home.',
  },
  {
    id: 'm2-negative',
    lesson_code: 'M2-L2',
    prompt_id: '1',
    source_label: 'What did you actually do, or not do?',
    text: 'I planned to ask the clerk one question about how the shop schedules repairs. I did not go. The bus was late and I was too tired. Nothing about the shop became clearer.',
  },
  {
    id: 'm3-short',
    lesson_code: 'M3-L2',
    prompt_id: '0',
    source_label: 'What will you try differently?',
    text: 'Same task, radio off. It was worse.',
  },
  {
    id: 'm4-long',
    lesson_code: 'M4-L1',
    prompt_id: '0',
    source_label: 'Briefly, what happened?',
    text: 'On Tuesday the class ran long and I left before the last exercise. I told myself that means I am bad at staying with hard things. What I can actually say is that the room was hot, I had not eaten, and I left. I do not know yet whether I would have stayed on a cooler day. A friend said I always quit. That is their sentence, not something I checked. I am not deciding what this means for work or school.',
  },
  {
    id: 'm5-business-idea',
    lesson_code: 'M5-L1',
    prompt_id: 'stands-out',
    source_label: 'What stood out in the sequence?',
    text: 'I noticed I slow down when I am fixing a loose chair rung. For a minute I wondered if that could be a small repair business. The part I can point to is that I liked fitting the piece. I am not deciding to sell anything.',
  },
  {
    id: 'm5-pause',
    lesson_code: 'M5-L3',
    prompt_id: 'next',
    source_label: 'What you chose to do next',
    text: 'I want to pause. I am not choosing a job, a class, or a business. I want to keep the note about the chair rung and leave the rest open.',
  },
  {
    id: 'm2-volunteer',
    lesson_code: 'M2-L1',
    prompt_id: '0',
    source_label: 'What are you exploring?',
    text: 'I want to spend one Saturday morning at the tool library, watching how they check tools in and out. I am not starting a project. I want to see if the checking-in part is what I like, or only the tools themselves. If I cannot get there, I will not count that as an answer about me.',
  },
];

function estimateTokens(text) {
  return Math.round(String(text || '').length / 4);
}

function redactRequest(url, body) {
  return {
    url: String(url || '').replace(/key=[^&\s"]+/gi, 'key=[redacted]'),
    body,
  };
}

function feedbackText(feedback) {
  if (!feedback) return '';
  const lines = [];
  if (feedback.summary) lines.push(feedback.summary);
  for (const item of feedback.observations || []) lines.push(`- ${item}`);
  for (const item of feedback.questions || []) lines.push(`? ${item}`);
  return lines.join('\n');
}

const results = [];
let totals = { promptTokenCount: 0, candidatesTokenCount: 0, thoughtsTokenCount: 0, totalTokenCount: 0, estimatedPromptTokens: 0 };

for (const scenario of scenarios) {
  let captured = null;
  let usage = null;
  const fetchImpl = async (url, init) => {
    const body = JSON.parse(init.body);
    captured = redactRequest(url, body);
    if (dryRun) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ candidates: [{ content: { parts: [{ text: '{"summary":"","observations":[],"questions":[]}' }] } }] }),
      };
    }
    const res = await fetch(url, init);
    const copy = res.clone();
    try {
      const data = await copy.json();
      usage = data?.usageMetadata || null;
    } catch {
      usage = null;
    }
    return res;
  };

  const response = await handleAnswerFeedback({
    payload: {
      source_type: 'workbook_answer',
      source_key: `${scenario.lesson_code}#${scenario.prompt_id}`,
      source_label: scenario.source_label,
      lesson_code: scenario.lesson_code,
      prompt_id: scenario.prompt_id,
      text: scenario.text,
    },
    auth: stubAuth(),
    env,
    fetchImpl,
  });
  const payload = await response.json();
  const system = captured?.body?.systemInstruction?.parts?.[0]?.text || '';
  const user = captured?.body?.contents?.[0]?.parts?.[0]?.text || '';
  const estimatedPromptTokens = estimateTokens(system) + estimateTokens(user);
  const row = {
    id: scenario.id,
    lesson_code: scenario.lesson_code,
    question: scenario.source_label,
    answer: scenario.text,
    dry_run: dryRun,
    status: response.status,
    error: payload.error || null,
    feedback: dryRun ? null : feedbackText(payload.feedback),
    usageMetadata: usage,
    estimatedPromptTokens,
    model: geminiModel(env),
    request: captured,
  };
  results.push(row);
  totals.estimatedPromptTokens += estimatedPromptTokens;
  if (usage) {
    for (const field of ['promptTokenCount', 'candidatesTokenCount', 'thoughtsTokenCount', 'totalTokenCount']) {
      totals[field] += Number(usage[field] || 0);
    }
  }

  console.log(`\n--- ${scenario.lesson_code} (${scenario.id}) ---`);
  console.log(`Question: ${scenario.source_label}`);
  console.log(`Answer: ${scenario.text}`);
  if (dryRun) {
    console.log(`Model: ${row.model}`);
    console.log(`Thinking: ${captured?.body?.generationConfig?.thinkingConfig?.thinkingLevel ?? '(omitted)'}`);
    console.log(`maxOutputTokens: ${captured?.body?.generationConfig?.maxOutputTokens}`);
    console.log(`Estimated input tokens: ${estimatedPromptTokens} (system ${estimateTokens(system)}, user ${estimateTokens(user)})`);
    console.log('Request body:');
    console.log(JSON.stringify(captured.body, null, 2));
  } else if (payload.error) {
    console.log(`Error ${response.status}: ${payload.error}`);
  } else {
    console.log('Feedback:');
    console.log(row.feedback);
    console.log('usageMetadata:', JSON.stringify(usage));
  }
}

console.log('\n=== Totals ===');
console.log(JSON.stringify(totals, null, 2));
fs.writeFileSync(outFile, JSON.stringify({ dry_run: dryRun, model: geminiModel(env), totals, scenarios: results }, null, 2) + '\n');
console.log(`Wrote ${outFile}`);
