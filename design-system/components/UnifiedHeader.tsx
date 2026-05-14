/**
 * Cuatro Patitas - UnifiedHeader Component
 * Header que se adapta automáticamente entre web (sidebar/topbar) y mobile (native header)
 * Soporta: navegación desktop, tabs mobile, usuario logueado, admin badge
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { useTheme, Spacing, BorderRadius, getShadow, isWeb, isDesktop } from '../tokens/Theme';
import { H3, Body, BodySmall, Caption } from '../tokens/Typography';
import { IconButton } from './AppButton';
import { CountBadge } from './StatusBadge';

// ─── TIPO DE NAVEGACIÓN ───
export type NavItem = {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: number;
  adminOnly?: boolean;
};

// ─── PROPS ───
interface UnifiedHeaderProps {
  user?: { email: string; isAdmin?: boolean } | null;
  activeTab?: string;
  onNavigate?: (tabId: string) => void;
  onLogout?: () => void;
  style?: ViewStyle;
}

// ─── NAVEGACIÓN POR DEFECTO ───
const defaultNavItems: NavItem[] = [
  { id: 'index', label: 'Inicio', icon: '🏠' },
  { id: 'explore', label: 'Mi Perfil', icon: '👤' },
  { id: 'adoptados', label: 'Finales Felices', icon: '❤️' },
  { id: 'admin', label: 'Admin', icon: '⚙️', adminOnly: true },
];

// ─── COMPONENTE ───
export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  user,
  activeTab = 'index',
  onNavigate,
  onLogout,
  style,
}) => {
  const theme = useTheme();

  // Filtrar items de admin si no es admin
  const navItems = defaultNavItems.filter(item => 
    !item.adminOnly || (item.adminOnly && user?.isAdmin)
  );

  // ─── WEB DESKTOP: SIDEBAR ───
  if (isDesktop) {
    return (
      <View style={[styles.sidebar, { backgroundColor: theme.surface, borderColor: theme.border }, style]}>
        {/* Logo */}
        <View style={styles.sidebarHeader}>
          <Text style={styles.logoIcon}>🐾</Text>
          <H3 style={{ marginLeft: Spacing['2'] }}>Cuatro Patitas</H3>
        </View>

        {/* Nav Items */}
        <View style={styles.sidebarNav}>
          {navItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.sidebarItem,
                activeTab === item.id && { 
                  backgroundColor: theme.primaryLight,
                  borderLeftColor: theme.primary,
                  borderLeftWidth: 3,
                },
              ]}
              onPress={() => onNavigate?.(item.id)}
            >
              <Text style={styles.sidebarIcon}>{item.icon}</Text>
              <Body 
                weight={activeTab === item.id ? 'semibold' : 'regular'}
                color={activeTab === item.id ? 'primary' : 'secondary'}
              >
                {item.label}
              </Body>
              {item.badge !== undefined && item.badge > 0 && (
                <View style={{ marginLeft: 'auto' }}>
                  <CountBadge count={item.badge} size="sm" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* User section */}
        <View style={[styles.sidebarFooter, { borderColor: theme.border }]}>
          {user ? (
            <>
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
                  <Text style={{ fontSize: 16 }}>👤</Text>
                </View>
                <View style={{ flex: 1, marginLeft: Spacing['2'] }}>
                  <BodySmall weight="semibold" numberOfLines={1}>{user.email}</BodySmall>
                  {user.isAdmin && (
                    <Caption color="accent" weight="semibold">ADMIN</Caption>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                <Text style={{ color: theme.error, fontWeight: '600' }}>Salir</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.loginBtn, { backgroundColor: theme.primary }]}
              onPress={() => onNavigate?.('explore')}
            >
              <Body color="inverse" weight="semibold">Iniciar Sesión</Body>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // ─── WEB TABLET/MOBILE: TOPBAR ───
  if (isWeb) {
    return (
      <View style={[styles.topbar, { backgroundColor: theme.surface, borderColor: theme.border }, style]}>
        <View style={styles.topbarContent}>
          {/* Logo */}
          <View style={styles.topbarLogo}>
            <Text style={styles.logoIcon}>🐾</Text>
            <H3>Cuatro Patitas</H3>
          </View>

          {/* Nav */}
          <View style={styles.topbarNav}>
            {navItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.topbarItem,
                  activeTab === item.id && { 
                    backgroundColor: theme.primaryLight,
                    borderRadius: BorderRadius.lg,
                  },
                ]}
                onPress={() => onNavigate?.(item.id)}
              >
                <Text style={{ fontSize: 18, marginRight: Spacing['1'] }}>{item.icon}</Text>
                <BodySmall 
                  weight={activeTab === item.id ? 'semibold' : 'regular'}
                  color={activeTab === item.id ? 'primary' : 'secondary'}
                >
                  {item.label}
                </BodySmall>
                {item.badge !== undefined && item.badge > 0 && (
                  <CountBadge count={item.badge} size="sm" style={{ marginLeft: Spacing['1'] }} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* User */}
          {user ? (
            <View style={styles.topbarUser}>
              {user.isAdmin && (
                <View style={[styles.adminBadge, { backgroundColor: theme.accentLight }]}>
                  <Caption color="accent" weight="bold">ADMIN</Caption>
                </View>
              )}
              <IconButton icon="🚪" variant="ghost" size="sm" onPress={onLogout} />
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.loginBtnSmall, { backgroundColor: theme.primary }]}
              onPress={() => onNavigate?.('explore')}
            >
              <BodySmall color="inverse" weight="semibold">Entrar</BodySmall>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // ─── NATIVE MOBILE: No renderizamos nada (usa Tabs nativas de Expo)
  return null;
};

// ─── ESTILOS ───
const styles = StyleSheet.create({
  // Sidebar (Desktop)
  sidebar: {
    width: 260,
    borderRightWidth: 1,
    flexDirection: 'column',
    left: 0,
    top: 0,
    zIndex: 100,
    ...Platform.select({
      web: {
        position: 'fixed' as any,
        height: '100vh' as any,
      },
      default: {
        position: 'absolute',
      },
    }),
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing['5'],
    paddingTop: Spacing['6'],
  },
  logoIcon: {
    fontSize: 28,
  },
  sidebarNav: {
    flex: 1,
    paddingHorizontal: Spacing['3'],
    paddingTop: Spacing['4'],
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing['3'],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing['1'],
  },
  sidebarIcon: {
    fontSize: 20,
    marginRight: Spacing['3'],
    width: 28,
    textAlign: 'center',
  },
  sidebarFooter: {
    padding: Spacing['4'],
    borderTopWidth: 1,
    marginTop: 'auto',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['3'],
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    alignItems: 'center',
    padding: Spacing['2'],
  },
  loginBtn: {
    padding: Spacing['3'],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },

  // Topbar (Tablet/Web mobile)
  topbar: {
    width: '100%',
    borderBottomWidth: 1,
    ...Platform.select({
      web: {
        position: 'sticky' as any,
        top: 0,
        zIndex: 100,
      },
      default: {},
    }),
  },
  topbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing['3'],
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  topbarLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
  },
  topbarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['1'],
  },
  topbarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing['2'],
    paddingHorizontal: Spacing['3'],
  },
  topbarUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
  },
  adminBadge: {
    paddingHorizontal: Spacing['2'],
    paddingVertical: Spacing['0.5'],
    borderRadius: BorderRadius.sm,
  },
  loginBtnSmall: {
    paddingVertical: Spacing['2'],
    paddingHorizontal: Spacing['4'],
    borderRadius: BorderRadius.lg,
  },
});

export default UnifiedHeader;
