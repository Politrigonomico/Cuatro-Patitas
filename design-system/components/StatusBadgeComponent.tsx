/**
 * Cuatro Patitas - StatusBadge Component
 * Badge semántico para estados: adopción, castración, campaña, animal
 * Soporta variantes de tamaño y modo oscuro
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, BorderRadius, Spacing } from '../tokens/Theme';
import { BodySmall, Caption } from '../tokens/Typography';

// ─── TIPOS DE ESTADO ───
export type StatusType = 
  // Adopción
  | 'Pendiente' 
  | 'Aprobado' 
  | 'Rechazado' 
  | 'Requiere Info'
  // Castración
  | 'Lista de Espera'
  // Animal
  | 'En adopción'
  | 'Adoptado'
  | 'Rescatado'
  | 'En tratamiento'
  // Campaña
  | 'Abierta'
  | 'Llena'
  | 'Finalizada'
  | 'Cancelada'
  // Genérico
  | 'Activo'
  | 'Inactivo'
  | string; // Fallback

// ─── PROPS ───
interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  showDot?: boolean;
}

// ─── MAPEO DE COLORES SEMÁNTICOS ───
const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  // Adopción
  'Pendiente': { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Pendiente' },
  'Aprobado': { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Aprobado' },
  'Rechazado': { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Rechazado' },
  'Requiere Info': { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'Requiere Info' },

  // Castración
  'Lista de Espera': { bg: '#F3E8FF', text: '#6B21A8', dot: '#A855F7', label: 'En Espera' },

  // Animal
  'En adopción': { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'En Adopción' },
  'Adoptado': { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Adoptado' },
  'Rescatado': { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', label: 'Rescatado' },
  'En tratamiento': { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'En Tratamiento' },

  // Campaña
  'Abierta': { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Abierta' },
  'Llena': { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Sin Cupos' },
  'Finalizada': { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', label: 'Finalizada' },
  'Cancelada': { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', label: 'Cancelada' },

  // Genérico
  'Activo': { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', label: 'Activo' },
  'Inactivo': { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8', label: 'Inactivo' },
};

// ─── COMPONENTE ───
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  style,
  showDot = true,
}) => {
  const theme = useTheme();

  const config = statusConfig[status] || {
    bg: theme.surfacePressed,
    text: theme.textSecondary,
    dot: theme.textTertiary,
    label: status,
  };

  // Dark mode adjustments
  const isDark = theme.background === '#0A0A0F';
  const bgColor = isDark ? config.dot + '25' : config.bg;
  const textColor = isDark ? config.dot : config.text;

  const sizeConfig = {
    sm: { paddingV: Spacing['1'], paddingH: Spacing['2'], fontSize: 11, dot: 6 },
    md: { paddingV: Spacing['1.5'], paddingH: Spacing['3'], fontSize: 12, dot: 8 },
    lg: { paddingV: Spacing['2'], paddingH: Spacing['4'], fontSize: 13, dot: 10 },
  };

  const sz = sizeConfig[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          paddingVertical: sz.paddingV,
          paddingHorizontal: sz.paddingH,
          borderRadius: BorderRadius.full,
        },
        style,
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              width: sz.dot,
              height: sz.dot,
              borderRadius: sz.dot / 2,
              backgroundColor: config.dot,
              marginRight: Spacing['1.5'],
            },
          ]}
        />
      )}
      <Caption
        style={{
          color: textColor,
          fontSize: sz.fontSize,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.3,
        }}
      >
        {config.label}
      </Caption>
    </View>
  );
};

// ─── BADGE NUMÉRICO ───
interface CountBadgeProps {
  count: number;
  max?: number;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 99,
  size = 'md',
  style,
}) => {
  const theme = useTheme();
  const display = count > max ? `${max}+` : count.toString();

  const sizeMap = {
    sm: { minWidth: 18, height: 18, fontSize: 10 },
    md: { minWidth: 22, height: 22, fontSize: 12 },
  };

  const sz = sizeMap[size];

  return (
    <View
      style={[
        styles.countBadge,
        {
          backgroundColor: theme.error,
          minWidth: sz.minWidth,
          height: sz.height,
          borderRadius: sz.height / 2,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: theme.textInverse,
          fontSize: sz.fontSize,
          fontWeight: '700',
          textAlign: 'center',
          lineHeight: sz.height,
        }}
      >
        {display}
      </Text>
    </View>
  );
};

// ─── ESTILOS ───
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    flexShrink: 0,
  },
  countBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
});

export default StatusBadge;
