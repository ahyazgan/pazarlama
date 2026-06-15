import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase opsiyonel: env yoksa null doner ve uygulama localStorage'a duser.
let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  cached = url && key ? createClient(url, key) : null;
  return cached;
}

export const isSupabaseConfigured = (): boolean => getSupabase() !== null;
