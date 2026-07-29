/**
 * PostmarkRing — Posta damgası ilerleme halkası (i18n destekli)
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Colors, Fonts, FontSizes, Spacing } from '@/lib/theme';
import { formatCurrency } from '@/lib/formatCurrency';

interface PostmarkRingProps {
  totalBudget: number;
  totalSpent: number;
  size?: number;
  strokeWidth?: number;
}

export default function PostmarkRing({
  totalBudget,
  totalSpent,
  size = 180,
  strokeWidth = 12,
}: PostmarkRingProps) {
  const { t } = useTranslation();
  const progress = Math.min(totalSpent / totalBudget, 1);
  const percentage = Math.round(progress * 100);
  const isOver = totalSpent > totalBudget;

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const progressColor = isOver
    ? Colors.stamp
    : progress > 0.8
      ? '#E8963A'
      : Colors.sage;

  const remaining = totalBudget - totalSpent;
  const isRemainingPositive = remaining >= 0;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={Colors.paperDark}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray="4 3"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
          />
        </G>
        <Circle
          cx={center}
          cy={center}
          r={radius + strokeWidth / 2 + 4}
          stroke={Colors.paperDark}
          strokeWidth={1}
          fill="none"
          strokeDasharray="6 4"
          opacity={0.5}
        />
      </Svg>

      <View style={[styles.centerText, { width: size, height: size }]}>
        <Text style={styles.label}>
          {isRemainingPositive ? t('dashboard.remaining').toUpperCase() : t('dashboard.over').toUpperCase()}
        </Text>
        <Text
          style={[
            styles.percentage,
            { color: isRemainingPositive ? Colors.sage : Colors.stamp, fontSize: FontSizes.xxl }
          ]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {formatCurrency(Math.abs(remaining))}
        </Text>
        <Text style={styles.amount}>
          %{percentage} {t('dashboard.used')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xxxl,
    lineHeight: 38,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.sm,
    color: Colors.paperDark,
    marginTop: 2,
  },
  amount: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.paper,
    marginTop: Spacing.xs,
  },
});
