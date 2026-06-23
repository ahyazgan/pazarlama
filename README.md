# Content OS

Herhangi bir marka sahibinin kendi markasını tanıtıp **sektöre özel, yayına hazır sosyal medya içerik paketi** (metin + video script + görsel prompt) aldığı SaaS platformu. İlk test kullanıcısı: **Hammaddem** (B2B inşaat malzemesi pazaryeri) — ama sistem markadan ve sektörden bağımsız çalışır.

> Generic içerik = ölüm. Bu aracın varlık sebebi, AI'ı generic olmaktan çıkaran **marka beyni + sektör zekası** katmanıdır.

## Mimari (4 katman)

1. **Marka Beyni** — kimlik + ses + kitle + kanıt (kullanıcı doldurur) + sektör (otomatik)
2. **Strateji Engine** — içerik karışımı (sektöre göre oran) + açı üretici (5 evrensel açı)
3. **Üretim Pipeline** — Platform DNA: aynı mesaj → IG / TikTok / LinkedIn / X dilinde
4. **Çıktı + Takvim** — platform sekmeli görünüm + kopyala (manuel yayın, MVP)

## Teknik Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind
- AI: Anthropic Claude API — üretim modeli `claude-sonnet-4-6` (env ile değiştirilebilir), structured output (JSON)
- DB/Auth: Supabase (opsiyonel — yoksa Marka Beyni `localStorage`'da tutulur)

## Kurulum

```bash
npm install
cp .env.example .env.local   # ANTHROPIC_API_KEY zorunlu
npm run dev
```

`http://localhost:3000` → **Marka Profili** doldur → **Kampanya Oluştur** → **Çıktı**.

### Anahtarsız deneme (Demo modu)

`ANTHROPIC_API_KEY` olmadan tüm akışı denemek için Kampanya ekranında **"Demo modu"** kutusunu işaretle. Marka beyni + sektör + konu enjekte edilmiş **şablon** çıktı üretilir (Claude çağrılmaz). Gerçek üretim kalitesi için anahtar gerekir.

### Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | evet (üretim için) | Claude API anahtarı |
| `ANTHROPIC_MODEL` | hayır | Varsayılan `claude-sonnet-4-6` |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | hayır | Verilirse Supabase'e de yazılır |

### Supabase (opsiyonel)

`supabase/schema.sql` dosyasını Supabase SQL Editor'da çalıştır. `sector_intelligence` tablosuna sadece **inşaat** seed'i eklenir (Faz 2'de zenginleşir).

## Ekran akışı (3 ekran)

1. `/brand` — Marka Beyni formu (5 katman, sektör dropdown). Bir kez doldur.
2. `/create` — Konu + içerik tipi + açı + persona seçimi.
3. `/output` — Platform sekmeleri (IG/TikTok/LinkedIn/X) + kopyala butonları + görsel prompt.

## Doğrulama

```bash
npm run typecheck   # tsc
npm run lint        # eslint (flat config)
npm test            # vitest (182 test)
npm run build       # next build
```

Her push'ta GitHub Actions (`.github/workflows/ci.yml`) bu zinciri çalıştırır. Ürün spesifikasyonu: [`docs/CONSTITUTION.md`](docs/CONSTITUTION.md).

## Generic'lik nasıl kırılır?

Her üretimde `src/lib/prompt.ts`, marka beynini (kişilik, ses, yasak kelimeler, persona acısı, gerçek rakamlar) **ve** sektör zekasını (`src/lib/sectors.ts`: terminoloji + hook formülleri + içerik karışımı) prompt'a enjekte eder. "Ton: profesyonel" demekle yetinmez.

## Yol haritası (Faz 2)

Sektör terminoloji otomasyonu · hook kütüphanesi zenginleşmesi · trend enjeksiyonu (web search) · içerik hafızası · feedback loop · otomatik yayın (IG/TikTok API) · drag-drop takvim.
