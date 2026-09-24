/**
 * i18n Kurulumu — Zarfım
 *
 * react-i18next + expo-localization.
 * Cihaz dilini algılar, RTL yönünü ayarlar.
 * CLAUDE.md: "Gün 1'den itibaren hiçbir metin hardcode edilmeyecek"
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import tr from '@/locales/tr.json';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

const LANGUAGE_KEY = '@zarfim_language';

// Desteklenen diller
export const SUPPORTED_LANGUAGES = {
  tr: { name: 'Türkçe', nativeName: 'Türkçe', rtl: false },
  en: { name: 'English', nativeName: 'English', rtl: false },
  ar: { name: 'العربية', nativeName: 'العربية', rtl: true },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Cihaz dilini algıla
function getDeviceLanguage(): SupportedLanguage {
  try {
    const locales = getLocales();
    const deviceLang = locales[0]?.languageCode ?? 'tr';
    if (deviceLang === 'ar') return 'ar';
    if (deviceLang === 'en') return 'en';
    return 'tr'; // Varsayılan Türkçe
  } catch {
    return 'tr';
  }
}

// Kaydedilmiş dili oku (senkron fallback)
let cachedLanguage: SupportedLanguage | null = null;

export async function loadSavedLanguage(): Promise<SupportedLanguage> {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved && (saved === 'tr' || saved === 'en' || saved === 'ar')) {
      cachedLanguage = saved as SupportedLanguage;
      return saved as SupportedLanguage;
    }
  } catch {}
  const deviceLang = getDeviceLanguage();
  cachedLanguage = deviceLang;
  return deviceLang;
}

export async function saveLanguage(lang: SupportedLanguage): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    cachedLanguage = lang;
  } catch {}
}

// RTL yönünü ayarla
export function applyRTL(lang: SupportedLanguage): void {
  const isRTL = SUPPORTED_LANGUAGES[lang]?.rtl ?? false;
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
  }
}

// i18n başlatma
i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: cachedLanguage || getDeviceLanguage(),
  fallbackLng: 'tr',
  interpolation: {
    escapeValue: false, // React zaten XSS koruması sağlar
  },
  compatibilityJSON: 'v4',
});

// Dil başlatma — async, root layout'ta çağrılır
export async function initializeLanguage(): Promise<void> {
  const lang = await loadSavedLanguage();
  applyRTL(lang);
  if (i18n.language !== lang) {
    await i18n.changeLanguage(lang);
  }
}

// Dil değiştirme — reload gerektirir (RTL geçişi)
export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
  await saveLanguage(lang);
  applyRTL(lang);
  await i18n.changeLanguage(lang);
}

export function getCurrentLanguage(): SupportedLanguage {
  return (i18n.language as SupportedLanguage) || 'tr';
}

export function isRTL(): boolean {
  return I18nManager.isRTL;
}

export default i18n;
