import React, { useEffect, useState } from "react";
import emailjs from "@emailjs/react-native";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  H1,
  H2,
  H3,
  Body,
  BodySmall,
  Caption,
} from "../../design-system/tokens/Typography";
import { AppCard } from "../../design-system/components/AppCard";
import { AppButton, IconButton } from "../../design-system/components/AppButton";
import { StatusBadge } from "../../design-system/components/StatusBadge";
import { SkeletonList } from "../../design-system/components/SkeletonCard";
import { EmptyState } from "../../design-system/components/EmptyState";
import { AppInput } from "../../design-system/components/AppInput";

// Existentes
import app from "../../firebaseConfig";
import { useAuth } from "../../hooks/useAuth";
import { useFocusEffect } from "expo-router";

export default function Perfil() {
  const theme = useTheme();
  const {
    user,
    loading: authLoading,
    isAdmin,
    dni: dniHook,
    saveDni,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  } = useAuth();

  const [dni, setDni] = useState("");
  const [editandoDni, setEditandoDni] = useState(false);
  const [misTramites, setMisTramites] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dniRegistro, setDniRegistro] = useState("");
  const [esRegistro, setEsRegistro] = useState(false);
  const [necesitaDni, setNecesitaDni] = useState(false);

  const db = getFirestore(app);

  useEffect(() => {
    if (user && dniHook) {
      setDni(dniHook);
      setNecesitaDni(false);
      setCargando(true);

      const qCast = query(
        collection(db, "Castraciones"),
        where("responsableDni", "==", dniHook)
      );
      const qAdop = query(
        collection(db, "Solicitudes_Adopciones"),
        where("datosAdoptante.dni", "==", dniHook)
      );

      let castraciones: any[] = [];
      let adopciones: any[] = [];

      const unsubCast = onSnapshot(
        qCast,
        (snap) => {
          castraciones = snap.docs.map((docSnap) => ({
            id: docSnap.id,
            tipo: "Castración",
            ...docSnap.data(),
          }));
          setMisTramites([...castraciones, ...adopciones]);
          setCargando(false);
        },
        (error) => {
          console.error(error);
          setCargando(false);
        }
      );

      const unsubAdop = onSnapshot(
        qAdop,
        (snap) => {
          adopciones = snap.docs.map((docSnap) => ({
            id: docSnap.id,
            tipo: "Adopción",
            ...docSnap.data(),
          }));
          setMisTramites([...castraciones, ...adopciones]);
          setCargando(false);
        },
        (error) => {
          console.error(error);
          setCargando(false);
        }
      );

      return () => {
        unsubCast();
        unsubAdop();
      };
    } else if (user && !dniHook && !authLoading && !isAdmin) {
      setNecesitaDni(true);
      setCargando(false);
    } else if (!user && !authLoading) {
      setCargando(false);
      setNecesitaDni(false);
    }
  }, [user, dniHook, authLoading, isAdmin, db]);

  const borrarGestion = (id: string, tipo: string) => {
    Alert.alert("Borrar Prueba", `¿Seguro que quieres borrar esta ${tipo}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Borrar",
        style: "destructive",
        onPress: async () => {
          try {
            const coleccion =
              tipo === "Castración" ? "Castraciones" : "Solicitudes_Adopciones";
            await deleteDoc(doc(db, coleccion, id));
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo borrar");
          }
        },
      },
    ]);
  };

  const guardarDniPerfil = async () => {
    if (dni.length < 7) return Alert.alert("Error", "Ingresa un DNI válido.");
    try {
      await saveDni(dni);
      setEditandoDni(false);
      Alert.alert("¡Listo!", "DNI vinculado a tu cuenta.");
    } catch {
      Alert.alert("Error", "No se pudo guardar.");
    }
  };

  const guardarDniGoogle = async () => {
    if (!dniRegistro) return Alert.alert("Error", "El DNI es obligatorio.");
    setCargando(true);
    try {
      const qUsuarios = query(
        collection(db, "Usuarios"),
        where("dni", "==", dniRegistro)
      );
      const snapUsuarios = await getDocs(qUsuarios);

      if (!snapUsuarios.empty) {
        setCargando(false);
        return Alert.alert(
          "Error",
          "El DNI ingresado ya está registrado con otra cuenta."
        );
      }

      await saveDni(dniRegistro);

      try {
        await emailjs.send(
          "service_qiarh1e",
          "template_atixtzk",
          {
            to_email: user!.email,
            user_dni: dniRegistro,
            subject: "¡Bienvenido a Cuatro Patitas!",
          },
          { publicKey: "UXNkFYGoFoOO86qS3" }
        );
      } catch (emailError) {
        console.error("Error al enviar correo:", emailError);
      }

      Alert.alert("¡Éxito!", "Perfil completado.");
      setNecesitaDni(false);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleAuth = async () => {
    if (!email || !password)
      return Alert.alert("Error", "Completa todos los campos");
    if (esRegistro && !dniRegistro) {
      return Alert.alert("Error", "El DNI es obligatorio para registrarse.");
    }

    setCargando(true);
    try {
      if (esRegistro) {
        const qUsuarios = query(
          collection(db, "Usuarios"),
          where("dni", "==", dniRegistro)
        );
        const snapUsuarios = await getDocs(qUsuarios);

        if (!snapUsuarios.empty) {
          setCargando(false);
          return Alert.alert(
            "Error",
            "El DNI ingresado ya está registrado con otra cuenta."
          );
        }

        await signUp(email, password);
        await saveDni(dniRegistro);

        try {
          await emailjs.send(
            "service_qiarh1e",
            "template_atixtzk",
            {
              to_email: email,
              user_dni: dniRegistro,
              subject: "¡Bienvenido a Cuatro Patitas!",
            },
            { publicKey: "UXNkFYGoFoOO86qS3" }
          );
        } catch (emailError) {
          console.error("Error al enviar correo:", emailError);
        }

        Alert.alert("¡Éxito!", "Cuenta creada correctamente.");
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert("Error con Google", error.message);
    }
  };

  const cerrarSesion = async () => {
    await signOut();
    setDni("");
    setMisTramites([]);
    setEmail("");
    setPassword("");
    setDniRegistro("");
    setNecesitaDni(false);
  };

  // ─── VISTA: BLOQUEANTE DNI GOOGLE ───
  if (user && necesitaDni) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[s.containerLogin, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            s.tarjetaLogin,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              ...getShadow("xl", isWeb ? "dark" : "light"),
            },
          ]}
        >
          <H2 color="primary" align="center">
            Completa tu Perfil
          </H2>
          <BodySmall
            color="secondary"
            align="center"
            style={{ marginVertical: Spacing["4"] }}
          >
            Para continuar, por favor ingresa tu DNI. Este campo es inmutable.
          </BodySmall>

          <AppInput
            label="DNI"
            placeholder="Tu DNI"
            keyboardType="numeric"
            value={dniRegistro}
            onChangeText={setDniRegistro}
            variant="filled"
          />

          <AppButton
            label="Guardar y Continuar"
            variant="primary"
            onPress={guardarDniGoogle}
            loading={cargando}
            style={{ marginTop: Spacing["4"] }}
          />

          <TouchableOpacity
            style={{ marginTop: Spacing["4"], alignItems: "center" }}
            onPress={cerrarSesion}
          >
            <Body weight="semibold" color="error">
              Cancelar y Salir
            </Body>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ─── VISTA: LOGIN ───
  if (!user) {
    return (
      <View
        style={[s.containerLogin, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            s.tarjetaLogin,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              ...getShadow("xl", isWeb ? "dark" : "light"),
            },
          ]}
        >
          <H2 color="primary" align="center">
            {esRegistro ? "Crear Cuenta" : "Inicia Sesión"}
          </H2>
          <BodySmall
            color="secondary"
            align="center"
            style={{ marginVertical: Spacing["4"] }}
          >
            Debes estar conectado para gestionar tus adopciones y turnos.
          </BodySmall>

          <AppInput
            placeholder="Correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            iconLeft="📧"
            variant="filled"
          />
          <AppInput
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            iconLeft="🔒"
            variant="filled"
            style={{ marginTop: Spacing["3"] }}
          />

          {esRegistro && (
            <AppInput
              placeholder="DNI (Inmutable)"
              keyboardType="numeric"
              value={dniRegistro}
              onChangeText={setDniRegistro}
              iconLeft="🆔"
              variant="filled"
              style={{ marginTop: Spacing["3"] }}
            />
          )}

          <AppButton
            label={esRegistro ? "Registrarse" : "Ingresar con Correo"}
            variant="primary"
            onPress={handleAuth}
            loading={cargando}
            style={{ marginTop: Spacing["4"] }}
          />

          {/* Divider */}
          <View style={s.divider}>
            <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
            <Caption color="tertiary" style={{ marginHorizontal: Spacing["3"] }}>
              o
            </Caption>
            <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <AppButton
            label="Continuar con Google"
            variant="outline"
            icon="🔍"
            onPress={handleGoogleLogin}
          />

          <TouchableOpacity
            style={{ marginTop: Spacing["5"], alignItems: "center" }}
            onPress={() => setEsRegistro(!esRegistro)}
          >
            <Body weight="semibold" color="primary">
              {esRegistro
                ? "¿Ya tienes cuenta? Inicia sesión"
                : "¿No tienes cuenta? Regístrate"}
            </Body>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── VISTA: PERFIL LOGUEADO ───
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>

      <View style={[s.webContainer, isDesktop && { maxWidth: 1200 }]}>
        {/* Header Perfil */}
        <View
          style={[
            s.headerPerfil,
            { backgroundColor: theme.primary },
          ]}
        >
          <View>
            <H2 color="inverse">Mi Perfil</H2>
            <BodySmall color="inverse" style={{ opacity: 0.9, marginTop: Spacing["1"] }}>
              {user.email}
            </BodySmall>
          </View>
          <AppButton
            label="Salir"
            variant="ghost"
            size="sm"
            onPress={cerrarSesion}
          />
        </View>

        <ScrollView contentContainerStyle={s.contenidoPerfil}>
          {/* DNI Card */}
          <View
            style={[
              s.cajaDni,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                ...getShadow("sm", isWeb ? "dark" : "light"),
              },
            ]}
          >
            <Caption
              weight="semibold"
              color="secondary"
              style={{ textTransform: "uppercase", letterSpacing: 0.5 }}
            >
              DNI vinculado
            </Caption>
            {editandoDni ? (
              <View
                style={{
                  flexDirection: "row",
                  marginTop: Spacing["3"],
                  alignItems: "center",
                }}
              >
                <AppInput
                  placeholder="Tu DNI"
                  keyboardType="numeric"
                  value={dni}
                  onChangeText={setDni}
                  variant="filled"
                  style={{ flex: 1, marginBottom: 0 }}
                />
                <IconButton
                  icon="✓"
                  variant="primary"
                  size="md"
                  onPress={guardarDniPerfil}
                  style={{ marginLeft: Spacing["2"] }}
                />
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: Spacing["2"],
                }}
              >
                <H3 color="primary">{dni || "No vinculado"}</H3>
                <TouchableOpacity onPress={() => setEditandoDni(true)}>
                  <Body weight="semibold" color="primary">
                    Cambiar
                  </Body>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Gestiones */}
          <H3 style={{ marginBottom: Spacing["4"] }}>Mis Gestiones</H3>

          {cargando ? (
            <SkeletonList count={3} type="text" />
          ) : misTramites.length === 0 ? (
            <EmptyState type="empty-profile" />
          ) : (
            <View style={s.grillaTramites}>
              {misTramites.map((item) => (
                <View
                  key={item.id}
                  style={[
                    s.tarjetaTramite,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      ...getShadow("sm", isWeb ? "dark" : "light"),
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: Spacing["3"],
                    }}
                  >
                    <Body weight="semibold" color="primary">
                      {item.tipo}
                    </Body>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: Spacing["2"],
                      }}
                    >
                      <StatusBadge
                        status={item.estadoTurno || item.estadoSolicitud}
                        size="sm"
                      />
                      {isAdmin && (
                        <IconButton
                          icon="🗑️"
                          variant="ghost"
                          size="sm"
                          onPress={() => borrarGestion(item.id, item.tipo)}
                        />
                      )}
                    </View>
                  </View>
                  <H4 color="primary">{item.animalNombre}</H4>
                  {item.fechaSolicitud && (
                    <Caption color="tertiary" style={{ marginTop: Spacing["1"] }}>
                      {item.fechaSolicitud}
                    </Caption>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// ─── ESTILOS ───
const s = StyleSheet.create({
  webContainer: {
    width: "100%",
    maxWidth: 1024,
    alignSelf: "center",
    flex: 1,
  },
  containerLogin: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["5"],
  },
  tarjetaLogin: {
    width: "100%",
    maxWidth: 420,
    padding: Spacing["6"],
    borderRadius: BorderRadius["2xl"],
    borderWidth: 1,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing["5"],
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  headerPerfil: {
    padding: Spacing["6"],
    paddingTop: Spacing["10"],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: BorderRadius["3xl"],
    borderBottomRightRadius: BorderRadius["3xl"],
  },
  contenidoPerfil: {
    padding: Spacing["4"],
    ...Platform.select({
      web: { padding: Spacing["6"] },
      default: {},
    }),
  },
  cajaDni: {
    padding: Spacing["5"],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing["6"],
  },
  grillaTramites: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing["4"],
  },
  tarjetaTramite: {
    flex: 1,
    minWidth: 280,
    maxWidth: isDesktop ? 380 : "100%",
    padding: Spacing["4"],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    ...Platform.select({
      web: {
        minWidth: "unset",
        maxWidth: "unset",
        width: "calc(50% - 12px)",
      },
      default: {},
    }),
  },
});