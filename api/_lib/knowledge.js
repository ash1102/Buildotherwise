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
