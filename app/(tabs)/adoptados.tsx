import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  ViewStyle,
} from "react-native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Design System
import {
  useTheme,
  Spacing,
  BorderRadius,
  getShadow,
  isWeb,
  isDesktop,
} from "../../design-system/tokens/Theme";
import {
  Hero,
  H2,
  H3,
  Body,
  BodySmall,
  Caption,
  SectionTitle,
} from "../../design-system/tokens/Typography";
import { AppCard } from "../../design-system/components/AppCard";
import { AppButton } from "../../design-system/components/AppButton";
import { SkeletonList } from "../../design-system/components/SkeletonCard";
import { EmptyState } from "../../design-system/components/EmptyState";

// Existentes
import app from "../../firebaseConfig";
import { useFocusEffect } from "expo-router";
import WebHeader from "../../components/ui/WebHeader";

export default function Adoptados() {
  const theme = useTheme();
  const [adoptados, setAdoptados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const cargarAdoptados = async () => {
        try {
          const db = getFirestore(app);
          const q = query(
            collection(db, "Animales"),
            where("estado", "==", "Adoptado")
          );
          const snap = await getDocs(q);
          const lista: any[] = [];
          snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
          setAdoptados(lista);
        } catch (error) {
          console.error(error);
        } finally {
          setCargando(false);
        }
      };
      cargarAdoptados();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {isWeb && <WebHeader />}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[s.webContainer, isDesktop ? { maxWidth: 1200 } : null]}>
          {/* Header */}
          <View
            style={[
              s.header as ViewStyle,
              { backgroundColor: theme.secondary },
            ]}
          >
            <Hero color="inverse" align="center">
              Finales Felices
            </Hero>
            <Body
              color="inverse"
              align="center"
              style={{ opacity: 0.9, marginTop: Spacing["2"] }}
            >
              Historias de amigos que ya están en casa
            </Body>
          </View>

          <View style={s.contenido}>
            {/* Stats */}
            {!cargando && adoptados.length > 0 && (
              <View
                style={[
                  s.statsBanner as ViewStyle,
                  {
                    backgroundColor: theme.secondaryLight,
                    borderColor: theme.secondary,
                  },
                ]}
              >
                <Text style={{ fontSize: 32, marginRight: Spacing["3"] }}>
                  🎉
                </Text>
                <View>
                  <H3 color="secondary">{adoptados.length}</H3>
                  <BodySmall color="secondary">
                    {adoptados.length === 1
                      ? "perrito ya tiene hogar"
                      : "perritos ya tienen hogar"}
                  </BodySmall>
                </View>
              </View>
            )}

            {/* Lista */}
            {cargando ? (
              <SkeletonList count={4} type="animal" />
            ) : adoptados.length === 0 ? (
              <EmptyState
                type="no-adopted"
                customAction={{
                  label: "Ver Perritos",
                  onPress: () => {}, // Navegar a index
                }}
              />
            ) : (
              <View style={s.gridAdoptados}>
                {adoptados.map((pet) => (
                  <View key={pet.id} style={s.gridItem}>
                    <AppCard
                      variant="adopted"
                      imageUrl={pet.foto}
                      name={pet.nombre}
                      familyName={pet.familiaAdoptiva || "anónima"}
                      date={pet.fechaAdopcion}
                      quote={
                        pet.testimonio ||
                        "Gracias por darnos la oportunidad de cambiar una vida."
                      }
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── ESTILOS ───
const s = StyleSheet.create({
  webContainer: {
    width: "100%",
    maxWidth: 1024,
    alignSelf: "center",
  },
  header: {
    padding: Spacing["6"],
    paddingTop: Spacing["10"],
    borderBottomLeftRadius: BorderRadius["3xl"],
    borderBottomRightRadius: BorderRadius["3xl"],
    alignItems: "center",
  },
  contenido: {
    padding: Spacing["4"],
    ...Platform.select({
      web: { padding: Spacing["6"] },
      default: {},
    }),
  },
  statsBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing["5"],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing["6"],
  },
  gridAdoptados: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing["4"],
    ...Platform.select({
      web: {
        display: "grid" as any,
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "24px",
      },
      default: {},
    }),
  },
  gridItem: {
    flex: 1,
    minWidth: 300,
    maxWidth: isDesktop ? 400 : "100%",
    ...Platform.select({
      web: {
        minWidth: undefined,
        maxWidth: undefined,
      },
      default: {},
    }),
  },
});