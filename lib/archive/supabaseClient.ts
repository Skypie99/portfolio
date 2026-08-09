/**
 * supabaseClient.ts — the archive's browser Supabase client.
 *
 * Lazily constructed on first use in the browser, so the static-export prerender
 * (which never calls getSupabase) can build without a live project or real env.
 * RLS is the security boundary; the anon key is publishable by design.
 *
 * Auth is configured for the borrowed-machine test: PKCE + persisted, self-
 * refreshing sessions + detectSessionInUrl (magic-link return), with a 6-digit
 * code path as a first-class fallback (see AuthGate).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  }
  return client;
}

/** True when real (non-placeholder) Supabase env is present — used for dev hints. */
export function hasSupabaseEnv(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0 && !SUPABASE_URL.includes('placeholder');
}
