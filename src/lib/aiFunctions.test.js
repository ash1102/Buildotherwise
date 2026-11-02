import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, test } from 'node:test';
import answerFeedback from '../../api/answerFeedback.js';
import discoveryCompanion from '../../api/discoveryCompanion.js';
import journalReflection from '../../api/journalReflection.js';
import { COMPANION_SYSTEM_INSTRUCTION } from '../../server/companionPrompt.js';
import { FEEDBACK_SYSTEM_PROMPT } from '../../server/feedbackPrompt.js';
import { resetRateLimits } from '../../server/gemini.js';
import { JOURNAL_INSTRUCTIONS } from '../../server/journalInstructions.js';
import { createReflectionAgents } from '../api/reflectionAgent.js';

const SECRET = 'Made-up test. The pallet beds caught my eye and I do not want this logged.';

function mockRes() {
  return {
    statusCode: 0,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function geminiResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function installFetch({ role = 'admin', gemini } = {}) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    const target = String(url);
    const method = init?.method || 'GET';
    calls.push({ url: target, method, init });
    if (target.includes('/auth/v1/user')) {
      return new Response(JSON.stringify({ id: 'user-1' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (target.includes('/rest/v1/profiles')) {
      return new Response(JSON.stringify([{ role }]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (target.includes('/rest/v1/answer_feedback') && method === 'GET') {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (target.includes('/rest/v1/answer_feedback') && method === 'POST') {
      const sent = JSON.parse(init.body);
      return new Response(JSON.stringify({ id: 'fb1', created_date: '2026-11-02T12:00:00.000Z', ...sent }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (target.includes('generativelanguage.googleapis.com')) {
      return gemini(target, init);
    }
    return new Response('missing', { status: 404 });
  };
  return calls;
}

async function withServer(run) {
  const previous = {
    fetch: globalThis.fetch,
    error: console.error,
    env: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GEMINI_MODEL: process.env.GEMINI_MODEL,
      GEMINI_THINKING_LEVEL: process.env.GEMINI_THINKING_LEVEL,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    },
  };
  const logs = [];
  console.error = (...args) => logs.push(args.map((item) => String(item)).join(' '));
  process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = 'anon-test';
  process.env.GEMINI_THINKING_LEVEL = 'low';
  delete process.env.GEMINI_MODEL;
  resetRateLimits();
  try {
    await run(logs);
  } finally {
    globalThis.fetch = previous.fetch;
    console.error = previous.error;
    for (const [key, value] of Object.entries(previous.env)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    resetRateLimits();
  }
}

async function post(handler, body, token = 'jwt') {
  const res = mockRes();
  await handler(
    {
      method: 'POST',
      headers: token ? { authorization: `Bearer ${token}` } : {},
      body,
    },
    res
  );
  return res;
}

function geminiCalls(calls) {
  return calls.filter((call) => call.url.includes('generativelanguage.googleapis.com'));
}

function okGemini(text) {
  return () =>
    geminiResponse(200, {
      candidates: [
        {
          finishReason: 'STOP',
          content: { parts: [{ thought: true, text: 'hidden reasoning ' + SECRET }, { text }] },
        },
      ],
      modelVersion: 'gemini-3.8-flash',
      usageMetadata: { promptTokenCount: 4, candidatesTokenCount: 3 },
    });
}

test('prompts are the original companion, feedback, and journal instructions', () => {
  const companion = readFileSync('base44/functions/discoveryCompanion/entry.ts', 'utf8');
  const feedback = readFileSync('base44/functions/answerFeedback/entry.ts', 'utf8');
  const journal = JSON.parse(readFileSync('base44/agents/conversation_journal_reflection.jsonc', 'utf8'));
  assert.equal(COMPANION_SYSTEM_INSTRUCTION, companion.match(/const SYSTEM_INSTRUCTION = `([\s\S]*?)`;\n/)[1]);
  assert.equal(FEEDBACK_SYSTEM_PROMPT, feedback.match(/const SYSTEM_PROMPT = `([\s\S]*?)`;\n/)[1]);
  assert.equal(JOURNAL_INSTRUCTIONS, journal.instructions);
  assert.match(COMPANION_SYSTEM_INSTRUCTION, /No scores, ratings, or judgments/);
  assert.match(FEEDBACK_SYSTEM_PROMPT, /No scores, ratings, grades/);
  assert.match(JOURNAL_INSTRUCTIONS, /Do not diagnose/);
});

test('client code does not carry the Gemini key', () => {
  const client = ['src/api/supabaseCompat.js', 'src/api/reflectionAgent.js', 'src/api/base44Client.js']
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
  assert.doesNotMatch(client, /GEMINI_API_KEY|VITE_GEMINI|AIza/);
});

describe('vercel gemini functions', { concurrency: false }, () => {
test('discovery companion requires a signed-in admin', async () => {
  await withServer(async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    globalThis.fetch = async () => {
      throw new Error('should not be called');
    };
    const signedOut = await post(discoveryCompanion, { mode: 'chat', messages: [{ role: 'user', text: SECRET }] }, '');
    assert.equal(signedOut.statusCode, 401);
    assert.equal(signedOut.body.error, 'Sign in required.');

    const calls = installFetch({ role: 'user', gemini: () => { throw new Error('should not generate'); } });
    const forbidden = await post(discoveryCompanion, { mode: 'chat', messages: [{ role: 'user', text: SECRET }] });
    assert.equal(forbidden.statusCode, 403);
    assert.equal(geminiCalls(calls).length, 0);
  });
});

test('discovery companion answers with Gemini and hides thoughts', async () => {
  await withServer(async (logs) => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    const calls = installFetch({ role: 'admin', gemini: okGemini('You noticed the beds.') });
    const res = await post(discoveryCompanion, { mode: 'chat', messages: [{ role: 'user', text: SECRET }] });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.reply, 'You noticed the beds.');
    assert.doesNotMatch(res.body.reply, /hidden reasoning/);
    const [call] = geminiCalls(calls);
    assert.match(call.url, /\/v1beta\/models\/gemini-3\.8-flash:generateContent$/);
    assert.doesNotMatch(call.url, /test-gemini-key|key=/);
    assert.equal(call.init.headers['x-goog-api-key'], 'test-gemini-key');
    const sent = JSON.parse(call.init.body);
    assert.match(sent.systemInstruction.parts[0].text, /You are a discovery companion/);
    assert.equal(sent.contents.at(-1).parts[0].text, SECRET);
    assert.equal(logs.some((line) => line.includes(SECRET) || line.includes('hidden reasoning')), false);
  });
});

test('discovery companion says it is not available when the key is missing or rejected', async () => {
  await withServer(async (logs) => {
    delete process.env.GEMINI_API_KEY;
    const missingCalls = installFetch({ role: 'admin', gemini: () => { throw new Error('no'); } });
    const missing = await post(discoveryCompanion, { mode: 'chat', messages: [{ role: 'user', text: SECRET }] });
    assert.equal(missing.statusCode, 503);
    assert.match(missing.body.error, /isn’t available right now/);
    assert.equal(geminiCalls(missingCalls).length, 0);

    process.env.GEMINI_API_KEY = 'test-gemini-key';
    installFetch({
      role: 'admin',
      gemini: () => geminiResponse(403, { error: { status: 'PERMISSION_DENIED', message: SECRET } }),
    });
    const rejected = await post(discoveryCompanion, { mode: 'chat', messages: [{ role: 'user', text: SECRET }] });
    assert.equal(rejected.statusCode, 502);
    assert.match(rejected.body.error, /isn’t available right now/);
    assert.equal(JSON.stringify(rejected.body).includes(SECRET), false);
    assert.equal(logs.some((line) => line.includes(SECRET)), false);
  });
});

test('answer feedback requires sign-in, then saves a Gemini reply', async () => {
  await withServer(async (logs) => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    globalThis.fetch = async () => { throw new Error('should not be called'); };
    const signedOut = await post(answerFeedback, { source_type: 'workbook_answer', source_key: 'M1#1', text: SECRET }, '');
    assert.equal(signedOut.statusCode, 401);
    assert.equal(signedOut.body.error, 'Sign in to get feedback.');

    const reply = JSON.stringify({
      summary: 'You looked at the raised beds.',
      observations: ['You named the beds.'],
      questions: ['What did you look at first?'],
    });
    const calls = installFetch({ gemini: okGemini(reply) });
    const res = await post(answerFeedback, {
      source_type: 'workbook_answer',
      source_key: 'M1#1',
      source_label: 'What caught your eye?',
      lesson_title: 'Notice',
      text: SECRET,
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.feedback.summary, 'You looked at the raised beds.');
    assert.deepEqual(res.body.feedback.observations, ['You named the beds.']);
    const [call] = geminiCalls(calls);
    const sent = JSON.parse(call.init.body);
    assert.match(sent.systemInstruction.parts[0].text, /Return only a JSON object/);
    assert.match(sent.contents[0].parts[0].text, new RegExp(`<answer>\\n${SECRET}\\n</answer>`));
    const saved = calls.find((item) => item.url.includes('/answer_feedback') && item.method === 'POST');
    assert.equal(JSON.parse(saved.init.body).answer_snapshot, SECRET);
    assert.equal(logs.some((line) => line.includes(SECRET)), false);
  });
});

test('answer feedback is not available when the key is missing or rejected', async () => {
  await withServer(async (logs) => {
    delete process.env.GEMINI_API_KEY;
    const missingCalls = installFetch({ gemini: () => { throw new Error('no'); } });
    const missing = await post(answerFeedback, { source_type: 'workbook_answer', source_key: 'M1#1', text: SECRET });
    assert.equal(missing.statusCode, 503);
    assert.match(missing.body.error, /isn’t available right now/);
    assert.equal(geminiCalls(missingCalls).length, 0);

    process.env.GEMINI_API_KEY = 'test-gemini-key';
    installFetch({
      gemini: () => geminiResponse(400, { error: { status: 'INVALID_ARGUMENT', message: SECRET } }),
    });
    const rejected = await post(answerFeedback, { source_type: 'workbook_answer', source_key: 'M1#1', text: SECRET });
    assert.equal(rejected.statusCode, 502);
    assert.match(rejected.body.error, /isn’t available right now/);
    assert.equal(JSON.stringify(rejected.body).includes(SECRET), false);
    assert.equal(logs.some((line) => line.includes(SECRET)), false);
  });
});

test('journal reflection requires sign-in and returns the Gemini reply', async () => {
  await withServer(async (logs) => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    globalThis.fetch = async () => { throw new Error('should not be called'); };
    const signedOut = await post(journalReflection, { messages: [{ role: 'user', content: SECRET }] }, '');
    assert.equal(signedOut.statusCode, 401);

    const calls = installFetch({ gemini: okGemini('What you described: the beds.') });
    const res = await post(journalReflection, {
      messages: [
        { role: 'user', content: 'Earlier note.' },
        { role: 'assistant', content: 'A reflection.' },
        { role: 'user', content: SECRET },
      ],
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.reply, 'What you described: the beds.');
    const [call] = geminiCalls(calls);
    const sent = JSON.parse(call.init.body);
    assert.equal(sent.systemInstruction.parts[0].text, JOURNAL_INSTRUCTIONS);
    assert.deepEqual(
      sent.contents.map((turn) => turn.role),
      ['user', 'model', 'user']
    );
    assert.equal(sent.contents.at(-1).parts[0].text, SECRET);
    assert.equal(logs.some((line) => line.includes(SECRET)), false);
  });
});

test('journal reflection is not available when the key is missing or rejected', async () => {
  await withServer(async (logs) => {
    delete process.env.GEMINI_API_KEY;
    const missingCalls = installFetch({ gemini: () => { throw new Error('no'); } });
    const missing = await post(journalReflection, { messages: [{ role: 'user', content: SECRET }] });
    assert.equal(missing.statusCode, 503);
    assert.match(missing.body.error, /isn’t available right now/);
    assert.equal(geminiCalls(missingCalls).length, 0);

    process.env.GEMINI_API_KEY = 'test-gemini-key';
    installFetch({
      gemini: () => geminiResponse(403, { error: { message: SECRET } }),
    });
    const rejected = await post(journalReflection, { messages: [{ role: 'user', content: SECRET }] });
    assert.equal(rejected.statusCode, 502);
    assert.match(rejected.body.error, /isn’t available right now/);
    assert.equal(JSON.stringify(rejected.body).includes(SECRET), false);
    assert.equal(logs.some((line) => line.includes(SECRET)), false);
  });
});
});

function memoryStore() {
  const rows = [];
  return {
    rows,
    UserStore: {
      async filter(query) {
        return rows.filter((row) => row.store_key === query.store_key);
      },
      async create(data) {
        const row = { id: `row-${rows.length + 1}`, ...data };
        rows.push(row);
        return row;
      },
      async update(id, data) {
        const row = rows.find((item) => item.id === id);
        Object.assign(row, data);
        return row;
      },
    },
  };
}

test('the reflection partner stores a reply only after Gemini returns one', async () => {
  const store = memoryStore();
  let calls = 0;
  const agents = createReflectionAgents({
    entities: store,
    functions: {
      async invoke(name, payload) {
        calls += 1;
        assert.equal(name, 'journalReflection');
        assert.equal(payload.messages.at(-1).content, 'Hello from the journal');
        if (calls === 1) {
          const error = new Error("The reflection partner isn’t available right now.");
          error.status = 503;
          throw error;
        }
        return { data: { reply: 'What you described: a hello.' } };
      },
    },
    apiError(message, status = 400) {
      const error = new Error(message);
      error.status = status;
      return error;
    },
  });

  const created = await agents.createConversation({
    agent_name: 'conversation_journal_reflection',
    metadata: { name: 'Test' },
  });
  assert.equal(calls, 0);
  await assert.rejects(() => agents.addMessage(created, { role: 'user', content: 'Hello from the journal' }));
  assert.equal((await agents.getConversation(created.id)).messages.length, 0);

  const seen = [];
  agents.subscribeToConversation(created.id, (data) => seen.push(data.messages.length));
  const saved = await agents.addMessage(created, { role: 'user', content: 'Hello from the journal' });
  assert.equal(saved.messages[1].role, 'assistant');
  assert.equal(saved.messages[1].content, 'What you described: a hello.');
  assert.deepEqual(seen, [2]);
  const listed = await agents.listConversations({ q: { agent_name: 'conversation_journal_reflection' }, limit: 20 });
  assert.equal(listed[0].metadata.name, 'Test');
  assert.equal(listed[0].messages, undefined);
});
