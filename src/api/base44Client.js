import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { USE_SUPABASE, supabaseBase44 } from './supabaseCompat';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

/**
 * On Vercel (VITE_SUPABASE_URL set) the app runs on Supabase through a stand-in
 * with the same calls. On Base44 it uses the Base44 SDK exactly as before.
 */
export const base44 = USE_SUPABASE
  ? supabaseBase44
  : createClient({
      appId,
      token,
      functionsVersion,
      serverUrl: '',
      appBaseUrl,
    });
