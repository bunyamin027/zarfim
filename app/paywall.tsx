/**
 * Paywall Ekranı — Zarfım Premium (i18n destekli)
 * Modern minimalist tasarım, sıfır emoji, vektör ikonlar
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
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';
import { isRevenueCatConfigured, getMockPriceString } from '@/lib/revenuecat';
import { useSubscriptionStore } from '@/store/subscription';
import PrimaryButton from '@/components/PrimaryButton';
import AppIcon from '@/components/AppIcon';
import { logPaywallViewed, logPurchaseCompleted } from '@/lib/analytics';

const FEATURE_KEYS = [
  { icon: 'mail-outline', titleKey: 'paywall.features.unlimitedEnvelopes', descKey: 'paywall.features.unlimitedEnvelopesDesc' },
  { icon: 'people-outline', titleKey: 'paywall.features.familySharing', descKey: 'paywall.features.familySharingDesc' },
  { icon: 'pie-chart-outline', titleKey: 'paywall.features.reports', descKey: 'paywall.features.reportsDesc' },
  { icon: 'download-outline', titleKey: 'paywall.features.export', descKey: 'paywall.features.exportDesc' },
  { icon: 'notifications-outline', titleKey: 'paywall.features.notifications', descKey: 'paywall.features.notificationsDesc' },
  { icon: 'color-palette-outline', titleKey: 'paywall.features.themes', descKey: 'paywall.features.themesDesc' },
];

const MAX_OFFERING_RETRIES = 3;

export default function PaywallScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    currentOffering,
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
    logPaywallViewed('paywall_screen');
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
      }, 2000 * (offeringsRetryCount + 1));
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
      handleRetryOfferings();
      return;
    }

    try {
      setPurchasing(true);
      clearError();
      const success = await purchase(monthlyPackage);
      if (success) {
        logPurchaseCompleted(
          monthlyPackage.identifier,
          monthlyPackage.product?.price,
          monthlyPackage.product?.currencyCode
        );
        Alert.alert(
          t('paywall.purchaseSuccess'),
          t('paywall.purchaseSuccessMsg'),
          [{ text: t('paywall.goBack'), onPress: () => router.back() }],
        );
      }
    } catch {
      // Error handled by store
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    clearError();
    const success = await restore();
    if (success) {
      Alert.alert(
        t('paywall.restoreSuccess'),
        t('paywall.restoreSuccessMsg'),
        [{ text: t('paywall.goBack'), onPress: () => router.back() }],
      );
    }
  };

  const offeringsFailed = !isLoading && !currentOffering && isRevenueCatConfigured;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheetHandle} />

        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={Colors.paper} />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <AppIcon name="sparkles-outline" size={32} color={Colors.gold} />
          </View>
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
              <View style={styles.featureIconContainer}>
                <AppIcon name={feature.icon} size={18} color={Colors.gold} />
              </View>
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
                title="Tekrar Dene"
                icon="refresh-outline"
                onPress={handleRetryOfferings}
                style={styles.retryButton}
              />
            </View>
          ) : (
            <PrimaryButton
              title={t('paywall.upgrade')}
              icon="sparkles-outline"
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
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(201, 151, 58, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.gold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.sm,
    color: '#8E8E93',
  },
  priceCard: {
    backgroundColor: Colors.inkLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(201, 151, 58, 0.4)',
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  trialBadge: {
    backgroundColor: 'rgba(201, 151, 58, 0.2)',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  trialText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.xs,
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  price: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 36,
    color: Colors.paper,
  },
  priceDetail: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.sm,
    color: '#8E8E93',
    marginBottom: Spacing.sm,
  },
  priceNote: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.xs,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
  },
  featuresContainer: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inkLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(201, 151, 58, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.paper,
    marginBottom: 2,
  },
  featureDesc: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.xs,
    color: '#8E8E93',
  },
  ctaContainer: {
    width: '100%',
    alignItems: 'stretch',
    marginBottom: Spacing.xl,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: Colors.stamp,
  },
  retryContainer: {
    width: '100%',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  retryText: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.sm,
    color: Colors.paperDark,
  },
  retryButton: {
    width: '100%',
  },
  errorText: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.sm,
    color: Colors.danger,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  restoreButton: {
    alignSelf: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  restoreText: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.sm,
    color: '#8E8E93',
  },
  devNote: {
    alignSelf: 'center',
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BorderRadius.sm,
  },
  devNoteText: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.xs,
    color: '#8E8E93',
    textAlign: 'center',
  },
  legalContainer: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  legal: {
    fontFamily: Fonts.bodyLight,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalLink: {
    fontFamily: Fonts.bodyLight,
    fontSize: 11,
    color: '#8E8E93',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    color: '#64748B',
    fontSize: 11,
  },
});
