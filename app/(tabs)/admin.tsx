import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, Platform } from 'react-native';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import app from '../../firebaseConfig'; 
import { globalStyles as styles } from '../../constants/globalStyles';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Solicitud {
  id: string; animalId: string; animalNombre: string; estadoSolicitud: string; notaDevolucion: string;
  datosAdoptante: { nombreCompleto: string; dni: string; telefono: string; tipoVivienda: string; tienePatio: string; esAlquilado: string; quienesViven: string; todosDeAcuerdo: string; tieneOtrasMascotas: string; horasSolo: string; acuerdoSeguimiento: string; };
}

interface Seguimiento {
  id: string; animalNombre: string; adoptanteNombre: string; adoptanteDni: string; adoptanteTelefono: string; fechaAdopcion: string; notasSeguimiento: string;
}

interface Castracion {
  id: string; 
  responsableNombre: string; 
  responsableDni: string; 
  responsableTelefono: string; 
  animalNombre: string; 
  animalEspecie: string; 
  animalSexo: string; 
  estadoTurno: string; 
  notaDevolucion: string;
  campanaId?: string; 
}

// NUEVO: Interfaz para las Campañas
interface Campana {
  id: string; fecha: string; lugar: string; cupo: string; estado: string;
}

export default function Admin() {
  const [cargando, setCargando] = useState(true);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [castraciones, setCastraciones] = useState<Castracion[]>([]);
  const [campanas, setCampanas] = useState<Campana[]>([]); // NUEVO: Estado para las campañas
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [modalManualVisible, setModalManualVisible] = useState(false);
  const [datosManual, setDatosManual] = useState({ 
    animalNombre: '', adoptanteNombre: '', adoptanteDni: '', adoptanteTelefono: '', fechaAdopcion: '', notasSeguimiento: '' 
  });

  // Modales
  const [modalAnimalVisible, setModalAnimalVisible] = useState(false);
  const [modalEvaluacionVisible, setModalEvaluacionVisible] = useState(false);
  const [modalAgendarVisible, setModalAgendarVisible] = useState(false); 
  const [modalCampanaVisible, setModalCampanaVisible] = useState(false); // NUEVO: Modal de campaña
  
  // Estados de datos
  const [nuevoAnimal, setNuevoAnimal] = useState({ nombre: '', edad: '', tamaño: '', estado: 'En adopción', foto: 'url_de_prueba' });
  const [datosWhatsApp, setDatosWhatsApp] = useState({ responsableNombre: '', responsableDni: '', responsableTelefono: '', animalNombre: '', animalEspecie: '', animalSexo: '' });
  // NUEVO: Estado para crear la campaña
  const [nuevaCampana, setNuevaCampana] = useState({ fecha: '', lugar: '', cupo: '', estado: 'Abierta' });
  
  const [elementoActivo, setElementoActivo] = useState<{id: string, coleccion: string} | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [notaDevolucion, setNotaDevolucion] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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

      // NUEVO: Cargar campañas
      const campSnapshot = await getDocs(collection(db, 'Campañas'));
      const listaCampanas: Campana[] = [];
      campSnapshot.forEach((doc) => listaCampanas.push({ id: doc.id, ...doc.data() } as Campana));
      setCampanas(listaCampanas);
      
      const segSnapshot = await getDocs(collection(db, 'Seguimiento'));
      const listaSeguimientos: Seguimiento[] = [];
      segSnapshot.forEach((doc) => listaSeguimientos.push({ id: doc.id, ...doc.data() } as Seguimiento));
      setSeguimientos(listaSeguimientos);

    } catch (error) { console.error(error); } finally { setCargando(false); }
  };

  useEffect(() => { cargarDatos(); }, []);

  // NUEVO: Función para guardar campaña
  const guardarCampana = async () => {
    if (!nuevaCampana.fecha || !nuevaCampana.lugar || !nuevaCampana.cupo) return Alert.alert("Atención", "Completa todos los datos de la campaña.");
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, 'Campañas'), nuevaCampana);
      Alert.alert("¡Éxito!", "Campaña creada y abierta al público.");
      setNuevaCampana({ fecha: '', lugar: '', cupo: '', estado: 'Abierta' });
      setModalCampanaVisible(false);
      cargarDatos();
    } catch { Alert.alert("Error", "No se pudo crear la campaña."); }
  };

  const guardarManual = async () => {
    if (!datosManual.animalNombre || !datosManual.adoptanteNombre || !datosManual.adoptanteDni) {
      return Alert.alert("Atención", "Nombre del perro, del adoptante y DNI son obligatorios.");
    }
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, 'Seguimiento'), {
        ...datosManual,
        animalId: 'manual', // Marcamos que fue una carga manual
        fechaAdopcion: datosManual.fechaAdopcion || new Date().toLocaleDateString(),
        notasSeguimiento: datosManual.notasSeguimiento || 'Cargado manualmente desde registros antiguos.'
      });
      Alert.alert("¡Éxito!", "Adoptante antiguo registrado.");
      setModalManualVisible(false);
      setDatosManual({ animalNombre: '', adoptanteNombre: '', adoptanteDni: '', adoptanteTelefono: '', fechaAdopcion: '', notasSeguimiento: '' });
      cargarDatos();
    } catch { Alert.alert("Error", "No se pudo guardar."); }
  };

  const guardarPerrito = async () => {
    if (!nuevoAnimal.nombre || !nuevoAnimal.edad || !nuevoAnimal.tamaño) return Alert.alert("Atención", "Completa todos los datos.");
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, 'Animales'), nuevoAnimal);
      Alert.alert("¡Éxito!", "Agregado al catálogo.");
      setNuevoAnimal({ nombre: '', edad: '', tamaño: '', estado: 'En adopción', foto: 'url_de_prueba' });
      setModalAnimalVisible(false);
    } catch { Alert.alert("Error", "No se pudo guardar."); }
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
    } catch { Alert.alert("Error", "No se pudo guardar."); }
  };

  const abrirEvaluacion = (id: string, coleccion: string, estado: string) => {
    setElementoActivo({ id, coleccion }); setNuevoEstado(estado); setNotaDevolucion(''); setModalEvaluacionVisible(true);
  };

  const guardarEvaluacion = async () => {
    if (!elementoActivo) return;
    
    try {
      const db = getFirestore(app);
      const refRegistro = doc(db, elementoActivo.coleccion, elementoActivo.id);
      
      let mensajeExito = "Estado actualizado correctamente.";

      // --- 0. LÓGICA DE EDICIÓN DE SEGUIMIENTO (Notas de perros ya adoptados) ---
      if (elementoActivo.coleccion === 'Seguimiento') {
        await updateDoc(refRegistro, { notasSeguimiento: notaDevolucion });
        Alert.alert("¡Éxito!", "La nota de seguimiento se guardó.");
        setModalEvaluacionVisible(false);
        cargarDatos();
        return;
      }

      // --- 1. LÓGICA DE ADOPCIÓN EXITOSA ---
      if (elementoActivo.coleccion === 'Solicitudes_Adopciones' && nuevoEstado === 'Aprobado') {
        const soli = solicitudes.find(s => s.id === elementoActivo.id);
        
        if (soli) {
          // A. Movemos al animal a estado "Adoptado"
          const animalRef = doc(db, 'Animales', soli.animalId);
          await updateDoc(animalRef, { estado: 'Adoptado' });

          // B. Creamos la ficha de Seguimiento (tus "papeles" digitales)
          await addDoc(collection(db, 'Seguimiento'), {
            animalId: soli.animalId,
            animalNombre: soli.animalNombre,
            adoptanteNombre: soli.datosAdoptante.nombreCompleto || 'No registrado',
            adoptanteDni: soli.datosAdoptante.dni || 'No registrado',
            adoptanteTelefono: soli.datosAdoptante.telefono || 'No registrado',
            fechaAdopcion: new Date().toLocaleDateString(),
            notasSeguimiento: "Adopción aprobada. Pendiente seguimiento."
          });

          mensajeExito = "El animal se movió a 'Adoptados' y se creó su ficha de seguimiento.";
        }
      }

      // --- 2. LÓGICA DE CUPOS DE CASTRACIONES ---
      if (elementoActivo.coleccion === 'Castraciones') {
        const snapTurno = castraciones.find(c => c.id === elementoActivo.id);
        if (snapTurno && snapTurno.campanaId) {
          const estadoAnterior = snapTurno.estadoTurno;
          let diferenciaCupo = 0;
          if (estadoAnterior !== 'Aprobado' && nuevoEstado === 'Aprobado') diferenciaCupo = -1;
          else if (estadoAnterior === 'Aprobado' && nuevoEstado !== 'Aprobado') diferenciaCupo = 1;

          if (diferenciaCupo !== 0) {
            const refCampana = doc(db, 'Campañas', snapTurno.campanaId);
            const campanaActual = campanas.find(c => c.id === snapTurno.campanaId);
            if (campanaActual) {
              const nuevoCupo = parseInt(campanaActual.cupo) + diferenciaCupo;
              await updateDoc(refCampana, { cupo: nuevoCupo.toString(), estado: nuevoCupo > 0 ? 'Abierta' : 'Llena' });
            }
          }
        }
      }

      // --- 3. CAMBIO DE ESTADO DE LA SOLICITUD (Vital para que desaparezca de pendientes) ---
      // Aquí es donde le avisamos a la base de datos que esta solicitud ya NO es "Pendiente"
      const datosActualizar = elementoActivo.coleccion === 'Castraciones' 
        ? { estadoTurno: nuevoEstado, notaDevolucion: notaDevolucion } 
        : { estadoSolicitud: nuevoEstado, notaDevolucion: notaDevolucion };
      
      await updateDoc(refRegistro, datosActualizar);

      // --- 4. FINALIZAR ---
      Alert.alert("¡Hecho!", mensajeExito);
      setModalEvaluacionVisible(false); 
      cargarDatos(); // Refrescamos la lista para que el registro aprobado desaparezca de la vista

    } catch (error) { 
      console.error(error);
      Alert.alert("Error", "No se pudo completar la operación.");
    }
  };

  const formatearFechaAutomatica = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).replace(/^\w/, (c) => c.toUpperCase()); // Pone la primera letra en mayúscula
  };

  const borrarRegistro = async (id: string, coleccion: string) => {
    if (Platform.OS === 'web') {
      const seguro = window.confirm("¿Seguro que quieres borrar este registro para siempre?");
      if (seguro) {
        try {
          const db = getFirestore(app);
          await deleteDoc(doc(db, coleccion, id));
          cargarDatos();
        } catch { Alert.alert("Error", "No se pudo borrar."); }
      }
    } else {
      Alert.alert("Eliminar", "¿Seguro que quieres borrar este registro para siempre?", [
        { text: "Cancelar", style: "cancel" }, 
        { text: "Sí, borrar", style: "destructive", onPress: async () => {
            try {
              const db = getFirestore(app); 
              await deleteDoc(doc(db, coleccion, id)); 
              cargarDatos();
            } catch { Alert.alert("Error", "No se pudo borrar."); }
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
              
              {/* NUEVO: Botón para crear campaña */}
              <TouchableOpacity style={[styles.botonAgregarAnimal, {backgroundColor: '#8b5cf6', marginTop: 10}]} onPress={() => setModalCampanaVisible(true)}>
                <Text style={styles.textoBotonBlanco}>📅 Crear Campaña de Castración</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.botonAgregarAnimal, {backgroundColor: '#1e293b', marginTop: 10}]} onPress={() => setModalManualVisible(true)}>
                <Text style={styles.textoBotonBlanco}>📂 Cargar Adoptante Antiguo</Text>
              </TouchableOpacity>

            {cargando ? <ActivityIndicator size="large" color="#0f172a" style={{marginTop: 20}} /> : (
              <>
                {/* NUEVO: SECCIÓN CAMPAÑAS */}
                <Text style={styles.tituloSeccion}>Campañas Activas</Text>
                {campanas.length === 0 ? <Text style={styles.textoVacio}>No hay campañas programadas.</Text> : 
                  campanas.map((camp) => (
                    <View key={camp.id} style={styles.tarjeta}>
                      <View style={styles.encabezadoTarjeta}>
                        <Text style={styles.nombreAnimalSolicitud}>Campaña: {camp.fecha}</Text>
                        <View style={styles.filaInsignias}>
                          <Text style={[styles.estadoBandeja, camp.estado === 'Abierta' ? {backgroundColor: '#dcfce7', color: '#166534'} : {}]}>{camp.estado}</Text>
                          <TouchableOpacity onPress={() => borrarRegistro(camp.id, 'Campañas')} style={styles.botonBorrar}><Text>🗑️</Text></TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.datoAdoptante}><Text style={styles.negrita}>Lugar:</Text> {camp.lugar}</Text>
                      <Text style={styles.datoAdoptante}><Text style={styles.negrita}>Cupo máximo:</Text> {camp.cupo} lugares</Text>
                    </View>
                  ))
                }

                <View style={styles.separador} />

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
                <Text style={styles.tituloSeccion}>Control de Seguimientos (Adoptados)</Text>
                {seguimientos.length === 0 ? <Text style={styles.textoVacio}>No hay seguimientos registrados.</Text> : 
                  seguimientos.map((seg) => (
                    <View key={seg.id} style={[styles.tarjeta, {borderLeftWidth: 5, borderLeftColor: '#059669'}]}>
                      <View style={styles.encabezadoTarjeta}>
                        <Text style={styles.nombreAnimalSolicitud}>{seg.animalNombre}</Text>
                        <TouchableOpacity onPress={() => borrarRegistro(seg.id, 'Seguimiento')} style={styles.botonBorrar}><Text>🗑️</Text></TouchableOpacity>
                      </View>
                      <Text style={styles.datoAdoptante}><Text style={styles.negrita}>Adoptante:</Text> {seg.adoptanteNombre} (DNI: {seg.adoptanteDni})</Text>
                      <Text style={styles.datoAdoptante}><Text style={styles.negrita}>Teléfono:</Text> {seg.adoptanteTelefono}</Text>
                      <Text style={styles.datoAdoptante}><Text style={styles.negrita}>Fecha:</Text> {seg.fechaAdopcion}</Text>
                      
                      <TouchableOpacity 
                        style={styles.textoNotaInterna} 
                        onPress={() => abrirEvaluacion(seg.id, 'Seguimiento', 'Actualizar Nota')}
                      >
                        <Text style={{color: '#92400e'}}><Text style={styles.negrita}>Nota de Seguimiento:</Text> {seg.notasSeguimiento}</Text>
                        <Text style={{fontSize: 10, marginTop: 5, color: '#b45309'}}>Toca para editar nota</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                }

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

      {/* NUEVO: MODAL PARA CREAR CAMPAÑA */}
      <Modal visible={modalCampanaVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTituloAzul}>Nueva Campaña</Text>
            
            <Text style={styles.labelFino}>Fecha de la Campaña</Text>
              <TouchableOpacity 
                style={styles.input} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{fontSize: 16, color: nuevaCampana.fecha ? '#000' : '#94a3b8'}}>
                  {nuevaCampana.fecha || "Toca para elegir fecha"}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDate(selectedDate);
                      const fechaFormateada = formatearFechaAutomatica(selectedDate);
                      setNuevaCampana({...nuevaCampana, fecha: fechaFormateada});
                    }
                  }}
                />
              )}
            
            <Text style={styles.labelFino}>Lugar / Dirección</Text>
            <TextInput style={styles.input} placeholder="¿Dónde será?" value={nuevaCampana.lugar} onChangeText={(t) => setNuevaCampana({...nuevaCampana, lugar: t})} />
            
            <Text style={styles.labelFino}>Cupo Máximo</Text>
            <TextInput style={styles.input} placeholder="Cantidad de animales permitidos" keyboardType="numeric" value={nuevaCampana.cupo} onChangeText={(t) => setNuevaCampana({...nuevaCampana, cupo: t})} />
            
            <View style={styles.filaBotones}>
              <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalCampanaVisible(false)}>
                <Text style={styles.textoBotonOscuro}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botonEnviarPedido, {backgroundColor: '#8b5cf6'}]} onPress={guardarCampana}>
                <Text style={styles.textoBotonBlanco}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

      {/* MODAL: CARGAR ADOPTANTE ANTIGUO */}
      <Modal visible={modalManualVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTituloAzul}>Cargar Registro Antiguo</Text>
            
            <TextInput style={styles.input} placeholder="Nombre del Perro" value={datosManual.animalNombre} onChangeText={(t) => setDatosManual({...datosManual, animalNombre: t})} />
            <TextInput style={styles.input} placeholder="Nombre del Adoptante" value={datosManual.adoptanteNombre} onChangeText={(t) => setDatosManual({...datosManual, adoptanteNombre: t})} />
            <TextInput style={styles.input} placeholder="DNI del Adoptante" keyboardType="numeric" value={datosManual.adoptanteDni} onChangeText={(t) => setDatosManual({...datosManual, adoptanteDni: t})} />
            <TextInput style={styles.input} placeholder="Teléfono" keyboardType="phone-pad" value={datosManual.adoptanteTelefono} onChangeText={(t) => setDatosManual({...datosManual, adoptanteTelefono: t})} />
            <TextInput style={styles.input} placeholder="Fecha (Ej: Marzo 2023)" value={datosManual.fechaAdopcion} onChangeText={(t) => setDatosManual({...datosManual, fechaAdopcion: t})} />
            
            <TextInput 
              style={[styles.input, {height: 80, textAlignVertical: 'top'}]} 
              placeholder="Notas iniciales de seguimiento..." 
              multiline={true} 
              value={datosManual.notasSeguimiento} 
              onChangeText={(t) => setDatosManual({...datosManual, notasSeguimiento: t})} 
            />

            <View style={styles.filaBotones}>
              <TouchableOpacity style={styles.botonCancelarModal} onPress={() => setModalManualVisible(false)}>
                <Text style={styles.textoBotonOscuro}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonEnviarPedido} onPress={guardarManual}>
                <Text style={styles.textoBotonBlanco}>Guardar Registro</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

