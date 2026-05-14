/**
 * Cuatro Patitas - Design System Tokens
 * Sistema unificado para Web y Mobile (React Native / Expo)
 * Soporta modo claro/oscuro automático y breakpoints responsive
 */

import { Platform, Dimensions, useColorScheme } from 'react-native';

// ─── BREAKPOINTS ───
const { width: SCREEN_W } = Dimensions.get('window');

export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

export const isWeb = Platform.OS === 'web';
export const isMobile = !isWeb || SCREEN_W < Breakpoints.tablet;
export const isTablet = isWeb && SCREEN_W >= Breakpoints.tablet && SCREEN_W < Breakpoints.desktop;
export const isDesktop = isWeb && SCREEN_W >= Breakpoints.desktop;

// ─── PALETA DE COLORES ───
// Base colors (no cambian entre modos)
const BaseColors = {
  // Primarios - Azul confianza
  primary50: '#EFF6FF',
  primary100: '#DBEAFE',
  primary200: '#BFDBFE',
  primary300: '#93C5FD',
  primary400: '#60A5FA',
  primary500: '#3B82F6',
  primary600: '#2563EB',
  primary700: '#1D4ED8',
  primary800: '#1E40AF',
  primary900: '#1E3A8A',

  // Secundarios - Verde esperanza
  secondary50: '#ECFDF5',
  secondary100: '#D1FAE5',
  secondary200: '#A7F3D0',
  secondary300: '#6EE7B7',
  secondary400: '#34D399',
  secondary500: '#10B981',
  secondary600: '#059669',
  secondary700: '#047857',
  secondary800: '#065F46',
  secondary900: '#064E3B',

  // Acento - Ámbar cálido
  accent50: '#FFFBEB',
  accent100: '#FEF3C7',
  accent200: '#FDE68A',
  accent300: '#FCD34D',
  accent400: '#FBBF24',
  accent500: '#F59E0B',
  accent600: '#D97706',
  accent700: '#B45309',
  accent800: '#92400E',
  accent900: '#78350F',

  // Semánticos
  success50: '#F0FDF4',
  success500: '#22C55E',
  success600: '#16A34A',

  warning50: '#FFFBEB',
  warning500: '#F59E0B',
  warning600: '#D97706',

  error50: '#FEF2F2',
  error100: '#FEE2E2',
  error500: '#EF4444',
  error600: '#DC2626',
  error700: '#B91C1C',

  // Neutros
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
  black: '#000000',
} as const;

// ─── COLORES SEMÁNTICOS POR MODO ───
export type ColorScheme = 'light' | 'dark';

export const Colors = {
  light: {
    // Fondos
    background: BaseColors.gray50,
    surface: BaseColors.white,
    surfaceElevated: BaseColors.white,
    surfacePressed: BaseColors.gray100,

    // Texto
    textPrimary: BaseColors.gray900,
    textSecondary: BaseColors.gray600,
    textTertiary: BaseColors.gray400,
    textInverse: BaseColors.white,

    // Bordes
    border: BaseColors.gray200,
    borderStrong: BaseColors.gray300,

    // Primario
    primary: BaseColors.primary600,
    primaryLight: BaseColors.primary50,
    primaryDark: BaseColors.primary800,

    // Secundario
    secondary: BaseColors.secondary600,
    secondaryLight: BaseColors.secondary50,

    // Acento
    accent: BaseColors.accent500,
    accentLight: BaseColors.accent50,

    // Estados
    success: BaseColors.success600,
    warning: BaseColors.warning600,
    error: BaseColors.error600,
    errorLight: BaseColors.error50,

    // Específicos
    overlay: 'rgba(15, 23, 42, 0.6)',
    shadow: BaseColors.gray900,

    // Admin
    adminBg: BaseColors.gray50,
    adminSurface: BaseColors.white,
    adminCard: BaseColors.white,
  },

  dark: {
    background: '#0A0A0F',
    surface: '#141419',
    surfaceElevated: '#1E1E24',
    surfacePressed: '#2A2A32',

    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    textInverse: '#0F172A',

    border: '#2A2A32',
    borderStrong: '#3A3A42',

    primary: '#60A5FA',
    primaryLight: 'rgba(59, 130, 246, 0.15)',
    primaryDark: '#93C5FD',

    secondary: '#34D399',
    secondaryLight: 'rgba(16, 185, 129, 0.15)',

    accent: '#FBBF24',
    accentLight: 'rgba(251, 191, 36, 0.15)',

    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    errorLight: 'rgba(239, 68, 68, 0.15)',

    overlay: 'rgba(0, 0, 0, 0.75)',
    shadow: '#000000',

    adminBg: '#0A0A0F',
    adminSurface: '#141419',
    adminCard: '#1E1E24',
  }
} as const;

