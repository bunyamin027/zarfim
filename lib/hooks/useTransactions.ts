/**
 * İşlemler (Transactions) Hook'u
 * Grafikler ve CSV dışa aktarma için kullanılır.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

export interface Transaction {
  id: string;
  envelope_id: string;
  amount: number;
  date: string;
  note: string | null;
  // Join ile gelen zarf detayları:
  envelope_name: string;
  envelope_name_key: string | null;
  envelope_color: string;
  envelope_icon: string;
}

export function useTransactions(isPremium: boolean) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['transactions', user?.id, isPremium],
    queryFn: async () => {
      if (!user) return [];

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
        .order('date', { ascending: true }); // Trend grafiği için eskiden yeniye

      // Free kullanıcılar için sadece son 30 gün
      if (!isPremium) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('date', thirtyDaysAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      // Supabase'in nested yapısını düzleştir (flatten)
      return (data as any[]).map((row) => ({
        id: row.id,
        envelope_id: row.envelope_id,
        amount: row.amount,
        date: row.date,
        note: row.note,
        envelope_name: row.envelopes?.name || 'Bilinmeyen Zarf',
        envelope_name_key: row.envelopes?.name_key,
        envelope_color: row.envelopes?.color || '#C1442D',
        envelope_icon: row.envelopes?.icon || '✉️',
      })) as Transaction[];
    },
    enabled: !!user,
  });
}
