# BACKLOG.md — Work Queue

> Claude Code pulls the next unchecked item from here automatically (see CLAUDE.md §7).
> Format: `- [ ] <goal>` + `Done when:` line. Check off with commit SHA.

-----

## Now (ARAŞTIRMA katmanı — daha kaliteli/doğrulanabilir bilgi)

- [x] Sektör bilgi korpusunu derinleştir (mevzuat/hata/benchmark)  (c1ca566)
- [x] Araştırma brief tipleri + citations + grounding enjeksiyonu  (88fe709)
- [x] Kalite-lint: şüpheli/kaynaksız sayı kuralı  (1f62ac8)
- [x] /api/research web_search iskeleti (anahtarsız 503)  (8bde277)

### Done (önceki):
- [x] Birleşik Kalite Raporu (yayına hazır mı?)  (26accc0)
- [x] Mobil navigasyon + cila (hamburger drawer)  (f58cb03)
- [x] Onboarding akışı (ilk çalıştırma 3-adım rehberi)  (7bbf7c6)

### Done (önceki):
- [x] Prompt-caching restructure (sabit system prefix + cache_control)  (42aa4f0)

### Gerçek dış kaynağa bağlı kalan (kod hazır / kurulum bekliyor):
- LLM öz-eleştiri (/api/critique): ANTHROPIC_API_KEY ile çalışır (yoksa 503).
- Otomatik yayın: IG/TikTok OAuth + prod (§4) — kullanıcı kurulumu.
- Org-geneli network: paylaşımlı Supabase backend + çok kullanıcı.

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
- [x] Trend enjeksiyonu (manuel girdi)  (b3159bc)
- [x] Feedback loop (yerel 👍/👎 → öğrenen recommender)  (25e50f1)
- [x] İçerik takvimi (ajanda/planlayıcı + /calendar)  (34b4c6a)
- [x] BEYNİ ÖĞRET: few-shot altın/negatif örnekler  (d582cde)
- [x] BEYNİ ÖĞRET: rakip & konumlandırma  (90b155f)
- [x] BEYNİ ÖĞRET: persona derinliği (jobs-to-be-done)  (f230805)
- [x] Beyin Doluluk Skoru + rehberli iyileştirme  (10b6c12)
- [x] A/B varyant üretimi  (faf960c)
- [x] Şeffaflık önizlemesi (beyne ne enjekte ediliyor)  (9fcafc4)
- [x] Yayın hazırlığı (.ics + manuel checklist)  (9dba81c)
- [x] BEYİN DERİN: görsel kimlik (marka rengi + stil)  (767d453)
- [x] BEYİN DERİN: içerik sütunları (content pillars)  (853b500)
- [x] BEYİN DERİN: marka hikayesi (origin/neden)  (6163e98)
- [x] BEYİN DERİN: CTA dönüşüm hedefi  (c2e9cc3)

-----

## Notes / blockers
- Gerçek (Claude) üretimi ANTHROPIC_API_KEY ister; anahtarsız "Demo modu" tüm akışı çalıştırır.
- Önceki futbol backlog'u (manager2) bu repoya ait değildi; düzeltildi.
