import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { getFirestore, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import app from '../../firebaseConfig';

export default function Index() {
  const [animales, setAnimales] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // WIZARD DE ADOPCIÓN
  const [modalVisible, setModalVisible] = useState(false);
  const [animalSeleccionado, setAnimalSeleccionado] = useState<any>(null);
  const [paso, setPaso] = useState(1);
  const [datosAdoptante, setDatosAdoptante] = useState({
    nombreCompleto: '', telefono: '', tipoVivienda: '', tienePatio: '', esAlquilado: '',
    quienesViven: '', todosDeAcuerdo: '', tieneOtrasMascotas: '', horasSolo: '', acuerdoSeguimiento: ''
  });

  // CASTRACIÓN
  const [modalCastracionVisible, setModalCastracionVisible] = useState(false);
  const [datosCastracion, setDatosCastracion] = useState({
    responsableNombre: '', responsableTelefono: '', animalNombre: '', animalEspecie: '', animalSexo: ''
  });

  // CONSULTA DE TURNOS POR WHATSAPP
  const [modalConsultaVisible, setModalConsultaVisible] = useState(false);
  const [telefonoConsulta, setTelefonoConsulta] = useState('');
  const [resultadosConsulta, setResultadosConsulta] = useState<any[]>([]);
  const [buscandoConsulta, setBuscandoConsulta] = useState(false);

  useEffect(() => {
    const cargarAnimales = async () => {
      try {
        const db = getFirestore(app);
        const querySnapshot = await getDocs(collection(db, 'Animales'));
        const lista: any[] = [];
        querySnapshot.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }));
        setAnimales(lista);
      } catch (error) {
        console.error("Error al cargar animales:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarAnimales();
  }, []);

  const avanzarPaso = () => {
    if (paso === 1 && (!datosAdoptante.nombreCompleto || !datosAdoptante.telefono)) return Alert.alert("Atención", "Completa tu nombre y teléfono.");
    if (paso === 2 && (!datosAdoptante.tipoVivienda || !datosAdoptante.tienePatio || !datosAdoptante.esAlquilado)) return Alert.alert("Atención", "Completa los datos de tu hogar.");
    if (paso === 3 && (!datosAdoptante.quienesViven || !datosAdoptante.todosDeAcuerdo || !datosAdoptante.tieneOtrasMascotas)) return Alert.alert("Atención", "Completa los datos de dinámica familiar.");
    setPaso(paso + 1);
  };

  const enviarSolicitudAdopcion = async () => {
    if (!datosAdoptante.horasSolo || !datosAdoptante.acuerdoSeguimiento) return Alert.alert("Atención", "Completa los compromisos finales.");
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, 'Solicitudes_Adopciones'), {
        animalId: animalSeleccionado.id, animalNombre: animalSeleccionado.nombre,
        datosAdoptante: datosAdoptante, 
        estadoSolicitud: 'Pendiente', notaDevolucion: ''
      });
      Alert.alert("¡Éxito!", "Tu solicitud de adopción fue enviada.");
      setModalVisible(false); setPaso(1);
      setDatosAdoptante({ nombreCompleto: '', telefono: '', tipoVivienda: '', tienePatio: '', esAlquilado: '', quienesViven: '', todosDeAcuerdo: '', tieneOtrasMascotas: '', horasSolo: '', acuerdoSeguimiento: '' });
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar la solicitud.");
    }
  };

  const enviarSolicitudCastracion = async () => {
    if (!datosCastracion.responsableNombre || !datosCastracion.responsableTelefono || !datosCastracion.animalNombre || !datosCastracion.animalEspecie || !datosCastracion.animalSexo) {
      return Alert.alert("Atención", "Por favor completa todos los campos.");
    }
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, 'Castraciones'), {
        ...datosCastracion,
        estadoTurno: 'Pendiente',
        notaDevolucion: ''
      });
      Alert.alert("¡Turno Solicitado!", "Te anotaste en la lista. Guarda tu número de WhatsApp para consultar el estado.");
      setModalCastracionVisible(false);
      setDatosCastracion({ responsableNombre: '', responsableTelefono: '', animalNombre: '', animalEspecie: '', animalSexo: '' });
    } catch (error) {
      Alert.alert("Error", "No se pudo solicitar el turno.");
    }
  };

  const consultarEstadoPorWhatsApp = async () => {
    if (!telefonoConsulta) return Alert.alert("Atención", "Ingresa tu número de WhatsApp.");
    setBuscandoConsulta(true);
    setResultadosConsulta([]);
    try {
      const db = getFirestore(app);
      const resultados: any[] = [];
      
      const qAdop = query(collection(db, 'Solicitudes_Adopciones'), where("datosAdoptante.telefono", "==", telefonoConsulta));
      const snapAdop = await getDocs(qAdop);
      snapAdop.forEach(doc => resultados.push({ tipo: 'Adopción', ...doc.data() }));

      const qCast = query(collection(db, 'Castraciones'), where("responsableTelefono", "==", telefonoConsulta));
      const snapCast = await getDocs(qCast);
      snapCast.forEach(doc => resultados.push({ tipo: 'Castración', ...doc.data() }));

      if (resultados.length === 0) Alert.alert("Sin resultados", "No encontramos trámites con este número.");
      else setResultadosConsulta(resultados);
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al buscar.");
    } finally {
      setBuscandoConsulta(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <ScrollView>
        <View style={styles.contenedorCentral}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Cuatro Patitas</Text>
            <Text style={styles.subtitulo}>¡Adopta un amigo hoy!</Text>
          </View>

          <View style={styles.contenido}>
            
            {/* SECCIÓN CASTRACIONES */}
            <View style={styles.cajaCastracion}>
              <Text style={styles.tituloCajaOscura}>Campañas de Castración</Text>
              <Text style={styles.textoCajaOscura}>Anotá a tu mascota o consultá tu turno usando tu WhatsApp.</Text>
              <View style={styles.filaBotones}>
                <TouchableOpacity style={styles.botonAmarillo} onPress={() => setModalCastracionVisible(true)}>
                  <Text style={styles.textoBotonOscuro}>📝 Solicitar Turno</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.botonConsultaGlobal} onPress={() => setModalConsultaVisible(true)}>
                  <Text style={styles.textoBotonBlanco}>🔍 Consultar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.tituloSeccion}>Nuestros Perritos en Adopción</Text>
            
            {cargando ? <ActivityIndicator size="large" color="#0284c7" /> : (
              animales.map((animal) => (
                <View key={animal.id} style={styles.tarjeta}>
                  <Text style={styles.nombreAnimal}>{animal.nombre}</Text>
                  <Text style={styles.detalleAnimal}>{animal.tamaño} • {animal.edad} • {animal.estado}</Text>
                  <TouchableOpacity 
                    style={styles.botonAdopcion}
                    onPress={() => { setAnimalSeleccionado(animal); setModalVisible(true); setPaso(1); }}
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
      <Modal visible={modalCastracionVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTituloAzul}>Solicitar Castración</Text>
            <TextInput style={styles.input} placeholder="Tu Nombre Completo" value={datosCastracion.responsableNombre} onChangeText={(t) => setDatosCastracion({...datosCastracion, responsableNombre: t})} />
            <TextInput style={styles.input} placeholder="Tu Número de WhatsApp" keyboardType="phone-pad" value={datosCastracion.responsableTelefono} onChangeText={(t) => setDatosCastracion({...datosCastracion, responsableTelefono: t})} />
            <TextInput style={styles.input} placeholder="Nombre de la mascota" value={datosCastracion.animalNombre} onChangeText={(t) => setDatosCastracion({...datosCastracion, animalNombre: t})} />
            <View style={styles.filaBotonesSeleccion}>
              <TouchableOpacity style={[styles.botonSeleccion, datosCastracion.animalEspecie === 'Perro' ? styles.botonActivoAzul : styles.botonInactivo]} onPress={() => setDatosCastracion({...datosCastracion, animalEspecie: 'Perro'})}><Text>Perro</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.botonSeleccion, datosCastracion.animalEspecie === 'Gato' ? styles.botonActivoAzul : styles.botonInactivo]} onPress={() => setDatosCastracion({...datosCastracion, animalEspecie: 'Gato'})}><Text>Gato</Text></TouchableOpacity>
            </View>
            <View style={styles.filaBotonesSeleccion}>
              <TouchableOpacity style={[styles.botonSeleccion, datosCastracion.animalSexo === 'Hembra' ? styles.botonActivoRosa : styles.botonInactivo]} onPress={() => setDatosCastracion({...datosCastracion, animalSexo: 'Hembra'})}><Text>Hembra</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.botonSeleccion, datosCastracion.animalSexo === 'Macho' ? styles.botonActivoAzul : styles.botonInactivo]} onPress={() => setDatosCastracion({...datosCastracion, animalSexo: 'Macho'})}><Text>Macho</Text></TouchableOpacity>
            </View>
            <View style={styles.filaBotones}>
              <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalCastracionVisible(false)}><Text>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.botonEnviarPedido} onPress={enviarSolicitudCastracion}><Text style={styles.textoBotonBlanco}>Enviar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CONSULTA */}
      <Modal visible={modalConsultaVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTituloAzul}>Buscar mi Trámite</Text>
            <TextInput style={styles.input} placeholder="Ingresa tu WhatsApp exacto" keyboardType="phone-pad" value={telefonoConsulta} onChangeText={setTelefonoConsulta} />
            <TouchableOpacity style={styles.botonEnviarPedido} onPress={consultarEstadoPorWhatsApp}>
              <Text style={styles.textoBotonBlanco}>Buscar</Text>
            </TouchableOpacity>

            {buscandoConsulta ? <ActivityIndicator size="large" color="#0284c7" style={{marginTop: 15}} /> : (
              <ScrollView style={{maxHeight: 200, marginTop: 15}}>
                {resultadosConsulta.map((res, index) => (
                  <View key={index} style={styles.cajaResultado}>
                    <Text style={{fontWeight: 'bold'}}>Trámite: {res.tipo} ({res.animalNombre})</Text>
                    <Text style={{fontSize: 16, color: '#0f172a', marginVertical: 5}}>Estado: {res.estadoSolicitud || res.estadoTurno}</Text>
                    {res.notaDevolucion ? <Text>Mensaje: {res.notaDevolucion}</Text> : null}
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={{marginTop: 15, alignItems: 'center'}} onPress={() => {setModalConsultaVisible(false); setResultadosConsulta([]);}}>
              <Text style={{color: '#ef4444', fontWeight: 'bold'}}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL ADOPCIÓN */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTituloAzul}>Adopción: {animalSeleccionado?.nombre}</Text>
            {paso === 1 && (
              <View>
                <TextInput style={styles.input} placeholder="Nombre completo" value={datosAdoptante.nombreCompleto} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, nombreCompleto: t})} />
                <TextInput style={styles.input} placeholder="Teléfono / WhatsApp" keyboardType="phone-pad" value={datosAdoptante.telefono} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, telefono: t})} />
              </View>
            )}
            {paso === 2 && (
              <View>
                <TextInput style={styles.input} placeholder="¿Casa o Departamento?" value={datosAdoptante.tipoVivienda} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, tipoVivienda: t})} />
                <TextInput style={styles.input} placeholder="¿Tiene patio?" value={datosAdoptante.tienePatio} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, tienePatio: t})} />
                <TextInput style={styles.input} placeholder="¿Es alquilado?" value={datosAdoptante.esAlquilado} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, esAlquilado: t})} />
              </View>
            )}
            {paso === 3 && (
              <View>
                <TextInput style={styles.input} placeholder="¿Quiénes viven en la casa?" value={datosAdoptante.quienesViven} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, quienesViven: t})} />
                <TextInput style={styles.input} placeholder="¿Están todos de acuerdo?" value={datosAdoptante.todosDeAcuerdo} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, todosDeAcuerdo: t})} />
                <TextInput style={styles.input} placeholder="¿Tienes mascotas?" value={datosAdoptante.tieneOtrasMascotas} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, tieneOtrasMascotas: t})} />
              </View>
            )}
            {paso === 4 && (
              <View>
                <TextInput style={styles.input} placeholder="¿Cuántas horas pasará solo?" value={datosAdoptante.horasSolo} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, horasSolo: t})} />
                <TextInput style={styles.input} placeholder="¿Aceptas seguimiento?" value={datosAdoptante.acuerdoSeguimiento} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, acuerdoSeguimiento: t})} />
              </View>
            )}
            <View style={styles.filaBotones}>
              {paso > 1 ? (
                <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setPaso(paso - 1)}><Text>Atrás</Text></TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalVisible(false)}><Text>Cancelar</Text></TouchableOpacity>
              )}
              {paso < 4 ? (
                <TouchableOpacity style={styles.botonEnviarPedido} onPress={avanzarPaso}><Text style={styles.textoBotonBlanco}>Siguiente</Text></TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.botonEnviarPedido} onPress={enviarSolicitudAdopcion}><Text style={styles.textoBotonBlanco}>Enviar</Text></TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorCentral: { width: '100%', maxWidth: 800, alignSelf: 'center' },
  header: { backgroundColor: '#1e3a8a', padding: 30, alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  titulo: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  subtitulo: { fontSize: 16, color: '#93c5fd', marginTop: 5 },
  contenido: { padding: 20 },
  tituloSeccion: { fontSize: 20, fontWeight: 'bold', marginVertical: 15, color: '#334155' },
  cajaCastracion: { backgroundColor: '#fef08a', padding: 20, borderRadius: 15, marginBottom: 15 },
  tituloCajaOscura: { color: '#92400e', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  textoCajaOscura: { color: '#78350f', fontSize: 14, marginBottom: 15 },
  botonAmarillo: { backgroundColor: '#d97706', padding: 12, borderRadius: 8, alignItems: 'center', flex: 1, marginRight: 5 },
  botonConsultaGlobal: { backgroundColor: '#1e3a8a', padding: 12, borderRadius: 8, alignItems: 'center', flex: 1, marginLeft: 5 },
  textoBotonOscuro: { color: '#334155', fontWeight: 'bold', fontSize: 16 },
  tarjeta: { backgroundColor: '#e2e8f0', padding: 15, borderRadius: 12, marginBottom: 15 },
  nombreAnimal: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  detalleAnimal: { fontSize: 14, color: '#475569', marginBottom: 10, marginTop: 5 },
  botonAdopcion: { backgroundColor: '#1e3a8a', padding: 12, borderRadius: 8, alignItems: 'center' },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 25, borderRadius: 20 },
  modalTituloAzul: { fontSize: 22, fontWeight: 'bold', color: '#0284c7', marginBottom: 15, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16, backgroundColor: 'white' },
  filaBotonesSeleccion: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  botonSeleccion: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: '#cbd5e1' },
  botonInactivo: { backgroundColor: 'white' },
  botonActivoAzul: { backgroundColor: '#bae6fd', borderColor: '#0284c7' },
  botonActivoRosa: { backgroundColor: '#fbcfe8', borderColor: '#ec4899' },
  filaBotones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  botonCancelarModal: { backgroundColor: '#e2e8f0', padding: 15, borderRadius: 8, flex: 1, marginRight: 10, alignItems: 'center' },
  botonEnviarPedido: { backgroundColor: '#0284c7', padding: 15, borderRadius: 8, flex: 1, marginLeft: 10, alignItems: 'center' },
  textoBotonBlanco: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cajaResultado: { padding: 10, backgroundColor: '#f1f5f9', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 10 }
});