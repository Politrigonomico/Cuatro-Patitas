import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { getFirestore, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import app from '../../firebaseConfig';

export default function Index() {
  const [animales, setAnimales] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // ESTADO DEL USUARIO (Log In con Google)
  const [usuarioLogueado, setUsuarioLogueado] = useState<any>(null);

  // Configuración de Google Auth
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // NOTA: Aquí pondremos tu ID real de Google más adelante. Por ahora dejamos este de prueba.
    clientId: '897321943435-p4vtg062aleerr88o9v3i95evgagj104.apps.googleusercontent.com', 
    redirectUri: 'https://auth.expo.io/@polinomicomkops/cuatro-patitas'
  });

  // Detectar si la sesión está iniciada
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuarioLogueado(user);
    });
    return () => unsubscribe();
  }, []);

  // Procesar la respuesta de Google
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const auth = getAuth(app);
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch(() => Alert.alert("Error", "No se pudo iniciar sesión."));
    }
  }, [response]);

  const cerrarSesion = () => {
    const auth = getAuth(app);
    signOut(auth);
  };

  // Estados Adopción (Wizard)
  const [modalVisible, setModalVisible] = useState(false);
  const [animalSeleccionado, setAnimalSeleccionado] = useState<any>(null);
  const [paso, setPaso] = useState(1);
  const [datosAdoptante, setDatosAdoptante] = useState({
    nombreCompleto: '', telefono: '', tipoVivienda: '', tienePatio: '', esAlquilado: '',
    quienesViven: '', todosDeAcuerdo: '', tieneOtrasMascotas: '', horasSolo: '', acuerdoSeguimiento: ''
  });

  // Estados Castración 
  const [modalCastracionVisible, setModalCastracionVisible] = useState(false);
  const [datosCastracion, setDatosCastracion] = useState({
    responsableNombre: '', responsableTelefono: '', animalNombre: '', animalEspecie: '', animalSexo: ''
  });

  // Estados Consulta Global (Atrado al Email Automáticamente)
  const [modalConsultaVisible, setModalConsultaVisible] = useState(false);
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
        console.error(error);
      } finally {
        setCargando(false);
      }
    };
    cargarAnimales();
  }, []);

  // WIZARD DE ADOPCIÓN
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
        usuarioEmail: usuarioLogueado.email, // SE GUARDA EL CORREO INVISIBLEMENTE
        estadoSolicitud: 'Pendiente', notaDevolucion: ''
      });
      Alert.alert("¡Éxito!", "Tu solicitud de adopción fue enviada.");
      setModalVisible(false); setPaso(1);
      setDatosAdoptante({ nombreCompleto: '', telefono: '', tipoVivienda: '', tienePatio: '', esAlquilado: '', quienesViven: '', todosDeAcuerdo: '', tieneOtrasMascotas: '', horasSolo: '', acuerdoSeguimiento: '' });
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar la solicitud.");
    }
  };

  // ENVIAR TURNO DE CASTRACIÓN
  const enviarSolicitudCastracion = async () => {
    if (!datosCastracion.responsableNombre || !datosCastracion.responsableTelefono || !datosCastracion.animalNombre || !datosCastracion.animalEspecie || !datosCastracion.animalSexo) {
      return Alert.alert("Atención", "Por favor completa todos los campos.");
    }
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, 'Castraciones'), {
        ...datosCastracion,
        usuarioEmail: usuarioLogueado.email, // SE GUARDA EL CORREO INVISIBLEMENTE
        estadoTurno: 'Pendiente',
        notaDevolucion: ''
      });
      Alert.alert("¡Turno Solicitado!", "Te anotaste en la lista. Enviaremos las actualizaciones a tu correo.");
      setModalCastracionVisible(false);
      setDatosCastracion({ responsableNombre: '', responsableTelefono: '', animalNombre: '', animalEspecie: '', animalSexo: '' });
    } catch (error) {
      Alert.alert("Error", "No se pudo solicitar el turno.");
    }
  };

  // CONSULTAR ESTADO GLOBAL (AUTOMÁTICO POR EMAIL)
  const consultarEstado = async () => {
    setBuscandoConsulta(true);
    setResultadosConsulta([]);
    try {
      const db = getFirestore(app);
      const resultados: any[] = [];
      const qAdopciones = query(collection(db, 'Solicitudes_Adopciones'), where("usuarioEmail", "==", usuarioLogueado.email));
      const snapAdop = await getDocs(qAdopciones);
      snapAdop.forEach(doc => resultados.push({ tipo: 'Adopción', ...doc.data() }));

      const qCastraciones = query(collection(db, 'Castraciones'), where("usuarioEmail", "==", usuarioLogueado.email));
      const snapCast = await getDocs(qCastraciones);
      snapCast.forEach(doc => resultados.push({ tipo: 'Castración', ...doc.data() }));

      if (resultados.length === 0) Alert.alert("Sin trámites", "No tienes solicitudes en curso asociadas a este correo.");
      else setResultadosConsulta(resultados);
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al buscar tus solicitudes.");
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
            
            {/* SECCIÓN DE LOG IN */}
            {!usuarioLogueado ? (
              <View style={styles.cajaLogin}>
                <Text style={styles.tituloLogin}>Bienvenido al Refugio</Text>
                <Text style={styles.textoLogin}>Inicia sesión para adoptar, solicitar turnos y ver el estado de tus trámites al instante.</Text>
                <TouchableOpacity style={styles.botonGoogle} onPress={() => promptAsync()}>
                  <Text style={styles.textoBotonGoogle}>🔵 Ingresar con Google</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cajaBienvenida}>
                <View>
                  <Text style={styles.textoBienvenida}>¡Hola, {usuarioLogueado.displayName}!</Text>
                  <Text style={styles.textoEmail}>{usuarioLogueado.email}</Text>
                </View>
                <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
                  <Text style={styles.textoCerrarSesion}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* CONSULTA GLOBAL (SOLO VISIBLE SI ESTÁ LOGUEADO) */}
            {usuarioLogueado && (
              <TouchableOpacity style={styles.botonConsultaGlobal} onPress={() => { setModalConsultaVisible(true); consultarEstado(); }}>
                <Text style={styles.textoBotonSecundario}>🔍 Ver el estado de mis trámites</Text>
              </TouchableOpacity>
            )}

            {/* SECCIÓN CASTRACIONES */}
            <View style={styles.cajaCastracion}>
              <Text style={styles.tituloCajaOscura}>Campañas de Castración</Text>
              <Text style={styles.textoCajaOscura}>Anotá a tu mascota para la próxima campaña. Evaluaremos el cupo y la prioridad.</Text>
              {usuarioLogueado ? (
                <TouchableOpacity style={styles.botonAmarillo} onPress={() => setModalCastracionVisible(true)}>
                  <Text style={styles.textoBotonOscuro}>📝 Solicitar Turno</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.botonAmarillo, {opacity: 0.5}]} onPress={() => Alert.alert("Atención", "Inicia sesión con Google arriba para pedir un turno.")}>
                  <Text style={styles.textoBotonOscuro}>Inicia sesión para anotarte</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.tituloSeccion}>Nuestros Perritos en Adopción</Text>
            
            {cargando ? <ActivityIndicator size="large" color="#0284c7" /> : (
              animales.map((animal) => (
                <View key={animal.id} style={styles.tarjeta}>
                  <Text style={styles.nombreAnimal}>{animal.nombre}</Text>
                  <Text style={styles.detalleAnimal}>{animal.tamaño} • {animal.edad} • {animal.estado}</Text>
                  {usuarioLogueado ? (
                    <TouchableOpacity 
                      style={styles.botonAdopcion}
                      onPress={() => { setAnimalSeleccionado(animal); setModalVisible(true); setPaso(1); }}
                    >
                      <Text style={styles.textoBotonBlanco}>Quiero Adoptar</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.botonAdopcion, {backgroundColor: '#94a3b8'}]}
                      onPress={() => Alert.alert("Atención", "Inicia sesión con Google arriba para poder postularte.")}
                    >
                      <Text style={styles.textoBotonBlanco}>Inicia sesión para adoptar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* MODAL: SOLICITAR CASTRACIÓN (SIN DNI) */}
      <Modal visible={modalCastracionVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTituloAzul}>Solicitar Castración</Text>
            
            <Text style={styles.labelFino}>Tus Datos (Atados a {usuarioLogueado?.email})</Text>
            <TextInput style={styles.input} placeholder="Tu Nombre Completo" value={datosCastracion.responsableNombre} onChangeText={(t) => setDatosCastracion({...datosCastracion, responsableNombre: t})} />
            <TextInput style={styles.input} placeholder="Tu Número de WhatsApp" keyboardType="phone-pad" value={datosCastracion.responsableTelefono} onChangeText={(t) => setDatosCastracion({...datosCastracion, responsableTelefono: t})} />
            
            <Text style={styles.labelFino}>Datos de la Mascota</Text>
            <TextInput style={styles.input} placeholder="Nombre de la mascota" value={datosCastracion.animalNombre} onChangeText={(t) => setDatosCastracion({...datosCastracion, animalNombre: t})} />
            
            <View style={styles.filaBotonesSeleccion}>
              <TouchableOpacity style={[styles.botonSeleccion, datosCastracion.animalEspecie === 'Perro' ? styles.botonActivoAzul : styles.botonInactivo]} onPress={() => setDatosCastracion({...datosCastracion, animalEspecie: 'Perro'})}>
                <Text style={datosCastracion.animalEspecie === 'Perro' ? styles.textoBotonBlanco : styles.textoBotonOscuro}>Perro</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botonSeleccion, datosCastracion.animalEspecie === 'Gato' ? styles.botonActivoAzul : styles.botonInactivo]} onPress={() => setDatosCastracion({...datosCastracion, animalEspecie: 'Gato'})}>
                <Text style={datosCastracion.animalEspecie === 'Gato' ? styles.textoBotonBlanco : styles.textoBotonOscuro}>Gato</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filaBotonesSeleccion}>
              <TouchableOpacity style={[styles.botonSeleccion, datosCastracion.animalSexo === 'Hembra' ? styles.botonActivoRosa : styles.botonInactivo]} onPress={() => setDatosCastracion({...datosCastracion, animalSexo: 'Hembra'})}>
                <Text style={datosCastracion.animalSexo === 'Hembra' ? styles.textoBotonBlanco : styles.textoBotonOscuro}>Hembra</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botonSeleccion, datosCastracion.animalSexo === 'Macho' ? styles.botonActivoAzul : styles.botonInactivo]} onPress={() => setDatosCastracion({...datosCastracion, animalSexo: 'Macho'})}>
                <Text style={datosCastracion.animalSexo === 'Macho' ? styles.textoBotonBlanco : styles.textoBotonOscuro}>Macho</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filaBotones}>
              <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalCastracionVisible(false)}>
                <Text style={styles.textoBotonOscuro}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonEnviarPedido} onPress={enviarSolicitudCastracion}>
                <Text style={styles.textoBotonBlanco}>Enviar Pedido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: ESTADO DE SOLICITUD (AUTOMÁTICO POR EMAIL) */}
      <Modal visible={modalConsultaVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTituloAzul}>Mis Trámites</Text>
            <Text style={styles.textoNormalCentro}>Buscando resultados asociados a tu cuenta:</Text>
            <Text style={[styles.textoNormalCentro, {fontWeight: 'bold', color: '#0284c7', marginBottom: 15}]}>{usuarioLogueado?.email}</Text>
            
            {buscandoConsulta ? <ActivityIndicator size="large" color="#0284c7" /> : (
              <ScrollView style={{maxHeight: 300}}>
                {resultadosConsulta.map((res, index) => (
                  <View key={index} style={styles.cajaResultado}>
                    <Text style={styles.negrita}>Trámite: {res.tipo} ({res.animalNombre})</Text>
                    <Text style={styles.estadoFuerte}>Estado: {res.estadoSolicitud || res.estadoTurno}</Text>
                    {res.notaDevolucion ? (
                      <Text style={styles.notaTexto}><Text style={{fontWeight: 'bold'}}>Mensaje del refugio:</Text> {res.notaDevolucion}</Text>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity style={{marginTop: 15, alignItems: 'center'}} onPress={() => {setModalConsultaVisible(false); setResultadosConsulta([]);}}>
              <Text style={styles.textoBotonRojo}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DE ADOPCIÓN (SIN DNI) */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTituloAzul}>Adopción: {animalSeleccionado?.nombre}</Text>
            <Text style={styles.textoNormalCentro}>Paso {paso} de 4</Text>
            {paso === 1 && (
              <View>
                <Text style={styles.labelFino}>Tus Datos de Contacto</Text>
                <TextInput style={styles.input} placeholder="Nombre completo" value={datosAdoptante.nombreCompleto} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, nombreCompleto: t})} />
                <TextInput style={styles.input} placeholder="Teléfono / WhatsApp" keyboardType="phone-pad" value={datosAdoptante.telefono} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, telefono: t})} />
              </View>
            )}
            {paso === 2 && (
              <View>
                <Text style={styles.labelFino}>Sobre el Hogar</Text>
                <TextInput style={styles.input} placeholder="¿Casa o Departamento?" value={datosAdoptante.tipoVivienda} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, tipoVivienda: t})} />
                <TextInput style={styles.input} placeholder="¿Tiene patio o balcón cerrado?" value={datosAdoptante.tienePatio} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, tienePatio: t})} />
                <TextInput style={styles.input} placeholder="¿Es alquilado? (¿Permiten mascotas?)" value={datosAdoptante.esAlquilado} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, esAlquilado: t})} />
              </View>
            )}
            {paso === 3 && (
              <View>
                <Text style={styles.labelFino}>Dinámica Familiar</Text>
                <TextInput style={styles.input} placeholder="¿Quiénes viven en la casa?" value={datosAdoptante.quienesViven} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, quienesViven: t})} />
                <TextInput style={styles.input} placeholder="¿Están todos de acuerdo?" value={datosAdoptante.todosDeAcuerdo} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, todosDeAcuerdo: t})} />
                <TextInput style={styles.input} placeholder="¿Tienes otras mascotas?" value={datosAdoptante.tieneOtrasMascotas} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, tieneOtrasMascotas: t})} />
              </View>
            )}
            {paso === 4 && (
              <View>
                <Text style={styles.labelFino}>Compromiso</Text>
                <TextInput style={styles.input} placeholder="¿Cuántas horas al día pasará solo?" value={datosAdoptante.horasSolo} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, horasSolo: t})} />
                <TextInput style={styles.input} placeholder="¿Aceptas seguimiento y veterinario?" value={datosAdoptante.acuerdoSeguimiento} onChangeText={(t) => setDatosAdoptante({...datosAdoptante, acuerdoSeguimiento: t})} />
              </View>
            )}
            <View style={styles.filaBotones}>
              {paso > 1 ? (
                <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setPaso(paso - 1)}>
                  <Text style={styles.textoBotonOscuro}>Atrás</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalVisible(false)}>
                  <Text style={styles.textoBotonOscuro}>Cancelar</Text>
                </TouchableOpacity>
              )}
              {paso < 4 ? (
                <TouchableOpacity style={styles.botonEnviarPedido} onPress={avanzarPaso}>
                  <Text style={styles.textoBotonBlanco}>Siguiente</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.botonEnviarPedido} onPress={enviarSolicitudAdopcion}>
                  <Text style={styles.textoBotonBlanco}>Enviar Solicitud</Text>
                </TouchableOpacity>
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
  
  // LOGIN STYLES
  cajaLogin: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  tituloLogin: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 5 },
  textoLogin: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 15 },
  botonGoogle: { backgroundColor: '#ffffff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', width: '100%', alignItems: 'center' },
  textoBotonGoogle: { color: '#334155', fontWeight: 'bold', fontSize: 16 },
  
  cajaBienvenida: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e0f2fe', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#bae6fd' },
  textoBienvenida: { fontSize: 16, fontWeight: 'bold', color: '#0369a1' },
  textoEmail: { fontSize: 13, color: '#0284c7' },
  botonCerrarSesion: { backgroundColor: '#f1f5f9', padding: 8, borderRadius: 8 },
  textoCerrarSesion: { color: '#64748b', fontSize: 12, fontWeight: 'bold' },

  botonConsultaGlobal: { backgroundColor: '#e2e8f0', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  cajaCastracion: { backgroundColor: '#fef08a', padding: 20, borderRadius: 15, marginBottom: 15 },
  tituloCajaOscura: { color: '#92400e', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  textoCajaOscura: { color: '#78350f', fontSize: 14, marginBottom: 15 },
  botonAmarillo: { backgroundColor: '#d97706', padding: 12, borderRadius: 8, alignItems: 'center' },
  textoBotonOscuro: { color: '#334155', fontWeight: 'bold', fontSize: 16 },

  tarjeta: { backgroundColor: '#e2e8f0', padding: 15, borderRadius: 12, marginBottom: 15 },
  nombreAnimal: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  detalleAnimal: { fontSize: 14, color: '#475569', marginBottom: 10, marginTop: 5 },
  botonAdopcion: { backgroundColor: '#1e3a8a', padding: 12, borderRadius: 8, alignItems: 'center' },
  
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 25, borderRadius: 20 },
  modalTituloAzul: { fontSize: 22, fontWeight: 'bold', color: '#0284c7', marginBottom: 10, textAlign: 'center' },
  textoNormalCentro: { textAlign: 'center', color: '#334155', fontSize: 15 },
  labelFino: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 8, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16, backgroundColor: 'white' },
  
  filaBotonesSeleccion: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  botonSeleccion: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: '#cbd5e1' },
  botonInactivo: { backgroundColor: 'white' },
  botonActivoAzul: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  botonActivoRosa: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
  
  filaBotones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  botonCancelarModal: { backgroundColor: '#e2e8f0', padding: 15, borderRadius: 8, flex: 1, marginRight: 10, alignItems: 'center' },
  botonEnviarPedido: { backgroundColor: '#0284c7', padding: 15, borderRadius: 8, flex: 1, marginLeft: 10, alignItems: 'center' },
  
  textoBotonBlanco: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  textoBotonRojo: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },

  cajaResultado: { marginTop: 15, padding: 15, backgroundColor: '#f1f5f9', borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  estadoFuerte: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 5, marginTop: 5 },
  notaTexto: { fontSize: 16, color: '#334155' },
  negrita: { fontWeight: 'bold' }
});