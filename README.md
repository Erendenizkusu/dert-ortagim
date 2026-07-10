# dertdaş

İnsanların dertlerini (anonim ya da kullanıcı adıyla) paylaştığı, aynı yolu yürümüş
başkalarının tavsiye/çözüm bıraktığı, empati odaklı bir dayanışma platformu.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres + Auth + RLS)

## Özellikler (MVP)
- Anonim / kullanıcı adıyla dert paylaşma (gönderi başına toggle)
- Kronolojik ("En Yeniler") ve popüler ("Ben de Yaşıyorum") akış
- Türkçe tam-metin arama + kategori/etiket/durum filtreleri
- Tavsiye (yorum) bırakma; sahibi tavsiyeyi "Derdime derman oldu" olarak işaretler
- Tetikleyici uyarısı (TW) — hassas içerik akışta buzlu görünür
- Dark-mode öncelikli, Tumblr tarzı minimalist arayüz

## Kurulum

### 1. Supabase projesi
1. https://app.supabase.com üzerinden yeni bir proje oluştur.
2. **SQL Editor**'da `supabase/migrations/0001_init.sql` dosyasının tamamını çalıştır.
3. **Authentication → Providers**: E-posta açık. (İstersen hızlı test için
   "Confirm email" seçeneğini kapatabilirsin.) Google girişi için Google provider'ı
   yapılandır ve redirect URL olarak `http://localhost:3000/auth/callback` ekle.

### 2. Ortam değişkenleri
`.env.local` dosyasını gerçek değerlerle doldur (Project Settings → API):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. Çalıştır
```bash
npm install
npm run dev
```
http://localhost:3000

## Mimari notları
- **Anonimlik:** `posts`/`advices` base tablolarında SELECT yalnız satır sahibine açıktır.
  Herkese açık okuma, yazar kimliğini anonimse maskeleyen `posts_public` / `advices_public`
  view'ları üzerinden yapılır → anonim yazarın kimliği hiçbir sorguda sızmaz.
- **Sayaçlar:** `me_too_count` / `advice_count` trigger'larla güncellenir.
- **Çözüm işaretleme:** `cozum_toggle` RPC'si yalnız gönderi sahibinin çağırabileceği
  şekilde güvence altındadır.
