/**
 * Subscription Store — Zustand
 *
 * Premium durum yönetimi. RevenueCat + Supabase subscriptions
 * tablosu ile çift kaynaklı kontrol.
 */
import { create } from 'zustand';
import {
  isRevenueCatConfigured,
  checkPremiumStatus,
  getOfferings,
  purchasePackage,
  restorePurchases as rcRestore,
  MOCK_OFFERING,
  type MockPackage,
} from '@/lib/revenuecat';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

interface SubscriptionState {
  isPremium: boolean;
  tier: 'free' | 'premium';
  isLoading: boolean;
  error: string | null;

  // Offerings
  currentOffering: any | null;
  mockOffering: MockPackage;

  // Actions
  checkSubscription: () => Promise<void>;
  purchase: (pkg: any) => Promise<boolean>;
  restore: () => Promise<boolean>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isPremium: false,
  tier: 'free',
  isLoading: false,
  error: null,
  currentOffering: null,
  mockOffering: MOCK_OFFERING,

  checkSubscription: async () => {
    set({ isLoading: true, error: null });

    try {
      let isPremium = false;

      // 1. RevenueCat'ten kontrol (birincil kaynak)
      if (isRevenueCatConfigured) {
        isPremium = await checkPremiumStatus();
      }

      // 2. RevenueCat yoksa Supabase'den fallback
      if (!isRevenueCatConfigured && isSupabaseConfigured) {
        const user = useAuthStore.getState().user;
        if (user) {
          const { data } = await supabase
            .from('subscriptions')
            .select('tier, status')
            .eq('user_id', user.id)
            .single();

          if (data) {
            isPremium = data.tier === 'premium' && data.status === 'active';
          }
        }
      }

      // 3. Offerings çek
      let currentOffering = null;
      if (isRevenueCatConfigured) {
        currentOffering = await getOfferings();
      }

      set({
        isPremium,
        tier: isPremium ? 'premium' : 'free',
        currentOffering,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Abonelik kontrol edilemedi',
      });
    }
  },

  purchase: async (pkg: any) => {
    set({ isLoading: true, error: null });

    try {
      const result = await purchasePackage(pkg);

      if (result.success && result.isPremium) {
        set({
          isPremium: true,
          tier: 'premium',
          isLoading: false,
        });

        // Supabase'i de güncelle (webhook gelene kadar lokal senkron)
        if (isSupabaseConfigured) {
          const user = useAuthStore.getState().user;
          if (user) {
            await supabase
              .from('subscriptions')
              .update({ tier: 'premium', status: 'active' })
              .eq('user_id', user.id);
          }
        }

        return true;
      }

      set({ isLoading: false });
      return false;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Satın alma başarısız',
      });
      return false;
    }
  },

  restore: async () => {
    set({ isLoading: true, error: null });

    try {
      if (!isRevenueCatConfigured) {
        set({
          isLoading: false,
          error: 'Satın alma servisi yapılandırılmamış',
        });
        return false;
      }

      const result = await rcRestore();

      if (result.isPremium) {
        set({
          isPremium: true,
          tier: 'premium',
          isLoading: false,
        });

        // Supabase senkron
        if (isSupabaseConfigured) {
          const user = useAuthStore.getState().user;
          if (user) {
            await supabase
              .from('subscriptions')
              .update({ tier: 'premium', status: 'active' })
              .eq('user_id', user.id);
          }
        }

        return true;
      }

      set({
        isLoading: false,
        error: 'Geri yüklenecek satın alma bulunamadı',
      });
      return false;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Geri yükleme başarısız',
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
