import type { Brand } from "./types";

// ============================================================================
// Marka Beyni portabilitesi: JSON export/import (yedek + cihazlar arası taşıma).
// Pure serialize/parse + doğrulama (test edilebilir).
// ============================================================================

export function serializeBrand(brand: Brand): string {
  // id taşınmaz — import edilen marka yeni id ile kaydedilir.
  const { id, ...rest } = brand;
  void id;
  return JSON.stringify(rest, null, 2);
}

// Güvenli parse: zorunlu iskelet yoksa null döner.
export function parseBrand(json: string): Brand | null {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.name !== "string" || typeof d.sector !== "string") return null;
  if (typeof d.identity !== "object" || d.identity === null) return null;
  if (typeof d.voice !== "object" || d.voice === null) return null;
  if (!Array.isArray(d.audience)) return null;
  if (typeof d.proof !== "object" || d.proof === null) return null;
  // id'yi düşür (import → yeni marka).
  const { id, ...rest } = d;
  void id;
  return rest as unknown as Brand;
}
