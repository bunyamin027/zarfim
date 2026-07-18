# Zarfım — Ürün ve Mimari Şartnamesi

Bu dosya bir AI kodlama ajanına (Claude Opus, Antigravity, Claude Code vb.) proje bağlamı olarak verilmek üzere yazıldı. Repo kökünde `CLAUDE.md` olarak tutulması önerilir — çoğu ajan bu dosyayı her oturumda otomatik okur, böylece mimariyi her seferinde yeniden anlatmana gerek kalmaz (kredi tasarrufu).

## 1. Ürün vizyonu

Zarfım, Türkçe ve Arapça konuşan kullanıcılar için zarf usulü (envelope budgeting) bir kişisel bütçe uygulaması. Her harcama kategorisi bir "zarf"; kullanıcı zarfa ayırdığı bütçeyi harcadıkça zarf dolar. Görsel kimlik posta/pul temalı (bkz. bölüm 9).

- Hedef: 1M indirme, 100K ücretli abone, $2/ay
- İş modeli: freemium — 3 zarfla ücretsiz kullanım, premium'da sınırsız zarf + aile paylaşımı + raporlama
- Öncelikli pazar: Türkiye (soft launch), sonra Arapça pazar

## 2. Teknoloji yığını

| Katman | Seçim | Neden |
|---|---|---|
| Mobil frontend | React Native + Expo (TypeScript), Expo Router | Tek kod tabanından iOS+Android, EAS ile OTA güncelleme, AI ajanlarının en iyi bildiği RN ekosistemi |
| State/server state | Zustand + TanStack Query | Basit, az boilerplate, ekibin orta seviye teknik yetkinliğine uygun |
| Backend | Supabase (Postgres + Auth + Row Level Security + Edge Functions) | Kendi backend'i yönetmeden gerçek bir backend; ücretsiz katman büyümeye yetiyor |
| Ödeme | RevenueCat (StoreKit + Google Play Billing üzerine) | Apple/Google dijital abonelikte kendi IAP'lerini zorunlu kılıyor; RevenueCat receipt doğrulama ve cross-platform entitlement senkronunu tek SDK'ya indiriyor |
| i18n | react-i18next + expo-localization + RN'nin yerleşik `I18nManager` (RTL) | Arapça için gerçek RTL desteği gerekiyor, sonradan eklemek pahalı |
| Grafik | Victory Native XL (SVG tabanlı) | RN'de performanslı, tema token'larıyla uyumlu |
| Analitik | PostHog (self-host edilebilir, ücretsiz katman var) | indirme→deneme→ödeme hunisini ölçmek hedefin merkezinde, gün 1'den kurulmalı |
| Push bildirim | Expo Notifications | Bütçe hatırlatmaları, retention için |

## 3. Yüksek seviye mimari

```
[RN/Expo App]
   ├─ Auth (Supabase Auth: email + Apple/Google Sign-In)
   ├─ Local cache (TanStack Query + AsyncStorage)
   ├─ RevenueCat SDK ──► App Store / Play Store (satın alma)
   │        └─ webhook ──► Supabase Edge Function ──► subscriptions tablosu
   └─ Supabase client ──► Postgres (RLS ile kullanıcı verisi izolasyonu)
```

