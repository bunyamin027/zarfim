/**
 * AdMob — Zarfım
 *
 * Premium olmayan kullanıcılara her uygulama açılışında bir kez
 * tam ekran (interstitial) reklam gösterir.
 *
 * Ayrıca sekme ekranlarında banner (components/AdBanner.tsx).
 *
 * Reklam birimi kimlikleri .env'den okunur:
 *   EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID / EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID
 *   EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID       / EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
 * Tanımlı değilse veya geliştirme modundaysa Google test reklamı kullanılır.
 *
 * NOT: Native modül — Expo Go'da ve web'de çalışmaz, sessizce atlanır.
 */
import { Platform } from 'react-native';

let Ads: typeof import('react-native-google-mobile-ads') | null = null;
try {
  Ads = require('react-native-google-mobile-ads');
} catch {
  Ads = null;
}

export function getAdsModule() {
  return Ads;
}

export function getBannerUnitId(): string | null {
  if (!Ads) return null;
  const envId =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
      : process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID;
  if (__DEV__ || !envId) return Ads.TestIds.ADAPTIVE_BANNER;
  return envId;
}

let launchAdShown = false; // JS oturumu başına bir kez

function getInterstitialUnitId(): string | null {
  if (!Ads) return null;
  const envId =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID
      : process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID;
  if (__DEV__ || !envId) return Ads.TestIds.INTERSTITIAL;
  return envId;
}

export async function showLaunchInterstitial(): Promise<void> {
  if (launchAdShown || !Ads || Platform.OS === 'web') return;
  launchAdShown = true;

  const unitId = getInterstitialUnitId();
  if (!unitId) return;

  try {
    await Ads.default().initialize();
    const ad = Ads.InterstitialAd.createForAdRequest(unitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(done, 8000); // reklam geç yüklenirse kullanıcıyı bekletme
      const unsubs = [
        ad.addAdEventListener(Ads!.AdEventType.LOADED, () => {
          clearTimeout(timeout);
          ad.show().catch(done);
        }),
        ad.addAdEventListener(Ads!.AdEventType.CLOSED, done),
        ad.addAdEventListener(Ads!.AdEventType.ERROR, done),
      ];
      function done() {
        clearTimeout(timeout);
        unsubs.forEach((u) => u());
        resolve();
      }
      ad.load();
    });
  } catch (e) {
    console.warn('AdMob launch interstitial error:', e);
  }
}
