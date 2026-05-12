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
        { backgroundColor: colors.bg, paddingVertical: size === 'sm' ? 10 : 14 },
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
  base: { borderRadius: 30, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  label: { fontWeight: '700' },
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
  base: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  text: { fontSize: 12, fontWeight: '700' },
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
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
});

// ---- SectionTitle ----
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={secStyles.title}>{children}</Text>;
}

const secStyles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginTop: 24, marginBottom: 12 },
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
  container: { padding: 32, alignItems: 'center' },
  text: { color: '#94a3b8', fontSize: 16, textAlign: 'center', fontWeight: '500' },
});

// ---- Divider ----
export function Divider() {
  return <View style={{ height: 1, backgroundColor: '#e2e8f0', marginVertical: 24 }} />;
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
