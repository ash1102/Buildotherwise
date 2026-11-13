import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  // The Vercel build sets VITE_SUPABASE_URL and runs without any Base44 plugin.
  const onSupabase = Boolean(env.VITE_SUPABASE_URL) || env.VITE_MODULE_ONE_REVIEW === '1';

  return {
    resolve: {
      alias: { '@': path.resolve(process.cwd(), 'src') },
    },
    plugins: [
      !onSupabase &&
        base44({
          // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
          // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
          legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
          hmrNotifier: true,
          navigationNotifier: true,
          analyticsTracker: true,
          visualEditAgent: true,
        }),
      react(),
    ].filter(Boolean),
  };
});
