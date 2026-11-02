import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { REFLECTION_AGENT_INSTRUCTIONS, REFLECTION_SHARED_PROTECTIONS } from './prompts.js';
import { handleReflection, reflectionSystem, toTurns, MAX_REPLIES_PER_HOUR, MAX_MESSAGE_CHARS } from './reflection.js';
import { programContext, getKnowledge, findModule, MAX_CONTEXT_CHARS } from './knowledge.js';

const okJson = (data) => ({ ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) });
const gemini = (text) => okJson({ candidates: [{ content: { parts: [{ text }] } }] });
const env = { GEMINI_API_KEY: 'k', GEMINI_MODEL: 'm' };
const NOW = Date.parse('2026-11-02T12:00:00Z');

/** A tiny stand-in for the signed-in person's Supabase client and their one conversation row. */
function fakeClient({ row, recent = [], saveError = null } = {}) {
  const state = { row, saved: null, queries: [] };
  return {
    state,
    from: (table) => {
      state.queries.push(table);
      return {
        select: (cols) => {
          const chain = {
            eq: () => chain,
            gte: () => chain,
            limit: async () => ({ data: recent }),
            maybeSingle: async () => ({ data: state.row }),
          };
          return chain;
        },
        update: (patch) => ({
          eq: () => ({ select: () => ({ single: async () => {
            if (saveError) return { data: null, error: saveError };
            state.saved = patch; return { data: { ...state.row, ...patch }, error: null };
          } }) }),
        }),
      };
    },
  };
}
const fakeRow = (messages = []) => ({ id: 'c1', created_date: '2026-11-02T10:00:00Z', name: 'Reflection', messages });
const user = { id: 'u1' };

test('reflection: instructions are the agent’s own, plus shared protections', () => {
  const system = reflectionSystem();
  assert.ok(system.startsWith(REFLECTION_AGENT_INSTRUCTIONS));
  assert.ok(system.includes(REFLECTION_SHARED_PROTECTIONS));
  assert.match(system, /not a crisis service/);
  assert.match(system, /Do not suggest saving anything or adding anything to their Life Map/);
  assert.match(system, /There is no facilitator, reviewer, or program-team mode/);
});

test('reflection: sign-in, key, and input checks', async () => {
  const base = { payload: { conversation_id: 'c1', content: 'hello' }, env, fetchImpl: fetch, now: NOW };
  assert.equal((await handleReflection({ ...base, auth: null })).status, 401);
  const auth = { user, client: fakeClient({ row: fakeRow() }) };
  assert.equal((await handleReflection({ ...base, auth, env: {} })).status, 503);
  assert.equal((await handleReflection({ ...base, auth, payload: { content: 'x' } })).status, 400);
  assert.equal((await handleReflection({ ...base, auth, payload: { conversation_id: 'c1', content: '   ' } })).status, 400);
  assert.equal((await handleReflection({ ...base, auth, payload: { conversation_id: 'c1', content: 'x'.repeat(MAX_MESSAGE_CHARS + 1) } })).status, 413);
  const missing = { user, client: fakeClient({ row: null }) };
  assert.equal((await handleReflection({ ...base, auth: missing })).status, 404);
});

test('reflection: replies, saves only to the person’s own conversation, never touches journal or Life Map tables', async () => {
  const client = fakeClient({ row: fakeRow([{ id: 'a', role: 'user', content: 'earlier', created_date: '2026-11-02T10:01:00Z' }, { id: 'b', role: 'assistant', content: 'earlier reply', created_date: '2026-11-02T10:01:01Z' }]) });
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({ url, body: JSON.parse(init.body) }); return gemini('What you described: a fictional test.'); };
  const out = await handleReflection({ payload: { conversation_id: 'c1', content: 'Entry e1 · 2026-10-30\nMade-up test entry.\n\nPlease reflect on these.' }, auth: { user, client }, env, fetchImpl, now: NOW });
  const body = await out.json();
  assert.equal(out.status, 200);
  assert.equal(body.conversation.messages.length, 4);
  assert.equal(body.conversation.messages.at(-1).role, 'assistant');
  assert.deepEqual([...new Set(client.state.queries)], ['reflection_conversation']);
  const turns = calls[0].body.contents;
  assert.deepEqual(turns.map((t) => t.role), ['user', 'model', 'user']);
  assert.match(turns.at(-1).parts[0].text, /Made-up test entry/);
  assert.ok(!JSON.stringify(body).includes('"k"'));
});

