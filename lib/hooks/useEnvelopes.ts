/**
 * useEnvelopes — Zarf verileri için TanStack Query + Zustand Store hook'ları
 */
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { useEnvelopesStore, LocalEnvelope, LocalIncome, LocalIncomeCategory } from '@/store/envelopes';

export interface Envelope extends LocalEnvelope {
  spent: number;
}

export interface MonthlyStats {
  totalBudget: number;
  totalSpent: number;
  envelopeCount: number;
  totalIncome: number; // same as totalBudget now, but good to have
}

function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function getMonthEnd(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
}

export function useEnvelopes() {
  const user = useAuthStore((s) => s.user);
  const storeEnvelopes = useEnvelopesStore((s) => s.envelopes);
  const storeTransactions = useEnvelopesStore((s) => s.transactions);

  return useQuery<Envelope[]>({
    queryKey: ['envelopes', user?.id, storeEnvelopes, storeTransactions],
    queryFn: async () => {
      // Supabase yapılandırılmamışsa veya user yoksa store'daki yerel veriyi kullan
      if (!isSupabaseConfigured || !user) {
        const monthStart = new Date(getMonthStart()).getTime();
        const monthEnd = new Date(getMonthEnd()).getTime();

        return storeEnvelopes.map((env) => {
          const envTxs = storeTransactions.filter((tx) => {
            const txTime = new Date(tx.occurred_at).getTime();
            return tx.envelope_id === env.id && txTime >= monthStart && txTime <= monthEnd;
          });
          const spent = envTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);

          return {
            ...env,
            spent,
          };
        });
      }

      const monthStart = getMonthStart();
      const monthEnd = getMonthEnd();

      // Zarfları çek
      const { data: envelopes, error: envError } = await supabase
        .from('envelopes')
        .select('*')
        .order('sort_order', { ascending: true });

      if (envError) {
        console.warn('Supabase fetch error, fallback to local store:', envError);
        return storeEnvelopes.map((env) => {
          const envTxs = storeTransactions.filter((tx) => tx.envelope_id === env.id);
          return {
            ...env,
            spent: envTxs.reduce((sum, tx) => sum + Number(tx.amount), 0),
          };
        });
      }

      if (!envelopes || envelopes.length === 0) {
        return storeEnvelopes.map((env) => {
          const envTxs = storeTransactions.filter((tx) => tx.envelope_id === env.id);
          return {
            ...env,
            spent: envTxs.reduce((sum, tx) => sum + Number(tx.amount), 0),
          };
        });
      }

      // Her zarf için bu ayın harcamalarını topla
      const envelopeIds = envelopes.map((e) => e.id);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('envelope_id, amount')
        .in('envelope_id', envelopeIds)
        .gte('occurred_at', monthStart)
        .lte('occurred_at', monthEnd);

      const spentMap: Record<string, number> = {};
      (transactions ?? []).forEach((tx) => {
        spentMap[tx.envelope_id] = (spentMap[tx.envelope_id] ?? 0) + Number(tx.amount);
      });

      return envelopes.map((env) => ({
        ...env,
        monthly_limit: Number(env.monthly_limit),
        spent: spentMap[env.id] ?? 0,
      }));
    },
    staleTime: 1000,
  });
}

export function useIncomes() {
  const storeIncomes = useEnvelopesStore((s) => s.incomes);

  return useQuery<LocalIncome[]>({
    queryKey: ['incomes', storeIncomes],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        const monthStart = new Date(getMonthStart()).getTime();
        const monthEnd = new Date(getMonthEnd()).getTime();
        return storeIncomes
          .filter((inc) => {
            const txTime = new Date(inc.occurred_at).getTime();
            return txTime >= monthStart && txTime <= monthEnd;
          })
          .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
      }

      const monthStart = getMonthStart();
      const monthEnd = getMonthEnd();

      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .gte('occurred_at', monthStart)
        .lte('occurred_at', monthEnd)
        .order('occurred_at', { ascending: false });

      if (error || !data) {
        return storeIncomes
          .filter((inc) => {
            const txTime = new Date(inc.occurred_at).getTime();
            return txTime >= new Date(monthStart).getTime() && txTime <= new Date(monthEnd).getTime();
          })
          .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
      }
      return data ?? [];
    },
    staleTime: 1000,
  });
}

export function useIncomeCategories() {
  const storeIncomeCategories = useEnvelopesStore((s) => s.incomeCategories);

  return useQuery<LocalIncomeCategory[]>({
    queryKey: ['incomeCategories', storeIncomeCategories],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return storeIncomeCategories;
      }
      const { data, error } = await supabase
        .from('income_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error || !data) {
        return storeIncomeCategories;
      }
      return data ?? [];
    },
    staleTime: 1000,
  });
}

export function useMonthlyStats() {
  const { data: envelopes } = useEnvelopes();
  const { data: incomes } = useIncomes();

  const stats: MonthlyStats = {
    totalBudget: 0,
    totalSpent: 0,
    envelopeCount: 0,
    totalIncome: 0,
  };

  if (envelopes) {
    stats.envelopeCount = envelopes.length;
    stats.totalBudget = envelopes.reduce((sum, e) => sum + Number(e.monthly_limit), 0);
    stats.totalSpent = envelopes.reduce((sum, e) => sum + Number(e.spent), 0);
  }

  if (incomes) {
    const totalInc = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
    stats.totalIncome = totalInc;
  }

  return stats;
}

export function useEnvelopeTransactions(envelopeId: string) {
  const storeTransactions = useEnvelopesStore((s) => s.transactions);

  return useQuery({
    queryKey: ['transactions', envelopeId, storeTransactions],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        return storeTransactions
          .filter((tx) => tx.envelope_id === envelopeId)
          .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
      }

      const monthStart = getMonthStart();
      const monthEnd = getMonthEnd();

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('envelope_id', envelopeId)
        .gte('occurred_at', monthStart)
        .lte('occurred_at', monthEnd)
        .order('occurred_at', { ascending: false });

      if (error || !data) {
        return storeTransactions
          .filter((tx) => tx.envelope_id === envelopeId)
          .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
      }
      return data ?? [];
    },
    staleTime: 1000,
  });
}
