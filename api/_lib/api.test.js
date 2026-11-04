import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FEEDBACK_SYSTEM_PROMPT, COMPANION_SYSTEM_INSTRUCTION, REFLECTION_AGENT_INSTRUCTIONS, REFLECTION_SHARED_PROTECTIONS } from './prompts.js';
import { handleAnswerFeedback, parseReply, buildUserMessage, feedbackThinkingLevel, MAX_PER_HOUR, MAX_OUTPUT_TOKENS } from './feedback.js';
import { feedbackContext, FEEDBACK_SLICE_MAX, getKnowledge } from './knowledge.js';
import { buildRequestBody } from './gemini.js';
import { handleSubmitInquiry, buildEmail, MAX_PER_EMAIL_PER_HOUR } from './inquiry.js';
import {
  handleCompanion, validateMessages, recentWindow, thinkingLevel, configuredModel,
  extractReply, resetRateLimit, CONTEXT_CHAR_BUDGET, MAX_CALLS_PER_WINDOW,
} from './companion.js';

const body = async (res) => ({ status: res.status, ...(await res.json()) });
const okJson = (data) => ({ ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) });

/* ---------- prompts match the Base44 originals ---------- */
test('prompts are copied verbatim from the Base44 functions', () => {
  const fb = fs.readFileSync('base44/functions/answerFeedback/entry.ts', 'utf8');
  const co = fs.readFileSync('base44/functions/discoveryCompanion/entry.ts', 'utf8');
  assert.ok(fb.includes(FEEDBACK_SYSTEM_PROMPT));
  assert.ok(co.includes(COMPANION_SYSTEM_INSTRUCTION));
  const agent = JSON.parse(fs.readFileSync('base44/agents/conversation_journal_reflection.jsonc', 'utf8')).instructions;
  assert.equal(REFLECTION_AGENT_INSTRUCTIONS, agent);
  assert.match(FEEDBACK_SYSTEM_PROMPT, /Do not treat entrepreneurship/);
  assert.match(FEEDBACK_SYSTEM_PROMPT, /One useful observation is better than three thin ones/);
  assert.match(FEEDBACK_SYSTEM_PROMPT, /USING THE LESSON/);
  assert.match(FEEDBACK_SYSTEM_PROMPT, /Zero or one optional question/);
  assert.doesNotMatch(FEEDBACK_SYSTEM_PROMPT, /Name what is already clear or specific/);
  assert.doesNotMatch(FEEDBACK_SYSTEM_PROMPT, /Use tentative language \("it may be"/);
  assert.match(REFLECTION_SHARED_PROTECTIONS, /No therapy, recovery, corporate, or motivational clichés\. No praise inflation\. No shame\./);
  assert.match(COMPANION_SYSTEM_INSTRUCTION, /not a crisis service/);
});

/* ---------- answerFeedback ---------- */
function fakeClient({ recent = [], insertResult } = {}) {
  const inserted = [];
  return {
    inserted,
    from: () => ({
      select: () => ({ order: () => ({ limit: async () => ({ data: recent }) }) }),
      insert: (row) => {
        inserted.push(row);
        return { select: () => ({ single: async () => insertResult || { data: { id: 'f1', ...row }, error: null } }) };
      },
    }),
  };
}
const goodPayload = { source_type: 'workbook_answer', source_key: 'm1:q1', text: 'I like fixing bikes with my cousin.' };
const geminiFeedback = { modelVersion: 'g-1', candidates: [{ content: { parts: [{ text: '{"summary":"S","observations":["a","b","c","d"],"questions":["q1","q2","q3"]}' }] } }] };

test('answerFeedback: requires sign-in and a key', async () => {
  assert.equal((await handleAnswerFeedback({ payload: goodPayload, auth: null, env: {}, fetchImpl: fetch })).status, 401);
  const auth = { user: { id: 'u' }, client: fakeClient() };
  assert.equal((await handleAnswerFeedback({ payload: goodPayload, auth, env: {}, fetchImpl: fetch })).status, 503);
});

test('answerFeedback: validates input', async () => {
  const auth = { user: { id: 'u' }, client: fakeClient() };
  const env = { GEMINI_API_KEY: 'k' };
  assert.equal((await handleAnswerFeedback({ payload: { ...goodPayload, source_type: 'x' }, auth, env, fetchImpl: fetch })).status, 400);
  assert.equal((await handleAnswerFeedback({ payload: { ...goodPayload, text: 'short' }, auth, env, fetchImpl: fetch })).status, 400);
});

test('answerFeedback: uses Gemini only, saves trimmed feedback, never returns the key', async () => {
  const client = fakeClient();
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({ url, init }); return okJson(geminiFeedback); };
  const res = await handleAnswerFeedback({ payload: goodPayload, auth: { user: { id: 'u' }, client }, env: { GEMINI_API_KEY: 'secret-k', GEMINI_MODEL: 'm' }, fetchImpl });
  const out = await body(res);
  assert.equal(out.status, 200);
  assert.equal(client.inserted[0].observations.length, 3);
  assert.equal(client.inserted[0].questions.length, 1);
  assert.ok(!JSON.stringify(out).includes('secret-k'));
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /generativelanguage\.googleapis\.com\/v1beta\/models\/m:generateContent/);
  assert.ok(!/anthropic/i.test(calls[0].url));
  assert.equal(calls[0].init.headers['x-goog-api-key'], 'secret-k');
  const sent = JSON.parse(calls[0].init.body);
  assert.equal(sent.systemInstruction.parts[0].text, FEEDBACK_SYSTEM_PROMPT);
  assert.equal(sent.generationConfig.responseMimeType, 'application/json');
  assert.match(sent.contents[0].parts[0].text, /<answer>\nI like fixing bikes/);
  assert.equal(client.inserted[0].model, 'g-1');
});

