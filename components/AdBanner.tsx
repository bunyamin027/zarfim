/**
 * AdBanner — Zarfım
 * Premium olmayan kullanıcılara sekme çubuğunun üstünde kompakt (320x50) AdMob banner gösterir.
 * - Sabit 50dp yükseklik: içerik alanını az kaplar, tüm cihazlarda aynı görünür.
 * - Çerçeve/boşluk yalnızca reklam yüklenince çizilir; reklam gelmezse hiç yer kaplamaz.
 * - ATT izni sonuçlanıp SDK başlatılana kadar reklam istenmez (bkz. lib/ads.ts initAds).
 * Native modül yoksa (Expo Go / web) hiçbir şey çizmez.
 */
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Colors } from '@/lib/theme';
import { useSubscriptionStore } from '@/store/subscription';
import { getAdsModule, getBannerUnitId, initAds } from '@/lib/ads';

export default function AdBanner() {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  // null = ATT/SDK henüz hazır değil; true/false = kişiselleştirilmiş reklam izni
  const [personalized, setPersonalized] = useState<boolean | null>(null);
  const Ads = getAdsModule();
  const unitId = getBannerUnitId();
  const enabled = !isPremium && !!Ads && !!unitId && Platform.OS !== 'web';

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    initAds().then((p) => {
      if (alive) setPersonalized(p);
    });
    return () => {
      alive = false;
    };
  }, [enabled]);

  if (!enabled || failed || personalized === null) return null;

  const { BannerAd, BannerAdSize } = Ads!;
  return (
    <View style={[styles.wrap, loaded && styles.wrapLoaded]}>
      <BannerAd
        unitId={unitId!}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: !personalized }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: Colors.ink,
  },
  wrapLoaded: {
    paddingVertical: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
});
