/**
 * Cuatro Patitas - AppInput Component
 * Input estilizado con soporte para iconos, estados de error, y variantes
 * Soporta: text, email, password, number, phone, search
 */

import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useTheme, BorderRadius, Spacing } from '../tokens/Theme';
import { Caption } from '../tokens/Typography';

// ─── TIPOS ───
export type InputVariant = 'default' | 'filled' | 'outlined' | 'minimal';
export type InputSize = 'sm' | 'md' | 'lg';

// ─── PROPS ───
interface AppInputProps extends TextInputProps {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  helperText?: string;
  error?: string;
  iconLeft?: string;
  iconRight?: string;
  onIconRightPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  fullWidth?: boolean;
}

// ─── COMPONENTE ───
export const AppInput = forwardRef<TextInput, AppInputProps>(({
  variant = 'default',
  size = 'md',
  label,
  helperText,
  error,
  iconLeft,
  iconRight,
  onIconRightPress,
  containerStyle,
  inputStyle,
  fullWidth = true,
  secureTextEntry,
  onFocus,
  onBlur,
  ...textInputProps
}, ref) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPassword = secureTextEntry !== undefined;
  const actualSecureTextEntry = isPassword ? !isPasswordVisible : secureTextEntry;

  // Configuración por tamaño
  const sizeConfig = {
    sm: { height: 36, padding: Spacing['2'], fontSize: 13 },
    md: { height: 48, padding: Spacing['3'], fontSize: 15 },
    lg: { height: 56, padding: Spacing['4'], fontSize: 16 },
  };

  const sz = sizeConfig[size];

  // Configuración por variante
  const variantStyles = {
    default: {
      backgroundColor: theme.surface,
      borderColor: error ? theme.error : isFocused ? theme.primary : theme.border,
      borderWidth: 1.5,
    },
    filled: {
      backgroundColor: theme.surfacePressed,
      borderColor: error ? theme.error : isFocused ? theme.primary : 'transparent',
      borderWidth: 1.5,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: error ? theme.error : isFocused ? theme.primary : theme.borderStrong,
      borderWidth: 2,
    },
    minimal: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderBottomColor: error ? theme.error : isFocused ? theme.primary : theme.border,
      borderBottomWidth: 2,
      borderWidth: 0,
      borderRadius: 0,
    },
  };

  const vStyle = variantStyles[variant];

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[fullWidth && { width: '100%' }, containerStyle]}>
      {/* Label */}
      {label && (
        <Caption
          weight="semibold"
          color={error ? 'error' : 'secondary'}
          style={{ marginBottom: Spacing['1.5'], textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {label}
        </Caption>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.container,
          {
            height: sz.height,
            borderRadius: variant === 'minimal' ? 0 : BorderRadius.lg,
            ...vStyle,
          },
          isFocused && variant !== 'minimal' && {
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 2,
          },
        ]}
      >
        {/* Icono izquierdo */}
        {iconLeft && (
          <Text style={[styles.icon, { fontSize: sz.fontSize + 2, marginRight: Spacing['2'] }]}>
            {iconLeft}
          </Text>
        )}

        {/* Input */}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              fontSize: sz.fontSize,
              color: theme.textPrimary,
              paddingVertical: sz.padding,
              paddingHorizontal: iconLeft ? 0 : sz.padding,
            },
            inputStyle,
          ]}
          placeholderTextColor={theme.textTertiary}
          secureTextEntry={actualSecureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />

        {/* Icono derecho / Toggle password */}
        {(iconRight || isPassword) && (
          <TouchableOpacity
            onPress={isPassword ? () => setIsPasswordVisible(!isPasswordVisible) : onIconRightPress}
            style={{ padding: Spacing['1'] }}
          >
            <Text style={[styles.icon, { fontSize: sz.fontSize + 2 }]}>
              {isPassword ? (isPasswordVisible ? '👁️' : '🙈') : iconRight}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Helper / Error */}
      {(helperText || error) && (
        <Caption
          color={error ? 'error' : 'tertiary'}
          style={{ marginTop: Spacing['1.5'] }}
        >
          {error || helperText}
        </Caption>
      )}
    </View>
  );
});

// ─── INPUT DE BÚSQUEDA ───
interface SearchInputProps extends Omit<AppInputProps, 'iconLeft' | 'variant'> {
  onSearch?: (text: string) => void;
  loading?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  loading,
  ...props
}) => {
  const [value, setValue] = useState('');

  return (
    <AppInput
      variant="filled"
      iconLeft="🔍"
      iconRight={value ? '✕' : undefined}
      onIconRightPress={() => {
        setValue('');
        onSearch?.('');
      }}
      value={value}
      onChangeText={(text) => {
        setValue(text);
        onSearch?.(text);
      }}
      placeholder="Buscar..."
      {...props}
    />
  );
};

// ─── ESTILOS ───
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['3'],
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontFamily: Platform.OS === 'web' ? 'inherit' : undefined,
  },
  icon: {
    lineHeight: 24,
  },
});

export default AppInput;
