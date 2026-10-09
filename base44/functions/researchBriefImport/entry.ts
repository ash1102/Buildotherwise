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

    const read = async (payload) => {
      const response = await base44.functions.invoke('notionSourceRead', payload);
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
      let cursor;
      const lines = [];
      for (let page = 0; page < 12; page += 1) {
        const result = await read({ action: 'blocks', id: objectId, cursor, kinds: BLOCK_KINDS });
        (result.blocks || []).forEach((block) => {
          const text = (block.text || '').trim();
          if (text) lines.push(`${prefixFor(block.type)}${text}`);
        });
        if (!result.has_more || !result.next_cursor) break;
        cursor = result.next_cursor;
      }
      return lines.join('\n');
    };

    const page = await base44.entities.LibraryResource.filter(
      { audience: 'program_team' },
      { sort: 'order', limit: 20 }
    );
    const library = page.items || [];
    const imported = [];

    for (const source of SOURCES) {
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
        review_status: reviewStatus,
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