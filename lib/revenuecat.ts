/**
 * RevenueCat Client — Zarfım
 *
 * RevenueCat SDK başlatma ve yardımcı fonksiyonlar.
 * API key'ler .env'den okunur; yoksa mock mod.
 *
 * NOT: react-native-purchases Expo Go'da ÇALIŞMAZ.
 * EAS Dev Build veya prebuild gerektirir.
 * Yapılandırılmamışken tüm fonksiyonlar güvenli şekilde
 * mock veri döndürür.
 */
import { Platform } from 'react-native';

// Lazy import — web'de ve Expo Go'da crash engelleme
let Purchases: typeof import('react-native-purchases').default | null = null;

try {
  Purchases = require('react-native-purchases').default;
} catch {
  // Web veya Expo Go'da modül yüklenemez — mock mod
  Purchases = null;
}

const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || '';
const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || '';

export const isRevenueCatConfigured =
  !!Purchases && (!!iosKey || !!androidKey);

// ─── Ürün tanımları ──────────────────────────────
export const PRODUCT_ID = 'zarfim_premium_monthly';
export const ENTITLEMENT_ID = 'premium';

// ─── Mock offerings (yapılandırılmamışken) ────────
export interface MockPackage {
  identifier: string;
  product: {
    title: string;
    description: string;
    priceString: string;
    price: number;
    currencyCode: string;
  };
}

import { getCurrentLanguage } from '@/lib/i18n';

export function getMockPriceString(locale?: string): string {
  const rawLang = locale || getCurrentLanguage();
  if (rawLang?.startsWith('ar')) return 'ر.س 69,99';
  if (rawLang?.startsWith('en')) return '$2.99';
  return '₺69,99';
}

export const MOCK_OFFERING: MockPackage = {
  identifier: '$rc_monthly',
  product: {
    title: 'Zarfım Premium',
    description: 'Sınırsız zarf, aile paylaşımı, raporlama',
    priceString: '₺69,99',
    price: 69.99,
    currencyCode: 'TRY',
  },
};

// ─── SDK Başlatma ─────────────────────────────────
let isConfigured = false;

export async function configureRevenueCat(appUserId?: string): Promise<void> {
  if (!Purchases || isConfigured) return;

  const apiKey = Platform.OS === 'ios' ? iosKey : androidKey;
  if (!apiKey) return;

  try {
    Purchases.configure({
      apiKey,
      appUserID: appUserId || undefined,
    });
    isConfigured = true;
  } catch (error) {
    console.warn('RevenueCat configure error:', error);
  }
}

// ─── Offerings çekme ─────────────────────────────
export async function getOfferings() {
  if (!Purchases || !isConfigured) return null;

  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.warn('RevenueCat getOfferings error:', error);
    return null;
  }
}

// ─── Satın alma ──────────────────────────────────
export async function purchasePackage(pkg: any) {
  if (!Purchases || !isConfigured) {
    throw new Error('RevenueCat yapılandırılmamış');
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: true, isPremium, customerInfo };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, isPremium: false, cancelled: true };
    }
    throw error;
  }
}

// ─── Restore purchases ──────────────────────────
export async function restorePurchases() {
  if (!Purchases || !isConfigured) {
    throw new Error('RevenueCat yapılandırılmamış');
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { isPremium, customerInfo };
  } catch (error) {
    console.warn('RevenueCat restore error:', error);
    throw error;
  }
}

// ─── Mevcut entitlement kontrolü ─────────────────
export async function checkPremiumStatus(): Promise<boolean> {
  if (!Purchases || !isConfigured) return false;

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}
