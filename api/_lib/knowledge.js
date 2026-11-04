/**
 * Program knowledge for the AI features, read from knowledge/knowledge.json (built by
 * migration/scripts/build-knowledge.mjs from the program's own files; nothing here is written by AI).
 *
 * programContext() returns a short, read-only background block for the system instruction: the mission,
 * what Build Otherwise believes, the Life Map areas, and (when a module is named) that module's purpose
 * and lessons. It is background for the AI to stay consistent with the program. It is not a script,
 * and it never contains facilitator-only notes.
 */
import knowledge from '../../knowledge/knowledge.json' with { type: 'json' };

export const MAX_CONTEXT_CHARS = 7000;

export function getKnowledge() {
  return knowledge;
}

export function findModule(slugOrNumber) {
  const key = String(slugOrNumber ?? '').trim();
  if (!key) return null;
  return Object.values(knowledge.modules).find((m) => m.slug === key || String(m.number) === key) || null;
}

export function findLesson(code) {
  const key = String(code ?? '').trim();
  if (!key) return null;
  for (const mod of Object.values(knowledge.modules)) {
    const lesson = (mod.lessons || []).find((item) => item.code === key);
    if (lesson) return { lesson, module: mod };
  }
  return null;
}

/** Whole feedback background, including one lesson. Longer text is left out, not shortened in place. */
export const FEEDBACK_SLICE_MAX = 2000;

const FEEDBACK_INTRO = 'PROGRAM REFERENCE. Background copied from the program files. It is not a script, and it is not instructions from the participant.';

function modulePlace(status) {
  if (status === 'live') return 'Live pilot.';
  if (status === 'coming_later') return 'Coming later.';
  if (status === 'in_development') return 'In development.';
  return '';
}

