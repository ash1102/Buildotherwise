import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

/**
 * Imports the program's research briefs from Notion into private app storage.
 * The briefs are long documents, so they are stored as files and opened through
 * a signed link rather than kept in a record field.
 */
const SOURCES = [
  { needle: 'Research Brief', objectId: '3f1ca793-c2c5-8128-bf4a-dfd2247be2bf', mode: 'attachment' },
  { needle: 'Research Guide', objectId: '3f1ca793-c2c5-81bb-b9a8-c73c9d4c4e3f', mode: 'attachment' },
  { needle: 'Research Credibility Brief', objectId: '3efca793-c2c5-8182-b1a3-dffac91d89a8', mode: 'blocks' },
  { needle: 'Research Alignment', objectId: '1386a55e-ef21-43b3-baa4-d44c3157ad0b', mode: 'blocks' },
];

const BLOCK_KINDS = [
  'paragraph',
  'heading_1',
  'heading_2',
  'heading_3',
  'bulleted_list_item',
  'numbered_list_item',
  'quote',
  'callout',
  'toggle',
  'table_row',
];

function prefixFor(type) {
  if (type === 'heading_1') return '# ';
  if (type === 'heading_2') return '## ';
  if (type === 'heading_3') return '### ';
  if (type === 'bulleted_list_item') return '- ';
  if (type === 'numbered_list_item') return '1. ';
  if (type === 'quote') return '> ';
  return '';
}

/** The briefs state their own status; keep their words rather than inventing one. */
function statusOf(text) {
  const bold = text.match(/\*\*Status:\*\*\s*([^\n]{5,300})/i);
  if (bold) return bold[1].trim();
  const line = text.split('\n').find((item) => /status:/i.test(item) && item.trim().length > 12);
  return line ? line.replace(/^[#\-*\s>]+/, '').trim().slice(0, 300) : '';
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const payload = await req.json().catch(() => ({}));
    /** Only the sources named in `only` are imported; everything else is left as it stands. */
    const only = Array.isArray(payload.only) ? payload.only : null;

    const read = async (request) => {
      const response = await base44.functions.invoke('notionSourceRead', request);
      return response.data;
    };

    const attachmentText = async (objectId) => {
      const first = await read({ action: 'attachment', id: objectId, start: 0 });
      let text = first.text || '';
      const total = first.length || text.length;
      let guard = 0;
      while (text.length < total && guard < 12) {
        guard += 1;
        const next = await read({ action: 'attachment', id: objectId, start: text.length });
        if (!next.text) break;
        text += next.text;
      }
      return text;
    };

    const blocksText = async (objectId) => {
      const lines = [];
      let reads = 0;
      /** Toggles, columns and callouts keep their text one level deeper, so the walk follows them down. */
      const walk = async (blockId, depth) => {
        if (depth > 4 || reads > 40) return;
        let cursor;
        for (let page = 0; page < 12; page += 1) {
          reads += 1;
          const result = await read({ action: 'blocks', id: blockId, cursor });
          const blocks = result.blocks || [];
          blocks.forEach((block) => {
            const text = (block.text || '').trim();
            if (text && BLOCK_KINDS.includes(block.type)) lines.push(`${prefixFor(block.type)}${text}`);
          });
          for (const block of blocks) {
            if (block.type === 'child_page' || block.type === 'child_database') continue;
            if (block.has_children) await walk(block.id, depth + 1);
          }
          if (!result.has_more || !result.next_cursor) break;
          cursor = result.next_cursor;
        }
      };
      await walk(objectId, 0);
      return lines.join('\n');
    };

    const page = await base44.entities.LibraryResource.filter(
      { audience: 'program_team' },
      { sort: 'order', limit: 20 }
    );
    const library = page.items || [];
    const imported = [];

    for (const source of SOURCES) {
      if (only && !only.includes(source.needle)) continue;
      const record = library.find((item) => (item.title || '').includes(source.needle));
      if (!record) {
        imported.push({ source: source.needle, status: 'no matching library record' });
        continue;
      }

      const text = source.mode === 'attachment' ? await attachmentText(source.objectId) : await blocksText(source.objectId);
      if (!text) {
        imported.push({ title: record.title, status: 'the source returned no text' });
        continue;
      }

      const fileName = `${record.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.md`;
      const uploaded = await base44.asServiceRole.integrations.Core.UploadPrivateFile({
        file: new File([text], fileName, { type: 'text/markdown' }),
      });

      const reviewStatus = statusOf(text);
      const updated = await base44.entities.LibraryResource.update(record.id, {
        full_text_uri: uploaded.file_uri,
        // A re-import never blanks a status the source already stated once.
        ...(reviewStatus ? { review_status: reviewStatus } : {}),
      });

      imported.push({
        title: updated.title,
        chars: text.length,
        file_uri: uploaded.file_uri,
        review_status: reviewStatus,
      });
    }

    return Response.json({ imported });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}