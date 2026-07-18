/**
 * Para birimi formatlama — Zarfım
 *
 * CLAUDE.md: "Intl.NumberFormat(locale, {style:'currency', currency})"
 * Türkçe: tr-TR / TRY, Arapça: ar-SA / SAR (veya kullanıcı tercihine göre)
 */
import { getCurrentLanguage } from '@/lib/i18n';

const LOCALE_MAP: Record<string, string> = {
  tr: 'tr-TR',
  ar: 'ar-SA',
};

const CURRENCY_MAP: Record<string, string> = {
  tr: 'TRY',
  ar: 'SAR',
};

/**
 * Tutarı locale'e uygun para birimi formatında döndürür.
 * @param amount Sayısal tutar
 * @param currency Opsiyonel para birimi kodu (varsayılan: dile göre)
 * @param locale Opsiyonel locale kodu (varsayılan: aktif dil)
 */
export function formatCurrency(
  amount: number,
  currency?: string,
  locale?: string,
): string {
  const lang = getCurrentLanguage();
  const resolvedLocale = locale || LOCALE_MAP[lang] || 'tr-TR';
  const resolvedCurrency = currency || CURRENCY_MAP[lang] || 'TRY';

  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: 'currency',
      currency: resolvedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback
    return `${amount.toLocaleString()} ${resolvedCurrency}`;
  }
}

/**
 * Yüzdeyi locale'e uygun formatta döndürür.
 */
export function formatPercent(value: number, locale?: string): string {
  const lang = getCurrentLanguage();
  const resolvedLocale = locale || LOCALE_MAP[lang] || 'tr-TR';

  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value * 100)}%`;
  }
}