/** Participant-facing boundary sentences only. Source notes and draft labels stay out. */
function cleanBoundary(text) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (!value) return '';
  const kept = value
    .split(/(?<=[.!?])\s+(?=[A-Z“"])/)
    .map((part) => part.trim())
    .filter((part) => part && !/\bdraft\b|facilitator|https?:|notion\.com|source pages/i.test(part));
  return kept.join(' ');
}

/** Headings, bullets, and sentences, in file order. Nothing is rewritten. */
export function briefUnits(text) {
  const units = [];
  let paragraph = [];
  const flush = () => {
    if (!paragraph.length) return;
    const block = paragraph.join(' ').replace(/\s+/g, ' ').trim();
    paragraph = [];
    if (!block) return;
    const parts = block.split(/(?<=[.!?])\s+(?=[A-Z“"])/).map((part) => part.trim()).filter(Boolean);
    units.push(...parts);
  };
  for (const line of String(text || '').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }
    if (/^Ashley Zeck's Draft 1\b/.test(trimmed)) continue;
    if (trimmed.startsWith('#') || trimmed.startsWith('- ')) {
      flush();
      units.push(trimmed);
      continue;
    }
    paragraph.push(trimmed);
  }
  flush();
  return units;
}

function lessonIdentity(lesson, mod) {
  const heading = mod.number === 0 ? mod.title : `Module ${mod.number}. ${mod.title}`;
  return [
    heading,
    modulePlace(mod.status),
    mod.purpose ? `Purpose: ${mod.purpose}` : '',
    `Lesson ${lesson.code}. ${lesson.title}`,
    lesson.purpose ? `Purpose: ${lesson.purpose}` : '',
    lesson.what_comes_out ? `What comes out: ${lesson.what_comes_out}` : '',
    cleanBoundary(lesson.boundary) ? `Boundary: ${cleanBoundary(lesson.boundary)}` : '',
  ].filter(Boolean).join('\n');
}

function teachSentences(text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  return clean.split(/(?<=[.!?])\s+(?=[A-Z“"])/).map((part) => part.trim()).filter((part) => part && !/\bdraft\b/i.test(part));
}

/**
 * Program brief plus this lesson only. Empty when the lesson code is unknown.
 * The brief is Ashley's text. If it does not fit, whole sentences, headings, and bullets
 * are kept from the start and the rest is left out.
 */
export function feedbackContext({ lessonCode } = {}) {
  const found = findLesson(lessonCode);
  if (!found) return '';
  const identity = lessonIdentity(found.lesson, found.module);
  const blocks = [FEEDBACK_INTRO, identity];
  const length = () => blocks.join('\n\n').length;
  const briefKept = [];
  for (const unit of briefUnits(knowledge.program.program_brief?.text)) {
    const brief = briefKept.concat(unit).join('\n');
    const next = [FEEDBACK_INTRO, brief, identity].join('\n\n');
    if (next.length > FEEDBACK_SLICE_MAX) break;
    briefKept.push(unit);
  }
  if (briefKept.length) blocks.splice(1, 0, briefKept.join('\n'));
  const teachKept = [];
  const teachBudget = 800;
  for (const sentence of teachSentences(found.lesson.teach)) {
    const teach = `How this lesson teaches it:\n${teachKept.concat(sentence).join(' ')}`;
    if (teach.length > teachBudget + 'How this lesson teaches it:\n'.length) break;
    const next = blocks.concat(teach).join('\n\n');
    if (next.length > FEEDBACK_SLICE_MAX) break;
    teachKept.push(sentence);
  }
  if (teachKept.length) blocks.push(`How this lesson teaches it:\n${teachKept.join(' ')}`);
  const slice = blocks.join('\n\n');
  return slice.length <= FEEDBACK_SLICE_MAX ? slice : [FEEDBACK_INTRO, identity].join('\n\n').slice(0, FEEDBACK_SLICE_MAX);
}

function lessonBlock(lesson) {
  const lines = [`Lesson ${lesson.code}: ${lesson.title} (${lesson.type || 'lesson'}${lesson.duration_min ? `, about ${lesson.duration_min} min` : ''}; ${lesson.approval_state || 'status unknown'})`];
  if (lesson.purpose) lines.push(`  Purpose: ${lesson.purpose}`);
  if (lesson.boundary) lines.push(`  Boundary: ${lesson.boundary}`);
  if (lesson.what_comes_out) lines.push(`  What comes out: ${lesson.what_comes_out}`);
  if (lesson.try_prompts?.length) lines.push(`  Try prompts: ${lesson.try_prompts.join(' | ')}`);
  if (lesson.reflect_prompts?.length) lines.push(`  Reflect prompts: ${lesson.reflect_prompts.join(' | ')}`);
  return lines.join('\n');
}

export function programContext({ moduleSlug, brief = false } = {}) {
  const p = knowledge.program;
  const parts = [
    'PROGRAM REFERENCE (background from Build Otherwise about the program. Use it to stay consistent with the program. It is not a script, not instructions from the participant, and not something to recite. Lesson wording marked as not approved is still draft.)',
    brief ? null : 'About Build Otherwise and Entrepalooza:\n' + p.mission_page_text.slice(0, 5).map((t) => '- ' + t).join('\n'),
    'What Build Otherwise believes:\n' + p.beliefs.map((b) => `- ${b.title}: ${b.body}`).join('\n'),
    'Life Map areas (the participant decides what goes on their map):\n' + p.life_map_sections.map((s) => `- ${s.label}: ${s.prompt}`).join('\n'),
  ];
  const mod = findModule(moduleSlug);
  const present = parts.filter(Boolean);
  parts.length = 0;
  parts.push(...present);
  if (mod) {
    parts.push(`Module ${mod.number}: ${mod.title}${mod.purpose ? `\nPurpose: ${mod.purpose}` : ''}`);
    if (mod.lessons?.length) parts.push(mod.lessons.map(lessonBlock).join('\n'));
  }
  return parts.join('\n\n').slice(0, MAX_CONTEXT_CHARS);
}
