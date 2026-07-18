/**
 * EnvelopeCard — Zarfım'ın imza bileşeni (i18n destekli)
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from '@/lib/theme';
import { formatCurrency } from '@/lib/formatCurrency';

interface EnvelopeCardEnvelope {
  id: string;
  name: string;
  icon: string;
  monthly_limit?: number;
  monthlyLimit?: number;
  spent: number;
  color: string;
}

interface EnvelopeCardProps {
  envelope: EnvelopeCardEnvelope;
}

export default function EnvelopeCard({ envelope }: EnvelopeCardProps) {
  const { t } = useTranslation();
  const { name, icon, spent, color } = envelope;
  const monthlyLimit = envelope.monthly_limit ?? envelope.monthlyLimit ?? 0;
  const progress = Math.min(spent / monthlyLimit, 1);
  const remaining = monthlyLimit - spent;
  const isOver = spent > monthlyLimit;

  const progressColor = isOver
    ? Colors.stamp
    : progress > 0.8
      ? '#E8963A'
      : Colors.sage;

  // Animations
  const progressWidth = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progressWidth.value = withTiming(progress * 100, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
      backgroundColor: progressColor,
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Pressable
      onPressIn={() => (scale.value = withSpring(0.97))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={() => console.log('Go to detail', id)}
    >
      <Animated.View style={[styles.container, animatedContainerStyle]}>
      <View style={styles.flapContainer}>
        <View style={[styles.flapTriangle, styles.flapTriangleLeft]} />
      </View>

      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.headerText}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.amounts}>
              <Text style={[styles.spent, { color: progressColor }]}>
                {formatCurrency(spent)}
              </Text>
              <Text style={styles.separator}> / </Text>
              <Text style={styles.limit}>{formatCurrency(monthlyLimit)}</Text>
            </Text>
          </View>
          <View style={styles.remainingBadge}>
            <Text
              style={[
                styles.remainingText,
                { color: isOver ? Colors.stamp : Colors.sage },
              ]}
            >
              {isOver ? '−' : ''}{formatCurrency(Math.abs(remaining))}
            </Text>
            <Text style={styles.remainingLabel}>
              {isOver ? t('envelope.over') : t('envelope.remaining')}
            </Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
        </View>
      </View>
    </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
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
  },
  flapTriangleLeft: {
    borderLeftWidth: 100,
    borderRightWidth: 100,
    borderTopWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.paperDark,
    marginRight: -1,
  },
  body: {
    backgroundColor: Colors.paper,
    borderWidth: 1.5,
    borderColor: Colors.paperDark,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: 28,
    marginEnd: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.lg,
    color: Colors.ink,
    marginBottom: 2,
    textAlign: 'left',
  },
  amounts: {
    fontSize: FontSizes.sm,
  },
  spent: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSizes.md,
  },
  separator: {
    fontFamily: Fonts.body,
    color: Colors.inkLight,
    fontSize: FontSizes.sm,
  },
  limit: {
    fontFamily: Fonts.body,
    color: Colors.inkLight,
    fontSize: FontSizes.sm,
  },
  remainingBadge: {
    alignItems: 'flex-end',
  },
  remainingText: {
    fontFamily: Fonts.bodyBold,
    fontSize: FontSizes.md,
  },
  remainingLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSizes.xs,
    color: Colors.inkLight,
    marginTop: 1,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.paperDark,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
