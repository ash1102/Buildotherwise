/**
 * A drop-in stand-in for the Base44 SDK client, backed by Supabase.
 *
 * The app calls `base44.entities.X.list/filter/create/update/delete/subscribe`,
 * `base44.auth.*`, `base44.functions.invoke`, and a few others. This file offers
 * the same calls so the pages, lessons and tests stay as they are. Used only when
 * VITE_SUPABASE_URL is set (the Vercel build); the Base44 build is unchanged.
 */
import { createClient } from '@supabase/supabase-js';
import TABLES from './supabaseTables.json';
import { createReflectionAgents } from './reflectionAgent';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True on the Vercel build. On Base44 nothing below is created. */
export const USE_SUPABASE = Boolean(url && anonKey);

export const supabase = USE_SUPABASE
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
    })
  : null;

/** Same shape as the SDK's errors, so existing catch blocks keep reading `status`, `message`, `response.data`. */
function apiError(message, status = 400, data = undefined) {
  const error = new Error(message || 'Something went wrong');
  error.status = status;
  error.data = data ?? { message };
  error.response = { status, data: error.data };
  return error;
}

function unwrap({ data, error, status }) {
  if (error) throw apiError(error.message, status || 400, error);
  return data;
}

/* ---------- Mongo-style filters -> PostgREST ---------- */

const quote = (v) => {
  const s = String(v);
  return /[,()."\s:]/.test(s) ? `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : s;
};
const likeTerm = (s) => String(s).replace(/[%_]/g, (m) => `\\${m}`).replace(/[,()]/g, ' ');

/** One condition as PostgREST `or()` text, for use inside $or. */
function orPiece(field, cond) {
  if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
    if ('$regex' in cond) {
      const op = String(cond.$options || '').includes('i') ? 'ilike' : 'like';
      return `${field}.${op}.*${likeTerm(cond.$regex)}*`;
    }
    if ('$ne' in cond) return cond.$ne === null ? `${field}.not.is.null` : `${field}.neq.${quote(cond.$ne)}`;
    if ('$in' in cond) return `${field}.in.(${cond.$in.map(quote).join(',')})`;
    if ('$exists' in cond) return cond.$exists ? `${field}.not.is.null` : `${field}.is.null`;
  }
  return cond === null ? `${field}.is.null` : `${field}.eq.${quote(cond)}`;
}

function applyQuery(q, query = {}) {
  for (const [field, cond] of Object.entries(query || {})) {
    if (field === '$or') {
      q = q.or(cond.map((part) => Object.entries(part).map(([f, c]) => orPiece(f, c)).join(',')).join(','));
      continue;
    }
    if (field === '$and') {
      cond.forEach((part) => { q = applyQuery(q, part); });
      continue;
    }
    if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
      for (const [op, v] of Object.entries(cond)) {
        if (op === '$ne') q = v === null ? q.not(field, 'is', null) : q.or(`${field}.neq.${quote(v)},${field}.is.null`);
        else if (op === '$in') q = q.in(field, v);
        else if (op === '$nin') q = q.or(`${field}.not.in.(${v.map(quote).join(',')}),${field}.is.null`);
        else if (op === '$exists') q = v ? q.not(field, 'is', null) : q.is(field, null);
        else if (op === '$gt') q = q.gt(field, v);
        else if (op === '$gte') q = q.gte(field, v);
        else if (op === '$lt') q = q.lt(field, v);
        else if (op === '$lte') q = q.lte(field, v);
        else if (op === '$regex') q = String(cond.$options || '').includes('i') ? q.ilike(field, `%${likeTerm(v)}%`) : q.like(field, `%${likeTerm(v)}%`);
        else if (op === '$options') { /* read with $regex */ }
        else throw apiError(`Unsupported filter ${op} on ${field}`);
      }
    } else if (cond === null) {
      q = q.is(field, null);
    } else {
      q = q.eq(field, cond);
    }
  }
  return q;
}

function applySort(q, sort) {
  if (!sort) return q;
  for (const key of String(sort).split(',').map((s) => s.trim()).filter(Boolean)) {
    const desc = key.startsWith('-');
    q = q.order(desc ? key.slice(1) : key, { ascending: !desc, nullsFirst: false });
  }
  return q;
}

/* ---------- Entities ---------- */

