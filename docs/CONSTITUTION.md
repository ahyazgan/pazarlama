# Content OS — Proje Constitution

> **Tek cümle:** Herhangi bir marka sahibinin siteye gelip kendi markasını tanıttığı ve sektöre özel, yayına hazır sosyal medya içerik paketi (metin + video script + görsel prompt) aldığı SaaS platformu.

> **İlk test kullanıcısı:** Hammaddem (B2B inşaat malzemesi pazaryeri). Ama sistem markadan ve sektörden bağımsız çalışır.

> Bu belge ürünün kaynak-doğruluk spesifikasyonudur. Kod kararları buna dayanır.

-----

## 0. Felsefe & Kurallar

1. **Generic içerik = ölüm.** Bu aracın tek varlık sebebi, AI'ı generic olmaktan çıkaran "marka beyni + sektör zekâsı" katmanıdır. Buradan taviz verilmez.
2. **MVP çalışmalı + 1 gerçek kullanıcı (Hammaddem) memnun olmalı.** Gerisi büyüdükçe gelir.
3. **Önce iskelet ayakta dursun.** Her şeyi aynı anda kodlama. Çekirdek → katman katman.
4. **Sektör algılanır, sabit kodlanmaz.** Kullanıcı sektörünü seçer; hook'lar, içerik karışımı, terminoloji buna göre dinamik gelir.
5. **Manuel yayın yeterli (MVP).** Otomatik IG/TikTok API entegrasyonu Faz 2'dir. Önce çekirdek değeri kanıtla.

-----

## 1. Sistem Mimarisi (4 Katman)

```
KATMAN 1: MARKA BEYNİ (Context Engine)  → "Marka kim, nasıl konuşur, kime satar?"
        ↓
KATMAN 2: STRATEJİ ENGINE               → "Ne anlatmalı? Hangi açı, hangi hook?"
        ↓
KATMAN 3: ÜRETİM PIPELINE (Platform DNA) → "Aynı mesaj → IG, TikTok, LinkedIn, X dilinde"
        ↓
KATMAN 4: ÇIKTI + TAKVİM                → "Kopyala, planla (manuel)"
```

-----

## 2. Derinlik 1 — Marka Beyni (5 katman)

1. **Kimlik:** marka adı + sektör (dropdown), misyon, değer önerisi, kişilik (5 sıfat)
2. **Ses:** ton (0-10 resmi↔samimi), cümle yapısı, yasak kelimeler, imza ifadeler
3. **Kitle:** persona'lar (ad, acı, motivasyon) — her persona için AYRI içerik açısı
4. **Sektör (OTOMATİK):** sistem sektöre göre yükler — terminoloji + mevsimsellik
5. **Kanıt:** gerçek rakamlar, vaka örnekleri, sosyal kanıt/referanslar

Katman 1-3 ve 5 kullanıcı doldurur; Katman 4 sistem üretir. Marka beyni **her üretimde** prompt'a enjekte edilir.

-----

## 3. Derinlik 2 — Strateji Engine

- **İçerik Karışımı:** sektöre göre oran (B2B inşaat: %50 değer, %30 ürün, %20 kanıt)
- **Hook Kütüphanesi:** sektör-spesifik kanıtlanmış formüller (moat / network etkisi)
- **Açı Üretici (evrensel 5 açı):** korku, kazanç, sosyal kanıt, eğitici, karşıtlık

-----

## 4. Derinlik 3 — Üretim Pipeline (Platform DNA)

Tek fikir → her platformun fiziğine uyarlanır:
- **Instagram:** ~125 karakter caption + ilk yorum hashtag + kare görsel prompt (#E8650A) + alt-text
- **TikTok/Reels:** 0-3sn hook + shot-by-shot sahne dökümü + trend ses + comment-bait CTA
- **LinkedIn:** güçlü ilk satır + beyaz boşluk + sektör insight + tartışma sorusu (B2B otorite)
- **X:** çengel + değer + CTA thread'i

-----

## 5. MVP Kapsamı

**VAR:** Marka Beyni (form→JSON), Strateji Engine (içerik karışımı + 5 açı), Üretim Pipeline (metin + video script + görsel prompt), Çıktı ekranı (platform sekmeleri + kopyala).

**FAZ 2:** Sektör terminoloji otomasyonu, hook kütüphanesi zenginleşmesi, trend enjeksiyonu (web search), içerik hafızası, feedback loop, otomatik yayın (IG/TikTok API), içerik takvimi.

-----

## 6. Teknik Stack

Next.js (App Router) + TypeScript · Shadcn/UI + Tailwind · Anthropic Claude API (`claude-sonnet-4-6`) · Supabase (Postgres + Auth) · Zustand (gerekirse) · Vercel.

-----

## 7. Veri Modeli (Supabase)

`brands` (marka beyni jsonb katmanları), `content_packages` (üretilen paketler), `sector_intelligence` (sistem verisi). Bkz. `supabase/schema.sql`.

-----

## 8. AI Üretim Mantığı

Üretim isteğinde prompt sırayla kurulur: `[SYSTEM sektör uzmanı]` → `[MARKA BEYNİ ENJEKSİYONU]` → `[SEKTÖR ZEKASI ENJEKSİYONU]` → `[GÖREV: konu/tip/açı]` → 4 platform için JSON çıktı. AI'a **JSON formatı zorlatılır** (parse edilebilirlik). Marka beyni + sektör zekası **her istekte** enjekte edilir — generic'lik buradan kırılır. Bkz. `src/lib/prompt.ts`.

-----

## 9. Ekran Akışı (3 ekran)

1. **Marka Profili** (`/brand`) — Marka Beyni formu, bir kez doldur.
2. **Kampanya Oluştur** (`/create`) — konu + içerik tipi + açı + persona.
3. **Çıktı** (`/output`) — platform sekmeleri + kopyala + görsel prompt + dışa aktar.

-----

## 10. Go-To-Market

Hammaddem için kullan → gerçek içerik üret → IG/LinkedIn'de büyü → "nasıl yapıyorsunuz?" → waitlist → sektör sektör genişle (her sektör = yeni hook kütüphanesi = derinleşen moat).

-----

## 11. Build Sırası

1. Supabase şeması + auth · 2. Marka Beyni formu · 3. `sector_intelligence` (sadece inşaat seed) · 4. Üretim endpoint'i (Claude + enjeksiyon, JSON) · 5. Çıktı ekranı · 6. Uçtan uca test (Hammaddem) · 7. Faz 2.

-----

**Hatırlatma:** İlk hedef mükemmellik değil, **uçtan uca çalışan + Hammaddem'i memnun eden** bir MVP. Generic'liği kıran marka beyni + sektör zekası katmanından asla taviz verme; gerisi iteratif gelir.
