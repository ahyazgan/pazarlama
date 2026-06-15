# BACKLOG.md — Work Queue

> Claude Code pulls the next unchecked item from here automatically (see CLAUDE.md §7).
> Format: `- [ ] <goal>` + `Done when:` line. Check off with commit SHA.

-----

## Now (BLOKE işlerin kredensiyelsiz MVP versiyonları)

- [x] Trend Enjeksiyonu (manuel girdi) — web search olmadan  (b3159bc)
- [x] Feedback Loop (yerel 👍/👎 → recommender öğrenir)  (25e50f1)
- [ ] İçerik Takvimi (ajanda/planlayıcı) — drag-drop yerine MVP
  Done when: çıktıdan "Takvime ekle" (tarih); /calendar tarihe göre planlanan paketleri listeler + durum (planlandı/yayınlandı); pure helper testi + build yeşil; committed.

### Kalıcı BLOKE (sahtesi yapılmaz):
- [ ] Otomatik yayın (IG Graph / TikTok API) — OAuth + prod yan etki (§4)
- [ ] LLM öz-eleştiri turu — ANTHROPIC_API_KEY gerekir (deterministik lint zaten var)

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
