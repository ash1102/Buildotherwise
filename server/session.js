/**
 * Confirm the caller is a signed-in Supabase user.
 * The access token is checked with Supabase Auth (GET /auth/v1/user). The anon key
 * never grants a session by itself, so the Gemini key cannot be used anonymously.
 */
import { createClient } from '@supabase/supabase-js';
import { bearerToken } from './http.js';

export function supabaseEnv(env = process.env) {
  const url = String(env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const anonKey = String(env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '');
  return { url, anonKey };
}

export async function requireUser(req, options = {}) {
  const {
    env = process.env,
    fetchImpl = globalThis.fetch,
    signedOut = 'Sign in required.',
    unavailable = "This isn’t available right now.",
    admin = false,
  } = options;

  const token = bearerToken(req);
  if (!token) return { error: signedOut, status: 401 };

  const { url, anonKey } = supabaseEnv(env);
  if (!url || !anonKey) return { error: unavailable, status: 503 };

  const client = createClient(url, anonKey, {
    global: {
      fetch: fetchImpl,
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  let userId = '';
  try {
    const { data, error } = await client.auth.getUser(token);
    userId = data?.user?.id || '';
    if (error || !userId) return { error: signedOut, status: 401 };
  } catch {
    return { error: unavailable, status: 503 };
  }

  if (admin) {
    try {
      const { data: profile, error } = await client
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      if (error || profile?.role !== 'admin') return { error: 'Not available.', status: 403 };
    } catch {
      return { error: 'Not available.', status: 403 };
    }
  }

  return { user: { id: userId }, client, token };
}
