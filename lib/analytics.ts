/**
 * Analytics Service — Zarfım
 *
 * Google Analytics (Firebase) entegrasyonu.
 *
 * NOT: @react-native-firebase yerel kod içerir ve standart Expo Go içinde çalışmaz.
 * Bu modül ortamı otomatik tespit eder:
 * - Expo Go / Web: Güvenli fallback (konsola debug log basar, çökme yaşanmaz)
 * - EAS Build / Development Build / Production: Gerçek Firebase Analytics SDK kullanılır.
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let analyticsInstance: any = null;

if (!isExpoGo && Platform.OS !== 'web') {
  try {
    const fbAnalytics = require('@react-native-firebase/analytics');
    if (typeof fbAnalytics.getAnalytics === 'function') {
      analyticsInstance = fbAnalytics.getAnalytics();
    } else if (typeof fbAnalytics === 'function') {
      analyticsInstance = fbAnalytics();
    } else if (fbAnalytics.default && typeof fbAnalytics.default === 'function') {
      analyticsInstance = fbAnalytics.default();
    }
    if (analyticsInstance) {
      console.log('[Analytics] Firebase Analytics native modülü başarıyla bağlandı!');
    }
  } catch (error) {
    console.warn('[Analytics] Firebase Analytics native yüklenemedi:', error);
  }
}

/**
 * Genel Analytics olaylarını kaydeder.
 */
export async function logEvent(name: string, params?: Record<string, any>): Promise<void> {
  try {
    if (analyticsInstance) {
      await analyticsInstance.logEvent(name, params);
      console.log(`🔥 [Firebase Analytics Native] Event: "${name}"`, params || '');
    } else if (__DEV__) {
      console.log(`📊 [Analytics Mock] Event: "${name}"`, params || '');
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(`[Analytics] logEvent ("${name}") hatası:`, error);
    }
  }
}

/**
 * Ekran görüntülenme olayını kaydeder.
 */
export async function logScreenView(screenName: string, screenClass?: string): Promise<void> {
  try {
    if (analyticsInstance) {
      await analyticsInstance.logScreenView({
        screen_name: screenName,
        screen_class: screenClass || screenName,
      });
      console.log(`🔥 [Firebase Analytics Native] Screen: "${screenName}"`);
    } else if (__DEV__) {
      console.log(`📊 [Analytics Mock] Screen: "${screenName}"`);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(`[Analytics] logScreenView ("${screenName}") hatası:`, error);
    }
  }
}

/**
 * Kullanıcı kimliğini belirler.
 */
export async function setUserId(userId: string | null): Promise<void> {
  try {
    if (analyticsInstance) {
      await analyticsInstance.setUserId(userId);
    } else if (__DEV__) {
      console.log(`📊 [Analytics Mock] Set UserId: "${userId}"`);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[Analytics] setUserId hatası:', error);
    }
  }
}

/**
 * Kullanıcı özelliklerini belirler.
 */
export async function setUserProperty(name: string, value: string | null): Promise<void> {
  try {
    if (analyticsInstance) {
      await analyticsInstance.setUserProperty(name, value);
    } else if (__DEV__) {
      console.log(`📊 [Analytics Mock] Set Property: "${name}" = "${value}"`);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(`[Analytics] setUserProperty ("${name}") hatası:`, error);
    }
  }
}

// ─── Zarfım Özel Olay Yardımcıları (Predefined Events) ────────────

/**
 * Yeni harcama / gider eklendiğinde çağrılır.
 */
export async function logExpenseAdded(amount: number, envelopeName?: string): Promise<void> {
  await logEvent('expense_added', {
    value: amount,
    envelope_name: envelopeName || 'general',
  });
}

/**
 * Yeni gelir eklendiğinde çağrılır.
 */
export async function logIncomeAdded(amount: number, category?: string): Promise<void> {
  await logEvent('income_added', {
    value: amount,
    category_name: category || 'general',
  });
}

/**
 * Yeni zarf oluşturulduğunda çağrılır.
 */
export async function logEnvelopeCreated(name: string, limit: number): Promise<void> {
  await logEvent('envelope_created', {
    envelope_name: name,
    monthly_limit: limit,
  });
}

/**
 * Paywall görüntülendiğinde çağrılır.
 */
export async function logPaywallViewed(source?: string): Promise<void> {
  await logEvent('paywall_viewed', {
    source: source || 'unknown',
  });
}

/**
 * Başarılı abonelik / satın alma gerçekleştiğinde çağrılır.
 */
export async function logPurchaseCompleted(productId: string, price?: number, currency?: string): Promise<void> {
  await logEvent('purchase_completed', {
    product_id: productId,
    value: price,
    currency: currency || 'TRY',
  });
}
