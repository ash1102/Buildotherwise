// Builds knowledge/knowledge.json: the curriculum knowledge the AI features can draw on.
// Everything is COPIED from existing program files, never written or reworded here:
//   migration/content/{Module,Lesson}.json   modules and lessons (the program's own content)
//   src/pages/Mission.jsx                    mission, vision, beliefs 
//   src/lib/lifeMap.js, discoveryWays.js     Life Map areas and the four ways into a possibility
//   src/components/reflection/BoundariesNote.jsx   what the reflection partner will and won't do (ITEMS list)
// Facilitator-only fields (internal_notes, approval_note, approved_source, full_text_uri) are never copied.
// To add a module: node migration/scripts/build-knowledge.mjs 1 2   (module numbers whose lessons to include).
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const include = new Set((process.argv.slice(2).length ? process.argv.slice(2) : ['1']).map(Number));

/** Visible text of a JSX file, in order, with tags and code removed. */
function jsxText(file) {
  const out = [];
  for (const m of read(file).matchAll(/>([^<>{}]+)</g)) {
    const t = m[1].replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    if (t.length >= 20) out.push(t);
  }
  return out;
}

/** Evaluates `export const NAME = [...]` or `{...}` from one of our own source files. */
function literal(file, name) {
  const src = read(file);
  const start = src.indexOf(`export const ${name} =`);
  if (start < 0) throw new Error(`${name} not found in ${file}`);
  const from = src.indexOf('=', start) + 1;
  const open = src[src.indexOf(src.slice(from).trim()[0], from)];
  const close = open === '[' ? ']' : '}';
  let depth = 0, i = src.indexOf(open, from), end = -1;
  for (let j = i; j < src.length; j++) {
    if (src[j] === open) depth++;
    else if (src[j] === close && --depth === 0) { end = j; break; }
  }
  return new Function(`return (${src.slice(i, end + 1)})`)();
}
const constLiteral = (file, name) => {
  const src = read(file);
  const start = src.indexOf(`const ${name} = [`);
  if (start < 0) throw new Error(`${name} not found in ${file}`);
  let depth = 0, i = src.indexOf('[', start), end = -1;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '[') depth++;
    else if (src[j] === ']' && --depth === 0) { end = j; break; }
  }
  return new Function(`return (${src.slice(i, end + 1)})`)();
};

const modules = JSON.parse(read('migration/content/Module.json'));
const lessons = JSON.parse(read('migration/content/Lesson.json'));

const LESSON_FIELDS = ['code', 'title', 'order', 'type', 'duration_min', 'purpose', 'teach', 'boundary',
  'reflect_prompts', 'try_prompts', 'what_comes_out', 'carry_forward', 'routes', 'decision_options', 'approval_state', 'status'];
const pick = (obj, fields) => Object.fromEntries(fields.filter((f) => obj[f] !== undefined && obj[f] !== null && obj[f] !== '').map((f) => [f, obj[f]]));

const fiveModules = modules.filter((m) => m.order >= 1 && m.order <= 5).sort((a, b) => a.order - b.order);
const moduleEntries = {};
for (const m of fiveModules) {
  const entry = { number: m.order, ...pick(m, ['slug', 'title', 'purpose', 'description', 'status']) };
  if (include.has(m.order)) {
    entry.lessons = lessons.filter((l) => l.module_order === m.order).sort((a, b) => a.order - b.order).map((l) => pick(l, LESSON_FIELDS));
    entry.lessons_included = true;
  } else {
    entry.lessons_included = false; // title and purpose only until this module is added
  }
  moduleEntries[m.slug] = entry;
}

const knowledge = {
  version: 1,
  note: 'Copied from existing program files by migration/scripts/build-knowledge.mjs. Not written or reworded by AI. Lessons carry their approval_state: anything not "approved" is draft wording.',
  sources: {
    modules_and_lessons: 'migration/content/Module.json, Lesson.json',
    mission_and_beliefs: 'src/pages/Mission.jsx',
    life_map: 'src/lib/lifeMap.js (MAP_SECTIONS)',
    discovery_ways: 'src/lib/discoveryWays.js (WAY_KINDS, NEEDS; draft wording pending review)',
    reflection_boundaries: 'src/components/reflection/BoundariesNote.jsx',
  },
  program: {
    mission_page_text: jsxText('src/pages/Mission.jsx'),
    beliefs: constLiteral('src/pages/Mission.jsx', 'BELIEFS'),
    life_map_sections: literal('src/lib/lifeMap.js', 'MAP_SECTIONS'),
    discovery_ways: { kinds: literal('src/lib/discoveryWays.js', 'WAY_KINDS'), needs: literal('src/lib/discoveryWays.js', 'NEEDS') },
    reflection_boundaries: constLiteral('src/components/reflection/BoundariesNote.jsx', 'ITEMS'),
  },
  modules: moduleEntries,
};
fs.writeFileSync('knowledge/knowledge.json', JSON.stringify(knowledge, null, 2) + '\n');
const n = Object.values(moduleEntries).reduce((s, m) => s + (m.lessons?.length || 0), 0);
console.log(`knowledge.json: ${fiveModules.length} modules, ${n} lessons with detail, ${knowledge.program.mission_page_text.length} mission text blocks`);
