import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, Platform } from 'react-native';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import app from '../../firebaseConfig'; 

interface Solicitud {
  id: string; animalNombre: string; estadoSolicitud: string; notaDevolucion: string;
  datosAdoptante: { nombreCompleto: string; dni: string; telefono: string; tipoVivienda: string; tienePatio: string; esAlquilado: string; quienesViven: string; todosDeAcuerdo: string; tieneOtrasMascotas: string; horasSolo: string; acuerdoSeguimiento: string; };
}

interface Castracion {
  id: string; responsableNombre: string; responsableDni: string; responsableTelefono: string; animalNombre: string; animalEspecie: string; animalSexo: string; estadoTurno: string; notaDevolucion: string;
}

export default function Admin() {
  const [cargando, setCargando] = useState(true);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [castraciones, setCastraciones] = useState<Castracion[]>([]);

  // Modales
  const [modalAnimalVisible, setModalAnimalVisible] = useState(false);
  const [modalEvaluacionVisible, setModalEvaluacionVisible] = useState(false);
  const [modalAgendarVisible, setModalAgendarVisible] = useState(false); 
  
  // Estados de datos
  const [nuevoAnimal, setNuevoAnimal] = useState({ nombre: '', edad: '', tamaño: '', estado: 'En adopción', foto: 'url_de_prueba' });
  const [datosWhatsApp, setDatosWhatsApp] = useState({ responsableNombre: '', responsableDni: '', responsableTelefono: '', animalNombre: '', animalEspecie: '', animalSexo: '' });
  
  const [elementoActivo, setElementoActivo] = useState<{id: string, coleccion: string} | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [notaDevolucion, setNotaDevolucion] = useState('');

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const db = getFirestore(app);
      
      const adopSnapshot = await getDocs(collection(db, 'Solicitudes_Adopciones'));
      const listaAdopciones: Solicitud[] = [];
      adopSnapshot.forEach((doc) => listaAdopciones.push({ id: doc.id, ...doc.data() } as Solicitud));
      setSolicitudes(listaAdopciones);

      const castSnapshot = await getDocs(collection(db, 'Castraciones'));
      const listaCastraciones: Castracion[] = [];
      castSnapshot.forEach((doc) => listaCastraciones.push({ id: doc.id, ...doc.data() } as Castracion));
      setCastraciones(listaCastraciones);
    } catch (error) { console.error(error); } finally { setCargando(false); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const guardarPerrito = async () => {
    if (!nuevoAnimal.nombre || !nuevoAnimal.edad || !nuevoAnimal.tamaño) return Alert.alert("Atención", "Completa todos los datos.");
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, 'Animales'), nuevoAnimal);
      Alert.alert("¡Éxito!", "Agregado al catálogo.");
      setNuevoAnimal({ nombre: '', edad: '', tamaño: '', estado: 'En adopción', foto: 'url_de_prueba' });
      setModalAnimalVisible(false);
    } catch (error) { Alert.alert("Error", "No se pudo guardar."); }
  };

  const guardarTurnoWhatsApp = async () => {
    if (!datosWhatsApp.responsableNombre || !datosWhatsApp.responsableDni || !datosWhatsApp.responsableTelefono || !datosWhatsApp.animalNombre || !datosWhatsApp.animalEspecie || !datosWhatsApp.animalSexo) {
      return Alert.alert("Atención", "Selecciona y completa todos los campos del animal y el responsable.");
    }
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, 'Castraciones'), {
        ...datosWhatsApp,
        estadoTurno: 'Pendiente',
        notaDevolucion: 'Ingresado manualmente desde WhatsApp'
      });
      Alert.alert("¡Anotado!", "El turno quedó registrado en la lista.");
      setModalAgendarVisible(false);
      setDatosWhatsApp({ responsableNombre: '', responsableDni: '', responsableTelefono: '', animalNombre: '', animalEspecie: '', animalSexo: '' });
      cargarDatos();
    } catch (error) { Alert.alert("Error", "No se pudo guardar."); }
  };

  const abrirEvaluacion = (id: string, coleccion: string, estado: string) => {
    setElementoActivo({ id, coleccion }); setNuevoEstado(estado); setNotaDevolucion(''); setModalEvaluacionVisible(true);
  };

  const guardarEvaluacion = async () => {
    if (!elementoActivo) return;
    try {
      const db = getFirestore(app);
      const ref = doc(db, elementoActivo.coleccion, elementoActivo.id);
      const datosActualizar = elementoActivo.coleccion === 'Castraciones' ? { estadoTurno: nuevoEstado, notaDevolucion: notaDevolucion } : { estadoSolicitud: nuevoEstado, notaDevolucion: notaDevolucion };
      await updateDoc(ref, datosActualizar);
      setModalEvaluacionVisible(false); cargarDatos(); 
    } catch (error) { Alert.alert("Error", "No se pudo actualizar."); }
  };

  // FUNCIÓN DE BORRADO ARREGLADA (SOPORTA WEB Y MÓVIL)
  const borrarRegistro = async (id: string, coleccion: string) => {
    if (Platform.OS === 'web') {
      const seguro = window.confirm("¿Seguro que quieres borrar este registro para siempre?");
      if (seguro) {
        try {
          const db = getFirestore(app);
          await deleteDoc(doc(db, coleccion, id));
          cargarDatos();
        } catch (error) { Alert.alert("Error", "No se pudo borrar."); }
      }
    } else {
      Alert.alert("Eliminar", "¿Seguro que quieres borrar este registro para siempre?", [
        { text: "Cancelar", style: "cancel" }, 
        { text: "Sí, borrar", style: "destructive", onPress: async () => {
            try {
              const db = getFirestore(app); 
              await deleteDoc(doc(db, coleccion, id)); 
              cargarDatos();
            } catch (error) { Alert.alert("Error", "No se pudo borrar."); }
          } 
        }
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <ScrollView>
        <View style={styles.contenedorCentral}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Panel de Control</Text>
          </View>

          <View style={styles.contenido}>
            <TouchableOpacity style={styles.botonActualizarGlobal} onPress={cargarDatos}>
              <Text style={styles.textoBotonSecundario}>🔄 Sincronizar Datos</Text>
            </TouchableOpacity>

            <View style={styles.seccionAcciones}>
              <TouchableOpacity style={styles.botonAgregarAnimal} onPress={() => setModalAnimalVisible(true)}>
                <Text style={styles.textoBotonBlanco}>+ Agregar Perrito al Catálogo</Text>
              </TouchableOpacity>
            </View>

            {cargando ? <ActivityIndicator size="large" color="#0f172a" style={{marginTop: 20}} /> : (
              <>
                {/* CASTRACIONES */}
                <View style={styles.filaTituloConBoton}>
                  <Text style={styles.tituloSeccion}>Castraciones (Triage)</Text>
                  <TouchableOpacity style={styles.botonAgendarWhatsapp} onPress={() => setModalAgendarVisible(true)}>
                    <Text style={styles.textoBotonBlancoPequeño}>+ WhatsApp</Text>
                  </TouchableOpacity>
                </View>

                {castraciones.length === 0 ? <Text style={styles.textoVacio}>No hay turnos.</Text> : 
                  castraciones.map((turno) => (
                    <View key={turno.id} style={styles.tarjeta}>
                      <View style={styles.encabezadoTarjeta}>
                        <Text style={styles.nombreAnimalSolicitud}>{turno.animalNombre} ({turno.animalEspecie} {turno.animalSexo})</Text>
                        <View style={styles.filaInsignias}>
                          <Text style={styles.estadoBandeja}>{turno.estadoTurno}</Text>
                          <TouchableOpacity onPress={() => borrarRegistro(turno.id, 'Castraciones')} style={styles.botonBorrar}><Text>🗑️</Text></TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.datoAdoptante}><Text style={styles.negrita}>Dueño:</Text> {turno.responsableNombre}</Text>
                      <Text style={styles.datoAdoptante}><Text style={styles.negrita}>DNI:</Text> {turno.responsableDni} | <Text style={styles.negrita}>Tel:</Text> {turno.responsableTelefono}</Text>
                      {turno.notaDevolucion ? <Text style={styles.textoNotaInterna}><Text style={styles.negrita}>Nota:</Text> {turno.notaDevolucion}</Text> : null}
                      <View style={styles.acciones}>
                        <TouchableOpacity style={styles.botonAprobar} onPress={() => abrirEvaluacion(turno.id, 'Castraciones', 'Aprobado')}><Text style={styles.textoBotonBlanco}>Aprobar</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.botonDevolucion} onPress={() => abrirEvaluacion(turno.id, 'Castraciones', 'Lista de Espera')}><Text style={styles.textoBotonBlanco}>A Espera</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.botonRechazar} onPress={() => abrirEvaluacion(turno.id, 'Castraciones', 'Rechazado')}><Text style={styles.textoBotonBlanco}>Rechazar</Text></TouchableOpacity>
                      </View>
                    </View>
                  ))
                }

                <View style={styles.separador} />

                {/* ADOPCIONES */}
                <Text style={styles.tituloSeccion}>Solicitudes de Adopción</Text>
                {solicitudes.length === 0 ? <Text style={styles.textoVacio}>No hay solicitudes.</Text> : (
                  solicitudes.map((soli) => (
                    <View key={soli.id} style={styles.tarjeta}>
                      <View style={styles.encabezadoTarjeta}>
                        <Text style={styles.nombreAnimalSolicitud}>Para: {soli.animalNombre}</Text>
                        <View style={styles.filaInsignias}>
                          <Text style={styles.estadoBandeja}>{soli.estadoSolicitud}</Text>
                          <TouchableOpacity onPress={() => borrarRegistro(soli.id, 'Solicitudes_Adopciones')} style={styles.botonBorrar}><Text>🗑️</Text></TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.bloqueRespuestas}>
                        <Text style={styles.datoAdoptante}><Text style={styles.negrita}>Adoptante:</Text> {soli.datosAdoptante?.nombreCompleto}</Text>
                        <Text style={styles.datoAdoptante}><Text style={styles.negrita}>DNI:</Text> {soli.datosAdoptante?.dni} | <Text style={styles.negrita}>Tel:</Text> {soli.datosAdoptante?.telefono}</Text>
                        <Text style={styles.datoAdoptante}><Text style={styles.negrita}>Hogar:</Text> {soli.datosAdoptante?.tipoVivienda} | Patio: {soli.datosAdoptante?.tienePatio}</Text>
                      </View>
                      {soli.notaDevolucion ? <Text style={styles.textoNotaInterna}><Text style={styles.negrita}>Nota:</Text> {soli.notaDevolucion}</Text> : null}
                      <View style={styles.acciones}>
                        <TouchableOpacity style={styles.botonAprobar} onPress={() => abrirEvaluacion(soli.id, 'Solicitudes_Adopciones', 'Aprobado')}><Text style={styles.textoBotonBlanco}>Aprobar</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.botonDevolucion} onPress={() => abrirEvaluacion(soli.id, 'Solicitudes_Adopciones', 'Requiere Info')}><Text style={styles.textoBotonBlanco}>Info</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.botonRechazar} onPress={() => abrirEvaluacion(soli.id, 'Solicitudes_Adopciones', 'Rechazado')}><Text style={styles.textoBotonBlanco}>Rechazar</Text></TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* MODAL: AGENDAR DE WHATSAPP CON DNI */}
      <Modal visible={modalAgendarVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTituloAzul}>Agendar de WhatsApp</Text>
            
            <Text style={styles.labelFino}>Datos del Responsable</Text>
            <TextInput style={styles.input} placeholder="Nombre completo" value={datosWhatsApp.responsableNombre} onChangeText={(t) => setDatosWhatsApp({...datosWhatsApp, responsableNombre: t})} />
            <TextInput style={styles.input} placeholder="DNI (Sin puntos)" keyboardType="numeric" value={datosWhatsApp.responsableDni} onChangeText={(t) => setDatosWhatsApp({...datosWhatsApp, responsableDni: t})} />
            <TextInput style={styles.input} placeholder="Número de WhatsApp" keyboardType="phone-pad" value={datosWhatsApp.responsableTelefono} onChangeText={(t) => setDatosWhatsApp({...datosWhatsApp, responsableTelefono: t})} />
            
            <Text style={styles.labelFino}>Datos del Animal</Text>
            <TextInput style={styles.input} placeholder="Nombre de la mascota" value={datosWhatsApp.animalNombre} onChangeText={(t) => setDatosWhatsApp({...datosWhatsApp, animalNombre: t})} />
            
            <View style={styles.filaBotonesSeleccion}>
              <TouchableOpacity style={[styles.botonSeleccion, datosWhatsApp.animalEspecie === 'Perro' ? styles.botonActivoAzul : styles.botonInactivo]} onPress={() => setDatosWhatsApp({...datosWhatsApp, animalEspecie: 'Perro'})}>
                <Text style={datosWhatsApp.animalEspecie === 'Perro' ? styles.textoBotonBlanco : styles.textoBotonOscuro}>Perro</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botonSeleccion, datosWhatsApp.animalEspecie === 'Gato' ? styles.botonActivoAzul : styles.botonInactivo]} onPress={() => setDatosWhatsApp({...datosWhatsApp, animalEspecie: 'Gato'})}>
                <Text style={datosWhatsApp.animalEspecie === 'Gato' ? styles.textoBotonBlanco : styles.textoBotonOscuro}>Gato</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filaBotonesSeleccion}>
              <TouchableOpacity style={[styles.botonSeleccion, datosWhatsApp.animalSexo === 'Hembra' ? styles.botonActivoRosa : styles.botonInactivo]} onPress={() => setDatosWhatsApp({...datosWhatsApp, animalSexo: 'Hembra'})}>
                <Text style={datosWhatsApp.animalSexo === 'Hembra' ? styles.textoBotonBlanco : styles.textoBotonOscuro}>Hembra</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botonSeleccion, datosWhatsApp.animalSexo === 'Macho' ? styles.botonActivoAzul : styles.botonInactivo]} onPress={() => setDatosWhatsApp({...datosWhatsApp, animalSexo: 'Macho'})}>
                <Text style={datosWhatsApp.animalSexo === 'Macho' ? styles.textoBotonBlanco : styles.textoBotonOscuro}>Macho</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filaBotones}>
              <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalAgendarVisible(false)}>
                <Text style={styles.textoBotonOscuro}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonEnviarPedido} onPress={guardarTurnoWhatsApp}>
                <Text style={styles.textoBotonBlanco}>Anotar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODALES CLÁSICOS DE ADMIN */}
      <Modal visible={modalAnimalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}><View style={styles.modalContent}><Text style={styles.modalTituloAzul}>Nuevo Perrito</Text><TextInput style={styles.input} placeholder="Nombre" value={nuevoAnimal.nombre} onChangeText={(t) => setNuevoAnimal({...nuevoAnimal, nombre: t})} /><TextInput style={styles.input} placeholder="Edad" value={nuevoAnimal.edad} onChangeText={(t) => setNuevoAnimal({...nuevoAnimal, edad: t})} /><TextInput style={styles.input} placeholder="Tamaño" value={nuevoAnimal.tamaño} onChangeText={(t) => setNuevoAnimal({...nuevoAnimal, tamaño: t})} /><View style={styles.filaBotones}><TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalAnimalVisible(false)}><Text>Cancelar</Text></TouchableOpacity><TouchableOpacity style={styles.botonEnviarPedido} onPress={guardarPerrito}><Text style={styles.textoBotonBlanco}>Guardar</Text></TouchableOpacity></View></View></View>
      </Modal>
      <Modal visible={modalEvaluacionVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}><View style={styles.modalContent}><Text style={styles.modalTituloAzul}>Dejar una Devolución</Text><Text style={{marginBottom: 15, color: '#334155'}}>Cambio de estado a: <Text style={styles.negrita}>{nuevoEstado}</Text></Text><TextInput style={[styles.input, {height: 100, textAlignVertical: 'top'}]} placeholder="Escribe la nota..." multiline={true} value={notaDevolucion} onChangeText={setNotaDevolucion} /><View style={styles.filaBotones}><TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalEvaluacionVisible(false)}><Text>Cancelar</Text></TouchableOpacity><TouchableOpacity style={styles.botonEnviarPedido} onPress={guardarEvaluacion}><Text style={styles.textoBotonBlanco}>Guardar</Text></TouchableOpacity></View></View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorCentral: { width: '100%', maxWidth: 800, alignSelf: 'center' },
  header: { padding: 30, backgroundColor: '#0f172a', alignItems: 'center', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  contenido: { padding: 20 },
  
  botonActualizarGlobal: { backgroundColor: '#e2e8f0', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  seccionAcciones: { marginBottom: 20 },
  botonAgregarAnimal: { backgroundColor: '#f59e0b', padding: 15, borderRadius: 10, alignItems: 'center' },
  
  filaTituloConBoton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tituloSeccion: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  botonAgendarWhatsapp: { backgroundColor: '#0284c7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  textoBotonBlancoPequeño: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  
  separador: { height: 1, backgroundColor: '#cbd5e1', marginVertical: 20 },
  textoVacio: { textAlign: 'center', color: '#64748b', marginVertical: 10 },
  
  tarjeta: { backgroundColor: '#ffffff', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0' },
  encabezadoTarjeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10, marginBottom: 10 },
  nombreAnimalSolicitud: { fontSize: 18, fontWeight: 'bold', color: '#1e40af', flex: 1 },
  filaInsignias: { flexDirection: 'row', alignItems: 'center' },
  estadoBandeja: { backgroundColor: '#e2e8f0', color: '#334155', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, fontSize: 12, fontWeight: 'bold', marginRight: 10 },
  botonBorrar: { backgroundColor: '#fee2e2', padding: 8, borderRadius: 5 },
  
  bloqueRespuestas: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 10 },
  datoAdoptante: { fontSize: 14, color: '#334155', marginBottom: 6 },
  negrita: { fontWeight: 'bold' },
  textoNotaInterna: { backgroundColor: '#fef3c7', color: '#92400e', padding: 10, borderRadius: 5, fontSize: 14, marginVertical: 10, borderWidth: 1, borderColor: '#fde68a' },
  
  acciones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  botonAprobar: { backgroundColor: '#10b981', padding: 10, borderRadius: 8, flex: 1, marginRight: 5, alignItems: 'center' },
  botonDevolucion: { backgroundColor: '#f59e0b', padding: 10, borderRadius: 8, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  botonRechazar: { backgroundColor: '#ef4444', padding: 10, borderRadius: 8, flex: 1, marginLeft: 5, alignItems: 'center' },
  
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 25, borderRadius: 20 },
  modalTituloAzul: { fontSize: 22, fontWeight: 'bold', color: '#0284c7', marginBottom: 15, textAlign: 'center' },
  labelFino: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 8, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16 },
  
  filaBotonesSeleccion: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  botonSeleccion: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: '#cbd5e1' },
  botonInactivo: { backgroundColor: 'white' },
  botonActivoAzul: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  botonActivoRosa: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
  
  filaBotones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  botonCancelarModal: { backgroundColor: '#e2e8f0', padding: 15, borderRadius: 8, flex: 1, marginRight: 10, alignItems: 'center' },
  botonEnviarPedido: { backgroundColor: '#0284c7', padding: 15, borderRadius: 8, flex: 1, marginLeft: 10, alignItems: 'center' },
  
  textoBotonBlanco: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  textoBotonOscuro: { color: '#334155', fontWeight: 'bold', fontSize: 16 },
  textoBotonSecundario: { color: '#334155', fontWeight: 'bold', fontSize: 15 },
});