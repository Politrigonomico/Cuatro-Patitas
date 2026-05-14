import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import app from "../../firebaseConfig";

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
  SectionTitle,
} from "../../design-system/tokens/Typography";
import { AppCard } from "../../design-system/components/AppCard";
import { AppButton } from "../../design-system/components/AppButton";
import { StatusBadge } from "../../design-system/components/StatusBadgeComponent";
import { SkeletonList } from "../../design-system/components/SkeletonCard";
import { EmptyState } from "../../design-system/components/EmptyState";
import { AppInput } from "../../design-system/components/AppInput";

// NUEVOS HOOKS Y COMPONENTES EXISTENTES
import { useAnimals } from '../../hooks/useAnimals';
import { useCastrations } from '../../hooks/useCastrations';
import { useAdoptions } from '../../hooks/useAdoptions';
import { useAuth } from '../../hooks/useAuth';
import { CastrationForm } from '../../components/forms/CastrationForm';
import { AdoptionWizard } from '../../components/forms/AdoptionWizard';
import WebHero from '../../components/ui/WebHero';
import WebHeader from '../../components/ui/WebHeader';

export default function Index() {
  const theme = useTheme();
  const { user, dni } = useAuth();
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
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {isWeb && <WebHeader />}
      <ScrollView showsVerticalScrollIndicator={false}>
        {isWeb && <WebHero onAdoptarPress={() => {}} />}

        <View style={[s.webContainer, isDesktop ? { maxWidth: 1200 } : null]}>
          {!isWeb && (
            <View style={[s.header, { backgroundColor: theme.primary }]}>
              <Hero color="inverse">Cuatro Patitas</Hero>
              <Body color="inverse" style={{ marginTop: Spacing['1'], opacity: 0.9 }}>
                ¡Adopta un amigo hoy!
              </Body>
            </View>
          )}

          <View style={s.contenido}>
            {/* BANNER DE CASTRACIÓN PREMIUM */}
            <View style={[s.cajaCastracion, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={s.bannerRow}>
                <View style={[s.iconContainer, { backgroundColor: theme.primaryLight }]}>
                  <Text style={s.bannerIcon}>🏥</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <H3 color="primary">
                    {campanaActiva
                      ? `Próxima Campaña: ${campanaActiva.fecha}`
                      : "Campañas de Castración"}
                  </H3>
                  <BodySmall color="secondary">
                    {campanaActiva
                      ? `Lugar: ${campanaActiva.lugar}. ¡Anotá a tu mascota!`
                      : "Actualmente no hay campañas abiertas al público. Consulta tu turno si ya estás anotado."}
                  </BodySmall>
                </View>
              </View>
              
              <View style={s.filaBotones}>
                {campanaActiva && (
                  <AppButton
                    label="Anotarse"
                    variant="accent"
                    icon="📝"
                    onPress={() => setModalCastracionVisible(true)}
                    style={{ flex: 1 }}
                  />
                )}
                <AppButton
                  label="Mis Turnos"
                  variant="outline"
                  icon="🔍"
                  onPress={() => setModalConsultaVisible(true)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>

            <SectionTitle 
              title="Perritos en Adopción 🐾" 
              subtitle="Encuentra a tu compañero ideal" 
            />

            {loadingAnimales ? (
              <SkeletonList count={4} type="animal" />
            ) : animales.length === 0 ? (
              <EmptyState type="no-animals" />
            ) : (
              <View style={s.listaCatalogo}>
                {animales.map((animal) => (
                  <View key={animal.id} style={s.itemCatalogo}>
                    <AppCard
                      variant="animal"
                      imageUrl={animal.foto}
                      name={animal.nombre}
                      breed={animal.raza}
                      age={animal.edad}
                      size={animal.tamaño}
                      gender={animal.sexo?.toLowerCase() === 'macho' ? 'male' : 'female'}
                      status={animal.estado}
                      onAdoptar={() => {
                        setAnimalSeleccionado(animal);
                        setModalVisible(true);
                      }}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* MODAL CASTRACIÓN */}
      <CastrationForm 
        visible={modalCastracionVisible}
        onSubmit={inscribirEnCampana}
        onClose={() => setModalCastracionVisible(false)}
        user={user}
        dni={dni}
      />

      {/* WIZARD ADOPCIÓN */}
      <AdoptionWizard
        visible={modalVisible}
        animal={animalSeleccionado}
        onSubmit={(animalId, animalNombre, datos) => enviarSolicitud(animalId, animalNombre, datos, user?.email)}
        onClose={() => setModalVisible(false)}
        user={user}
        dni={dni}
      />

      {/* MODAL CONSULTA */}
      <Modal visible={modalConsultaVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.modalOverlay}
        >
          <View style={[s.modalSheet, { backgroundColor: theme.surface }]}>
            <H3 color="primary" style={{ marginBottom: Spacing['4'] }}>Buscar mis Trámites</H3>
            
            <AppInput 
              placeholder="Ingresa tu DNI (Sin puntos)" 
              keyboardType="numeric" 
              value={dniConsulta} 
              onChangeText={setDniConsulta} 
              variant="filled"
            />
            
            <AppButton 
              label="Buscar" 
              onPress={consultarPorDNI} 
              variant="primary" 
              loading={buscandoConsulta}
              style={{ marginTop: Spacing['3'] }} 
            />

            <ScrollView style={{ maxHeight: 300, marginTop: Spacing['4'] }} showsVerticalScrollIndicator={false}>
              {resultadosConsulta.map((res, index) => (
                <View 
                  key={index} 
                  style={[
                    s.cajaResultado, 
                    { backgroundColor: theme.surfacePressed, borderColor: theme.border }
                  ]}
                >
                  <Body weight="semibold" color="primary">
                    {res.tipo}: {res.animalNombre}
                  </Body>
                  <StatusBadge 
                    status={res.estadoSolicitud || res.estadoTurno} 
                    size="sm" 
                    style={{ marginVertical: Spacing['2'] }} 
                  />
                  {res.notaDevolucion && (
                    <Caption color="secondary">Nota: {res.notaDevolucion}</Caption>
                  )}
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={{ marginTop: Spacing['5'], alignItems: 'center' }} 
              onPress={() => { setModalConsultaVisible(false); setResultadosConsulta([]); setDniConsulta(''); }}
            >
              <Body weight="semibold" color="error">Cerrar</Body>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  webContainer: {
    width: '100%',
    maxWidth: 1024,
    alignSelf: 'center',
  },
  header: {
    padding: Spacing['8'],
    paddingTop: Spacing['12'],
    borderBottomLeftRadius: BorderRadius['3xl'],
    borderBottomRightRadius: BorderRadius['3xl'],
    alignItems: 'center',
  },
  contenido: { padding: Spacing['4'] },
  
  // Banner de Castración
  cajaCastracion: {
    padding: Spacing['5'],
    borderRadius: BorderRadius['2xl'],
    marginBottom: Spacing['5'],
    borderWidth: 1,
    ...getShadow('sm', 'light'),
  },
  bannerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing['4'] },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIcon: { fontSize: 28 },
  filaBotones: { flexDirection: 'row', gap: Spacing['3'], marginTop: Spacing['4'] },
  
  listaCatalogo: { 
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing['4'],
    ...Platform.select({
      web: {
        display: 'grid' as any,
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
      },
      default: {},
    }),
  },
  itemCatalogo: {
    flex: 1,
    minWidth: 300,
    maxWidth: isDesktop ? 400 : '100%',
  },
  
  // Modales
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(15,23,42,0.6)', 
    justifyContent: isWeb ? 'center' : 'flex-end',
    alignItems: isWeb ? 'center' : 'stretch',
    padding: isWeb ? 20 : 0,
  },
  modalSheet: {
    borderTopLeftRadius: BorderRadius['3xl'],
    borderTopRightRadius: BorderRadius['3xl'],
    borderBottomLeftRadius: isWeb ? BorderRadius['3xl'] : 0,
    borderBottomRightRadius: isWeb ? BorderRadius['3xl'] : 0,
    width: isWeb ? '100%' : 'auto',
    maxWidth: isWeb ? 500 : '100%',
    padding: Spacing['6'],
    paddingBottom: isWeb ? Spacing['6'] : Spacing['10'],
  },
  cajaResultado: {
    padding: Spacing['4'],
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing['3'],
  },
});
