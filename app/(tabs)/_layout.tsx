import { Tabs } from "expo-router";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Platform, View, StyleSheet } from "react-native";
import app from "../../firebaseConfig";

// Design System
import { isWeb, isDesktop, useTheme } from "../../design-system/tokens/Theme";
import { UnifiedHeader } from "../../design-system/components/UnifiedHeader";

// Expo defaults
import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Detectar pestaña activa basándose en los segmentos de la URL
  const activeTab = segments[segments.length - 1] || "index";

  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && u.email === "admin@cuatropatitas.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    router.replace("/");
  };

  const handleNavigate = (tabId: string) => {
    if (tabId === "index") router.push("/");
    else router.push(`/${tabId}` as any);
  };

  // ─── RENDER ───
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header Unificado para Web (Sidebar en Desktop, Topbar en Tablet/Mobile Web) */}
      {isWeb && (
        <UnifiedHeader
          user={user ? { email: user.email || "", isAdmin } : null}
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      <View style={[
        { flex: 1 },
        isDesktop && { marginLeft: 260 } // Espacio para la Sidebar fija
      ]}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarStyle: Platform.select({
              ios: { position: "absolute" },
              android: { backgroundColor: theme.surface },
              web: { display: "none" }, // Ocultamos tabs nativas en Web, usamos UnifiedHeader
            }),
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textSecondary,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Inicio",
              tabBarIcon: ({ color }) => (
                <Ionicons name="home" size={28} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="explore"
            options={{
              title: "Mi Perfil",
              tabBarIcon: ({ color }) => (
                <Ionicons name="person" size={28} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="adoptados"
            options={{
              title: "Finales Felices",
              tabBarIcon: ({ color }) => (
                <Ionicons name="heart" size={28} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="admin"
            options={{
              title: "Admin",
              href: isAdmin ? "/admin" : null,
              tabBarIcon: ({ color }) => (
                <Ionicons name="star" size={28} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}