// Helper para obtener colores según modo
export const getColors = (scheme: ColorScheme = 'light') => Colors[scheme];

// ─── ESPACIADO (Grid 4px) ───
export const Spacing = {
  '0': 0,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
  '24': 96,
} as const;

// ─── TIPOGRAFÍA ───
export const Typography = {
  // Familias
  family: {
    sans: isWeb 
      ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      : undefined,
    mono: isWeb ? '"SF Mono", Monaco, Inconsolata, monospace' : undefined,
  },

  // Escala tipográfica
  sizes: {
    hero: { size: isDesktop ? 48 : isTablet ? 40 : 32, lineHeight: 1.1, letterSpacing: -0.02 },
    h1: { size: isDesktop ? 36 : 28, lineHeight: 1.2, letterSpacing: -0.01 },
    h2: { size: isDesktop ? 28 : 24, lineHeight: 1.25, letterSpacing: -0.01 },
    h3: { size: 20, lineHeight: 1.3, letterSpacing: 0 },
    h4: { size: 18, lineHeight: 1.4, letterSpacing: 0 },
    body: { size: 16, lineHeight: 1.5, letterSpacing: 0 },
    bodySmall: { size: 14, lineHeight: 1.5, letterSpacing: 0 },
    caption: { size: 12, lineHeight: 1.4, letterSpacing: 0.01 },
    overline: { size: 10, lineHeight: 1.2, letterSpacing: 0.05, uppercase: true },
  },

  // Pesos
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  } as const,
};

// ─── SOMBRAS ───
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: BaseColors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: BaseColors.gray900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: BaseColors.gray900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: BaseColors.gray900,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  },
  // Dark mode shadows (más sutiles)
  dark: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.6,
      shadowRadius: 32,
      elevation: 12,
    },
  }
} as const;

// ─── BORDES ───
export const BorderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// ─── ANIMACIONES / TRANSICIONES ───
export const Transitions = {
  fast: { duration: 150, easing: 'ease-out' },
  normal: { duration: 250, easing: 'ease-in-out' },
  slow: { duration: 350, easing: 'ease-in-out' },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
} as const;

// ─── Z-INDEX ───
export const ZIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  toast: 400,
  tooltip: 500,
} as const;

// ─── CONTAINER ───
export const Container = {
  maxWidth: 1280,
  padding: {
    mobile: Spacing['4'],
    tablet: Spacing['6'],
    desktop: Spacing['8'],
  },
} as const;

// ─── UTILIDADES ───
export const getShadow = (size: 'sm' | 'md' | 'lg' | 'xl', scheme: ColorScheme = 'light') => {
  if (scheme === 'dark' && Shadows.dark[size]) {
    return Shadows.dark[size];
  }
  return Shadows[size];
};

export const getResponsiveValue = <T,>(mobile: T, tablet?: T, desktop?: T): T => {
  if (isDesktop && desktop !== undefined) return desktop;
  if (isTablet && tablet !== undefined) return tablet;
  return mobile;
};

// ─── HOOK useTheme ───
export function useTheme() {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  return getColors(scheme);
}

