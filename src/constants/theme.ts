export const colors = {
  // Backgrounds
  bg: '#0A0A0A',
  bgCard: '#111111',
  bgElevated: '#181818',

  // Gold accent — the color of mastery
  gold: '#C9A84C',
  goldMuted: '#8A6E2A',
  goldFaint: '#1E1709',

  // Text
  textPrimary: '#F5F0E8',
  textSecondary: '#8A8070',
  textMuted: '#4A4438',

  // Borders
  border: '#222222',
  borderLight: '#2A2A2A',

  // Phase colors
  apprentice: '#6B7280',
  creative: '#8B5CF6',
  master: '#C9A84C',

  // Session type colors
  deliberate: '#C9A84C',
  observational: '#60A5FA',
  passive: '#6B7280',

  // Quality colors (1-5)
  qualityLow: '#EF4444',
  qualityMid: '#F59E0B',
  qualityHigh: '#10B981',

  // Utility
  success: '#10B981',
  danger: '#EF4444',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  displayLarge: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  displayMedium: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  title: { fontSize: 20, fontWeight: '600' as const },
  subtitle: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 11, fontWeight: '400' as const, letterSpacing: 0.5 },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.2, textTransform: 'uppercase' as const },
};
