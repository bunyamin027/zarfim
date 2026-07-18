/**
 * Auth Store — Zustand
 *
 * Supabase Auth ile email + Apple/Google Sign-In.
 * Session yönetimi ve auth state izleme.
 *
 * Supabase yapılandırılmamışsa (env yok) uygulama
 * auth gerektirmeden mock modda çalışır.
 */
import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Session, User, AuthError } from '@supabase/supabase-js';

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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  initialize: async () => {
    // Supabase yapılandırılmamışsa → mock mod (auth bypass)
    if (!isSupabaseConfigured) {
      set({
        isLoading: false,
        isAuthenticated: true, // Auth olmadan geçiş izni
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

      // Auth state değişikliklerini dinle
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
      set({ isLoading: false, error: (error as AuthError).message });
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
      set({ isLoading: false, error: (error as AuthError).message });
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
      });

      if (error) throw error;
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: (error as AuthError).message });
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: (error as AuthError).message });
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
