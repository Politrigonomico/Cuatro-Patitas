import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { globalStyles as styles } from "../../constants/globalStyles"; // Importamos tus estilos globales
import app from "../../firebaseConfig";
import { useFocusEffect } from 'expo-router';


export default function Index() {
  const [animales, setAnimales] = useState<any[]>([]);
  const [campanaActiva, setCampanaActiva] = useState<any>(null); // NUEVO: Estado para la campaña
  const [cargando, setCargando] = useState(true);

  // WIZARD DE ADOPCIÓN
  const [modalVisible, setModalVisible] = useState(false);
  const [animalSeleccionado, setAnimalSeleccionado] = useState<any>(null);
  const [paso, setPaso] = useState(1);
  const [datosAdoptante, setDatosAdoptante] = useState({
    nombreCompleto: "",
    telefono: "",
    tipoVivienda: "",
    tienePatio: "",
    esAlquilado: "",
    quienesViven: "",
    todosDeAcuerdo: "",
    tieneOtrasMascotas: "",
    horasSolo: "",
    acuerdoSeguimiento: "",
    dni: "", 
  });

  // CASTRACIÓN (NUEVO: Agregamos el DNI)
  const [modalCastracionVisible, setModalCastracionVisible] = useState(false);
  const [datosCastracion, setDatosCastracion] = useState({
    responsableNombre: "",
    responsableDni: "",
    responsableTelefono: "",
    animalNombre: "",
    animalEspecie: "",
    animalSexo: "",
  });

  // CONSULTA DE TURNOS POR WHATSAPP
  const [modalConsultaVisible, setModalConsultaVisible] = useState(false);
  const [telefonoConsulta, setTelefonoConsulta] = useState("");
  const [resultadosConsulta, setResultadosConsulta] = useState<any[]>([]);
  const [buscandoConsulta, setBuscandoConsulta] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const cargarDatos = async () => {
        try {
          const db = getFirestore(app);
          // Cargar Animales
          // Traemos solo los perritos que figuran "En adopción"
          const qAnimales = query(collection(db, 'Animales'), where('estado', '==', 'En adopción'));
          const querySnapshot = await getDocs(qAnimales);
          const lista: any[] = [];
          querySnapshot.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
          setAnimales(lista);

          // Cargar Campaña Abierta
          const qCampana = query(collection(db, 'Campañas'), where('estado', '==', 'Abierta'));
          const campanaSnapshot = await getDocs(qCampana);
          if (!campanaSnapshot.empty) {
            setCampanaActiva({ id: campanaSnapshot.docs[0].id, ...campanaSnapshot.docs[0].data() });
          } else {
            setCampanaActiva(null);
          }
        } catch (error) {
          console.error("Error al refrescar datos:", error);
        } finally {
          setCargando(false);
        }
      };

      cargarDatos();
    }, [])
  );

  const formatearFechaAutomatica = (fecha: Date) => {
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).replace(/^\w/, (c) => c.toUpperCase()); // Pone la primera letra en mayúscula
  };

  const avanzarPaso = () => {
    if (
      paso === 1 &&
      (!datosAdoptante.nombreCompleto || !datosAdoptante.telefono)
    )
      return Alert.alert("Atención", "Completa tu nombre y teléfono.");
    if (
      paso === 2 &&
      (!datosAdoptante.tipoVivienda ||
        !datosAdoptante.tienePatio ||
        !datosAdoptante.esAlquilado)
    )
      return Alert.alert("Atención", "Completa los datos de tu hogar.");
    if (
      paso === 3 &&
      (!datosAdoptante.quienesViven ||
        !datosAdoptante.todosDeAcuerdo ||
        !datosAdoptante.tieneOtrasMascotas)
    )
      return Alert.alert(
        "Atención",
        "Completa los datos de dinámica familiar.",
      );
    setPaso(paso + 1);
  };

  const enviarSolicitudAdopcion = async () => {
    if (!datosAdoptante.horasSolo || !datosAdoptante.acuerdoSeguimiento)
      return Alert.alert("Atención", "Completa los compromisos finales.");
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "Solicitudes_Adopciones"), {
        animalId: animalSeleccionado.id,
        animalNombre: animalSeleccionado.nombre,
        datosAdoptante: datosAdoptante,
        estadoSolicitud: "Pendiente",
        notaDevolucion: "",
      });
      Alert.alert("¡Éxito!", "Tu solicitud de adopción fue enviada.");
      setModalVisible(false);
      setPaso(1);
      setDatosAdoptante({ nombreCompleto: '', dni: '', telefono: '', tipoVivienda: '',
       tienePatio: '', esAlquilado: '', quienesViven: '', todosDeAcuerdo: '', 
       tieneOtrasMascotas: '', horasSolo: '', acuerdoSeguimiento: '' });
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar la solicitud.");
    }
  };

  const enviarSolicitudCastracion = async () => {
    // Verificamos que esté el DNI
    if (
      !datosCastracion.responsableNombre ||
      !datosCastracion.responsableDni ||
      !datosCastracion.responsableTelefono ||
      !datosCastracion.animalNombre ||
      !datosCastracion.animalEspecie ||
      !datosCastracion.animalSexo
    ) {
      return Alert.alert("Atención", "Por favor completa todos los campos.");
    }
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "Castraciones"), {
        ...datosCastracion,
        campanaId: campanaActiva.id, // LA MAGIA: Vinculamos este turno a la campaña
        estadoTurno: "Pendiente",
        notaDevolucion: "",
      });
      Alert.alert(
        "¡Anotado!",
        "Tu solicitud fue enviada al equipo. Guarda tu número de WhatsApp para consultar el estado.",
      );
      setModalCastracionVisible(false);
      setDatosCastracion({
        responsableNombre: "",
        responsableDni: "",
        responsableTelefono: "",
        animalNombre: "",
        animalEspecie: "",
        animalSexo: "",
      });
    } catch (error) {
      Alert.alert("Error", "No se pudo solicitar el turno.");
    }
  };

  const [dniConsulta, setDniConsulta] = useState(''); // Cambia el estado de telefonoConsulta por este

  const consultarPorDNI = async () => {
    if (!dniConsulta) return Alert.alert("Atención", "Ingresa tu DNI para buscar.");
    setBuscandoConsulta(true);
    setResultadosConsulta([]);
    
    try {
      const db = getFirestore(app);
      const resultados: any[] = [];
      
      // Buscamos en Adopciones por DNI
      const qAdop = query(collection(db, 'Solicitudes_Adopciones'), where("datosAdoptante.dni", "==", dniConsulta));
      const snapAdop = await getDocs(qAdop);
      snapAdop.forEach(doc => resultados.push({ tipo: 'Adopción', id: doc.id, ...doc.data() }));

      // Buscamos en Castraciones por DNI (Aquí aparecerán todos sus perros)
      const qCast = query(collection(db, 'Castraciones'), where("responsableDni", "==", dniConsulta));
      const snapCast = await getDocs(qCast);
      snapCast.forEach(doc => resultados.push({ tipo: 'Castración', id: doc.id, ...doc.data() }));

      if (resultados.length === 0) {
        Alert.alert("Sin resultados", "No hay trámites registrados con ese DNI.");
      } else {
        setResultadosConsulta(resultados);
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un problema en la búsqueda.");
    } finally {
      setBuscandoConsulta(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f4f8" }}>
      <ScrollView>
        <View style={styles.contenedorCentral}>
          <View style={[styles.header, { backgroundColor: "#1e3a8a" }]}>
            <Text style={styles.titulo}>Cuatro Patitas</Text>
            <Text style={{ fontSize: 16, color: "#93c5fd", marginTop: 5 }}>
              ¡Adopta un amigo hoy!
            </Text>
          </View>

          <View style={styles.contenido}>
            {/* SECCIÓN CASTRACIONES DINÁMICA */}
            <View style={localStyles.cajaCastracion}>
              <Text style={localStyles.tituloCajaOscura}>
                {campanaActiva
                  ? `Próxima Campaña: ${campanaActiva.fecha}`
                  : "Campañas de Castración"}
              </Text>
              <Text style={localStyles.textoCajaOscura}>
                {campanaActiva
                  ? `Lugar: ${campanaActiva.lugar}. ¡Anotá a tu mascota ahora!`
                  : "Actualmente no hay campañas abiertas al público. Consulta tu turno si ya estás anotado."}
              </Text>
              <View style={styles.filaBotones}>
                {campanaActiva && (
                  <TouchableOpacity
                    style={localStyles.botonAmarillo}
                    onPress={() => setModalCastracionVisible(true)}
                  >
                    <Text style={localStyles.textoBotonOscuro}>
                      📝 Anotarse
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={localStyles.botonConsultaGlobal}
                  onPress={() => setModalConsultaVisible(true)}
                >
                  <Text style={styles.textoBotonBlanco}>🔍 Mis Turnos</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.tituloSeccion}>
              Nuestros Perritos en Adopción
            </Text>

            {cargando ? (
              <ActivityIndicator size="large" color="#0284c7" />
            ) : (
              animales.map((animal) => (
                <View key={animal.id} style={styles.tarjeta}>
                  <Text style={localStyles.nombreAnimal}>{animal.nombre}</Text>
                  <Text style={localStyles.detalleAnimal}>
                    {animal.tamaño} • {animal.edad} • {animal.estado}
                  </Text>
                  <TouchableOpacity
                    style={localStyles.botonAdopcion}
                    onPress={() => {
                      setAnimalSeleccionado(animal);
                      setModalVisible(true);
                      setPaso(1);
                    }}
                  >
                    <Text style={styles.textoBotonBlanco}>Quiero Adoptar</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* MODAL CASTRACIÓN */}
      <Modal
        visible={modalCastracionVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTituloAzul}>Anotarse a la Campaña</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu Nombre Completo"
              value={datosCastracion.responsableNombre}
              onChangeText={(t) =>
                setDatosCastracion({ ...datosCastracion, responsableNombre: t })
              }
            />

            {/* NUEVO CAMPO: DNI */}
            <TextInput
              style={styles.input}
              placeholder="Tu DNI (Sin puntos)"
              keyboardType="numeric"
              value={datosCastracion.responsableDni}
              onChangeText={(t) =>
                setDatosCastracion({ ...datosCastracion, responsableDni: t })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Número de WhatsApp"
              keyboardType="phone-pad"
              value={datosCastracion.responsableTelefono}
              onChangeText={(t) =>
                setDatosCastracion({
                  ...datosCastracion,
                  responsableTelefono: t,
                })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre de la mascota"
              value={datosCastracion.animalNombre}
              onChangeText={(t) =>
                setDatosCastracion({ ...datosCastracion, animalNombre: t })
              }
            />

            <View style={styles.filaBotonesSeleccion}>
              <TouchableOpacity
                style={[
                  styles.botonSeleccion,
                  datosCastracion.animalEspecie === "Perro"
                    ? styles.botonActivoAzul
                    : styles.botonInactivo,
                ]}
                onPress={() =>
                  setDatosCastracion({
                    ...datosCastracion,
                    animalEspecie: "Perro",
                  })
                }
              >
                <Text>Perro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.botonSeleccion,
                  datosCastracion.animalEspecie === "Gato"
                    ? styles.botonActivoAzul
                    : styles.botonInactivo,
                ]}
                onPress={() =>
                  setDatosCastracion({
                    ...datosCastracion,
                    animalEspecie: "Gato",
                  })
                }
              >
                <Text>Gato</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.filaBotonesSeleccion}>
              <TouchableOpacity
                style={[
                  styles.botonSeleccion,
                  datosCastracion.animalSexo === "Hembra"
                    ? styles.botonActivoRosa
                    : styles.botonInactivo,
                ]}
                onPress={() =>
                  setDatosCastracion({
                    ...datosCastracion,
                    animalSexo: "Hembra",
                  })
                }
              >
                <Text>Hembra</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.botonSeleccion,
                  datosCastracion.animalSexo === "Macho"
                    ? styles.botonActivoAzul
                    : styles.botonInactivo,
                ]}
                onPress={() =>
                  setDatosCastracion({
                    ...datosCastracion,
                    animalSexo: "Macho",
                  })
                }
              >
                <Text>Macho</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.filaBotones}>
              <TouchableOpacity
                style={styles.botonCancelarModal}
                onPress={() => setModalCastracionVisible(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonEnviarPedido}
                onPress={enviarSolicitudCastracion}
              >
                <Text style={styles.textoBotonBlanco}>Anotarse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CONSULTA (ACTUALIZADO A DNI) */}
      <Modal visible={modalConsultaVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTituloAzul}>Buscar mis Trámites</Text>
            
            {/* Actualizamos el campo para que pida el DNI y use dniConsulta */}
            <TextInput 
              style={styles.input} 
              placeholder="Ingresa tu DNI (Sin puntos)" 
              keyboardType="numeric" 
              value={dniConsulta} 
              onChangeText={setDniConsulta} 
            />
            
            {/* Actualizamos el botón para que llame a consultarPorDNI */}
            <TouchableOpacity style={styles.botonEnviarPedido} onPress={consultarPorDNI}>
              <Text style={styles.textoBotonBlanco}>Buscar</Text>
            </TouchableOpacity>

            {buscandoConsulta ? <ActivityIndicator size="large" color="#0284c7" style={{marginTop: 15}} /> : (
              <ScrollView style={{maxHeight: 200, marginTop: 15}}>
                {resultadosConsulta.map((res, index) => (
                  <View key={index} style={localStyles.cajaResultado}>
                    <Text style={{fontWeight: 'bold'}}>Trámite: {res.tipo} ({res.animalNombre})</Text>
                    <Text style={{fontSize: 16, color: '#0f172a', marginVertical: 5}}>Estado: {res.estadoSolicitud || res.estadoTurno}</Text>
                    {res.notaDevolucion ? <Text>Mensaje: {res.notaDevolucion}</Text> : null}
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={{marginTop: 15, alignItems: 'center'}} onPress={() => {setModalConsultaVisible(false); setResultadosConsulta([]); setDniConsulta('');}}>
              <Text style={{color: '#ef4444', fontWeight: 'bold'}}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL ADOPCIÓN */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTituloAzul}>
              Adopción: {animalSeleccionado?.nombre}
            </Text>
            {paso === 1 && (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  value={datosAdoptante.nombreCompleto}
                  onChangeText={(t) =>
                    setDatosAdoptante({ ...datosAdoptante, nombreCompleto: t })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="DNI"
                  keyboardType="numeric"
                  value={datosAdoptante.dni}
                  onChangeText={(t) =>
                    setDatosAdoptante({ ...datosAdoptante, dni: t })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Teléfono / WhatsApp"
                  keyboardType="phone-pad"
                  value={datosAdoptante.telefono}
                  onChangeText={(t) =>
                    setDatosAdoptante({ ...datosAdoptante, telefono: t })
                  }
                />
              </View>
            )}
            {paso === 2 && (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="¿Casa o Departamento?"
                  value={datosAdoptante.tipoVivienda}
                  onChangeText={(t) =>
                    setDatosAdoptante({ ...datosAdoptante, tipoVivienda: t })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="¿Tiene patio?"
                  value={datosAdoptante.tienePatio}
                  onChangeText={(t) =>
                    setDatosAdoptante({ ...datosAdoptante, tienePatio: t })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="¿Es alquilado?"
                  value={datosAdoptante.esAlquilado}
                  onChangeText={(t) =>
                    setDatosAdoptante({ ...datosAdoptante, esAlquilado: t })
                  }
                />
              </View>
            )}
            {paso === 3 && (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="¿Quiénes viven en la casa?"
                  value={datosAdoptante.quienesViven}
                  onChangeText={(t) =>
                    setDatosAdoptante({ ...datosAdoptante, quienesViven: t })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="¿Están todos de acuerdo?"
                  value={datosAdoptante.todosDeAcuerdo}
                  onChangeText={(t) =>
                    setDatosAdoptante({ ...datosAdoptante, todosDeAcuerdo: t })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="¿Tienes mascotas?"
                  value={datosAdoptante.tieneOtrasMascotas}
                  onChangeText={(t) =>
                    setDatosAdoptante({
                      ...datosAdoptante,
                      tieneOtrasMascotas: t,
                    })
                  }
                />
              </View>
            )}
            {paso === 4 && (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="¿Cuántas horas pasará solo?"
                  value={datosAdoptante.horasSolo}
                  onChangeText={(t) =>
                    setDatosAdoptante({ ...datosAdoptante, horasSolo: t })
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="¿Aceptas seguimiento?"
                  value={datosAdoptante.acuerdoSeguimiento}
                  onChangeText={(t) =>
                    setDatosAdoptante({
                      ...datosAdoptante,
                      acuerdoSeguimiento: t,
                    })
                  }
                />
              </View>
            )}
            <View style={styles.filaBotones}>
              {paso > 1 ? (
                <TouchableOpacity
                  style={styles.botonCancelarModal}
                  onPress={() => setPaso(paso - 1)}
                >
                  <Text>Atrás</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.botonCancelarModal}
                  onPress={() => setModalVisible(false)}
                >
                  <Text>Cancelar</Text>
                </TouchableOpacity>
              )}
              {paso < 4 ? (
                <TouchableOpacity
                  style={styles.botonEnviarPedido}
                  onPress={avanzarPaso}
                >
                  <Text style={styles.textoBotonBlanco}>Siguiente</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.botonEnviarPedido}
                  onPress={enviarSolicitudAdopcion}
                >
                  <Text style={styles.textoBotonBlanco}>Enviar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos específicos que solo usa la pantalla Index (El resto viene de globalStyles)
const localStyles = StyleSheet.create({
  cajaCastracion: {
    backgroundColor: "#fef08a",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  tituloCajaOscura: {
    color: "#92400e",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  textoCajaOscura: { color: "#78350f", fontSize: 14, marginBottom: 15 },
  botonAmarillo: {
    backgroundColor: "#d97706",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  botonConsultaGlobal: {
    backgroundColor: "#1e3a8a",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  textoBotonOscuro: { color: "#334155", fontWeight: "bold", fontSize: 16 },
  nombreAnimal: { fontSize: 22, fontWeight: "bold", color: "#0f172a" },
  detalleAnimal: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 10,
    marginTop: 5,
  },
  botonAdopcion: {
    backgroundColor: "#1e3a8a",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cajaResultado: {
    padding: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginBottom: 10,
  },
});
