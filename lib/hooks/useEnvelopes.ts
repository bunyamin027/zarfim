/**
 * useEnvelopes — Zarf verileri için TanStack Query hook'ları
 *
 * Supabase'den kullanıcının zarflarını ve aylık harcama
 * istatistiklerini çeker.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

// ─── Tipler ───────────────────────────────────
export interface Envelope {
  id: string;
  user_id: string;
  household_id: string | null;
  name: string;
  icon: string;
  monthly_limit: number;
  color: string;
  is_recurring: boolean;
  sort_order: number;
  created_at: string;
  /** Bu ay harcanan toplam — join ile hesaplanır */
  spent: number;
}

export interface MonthlyStats {
  totalBudget: number;
  totalSpent: number;
  envelopeCount: number;
}

// ─── Yardımcı: Bu ayın başlangıcı ───────────────
function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function getMonthEnd(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
}

// ─── Hook: Kullanıcının zarflarını çek ──────────
export function useEnvelopes() {
  const user = useAuthStore((s) => s.user);

  return useQuery<Envelope[]>({
    queryKey: ['envelopes', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const monthStart = getMonthStart();
      const monthEnd = getMonthEnd();

      // Zarfları çek
      const { data: envelopes, error: envError } = await supabase
        .from('envelopes')
        .select('*')
        .order('sort_order', { ascending: true });

      if (envError) throw envError;
      if (!envelopes) return [];

      // Her zarf için bu ayın harcamalarını topla
      const envelopeIds = envelopes.map((e) => e.id);

      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('envelope_id, amount')
        .in('envelope_id', envelopeIds)
        .gte('occurred_at', monthStart)
        .lte('occurred_at', monthEnd);

      if (txError) throw txError;

      // Envelope başına harcama toplamı
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
    enabled: !!user,
  });
}

// ─── Hook: Aylık bütçe özeti ──────────────────
export function useMonthlyStats() {
  const { data: envelopes } = useEnvelopes();

  const stats: MonthlyStats = {
    totalBudget: 0,
    totalSpent: 0,
    envelopeCount: 0,
  };

  if (envelopes) {
    stats.envelopeCount = envelopes.length;
    stats.totalBudget = envelopes.reduce((sum, e) => sum + e.monthly_limit, 0);
    stats.totalSpent = envelopes.reduce((sum, e) => sum + e.spent, 0);
  }

  return stats;
}

// ─── Hook: Tek zarfın bu ayki işlemleri ──────────
export function useEnvelopeTransactions(envelopeId: string) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['transactions', envelopeId],
    queryFn: async () => {
      const monthStart = getMonthStart();
      const monthEnd = getMonthEnd();

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('envelope_id', envelopeId)
        .gte('occurred_at', monthStart)
        .lte('occurred_at', monthEnd)
        .order('occurred_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && !!envelopeId,
  });
}