Kural: finansal veri olduğu için her tabloda Row Level Security zorunlu — kullanıcı sadece kendi (veya kendi household'ının) satırlarını görebilmeli. Ajana bunu açıkça hatırlat.

## 4. Veri modeli (Postgres / Supabase)

- **users** — id, email, locale (tr/ar), currency, created_at
- **households** — id, name (aile paylaşımı, premium özellik)
- **household_members** — household_id, user_id, role
- **envelopes** — id, owner_id (user veya household), name, icon, monthly_limit, color, is_recurring, sort_order
- **transactions** — id, envelope_id, amount, merchant, note, occurred_at, created_at
- **subscriptions** — id, user_id, revenuecat_app_user_id, tier (free/premium), status, current_period_end

Free katmanda `envelopes` sayısı 3 ile sınırlı — bu sınır client'ta değil, Edge Function/RLS seviyesinde de doğrulanmalı (client tarafı kontrol tek başına yeterli değil, atlatılabilir).

## 5. Ekranlar

Önceki tasarım mockup'ında netleşen altı ekran + eklenen destek ekranları:

1. **Onboarding** — değer önerisini tek ekranda anlat, "Başla" / "Zaten hesabım var"
2. **Auth** — email veya Apple/Google ile giriş (Apple girişi App Store zorunluluğu — email/Google varsa Apple da şart)
3. **Dashboard (Bu Ay)** — postmark halka (aylık % kullanım), zarf kartları listesi, kilitli zarf önizlemesi (premium teaser)
4. **Zarf detayı** — o zarfın işlem geçmişi, ilerleme çubuğu
5. **Harcama ekle** — tutar + zarf seçimi (büyük tuşlu, hızlı giriş)
6. **Zarf oluştur/düzenle**
7. **Raporlar** — aylık/yıllık grafik, kategori kırılımı (Victory Native)
8. **Ayarlar** — dil değiştir, para birimi, bildirimler, abonelik yönetimi, "restore purchases" (Apple zorunlu tutuyor)
9. **Paywall** — premium özellik listesi, 7 gün deneme, fiyat

## 6. Ödeme / abonelik mimarisi

- Ürün: `zarfim_premium_monthly`, App Store Connect ve Google Play Console'da tanımlanır. **$2 tek fiyat her ülkede geçerli olmaz** — Apple/Google fiyat kademeleri kullanır, yerel satın alma gücüne göre otomatik dönüştürür; bunu ajana ve kendine hatırlat.
- RevenueCat client SDK entegre edilir; `Offerings` üzerinden paywall dinamik çekilir (kod değişmeden fiyat/deneme süresi App Store Connect'ten güncellenebilir)
- RevenueCat webhook → Supabase Edge Function → `subscriptions` tablosunu günceller (satın alma, yenileme, iptal, iade olaylarında)
- Restore purchases akışı zorunlu (cihaz değiştirme senaryosu)
- 7 günlük ücretsiz deneme store konsollarında tanımlanır, kodda değil

## 7. Dil / yerelleştirme mimarisi

- Gün 1'den itibaren **hiçbir metin hardcode edilmeyecek** — tüm string'ler `locales/tr.json`, `locales/ar.json` (ileride `en.json`)
- Arapça için `I18nManager.forceRTL(true)` + tüm flex layout'ların mirror davranışının test edilmesi (ikonlar, ilerleme çubukları, ok yönleri)
- Sayı/para birimi formatlama `Intl.NumberFormat(locale, {style:'currency', currency})` ile — Türkçe `tr-TR`/`TRY`, Arapça bölgeye göre (örn. `ar-SA`)
- Font: Latin için Fraunces + Manrope, Arapça için Cairo (bkz. bölüm 9)

## 8. Grafik & raporlama

- Aylık kategori dağılımı: donut/pasta grafik
- Zaman içinde harcama trendi: çizgi grafik
- Victory Native XL önerilir — RN'de native performans, SVG çıktısı tema renkleriyle kolayca eşleşir
- Free katmanda son 1 aylık veri, premium'da tüm geçmiş + dışa aktarma (CSV)

## 9. Tasarım sistemi

Mockup'tan token'lar (ajana birebir aktarılmalı):

```
--ink: #1C2541       (koyu lacivert, başlıklar/arka plan)
--paper: #EFE6D3      (kraft kağıt, zarf kartları)
--stamp: #C1442D      (pul kırmızısı, ana aksiyon rengi)
--gold: #C9973A       (vurgu, premium)
--sage: #6F8F6A       (bütçede olumlu durum)
Font: Fraunces (display) + Manrope (UI/gövde) + Cairo (Arapça)
İmza bileşen: "zarf kartı" — kesik çizgili (perforasyon) kenarlık + üstte zarf ağzı şekli
```

## 10. Proje klasör yapısı

```
/app                 (Expo Router — dosya bazlı ekranlar)
/components          (EnvelopeCard, PostmarkRing, PrimaryButton, ...)
/lib                 (supabase.ts, revenuecat.ts, i18n.ts)
/store               (zustand store'ları)
/locales             (tr.json, ar.json)
/assets
```

## 11. Geliştirme fazları (vibe-coding sırası)

Ajana tüm uygulamayı tek promptta yaptırmak yerine bu sırayla ilerle — her faz bitince çalıştığını doğrula, sonra sıradakine geç:

1. **İskelet** — Expo projesi, navigasyon, tasarım token'ları, temel bileşenler (mock veriyle)
2. **Veri katmanı** — Supabase şeması, RLS politikaları, auth akışı
3. **Ana ekranlar** — Dashboard, zarf detayı, harcama ekleme (gerçek veriye bağlanır)
4. **Ödeme** — RevenueCat entegrasyonu, paywall, premium kilit mantığı
5. **Yerelleştirme** — i18n kurulumu, tr/ar string'leri, RTL testi
6. **Raporlama** — grafik ekranları
7. **Cila** — animasyonlar, boş durumlar, hata mesajları, store görselleri

## 12. Kredi optimizasyonu kuralları

1. Bu dosyayı repo köküne `CLAUDE.md` olarak koy — ajan otomatik okur, mimariyi tekrar tekrar anlatma
2. "Tüm uygulamayı yap" deme — yukarıdaki fazları tek tek iste, her fazda build/çalıştır, onayla, sonra devam et
3. Tekrarlayan bileşeni bir kere iyi kur (örn. zarf kartı), sonrasında "yukarıdaki `EnvelopeCard` pattern'ini kullan" diye referans ver, yeniden tarif etme
4. Büyük değişiklik öncesi ajana "önce planı yaz, ben onaylayayım, sonra kodla" de — yanlış yönde üretilen kod, plan onayından çok daha pahalı
5. Hata ayıklama promptlarını spesifik tut: dosya adı + hata mesajı + beklenen davranış. "Çalışmıyor, düzelt" gibi genel promptlar ajanın gereksiz yere tüm kod tabanını taramasına sebep olur

## 13. Kopyala-yapıştır başlangıç promptu

```
Bu repoda Zarfım adlı bir React Native (Expo + TypeScript) bütçe uygulaması
geliştireceğiz. Repo kökündeki CLAUDE.md dosyasını oku ve mimariyi, veri
modelini, tasarım token'larını buradan al.

Şimdi sadece Faz 1'i (İskelet) yap:
- Expo Router ile proje yapısını CLAUDE.md bölüm 10'daki gibi kur
- Bölüm 9'daki tasarım token'larını bir theme dosyasında tanımla
- EnvelopeCard, PostmarkRing, PrimaryButton bileşenlerini mock veriyle oluştur
- Dashboard ekranını mock zarf verisiyle göster

Başka bir faza geçme, sadece bunu yap ve bittiğinde ne test etmem
gerektiğini söyle.
```

Sonraki fazlar için aynı formatta ("Şimdi sadece Faz 2'yi yap...") devam et.
