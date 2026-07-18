/**
 * PrimaryButton — Zarfım ana aksiyon butonu
 *
 * stamp arka plan, paper yazı rengi.
 * Basıldığında hafif scale animasyonu.
 */
import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';

interface PrimaryButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  icon,
}: PrimaryButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        disabled && styles.disabledContainer,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.button, disabled && styles.disabledButton, style]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text
          style={[styles.text, disabled && styles.disabledText, textStyle]}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.stamp,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Hafif gölge
    shadowColor: Colors.stamp,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  text: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.lg,
    color: Colors.paper,
    letterSpacing: 0.3,
  },

  icon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },

  disabledContainer: {
    opacity: 0.6,
  },

  disabledButton: {
    backgroundColor: Colors.paperDark,
    shadowOpacity: 0,
  },

  disabledText: {
    color: Colors.inkLight,
  },
});
