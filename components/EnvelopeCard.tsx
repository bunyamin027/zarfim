/**
 * EnvelopeCard — Zarfım'ın imza bileşeni (i18n destekli)
 * Modern minimalist tasarım, sıfır emoji, vektör ikonlar
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius, Shadows } from '@/lib/theme';
import { formatCurrency } from '@/lib/formatCurrency';
import AppIcon from './AppIcon';

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
  const router = useRouter();
  const { id, name, icon, spent, color } = envelope;
  const monthlyLimit = envelope.monthly_limit ?? envelope.monthlyLimit ?? 0;
  const progress = monthlyLimit > 0 ? Math.min(spent / monthlyLimit, 1) : 0;
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
      duration: 800,
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
      onPressIn={() => (scale.value = withSpring(0.98))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={() => router.push(`/envelope/${id}`)}
    >
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <View style={styles.body}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: color || Colors.inkLight }]}>
              <AppIcon name={icon} size={20} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.name}>{(envelope as any).nameKey ? t((envelope as any).nameKey) : name}</Text>
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
    marginBottom: Spacing.md,
  },
  body: {
    backgroundColor: Colors.inkLight,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: Spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.paper,
    marginBottom: 3,
    textAlign: 'left',
  },
  amounts: {
    fontSize: FontSizes.sm,
  },
  spent: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.sm,
  },
  separator: {
    fontFamily: Fonts.bodyLight,
    color: '#8E8E93',
    fontSize: FontSizes.xs,
  },
  limit: {
    fontFamily: Fonts.bodyLight,
    color: '#8E8E93',
    fontSize: FontSizes.xs,
  },
  remainingBadge: {
    alignItems: 'flex-end',
  },
  remainingText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.sm,
  },
  remainingLabel: {
    fontFamily: Fonts.bodyLight,
    fontSize: FontSizes.xs,
    color: '#8E8E93',
    marginTop: 1,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});
