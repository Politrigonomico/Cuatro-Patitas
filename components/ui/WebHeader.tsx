import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

// ============================================================
// Colores de la ONG Cuatro Patitas Fighiera
// Extraídos del logo oficial (azul profundo + cyan de patitas)
// ============================================================
const BRAND = {
  bg: '#0A0A0F',
  border: '#1E1E2E',
  primary: '#3B5CE4',    // Azul profundo del logo
  primaryLight: '#5B7CF7',
  cyan: '#22D3EE',       // Cyan de las patitas
  text: '#FFFFFF',
  textMuted: '#8892B0',
};

export default function WebHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.email === 'admin@cuatropatitas.com';

  if (Platform.OS !== 'web') return null;

  return (
    <View style={s.header}>
      {/* LOGO */}
      <TouchableOpacity style={s.logoContainer} onPress={() => router.push('/')}>
        <View style={s.logoBadge}>
          <Text style={s.logoIcon}>🐾</Text>
        </View>
        <View>
          <Text style={s.logoTitle}>Cuatro Patitas</Text>
          <Text style={s.logoSub}>Fighiera · Santa Fe</Text>
        </View>
      </TouchableOpacity>

      {/* NAV LINKS */}
      <View style={s.navLinks}>
        <NavLink label="Adoptar" onPress={() => router.push('/')} />
        <NavLink label="Campañas" onPress={() => router.push('/')} />
        {user && <NavLink label="Mi Perfil" onPress={() => router.push('/explore')} />}
        {isAdmin && <NavLink label="Panel Admin" onPress={() => router.push('/admin')} highlight />}
      </View>

      {/* CTA */}
      <View style={s.ctaContainer}>
        {!user ? (
          <TouchableOpacity style={s.btnLogin} onPress={() => router.push('/explore')}>
            <Text style={s.btnLoginText}>Iniciar sesión</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.userBadge}>
            <Text style={s.userIcon}>👤</Text>
            <Text style={s.userName} numberOfLines={1}>{user.email?.split('@')[0]}</Text>
          </View>
        )}
        <TouchableOpacity style={s.btnAdopta} onPress={() => router.push('/')}>
          <Text style={s.btnAdoptaText}>¡Adoptá hoy!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NavLink({ label, onPress, highlight }: { label: string; onPress: () => void; highlight?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={[s.navLink, highlight && s.navLinkHighlight]}>
      <Text style={[s.linkText, highlight && s.linkTextHighlight]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
    backgroundColor: BRAND.bg,
    borderBottomWidth: 1,
    borderColor: BRAND.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 20 },
  logoTitle: {
    color: BRAND.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoSub: {
    color: BRAND.cyan,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  navLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  navLinkHighlight: {
    backgroundColor: 'rgba(59, 92, 228, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 92, 228, 0.3)',
  },
  linkText: {
    color: BRAND.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  linkTextHighlight: {
    color: BRAND.primaryLight,
  },
  ctaContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  btnLogin: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  btnLoginText: {
    color: BRAND.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  btnAdopta: {
    backgroundColor: BRAND.primary,
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnAdoptaText: {
    color: BRAND.text,
    fontWeight: '700',
    fontSize: 14,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A1A2E',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRAND.border,
    maxWidth: 160,
  },
  userIcon: { fontSize: 14 },
  userName: { color: BRAND.textMuted, fontSize: 13, fontWeight: '500' },
});
