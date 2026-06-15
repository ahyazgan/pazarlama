import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { Brand, ContentPackage } from "./types";

// ============================================================================
// Supabase kalici kayit (best-effort).
// Env yapilandirilmamissa SESSIZCE no-op (null doner) — uygulama localStorage
// ile calismaya devam eder. Yapilandirilmissa insert dener, hata yutulur.
// Not: brands/content_packages tablolari RLS ile auth.uid() bekler; gercek
// kalicilik icin Supabase Auth gerekir (Faz 2). Bkz. supabase/schema.sql.
// ============================================================================

// Aktif oturum kullanıcı id'si (RLS için zorunlu); yoksa null.
async function userId(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function saveBrandRemote(brand: Brand): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = getSupabase();
  if (!sb) return null;
  const uid = await userId();
  if (!uid) return null; // RLS auth.uid() bekler — girişsiz yazma denenmez
  try {
    const { data, error } = await sb
      .from("brands")
      .insert({
        user_id: uid,
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

// Kullanıcının Supabase'deki markaları (RLS otomatik filtreler). Girişsiz → [].
export async function loadBrandsRemote(): Promise<Brand[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();
  if (!sb) return [];
  if (!(await userId())) return [];
  try {
    const { data, error } = await sb
      .from("brands")
      .select("id,name,sector,identity,voice,audience,proof")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as unknown as Brand[];
  } catch {
    return [];
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
