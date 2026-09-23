/**
 * PrimaryButton — Zarfım ana aksiyon butonu
 * Modern minimalist stil, AppIcon desteği
 */
import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Colors, Fonts, FontSizes, Spacing, BorderRadius } from '@/lib/theme';
import AppIcon from './AppIcon';

interface PrimaryButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string | React.ReactNode;
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
      toValue: 0.96,
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
        {typeof icon === 'string' ? (
          <View style={styles.iconContainer}>
            <AppIcon name={icon} size={18} color={Colors.paper} />
          </View>
        ) : (
          icon
        )}
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.stamp,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  text: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSizes.md,
    color: Colors.paper,
    letterSpacing: 0.3,
  },

  iconContainer: {
    marginRight: Spacing.sm,
  },

  disabledContainer: {
    opacity: 0.5,
  },

  disabledButton: {
    backgroundColor: Colors.inkLight,
    shadowOpacity: 0,
  },

  disabledText: {
    color: '#8E8E93',
  },
});
