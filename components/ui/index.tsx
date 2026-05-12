// ============================================================
// components/ui/index.tsx
// Componentes de UI pequeños, reutilizables en toda la app.
// ============================================================
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

// ---- Button ----
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

const BUTTON_COLORS = {
  primary: { bg: '#1e3a8a', text: '#ffffff' },
  secondary: { bg: '#f1f5f9', text: '#334155' },
  danger: { bg: '#dc2626', text: '#ffffff' },
  success: { bg: '#059669', text: '#ffffff' },
  ghost: { bg: 'transparent', text: '#1e3a8a' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const colors = BUTTON_COLORS[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        btnStyles.base,
        { backgroundColor: colors.bg, paddingVertical: size === 'sm' ? 8 : 12 },
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <Text style={[btnStyles.label, { color: colors.text, fontSize: size === 'sm' ? 13 : 15 }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const btnStyles = StyleSheet.create({
  base: { borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  label: { fontWeight: '600' },
});

// ---- Badge ----
type BadgeVariant = 'pending' | 'approved' | 'rejected' | 'info' | 'waiting' | 'open' | 'full';

const BADGE_STYLES: Record<BadgeVariant, { bg: string; text: string; label: string }> = {
  pending:  { bg: '#fef9c3', text: '#854d0e', label: 'Pendiente' },
  approved: { bg: '#dcfce7', text: '#166534', label: 'Aprobado' },
  rejected: { bg: '#fee2e2', text: '#991b1b', label: 'Rechazado' },
  info:     { bg: '#dbeafe', text: '#1e40af', label: 'Requiere Info' },
  waiting:  { bg: '#f3e8ff', text: '#6b21a8', label: 'Lista de Espera' },
  open:     { bg: '#dcfce7', text: '#166534', label: 'Abierta' },
  full:     { bg: '#fee2e2', text: '#991b1b', label: 'Llena' },
};

function resolveVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    'Pendiente': 'pending',
    'Aprobado': 'approved',
    'Rechazado': 'rejected',
    'Requiere Info': 'info',
    'Lista de Espera': 'waiting',
    'Abierta': 'open',
    'Llena': 'full',
  };
  return map[status] ?? 'pending';
}

export function Badge({ status }: { status: string }) {
  const v = resolveVariant(status);
  const s = BADGE_STYLES[v];
  return (
    <View style={[badgeStyles.base, { backgroundColor: s.bg }]}>
      <Text style={[badgeStyles.text, { color: s.text }]}>{status}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  base: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  text: { fontSize: 12, fontWeight: '600' },
});

// ---- Card ----
interface CardProps {
  children: React.ReactNode;
  accentColor?: string;
  style?: ViewStyle;
}

export function Card({ children, accentColor, style }: CardProps) {
  return (
    <View
      style={[
        cardStyles.base,
        accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : {},
        style,
      ]}
    >
      {children}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});

// ---- SectionTitle ----
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={secStyles.title}>{children}</Text>;
}

const secStyles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginTop: 20, marginBottom: 10 },
});

// ---- EmptyState ----
export function EmptyState({ message }: { message: string }) {
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.text}>{message}</Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
  text: { color: '#94a3b8', fontSize: 15, textAlign: 'center' },
});

// ---- Divider ----
export function Divider() {
  return <View style={{ height: 1, backgroundColor: '#e2e8f0', marginVertical: 20 }} />;
}

// ---- RowActions ----
interface RowActionsProps {
  onApprove: () => void;
  onInfo?: () => void;
  infoLabel?: string;
  onReject: () => void;
}

export function RowActions({ onApprove, onInfo, infoLabel = 'Info', onReject }: RowActionsProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
      <Button label="Aprobar" onPress={onApprove} variant="success" size="sm" style={{ flex: 1 }} />
      {onInfo && (
        <Button label={infoLabel} onPress={onInfo} variant="secondary" size="sm" style={{ flex: 1 }} />
      )}
      <Button label="Rechazar" onPress={onReject} variant="danger" size="sm" style={{ flex: 1 }} />
    </View>
  );
}

// ---- DeleteButton ----
export function DeleteButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={delStyles.btn} hitSlop={8}>
      <Text style={delStyles.icon}>🗑️</Text>
    </TouchableOpacity>
  );
}

const delStyles = StyleSheet.create({
  btn: { padding: 6 },
  icon: { fontSize: 16 },
});
