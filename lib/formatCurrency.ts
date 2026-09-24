/**
 * Para birimi formatlama — Zarfım
 *
 * CLAUDE.md: "Intl.NumberFormat(locale, {style:'currency', currency})"
 * Türkçe: tr-TR / TRY (₺), Arapça: ar-SA / SAR (ر.س)
 */
import { getCurrentLanguage } from '@/lib/i18n';
import { useCurrencyStore, SUPPORTED_CURRENCIES } from '@/store/currency';

const LOCALE_MAP: Record<string, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  ar: 'ar-SA',
};

function resolveLang(raw?: string): 'tr' | 'en' | 'ar' {
  if (raw?.startsWith('ar')) return 'ar';
  if (raw?.startsWith('en')) return 'en';
  return 'tr';
}

/**
 * Aktif para birimi simgesini döndürür (₺, $, €, £, ر.س veya د.إ)
 */
export function getCurrencySymbol(customCurrency?: string): string {
  const code = customCurrency || useCurrencyStore.getState().currency;
  return SUPPORTED_CURRENCIES[code]?.symbol || '$';
}

/**
 * Tutarı seçili para birimine göre formatlar.
 * @param amount Sayısal tutar
 * @param currency Opsiyonel para birimi kodu (varsayılan: seçili para birimi)
 * @param locale Opsiyonel locale kodu (varsayılan: aktif dil)
 */
export function formatCurrency(
  amount: number,
  currency?: string,
  locale?: string,
): string {
  const selectedCurrency = currency || useCurrencyStore.getState().currency || 'TRY';
  const lang = resolveLang(locale || getCurrentLanguage());
  const resolvedLocale = locale || (lang === 'ar' ? 'ar-SA' : (lang === 'tr' ? 'tr-TR' : 'en-US'));

  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    const symbol = SUPPORTED_CURRENCIES[selectedCurrency]?.symbol || getCurrencySymbol();
    return `${amount.toLocaleString()} ${symbol}`;
  }
}

/**
 * Yüzdeyi locale'e uygun formatta döndürür.
 */
export function formatPercent(value: number, locale?: string): string {
  const lang = resolveLang(locale || getCurrentLanguage());
  const resolvedLocale = locale || LOCALE_MAP[lang] || 'tr-TR';

  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `%${Math.round(value * 100)}`;
  }
}
