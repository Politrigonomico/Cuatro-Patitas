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
import app from "../../firebaseConfig";

// NUEVOS HOOKS Y COMPONENTES
import { useAnimals } from '../../hooks/useAnimals';
import { useCastrations } from '../../hooks/useCastrations';
import { useAdoptions } from '../../hooks/useAdoptions';
import { CastrationForm } from '../../components/forms/CastrationForm';
import { AdoptionWizard } from '../../components/forms/AdoptionWizard';
import { AnimalCard } from '../../components/ui/AnimalCard';
import { Button, SectionTitle } from '../../components/ui';

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
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.titulo}>Cuatro Patitas</Text>
          <Text style={s.subtitulo}>¡Adopta un amigo hoy!</Text>
        </View>

        <View style={s.contenido}>
          {/* BANNER DE CASTRACIÓN PREMIUM */}
          <View style={s.cajaCastracion}>
            <View style={s.bannerRow}>
              <View style={s.iconContainer}>
                <Text style={s.bannerIcon}>🏥</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.tituloCajaOscura}>
                  {campanaActiva
                    ? `Próxima Campaña: ${campanaActiva.fecha}`
                    : "Campañas de Castración"}
                </Text>
                <Text style={s.textoCajaOscura}>
                  {campanaActiva
                    ? `Lugar: ${campanaActiva.lugar}. ¡Anotá a tu mascota!`
                    : "Actualmente no hay campañas abiertas al público. Consulta tu turno si ya estás anotado."}
                </Text>
              </View>
            </View>
            
            <View style={s.filaBotones}>
              {campanaActiva && (
                <TouchableOpacity
                  style={s.botonAmarillo}
                  onPress={() => setModalCastracionVisible(true)}
                >
                  <Text style={s.textoBotonOscuro}>📝 Anotarse</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={s.botonConsultaGlobal}
                onPress={() => setModalConsultaVisible(true)}
              >
                <Text style={s.textoBotonBlanco}>🔍 Mis Turnos</Text>
              </TouchableOpacity>
            </View>
          </View>

          <SectionTitle>Nuestros Perritos en Adopción</SectionTitle>

          {loadingAnimales ? (
            <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 20 }} />
          ) : (
            <View style={s.listaCatalogo}>
              {animales.map((animal) => (
                <AnimalCard
                  key={animal.id}
                  animal={animal}
                  onAdoptar={(anim) => {
                    setAnimalSeleccionado(anim);
                    setModalVisible(true);
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL CASTRACIÓN */}
      <CastrationForm 
        visible={modalCastracionVisible}
        onSubmit={inscribirEnCampana}
        onClose={() => setModalCastracionVisible(false)}
      />

      {/* WIZARD ADOPCIÓN */}
      <AdoptionWizard
        visible={modalVisible}
        animal={animalSeleccionado}
        onSubmit={enviarSolicitud}
        onClose={() => setModalVisible(false)}
      />

      {/* MODAL CONSULTA */}
      <Modal visible={modalConsultaVisible} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <Text style={s.modalTitulo}>Buscar mis Trámites</Text>
            
            <TextInput 
              style={s.input} 
              placeholder="Ingresa tu DNI (Sin puntos)" 
              placeholderTextColor="#94a3b8"
              keyboardType="numeric" 
              value={dniConsulta} 
              onChangeText={setDniConsulta} 
            />
            
            <Button label="Buscar" onPress={consultarPorDNI} variant="primary" style={{ marginTop: 10 }} />

            {buscandoConsulta ? (
              <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 20 }} />
            ) : (
              <ScrollView style={{ maxHeight: 200, marginTop: 15 }} showsVerticalScrollIndicator={false}>
                {resultadosConsulta.map((res, index) => (
                  <View key={index} style={s.cajaResultado}>
                    <Text style={{ fontWeight: '700', color: '#0f172a' }}>Trámite: {res.tipo} ({res.animalNombre})</Text>
                    <Text style={{ fontSize: 14, color: '#64748b', marginVertical: 4 }}>Estado: {res.estadoSolicitud || res.estadoTurno}</Text>
                    {res.notaDevolucion ? <Text style={{ fontSize: 13, color: '#0f172a' }}>Mensaje: {res.notaDevolucion}</Text> : null}
                  </View>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={{ marginTop: 20, alignItems: 'center' }} 
              onPress={() => { setModalConsultaVisible(false); setResultadosConsulta([]); setDniConsulta(''); }}
            >
              <Text style={{ color: '#ef4444', fontWeight: '700' }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  header: {
    padding: 30,
    paddingTop: 50,
    backgroundColor: "#1e3a8a",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
  },
  titulo: { fontSize: 32, fontWeight: "800", color: "#ffffff" },
  subtitulo: { fontSize: 16, color: "#93c5fd", marginTop: 4, fontWeight: "500" },
  contenido: { padding: 20 },
  
  // Banner de Castración
  cajaCastracion: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIcon: { fontSize: 24 },
  tituloCajaOscura: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  textoCajaOscura: { color: "#64748b", fontSize: 13, lineHeight: 18 },
  filaBotones: { flexDirection: 'row', gap: 10, marginTop: 16 },
  botonAmarillo: {
    backgroundColor: "#fef08a",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
  },
  botonConsultaGlobal: {
    backgroundColor: "#1e3a8a",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
  },
  textoBotonBlanco: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
  textoBotonOscuro: { color: "#854d0e", fontWeight: "700", fontSize: 14 },
  
  listaCatalogo: { gap: 16 },
  
  // Modales
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitulo: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 15 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 10,
  },
  cajaResultado: {
    padding: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
});
