/**
 * İşlemler (Transactions) Hook'u
 * Grafikler ve CSV dışa aktarma için kullanılır.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { useEnvelopesStore } from '@/store/envelopes';

export interface Transaction {
  id: string;
  envelope_id: string;
  amount: number;
  date: string;
  note: string | null;
  envelope_name: string;
  envelope_name_key: string | null;
  envelope_color: string;
  envelope_icon: string;
}

export function useTransactions(isPremium: boolean) {
  const user = useAuthStore((s) => s.user);
  const storeTransactions = useEnvelopesStore((s) => s.transactions);
  const storeEnvelopes = useEnvelopesStore((s) => s.envelopes);

  return useQuery({
    queryKey: ['transactions', user?.id, isPremium, storeTransactions, storeEnvelopes],
    queryFn: async () => {
      if (!isSupabaseConfigured || !user) {
        let txs = [...storeTransactions];

        // Free kullanıcılar için son 30 gün
        if (!isPremium) {
          const thirtyDaysAgo = Date.now() - 30 * 86400000;
          txs = txs.filter((tx) => new Date(tx.occurred_at).getTime() >= thirtyDaysAgo);
        }

        return txs
          .map((tx) => {
            const env = storeEnvelopes.find((e) => e.id === tx.envelope_id);
            return {
              id: tx.id,
              envelope_id: tx.envelope_id,
              amount: Number(tx.amount),
              date: tx.occurred_at,
              note: tx.note,
              envelope_name: env?.name || 'Bilinmeyen Zarf',
              envelope_name_key: env?.nameKey || null,
              envelope_color: env?.color || '#C1442D',
              envelope_icon: env?.icon || '✉️',
            } as Transaction;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }

      let query = supabase
        .from('transactions')
        .select(`
          id,
          envelope_id,
          amount,
          date,
          note,
          envelopes (
            name,
            name_key,
            color,
            icon
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (!isPremium) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('date', thirtyDaysAgo.toISOString());
      }

      const { data, error } = await query;

      if (error || !data) {
        let txs = [...storeTransactions];
        if (!isPremium) {
          const thirtyDaysAgo = Date.now() - 30 * 86400000;
          txs = txs.filter((tx) => new Date(tx.occurred_at).getTime() >= thirtyDaysAgo);
        }

        return txs.map((tx) => {
          const env = storeEnvelopes.find((e) => e.id === tx.envelope_id);
          return {
            id: tx.id,
            envelope_id: tx.envelope_id,
            amount: Number(tx.amount),
            date: tx.occurred_at,
            note: tx.note,
            envelope_name: env?.name || 'Bilinmeyen Zarf',
            envelope_name_key: env?.nameKey || null,
            envelope_color: env?.color || '#C1442D',
            envelope_icon: env?.icon || '✉️',
          } as Transaction;
        });
      }

      return (data as any[]).map((row) => ({
        id: row.id,
        envelope_id: row.envelope_id,
        amount: Number(row.amount),
        date: row.date || row.occurred_at,
        note: row.note,
        envelope_name: row.envelopes?.name || 'Bilinmeyen Zarf',
        envelope_name_key: row.envelopes?.name_key,
        envelope_color: row.envelopes?.color || '#C1442D',
        envelope_icon: row.envelopes?.icon || '✉️',
      })) as Transaction[];
    },
    staleTime: 1000,
  });
}
