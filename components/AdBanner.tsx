/**
 * AdBanner — Zarfım
 * Premium olmayan kullanıcılara sekme çubuğunun üstünde kompakt (320x50) AdMob banner gösterir.
 * - Sabit 50dp yükseklik: içerik alanını az kaplar, tüm cihazlarda aynı görünür.
 * - Çerçeve/boşluk yalnızca reklam yüklenince çizilir; reklam gelmezse hiç yer kaplamaz.
 * Native modül yoksa (Expo Go / web) hiçbir şey çizmez.
 */
import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Colors } from '@/lib/theme';
import { useSubscriptionStore } from '@/store/subscription';
import { getAdsModule, getBannerUnitId } from '@/lib/ads';

export default function AdBanner() {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const Ads = getAdsModule();
  const unitId = getBannerUnitId();

  if (isPremium || failed || !Ads || !unitId || Platform.OS === 'web') return null;

  const { BannerAd, BannerAdSize } = Ads;
  return (
    <View style={[styles.wrap, loaded && styles.wrapLoaded]}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
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
