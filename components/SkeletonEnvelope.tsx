/**
 * SkeletonEnvelope — Yükleniyor durumu için iskelet görünümü (Faz 6)
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing, Shadows } from '@/lib/theme';

export default function SkeletonEnvelope() {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.flapContainer}>
        <View style={styles.flapTriangle} />
      </View>

      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.iconPlaceholder} />
          <View style={styles.textContainer}>
            <View style={styles.titlePlaceholder} />
            <View style={styles.amountPlaceholder} />
          </View>
          <View style={styles.badgePlaceholder} />
        </View>
        <View style={styles.progressTrack} />
      </View>
    </Animated.View>
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
    borderLeftWidth: 100,
    borderRightWidth: 100,
    borderTopWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.paperDark,
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
  iconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.paperDark,
    marginEnd: Spacing.md,
    opacity: 0.3,
  },
  textContainer: {
    flex: 1,
  },
  titlePlaceholder: {
    width: '50%',
    height: 18,
    backgroundColor: Colors.paperDark,
    borderRadius: 4,
    marginBottom: 6,
    opacity: 0.3,
  },
  amountPlaceholder: {
    width: '30%',
    height: 14,
    backgroundColor: Colors.paperDark,
    borderRadius: 4,
    opacity: 0.2,
  },
  badgePlaceholder: {
    width: 40,
    height: 24,
    backgroundColor: Colors.paperDark,
    borderRadius: 4,
    opacity: 0.2,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.paperDark,
    borderRadius: BorderRadius.full,
    opacity: 0.2,
  },
});
