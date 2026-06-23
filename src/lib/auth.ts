"use client";

import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "./supabase";

// ============================================================================
// Supabase Auth sarmalayıcı. Creds yoksa nazik no-op → uygulama localStorage
// modunda çalışmaya devam eder. Gerçek login için Supabase projesi + .env.local
// (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY) + supabase/schema.sql gerekir.
// ============================================================================

export interface AuthUser {
  id: string;
  email: string | null;
}

const NOT_CONFIGURED = "Supabase yapılandırılmamış. Şu an localStorage modundasın.";

export async function signUp(email: string, password: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { error: NOT_CONFIGURED };
  const { error } = await sb.auth.signUp({ email, password });
  return { error: error?.message ?? null };
}

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  const sb = getSupabase();
  if (!sb) return { error: NOT_CONFIGURED };
  const { error } = await sb.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
}

export async function currentUser(): Promise<AuthUser | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? null } : null;
}

// React hook: oturum durumu (configured değilse her zaman null).
export function useSession(): { user: AuthUser | null; loading: boolean; configured: boolean } {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }
    let active = true;
    void sb.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ? { id: data.user.id, email: data.user.email ?? null } : null);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading, configured };
}
