/**
 * Cuatro Patitas - Skeleton Components
 * Estados de carga elegantes con animación shimmer
 * Soporta: tarjetas, listas, texto, imágenes
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { useTheme, BorderRadius, Spacing } from '../tokens/Theme';

// ─── PROPS BASE ───
interface SkeletonProps {
  style?: ViewStyle;
  children?: React.ReactNode;
}

// ─── SHIMMER ANIMADO ───
const Shimmer: React.FC<{ colors: [string, string, string] }> = ({ colors }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          transform: [{ translateX }],
          backgroundColor: colors[1],
          opacity: 0.3,
        },
      ]}
    />
  );
};

// ─── SKELETON BASE ───
export const SkeletonBase: React.FC<SkeletonProps & { width?: number | string; height?: number; borderRadius?: number }> = ({
  style,
  width = '100%',
  height = 16,
  borderRadius = BorderRadius.md,
}) => {
  const theme = useTheme();
  const isDark = theme.background === '#0A0A0F';

  const baseColor = isDark ? '#1E1E24' : '#E2E8F0';
  const shimmerColor = isDark ? '#2A2A32' : '#F1F5F9';
  const highlightColor = isDark ? '#3A3A42' : '#FFFFFF';

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Shimmer colors={[baseColor, shimmerColor, highlightColor]} />
    </View>
  );
};

// ─── SKELETON DE TARJETA DE ANIMAL ───
export const SkeletonAnimalCard: React.FC = () => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <SkeletonBase height={200} borderRadius={BorderRadius['2xl']} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
      <View style={styles.cardContent}>
        <SkeletonBase width="60%" height={20} style={{ marginBottom: Spacing['2'] }} />
        <SkeletonBase width="40%" height={14} />
        <SkeletonBase width="100%" height={40} style={{ marginTop: Spacing['3'], borderRadius: BorderRadius.lg }} />
      </View>
    </View>
  );
};

// ─── SKELETON DE TARJETA DE SOLICITUD ───
export const SkeletonRequestCard: React.FC = () => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing['3'] }}>
          <SkeletonBase width="50%" height={18} />
          <SkeletonBase width={80} height={24} borderRadius={BorderRadius.full} />
        </View>
        <SkeletonBase width="30%" height={14} style={{ marginBottom: Spacing['3'] }} />
        <SkeletonBase width="100%" height={60} style={{ marginBottom: Spacing['3'] }} />
        <View style={{ flexDirection: 'row', gap: Spacing['2'] }}>
          <SkeletonBase width="30%" height={32} borderRadius={BorderRadius.md} />
          <SkeletonBase width="30%" height={32} borderRadius={BorderRadius.md} />
          <SkeletonBase width="30%" height={32} borderRadius={BorderRadius.md} />
        </View>
      </View>
    </View>
  );
};

// ─── SKELETON DE LISTA ───
interface SkeletonListProps {
  count?: number;
  type?: 'animal' | 'request' | 'campaign' | 'text';
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ count = 3, type = 'text' }) => {
  const theme = useTheme();

  const renderItem = () => {
    switch (type) {
      case 'animal':
        return <SkeletonAnimalCard />;
      case 'request':
        return <SkeletonRequestCard />;
      case 'campaign':
        return (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.cardContent}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <SkeletonBase width="40%" height={20} />
                <SkeletonBase width={80} height={24} borderRadius={BorderRadius.full} />
              </View>
              <SkeletonBase width="60%" height={14} style={{ marginTop: Spacing['2'] }} />
              <SkeletonBase width="100%" height={6} style={{ marginTop: Spacing['3'] }} borderRadius={3} />
            </View>
          </View>
        );
      default:
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['3'] }}>
            <SkeletonBase width={48} height={48} borderRadius={BorderRadius.lg} />
            <View style={{ flex: 1 }}>
              <SkeletonBase width="70%" height={16} style={{ marginBottom: Spacing['2'] }} />
              <SkeletonBase width="40%" height={12} />
            </View>
          </View>
        );
    }
  };

  return (
    <View style={{ gap: Spacing['4'] }}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx}>{renderItem()}</View>
      ))}
    </View>
  );
};

// ─── SKELETON DE TEXTO (líneas) ───
interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string | number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 3, lastLineWidth = '60%' }) => {
  return (
    <View style={{ gap: Spacing['2'] }}>
      {Array.from({ length: lines - 1 }).map((_, idx) => (
        <SkeletonBase key={idx} height={14} />
      ))}
      <SkeletonBase width={lastLineWidth} height={14} />
    </View>
  );
};

// ─── SKELETON DE CIRCULAR (avatar) ───
export const SkeletonCircle: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return <SkeletonBase width={size} height={size} borderRadius={size / 2} />;
};

// ─── ESTADOS ───
const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  cardContent: {
    padding: Spacing['4'],
  },
});

export default SkeletonBase;
