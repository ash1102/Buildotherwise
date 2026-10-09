import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const NOTION = 'https://api.notion.com/v1';
const NOTION_VERSION = '2025-09-03';

function plainText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((item) => (item && item.plain_text) || '').join('');
  return value.plain_text || '';
}

function titleOf(record) {
  const properties = record.properties || {};
  for (const key of Object.keys(properties)) {
    const property = properties[key];
    if (property && property.type === 'title') return plainText(property.title);
  }
  if (record.title) return plainText(record.title);
  return '(untitled)';
}

/** Turns a row's properties into plain values so the curriculum can be read as text. */
function flattenProperties(properties) {
  const out = {};
  Object.keys(properties || {}).forEach((key) => {
    const property = properties[key];
    if (!property) return;
    if (property.type === 'title') out[key] = plainText(property.title);
    else if (property.type === 'rich_text') out[key] = plainText(property.rich_text);
    else if (property.type === 'number') out[key] = property.number;
    else if (property.type === 'select') out[key] = property.select ? property.select.name : null;
    else if (property.type === 'status') out[key] = property.status ? property.status.name : null;
    else if (property.type === 'multi_select') out[key] = (property.multi_select || []).map((item) => item.name);
    else if (property.type === 'checkbox') out[key] = property.checkbox;
    else if (property.type === 'date') out[key] = property.date ? property.date.start : null;
    else if (property.type === 'url') out[key] = property.url;
    else if (property.type === 'relation') out[key] = (property.relation || []).map((item) => item.id);
    else if (property.type === 'formula') out[key] = property.formula ? property.formula.string || property.formula.number : null;
    else out[key] = null;
  });
  return out;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const payload = await req.json().catch(() => ({}));
    const action = payload.action;
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('notion');
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    };

    if (action === 'search') {
      const response = await fetch(`${NOTION}/search`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: String(payload.query || ''), page_size: 30 }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok) return Response.json({ error: data.message || 'Notion error' }, { status: response.status });
      return Response.json({
        results: (data.results || []).map((item) => ({
          id: item.id,
          object: item.object,
          title: titleOf(item),
          edited: item.last_edited_time,
          parent: item.parent ? item.parent.database_id || item.parent.data_source_id || item.parent.page_id || null : null,
          parent_type: item.parent ? item.parent.type : null,
        })),
        has_more: data.has_more,
      });
    }

    if (action === 'database') {
      const response = await fetch(`${NOTION}/databases/${payload.id}`, { headers, signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok) return Response.json({ error: data.message || 'Notion error' }, { status: response.status });
      return Response.json({
        title: titleOf(data),
        data_sources: data.data_sources || [],
        edited: data.last_edited_time,
      });
    }

    if (action === 'query') {
      const response = await fetch(`${NOTION}/data_sources/${payload.id}/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ page_size: 50, start_cursor: payload.cursor || undefined }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok) return Response.json({ error: data.message || 'Notion error' }, { status: response.status });
      return Response.json({
        rows: (data.results || []).map((row) => {
          const properties = flattenProperties(row.properties);
          if (!Array.isArray(payload.keys) || !payload.keys.length) return { id: row.id, properties };
          const picked = {};
          payload.keys.slice(0, 8).forEach((key) => {
            if (key in properties) picked[key] = properties[key];
          });
          return { id: row.id, properties: picked };
        }),
        has_more: data.has_more,
        next_cursor: data.next_cursor,
      });
    }

    if (action === 'blocks') {
      const response = await fetch(`${NOTION}/blocks/${payload.id}/children?page_size=100`, {
        headers,
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok) return Response.json({ error: data.message || 'Notion error' }, { status: response.status });
      let results = data.results || [];
      if (Array.isArray(payload.kinds) && payload.kinds.length) {
        const kinds = payload.kinds.slice(0, 6);
        results = results.filter((block) => kinds.includes(block.type));
      }
      return Response.json({
        blocks: results.map((block) => {
          const body = block[block.type] || {};
          const text = body.rich_text ? plainText(body.rich_text) : body.title ? plainText(body.title) : '';
          const fileUrl = body.file ? body.file.url : body.external ? body.external.url : null;
          return { id: block.id, type: block.type, text, name: body.name || '', file_url: fileUrl, has_children: block.has_children };
        }),
        has_more: data.has_more,
        next_cursor: data.next_cursor,
      });
    }

    if (action === 'grep') {
      const response = await fetch(`${NOTION}/blocks/${payload.id}/children?page_size=100`, {
        headers,
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok) return Response.json({ error: data.message || 'Notion error' }, { status: response.status });
      const fileBlock = (data.results || []).find((block) => block.type === 'file' || block.type === 'pdf');
      if (!fileBlock) return Response.json({ error: 'No attachment on this page' }, { status: 404 });
      const body = fileBlock[fileBlock.type] || {};
      const url = body.file ? body.file.url : null;
      if (!url) return Response.json({ error: 'Attachment has no file url' }, { status: 404 });
      const download = await fetch(url, { signal: AbortSignal.timeout(25000) });
      const text = await download.text();
      const lines = text.split('\n');
      const needle = String(payload.needle || '').toLowerCase();
      const matches = [];
      lines.forEach((line, index) => {
        if (matches.length >= 12) return;
        if (line.toLowerCase().includes(needle)) {
          matches.push({ line: index, text: lines.slice(index, index + 12).join('\n').slice(0, 1200) });
        }
      });
      return Response.json({ needle, count: matches.length, matches });
    }

    if (action === 'section') {
      const response = await fetch(`${NOTION}/blocks/${payload.id}/children?page_size=100`, {
        headers,
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok) return Response.json({ error: data.message || 'Notion error' }, { status: response.status });
      const fileBlock = (data.results || []).find((block) => block.type === 'file' || block.type === 'pdf');
      if (!fileBlock) return Response.json({ error: 'No attachment on this page' }, { status: 404 });
      const body = fileBlock[fileBlock.type] || {};
      const url = body.file ? body.file.url : null;
      if (!url) return Response.json({ error: 'Attachment has no file url' }, { status: 404 });
      const download = await fetch(url, { signal: AbortSignal.timeout(25000) });
      const text = await download.text();
      const lines = text.split('\n');
      const needle = String(payload.heading || '').toLowerCase();
      const index = lines.findIndex((line) => line.trim().startsWith('#') && line.toLowerCase().includes(needle));
      if (index < 0) return Response.json({ error: 'Heading not found' }, { status: 404 });
      return Response.json({
        heading: lines[index].trim(),
        start_line: index,
        text: lines.slice(index, index + 400).join('\n').slice(0, 15000),
      });
    }

    if (action === 'headings') {
      const response = await fetch(`${NOTION}/blocks/${payload.id}/children?page_size=100`, {
        headers,
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok) return Response.json({ error: data.message || 'Notion error' }, { status: response.status });
      const fileBlock = (data.results || []).find((block) => block.type === 'file' || block.type === 'pdf');
      if (!fileBlock) return Response.json({ error: 'No attachment on this page' }, { status: 404 });
      const body = fileBlock[fileBlock.type] || {};
      const url = body.file ? body.file.url : null;
      if (!url) return Response.json({ error: 'Attachment has no file url' }, { status: 404 });
      const download = await fetch(url, { signal: AbortSignal.timeout(25000) });
      const text = await download.text();
      const outline = text
        .split('\n')
        .filter((line) => /^#{1,4}\s/.test(line.trim()))
        .map((line) => line.trim());
      return Response.json({ name: body.name || '', length: text.length, outline });
    }

    if (action === 'attachment') {
      const response = await fetch(`${NOTION}/blocks/${payload.id}/children?page_size=100`, {
        headers,
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok) return Response.json({ error: data.message || 'Notion error' }, { status: response.status });
      const fileBlock = (data.results || []).find((block) => block.type === 'file' || block.type === 'pdf');
      if (!fileBlock) return Response.json({ error: 'No attachment on this page' }, { status: 404 });
      const body = fileBlock[fileBlock.type] || {};
      const url = body.file ? body.file.url : null;
      if (!url) return Response.json({ error: 'Attachment has no file url' }, { status: 404 });
      const download = await fetch(url, { signal: AbortSignal.timeout(25000) });
      const text = await download.text();
      const start = Number(payload.start) || 0;
      return Response.json({
        name: body.name || '',
        length: text.length,
        start,
        text: text.slice(start, start + 15000),
      });
    }

    if (action === 'text') {
      const target = String(payload.url || '');
      let host = '';
      try {
        host = new URL(target).host;
      } catch (error) {
        host = '';
      }
      const allowedHosts = [
        'prod-files-secure.s3.us-west-2.amazonaws.com',
        's3.us-west-2.amazonaws.com',
        'www.notion.so',
        'file.notion.so',
      ];
      if (!allowedHosts.includes(host)) return Response.json({ error: 'Unsupported host' }, { status: 400 });
      const response = await fetch(target, { signal: AbortSignal.timeout(25000) });
      const body = await response.text();
      const start = Number(payload.start) || 0;
      return Response.json({ length: body.length, start, text: body.slice(start, start + 15000) });
    }

    return Response.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}