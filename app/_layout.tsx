/**
 * Root Layout — Zarfım
 *
 * Font yükleme, Auth state izleme, TanStack Query provider.
 * Giriş yapılmamışsa auth ekranına, yapılmışsa tabs'a yönlendirir.
 */
import {
  Manrope_200ExtraLight,
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '@/lib/i18n'; // i18n modülünü başlat

import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '@/lib/theme';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/store/auth';
import { configureRevenueCat } from '@/lib/revenuecat';
import { useSubscriptionStore } from '@/store/subscription';
import { initializeLanguage } from '@/lib/i18n';

SplashScreen.preventAutoHideAsync();

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Manrope_200ExtraLight,
    Manrope_300Light,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  const initialize = useAuthStore((s) => s.initialize);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const checkSubscription = useSubscriptionStore((s) => s.checkSubscription);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Auth ve dil state'lerini başlat
  useEffect(() => {
    initialize();
    initializeLanguage();
  }, []);

  // Auth başarılı olunca RevenueCat'i başlat ve abonelik kontrol et
  useEffect(() => {
    if (isAuthenticated) {
      configureRevenueCat(user?.id);
      checkSubscription();
    }
  }, [isAuthenticated]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.ink }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <RootLayoutNav />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Giriş yapılmamış ve auth ekranında değil → auth'a yönlendir
      router.replace('/auth');
    } else if (user && inAuthGroup) {
      // Gerçekten giriş yapılmış bir kullanıcı auth ekranındaysa → ana sayfaya yönlendir
      router.replace('/');
    }
  }, [isAuthenticated, user, segments]);

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: Colors.ink },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="auth"
        options={{
          headerShown: false,
          // Auth ekranında geri butonu olmasın
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="paywall"
        options={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="add-expense"
        options={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="add-envelope"
        options={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="add-income"
        options={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="add-income-category"
        options={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="envelope/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
