/**
 * LockedEnvelopeCard — Premium teaser kartı (i18n destekli)
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from '@/lib/theme';

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
      <View style={styles.flapContainer}>
        <View style={styles.flapTriangle} />
      </View>

      <View style={styles.body}>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <Text style={styles.icon}>🏠</Text>
            <View style={styles.textSection}>
              <Text style={styles.name}>{t('locked.rentTracking')}</Text>
              <Text style={styles.description}>{t('locked.description')}</Text>
            </View>
          </View>

          <View style={styles.lockSection}>
            <Text style={styles.lockIcon}>🔒</Text>
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
    marginBottom: Spacing.lg,
    opacity: 0.85,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  flapContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 18,
    overflow: 'hidden',
  },
  flapTriangle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 100,
    borderRightWidth: 100,
    borderTopWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.gold,
  },
  body: {
    backgroundColor: Colors.inkLight,
    borderWidth: 2,
    borderColor: Colors.gold,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
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
  icon: {
    fontSize: 28,
    marginEnd: Spacing.md,
    opacity: 0.6,
  },
  textSection: {
    flex: 1,
  },
  name: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.lg,
    color: Colors.paperDark,
    marginBottom: 2,
  },
  description: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.paperDark,
    opacity: 0.7,
  },
  lockSection: {
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  premiumBadge: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  premiumText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 10,
    color: Colors.ink,
    letterSpacing: 1,
  },
  ctaRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gold,
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
    color: Colors.gold,
  },
});
