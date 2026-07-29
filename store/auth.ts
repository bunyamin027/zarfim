/**
 * Auth Store — Zustand
 *
 * Supabase Auth ile email + Apple/Google Sign-In.
 * Session yönetimi ve auth state izleme.
 *
 * Native Apple Sign-In & WebBrowser OAuth entegrasyonu.
 */
import { create } from 'zustand';
import { Platform, Alert } from 'react-native';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const handleAuthUrl = async (
  url: string,
  set: (state: Partial<AuthState>) => void
) => {
  const hash = url.includes('#') ? url.split('#')[1] : '';
  const query = url.includes('?') ? url.split('?')[1] : '';
  const params = new URLSearchParams(hash || query);

  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');

  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;

    set({
      session: data.session,
      user: data.user,
      isAuthenticated: !!data.session,
      isLoading: false,
    });
    return;
  }

  const code = params.get('code');
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;

    set({
      session: data.session,
      user: data.user,
      isAuthenticated: !!data.session,
      isLoading: false,
    });
    return;
  }

  throw new Error('Oturum bilgisi alınamadı.');
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    if (!isSupabaseConfigured) {
      set({
        isLoading: false,
        isAuthenticated: true,
        user: null,
      });
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading: false,
      });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session,
        });
      });
    } catch (error) {
      set({ isLoading: false, error: (error as AuthError).message });
    }
  },

  signUpWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      set({
        session: data.session,
        user: data.user,
        isAuthenticated: !!data.session,
        isLoading: false,
      });
    } catch (error) {
      const msg = (error as AuthError).message;
      Alert.alert('Kayıt Hatası', msg);
      set({ isLoading: false, error: msg });
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({
        session: data.session,
        user: data.user,
        isAuthenticated: !!data.session,
        isLoading: false,
      });
    } catch (error) {
      const msg = (error as AuthError).message;
      Alert.alert('Giriş Hatası', msg);
      set({ isLoading: false, error: msg });
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true, error: null });
    try {
      let isAppleAvailable = false;
      try {
        isAppleAvailable = await AppleAuthentication.isAvailableAsync();
      } catch (e) {
        isAppleAvailable = false;
      }

      if (isAppleAvailable && Platform.OS === 'ios') {
        const rawNonce = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
        const hashedNonce = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          rawNonce
        );

        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
          nonce: hashedNonce,
        });

        if (credential.identityToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
            nonce: rawNonce,
          });

          if (error) {
            Alert.alert('Supabase Apple Hatası', error.message);
            throw error;
          }

          set({
            session: data.session,
            user: data.user,
            isAuthenticated: !!data.session,
            isLoading: false,
          });
          return;
        } else {
          throw new Error('Apple kimlik doğrulama yanıtı alınamadı.');
        }
      } else {
        const redirectTo = makeRedirectUri({ scheme: 'zarfim' });
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo,
            skipBrowserRedirect: true,
          },
        });

        if (error) {
          Alert.alert('Supabase Apple OAuth Hatası', error.message);
          throw error;
        }
        if (!data?.url) throw new Error('Apple OAuth adresi alınamadı.');

        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

        if (res.type === 'success' && res.url) {
          await handleAuthUrl(res.url, set);
        } else {
          set({ isLoading: false });
        }
      }
    } catch (error: any) {
      const msg = error?.message || String(error);
      if (error?.code === 'ERR_REQUEST_CANCELED' || error?.code === 'ERR_CANCELED' || error?.code === '1001') {
        set({ isLoading: false });
        return;
      }
      Alert.alert('Apple Giriş Hatası', msg);
      set({ isLoading: false, error: msg });
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const redirectTo = makeRedirectUri({ scheme: 'zarfim' });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        Alert.alert('Supabase Google OAuth Hatası', error.message);
        throw error;
      }
      if (!data?.url) {
        Alert.alert('Hata', 'Google OAuth adresi alınamadı.');
        throw new Error('Google OAuth adresi alınamadı.');
      }

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

      if (res.type === 'success' && res.url) {
        await handleAuthUrl(res.url, set);
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      const msg = error?.message || String(error);
      if (error?.code === 'ERR_REQUEST_CANCELED' || error?.code === 'ERR_CANCELED') {
        set({ isLoading: false });
        return;
      }
      Alert.alert('Google Giriş Hatası', msg);
      set({ isLoading: false, error: msg });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: (error as AuthError).message });
    }
  },

  clearError: () => set({ error: null }),
}));
