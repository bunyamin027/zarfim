/**
 * Tab navigasyonu — Zarfım
 * Modern, minimalist, Apple tarzı ikonlar ve tipografi
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { ColorValue } from 'react-native';
import { BottomTabBar } from 'expo-router/build/react-navigation/bottom-tabs';
import AdBanner from '@/components/AdBanner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '@/lib/theme';

export default function TabLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  // Android gesture/3-tuş nav bar ve iPhone home indicator için alt boşluk
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <Tabs
      tabBar={(props) => (
        <View>
          <AdBanner />
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={{
        tabBarActiveTintColor: Colors.paper,
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: Colors.ink,
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          borderTopWidth: 1,
          height: 60 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 8,
        },
        // Etiket her cihazda ikonun altında; tek satır, sığmazsa küçülür (bkz. TabLabel)
        tabBarLabelPosition: 'below-icon',
        tabBarLabel: ({ color, children }) => <TabLabel color={color}>{children}</TabLabel>,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'mail' : 'mail-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="incomes"
        options={{
          title: t('tabs.incomes'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'arrow-down-circle' : 'arrow-down-circle-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: t('tabs.expenses'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: t('tabs.reports'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'pie-chart' : 'pie-chart-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

/**
 * Sekme etiketi — her dilde, her ekran genişliğinde ve büyük yazı ayarında kesilmeden sığar.
 * - Sistem yazı boyutu etiketi en fazla %15 büyütebilir (erişilebilirlik korunur, düzen bozulmaz).
 * - Yine de sığmazsa (dar ekran / uzun çeviri) yazı otomatik küçülür; "…" ile kesilmez.
 */
function TabLabel({ color, children }: { color: ColorValue; children: string }) {
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.75}
      maxFontSizeMultiplier={1.15}
      style={[styles.tabLabel, { color }]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontFamily: Fonts.bodyMedium,
    fontSize: 10.5,
    letterSpacing: 0.2,
    marginTop: 2,
  },
});
