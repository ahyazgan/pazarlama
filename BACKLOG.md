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

## Later (lower priority — hepsi insan girdisi / dış bağımlılık bekliyor)

- [ ] Trend Enjeksiyonu (web search ile sektörel güncel haber bağlama) — BLOKE: web search altyapısı/anahtarı gerekir
- [ ] Feedback Loop (performans verisi → strateji öğrenir) — BLOKE: gerçek yayın performans verisi gerekir
- [ ] Otomatik yayın (IG Graph API / TikTok API) — BLOKE: platform API erişimi + OAuth (prod yan etki)
- [ ] İçerik takvimi (drag-drop planlama) — DÜŞÜK ÖNCELİK: constitution "manuel yayın yeterli (MVP)" diyor; doğrulanmış ihtiyaç olunca yapılır
- [ ] Daha akıllı (devam): sektör başına platform vurgusu (B2B→LinkedIn, B2C→IG/TikTok ağırlık) + persona-bazlı otomatik açı çeşitliliği
- [ ] Daha akıllı (devam): üretilen paketi otomatik öz-eleştiri turundan geçir (anahtar gerekir)

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
- [x] Sektör zekasını genişlet (kafe/eticaret/hizmet/güzellik terim+hook)  (dd0d106)
- [x] Demo modu — anahtarsız şablon çıktı + uçtan uca önizleme (smoke test geçti)  (ae67b7c)
- [x] CI (GitHub Actions) + Constitution spec'i repoya + README demo/CI  (525d38e)
- [x] Daha akıllı: Strateji Engine aktif önerisi (açı+tip+gerekçe) + anti-generic prompt beyni  (92311a7)

-----

## Notes / blockers (anything needing human eyes)

- Önceki BACKLOG içeriği (futbol karar-uygulaması: La Liga, return_to_play/minutes_management motorları, /decisions, sidebar) bu repoya ait DEĞİL; ayrı "manager2" projesinin backlog'uydu. Bu repo Content OS. Düzeltildi.
- Gerçek (Claude) üretimi ANTHROPIC_API_KEY gerektirir. Anahtarsız tam akış için Kampanya ekranında "Demo modu" kullanılabilir — şablon çıktı, Claude çağrılmaz (smoke test geçti, ae67b7c).
