/**
 * Supabase auth for the /api functions.
 *
 * The browser sends its Supabase access token as `Authorization: Bearer <token>`. We check it with
 * Supabase and then query as that person, so the database's row-level security still applies.
 *
 * Environment (read only, never logged or returned):
 *   SUPABASE_URL / SUPABASE_ANON_KEY            falls back to VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY                   optional; only submitInquiry uses it
 */
import { createClient } from '@supabase/supabase-js';

function supabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export function bearerToken(request) {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

/** Returns { user, role, client } for a valid sign-in, or null. `client` queries as that person. */
export async function authenticate(request) {
  const config = supabaseConfig();
  const token = bearerToken(request);
  if (!config || !token) return null;
  const client = createClient(config.url, config.anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return null;
  let role = 'user';
  try {
    const { data: profile } = await client.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
    if (profile?.role) role = profile.role;
  } catch {
    /* keep the least-privileged role */
  }
  return { user: data.user, role, client };
}

/** A server-only client that bypasses row-level security, or null when the key isn't configured. */
export function serviceClient() {
  const config = supabaseConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!config || !key) return null;
  return createClient(config.url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** An anonymous client (publishable key only). */
export function anonClient() {
  const config = supabaseConfig();
  return config ? createClient(config.url, config.anonKey, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}