test('answerFeedback: hourly limit, provider failure, unreadable reply', async () => {
  const now = new Date().toISOString();
  const env = { GEMINI_API_KEY: 'k', GEMINI_MODEL: 'm' };
  const full = { user: { id: 'u' }, client: fakeClient({ recent: Array(MAX_PER_HOUR).fill({ created_date: now }) }) };
  assert.equal((await handleAnswerFeedback({ payload: goodPayload, auth: full, env, fetchImpl: fetch })).status, 429);
  const auth = { user: { id: 'u' }, client: fakeClient() };
  assert.equal((await handleAnswerFeedback({ payload: goodPayload, auth, env, fetchImpl: async () => ({ ok: false, status: 500, text: async () => '' }) })).status, 502);
  assert.equal((await handleAnswerFeedback({ payload: goodPayload, auth, env, fetchImpl: async () => okJson({ candidates: [{ content: { parts: [{ text: 'no json' }] } }] }) })).status, 502);
});

test('answerFeedback: an empty questions list is saved, and blank strings are dropped', async () => {
  const emptyClient = fakeClient();
  const emptyReply = { modelVersion: 'g-1', candidates: [{ content: { parts: [{ text: '{"summary":"S","observations":["A distinction in the answer."],"questions":[]}' }] } }] };
  const emptyRes = await handleAnswerFeedback({
    payload: goodPayload,
    auth: { user: { id: 'u' }, client: emptyClient },
    env: { GEMINI_API_KEY: 'k', GEMINI_MODEL: 'm' },
    fetchImpl: async () => okJson(emptyReply),
  });
  assert.equal(emptyRes.status, 200);
  assert.deepEqual(emptyClient.inserted[0].questions, []);

  const blankClient = fakeClient();
  const blankReply = { modelVersion: 'g-1', candidates: [{ content: { parts: [{ text: '{"summary":"S","observations":["One"],"questions":["","  ","Could the quiet be the part you noticed?"]}' }] } }] };
  await handleAnswerFeedback({
    payload: goodPayload,
    auth: { user: { id: 'u' }, client: blankClient },
    env: { GEMINI_API_KEY: 'k', GEMINI_MODEL: 'm' },
    fetchImpl: async () => okJson(blankReply),
  });
  assert.deepEqual(blankClient.inserted[0].questions, ['Could the quiet be the part you noticed?']);
});

test('answerFeedback helpers', () => {
  assert.equal(parseReply('x {"a":1} y').a, 1);
  assert.equal(parseReply('nothing'), null);
  assert.match(buildUserMessage({ sourceType: 'discovery_record', sourceLabel: 'L', text: 'T' }), /^A Discovery Record entry\./);
  assert.equal(feedbackThinkingLevel({}), 'minimal');
  assert.equal(feedbackThinkingLevel({ GEMINI_THINKING_LEVEL: 'off' }), null);
  assert.equal(feedbackThinkingLevel({ GEMINI_THINKING_LEVEL: 'high' }), 'high');
  assert.equal(MAX_OUTPUT_TOKENS, 600);
});

