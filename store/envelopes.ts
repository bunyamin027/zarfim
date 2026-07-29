/**
 * Envelopes & Transactions Store — Zustand + AsyncStorage persistence
 *
 * Demo/Mock modunda ve Supabase senkronizasyonunda zarfların
 * ve harcamaların dinamik yönetimini sağlar.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export interface LocalEnvelope {
  id: string;
  name: string;
  icon: string;
  monthly_limit: number;
  color: string;
  is_recurring: boolean;
  sort_order: number;
  created_at: string;
  nameKey?: string;
}

export interface LocalTransaction {
  id: string;
  envelope_id: string;
  amount: number;
  occurred_at: string;
  note: string | null;
  merchant?: string | null;
  created_at: string;
}

interface EnvelopesState {
  envelopes: LocalEnvelope[];
  transactions: LocalTransaction[];
  
  // Actions
  setEnvelopes: (envelopes: LocalEnvelope[]) => void;
  setTransactions: (transactions: LocalTransaction[]) => void;
  addEnvelope: (envelope: Omit<LocalEnvelope, 'id' | 'created_at' | 'sort_order'>) => Promise<LocalEnvelope>;
  updateEnvelope: (id: string, updates: Partial<Omit<LocalEnvelope, 'id' | 'created_at'>>) => Promise<void>;
  deleteEnvelope: (id: string) => Promise<void>;
  addTransaction: (transaction: Omit<LocalTransaction, 'id' | 'created_at'>) => Promise<LocalTransaction>;
  deleteTransaction: (id: string) => Promise<void>;
  resetToDefaults: () => void;
}

const DEFAULT_ENVELOPES: LocalEnvelope[] = [
  {
    id: '1',
    name: 'Market',
    nameKey: 'envelope.grocery',
    icon: '🛒',
    monthly_limit: 3000,
    color: '#6F8F6A',
    is_recurring: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ulaşım',
    nameKey: 'envelope.transport',
    icon: '🚌',
    monthly_limit: 800,
    color: '#E8963A',
    is_recurring: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Eğlence',
    nameKey: 'envelope.entertainment',
    icon: '🎬',
    monthly_limit: 500,
    color: '#6F8F6A',
    is_recurring: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_TRANSACTIONS: LocalTransaction[] = [
  {
    id: 'tx-1',
    envelope_id: '1',
    amount: 850,
    occurred_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    note: 'Haftalık Mutfak Alışverişi',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'tx-2',
    envelope_id: '1',
    amount: 1000,
    occurred_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    note: 'Süpermarket',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'tx-3',
    envelope_id: '2',
    amount: 720,
    occurred_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    note: 'Aylık Akbil / Kart',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'tx-4',
    envelope_id: '3',
    amount: 200,
    occurred_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    note: 'Sinema Biletleri',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const useEnvelopesStore = create<EnvelopesState>()(
  persist(
    (set, get) => ({
      envelopes: DEFAULT_ENVELOPES,
      transactions: DEFAULT_TRANSACTIONS,

      setEnvelopes: (envelopes) => set({ envelopes }),
      setTransactions: (transactions) => set({ transactions }),

      addEnvelope: async (data) => {
        const newEnv: LocalEnvelope = {
          ...data,
          id: `env-${Date.now()}`,
          sort_order: get().envelopes.length + 1,
          created_at: new Date().toISOString(),
        };

        if (isSupabaseConfigured) {
          try {
            const { data: inserted, error } = await supabase
              .from('envelopes')
              .insert({
                name: newEnv.name,
                icon: newEnv.icon,
                monthly_limit: newEnv.monthly_limit,
                color: newEnv.color,
                is_recurring: newEnv.is_recurring,
                sort_order: newEnv.sort_order,
              })
              .select()
              .single();
            if (!error && inserted) {
              newEnv.id = inserted.id;
            }
          } catch (e) {
            console.error('Supabase envelope insert error:', e);
          }
        }

        set({ envelopes: [...get().envelopes, newEnv] });
        return newEnv;
      },

      updateEnvelope: async (id, updates) => {
        if (isSupabaseConfigured) {
          try {
            await supabase
              .from('envelopes')
              .update(updates)
              .eq('id', id);
          } catch (e) {
            console.error('Supabase envelope update error:', e);
          }
        }

        set({
          envelopes: get().envelopes.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        });
      },

      deleteEnvelope: async (id) => {
        if (isSupabaseConfigured) {
          try {
            await supabase.from('envelopes').delete().eq('id', id);
          } catch (e) {
            console.error('Supabase envelope delete error:', e);
          }
        }

        set({
          envelopes: get().envelopes.filter((e) => e.id !== id),
          transactions: get().transactions.filter((tx) => tx.envelope_id !== id),
        });
      },

      addTransaction: async (data) => {
        const newTx: LocalTransaction = {
          ...data,
          id: `tx-${Date.now()}`,
          created_at: new Date().toISOString(),
        };

        if (isSupabaseConfigured) {
          try {
            const { data: inserted, error } = await supabase
              .from('transactions')
              .insert({
                envelope_id: newTx.envelope_id,
                amount: newTx.amount,
                occurred_at: newTx.occurred_at,
                note: newTx.note,
              })
              .select()
              .single();
            if (!error && inserted) {
              newTx.id = inserted.id;
            }
          } catch (e) {
            console.error('Supabase transaction insert error:', e);
          }
        }

        set({ transactions: [newTx, ...get().transactions] });
        return newTx;
      },

      deleteTransaction: async (id) => {
        if (isSupabaseConfigured) {
          try {
            await supabase.from('transactions').delete().eq('id', id);
          } catch (e) {
            console.error('Supabase transaction delete error:', e);
          }
        }

        set({
          transactions: get().transactions.filter((tx) => tx.id !== id),
        });
      },

      resetToDefaults: () => {
        set({ envelopes: DEFAULT_ENVELOPES, transactions: DEFAULT_TRANSACTIONS });
      },
    }),
    {
      name: 'zarfim-envelopes-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
