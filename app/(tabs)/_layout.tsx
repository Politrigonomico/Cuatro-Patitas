import { Tabs } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Platform, View, StyleSheet } from "react-native";
import app from "../../firebaseConfig";

// Design System
import { isWeb, isDesktop } from "../../design-system/tokens/Theme";

// Expo defaults
import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email === "admin@cuatropatitas.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return unsub;
  }, []);

  // ─── WEB: Tabs con estilo oculto (usamos nuestro propio header) ───
  // ─── MOBILE: Tabs nativas normales ───
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          android: {},
          web: { display: "none" }, // Ocultamos tabs en web (usamos sidebar/topbar propio)
        }),
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
  );
}
