/**
 * PostmarkRing — Modern & Premium damga ilerleme halkası (i18n destekli)
 * Pürüzsüz hatlar, zarif posta damgası mikro detayları ve modern degrade
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';
import { formatCurrency, formatPercent } from '@/lib/formatCurrency';

interface PostmarkRingProps {
  totalBudget: number;
  totalSpent: number;
  size?: number;
  strokeWidth?: number;
}

export default function PostmarkRing({
  totalBudget,
  totalSpent,
  size = 196,
  strokeWidth = 10,
}: PostmarkRingProps) {
  const { t } = useTranslation();
  const isOver = totalSpent > totalBudget;
  const progress = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : (totalSpent > 0 ? 1 : 0);

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const remaining = totalBudget - totalSpent;
  const isRemainingPositive = remaining >= 0;

  // Degrade ID seçimi
  const gradientId = isOver
    ? 'stampGrad'
    : progress > 0.8
      ? 'warningGrad'
      : 'sageGrad';

  const statusColor = isOver
    ? Colors.stamp
    : progress > 0.8
      ? Colors.warning
      : '#84BD7D';

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Defs>
          {/* Pozitif / bütçe içi degrade */}
          <LinearGradient id="sageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#9BD390" />
            <Stop offset="100%" stopColor="#5B9355" />
          </LinearGradient>

          {/* Uyarı degrade (%80+) */}
          <LinearGradient id="warningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#F5B24E" />
            <Stop offset="100%" stopColor="#D97A24" />
          </LinearGradient>

          {/* Aşım degrade */}
          <LinearGradient id="stampGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E25942" />
            <Stop offset="100%" stopColor="#A82F1B" />
          </LinearGradient>

          {/* Kadran zemin degrade */}
          <LinearGradient id="dialGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="rgba(42, 58, 92, 0.4)" />
            <Stop offset="100%" stopColor="rgba(28, 37, 65, 0.65)" />
          </LinearGradient>
        </Defs>

        {/* İç kadran zemin dolgusu */}
        <Circle
          cx={center}
          cy={center}
          r={radius - strokeWidth / 2}
          fill="url(#dialGrad)"
        />

        {/* Dış ikinci zarif kılcal halka */}
        <Circle
          cx={center}
          cy={center}
          r={radius + strokeWidth / 2 + 10}
          stroke="rgba(201, 151, 58, 0.15)"
          strokeWidth={0.8}
          fill="none"
        />

        {/* Dış zarif posta damgası perforasyon çemberi */}
        <Circle
          cx={center}
          cy={center}
          r={radius + strokeWidth / 2 + 5}
          stroke="rgba(201, 151, 58, 0.35)"
          strokeWidth={1}
          fill="none"
          strokeDasharray="4 4"
        />

        {/* İç ince kılcal çember */}
        <Circle
          cx={center}
          cy={center}
          r={radius - strokeWidth / 2 - 4}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={1}
          fill="none"
        />

        {/* İlerleme halkası grubu */}
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Pürüzsüz arka plan rayı */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Aktif ilerleme yayı */}
          {progress > 0 && (
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
            />
          )}
        </G>
      </Svg>

      <View style={[styles.centerText, { width: size, height: size }]}>
        <View style={styles.labelRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.label}>
            {isRemainingPositive ? t('dashboard.remaining').toUpperCase() : t('dashboard.over').toUpperCase()}
          </Text>
        </View>

        <Text
          style={[
            styles.amount,
            { color: isRemainingPositive ? Colors.paper : Colors.stamp },
          ]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {formatCurrency(Math.abs(remaining))}
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {formatPercent(progress)} {t('dashboard.used')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: '#94A3B8',
  },
  amount: {
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 38,
    marginVertical: 2,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 4,
  },
  badgeText: {
    fontFamily: Fonts.bodyLight,
    fontSize: 11,
    color: 'rgba(239, 230, 211, 0.75)',
    letterSpacing: 0.2,
  },
});