test('reflection: nothing is saved when Gemini fails or declines', async () => {
  for (const fetchImpl of [
    async () => ({ ok: false, status: 429, text: async () => '{"error":{"status":"RESOURCE_EXHAUSTED"}}' }),
    async () => okJson({ promptFeedback: { blockReason: 'SAFETY' } }),
    async () => okJson({ candidates: [] }),
  ]) {
    const client = fakeClient({ row: fakeRow() });
    const out = await handleReflection({ payload: { conversation_id: 'c1', content: 'made-up' }, auth: { user, client }, env, fetchImpl, now: NOW });
    assert.ok(out.status >= 422);
    assert.equal(client.state.saved, null);
    assert.match((await out.json()).error, /Nothing was lost/);
  }
});

test('reflection: hourly reply limit', async () => {
  const stamp = new Date(NOW - 60_000).toISOString();
  const recent = [{ messages: Array.from({ length: MAX_REPLIES_PER_HOUR }, () => ({ role: 'assistant', created_date: stamp })) }];
  const client = fakeClient({ row: fakeRow(), recent });
  const out = await handleReflection({ payload: { conversation_id: 'c1', content: 'made-up' }, auth: { user, client }, env, fetchImpl: async () => gemini('x'), now: NOW });
  assert.equal(out.status, 429);
});

test('reflection: the function never reads the journal', () => {
  const src = fs.readFileSync('api/_lib/reflection.js', 'utf8') + fs.readFileSync('api/journalReflection.js', 'utf8');
  assert.ok(!/user_store|userstore|discovery_record|learner_record|life_?map/i.test(src.replace(/Life Map/g, '').replace(/life map/gi, '')));
  assert.ok(!/\.from\('(?!reflection_conversation)/.test(src));
  assert.deepEqual(toTurns([{ role: 'system', content: 'x' }, { role: 'assistant', content: 'a' }, { role: 'user', content: '' }]), [{ role: 'model', text: 'a' }]);
});

/* ---------- curriculum knowledge ---------- */
test('knowledge: Module 1 is complete, copied from program content, and has no facilitator-only fields', () => {
  const k = getKnowledge();
  const lessons = JSON.parse(fs.readFileSync('migration/content/Lesson.json', 'utf8')).filter((l) => l.module_order === 1);
  const mod = findModule('find-something-worth-exploring');
  assert.equal(mod.number, 1);
  assert.equal(mod.lessons.length, lessons.length);
  for (const l of mod.lessons) {
    const source = lessons.find((x) => x.code === l.code);
    assert.equal(l.purpose, source.purpose);
    assert.equal(l.teach, source.teach);
    assert.deepEqual(l.try_prompts, source.try_prompts);
  }
  const text = JSON.stringify(k);
  assert.ok(!/internal_notes|approval_note|approved_source|full_text_uri/.test(text));
  for (const l of lessons) if (l.internal_notes) assert.ok(!text.includes(l.internal_notes.slice(0, 60)));
  assert.deepEqual(Object.values(k.modules).map((m) => m.number), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.ok(Object.values(k.modules).filter((m) => m.number <= 5).every((m) => m.lessons_included === true && m.lessons.length > 0));
  assert.ok(Object.values(k.modules).filter((m) => m.number >= 6).every((m) => m.lessons_included === false && !m.lessons));
  assert.equal(k.program.program_brief.header, "Ashley Zeck's Draft 1, 2026-11-02");
  assert.ok(k.program.program_brief.text.startsWith('## 1. Understand Build Otherwise'));
  assert.ok(k.program.program_brief.text.includes('These are educational influences, not claims that Entrepalooza is a validated psychological intervention.'));
});

test('knowledge: program background carries beliefs, Life Map areas, autonomy, and draft status', () => {
  const ctx = programContext({ moduleSlug: '1' });
  assert.match(ctx, /You stay in charge/);
  assert.match(ctx, /Building a business is a real option, not the default/);
  assert.match(ctx, /Your week/);
  assert.match(ctx, /the participant decides what goes on their map/);
  assert.match(ctx, /pending_approval/);
  assert.match(ctx, /Module 1: Find Something Worth Exploring/);
  assert.ok(ctx.length <= MAX_CONTEXT_CHARS);
  assert.ok(!programContext({ moduleSlug: 'nope' }).includes('Module 1'));
  assert.ok(!programContext({ brief: true }).includes('About Build Otherwise'));
});
