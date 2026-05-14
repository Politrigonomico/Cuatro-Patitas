/**
 * Cuatro Patitas - AppButton Component
 * Botón universal con variantes: primary, secondary, ghost, danger, outline
 * Soporta iconos, loading states, y adaptación web/mobile
 */

import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform,
  View,
} from 'react-native';
import { useTheme, BorderRadius, Spacing, getShadow } from '../tokens/Theme';
import { AppText, Body, BodySmall } from '../tokens/Typography';

// ─── VARIANTES ───
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'ghost' 
  | 'outline' 
  | 'danger' 
  | 'success';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// ─── PROPS ───
interface AppButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string; // Emoji o icono
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  onLongPress?: () => void;
}

// ─── COMPONENTE ───
export const AppButton: React.FC<AppButtonProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  onPress,
  onLongPress,
}) => {
  const theme = useTheme();
  const isWeb = Platform.OS === 'web';

  // Configuración por variante
  const variantConfig = {
    primary: {
      background: theme.primary,
      text: theme.textInverse,
      border: theme.primary,
      pressed: theme.primaryDark,
    },
    secondary: {
      background: theme.secondary,
      text: theme.textInverse,
      border: theme.secondary,
      pressed: theme.secondary,
    },
    accent: {
      background: theme.accent,
      text: theme.textInverse,
      border: theme.accent,
      pressed: theme.accent,
    },
    ghost: {
      background: 'transparent',
      text: theme.primary,
      border: 'transparent',
      pressed: theme.primaryLight,
    },
    outline: {
      background: 'transparent',
      text: theme.primary,
      border: theme.borderStrong,
      pressed: theme.primaryLight,
    },
    danger: {
      background: theme.error,
      text: theme.textInverse,
      border: theme.error,
      pressed: theme.error,
    },
    success: {
      background: theme.success,
      text: theme.textInverse,
      border: theme.success,
      pressed: theme.success,
    },
  };

  const config = variantConfig[variant];

  // Configuración por tamaño
  const sizeConfig = {
    sm: { padding: Spacing['2'], fontSize: 13, iconSize: 14, height: 32 },
    md: { padding: Spacing['3'], fontSize: 15, iconSize: 16, height: 44 },
    lg: { padding: Spacing['4'], fontSize: 16, iconSize: 18, height: 52 },
    xl: { padding: Spacing['5'], fontSize: 18, iconSize: 20, height: 60 },
  };

  const sz = sizeConfig[size];

  // Estado pressed (web hover)
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  const backgroundColor = disabled 
    ? theme.surfacePressed 
    : isPressed 
      ? config.pressed 
      : config.background;

  const textColor = disabled ? theme.textTertiary : config.text;

  const buttonStyle: ViewStyle = {
    backgroundColor,
    borderColor: disabled ? theme.border : config.border,
    borderWidth: variant === 'outline' || variant === 'ghost' ? 1.5 : 0,
    borderRadius: BorderRadius.xl,
    paddingVertical: sz.padding,
    paddingHorizontal: sz.padding * 2,
    minHeight: sz.height,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2'],
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : undefined,
    alignSelf: fullWidth ? 'stretch' : undefined,
    ...(!isPressed && !disabled && variant !== 'ghost' && getShadow('sm', isWeb ? 'dark' : 'light')),
    ...(isPressed && isWeb && { transform: [{ scale: 0.98 }] }),
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[buttonStyle, style]}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={textColor} 
          style={{ marginRight: icon ? Spacing['2'] : 0 }}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Text style={{ fontSize: sz.iconSize, color: textColor }}>{icon}</Text>
          )}
          <Body 
            weight="semibold" 
            color={disabled ? 'tertiary' : variant === 'ghost' || variant === 'outline' ? 'primary' : 'inverse'}
            style={[{ fontSize: sz.fontSize }, textStyle]}
          >
            {label}
          </Body>
          {icon && iconPosition === 'right' && (
            <Text style={{ fontSize: sz.iconSize, color: textColor }}>{icon}</Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

// ─── BOTÓN DE ICONO (Circular) ───
interface IconButtonProps {
  icon: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  onPress,
  style,
}) => {
  const theme = useTheme();
  const isWeb = Platform.OS === 'web';

  const sizeMap = {
    sm: { container: 32, icon: 16 },
    md: { container: 40, icon: 20 },
    lg: { container: 48, icon: 24 },
  };

  const sz = sizeMap[size];

  const config = {
    primary: { bg: theme.primary, text: theme.textInverse },
    secondary: { bg: theme.secondary, text: theme.textInverse },
    ghost: { bg: 'transparent', text: theme.textSecondary },
    outline: { bg: 'transparent', text: theme.textSecondary },
    danger: { bg: theme.error, text: theme.textInverse },
  };

  const cfg = config[variant] || config.ghost;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        {
          width: sz.container,
          height: sz.container,
          borderRadius: sz.container / 2,
          backgroundColor: cfg.bg,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: theme.borderStrong,
          justifyContent: 'center',
          alignItems: 'center',
          ...getShadow('sm', isWeb ? 'dark' : 'light'),
        },
        style,
      ]}
    >
      <Text style={{ fontSize: sz.icon, color: cfg.text }}>{icon}</Text>
    </TouchableOpacity>
  );
};

// ─── BOTÓN DE GRUPO ───
interface ButtonGroupProps {
  buttons: { label: string; active?: boolean; onPress?: () => void }[];
  style?: ViewStyle;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({ buttons, style }) => {
  const theme = useTheme();

  return (
    <View style={[styles.buttonGroup, style]}>
      {buttons.map((btn, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={btn.onPress}
          style={[
            styles.groupButton,
            btn.active && { backgroundColor: theme.primary },
            idx === 0 && { borderTopLeftRadius: BorderRadius.lg, borderBottomLeftRadius: BorderRadius.lg },
            idx === buttons.length - 1 && { borderTopRightRadius: BorderRadius.lg, borderBottomRightRadius: BorderRadius.lg },
          ]}
        >
          <BodySmall 
            weight="semibold" 
            color={btn.active ? 'inverse' : 'secondary'}
          >
            {btn.label}
          </BodySmall>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ─── ESTILOS ───
const styles = StyleSheet.create({
  buttonGroup: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  groupButton: {
    flex: 1,
    paddingVertical: Spacing['2'],
    paddingHorizontal: Spacing['3'],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppButton;
