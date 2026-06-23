# BACKLOG.md — Work Queue

> Claude Code pulls the next unchecked item from here automatically (see CLAUDE.md §7).
> Format: `- [ ] <goal>` + `Done when:` line. Check off with commit SHA.

-----

## Now (KAMPANYA — tek gönderiden koordineli seriye)

- [x] Plan → gerçek kampanya üretici: tek tıkla N koordineli gönderi üret + kütüphane/takvim + birlikte göster  (1afde1d)

- [x] Kampanya teslim paketi — tüm gönderiler tek markdown dosyada + çıktıda indir  (a8efdfa)

- [x] Kampanya üretiminde ajan ekibi turu seçeneği — her gönderi üret→eleştir→düzelt  (04ed8cd)

### Next (kampanya derinleşmesi):
- [ ] Kampanya teslim paketine QA/governance özeti ekle

-----

## Now (ÇOK-SEKTÖRLÜ SaaS — her sektör gerçekten uzman)

- [x] 4 sektöre (kafe/e-ticaret/hizmet/güzellik) derin bilgi tabanı + tüm-sektör eksiksizlik testi  (9c0c1bc)

### Done (sektör derinleşmesi):
- [x] Sektör-özel örnek marka presetleri (5 sektör) + marka sayfasında preset seçici  (a1670d5)
- [x] "Neden bu içerik?" kanıt-temelli gerekçe paneli (terim/imza/kanıt/yasak/mevzuat/benchmark)  (e1aa43f)

### Next (sektör derinleşmesi):
- [ ] Yeni sektörler (sağlık/eğitim/emlak) — talep gelince

-----

## Now (ÖĞRENME — sistem görünür şekilde akıllanır)

- [x] /insights performans panosu — takvim metriklerinden açı/içerik-tipi performansı + öneriler  (91a955a)

### Done (öğrenme derinleşmesi):
- [x] Insights önerilerini create ekranında göster — açı seçiminde "geçmişte en iyi %X" rozeti  (b67ab87)
- [x] İçerik sütunu (pillar) bazlı performans — CalendarEntry.pillar + panoda kırılım  (f46c454)
- [x] Zaman serisi: haftalık etkileşim trendi  (f46c454)

-----

## Now (ÜRÜNLEŞME / ONBOARDING — değeri tek akışta kanıtla)

- [x] Anasayfa hızlı başlangıç — tek tıkla örnek marka + ajan ekibi demo turu → çıktı (anahtarsız)  (d4f4e89)

### Done (onboarding/UX):
- [x] Boş-durum rehberi: ortak NeedBrand bileşeni — 6 sayfada tek tıkla örnek marka yükle / kendi markanı oluştur  (9ee3af8)
- [x] Çıktı ekranında demo→"kendi markanı oluştur" dönüşüm CTA'sı  (6335b9f)
- [x] Mobil gezinme — hamburger + panel zaten vardı; aktif-link vurgusu + backdrop eklendi  (9ee3af8)

-----

## Now (AJAN EKİBİ — pazarlama uzman ekibi: üret→eleştir→düzelt)

- [x] Faz 1: orkestratör çekirdeği — evaluatePackage (deterministik editör) + shouldRevise + runAgentTeam (DI generate) + testler  (71acca8)
- [x] Faz 1: UI — create'te "ekip turu" toggle + output'ta ekip raporu (pipeline + öncesi/sonrası skor)  (ef08e87)

### Done (ajan ekibi derinleşmesi v2):
- [x] Çok-turlu düzeltme — eşiğe/tur sınırına dek döngü, en iyiyi koru, ilerleme yoksa dur (eşik+tur UI)  (4b3c946)
- [x] Stratejist ajanı — zincirin başında konuya en uygun açıyı seçer (recommendAngle)  (e8183bc)
- [x] Çok-persona ekip turu (submitAll) + persona-başı ekip raporu  (c26f093)

- [x] Editör ajanı otomatik yükselir — anahtar varsa LLM eleştirisi (/api/critique), yoksa deterministik  (1e19dbf)

- [x] Platform-bazlı düzeltme hedefleme — en zayıf platformu bul, düzeltmeyi oraya yönelt  (21139d3)

### Next (ajan ekibi derinleşmesi):
- [ ] Araştırmacı ajanını zincire ekle (research→strateji→copy→editör) — BLOKE: web_search anahtarı
- [ ] Anahtar gelince LLM editörü uçtan uca doğrula (Haiku ile)

-----

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
- [x] İçerik takvimi (drag-drop) — kartı gün başlığına sürükle → reschedule  (3cf37b2)

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
