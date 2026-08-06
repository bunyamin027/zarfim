/**
 * Ayarlar Ekranı — Zarfım (i18n destekli + dil değiştirme)
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Updates from 'expo-updates';
import * as WebBrowser from 'expo-web-browser';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';
import { useAuthStore } from '@/store/auth';
import { useSubscriptionStore } from '@/store/subscription';
import { getMockPriceString } from '@/lib/revenuecat';
import {
  SUPPORTED_LANGUAGES,
  changeLanguage,
  getCurrentLanguage,
  type SupportedLanguage,
} from '@/lib/i18n';

function SettingsRow({
  icon,
  title,
  value,
  onPress,
  danger,
  chevron,
}: {
  icon: string;
  title: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  chevron?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
      ]}
    >
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowTitle, danger && styles.rowDanger]}>{title}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && <Text style={styles.rowChevron}>{chevron || '›'}</Text>}
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { isPremium, isLoading, error, restore, clearError } = useSubscriptionStore();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const currentLang = getCurrentLanguage();

  const handleRestore = async () => {
    const success = await restore();
    if (success) {
      Alert.alert(t('settings.restoreSuccessTitle'), t('settings.restoreSuccessMsg'));
    } else if (error) {
      Alert.alert(t('common.info'), error);
      clearError();
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      t('auth.signOut'),
      t('auth.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.signOutButton'),
          style: 'destructive',
          onPress: signOut,
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('auth.deleteAccount'),
      t('auth.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.deleteAccountButton'),
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              t('auth.deleteAccount'),
              t('auth.deleteAccountFinalConfirm'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('auth.deleteAccountButton'),
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await useAuthStore.getState().deleteAccount();
                      Alert.alert(t('common.info'), t('auth.deleteAccountSuccess'));
                    } catch {
                      Alert.alert(t('common.error'), t('auth.deleteAccountError'));
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    setShowLanguagePicker(false);

    if (lang === currentLang) return;

    // RTL geçişi reload gerektirir
    const needsReload = SUPPORTED_LANGUAGES[lang].rtl !== SUPPORTED_LANGUAGES[currentLang].rtl;

    await changeLanguage(lang);

    if (needsReload) {
      Alert.alert(
        t('settings.languageChangeTitle'),
        t('settings.languageChangeMsg'),
        [
          {
            text: t('settings.restart'),
            onPress: async () => {
              try {
                await Updates.reloadAsync();
              } catch {
                // Dev modda Updates.reloadAsync çalışmaz
                Alert.alert(
                  t('common.info'),
                  'Development modunda otomatik yeniden başlatma çalışmaz. Uygulamayı manuel kapatıp açın.',
                );
              }
            },
          },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('settings.title')}</Text>

        {/* Profil */}
        <View style={styles.profileCard}>
          <Text style={styles.profileEmoji}>👤</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.profileEmail}>
              {user?.email || t('settings.notLoggedIn')}
            </Text>
            <View style={[
              styles.tierBadge,
              isPremium ? styles.tierPremium : styles.tierFree,
            ]}>
              <Text style={[
                styles.tierText,
                isPremium ? styles.tierTextPremium : styles.tierTextFree,
              ]}>
                {isPremium ? t('settings.premium') : t('settings.free')}
              </Text>
            </View>
          </View>
        </View>

        {/* Abonelik */}
        <SectionHeader title={t('settings.subscription')} />

        {!isPremium && (
          <SettingsRow
            icon="⭐"
            title={t('settings.upgradePremium')}
            value={getMockPriceString()}
            onPress={() => router.push('/paywall')}
          />
        )}

        {isPremium && (
          <SettingsRow
            icon="👑"
            title={t('settings.subscriptionStatus')}
            value={t('settings.premiumActive')}
          />
        )}

        <SettingsRow
          icon="🔄"
          title={t('settings.restorePurchases')}
          onPress={handleRestore}
        />

        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.gold} />
            <Text style={styles.loadingText}>{t('settings.checking')}</Text>
          </View>
        )}

        {/* Tercihler */}
        <SectionHeader title={t('settings.preferences')} />

        <SettingsRow
          icon="🌍"
          title={t('settings.language')}
          value={SUPPORTED_LANGUAGES[currentLang].nativeName}
          onPress={() => setShowLanguagePicker(true)}
        />
        <SettingsRow
          icon="💰"
          title={t('settings.currency')}
          value={currentLang === 'ar' ? 'ر.س SAR' : '₺ TRY'}
        />
        <SettingsRow
          icon="🔔"
          title={t('settings.notifications')}
          value={notificationsEnabled ? t('settings.notificationsOn') : 'Kapalı'}
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
        />

        <SettingsRow
          icon="💬"
          title={t('settings.support')}
          value="kahramandev01@gmail.com"
          onPress={() => Linking.openURL('mailto:kahramandev01@gmail.com')}
        />
        <SettingsRow
          icon="🌐"
          title={t('settings.developer')}
          value="Kahramanapp"
          onPress={() => WebBrowser.openBrowserAsync('https://kahramanapp.com')}
        />

        {/* Yasal */}
        <SectionHeader title={t('settings.legal')} />

        <SettingsRow
          icon="📜"
          title={t('settings.termsOfUse')}
          onPress={() => WebBrowser.openBrowserAsync('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
        />

        {/* Hesap */}
        <SectionHeader title={t('settings.account')} />

        <SettingsRow
          icon="🗑️"
          title={t('settings.deleteAccount')}
          onPress={handleDeleteAccount}
          danger
        />

        <SettingsRow
          icon="🚪"
          title={t('auth.signOut')}
          onPress={handleSignOut}
          danger
        />

        {/* Uygulama bilgisi */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>{t('settings.appVersion')}</Text>
          <Text style={styles.appInfoText}>{t('settings.appTagline')}</Text>
        </View>
      </ScrollView>

      {/* Dil seçici modal */}
      <Modal
        visible={showLanguagePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLanguagePicker(false)}
        >
          <View style={styles.languagePicker}>
            <Text style={styles.languagePickerTitle}>{t('settings.language')}</Text>

            {(Object.entries(SUPPORTED_LANGUAGES) as [SupportedLanguage, typeof SUPPORTED_LANGUAGES[SupportedLanguage]][]).map(
              ([code, lang]) => (
                <Pressable
                  key={code}
                  style={[
                    styles.languageOption,
                    code === currentLang && styles.languageOptionActive,
                  ]}
                  onPress={() => handleLanguageChange(code)}
                >
                  <Text style={[
                    styles.languageOptionText,
                    code === currentLang && styles.languageOptionTextActive,
                  ]}>
                    {lang.nativeName}
                  </Text>
                  {code === currentLang && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              ),
            )}

            <Pressable
              style={styles.languageCancelButton}
              onPress={() => setShowLanguagePicker(false)}
            >
              <Text style={styles.languageCancelText}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxl,
    color: Colors.paper,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inkLight,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  profileEmoji: {
    fontSize: 36,
    marginEnd: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.paper,
    marginBottom: Spacing.xs,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingVertical: 2,
    paddingHorizontal: Spacing.md,
  },
  tierFree: {
    backgroundColor: Colors.paperDark,
  },
  tierPremium: {
    backgroundColor: Colors.gold,
  },
  tierText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.xs,
  },
  tierTextFree: {
    color: Colors.ink,
  },
  tierTextPremium: {
    color: Colors.ink,
  },
  sectionHeader: {
    fontFamily: Fonts.displayMedium,
    fontSize: FontSizes.sm,
    color: Colors.paperDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.inkLight,
  },
  rowPressed: {
    backgroundColor: Colors.inkLight,
  },
  rowIcon: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
  },
  rowTitle: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.paper,
    marginStart: Spacing.sm,
  },
  rowDanger: {
    color: Colors.stamp,
  },
  rowValue: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
    color: Colors.paperDark,
    marginEnd: Spacing.sm,
  },
  rowChevron: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xl,
    color: Colors.paperDark,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  loadingText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.paperDark,
    marginStart: Spacing.sm,
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.lg,
  },
  appInfoText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.inkLight,
    marginBottom: 2,
  },

  // Language picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languagePicker: {
    backgroundColor: Colors.inkLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '80%',
    maxWidth: 320,
  },
  languagePickerTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.paper,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  languageOptionActive: {
    backgroundColor: Colors.gold + '20',
  },
  languageOptionText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.lg,
    color: Colors.paper,
  },
  languageOptionTextActive: {
    color: Colors.gold,
  },
  checkmark: {
    fontSize: 18,
    color: Colors.gold,
    fontWeight: 'bold',
  },
  languageCancelButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  languageCancelText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.md,
    color: Colors.paperDark,
  },
});
