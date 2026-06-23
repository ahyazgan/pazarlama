# BACKLOG.md — Work Queue

> Claude Code pulls the next unchecked item from here automatically (see CLAUDE.md §7).
> Format: `- [ ] <goal>` + `Done when:` line. Check off with commit SHA.

-----

## Now (BAKIM — bağımlılık güncelleme)

- [x] Stack'i en güncele çek: Next 14→16, React 18→19, ESLint 8→9 (flat config), Vitest 2→4  (no-git: lokal)
  Done when: typecheck/lint/test(182)/build yeşil · dev server 200 · demo API 200 · critical+high CVE temizlendi
  Not: `next lint` kaldırıldı → `eslint .` + `eslint.config.mjs`. React 19 `set-state-in-effect` kuralı warn'a çekildi
  (mount'ta localStorage→state init eden doğru desen). Kalan 2 moderate CVE: Next'in iç `postcss`'i (dev-only, patch bekliyor).

## Now (ARAŞTIRMA katmanı — daha kaliteli/doğrulanabilir bilgi)

- [x] Sektör bilgi korpusunu derinleştir (mevzuat/hata/benchmark)  (c1ca566)
- [x] Araştırma brief tipleri + citations + grounding enjeksiyonu  (88fe709)
- [x] Kalite-lint: şüpheli/kaynaksız sayı kuralı  (1f62ac8)
- [x] /api/research web_search iskeleti (anahtarsız 503)  (8bde277)
- [x] research→generate UI akışı + çıktıda kaynaklar  (1c28221)
- [x] Model kararı: Sonnet 4.6 (kalite-öncelikli) + IG hashtag uyum düzeltmesi  (079930a)

> GERÇEK ANAHTARLA UÇTAN UCA DOĞRULANDI (Haiku): generate (markaya özgü) ·
> research (web_search, kaynaklı) · critique (28/100, ihlalleri yakaladı) ·
> research→generate (bulgu içeriğe + kaynak çıktıya). Constitution §11/6 ✓
> Güvenlik: anahtar yalnızca git-ignore'lı .env.local'da; test sonrası revoke öneril(d)i.

## Now (ÜRÜNLEŞME — UX derinliği)

- [x] Çok markalı yönetim (brand-store + marka seçici/kaydet/sil)  (önceden mevcut)
- [x] Marka beyni içe/dışa aktarma (brand-io JSON export/import)  (önceden mevcut)
- [x] Onboarding sihirbazı (/onboarding — 5 adım, canlı beyin skoru, örnekle başla)
  Done when: typecheck/lint/test/build yeşil · ilk kullanıcı ana sayfadan yönlenir
- [x] Yayın-hazırlık paneli (/dashboard — marka skoru + paket readiness özeti)
  Done when: deterministik birleştirme + test · Nav linki · build route'ta
- [x] Dashboard "sıradaki en iyi aksiyon" önceliklendirme paneli (actions.ts)
- [x] Onboarding → sektöre özel ilk kampanya önerisi (/create?topic= ön-doldurma)
- [x] Demo çıktı kalitesi: açıya özel çerçeve + CTA/persona/vaka/disclaimer enjeksiyonu
- [x] Cila: Nav lg-eşiği + aria-current aktif link · plan boş-durum ekranı
- [x] CSV export (/library — e-tablo dostu, kaçışlı)
- [x] İçerik şablonları kütüphanesi (sektöre özel kampanya başlatıcılar → /create)
- [x] Analytics: UTM izlenebilir bağlantı üreteci (/output, platform başına)
- [x] Çok-dilli çıktı: gerçek üretimde dil seçimi (prompt [DIL] enjeksiyonu)
- [x] Otomatik haftalık plan önerici (şablon + feedback ağırlıklı → /calendar tek tık)
- [x] Kütüphane arama/filtre (metin + sektör + açı; filtreli CSV export)
- [x] Sadeleştirme: Nav 14 düz link → 5 çekirdek + "Daha fazla" gruplu menü;
      ana sayfa net 3 adım + tek CTA + araç ızgarası (özellik kaybı yok)
- [x] Kanal üreteçleri birleştirme: ortak ChannelTabs şeridi (Reklam/SEO/E-posta/
      Topluluk tek araç gibi); Nav'da 4 giriş → 1 "Kanal içerikleri"
- [x] Planlama birleştirme: PlanningTabs (Plan öner + Takvim tek yüzey);
      yinelenen takvim-içi üreteç kaldırıldı; Nav "Planlama" tek giriş
- [x] Ana sayfa → marka kuruluysa panele yönlendir (ilk gelen pazarlamayı görür)
- [x] Ayarlar gruplama: SettingsTabs (Hesap/Entegrasyonlar/Onaylar); Nav "Ayarlar"

## Now (ÜRÜNLEŞME — içerik kütüphanesi)

- [x] İçerik kütüphanesi (/library — kaydet/aç/sil)  (77806a9)

### Done (ürünleşme v1):
- [x] API rate-limit (IP-bazlı, 20/dk → 429)  (3ecc17a)
- [x] Supabase Auth iskeleti (/login + useSession)  (c16cdb8)
- [x] Auth-aware kalıcılık (user_id/RLS)  (c16cdb8)

### Done (governance derinliği v1-v4):
- [x] Compliance/okunabilirlik/voiceFit/safety/erişilebilirlik + A-D not + sign-off + /approvals + marka-kuralları + sektör disclaimer + çoklu-onaycı + QA rapor

### Done (kreatif denetim v1):
- [x] Reklam limit denetimi (platform karakter sınırları)  (1d00374)
- [x] SEO audit/skor  (c76e5e9)
- [x] E-posta deliverability lint (lintEmail)  (6aaf38b)
- [x] Topluluk triyaj (triageComment + escalate)  (6aaf38b)

### Done (kreatif katman v1):
- [x] Reklam metni motoru  (00c53e4)  · SEO  (75ddf13)  · E-posta+Topluluk  (f2baa1e)

### Yazılım-dışı / bloke (dürüst):
- Reklam BÜTÇE yönetimi/optimizasyonu, gerçek yayın (OAuth), metrik çekme/attribution → API/harcama/§4
- İnsan stratejist & hesap yönetimi → yazılım değil

### Done (önceki):
- [x] Model kararı: Sonnet 4.6 + IG hashtag fix  (079930a)

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