test('answerFeedback: unknown lesson stays generic', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push(JSON.parse(init.body)); return okJson(geminiFeedback); };
  const payload = { ...goodPayload, lesson_code: 'M9-L9', source_label: 'A question that is not in the program file' };
  const res = await handleAnswerFeedback({ payload, auth: { user: { id: 'u' }, client: fakeClient() }, env: { GEMINI_API_KEY: 'k' }, fetchImpl });
  assert.equal(res.status, 200);
  assert.equal(calls[0].systemInstruction.parts[0].text, FEEDBACK_SYSTEM_PROMPT);
  assert.match(calls[0].contents[0].parts[0].text, /Question: A question that is not in the program file/);
  assert.equal(calls[0].generationConfig.thinkingConfig.thinkingLevel, 'minimal');
  assert.equal(calls[0].generationConfig.maxOutputTokens, 600);
});

test('answerFeedback: lesson context for three modules uses the brief and one answer', async () => {
  const cases = [
    { lesson_code: 'M1-L1', prompt_id: 'stood-out', source_label: 'What, if anything, stood out?', text: 'I keep walking past the library and I am not sure the building is what I am noticing.' },
    { lesson_code: 'M3-L2', prompt_id: '0', source_label: 'What will you try differently?', text: 'I tried the same task with the radio off. It was worse, not better.' },
    { lesson_code: 'M5-L3', prompt_id: 'next', source_label: 'What you chose to do next', text: 'I want to pause. I do not want to start a business, and I am not picking a job today either.' },
  ];
  for (const item of cases) {
    const calls = [];
    const fetchImpl = async (_url, init) => { calls.push(JSON.parse(init.body)); return okJson(geminiFeedback); };
    const res = await handleAnswerFeedback({
      payload: { source_type: 'workbook_answer', source_key: `${item.lesson_code}#${item.prompt_id}`, ...item },
      auth: { user: { id: 'u' }, client: fakeClient() },
      env: { GEMINI_API_KEY: 'k', GEMINI_MODEL: 'gemini-3.5-flash-lite' },
      fetchImpl,
    });
    assert.equal(res.status, 200);
    const sent = calls[0];
    const system = sent.systemInstruction.parts[0].text;
    const user = sent.contents[0].parts[0].text;
    assert.ok(system.startsWith(FEEDBACK_SYSTEM_PROMPT));
    assert.match(system, /Build Otherwise is an emerging social-impact initiative founded by Ashley Christine Zeck\./);
    assert.doesNotMatch(system, /pending_approval|\bdraft\b/i);
    assert.doesNotMatch(system, /You stay in charge|Your week/);
    assert.ok(!user.includes('secret'));
    assert.match(user, new RegExp(`<answer>\\n${item.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    assert.equal((user.match(/<answer>/g) || []).length, 1);
    const background = system.slice(FEEDBACK_SYSTEM_PROMPT.length);
    assert.ok(background.length <= FEEDBACK_SLICE_MAX + 2);
    assert.equal(sent.generationConfig.maxOutputTokens, 600);
    assert.match(sent.contents[0].parts[0].text, /Question: /);
  }
  const m1 = feedbackContext({ lessonCode: 'M1-L1' });
  const m3 = feedbackContext({ lessonCode: 'M3-L2' });
  const m5 = feedbackContext({ lessonCode: 'M5-L3' });
  assert.match(m1, /Find Something Worth Exploring/);
  assert.match(m1, /Notice what draws your attention/);
  assert.match(m3, /Test How I Operate/);
  assert.match(m5, /Tuning Your Instrument/);
  assert.match(m5, /Check an impression and take stock/);
  assert.doesNotMatch(m1, /Learn Through One Small Try/);
  assert.doesNotMatch(m5, /Test How I Operate/);
  const brief = getKnowledge().program.program_brief.text;
  assert.ok(m1.includes('## 1. Understand Build Otherwise'));
  assert.ok(brief.includes(m1.split('\n').find((line) => line.startsWith('Build Otherwise is an emerging'))));
});

/* ---------- submitInquiry ---------- */
function fakeDb({ same = [], latest = [], insertError = null } = {}) {
  const log = { inserted: [], updated: [] };
  let selects = 0;
  return {
    log,
    from: () => ({
      select: () => {
        const result = () => ({ data: selects++ === 0 ? same : latest });
        const chain = { eq: () => chain, order: () => chain, limit: async () => result() };
        return chain;
      },
      insert: (row) => { log.inserted.push(row); return { select: () => ({ single: async () => ({ data: { id: 'i1' }, error: insertError }) }) }; },
      update: (row) => { log.updated.push(row); return { eq: async () => ({}) }; },
    }),
  };
}
const inq = { reaching_out_as: 'volunteer', name: 'Pat', email: 'pat@example.com', message: 'Hello', interests: ['a'] };

test('submitInquiry: honeypot, validation, and missing database', async () => {
  assert.deepEqual(await body(await handleSubmitInquiry({ payload: { ...inq, website: 'x' }, db: null, env: {}, fetchImpl: fetch })), { status: 200, ok: true, emailed: false });
  assert.equal((await handleSubmitInquiry({ payload: { ...inq, reaching_out_as: 'zzz' }, db: fakeDb(), env: {}, fetchImpl: fetch })).status, 400);
  assert.equal((await handleSubmitInquiry({ payload: { ...inq, email: 'nope' }, db: fakeDb(), env: {}, fetchImpl: fetch })).status, 400);
  assert.equal((await handleSubmitInquiry({ payload: inq, db: null, env: {}, fetchImpl: fetch })).status, 503);
});

test('submitInquiry: saves without email when no Resend key; emails when set', async () => {
  const db = fakeDb();
  assert.deepEqual(await body(await handleSubmitInquiry({ payload: inq, db, env: {}, fetchImpl: fetch })), { status: 200, ok: true, emailed: false });
  assert.equal(db.log.inserted.length, 1);
  const db2 = fakeDb();
  let sent;
  const fetchImpl = async (url, init) => { sent = { url, init }; return { ok: true, status: 200 }; };
  const out = await body(await handleSubmitInquiry({ payload: inq, db: db2, env: { RESEND_API_KEY: 'r' }, fetchImpl }));
  assert.equal(out.emailed, true);
  assert.equal(db2.log.updated[0].email_notified, true);
  assert.equal(JSON.parse(sent.init.body).to[0], 'Start@buildotherwise.org');
});

test('submitInquiry: per-address limit saves nothing more; email subject has no line breaks', async () => {
  const now = new Date().toISOString();
  const db = fakeDb({ same: Array(MAX_PER_EMAIL_PER_HOUR).fill({ created_date: now }) });
  const out = await body(await handleSubmitInquiry({ payload: inq, db, env: {}, fetchImpl: fetch }));
  assert.equal(out.ok, true);
  assert.equal(db.log.inserted.length, 0);
  const mail = buildEmail({ reachingOutAs: 'partner', name: 'A\r\nBcc: x', email: 'a@b.co', organization: '', interests: [], message: 'm' });
  assert.ok(!/[\r\n]/.test(mail.subject));
});

/* ---------- discoveryCompanion ---------- */
const admin = { user: { id: 'a1' }, role: 'admin' };
const geminiOk = { modelVersion: 'g', candidates: [{ content: { parts: [{ text: 'hi', thought: false }, { text: 'hidden', thought: true }] }, finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 5 } };

test('companion: sign-in and admin only', async () => {
  resetRateLimit();
  assert.equal((await handleCompanion({ rawBody: '{}', auth: null, env: {}, fetchImpl: fetch })).status, 401);
  assert.equal((await handleCompanion({ rawBody: '{}', auth: { user: { id: 'u' }, role: 'user' }, env: {}, fetchImpl: fetch })).status, 403);
});

test('companion: input checks', async () => {
  resetRateLimit();
  const env = { GEMINI_API_KEY: 'g' };
  const run = (b) => handleCompanion({ rawBody: typeof b === 'string' ? b : JSON.stringify(b), auth: admin, env, fetchImpl: fetch });
  assert.equal((await run('{bad')).status, 400);
  assert.equal((await run({ mode: 'nope' })).status, 400);
  assert.equal((await run({ mode: 'fixture', scenario: 'toString' })).status, 400);
  assert.equal((await run({ mode: 'chat', messages: [{ role: 'model', text: 'x' }] })).status, 400);
  assert.equal((await handleCompanion({ rawBody: '{}', auth: admin, env: {}, fetchImpl: fetch })).status, 503);
  assert.equal((await run('x'.repeat(130000))).status, 413);
});

test('companion: fixture reply hides thoughts, sends the system instruction, accepts old key name', async () => {
  resetRateLimit();
  let sent;
  const fetchImpl = async (url, init) => { sent = JSON.parse(init.body); assert.ok(url.includes('gemini-3.5-flash-lite')); assert.equal(init.headers['x-goog-api-key'], 'old'); return okJson(geminiOk); };
  const out = await body(await handleCompanion({ rawBody: JSON.stringify({ mode: 'fixture', scenario: 'pass' }), auth: admin, env: { Gemini_key: 'old' }, fetchImpl }));
  assert.equal(out.reply, 'hi');
  assert.ok(sent.systemInstruction.parts[0].text.startsWith(COMPANION_SYSTEM_INSTRUCTION));
  assert.match(sent.systemInstruction.parts[0].text, /PROGRAM REFERENCE/);
  assert.ok(!JSON.stringify(out).includes('old'));
});

test('companion: retries without thinking on 400, reports upstream status only', async () => {
  resetRateLimit();
  let n = 0;
  const fetchImpl = async (url, init) => {
    n++;
    const cfg = JSON.parse(init.body).generationConfig;
    if (cfg.thinkingConfig) return { ok: false, status: 400, text: async () => '{}', body: { cancel: async () => {} } };
    return okJson(geminiOk);
  };
  const out = await body(await handleCompanion({ rawBody: '{"mode":"fixture"}', auth: admin, env: { GEMINI_API_KEY: 'g' }, fetchImpl }));
  assert.equal(out.status, 200); assert.equal(n, 2); assert.equal(out.thinking_level, null);
  const bad = await body(await handleCompanion({ rawBody: '{"mode":"fixture"}', auth: admin, env: { GEMINI_API_KEY: 'g', GEMINI_THINKING_LEVEL: 'off' }, fetchImpl: async () => ({ ok: false, status: 429, text: async () => '{"error":{"status":"RESOURCE_EXHAUSTED","message":"secret echo"}}' }) }));
  assert.equal(bad.status, 502); assert.equal(bad.google_status, 'RESOURCE_EXHAUSTED'); assert.ok(!JSON.stringify(bad).includes('secret echo'));
});

test('companion: rate limit per admin', async () => {
  resetRateLimit();
  const env = { GEMINI_API_KEY: 'g' };
  const fetchImpl = async () => okJson(geminiOk);
  let last;
  for (let i = 0; i <= MAX_CALLS_PER_WINDOW; i++) last = await handleCompanion({ rawBody: '{"mode":"fixture"}', auth: admin, env, fetchImpl });
  assert.equal(last.status, 429);
});

test('companion helpers: window keeps newest turns and starts on a user turn', () => {
  const big = 'x'.repeat(4000);
  const turns = []; for (let i = 0; i < 10; i++) turns.push({ role: i % 2 ? 'model' : 'user', text: big }); turns.push({ role: 'user', text: 'last' });
  const { window, omitted } = recentWindow(turns);
  assert.equal(window.at(-1).text, 'last'); assert.equal(window[0].role, 'user'); assert.ok(omitted > 0);
  assert.ok(window.reduce((s, t) => s + t.text.length, 0) <= CONTEXT_CHAR_BUDGET + 4000);
  assert.equal(validateMessages([{ role: 'user', text: 'hi' }]).turns.length, 1);
  assert.equal(thinkingLevel({}), 'low'); assert.equal(thinkingLevel({ GEMINI_THINKING_LEVEL: 'OFF' }), null); assert.equal(thinkingLevel({ GEMINI_THINKING_LEVEL: 'weird' }), 'low');
  assert.equal(configuredModel({ GEMINI_MODEL: 'models/foo' }), 'foo');
  assert.equal(buildRequestBody({ system: 's', turns: [{ role: 'user', text: 'a' }], level: null }).generationConfig.thinkingConfig, undefined);
  assert.equal(buildRequestBody({ system: 's', turns: [], level: 'low' }).generationConfig.thinkingConfig.thinkingLevel, 'low');
  assert.equal(extractReply({}).reply, '');
});
