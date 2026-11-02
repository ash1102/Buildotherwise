/**
 * Google Gemini REST calls (generativelanguage.googleapis.com). The key stays here,
 * in the request header, and is never written to a URL, a log line, or a response.
 */

export const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
export const DEFAULT_MODEL = 'gemini-3.8-flash';
export const REQUEST_TIMEOUT_MS = 30_000;

const recentCalls = new Map();

export function resetRateLimits() {
  recentCalls.clear();
}

export function rateLimited(bucket, userId, max, windowMs, now = Date.now()) {
  const key = `${bucket}:${userId}`;
  const calls = (recentCalls.get(key) || []).filter((at) => now - at < windowMs);
  if (calls.length >= max) {
    recentCalls.set(key, calls);
    return true;
  }
  calls.push(now);
  recentCalls.set(key, calls);
  return false;
}

export function modelId(env = process.env) {
  return String(env.GEMINI_MODEL || DEFAULT_MODEL).trim().replace(/^models\//, '');
}

/** Gemini 3.8 Flash accepts low, medium, and high. "minimal" is rejected, so it maps to low. */
export function thinkingLevel(env = process.env) {
  const level = String(env.GEMINI_THINKING_LEVEL || 'low').trim().toLowerCase();
  if (level === 'off' || level === '') return null;
  if (level === 'minimal') return 'low';
  return ['low', 'medium', 'high'].includes(level) ? level : 'low';
}

export function apiKey(env = process.env) {
  const key = String(env.GEMINI_API_KEY || '').trim();
  return key || '';
}

export function redact(text) {
  return String(text || '')
    .replace(/AIza[0-9A-Za-z_\-]{20,}/g, '[redacted]')
    .replace(/key=[^&\s"]+/gi, 'key=[redacted]')
    .slice(0, 180);
}

/** Log a status only. Never pass participant text, model output, or the API key. */
export function logStatus(where, status) {
  console.error(where, status);
}

function fetchWithTimeout(fetchImpl, url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetchImpl(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function cancel(res) {
  try {
    await res?.body?.cancel?.();
  } catch {
    /* already consumed */
  }
}

export async function generateContent(fetchImpl, options) {
  const {
    apiKey: key,
    model,
    systemInstruction,
    turns,
    thinkingLevel: level,
    temperature,
    maxOutputTokens,
    responseMimeType,
    timeoutMs = REQUEST_TIMEOUT_MS,
  } = options;
  const generationConfig = { maxOutputTokens };
  // Gemini 3 rejects temperature. Only send it when a caller still sets it (the
  // companion port), and drop it on the fallback request below.
  if (temperature != null) generationConfig.temperature = temperature;
  if (level) generationConfig.thinkingConfig = { thinkingLevel: level };
  if (responseMimeType) generationConfig.responseMimeType = responseMimeType;
  return fetchWithTimeout(
    fetchImpl,
    `${API_BASE}/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: turns.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
        generationConfig,
      }),
    },
    timeoutMs
  );
}

/** One retry without thinking or sampling settings when Gemini rejects the config. */
export async function generateWithFallback(fetchImpl, options) {
  let level = options.thinkingLevel;
  let res = await generateContent(fetchImpl, options);
  const canRetry = res.status === 400 && (level || options.temperature != null || options.responseMimeType);
  if (canRetry) {
    await cancel(res);
    level = null;
    res = await generateContent(fetchImpl, {
      ...options,
      thinkingLevel: null,
      temperature: null,
      responseMimeType: undefined,
    });
  }
  return { res, thinkingLevel: level };
}

export function replyFrom(data) {
  const candidate = data?.candidates?.[0];
  const reply = (candidate?.content?.parts || [])
    .filter((part) => typeof part?.text === 'string' && !part.thought)
    .map((part) => part.text)
    .join('')
    .trim();
  return {
    reply,
    candidate,
    block: data?.promptFeedback?.blockReason || null,
  };
}

/** Most recent turns that fit the budget. Always keeps the latest message; starts on a user turn. */
export function recentWindow(turns, budget) {
  const window = [];
  let used = 0;
  for (let i = turns.length - 1; i >= 0; i -= 1) {
    const size = turns[i].text.length;
    if (window.length > 0 && used + size > budget) break;
    window.unshift(turns[i]);
    used += size;
  }
  while (window.length > 1 && window[0].role !== 'user') window.shift();
  return { window, omitted: turns.length - window.length };
}

export async function readUpstream(res) {
  const status = res.status;
  let googleStatus = '';
  try {
    const detail = await res.text();
    googleStatus = JSON.parse(detail)?.error?.status || '';
  } catch {
    googleStatus = '';
  }
  return { status, googleStatus };
}
