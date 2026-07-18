/**
 * Mock zarf verileri — Faz 1 fallback verisi
 * i18n anahtarları kullanır, çeviri bileşende yapılır.
 */
import i18n from '@/lib/i18n';

export interface Envelope {
  id: string;
  name: string;
  nameKey: string; // i18n anahtarı
  icon: string;
  monthlyLimit: number;
  spent: number;
  color: string;
  isRecurring: boolean;
}

function createMockEnvelopes(): Envelope[] {
  return [
    {
      id: '1',
      name: i18n.t('envelope.grocery'),
      nameKey: 'envelope.grocery',
      icon: '🛒',
      monthlyLimit: 3000,
      spent: 1850,
      color: '#6F8F6A',
      isRecurring: true,
    },
    {
      id: '2',
      name: i18n.t('envelope.transport'),
      nameKey: 'envelope.transport',
      icon: '🚌',
      monthlyLimit: 800,
      spent: 720,
      color: '#E8963A',
      isRecurring: true,
    },
    {
      id: '3',
      name: i18n.t('envelope.entertainment'),
      nameKey: 'envelope.entertainment',
      icon: '🎬',
      monthlyLimit: 500,
      spent: 200,
      color: '#6F8F6A',
      isRecurring: true,
    },
    {
      id: '4',
      name: i18n.t('envelope.bills'),
      nameKey: 'envelope.bills',
      icon: '📄',
      monthlyLimit: 2500,
      spent: 2600,
      color: '#C1442D',
      isRecurring: true,
    },
  ];
}

// Getter — dil değiştiğinde güncel çeviri dönsün
export function getMockEnvelopes(): Envelope[] {
  return createMockEnvelopes();
}

export function getMockMonthlySummary() {
  const envelopes = createMockEnvelopes();
  return {
    totalBudget: envelopes.reduce((sum, e) => sum + e.monthlyLimit, 0),
    totalSpent: envelopes.reduce((sum, e) => sum + e.spent, 0),
  };
}

// Legacy uyumluluk
export const MOCK_ENVELOPES = createMockEnvelopes();
export const MOCK_MONTHLY_SUMMARY = {
  totalBudget: MOCK_ENVELOPES.reduce((sum, e) => sum + e.monthlyLimit, 0),
  totalSpent: MOCK_ENVELOPES.reduce((sum, e) => sum + e.spent, 0),
};
