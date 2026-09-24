import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentLanguage } from '@/lib/i18n';

export interface CurrencyItem {
  code: string;
  symbol: string;
  name: string;
  label: string;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyItem> = {
  TRY: { code: 'TRY', symbol: '₺', name: 'Türk Lirası', label: '₺ TRY — Türk Lirası' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', label: '$ USD — US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', label: '€ EUR — Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', label: '£ GBP — British Pound' },
  SAR: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', label: 'ر.س SAR — ريال سعودي' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', label: 'د.إ AED — درهم إماراتي' },
};

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
}

export function getDefaultCurrency(): CurrencyCode {
  const lang = getCurrentLanguage();
  if (lang === 'ar') return 'SAR';
  if (lang === 'en') return 'USD';
  return 'TRY';
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: getDefaultCurrency(),
      setCurrency: (currency: CurrencyCode) => set({ currency }),
    }),
    {
      name: '@zarfim_currency_store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
