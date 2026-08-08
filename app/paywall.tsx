/**
 * Paywall Ekranı — Zarfım Premium (i18n destekli)
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';
import { isRevenueCatConfigured, getMockPriceString } from '@/lib/revenuecat';
import { useSubscriptionStore } from '@/store/subscription';
import PrimaryButton from '@/components/PrimaryButton';

const FEATURE_KEYS = [
  { icon: '📬', titleKey: 'paywall.features.unlimitedEnvelopes', descKey: 'paywall.features.unlimitedEnvelopesDesc' },
  { icon: '👨‍👩‍👧‍👦', titleKey: 'paywall.features.familySharing', descKey: 'paywall.features.familySharingDesc' },
  { icon: '📊', titleKey: 'paywall.features.reports', descKey: 'paywall.features.reportsDesc' },
  { icon: '📥', titleKey: 'paywall.features.export', descKey: 'paywall.features.exportDesc' },
  { icon: '🔔', titleKey: 'paywall.features.notifications', descKey: 'paywall.features.notificationsDesc' },
  { icon: '🎨', titleKey: 'paywall.features.themes', descKey: 'paywall.features.themesDesc' },
];

const MAX_OFFERING_RETRIES = 3;

export default function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    currentOffering,
    mockOffering,
    isPremium,
    isLoading,
    error,
    purchase,
    restore,
    checkSubscription,
    fetchOfferings,
    clearError,
  } = useSubscriptionStore();

  const [purchasing, setPurchasing] = useState(false);
  const [offeringsRetryCount, setOfferingsRetryCount] = useState(0);

  // Initial load: check subscription + fetch offerings
  useEffect(() => {
    checkSubscription();
  }, []);

  // Auto-retry offerings if they fail on first load (up to MAX_OFFERING_RETRIES)
  useEffect(() => {
    if (
      !isLoading &&
      !currentOffering &&
      isRevenueCatConfigured &&
      offeringsRetryCount < MAX_OFFERING_RETRIES
    ) {
      const timer = setTimeout(() => {
        setOfferingsRetryCount((c) => c + 1);
        fetchOfferings();
      }, 2000 * (offeringsRetryCount + 1)); // Progressive delay: 2s, 4s, 6s
      return () => clearTimeout(timer);
    }
  }, [isLoading, currentOffering, offeringsRetryCount]);

  useEffect(() => {
    if (isPremium) {
      Alert.alert(t('paywall.premiumActive'), t('paywall.premiumActiveMsg'), [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    }
  }, [isPremium]);

  const offering = currentOffering;
  const monthlyPackage = offering?.monthly || offering?.availablePackages?.[0];
  const priceString = monthlyPackage?.product?.priceString || getMockPriceString();

  const handleRetryOfferings = () => {
    setOfferingsRetryCount(0);
    clearError();
    fetchOfferings();
  };

  const handlePurchase = async () => {
    if (!isRevenueCatConfigured) {
      Alert.alert(t('paywall.devMode'), t('paywall.devModeMsg'));
      return;
    }

    if (!monthlyPackage) {
      // Instead of just showing an error, try to fetch offerings first
      handleRetryOfferings();
      return;
    }

    setPurchasing(true);
    const success = await purchase(monthlyPackage);
    setPurchasing(false);

    if (success) {
      Alert.alert(t('paywall.purchaseSuccess'), t('paywall.purchaseSuccessMsg'), [
        { text: t('paywall.goBack'), onPress: () => router.back() },
      ]);
    }
  };

  const handleRestore = async () => {
    const success = await restore();
    if (success) {
      Alert.alert(t('paywall.restoreSuccess'), t('paywall.restoreSuccessMsg'), [
        { text: t('common.ok'), onPress: () => router.back() },
      ]);
    } else if (error) {
      Alert.alert(t('common.info'), error);
      clearError();
    }
  };

  // Determine if offerings failed to load
  const offeringsFailed = isRevenueCatConfigured && !currentOffering && !isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeText}>{t('common.close')}</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.title}>{t('paywall.title')}</Text>
          <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.priceCard,
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
          ]}
          onPress={handlePurchase}
          disabled={purchasing || isLoading}
        >
          <View style={styles.trialBadge}>
            <Text style={styles.trialText}>{t('paywall.trialBadge')}</Text>
          </View>
          <Text style={styles.price}>{priceString}</Text>
          <Text style={styles.priceDetail}>{t('common.perMonth')}</Text>
          <Text style={styles.priceNote}>{t('paywall.trialNote')}</Text>
        </Pressable>

        <View style={styles.featuresContainer}>
          {FEATURE_KEYS.map((feature, index) => (
            <Animated.View 
              key={index} 
              style={styles.featureRow}
              entering={FadeInUp.delay(300 + index * 100).springify()}
            >
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{t(feature.titleKey)}</Text>
                <Text style={styles.featureDesc}>{t(feature.descKey)}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={styles.ctaContainer}>
          {purchasing || isLoading ? (
            <ActivityIndicator size="large" color={Colors.gold} />
          ) : offeringsFailed ? (
            <View style={styles.retryContainer}>
              <Text style={styles.retryText}>{t('paywall.productError')}</Text>
              <PrimaryButton
                title="↻ Tekrar Dene"
                onPress={handleRetryOfferings}
                style={styles.retryButton}
              />
            </View>
          ) : (
            <PrimaryButton
              title={t('paywall.upgrade')}
              icon="⭐"
              onPress={handlePurchase}
              style={styles.ctaButton}
            />
          )}

          {error && !offeringsFailed && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Pressable onPress={handleRestore} style={styles.restoreButton}>
            <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
          </Pressable>

          {!isRevenueCatConfigured && (
            <View style={styles.devNote}>
              <Text style={styles.devNoteText}>{t('paywall.devModeNote')}</Text>
            </View>
          )}
        </View>

        <View style={styles.legalContainer}>
          <Text style={styles.legal}>{t('paywall.legal')}</Text>
          <View style={styles.legalLinks}>
            <Pressable onPress={() => WebBrowser.openBrowserAsync('https://kahramanapp.com/privacy')}>
              <Text style={styles.legalLink}>{t('settings.privacyPolicy')}</Text>
            </Pressable>
            <Text style={styles.legalSeparator}> • </Text>
            <Pressable onPress={() => WebBrowser.openBrowserAsync('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
              <Text style={styles.legalLink}>{t('settings.termsOfUse')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  closeText: {
    fontSize: 22,
    color: Colors.paperDark,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  crown: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxxl,
    color: Colors.gold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.paperDark,
  },
  priceCard: {
    backgroundColor: Colors.inkLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.gold,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  trialBadge: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  trialText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.ink,
  },
  price: {
    fontFamily: Fonts.display,
    fontSize: 42,
    color: Colors.paper,
  },
  priceDetail: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.lg,
    color: Colors.paperDark,
    marginTop: -4,
  },
  priceNote: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.paperDark,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 18,
  },
  featuresContainer: {
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inkLight,
  },
  featureIcon: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
    marginStart: Spacing.md,
  },
  featureTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.paper,
  },
  featureDesc: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.paperDark,
    marginTop: 2,
  },
  ctaContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  ctaButton: {
    backgroundColor: Colors.gold,
    width: '100%',
    shadowColor: Colors.gold,
  },
  retryContainer: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: Spacing.md,
  },
  retryText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.paperDark,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryButton: {
    backgroundColor: Colors.inkLight,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.stamp,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  restoreButton: {
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  restoreText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.paperDark,
    textDecorationLine: 'underline',
  },
  devNote: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.inkLight,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  devNoteText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.gold,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  legal: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.paperDark,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.5,
    marginBottom: Spacing.sm,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalLink: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.xs,
    color: Colors.paperDark,
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
  legalSeparator: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.paperDark,
    opacity: 0.5,
    marginHorizontal: Spacing.xs,
  },
});
