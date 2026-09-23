/**
 * LockedEnvelopeCard — Premium teaser kartı (i18n destekli)
 * Modern minimalist tasarım, sıfır emoji
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from '@/lib/theme';
import AppIcon from './AppIcon';

export default function LockedEnvelopeCard() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => router.push('/paywall')}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.body}>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <AppIcon name="home-outline" size={20} color={Colors.gold} />
            </View>
            <View style={styles.textSection}>
              <Text style={styles.name}>{t('locked.rentTracking')}</Text>
              <Text style={styles.description}>{t('locked.description')}</Text>
            </View>
          </View>

          <View style={styles.lockSection}>
            <AppIcon name="lock-closed-outline" size={18} color={Colors.gold} />
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>PRO</Text>
            </View>
          </View>
        </View>

        <View style={styles.ctaRow}>
          <Text style={styles.ctaText}>{t('locked.upgradeCta')}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  body: {
    backgroundColor: Colors.inkLight,
    borderWidth: 1,
    borderColor: 'rgba(201, 151, 58, 0.4)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(201, 151, 58, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: Spacing.md,
  },
  textSection: {
    flex: 1,
  },
  name: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.paper,
    marginBottom: 2,
  },
  description: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.xs,
    color: '#8E8E93',
  },
  lockSection: {
    alignItems: 'center',
    gap: 4,
  },
  premiumBadge: {
    backgroundColor: 'rgba(201, 151, 58, 0.2)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
  },
  premiumText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 9,
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  ctaRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201, 151, 58, 0.2)',
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.xs,
    color: Colors.gold,
    letterSpacing: 0.2,
  },
});
