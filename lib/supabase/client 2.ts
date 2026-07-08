import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.length < 20) {
    console.warn('%c[CIRCLE] Supabase anon key not configured. Using null client (no real data, auth or realtime).', 'color:#b45309');
    return null;
  }

  // Untyped client (mapping happens in api.ts)
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
