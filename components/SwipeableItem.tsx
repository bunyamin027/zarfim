import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '@/lib/theme';

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  style?: any;
}

export default function SwipeableItem({ children, onDelete, style }: SwipeableItemProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, -20, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-80, -20, 0],
      outputRange: [1, 0.4, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActionsContainer}>
        <Pressable
          onPress={() => {
            swipeableRef.current?.close();
            onDelete();
          }}
          style={styles.deleteButton}
        >
          <Animated.View style={{ transform: [{ scale }], opacity, alignItems: 'center' }}>
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          </Animated.View>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Swipeable
        ref={swipeableRef}
        friction={2}
        rightThreshold={40}
        renderRightActions={renderRightActions}
        containerStyle={styles.swipeableContainer}
      >
        {children}
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
    overflow: 'hidden',
  },
  swipeableContainer: {
    overflow: 'hidden',
  },
  rightActionsContainer: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    paddingLeft: Spacing.sm,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.stamp,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
