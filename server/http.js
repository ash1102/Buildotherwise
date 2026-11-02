/** Small helpers for Vercel Node functions (req, res). */

export function header(req, name) {
  const headers = req?.headers;
  if (!headers) return '';
  if (typeof headers.get === 'function') return headers.get(name) || '';
  const key = Object.keys(headers).find((item) => item.toLowerCase() === name.toLowerCase());
  return key ? String(headers[key] || '') : '';
}

export function bearerToken(req) {
  const match = /^Bearer\s+(\S+)/i.exec(header(req, 'authorization') || '');
  return match ? match[1] : '';
}

export function sendJson(res, status, body) {
  if (typeof res.status === 'function') {
    res.status(status).json(body);
    return;
  }
  res.statusCode = status;
  res.setHeader?.('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

/**
 * Read a JSON body without logging it. Vercel usually parses JSON onto req.body.
 * Returns { payload } or { status, error }.
 */
export async function readJson(req, maxBytes) {
  let raw = '';
  if (typeof req.body === 'string') raw = req.body;
  else if (Buffer.isBuffer(req.body)) raw = req.body.toString('utf8');
  else if (req.body && typeof req.body === 'object') raw = JSON.stringify(req.body);
  else raw = await readStream(req);

  if (raw.length > maxBytes) {
    return { status: 413, error: 'That note is too long to send. Try a shorter one.' };
  }
  if (!raw) return { payload: {} };
  try {
    const payload = JSON.parse(raw);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return { status: 400, error: 'Body must be JSON.' };
    }
    return { payload };
  } catch {
    return { status: 400, error: 'Body must be JSON.' };
  }
}

function readStream(req) {
  if (!req?.on) return Promise.resolve('');
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
