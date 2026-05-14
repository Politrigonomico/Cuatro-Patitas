import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Platform } from 'react-native';

const BRAND = {
  bg: '#0A0A0F',
  bgAlt: '#0D0D1A',
  primary: '#3B5CE4',
  primaryLight: '#5B7CF7',
  cyan: '#22D3EE',
  text: '#FFFFFF',
  textMuted: '#8892B0',
  textSoft: '#CBD5E1',
};

export default function WebHero({ onAdoptarPress }: { onAdoptarPress?: () => void }) {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={s.hero}>
      {/* Fondo con gradiente simulado */}
      <View style={s.bgAccent} />

      <View style={s.inner}>
        {/* Texto */}
        <View style={s.textCol}>
          {/* Badge ONG */}
          <View style={s.ongBadge}>
            <View style={s.ongDot} />
            <Text style={s.ongText}>ONG · Fighiera, Santa Fe 🇦🇷</Text>
          </View>

          <Text style={s.title}>
            <Text style={s.titleBlue}>No compres,{'\n'}</Text>
            <Text style={s.titleWhite}>adoptá uno sin casa</Text>
          </Text>

          <Text style={s.subtitle}>
            Transitamos, trasladamos y damos amor a perros y gatos que buscan una familia para siempre. Ayudanos a cambiar vidas. 🐾❤️
          </Text>

          {/* Stats */}
          <View style={s.statsRow}>
            <StatBadge value="659+" label="Publicaciones" />
            <StatBadge value="2.4k" label="Seguidores" />
            <StatBadge value="∞" label="Vidas salvadas" />
          </View>

          <View style={s.ctaRow}>
            <TouchableOpacity style={s.btnPrimary} onPress={onAdoptarPress}>
              <Text style={s.btnPrimaryText}>🏠 Ver animales en adopción</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.btnSecondary}
              onPress={() => {
                if (typeof window !== 'undefined') {
                  window.open('https://www.instagram.com/cuatropatitasfighiera_', '_blank');
                }
              }}
            >
              <Text style={s.btnSecondaryText}>📷 Instagram</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Imagen / visual */}
        <View style={s.imageCol}>
          <View style={s.imageWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&q=80&auto=format&fit=crop' }}
              style={s.heroImage}
            />
            {/* Floating card */}
            <View style={s.floatingCard}>
              <Text style={s.floatingIcon}>💙</Text>
              <View>
                <Text style={s.floatingTitle}>¡Adoptá hoy!</Text>
                <Text style={s.floatingText}>Cuestionario gratuito</Text>
              </View>
            </View>
          </View>
          {/* Paw decoration */}
          <View style={s.pawDecor}>
            <Text style={s.pawText}>🐾</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.statBadge}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  hero: {
    backgroundColor: BRAND.bg,
    overflow: 'hidden',
    position: 'relative',
    paddingBottom: 60,
  },
  bgAccent: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: 'rgba(59, 92, 228, 0.08)',
  },
  inner: {
    flexDirection: 'row',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 40,
    paddingTop: 60,
    gap: 60,
    alignItems: 'center',
  },
  textCol: {
    flex: 1,
    minWidth: 380,
  },
  ongBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  ongDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND.cyan,
  },
  ongText: {
    color: BRAND.cyan,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 52,
    lineHeight: 62,
    fontWeight: '900',
    marginBottom: 20,
  },
  titleBlue: {
    color: BRAND.primaryLight,
  },
  titleWhite: {
    color: BRAND.text,
  },
  subtitle: {
    color: BRAND.textSoft,
    fontSize: 17,
    lineHeight: 27,
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  statBadge: {
    alignItems: 'center',
  },
  statValue: {
    color: BRAND.primaryLight,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: BRAND.textMuted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  btnPrimary: {
    backgroundColor: BRAND.primary,
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 146, 176, 0.3)',
  },
  btnSecondaryText: {
    color: BRAND.textMuted,
    fontWeight: '600',
    fontSize: 15,
  },
  imageCol: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    minWidth: 300,
  },
  imageWrapper: {
    position: 'relative',
  },
  heroImage: {
    width: 420,
    height: 460,
    borderRadius: 24,
  },
  floatingCard: {
    position: 'absolute',
    bottom: -16,
    left: -20,
    backgroundColor: '#0D0D1A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 92, 228, 0.3)',
    shadowColor: '#3B5CE4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  floatingIcon: { fontSize: 28 },
  floatingTitle: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  floatingText: { color: BRAND.textMuted, fontSize: 12 },
  pawDecor: {
    position: 'absolute',
    top: 20,
    right: -10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pawText: { fontSize: 24 },
});
