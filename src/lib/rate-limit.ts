import { NextResponse } from "next/server";

// ============================================================================
// API rate-limit — sunucu anahtarını kötüye-kullanıma/maliyet sömürüsüne karşı korur.
// In-memory kayan pencere (MVP; sunucu yeniden başlayınca sıfırlanır). Saf çekirdek
// (RateLimiter) test edilebilir. Prod'da kalıcı/dağıtık store (Upstash vb.) önerilir.
// ============================================================================

export class RateLimiter {
  private hits = new Map<string, number[]>();
  constructor(
    private limit: number,
    private windowMs: number,
  ) {}

  hit(key: string, now: number = Date.now()): { allowed: boolean; retryAfter: number } {
    const cutoff = now - this.windowMs;
    const arr = (this.hits.get(key) ?? []).filter((t) => t > cutoff);
    if (arr.length >= this.limit) {
      const retryAfter = Math.ceil((arr[0] + this.windowMs - now) / 1000);
      this.hits.set(key, arr);
      return { allowed: false, retryAfter: Math.max(1, retryAfter) };
    }
    arr.push(now);
    this.hits.set(key, arr);
    return { allowed: true, retryAfter: 0 };
  }
}

// Üretim endpoint'leri: dakikada 20 istek / IP (maliyet sömürüsünü engeller).
const aiLimiter = new RateLimiter(20, 60_000);

export function clientKey(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// Limit aşıldıysa 429 döner; aksi halde null (devam et).
export function rateLimited(request: Request): NextResponse | null {
  const { allowed, retryAfter } = aiLimiter.hit(clientKey(request));
  if (allowed) return null;
  return NextResponse.json(
    { error: `Cok fazla istek. ${retryAfter} sn sonra tekrar deneyin.` },
    { status: 429, headers: { "retry-after": String(retryAfter) } },
  );
}
