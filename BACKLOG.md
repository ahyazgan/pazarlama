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

> "Now" temiz. Tamamlanan işler Done arşivinde. Kalan işler "Later"da — çoğu
> dışsal bağımlılık (API anahtarı, web search, IG/TikTok API, gerçek perf verisi)
> gerektirdiğinden insan girdisi olmadan anlamlı doğrulanamaz; yeni yön bekleniyor.

-----

## Later (lower priority — only if Now + Next clear)

- [ ] Trend Enjeksiyonu (web search ile sektörel güncel haber bağlama)
- [ ] Feedback Loop (performans verisi → strateji öğrenir)
- [ ] Otomatik yayın (IG Graph API / TikTok API)
- [ ] İçerik takvimi (drag-drop planlama)
- [ ] Sektör terminoloji sözlüklerini genişlet (kafe/eticaret/hizmet/güzellik tam doldur)

-----

## Done (archive — keep last ~10 for context)

- [x] Content OS MVP iskeleti: marka beyni + sektör zekası → içerik paketi  (58e243f)
- [x] Otonomi protokolü (CLAUDE.md) + Content OS backlog'u
- [x] Verification chain: ESLint + Vitest kurulumu  (ace62e2)
- [x] Unit testler: prompt enjeksiyonu + sektör zekası  (ace62e2)
- [x] İçerik Hafızası (tekrarı önleme — Faz 2)  (43713ae)
- [x] Hook kütüphanesini Kampanya ekranında yüzeye çıkar (Faz 2)  (2194453)
- [x] Çıktı dışa aktarma (markdown + JSON)  (bd9b44a)
- [x] Tüm personalar için ayrı üretim + persona sekmeleri  (759c00d)
- [x] Supabase best-effort kalıcı kayıt (brands + content_packages)  (3fdde81)

-----

## Notes / blockers (anything needing human eyes)

- Önceki BACKLOG içeriği (futbol karar-uygulaması: La Liga, return_to_play/minutes_management motorları, /decisions, sidebar) bu repoya ait DEĞİL; ayrı "manager2" projesinin backlog'uydu. Bu repo Content OS. Düzeltildi.
- Üretim endpoint'i ANTHROPIC_API_KEY gerektirir; uçtan uca içerik üretimi yalnızca anahtar varken doğrulanabilir.
