# BACKLOG.md — Work Queue

> Claude Code pulls the next unchecked item from here automatically (see CLAUDE.md §7).
> Format: `- [ ] <goal>` + `Done when:` line. Check off with commit SHA.

-----

## Now (DERİN tur — work top to bottom, don’t pause between items)

- [x] Platform DNA veri katmanı + derin prompt enjeksiyonu  (80ddbb5)
- [x] Strateji Brief üreteci (birincil/ikincil açı, persona odağı, hook tohumu)  (0a15806)
- [x] Sektör açı afinitesi + ses-ton→somut yazım kuralları  (f378202)
- [x] Derin kalite-lint (kanıt/imza/hashtag/thread/emoji/zayıf-hook + marka-bilinçli)  (08597a9)

### Done bu turda (önceki Now sprinti):
- [x] Sektör platform vurgusu  (db2d557)
- [x] Konu önerici  (709b4f2)
- [x] Çıktı kalite göstergeleri (IG caption uzunluğu)  (cceeb76)

-----

## Next (pull once Now is clear)

- [x] Persona-bazlı otomatik açı çeşitliliği (her persona farklı açı)  (c0a078f)
- [x] Anahtarsız kalite-lint: çıktı yasak kelime + AI-klişe denetimi  (bd0fdc9)
- [ ] LLM tabanlı öz-eleştiri turu (deterministik lint'in üstüne) — BLOKE: ANTHROPIC_API_KEY gerekir

-----

## Later (lower priority — dış bağımlılık bekleyenler)

- [ ] Trend Enjeksiyonu (web search) — BLOKE: web search altyapısı
- [ ] Feedback Loop (gerçek performans verisi) — BLOKE
- [ ] Otomatik yayın (IG Graph / TikTok API) — BLOKE: OAuth
- [ ] İçerik takvimi (drag-drop) — DÜŞÜK ÖNCELİK (constitution: manuel yeterli)

-----

## Done (archive — keep last ~10)

- [x] Content OS MVP iskeleti (marka beyni + sektör zekası → içerik paketi)  (58e243f)
- [x] ESLint + Vitest doğrulama zinciri + prompt/sektör testleri  (ace62e2)
- [x] İçerik hafızası (tekrarı önleme)  (43713ae)
- [x] Hook kütüphanesi UI  (2194453)
- [x] Çıktı dışa aktarma (markdown + JSON)  (bd9b44a)
- [x] Tüm personalar için ayrı üretim + persona sekmeleri  (759c00d)
- [x] Supabase best-effort kalıcı kayıt  (3fdde81)
- [x] Sektör zekasını genişlet (4 sektör)  (dd0d106)
- [x] Demo modu (anahtarsız uçtan uca, smoke test geçti)  (ae67b7c)
- [x] CI (GitHub Actions) + Constitution spec'i repoya  (525d38e)
- [x] Strateji Engine aktif önerisi + anti-generic prompt beyni  (92311a7)
- [x] Sektör platform vurgusu (prompt önceliği + çıktı sekme sırası/★)  (db2d557)
- [x] Konu önerici (taze konu fikirleri, boş sayfa sendromu)  (709b4f2)
- [x] Çıktı kalite göstergesi (IG caption uzunluğu)  (cceeb76)
- [x] Persona-bazlı açı çeşitliliği (her persona farklı açı)  (c0a078f)
- [x] Anahtarsız kalite-lint (yasak kelime + AI-klişe denetimi)  (bd0fdc9)
- [x] DERİN tur: Platform DNA katmanı  (80ddbb5)
- [x] DERİN tur: Strateji Brief üreteci  (0a15806)
- [x] DERİN tur: sektör açı afinitesi + ses-ton kuralları  (f378202)
- [x] DERİN tur: derin kalite-lint (6 yeni kural)  (08597a9)

-----

## Notes / blockers
- Gerçek (Claude) üretimi ANTHROPIC_API_KEY ister; anahtarsız "Demo modu" tüm akışı çalıştırır.
- Önceki futbol backlog'u (manager2) bu repoya ait değildi; düzeltildi.
