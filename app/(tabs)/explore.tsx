import { useFocusEffect } from "expo-router";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { globalStyles as styles } from "../../constants/globalStyles";
import app from "../../firebaseConfig";

export default function Perfil() {
  const [user, setUser] = useState<any>(null);
  const [dni, setDni] = useState("");
  const [editandoDni, setEditandoDni] = useState(false);
  const [misTramites, setMisTramites] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el Login / Registro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [esRegistro, setEsRegistro] = useState(false);

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        verificarDniExistente(currentUser.uid);
      } else {
        setCargando(false);
      }
    });
    return unsub;
  }, []);

  const verificarDniExistente = async (uid: string) => {
    try {
      const userRef = doc(db, "Usuarios", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const dniGuardado = userSnap.data().dni;
        setDni(dniGuardado);
        cargarMisDatos(dniGuardado);
      } else {
        setEditandoDni(true);
        setCargando(false);
      }
    } catch (error) {
      console.error(error);
      setCargando(false);
    }
  };

  const cargarMisDatos = async (dniUser: string) => {
    setCargando(true);
    try {
      const resultados: any[] = [];
      const qCast = query(
        collection(db, "Castraciones"),
        where("responsableDni", "==", dniUser),
      );
      const snapCast = await getDocs(qCast);
      snapCast.forEach((doc) =>
        resultados.push({ id: doc.id, tipo: "Castración", ...doc.data() }),
      );

      const qAdop = query(
        collection(db, "Solicitudes_Adopciones"),
        where("datosAdoptante.dni", "==", dniUser),
      );
      const snapAdop = await getDocs(qAdop);
      snapAdop.forEach((doc) =>
        resultados.push({ id: doc.id, tipo: "Adopción", ...doc.data() }),
      );

      setMisTramites(resultados);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const guardarDniPerfil = async () => {
    if (dni.length < 7) return Alert.alert("Error", "Ingresa un DNI válido.");
    try {
      await setDoc(doc(db, "Usuarios", user.uid), {
        dni: dni,
        email: user.email,
        nombre: user.displayName || "Usuario",
      });
      setEditandoDni(false);
      cargarMisDatos(dni);
      Alert.alert("¡Listo!", "DNI vinculado a tu cuenta.");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar.");
    }
  };

  // --- FUNCIONES DE AUTENTICACIÓN ---
  const handleAuth = async () => {
    if (!email || !password)
      return Alert.alert("Error", "Completa todos los campos");
    setCargando(true);
    try {
      if (esRegistro) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = async () => {
    await signOut(auth);
    setDni("");
    setMisTramites([]);
    setEmail("");
    setPassword("");
  };

  useFocusEffect(
    React.useCallback(() => {
      if (dni) cargarMisDatos(dni);
    }, [dni]),
  );

  // --- VISTA CUANDO NO ESTÁ LOGUEADO ---
  if (!user) {
    return (
      <View style={localStyles.containerLogin}>
        <View style={localStyles.tarjetaLogin}>
          <Text style={localStyles.tituloLogin}>
            {esRegistro ? "Crear Cuenta" : "Inicia Sesión"}
          </Text>
          <Text style={localStyles.subtituloLogin}>
            Debes estar conectado para gestionar tus adopciones y turnos.
          </Text>

          <TextInput
            style={localStyles.inputLogin}
            placeholder="Correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={localStyles.inputLogin}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={localStyles.botonLogin}
            onPress={handleAuth}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={localStyles.textoBotonLogin}>
                {esRegistro ? "Registrarse" : "Ingresar"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 25, alignItems: "center" }}
            onPress={() => setEsRegistro(!esRegistro)}
          >
            <Text style={localStyles.linkLogin}>
              {esRegistro
                ? "¿Ya tienes cuenta? Inicia sesión"
                : "¿No tienes cuenta? Regístrate"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- VISTA DEL PERFIL (LOGUEADO) ---
  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={localStyles.headerPerfil}>
        <View>
          <Text style={localStyles.tituloPerfil}>Mi Perfil</Text>
          <Text style={{ color: "#e0e7ff", marginTop: 2 }}>{user.email}</Text>
        </View>
        <TouchableOpacity onPress={cerrarSesion} style={localStyles.botonSalir}>
          <Text style={{ color: "white", fontSize: 13, fontWeight: "bold" }}>
            Salir
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={localStyles.contenidoPerfil}>
        {/* SECCIÓN DNI */}
        <View style={localStyles.cajaDni}>
          <Text style={localStyles.label}>DNI vinculado:</Text>
          {editandoDni ? (
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <TextInput
                style={[
                  localStyles.inputLogin,
                  { flex: 1, marginBottom: 0, padding: 10 },
                ]}
                placeholder="Tu DNI"
                keyboardType="numeric"
                value={dni}
                onChangeText={setDni}
              />
              <TouchableOpacity
                style={localStyles.botonChico}
                onPress={guardarDniPerfil}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>OK</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 22, fontWeight: "bold", color: "#1e293b" }}
              >
                {dni}
              </Text>
              <TouchableOpacity onPress={() => setEditandoDni(true)}>
                <Text style={{ color: "#4f46e5", fontWeight: "bold" }}>
                  Cambiar
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: "#334155",
            marginBottom: 15,
          }}
        >
          Mis Gestiones
        </Text>

        {cargando ? (
          <ActivityIndicator size="large" color="#4f46e5" />
        ) : misTramites.length === 0 ? (
          <Text
            style={{ color: "#64748b", textAlign: "center", marginTop: 20 }}
          >
            No tienes mascotas o turnos registrados con este DNI.
          </Text>
        ) : (
          misTramites.map((item) => (
            <View key={item.id} style={styles.tarjeta}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{ fontWeight: "bold", color: "#4338ca", fontSize: 16 }}
                >
                  {item.tipo}
                </Text>
                <Text style={localStyles.badgeEstado}>
                  {item.estadoTurno || item.estadoSolicitud}
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: "#1e293b" }}>
                {item.animalNombre}
              </Text>
              {item.notaDevolucion ? (
                <View
                  style={{
                    backgroundColor: "#fef3c7",
                    padding: 10,
                    borderRadius: 8,
                    marginTop: 10,
                  }}
                >
                  <Text style={{ fontSize: 13, color: "#92400e" }}>
                    <Text style={{ fontWeight: "bold" }}>Nota:</Text>{" "}
                    {item.notaDevolucion}
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// --- ESTILOS 100% PERSONALIZADOS PARA ESTA PANTALLA ---
const localStyles = StyleSheet.create({
  // PANTALLA DE LOGIN
  containerLogin: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#e0e7ff",
  },
  tarjetaLogin: {
    backgroundColor: "white",
    width: "100%",
    maxWidth: 400,
    padding: 30,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tituloLogin: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#3730a3",
    textAlign: "center",
    marginBottom: 10,
  },
  subtituloLogin: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 25,
  },
  inputLogin: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    color: "#334155",
  },
  botonLogin: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  textoBotonLogin: { color: "white", fontSize: 16, fontWeight: "bold" },
  linkLogin: { color: "#4f46e5", fontWeight: "600", fontSize: 14 },

  // PANTALLA DE PERFIL LOGUEADO
  headerPerfil: {
    backgroundColor: "#4f46e5",
    padding: 25,
    paddingTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  tituloPerfil: { fontSize: 24, fontWeight: "bold", color: "white" },
  botonSalir: {
    backgroundColor: "#4338ca",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  contenidoPerfil: { padding: 20 },
  cajaDni: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  label: {
    fontSize: 12,
    color: "#64748b",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 5,
  },
  botonChico: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 10,
    marginLeft: 10,
  },
  badgeEstado: {
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "bold",
    overflow: "hidden",
  },
});
