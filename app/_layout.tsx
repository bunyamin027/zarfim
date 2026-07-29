/**
 * Root Layout — Zarfım
 *
 * Font yükleme, Auth state izleme, TanStack Query provider.
 * Giriş yapılmamışsa auth ekranına, yapılmışsa tabs'a yönlendirir.
 */
import {
  Fraunces_500Medium,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
import '@/lib/i18n'; // i18n modülünü başlat

import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/store/auth';
import { configureRevenueCat } from '@/lib/revenuecat';
import { useSubscriptionStore } from '@/store/subscription';
import { initializeLanguage } from '@/lib/i18n';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fraunces_500Medium,
    Fraunces_700Bold,
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
    if (error) throw error;
  }, [error]);

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

  useEffect(() => {
    if (loaded && !isAuthLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isAuthLoading]);

  if (!loaded || isAuthLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      // Giriş yapılmamış ve auth ekranında değil → auth'a yönlendir
      router.replace('/auth');
    } else if (isAuthenticated && inAuthGroup) {
      // Giriş yapılmış ama hâlâ auth ekranında → ana sayfaya yönlendir
      router.replace('/');
    }
  }, [isAuthenticated, segments]);

  return (
    <Stack>
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
        name="envelope/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
