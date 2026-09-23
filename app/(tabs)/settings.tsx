/**
 * Ayarlar Ekranı — Zarfım (i18n destekli + dil değiştirme)
 * Modern minimalist tasarım, sıfır emoji, vektör ikonlar
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
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import * as WebBrowser from 'expo-web-browser';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';
import { useAuthStore } from '@/store/auth';
import { useSubscriptionStore } from '@/store/subscription';
import { getMockPriceString } from '@/lib/revenuecat';
import AppIcon from '@/components/AppIcon';
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
      <View style={styles.rowIconContainer}>
        <AppIcon name={icon} size={18} color={danger ? Colors.danger : '#94A3B8'} />
      </View>
      <Text style={[styles.rowTitle, danger && styles.rowDanger]}>{title}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color="#64748B" style={styles.rowChevron} />
      )}
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
      Alert.alert('Geri Yüklendi', t('settings.restoreSuccessMsg'));
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
      t('settings.deleteAccount'),
      t('auth.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteAccount'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('settings.deleteAccount'),
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Ayarlar</Text>

        {/* Profil */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <AppIcon name="person-outline" size={24} color={Colors.gold} />
          </View>
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
            icon="star-outline"
            title={t('settings.upgradePremium')}
            value={getMockPriceString()}
            onPress={() => router.push('/paywall')}
          />
        )}

        {isPremium && (
          <SettingsRow
            icon="sparkles-outline"
            title={t('settings.subscriptionStatus')}
            value={t('settings.premiumActive')}
          />
        )}

        <SettingsRow
          icon="sync-outline"
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
          icon="globe-outline"
          title={t('settings.language')}
          value={SUPPORTED_LANGUAGES[currentLang].nativeName}
          onPress={() => setShowLanguagePicker(true)}
        />
        <SettingsRow
          icon="cash-outline"
          title={t('settings.currency')}
          value={currentLang === 'ar' ? 'ر.س SAR' : '₺ TRY'}
        />
        <SettingsRow
          icon="notifications-outline"
          title={t('settings.notifications')}
          value={notificationsEnabled ? t('settings.notificationsOn') : 'Kapalı'}
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
        />

        <SettingsRow
          icon="chatbubble-outline"
          title={t('settings.support')}
          value="kahramandev01@gmail.com"
          onPress={() => Linking.openURL('mailto:kahramandev01@gmail.com')}
        />
        <SettingsRow
          icon="link-outline"
          title={t('settings.developer')}
          value="Kahramanapp"
          onPress={() => WebBrowser.openBrowserAsync('https://kahramanapp.com')}
        />

        {/* Yasal */}
        <SectionHeader title={t('settings.legal')} />

        <SettingsRow
          icon="newspaper-outline"
          title={t('settings.termsOfUse')}
          onPress={() => WebBrowser.openBrowserAsync('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
        />
        <SettingsRow
          icon="lock-closed-outline"
          title={t('settings.privacyPolicy')}
          onPress={() => WebBrowser.openBrowserAsync('https://kahramanapp.com/privacy')}
        />

        {/* Hesap */}
        <SectionHeader title={t('settings.account')} />

        <SettingsRow
          icon="trash-outline"
          title={t('settings.deleteAccount')}
          onPress={handleDeleteAccount}
          danger
        />

        <SettingsRow
          icon="log-out-outline"
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

      {/* Modern Minimalist Dil Seçici Modal */}
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
            <View style={styles.modalGrabber} />
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
                    <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(201, 151, 58, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.md,
    color: Colors.paper,
    marginBottom: Spacing.xs,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm + 2,
  },
  tierFree: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tierPremium: {
    backgroundColor: 'rgba(201, 151, 58, 0.2)',
  },
  tierText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  tierTextFree: {
    color: '#94A3B8',
  },
  tierTextPremium: {
    color: Colors.gold,
  },
  sectionHeader: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.xs,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  rowPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  rowIconContainer: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.sm,
    color: '#94A3B8',
    marginEnd: Spacing.xs,
  },
  rowChevron: {
    marginStart: Spacing.xs,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  loadingText: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.xs,
    color: '#94A3B8',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  appInfoText: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.xs,
    color: '#64748B',
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  languagePicker: {
    backgroundColor: Colors.ink,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalGrabber: {
    width: 32,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
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
    backgroundColor: 'rgba(201, 151, 58, 0.12)',
  },
  languageOptionText: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.md,
    color: Colors.paper,
  },
  languageOptionTextActive: {
    color: Colors.gold,
    fontFamily: Fonts.bodySemiBold,
  },
  languageCancelButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  languageCancelText: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.sm,
    color: '#94A3B8',
  },
});
