# BACKLOG.md — Work Queue (Content OS)

> Pull the next unchecked item top-to-bottom. Check off with the commit SHA.
> Format: `- [ ] <goal>` + `Done when:` line.

-----

## Now (work top to bottom, don't pause between items)

- [ ] Verification chain: ESLint + Vitest kurulumu
  Done when: `npm run lint` ve `npm test` çalışır ve yeşil; tsc + build hâlâ temiz; committed.
- [ ] Unit testler: prompt enjeksiyonu + sektör zekası
  Done when: prompt'un marka beyni (yasak kelime, persona acısı, rakam) + sektör (terminoloji, hook) enjekte ettiğini ve içerik karışımı toplamlarının doğruluğunu doğrulayan testler yeşil; committed.
- [ ] İçerik Hafızası (tekrarı önleme — Faz 2)
  Done when: üretilen paketler localStorage geçmişine yazılır; Kampanya ekranında aynı konu+açı daha önce üretildiyse uyarı gösterilir; test + build temiz; committed.
- [ ] Hook kütüphanesini Kampanya ekranında yüzeye çıkar (Faz 2)
  Done when: seçili sektörün hook formülleri çip olarak gösterilir, tıklayınca konuya ilham/şablon olarak eklenir; build temiz; committed.

-----

## Next (pull once Now is clear)

- [ ] "Tüm personalar için üret" — her persona ayrı açı (Constitution Katman 3)
  Done when: tek tıkla her persona için ayrı paket üretilir ve çıktıda persona sekmeleriyle gösterilir; committed.
- [ ] Supabase kalıcı kayıt (brands + content_packages) — yapılandırıldıysa
  Done when: env varsa marka ve üretilen paket Supabase'e yazılır (best-effort), yoksa localStorage; committed.
- [ ] Çıktı: paketi JSON/markdown olarak dışa aktar
  Done when: çıktı ekranından tüm paket tek dosya olarak indirilebilir; committed.

-----

## Later (lower priority)

- [ ] Trend Enjeksiyonu (web search ile sektörel güncel haber bağlama)
- [ ] Feedback Loop (performans verisi → strateji öğrenir)
- [ ] Otomatik yayın (IG Graph API / TikTok API)
- [ ] İçerik takvimi (drag-drop planlama)
- [ ] Sektör terminoloji sözlüklerini genişlet (kafe/eticaret/hizmet/güzellik tam doldur)
- [ ] Supabase Auth (çoklu kullanıcı)

-----

## Done (archive — keep last ~10)

- [x] Content OS MVP iskeleti: marka beyni + sektör zekası → içerik paketi  (58e243f)

-----

## Notes / blockers
- BACKLOG'un önceki içeriği (futbol karar-uygulaması: La Liga, return_to_play/minutes_management motorları, /decisions, sidebar) bu repoya ait DEĞİL — ayrı "manager2" projesinin backlog'u; pazarlama reposu Content OS. GitHub scope yalnızca ahyazgan/pazarlama; manager2 erişilebilir değil. Content OS Faz 2'ye odaklanıldı.
- Üretim endpoint'i ANTHROPIC_API_KEY gerektirir; uçtan uca içerik üretimi yalnızca anahtar varken doğrulanabilir.
