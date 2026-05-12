import React, { useState } from "react";
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
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { globalStyles as styles } from "../../constants/globalStyles";
import app from "../../firebaseConfig";

// NUEVOS HOOKS Y COMPONENTES
import { useAnimals } from '../../hooks/useAnimals';
import { useCastrations } from '../../hooks/useCastrations';
import { useAdoptions } from '../../hooks/useAdoptions';
import { CastrationForm } from '../../components/forms/CastrationForm';
import { AdoptionWizard } from '../../components/forms/AdoptionWizard';

export default function Index() {
  const { animales, loading: loadingAnimales } = useAnimals('En adopción');
  const { campanaActiva, inscribirEnCampana } = useCastrations();
  const { enviarSolicitud } = useAdoptions();

  // WIZARD DE ADOPCIÓN
  const [modalVisible, setModalVisible] = useState(false);
  const [animalSeleccionado, setAnimalSeleccionado] = useState<any>(null);

  // CASTRACIÓN
  const [modalCastracionVisible, setModalCastracionVisible] = useState(false);

  // CONSULTA DE TURNOS POR DNI
  const [modalConsultaVisible, setModalConsultaVisible] = useState(false);
  const [resultadosConsulta, setResultadosConsulta] = useState<any[]>([]);
  const [buscandoConsulta, setBuscandoConsulta] = useState(false);
  const [dniConsulta, setDniConsulta] = useState('');

  const consultarPorDNI = async () => {
    if (!dniConsulta) return Alert.alert("Atención", "Ingresa tu DNI para buscar.");
    setBuscandoConsulta(true);
    setResultadosConsulta([]);
    
    try {
      const db = getFirestore(app);
      const resultados: any[] = [];
      
      const qAdop = query(collection(db, 'Solicitudes_Adopciones'), where("datosAdoptante.dni", "==", dniConsulta));
      const snapAdop = await getDocs(qAdop);
      snapAdop.forEach(doc => resultados.push({ tipo: 'Adopción', id: doc.id, ...doc.data() }));

      const qCast = query(collection(db, 'Castraciones'), where("responsableDni", "==", dniConsulta));
      const snapCast = await getDocs(qCast);
      snapCast.forEach(doc => resultados.push({ tipo: 'Castración', id: doc.id, ...doc.data() }));

      if (resultados.length === 0) {
        Alert.alert("Sin resultados", "No hay trámites registrados con ese DNI.");
      } else {
        setResultadosConsulta(resultados);
      }
    } catch {
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

            {loadingAnimales ? (
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

      {/* NUEVO COMPONENTE: MODAL CASTRACIÓN */}
      <CastrationForm 
        visible={modalCastracionVisible}
        onSubmit={inscribirEnCampana}
        onClose={() => setModalCastracionVisible(false)}
      />

      {/* NUEVO COMPONENTE: WIZARD ADOPCIÓN */}
      <AdoptionWizard
        visible={modalVisible}
        animal={animalSeleccionado}
        onSubmit={enviarSolicitud}
        onClose={() => setModalVisible(false)}
      />

      {/* MODAL CONSULTA */}
      <Modal visible={modalConsultaVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTituloAzul}>Buscar mis Trámites</Text>
            
            <TextInput 
              style={styles.input} 
              placeholder="Ingresa tu DNI (Sin puntos)" 
              keyboardType="numeric" 
              value={dniConsulta} 
              onChangeText={setDniConsulta} 
            />
            
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
