/**
 * Cuatro Patitas - Design System
 * Exportaciones centralizadas de tokens y componentes
 */

// Tokens
export { 
  getColors, 
  Colors, 
  Spacing, 
  BorderRadius, 
  Shadows, 
  Typography, 
  Breakpoints,
  Container,
  ZIndex,
  Transitions,
  isWeb,
  isMobile,
  isTablet,
  isDesktop,
  getShadow,
  getResponsiveValue,
  useTheme,
} from './tokens/Theme';
export type { ColorScheme } from './tokens/Theme';

export { 
  AppText, 
  Hero, 
  H1, 
  H2, 
  H3, 
  H4, 
  Body, 
  BodySmall, 
  Caption, 
  Overline,
  SectionTitle,
} from './tokens/Typography';
export type { TextVariant } from './tokens/Typography';

// Components
export { AppCard } from './components/AppCard';
export type { CardVariant, CardProps } from './components/AppCard';

export { AppButton, IconButton, ButtonGroup } from './components/AppButton';
export type { ButtonVariant, ButtonSize } from './components/AppButton';

export { StatusBadge, CountBadge } from './components/StatusBadgeComponent';
export type { StatusType } from './components/StatusBadgeComponent';

export { 
  SkeletonBase, 
  SkeletonAnimalCard, 
  SkeletonRequestCard, 
  SkeletonList,
  SkeletonText,
  SkeletonCircle,
} from './components/SkeletonCard';

export { EmptyState, InlineEmpty } from './components/EmptyState';
export type { EmptyType } from './components/EmptyState';

export { AppInput, SearchInput } from './components/AppInput';
export type { InputVariant, InputSize } from './components/AppInput';

export { UnifiedHeader } from './components/UnifiedHeader';
export type { NavItem } from './components/UnifiedHeader';
