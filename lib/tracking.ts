/**
 * App Tracking Transparency (ATT) — Zarfım
 *
 * Apple 5.1.2(i): Reklam verisi takip amaçlı kullanılıyorsa, kullanıcıdan
 * ATT izni alınmadan önce reklam SDK'sı başlatılmamalı.
 *
 * Akış:
 * - iOS'ta uygulama ilk açıldığında (splash kapandıktan ve uygulama "active"
 *   olduktan sonra) sistem izin penceresi bir kez gösterilir.
 * - AdMob, bu istek sonuçlanana kadar başlatılmaz (bkz. lib/ads.ts).
 * - İzin verilirse kişiselleştirilmiş, verilmezse kişiselleştirilmemiş reklam istenir.
 * - Android / web'de ATT yoktur; izin "yok" kabul edilir (mevcut davranış korunur).
 *
 * NOT: iOS 17+ uygulama "active" değilken yapılan istek pencere göstermeden
 * döner — bu yüzden AppState beklenir ve kısa bir gecikme eklenir.
 */
import { AppState, Platform } from 'react-native';

let TT: typeof import('expo-tracking-transparency') | null = null;
try {
  TT = require('expo-tracking-transparency');
} catch {
  TT = null;
}

let consentPromise: Promise<boolean> | null = null;

function waitUntilActive(): Promise<void> {
  if (AppState.currentState === 'active') return Promise.resolve();
  return new Promise((resolve) => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sub.remove();
        resolve();
      }
    });
  });
}

async function askOnce(): Promise<boolean> {
  if (Platform.OS !== 'ios' || !TT) return false;
  // Mağaza ekran görüntüsü modunda sistem penceresi görsellere karışmasın
  if (process.env.EXPO_PUBLIC_SCREENSHOT_MODE === '1') return false;
  try {
    if (!TT.isAvailable()) return false;

    const current = await TT.getTrackingPermissionsAsync();
    if (current.status !== 'undetermined') return current.granted;

    await waitUntilActive();
    await new Promise((r) => setTimeout(r, 600)); // splash/geçiş animasyonu bitsin
    const res = await TT.requestTrackingPermissionsAsync();
    return res.granted;
  } catch (e) {
    console.warn('ATT request error:', e);
    return false;
  }
}

/**
 * ATT iznini ister (gerekirse) ve sonucu döner. Birden çok kez çağrılabilir;
 * sistem penceresi en fazla bir kez gösterilir, sonuç önbelleğe alınır.
 */
export function requestTrackingConsent(): Promise<boolean> {
  if (!consentPromise) consentPromise = askOnce();
  return consentPromise;
}
