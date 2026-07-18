/**
 * Zarfım — Tasarım Token'ları
 * CLAUDE.md bölüm 9'dan birebir alınmıştır.
 */

export const Colors = {
  ink: '#1C2541',       // Koyu lacivert — başlıklar, arka plan
  paper: '#EFE6D3',     // Kraft kağıt — zarf kartları
  stamp: '#C1442D',     // Pul kırmızısı — ana aksiyon rengi
  gold: '#C9973A',      // Vurgu, premium
  sage: '#6F8F6A',      // Bütçede olumlu durum (bütçe altında)

  // Türetilmiş renkler
  inkLight: '#2A3A5C',  // ink'in açık tonu — card alt metinleri
  paperDark: '#D9D0BD', // paper'ın koyu tonu — kenarlıklar
  stampLight: '#D4665A', // stamp'ın açık tonu — hover/pressed
  white: '#FFFFFF',
  black: '#000000',

  // Durum renkleri
  warning: '#E8963A',   // Bütçe %80+ dolduğunda
  danger: '#C1442D',    // Bütçe aşımında (stamp ile aynı)
  success: '#6F8F6A',   // Bütçe altında (sage ile aynı)
} as const;

export const Fonts = {
  display: 'Fraunces_700Bold',       // Başlıklar
  displayMedium: 'Fraunces_500Medium', // Alt başlıklar
  body: 'Manrope_400Regular',        // Gövde metni
  bodyMedium: 'Manrope_500Medium',   // Vurgulu gövde
  bodySemiBold: 'Manrope_600SemiBold', // Yarı kalın
  bodyBold: 'Manrope_700Bold',       // Kalın gövde
  // Cairo — Arapça (Faz 5'te aktif edilecek)
} as const;

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Shadows = {
  card: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLifted: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

const theme = {
  Colors,
  Fonts,
  FontSizes,
  Spacing,
  BorderRadius,
  Shadows,
} as const;

export default theme;
