/**
 * Tab navigasyonu — Zarfım
 * i18n ile çevrilmiş tab isimleri.
 */
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/lib/theme';

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 22, opacity: color === Colors.ink ? 0.4 : 1 }}>{emoji}</Text>;
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.stamp,
        tabBarInactiveTintColor: Colors.ink,
        tabBarStyle: {
          backgroundColor: Colors.ink,
          borderTopColor: Colors.inkLight,
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Manrope_500Medium',
          fontSize: 10, // slightly smaller to fit 5 tabs
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <TabIcon emoji="📬" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="incomes"
        options={{
          title: t('tabs.incomes'),
          tabBarIcon: ({ color }) => <TabIcon emoji="💵" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: t('tabs.expenses'),
          tabBarIcon: ({ color }) => <TabIcon emoji="💸" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: t('tabs.reports'),
          tabBarIcon: ({ color }) => <TabIcon emoji="📊" color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" color={color as string} />,
        }}
      />
    </Tabs>
  );
}
