# 📬 Zarfım — Zarf Usulü Bütçe Yönetimi (Envelope Budgeting)

**Zarfım**, kişisel bütçenizi zarf usulü yöntemiyle (envelope budgeting) kolayca yönetmenizi sağlayan modern, şık ve çift dilli (Türkçe & Arapça) bir mobil uygulamadır.

---

## 🌟 Öne Çıkan Özellikler

- **✉️ Zarf Usulü Bütçeleme:** Harcama kategorilerinize özel bütçe limitleri belirleyin ve harcamalarınızı anlık takip edin.
- **🔐 Esnek Kimlik Doğrulama:** E-posta/Şifre, **Apple ile Giriş** ve **Google ile Giriş** seçenekleri.
- **💎 Freemium & Premium (RevenueCat):** 
  - Ücretsiz planda 3 adet zarf hakkı.
  - Premium üyeler için sınırsız zarf, aile paylaşımı (household), gelişmiş raporlama ve dışa aktarma (CSV).
- **🌍 Tam i18n & RTL Desteği:** Türkçe ve Arapça (sağdan sola - RTL) tam dil ve yerelleştirme desteği.
- **📊 Gelişmiş Raporlar:** Victory Native grafik altyapısı ile kategori kırılımları ve harcama trendleri.
- **🗑️ Hesap & Veri Güvenliği (Guideline 5.1.1v):** Kullanıcı dostu, 2 aşamalı hesap ve tüm verileri sunucudan kalıcı olarak silme özelliği.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

- **Frontend:** React Native, Expo (~57.0), TypeScript, Expo Router (File-based Routing)
- **State & Server State:** Zustand, TanStack Query (React Query)
- **Backend & Auth:** Supabase (Postgres, Auth, Edge Functions, RLS)
- **Abonelik & Ödeme:** RevenueCat (react-native-purchases)
- **Grafik & UI:** Victory Native XL, React Native Reanimated, Custom Paper & Ink Theme System

---

## 🚀 Başlangıç & Kurulum

### 1. Depoyu klonlayın ve bağımlılıkları yükleyin:
```bash
git clone https://github.com/bunyamin027/zarfim.git
cd zarfim
npm install
```

### 2. Ortam Değişkenleri (.env)
Kök dizinde `.env` dosyasını oluşturun ve gerekli değişkenleri tanımlayın:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_REVENUECAT_APPLE_KEY=your-revenuecat-apple-key
EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=your-revenuecat-google-key
```

### 3. Geliştirme Sunucusunu Başlatın:
```bash
# Expo dev server
npx expo start

# iOS Simülatöründe çalıştırma
npx expo run:ios

# Android Emülatöründe çalıştırma
npx expo run:android
```

---

## 📱 App Store & Google Play Dağıtımı

EAS (Expo Application Services) kullanarak derleme ve dağıtım:

```bash
# iOS derlemesi oluşturma
eas build --platform ios

# Android derlemesi oluşturma (AAB)
eas build --platform android
```

---

## 📜 Lisans

Bu proje özel lisans altındadır. Tüm hakları saklıdır.
