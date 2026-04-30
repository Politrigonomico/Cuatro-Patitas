import { Tabs } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import app from "../../firebaseConfig";

// Importaciones por defecto de Expo
import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function TabLayout() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Escuchamos quién inicia sesión para saber si mostramos la pestaña Admin
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (user) => {
      // PONÉ TU CORREO DE ADMINISTRADOR ACÁ 👇
      if (user && user.email === "admin@cuatropatitas.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return unsub;
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {},
        }),
      }}
    >
      {/* 1. PESTAÑA INICIO */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={28} color={color} />
          ),
        }}
      />

      {/* 2. PESTAÑA PERFIL */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Mi Perfil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={28} color={color} />
          ),
        }}
      />

      {/* 3. PESTAÑA ADOPTADOS */}
      <Tabs.Screen
        name="adoptados"
        options={{
          title: "Finales Felices",
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" size={28} color={color} />
          ),
        }}
      />

      {/* 4. PESTAÑA ADMIN (¡LA MAGIA SUCEDE ACÁ!) */}
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          // Si isAdmin es true, se muestra. Si es false, desaparece (null).
          href: isAdmin ? "/admin" : null,
          tabBarIcon: ({ color }) => (
            <Ionicons name="star" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
