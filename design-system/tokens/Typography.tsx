import React from 'react';
import { Text, TextProps, TextStyle, StyleSheet, View } from 'react-native';
import { useTheme, Typography as T, Spacing } from './Theme';

// ─── TIPO DE VARIANTE ───
export type TextVariant = 
  | 'hero' 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'body' 
  | 'bodySmall' 
  | 'caption' 
  | 'overline';

// ─── PROPS ───
interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'accent' | 'success' | 'error' | 'custom';
  customColor?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  children: React.ReactNode;
  numberOfLines?: number;
}

// ─── COMPONENTE BASE ───
export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'primary',
  customColor,
  weight,
  align = 'left',
  style,
  children,
  numberOfLines,
  ...props
}) => {
  const theme = useTheme();
  const config = T.sizes[variant];

  // Color mapping
  const colorMap = {
    primary: theme.textPrimary,
    secondary: theme.textSecondary,
    tertiary: theme.textTertiary,
    inverse: theme.textInverse,
    accent: theme.accent,
    success: theme.success,
    error: theme.error,
    custom: customColor || theme.textPrimary,
  };

  const textStyle: TextStyle = {
    fontSize: config.size,
    lineHeight: config.size * config.lineHeight,
    letterSpacing: config.letterSpacing * config.size,
    color: colorMap[color],
    fontWeight: weight ? T.weights[weight] : undefined,
    textAlign: align,
    ...(config.uppercase && { textTransform: 'uppercase' }),
  };

  return (
    <Text 
      style={[textStyle, style]} 
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
};

// ─── VARIANTES ESPECIALIZADAS ───
export const Hero: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText variant="hero" weight="extrabold" {...props} />
);

export const H1: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText variant="h1" weight="bold" {...props} />
);

export const H2: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText variant="h2" weight="bold" {...props} />
);

export const H3: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText variant="h3" weight="semibold" {...props} />
);

export const H4: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText variant="h4" weight="semibold" {...props} />
);

export const Body: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText variant="body" {...props} />
);

export const BodySmall: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText variant="bodySmall" {...props} />
);

export const Caption: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText variant="caption" color="secondary" {...props} />
);

export const Overline: React.FC<Omit<AppTextProps, 'variant'>> = (props) => (
  <AppText variant="overline" weight="semibold" color="secondary" {...props} />
);

// ─── COMPONENTE DE SECCIÓN ───
interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  style?: TextStyle;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ 
  title, 
  subtitle, 
  align = 'left',
  style 
}) => {
  const theme = useTheme();

  return (
    <View style={[{ marginBottom: Spacing['4'] }, style]}>
      <H2 color="primary" align={align} style={{ marginBottom: Spacing['1'] }}>
        {title}
      </H2>
      {subtitle && (
        <Body color="secondary" align={align}>
          {subtitle}
        </Body>
      )}
    </View>
  );
};

