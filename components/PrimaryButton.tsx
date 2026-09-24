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

  const containerStyle: ViewStyle = {};
  if (style) {
    if ('width' in style) containerStyle.width = style.width;
    if ('maxWidth' in style) containerStyle.maxWidth = style.maxWidth;
    if ('alignSelf' in style) containerStyle.alignSelf = style.alignSelf;
    if ('margin' in style) containerStyle.margin = style.margin;
    if ('marginTop' in style) containerStyle.marginTop = style.marginTop;
    if ('marginBottom' in style) containerStyle.marginBottom = style.marginBottom;
    if ('marginLeft' in style) containerStyle.marginLeft = style.marginLeft;
    if ('marginRight' in style) containerStyle.marginRight = style.marginRight;
    if ('marginHorizontal' in style) containerStyle.marginHorizontal = style.marginHorizontal;
  }

  const isFullWidth =
    style &&
    (('width' in style && (style.width === '100%' || style.width === 'auto')) ||
      ('alignSelf' in style && style.alignSelf === 'stretch'));

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        disabled && styles.disabledContainer,
        isFullWidth && styles.fullWidth,
        containerStyle,
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
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },

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
    textAlign: 'center',
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
