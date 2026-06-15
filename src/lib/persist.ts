import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { Brand, ContentPackage } from "./types";

// ============================================================================
// Supabase kalici kayit (best-effort).
// Env yapilandirilmamissa SESSIZCE no-op (null doner) — uygulama localStorage
// ile calismaya devam eder. Yapilandirilmissa insert dener, hata yutulur.
// Not: brands/content_packages tablolari RLS ile auth.uid() bekler; gercek
// kalicilik icin Supabase Auth gerekir (Faz 2). Bkz. supabase/schema.sql.
// ============================================================================

export async function saveBrandRemote(brand: Brand): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("brands")
      .insert({
        name: brand.name,
        sector: brand.sector,
        identity: brand.identity,
        voice: brand.voice,
        audience: brand.audience,
        proof: brand.proof,
      })
      .select("id")
      .single();
    if (error) return null;
    return (data?.id as string) ?? null;
  } catch {
    return null;
  }
}

export async function savePackageRemote(
  brandId: string | null,
  pkg: ContentPackage,
): Promise<boolean> {
  if (!brandId || !isSupabaseConfigured()) return false;
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { error } = await sb.from("content_packages").insert({
      brand_id: brandId,
      topic: pkg.topic,
      content_type: pkg.contentType,
      angle: pkg.angle,
      outputs: pkg.outputs,
    });
    return !error;
  } catch {
    return false;
  }
}
