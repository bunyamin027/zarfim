/**
 * Screenshot Seed — yalnızca EXPO_PUBLIC_SCREENSHOT_MODE=1 ile derlenen
 * build'lerde çalışır. Store görselleri için dile göre zengin demo verisi
 * yükler ve premium'u açar. Production build'lerde etkisizdir.
 */
import { useEnvelopesStore } from '@/store/envelopes';
import { useSubscriptionStore } from '@/store/subscription';
import { useCurrencyStore } from '@/store/currency';
import { getCurrentLanguage } from '@/lib/i18n';
import { Platform, Settings } from 'react-native';

/** iOS: `-shotRoute envelope/x` launch argümanı ile açılacak rota */
export function getShotRoute(): string | null {
  if (!isScreenshotMode || Platform.OS !== 'ios') return null;
  const r = Settings.get('shotRoute');
  return typeof r === 'string' && r.length ? r : null;
}

export const isScreenshotMode = process.env.EXPO_PUBLIC_SCREENSHOT_MODE === '1';

type Lang = 'tr' | 'en' | 'ar';

const DATA: Record<Lang, {
  currency: 'TRY' | 'USD' | 'SAR';
  scale: number;
  env: [string, string, number, string][];
  tx: [number, number, string, number][]; // envIndex, amount, note, daysAgo
  incCats: [string, string, string][];
  inc: [number, number, string, number][];
}> = {
  tr: {
    currency: 'TRY', scale: 1,
    env: [
      ['Market', 'cart-outline', 9000, '#2E6B4F'],
      ['Kira & Ev', 'home-outline', 18000, '#C9973A'],
      ['Ulaşım', 'bus-outline', 3000, '#E8963A'],
      ['Faturalar', 'flash-outline', 4500, '#3A6EA5'],
      ['Eğlence', 'film-outline', 2500, '#8E5BB5'],
      ['Tatil Fonu', 'airplane-outline', 6000, '#C1442D'],
    ],
    tx: [
      [0, 1840, 'Haftalık market alışverişi', 1], [0, 960, 'Manav & fırın', 4], [0, 2250, 'Toptan alışveriş', 9],
      [1, 18000, 'Aylık kira', 2], [2, 1450, 'İstanbulkart yükleme', 3], [2, 620, 'Taksi', 6],
      [3, 1380, 'Elektrik faturası', 5], [3, 690, 'İnternet', 7], [4, 540, 'Sinema biletleri', 1],
      [4, 780, 'Konser', 8], [5, 2500, 'Uçak bileti birikimi', 10],
    ],
    incCats: [['Maaş', 'wallet-outline', '#2E6B4F'], ['Serbest İş', 'briefcase-outline', '#C9973A'], ['Kira Geliri', 'home-outline', '#3A6EA5']],
    inc: [[0, 52000, 'Aylık maaş', 2], [1, 8500, 'Web projesi', 6], [2, 7500, 'Daire kirası', 3]],
  },
  en: {
    currency: 'USD', scale: 1,
    env: [
      ['Groceries', 'cart-outline', 650, '#2E6B4F'],
      ['Rent & Home', 'home-outline', 1800, '#C9973A'],
      ['Transport', 'bus-outline', 250, '#E8963A'],
      ['Bills', 'flash-outline', 320, '#3A6EA5'],
      ['Fun & Dining', 'restaurant-outline', 300, '#8E5BB5'],
      ['Vacation Fund', 'airplane-outline', 500, '#C1442D'],
    ],
    tx: [
      [0, 142.6, 'Weekly groceries', 1], [0, 58.4, 'Farmers market', 4], [0, 186.2, 'Costco run', 9],
      [1, 1800, 'Monthly rent', 2], [2, 95, 'Metro card', 3], [2, 38.5, 'Uber', 6],
      [3, 112.3, 'Electricity', 5], [3, 65, 'Internet', 7], [4, 64.8, 'Dinner out', 1],
      [4, 42, 'Movie night', 8], [5, 200, 'Flight savings', 10],
    ],
    incCats: [['Salary', 'wallet-outline', '#2E6B4F'], ['Freelance', 'briefcase-outline', '#C9973A'], ['Side Hustle', 'storefront-outline', '#3A6EA5']],
    inc: [[0, 4800, 'Monthly salary', 2], [1, 950, 'Design project', 6], [2, 300, 'Etsy shop', 3]],
  },
  ar: {
    currency: 'SAR', scale: 1,
    env: [
      ['البقالة', 'cart-outline', 2500, '#2E6B4F'],
      ['الإيجار والمنزل', 'home-outline', 6000, '#C9973A'],
      ['المواصلات', 'car-outline', 900, '#E8963A'],
      ['الفواتير', 'flash-outline', 1100, '#3A6EA5'],
      ['الترفيه', 'film-outline', 800, '#8E5BB5'],
      ['صندوق السفر', 'airplane-outline', 2000, '#C1442D'],
    ],
    tx: [
      [0, 540, 'تسوق أسبوعي', 1], [0, 210, 'خضار وفواكه', 4], [0, 680, 'هايبر ماركت', 9],
      [1, 6000, 'الإيجار الشهري', 2], [2, 320, 'وقود', 3], [2, 140, 'أوبر', 6],
      [3, 420, 'فاتورة الكهرباء', 5], [3, 230, 'الإنترنت', 7], [4, 180, 'سينما', 1],
      [4, 260, 'عشاء عائلي', 8], [5, 750, 'ادخار للسفر', 10],
    ],
    incCats: [['الراتب', 'wallet-outline', '#2E6B4F'], ['عمل حر', 'briefcase-outline', '#C9973A'], ['دخل إيجار', 'home-outline', '#3A6EA5']],
    inc: [[0, 15000, 'الراتب الشهري', 2], [1, 2800, 'مشروع تصميم', 6], [2, 2000, 'إيجار شقة', 3]],
  },
};

// Tüm işlemler bu ay içinde kalsın diye 'gün' yerine 3 saatlik adımlar
const ago = (d: number) => new Date(Date.now() - 3 * 3600000 * d).toISOString();

export function seedScreenshotData() {
  if (!isScreenshotMode) return;
  const lang = (getCurrentLanguage() as Lang) || 'tr';
  const d = DATA[lang] ?? DATA.tr;

  const envelopes = d.env.map(([name, icon, limit, color], i) => ({
    id: `s-env-${i}`, name, icon, monthly_limit: limit, color,
    is_recurring: true, sort_order: i + 1, created_at: ago(30),
  }));
  const transactions = d.tx.map(([e, amount, note, days], i) => ({
    id: `s-tx-${i}`, envelope_id: `s-env-${e}`, amount, note,
    occurred_at: ago(days), created_at: ago(days),
  }));
  const incomeCategories = d.incCats.map(([name, icon, color], i) => ({
    id: `s-ic-${i}`, name, icon, color, sort_order: i + 1, created_at: ago(30),
  }));
  const incomes = d.inc.map(([c, amount, note, days], i) => ({
    id: `s-in-${i}`, category_id: `s-ic-${c}`, amount, note,
    occurred_at: ago(days), created_at: ago(days),
  }));

  useEnvelopesStore.setState({ envelopes, transactions, incomes, incomeCategories } as any);
  useCurrencyStore.setState({ currency: d.currency } as any);
  // Paywall çekiminde 'zaten premium' uyarısı çıkmasın
  useSubscriptionStore.setState({ isPremium: getShotRoute() !== 'paywall' } as any);
}
