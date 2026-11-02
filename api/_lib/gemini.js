/**
 * The one place the app talks to Gemini. Entrepalooza's AI features (feedback, journal reflection,
 * Discovery Companion) all go through here, so keys, models, timeouts, and logging rules stay the same.
 *
 * Environment (server only, never returned or logged):
 *   GEMINI_API_KEY          (the older name Gemini_key also works)
 *   GEMINI_MODEL            exact model ID, e.g. gemini-3.8-flash
 *   GEMINI_THINKING_LEVEL   minimal | low | medium | high | off   (default low)
 */

export const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
export const DEFAULT_MODEL = 'gemini-3.8-flash';
export const REQUEST_TIMEOUT_MS = 30_000;

export function geminiKey(env) {
  return env.GEMINI_API_KEY || env.Gemini_key || '';
}

export function geminiModel(env) {
  return String(env.GEMINI_MODEL || DEFAULT_MODEL).trim().replace(/^models\//, '');
}

export function thinkingLevel(env) {
  const level = String(env.GEMINI_THINKING_LEVEL || 'low').trim().toLowerCase();
  if (level === 'off' || level === '') return null;
  return ['minimal', 'low', 'medium', 'high'].includes(level) ? level : 'low';
}

/** Strip anything that looks like a key before text reaches a log. */
export function redact(text) {
  return String(text || '')
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[redacted]')
    .replace(/key=[^&\s"]+/gi, 'key=[redacted]')
    .slice(0, 300);
}

export function upstreamReason(status) {
  if (status === 429) return 'Gemini quota or rate limit reached for this key.';
  if (status === 400 || status === 403) return 'Gemini rejected the request (key, permission, region, or settings).';
  if (status === 404) return 'That model ID is not available to this key.';
  return 'Gemini is not available right now.';
}

export async function fetchWithTimeout(fetchImpl, url, init, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function buildRequestBody({ system, turns, level, temperature = 0.7, maxOutputTokens = 1024, json = false }) {
  const generationConfig = { temperature, maxOutputTokens };
  if (json) generationConfig.responseMimeType = 'application/json';
  if (level) generationConfig.thinkingConfig = { thinkingLevel: level };
  return {
    systemInstruction: { parts: [{ text: system }] },
    contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
    generationConfig,
  };
}

/**
 * Sends one generateContent request. Some models reject a thinking setting, so a 400 with thinking on
 * is retried once without it. Returns { res, level } where `level` is what was actually used.
 */
export async function callGemini({ fetchImpl, apiKey, model, system, turns, level, ...options }) {
  const send = (lvl) =>
    fetchWithTimeout(fetchImpl, `${API_BASE}/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify(buildRequestBody({ system, turns, level: lvl, ...options })),
    });
  let res = await send(level);
  let used = level;
  if (res.status === 400 && level) {
    await res.body?.cancel?.();
    used = null;
    res = await send(null);
  }
  return { res, level: used };
}

/** Visible text of the first candidate (thinking parts are never shown). */
export function extractReply(data) {
  const candidate = data?.candidates?.[0];
  const reply = (candidate?.content?.parts || [])
    .filter((p) => typeof p.text === 'string' && !p.thought)
    .map((p) => p.text)
    .join('')
    .trim();
  return { reply, candidate };
}

/** Status codes only: Google's error text can echo parts of the request. */
export async function describeFailure(res) {
  const detail = await res.text().catch(() => '');
  let googleStatus = '';
  try {
    googleStatus = JSON.parse(detail)?.error?.status || '';
  } catch {
    /* not JSON */
  }
  return { status: res.status, googleStatus };
}

/** Trailing turns that fit a character budget. Always keeps the latest; starts on a user turn. */
export function recentWindow(turns, budget) {
  const window = [];
  let used = 0;
  for (let i = turns.length - 1; i >= 0; i--) {
    const size = turns[i].text.length;
    if (window.length > 0 && used + size > budget) break;
    window.unshift(turns[i]);
    used += size;
  }
  while (window.length > 1 && window[0].role !== 'user') window.shift();
  return { window, omitted: turns.length - window.length };
}
