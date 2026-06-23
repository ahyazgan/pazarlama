import { describe, expect, it } from "vitest";
import { RateLimiter } from "./rate-limit";

describe("RateLimiter", () => {
  it("limite kadar izin verir, sonra bloklar", () => {
    const rl = new RateLimiter(3, 1000);
    expect(rl.hit("ip", 0).allowed).toBe(true);
    expect(rl.hit("ip", 1).allowed).toBe(true);
    expect(rl.hit("ip", 2).allowed).toBe(true);
    const blocked = rl.hit("ip", 3);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("pencere geçince yeniden izin verir", () => {
    const rl = new RateLimiter(2, 1000);
    rl.hit("ip", 0);
    rl.hit("ip", 100);
    expect(rl.hit("ip", 200).allowed).toBe(false);
    expect(rl.hit("ip", 1200).allowed).toBe(true); // ilk hit penceresi düştü
  });

  it("anahtarlar (IP) bağımsız", () => {
    const rl = new RateLimiter(1, 1000);
    expect(rl.hit("a", 0).allowed).toBe(true);
    expect(rl.hit("b", 0).allowed).toBe(true);
    expect(rl.hit("a", 0).allowed).toBe(false);
  });
});
