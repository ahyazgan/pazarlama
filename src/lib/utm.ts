import type { PlatformId } from "./types";
import { PLATFORM_LABELS } from "./types";
import { slugify } from "./export";

// ============================================================================
// Analytics etiketleme — yayınlanan içeriğin trafiğini ölçülebilir kılmak için
// UTM parametreli izlenebilir bağlantılar üretir. Saf (test edilebilir).
// "Hangi platform dönüştürdü?" sorusunu GA/CRM tarafında yanıtlanır kılar.
// ============================================================================

export interface UtmParams {
  source: string; // utm_source — platform
  medium: string; // utm_medium — kanal tipi
  campaign: string; // utm_campaign — kampanya slug
}

// Kampanya etiketi: marka + konudan deterministik, e-tablo/GA dostu slug.
export function campaignSlug(brandName: string, topic: string): string {
  const b = slugify(brandName);
  const t = slugify(topic);
  return [b, t].filter((x) => x && x !== "icerik-paketi").join("-") || "kampanya";
}

// Var olan query/fragment'i koruyarak UTM parametrelerini ekler.
export function buildUtmUrl(base: string, p: UtmParams): string {
  const trimmed = base.trim();
  if (!trimmed) return "";
  const [withoutHash, hash = ""] = trimmed.split("#");
  const sep = withoutHash.includes("?") ? "&" : "?";
  const query = new URLSearchParams({
    utm_source: p.source,
    utm_medium: p.medium,
    utm_campaign: p.campaign,
  }).toString();
  return `${withoutHash}${sep}${query}${hash ? `#${hash}` : ""}`;
}

export interface PlatformLink {
  platform: PlatformId;
  label: string;
  url: string;
}

// Her platform için ayrı utm_source'lu izlenebilir bağlantı seti.
export function platformLinks(
  base: string,
  campaign: string,
  medium = "social",
): PlatformLink[] {
  const platforms: PlatformId[] = ["instagram", "tiktok", "linkedin", "x"];
  return platforms.map((platform) => ({
    platform,
    label: PLATFORM_LABELS[platform],
    url: buildUtmUrl(base, { source: platform, medium, campaign }),
  }));
}
