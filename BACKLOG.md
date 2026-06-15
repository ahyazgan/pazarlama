# BACKLOG.md — Work Queue

> Claude Code pulls the next unchecked item from here automatically (see CLAUDE.md §7).
> Format per item:
>
> - [ ] <short goal>
>   Done when: <one concrete, checkable condition>
>
> Check off completed items with the commit SHA:  - [x] <goal>  (abc1234)
> Append new sub-tasks here instead of stopping to ask.

-----

## Now (work top to bottom, don’t pause between items)

- [ ] Verification chain: ESLint + Vitest kurulumu
  Done when: `npm run lint` ve `npm test` çalışır + yeşil; tsc + build hâlâ temiz; committed.
- [ ] Unit testler: prompt enjeksiyonu + sektör zekası
  Done when: prompt'un marka beyni (yasak kelime, persona acısı, rakam) + sektör (terminoloji, hook) enjekte ettiğini ve içerik karışımı toplamlarını doğrulayan testler yeşil; committed.
- [ ] İçerik Hafızası (tekrarı önleme — Faz 2)
  Done when: üretilen paketler localStorage geçmişine yazılır; Kampanya ekranında aynı konu+açı daha önce üretildiyse uyarı gösterilir; test + build temiz; committed.
- [ ] Hook kütüphanesini Kampanya ekranında yüzeye çıkar (Faz 2)
  Done when: seçili sektörün hook formülleri çip olarak gösterilir, tıklayınca konuya şablon/ilham olarak eklenir; build temiz; committed.

-----

## Next (pull these once “Now” is clear)

- [ ] "Tüm personalar için üret" — her persona ayrı açı (Constitution Katman 3)
  Done when: tek tıkla her persona için ayrı paket üretilir, çıktıda persona sekmeleriyle gösterilir; committed.
- [ ] Çıktı: paketi tek dosya (JSON/markdown) olarak dışa aktar
  Done when: çıktı ekranından tüm paket indirilebilir; committed.

-----

## Later (lower priority — only if Now + Next clear)

- [ ] Supabase kalıcı kayıt (brands + content_packages) — env varsa
- [ ] Trend Enjeksiyonu (web search ile sektörel güncel haber bağlama)
- [ ] Feedback Loop (performans verisi → strateji öğrenir)
- [ ] Otomatik yayın (IG Graph API / TikTok API)
- [ ] İçerik takvimi (drag-drop planlama)
- [ ] Sektör terminoloji sözlüklerini genişlet (kafe/eticaret/hizmet/güzellik tam doldur)

-----

## Done (archive — keep last ~10 for context)

- [x] Content OS MVP iskeleti: marka beyni + sektör zekası → içerik paketi  (58e243f)
- [x] Otonomi protokolü (CLAUDE.md) + Content OS backlog'u  (önceki commit)

-----

## Notes / blockers (anything needing human eyes)

- Önceki BACKLOG içeriği (futbol karar-uygulaması: La Liga, return_to_play/minutes_management motorları, /decisions, sidebar) bu repoya ait DEĞİL; ayrı "manager2" projesinin backlog'uydu. Bu repo Content OS. Düzeltildi.
- Üretim endpoint'i ANTHROPIC_API_KEY gerektirir; uçtan uca içerik üretimi yalnızca anahtar varken doğrulanabilir.
