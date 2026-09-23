import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/lib/theme';

export type IconSource = 'ionicons' | 'feather' | 'material';

interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  source?: IconSource;
  focused?: boolean;
}

// Maps legacy emoji characters or short keys to modern minimalist vector icons
const EMOJI_TO_ICON_MAP: Record<string, { name: string; source: IconSource }> = {
  // Envelopes & expenses
  '🛒': { name: 'cart-outline', source: 'ionicons' },
  '🚌': { name: 'bus-outline', source: 'ionicons' },
  '🎬': { name: 'film-outline', source: 'ionicons' },
  '🏠': { name: 'home-outline', source: 'ionicons' },
  '📄': { name: 'document-text-outline', source: 'ionicons' },
  '🍕': { name: 'fast-food-outline', source: 'ionicons' },
  '✈️': { name: 'airplane-outline', source: 'ionicons' },
  '💊': { name: 'medkit-outline', source: 'ionicons' },
  '🎁': { name: 'gift-outline', source: 'ionicons' },
  '🎮': { name: 'game-controller-outline', source: 'ionicons' },
  '☕': { name: 'cafe-outline', source: 'ionicons' },
  '🚗': { name: 'car-outline', source: 'ionicons' },
  '📚': { name: 'book-outline', source: 'ionicons' },
  '👕': { name: 'shirt-outline', source: 'ionicons' },
  '🏋️': { name: 'fitness-outline', source: 'ionicons' },

  // Incomes
  '💰': { name: 'wallet-outline', source: 'ionicons' },
  '💵': { name: 'cash-outline', source: 'ionicons' },
  '💳': { name: 'card-outline', source: 'ionicons' },
  '🏢': { name: 'business-outline', source: 'ionicons' },
  '📈': { name: 'trending-up-outline', source: 'ionicons' },
  '🏦': { name: 'library-outline', source: 'ionicons' },
  '📱': { name: 'phone-portrait-outline', source: 'ionicons' },

  // System & UI
  '📬': { name: 'mail-outline', source: 'ionicons' },
  '💸': { name: 'arrow-up-circle-outline', source: 'ionicons' },
  '📊': { name: 'pie-chart-outline', source: 'ionicons' },
  '⚙️': { name: 'settings-outline', source: 'ionicons' },
  '👤': { name: 'person-outline', source: 'ionicons' },
  '⭐': { name: 'star-outline', source: 'ionicons' },
  '👑': { name: 'sparkles-outline', source: 'ionicons' },
  '🔄': { name: 'sync-outline', source: 'ionicons' },
  '🌍': { name: 'globe-outline', source: 'ionicons' },
  '🔔': { name: 'notifications-outline', source: 'ionicons' },
  '💬': { name: 'chatbubble-outline', source: 'ionicons' },
  '🌐': { name: 'link-outline', source: 'ionicons' },
  '📜': { name: 'newspaper-outline', source: 'ionicons' },
  '🔒': { name: 'lock-closed-outline', source: 'ionicons' },
  '🗑️': { name: 'trash-outline', source: 'ionicons' },
  '🚪': { name: 'log-out-outline', source: 'ionicons' },
  '✏️': { name: 'pencil-outline', source: 'ionicons' },
  '✨': { name: 'sparkles-outline', source: 'ionicons' },
  '🤖': { name: 'hardware-chip-outline', source: 'ionicons' },
  '⏳': { name: 'hourglass-outline', source: 'ionicons' },
  '👨‍👩‍👧‍👦': { name: 'people-outline', source: 'ionicons' },
  '📥': { name: 'download-outline', source: 'ionicons' },
  '🎨': { name: 'color-palette-outline', source: 'ionicons' },
  '✅': { name: 'checkmark-circle-outline', source: 'ionicons' },
  '⚠️': { name: 'alert-circle-outline', source: 'ionicons' },
};

export default function AppIcon({
  name,
  size = 20,
  color = Colors.paper,
  source = 'ionicons',
  focused = false,
}: AppIconProps) {
  let resolvedName = name;
  let resolvedSource = source;

  // Check if it's an emoji or in our map
  if (EMOJI_TO_ICON_MAP[name]) {
    resolvedName = EMOJI_TO_ICON_MAP[name].name;
    resolvedSource = EMOJI_TO_ICON_MAP[name].source;
  }

  // If focused on an ionicon with -outline suffix, optionally use filled
  if (focused && resolvedSource === 'ionicons' && resolvedName.endsWith('-outline')) {
    resolvedName = resolvedName.replace('-outline', '');
  }

  if (resolvedSource === 'feather') {
    return <Feather name={resolvedName as any} size={size} color={color} />;
  }

  if (resolvedSource === 'material') {
    return <MaterialCommunityIcons name={resolvedName as any} size={size} color={color} />;
  }

  return <Ionicons name={resolvedName as any} size={size} color={color} />;
}