function entityApi(name) {
  const meta = TABLES[name];
  if (!meta) throw apiError(`Unknown entity ${name}`, 404);
  const { table, adminOnly = [] } = meta;
  const strip = (data) => {
    const copy = { ...(data || {}) };
    ['id', 'created_date', 'updated_date', 'created_by_id', 'created_by', ...adminOnly].forEach((k) => delete copy[k]);
    return copy;
  };

  async function run({ query, sort, limit, skip = 0, fields }) {
    const select = fields?.length ? Array.from(new Set(['id', ...fields])).join(',') : '*';
    let q = supabase.from(table).select(select);
    q = applyQuery(q, query);
    q = applySort(q, sort);
    if (limit) q = q.range(skip || 0, (skip || 0) + limit - 1);
    return unwrap(await q) || [];
  }

  return {
    /** list(sort, limit, skip) -> array */
    async list(sort, limit, skip) {
      return run({ sort, limit, skip });
    },
    /**
     * filter(query, sort, limit, skip) -> array
     * filter(query, { sort, limit, skip, fields, distinct }) -> { items }
     */
    async filter(query, sortOrOptions, limit, skip) {
      if (sortOrOptions && typeof sortOrOptions === 'object') {
        const { sort, limit: l, skip: s, fields, distinct } = sortOrOptions;
        if (distinct) {
          const rows = await run({ query, sort, limit: l || 1000, skip: s, fields: [distinct] });
          return { items: Array.from(new Set(rows.map((r) => r[distinct]))) };
        }
        return { items: await run({ query, sort, limit: l, skip: s, fields }) };
      }
      return run({ query, sort: sortOrOptions, limit, skip });
    },
    async get(id) {
      return unwrap(await supabase.from(table).select('*').eq('id', id).single());
    },
    async create(data) {
      return unwrap(await supabase.from(table).insert(strip(data)).select().single());
    },
    async bulkCreate(rows) {
      return unwrap(await supabase.from(table).insert((rows || []).map(strip)).select());
    },
    async update(id, data) {
      return unwrap(await supabase.from(table).update(strip(data)).eq('id', id).select().single());
    },
    async delete(id) {
      unwrap(await supabase.from(table).delete().eq('id', id));
      return { id };
    },
    /** subscribe(callback) -> unsubscribe function */
    subscribe(callback) {
      const channel = supabase
        .channel(`${table}-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) =>
          callback({ type: payload.eventType?.toLowerCase(), data: payload.new, old: payload.old })
        )
        .subscribe();
      return () => supabase.removeChannel(channel);
    },
  };
}

const entities = new Proxy({}, { get: (cache, name) => (cache[name] ||= entityApi(String(name))) });

/* ---------- Auth ---------- */

async function currentUser() {
  const { data } = await supabase.auth.getUser();
  const authUser = data?.user;
  if (!authUser) throw apiError('Authentication required', 401, { extra_data: { reason: 'auth_required' } });
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
  return {
    id: authUser.id,
    email: authUser.email,
    full_name: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
    role: profile?.role || 'user',
    created_date: authUser.created_at,
  };
}

const loginPath = (from) => {
  let returnTo = '/';
  try {
    const target = new URL(from || window.location.href, window.location.origin);
    if (target.origin === window.location.origin) returnTo = target.pathname + target.search;
  } catch { /* keep "/" */ }
  return '/login' + (returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : '');
};

const auth = {
  me: currentUser,
  async isAuthenticated() {
    const { data } = await supabase.auth.getSession();
    return Boolean(data?.session);
  },
  async loginViaEmailPassword(email, password) {
    const result = await supabase.auth.signInWithPassword({ email, password });
    unwrap(result);
    return { access_token: result.data.session?.access_token, user: await currentUser() };
  },
  async loginWithProvider(provider, returnTo = '/') {
    unwrap(await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: new URL(returnTo || '/', window.location.origin).href },
    }));
  },
  async register({ email, password }) {
    return unwrap(await supabase.auth.signUp({ email, password }));
  },
  /** The sign-up email carries a 6-digit code (Supabase "Confirm signup" template uses {{ .Token }}). */
  async verifyOtp({ email, otpCode }) {
    const result = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
    unwrap(result);
    return { access_token: result.data.session?.access_token, user: await currentUser() };
  },
  async resendOtp(email) {
    return unwrap(await supabase.auth.resend({ type: 'signup', email }));
  },
  async resetPasswordRequest(email) {
    return unwrap(await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: new URL('/reset-password?token=email-link', window.location.origin).href,
    }));
  },
  /** The reset link signs the person in (detectSessionInUrl); then the new password is set. */
  async resetPassword({ newPassword }) {
    return unwrap(await supabase.auth.updateUser({ password: newPassword }));
  },
  async changePassword({ currentPassword, newPassword }) {
    const me = await currentUser();
    unwrap(await supabase.auth.signInWithPassword({ email: me.email, password: currentPassword }));
    return unwrap(await supabase.auth.updateUser({ password: newPassword }));
  },
  async logout(redirectUrl) {
    await supabase.auth.signOut();
    if (redirectUrl) window.location.href = '/';
  },
  redirectToLogin(from) {
    window.location.href = loginPath(from);
  },
  setToken() { /* Supabase keeps its own session */ },
};

/* ---------- Server functions (Vercel /api) ---------- */

const functions = {
  async invoke(name, payload = {}) {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    const res = await fetch(`/api/${encodeURIComponent(name)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(payload),
    });
    let body = null;
    try { body = await res.json(); } catch { body = null; }
    if (!res.ok) throw apiError(body?.error || `Request failed (${res.status})`, res.status, body);
    return { data: body, status: res.status };
  },
};

/* ---------- Not moved yet (later phases) ---------- */

const notYet = (what) => async () => {
  throw apiError(`${what} isn't available on this version yet.`, 501);
};

const agents = createReflectionAgents({ entities, functions, apiError });

const integrations = {
  Core: {
    async CreateFileSignedUrl({ file_uri }) {
      const [bucket, ...rest] = String(file_uri || '').split('/');
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(rest.join('/'), 300);
      if (error) throw apiError(error.message);
      return { signed_url: data.signedUrl };
    },
    UploadFile: notYet('File upload'),
    SendEmail: notYet('Email'),
    InvokeLLM: notYet('AI'),
  },
};

const app = {
  async getPublicSettings() {
    return { id: 'entrepalooza', public_settings: 'public_with_login' };
  },
};

export const supabaseBase44 = { entities, auth, functions, agents, integrations, app };

/** Synchronous "is there a session token on this device?" for app-params. */
export function storedAccessToken() {
  try {
    const key = Object.keys(window.localStorage).find((k) => /^sb-.*-auth-token$/.test(k));
    if (!key) return null;
    const parsed = JSON.parse(window.localStorage.getItem(key));
    return parsed?.access_token || parsed?.currentSession?.access_token || null;
  } catch {
    return null;
  }
}
