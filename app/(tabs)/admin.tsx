import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, Platform, StyleSheet } from 'react-native';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import app from '../../firebaseConfig'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, SectionTitle, Card, Badge } from '../../components/ui';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { RequestCard } from '../../components/ui/RequestCard';
import { CastrationCard } from '../../components/ui/CastrationCard';

import type { Solicitud, Castracion, Campana, Animal, Seguimiento } from '../../types';

type Seccion = 'MENU' | 'ANIMALES' | 'ADOPCIONES' | 'CASTRACIONES';

export default function Admin() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('MENU');
  const [cargando, setCargando] = useState(true);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [castraciones, setCastraciones] = useState<Castracion[]>([]);
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [animales, setAnimales] = useState<Animal[]>([]);

  // Filtros
  const [filtroAdopciones, setFiltroAdopciones] = useState<'Todas' | 'Pendiente'>('Todas');

  // Modales
  const [modalManualVisible, setModalManualVisible] = useState(false);
  const [modalAnimalVisible, setModalAnimalVisible] = useState(false);
  const [modalEvaluacionVisible, setModalEvaluacionVisible] = useState(false);
  const [modalAgendarVisible, setModalAgendarVisible] = useState(false); 
  const [modalCampanaVisible, setModalCampanaVisible] = useState(false); 
  
  // Estados de datos
  const [nuevoAnimal, setNuevoAnimal] = useState({ nombre: '', edad: '', tamaño: '', estado: 'En adopción', descripcion: '', fotos: [] as string[] });
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState<string[]>([]);
  const [subiendoAnimal, setSubiendoAnimal] = useState(false);
  const [datosWhatsApp, setDatosWhatsApp] = useState({ responsableNombre: '', responsableDni: '', responsableTelefono: '', animalNombre: '', animalEspecie: '', animalSexo: '' });
  const [nuevaCampana, setNuevaCampana] = useState({ fecha: '', lugar: '', cupo: '', estado: 'Abierta' });
  const [datosManual, setDatosManual] = useState({ animalNombre: '', adoptanteNombre: '', adoptanteDni: '', adoptanteTelefono: '', fechaAdopcion: '', notasSeguimiento: '' });
  
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

      const campSnapshot = await getDocs(collection(db, 'Campañas'));
      const listaCampanas: Campana[] = [];
      campSnapshot.forEach((doc) => listaCampanas.push({ id: doc.id, ...doc.data() } as Campana));
      setCampanas(listaCampanas);
      
      const segSnapshot = await getDocs(collection(db, 'Seguimiento'));
      const listaSeguimientos: Seguimiento[] = [];
      segSnapshot.forEach((doc) => listaSeguimientos.push({ id: doc.id, ...doc.data() } as Seguimiento));
      setSeguimientos(listaSeguimientos);

      const animSnapshot = await getDocs(collection(db, 'Animales'));
      const listaAnimales: Animal[] = [];
      animSnapshot.forEach((doc) => listaAnimales.push({ id: doc.id, ...doc.data() } as Animal));
      setAnimales(listaAnimales);

    } catch (error) { console.error(error); } finally { setCargando(false); }
  };

  useEffect(() => { cargarDatos(); }, []);

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
        animalId: 'manual', 
        fechaAdopcion: datosManual.fechaAdopcion || new Date().toLocaleDateString(),
        notasSeguimiento: datosManual.notasSeguimiento || 'Cargado manualmente desde registros antiguos.'
      });
      Alert.alert("¡Éxito!", "Adoptante antiguo registrado.");
      setModalManualVisible(false);
      setDatosManual({ animalNombre: '', adoptanteNombre: '', adoptanteDni: '', adoptanteTelefono: '', fechaAdopcion: '', notasSeguimiento: '' });
      cargarDatos();
    } catch { Alert.alert("Error", "No se pudo guardar."); }
  };

  const seleccionarImagenes = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 2,
      quality: 0.7,
    });
    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri).slice(0, 2);
      setImagenesSeleccionadas(uris);
    }
  };

  const guardarPerrito = async () => {
    if (!nuevoAnimal.nombre || !nuevoAnimal.edad || !nuevoAnimal.tamaño || !nuevoAnimal.descripcion) {
      return Alert.alert("Atención", "Completa todos los datos y la descripción.");
    }
    try {
      setSubiendoAnimal(true);
      const storage = getStorage(app);
      const urlsSubidas: string[] = [];

      for (const uri of imagenesSeleccionadas) {
        // En React Native, XMLHttpRequest es más confiable que fetch() para crear Blobs locales
        const blob: Blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function() { resolve(xhr.response); };
          xhr.onerror = function(e) { reject(new TypeError('Network request failed')); };
          xhr.responseType = 'blob';
          xhr.open('GET', uri, true);
          xhr.send(null);
        });

        const filename = `animales/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);
        urlsSubidas.push(downloadUrl);
      }

      const db = getFirestore(app);
      const animalFinal = {
        ...nuevoAnimal,
        fotos: urlsSubidas,
      };
      
      await addDoc(collection(db, 'Animales'), animalFinal);
      Alert.alert("¡Éxito!", "Agregado al catálogo.");
      setNuevoAnimal({ nombre: '', edad: '', tamaño: '', estado: 'En adopción', descripcion: '', fotos: [] });
      setImagenesSeleccionadas([]);
      setModalAnimalVisible(false);
      cargarDatos();
    } catch (e) { 
      console.error(e);
      Alert.alert("Error", "No se pudo guardar."); 
    } finally {
      setSubiendoAnimal(false);
    }
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

      if (elementoActivo.coleccion === 'Seguimiento') {
        await updateDoc(refRegistro, { notasSeguimiento: notaDevolucion });
        Alert.alert("¡Éxito!", "La nota de seguimiento se guardó.");
        setModalEvaluacionVisible(false);
        cargarDatos();
        return;
      }

      if (elementoActivo.coleccion === 'Solicitudes_Adopciones' && nuevoEstado === 'Aprobado') {
        const soli = solicitudes.find(s => s.id === elementoActivo.id);
        
        if (soli) {
          const animalRef = doc(db, 'Animales', soli.animalId);
          await updateDoc(animalRef, { estado: 'Adoptado' });

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

      const datosActualizar = elementoActivo.coleccion === 'Castraciones' 
        ? { estadoTurno: nuevoEstado, notaDevolucion: notaDevolucion } 
        : { estadoSolicitud: nuevoEstado, notaDevolucion: notaDevolucion };
      
      await updateDoc(refRegistro, datosActualizar);

      Alert.alert("¡Hecho!", mensajeExito);
      setModalEvaluacionVisible(false); 
      cargarDatos(); 

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
    }).replace(/^\w/, (c) => c.toUpperCase());
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

  const renderCabecera = (titulo: string) => (
    <View style={s.header}>
      {seccionActiva !== 'MENU' && (
        <TouchableOpacity style={s.botonVolver} onPress={() => setSeccionActiva('MENU')}>
          <Text style={s.textoVolver}>← Volver</Text>
        </TouchableOpacity>
      )}
      <Text style={s.titulo}>{titulo}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* --- VISTA: MENÚ PRINCIPAL (DASHBOARD) --- */}
        {seccionActiva === 'MENU' && (
          <>
            {renderCabecera('Panel de Control')}
            <View style={s.contenido}>
              <TouchableOpacity style={s.botonSincronizar} onPress={cargarDatos}>
                <Text style={s.textoSincronizar}>🔄 Sincronizar Datos</Text>
              </TouchableOpacity>

              <View style={s.gridMenu}>
                <MenuCard title="Gestionar Animales" icon="🐾" count={animales.length} onPress={() => setSeccionActiva('ANIMALES')} />
                <MenuCard title="Solicitudes Adopción" icon="🏠" count={solicitudes.filter(s => s.estadoSolicitud === 'Pendiente').length} subtitle="Pendientes" onPress={() => setSeccionActiva('ADOPCIONES')} />
                <MenuCard title="Turnos Castración" icon="🏥" count={castraciones.filter(c => c.estadoTurno === 'Pendiente').length} subtitle="Pendientes" onPress={() => setSeccionActiva('CASTRACIONES')} />
              </View>

              <TouchableOpacity style={s.botonCargaManual} onPress={() => setModalManualVisible(true)}>
                <Text style={s.textoCargaManual}>📂 Cargar Adoptante Antiguo</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* --- VISTA: ANIMALES --- */}
        {seccionActiva === 'ANIMALES' && (
          <>
            {renderCabecera('Gestión de Animales')}
            <View style={s.contenido}>
              <Button label="+ Agregar Perrito al Catálogo" onPress={() => setModalAnimalVisible(true)} variant="primary" style={{ marginBottom: 20 }} />
              
              {cargando ? <ActivityIndicator size="large" color="#1e3a8a" /> : (
                animales.map((anim) => (
                  <Card key={anim.id} style={s.cardMini}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View>
                        <Text style={s.nombreAnimal}>{anim.nombre}</Text>
                        <Text style={s.detalleAnimal}>{anim.tamaño} · {anim.edad}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Badge status={anim.estado} />
                        <TouchableOpacity onPress={() => borrarRegistro(anim.id, 'Animales')} hitSlop={8}>
                          <Text style={{ fontSize: 16 }}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                ))
              )}
            </View>
          </>
        )}

        {/* --- VISTA: ADOPCIONES --- */}
        {seccionActiva === 'ADOPCIONES' && (
          <>
            {renderCabecera('Solicitudes de Adopción')}
            <View style={s.contenido}>
              {/* Filtro Rápido */}
              <View style={s.filtroContainer}>
                <TouchableOpacity style={[s.filtroBtn, filtroAdopciones === 'Todas' && s.filtroBtnActivo]} onPress={() => setFiltroAdopciones('Todas')}>
                  <Text style={[s.filtroText, filtroAdopciones === 'Todas' && s.filtroTextActivo]}>Todas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.filtroBtn, filtroAdopciones === 'Pendiente' && s.filtroBtnActivo]} onPress={() => setFiltroAdopciones('Pendiente')}>
                  <Text style={[s.filtroText, filtroAdopciones === 'Pendiente' && s.filtroTextActivo]}>Pendientes</Text>
                </TouchableOpacity>
              </View>

              {cargando ? <ActivityIndicator size="large" color="#1e3a8a" /> : (
                solicitudes
                  .filter(soli => filtroAdopciones === 'Todas' || soli.estadoSolicitud === 'Pendiente')
                  .map((soli) => (
                    <RequestCard
                      key={soli.id}
                      solicitud={soli}
                      onAprobar={() => abrirEvaluacion(soli.id, 'Solicitudes_Adopciones', 'Aprobado')}
                      onInfo={() => abrirEvaluacion(soli.id, 'Solicitudes_Adopciones', 'Requiere Info')}
                      onRechazar={() => abrirEvaluacion(soli.id, 'Solicitudes_Adopciones', 'Rechazado')}
                      onEliminar={() => borrarRegistro(soli.id, 'Solicitudes_Adopciones')}
                    />
                  ))
              )}
            </View>
          </>
        )}

        {/* --- VISTA: CASTRACIONES --- */}
        {seccionActiva === 'CASTRACIONES' && (
          <>
            {renderCabecera('Turnos y Campañas')}
            <View style={s.contenido}>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                <Button label="+ Nueva Campaña" onPress={() => setModalCampanaVisible(true)} variant="primary" style={{ flex: 1 }} />
                <Button label="+ WhatsApp" onPress={() => setModalAgendarVisible(true)} variant="secondary" style={{ flex: 1 }} />
              </View>

              <SectionTitle>Campañas Activas</SectionTitle>
              {campanas.map((camp) => (
                <Card key={camp.id} style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ fontWeight: '700', color: '#0f172a' }}>{camp.fecha}</Text>
                      <Text style={{ fontSize: 13, color: '#64748b' }}>{camp.lugar}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Badge status={camp.estado} />
                      <TouchableOpacity onPress={() => borrarRegistro(camp.id, 'Campañas')} hitSlop={8}>
                        <Text style={{ fontSize: 16 }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}

              <SectionTitle>Solicitudes de Turno</SectionTitle>
              {cargando ? <ActivityIndicator size="large" color="#1e3a8a" /> : (
                castraciones.map((turno) => (
                  <CastrationCard
                    key={turno.id}
                    turno={turno}
                    onAprobar={() => abrirEvaluacion(turno.id, 'Castraciones', 'Aprobado')}
                    onEspera={() => abrirEvaluacion(turno.id, 'Castraciones', 'Lista de Espera')}
                    onRechazar={() => abrirEvaluacion(turno.id, 'Castraciones', 'Rechazado')}
                    onEliminar={() => borrarRegistro(turno.id, 'Castraciones')}
                  />
                ))
              )}
            </View>
          </>
        )}

      </ScrollView>

      {/* --- MODALES (Se mantienen iguales pero con estilo pulido) --- */}
      
      {/* NUEVO: MODAL PARA CREAR CAMPAÑA */}
      <Modal visible={modalCampanaVisible} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <Text style={s.modalTitulo}>Nueva Campaña</Text>
            
            <Text style={s.labelFino}>Fecha de la Campaña</Text>
              <TouchableOpacity style={s.input} onPress={() => setShowDatePicker(true)}>
                <Text style={{fontSize: 15, color: nuevaCampana.fecha ? '#0f172a' : '#94a3b8'}}>
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
            
            <Text style={s.labelFino}>Lugar / Dirección</Text>
            <TextInput style={s.input} placeholder="¿Dónde será?" value={nuevaCampana.lugar} onChangeText={(t) => setNuevaCampana({...nuevaCampana, lugar: t})} />
            
            <Text style={s.labelFino}>Cupo Máximo</Text>
            <TextInput style={s.input} placeholder="Cantidad de animales" keyboardType="numeric" value={nuevaCampana.cupo} onChangeText={(t) => setNuevaCampana({...nuevaCampana, cupo: t})} />
            
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Button label="Cancelar" onPress={() => setModalCampanaVisible(false)} variant="secondary" style={{ flex: 1 }} />
              <Button label="Publicar" onPress={guardarCampana} variant="primary" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: AGENDAR DE WHATSAPP */}
      <Modal visible={modalAgendarVisible} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={s.modalSheet}>
            <Text style={s.modalTitulo}>Agendar de WhatsApp</Text>
            
            <Text style={s.labelFino}>Datos del Responsable</Text>
            <TextInput style={s.input} placeholder="Nombre completo" value={datosWhatsApp.responsableNombre} onChangeText={(t) => setDatosWhatsApp({...datosWhatsApp, responsableNombre: t})} />
            <TextInput style={s.input} placeholder="DNI (Sin puntos)" keyboardType="numeric" value={datosWhatsApp.responsableDni} onChangeText={(t) => setDatosWhatsApp({...datosWhatsApp, responsableDni: t})} />
            <TextInput style={s.input} placeholder="Número de WhatsApp" keyboardType="phone-pad" value={datosWhatsApp.responsableTelefono} onChangeText={(t) => setDatosWhatsApp({...datosWhatsApp, responsableTelefono: t})} />
            
            <Text style={s.labelFino}>Datos del Animal</Text>
            <TextInput style={s.input} placeholder="Nombre de la mascota" value={datosWhatsApp.animalNombre} onChangeText={(t) => setDatosWhatsApp({...datosWhatsApp, animalNombre: t})} />
            
            <View style={s.filaBotonesSeleccion}>
              <TouchableOpacity style={[s.botonSeleccion, datosWhatsApp.animalEspecie === 'Perro' && s.botonActivo]} onPress={() => setDatosWhatsApp({...datosWhatsApp, animalEspecie: 'Perro'})}>
                <Text style={datosWhatsApp.animalEspecie === 'Perro' ? s.textoActivo : s.textoInactivo}>Perro</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.botonSeleccion, datosWhatsApp.animalEspecie === 'Gato' && s.botonActivo]} onPress={() => setDatosWhatsApp({...datosWhatsApp, animalEspecie: 'Gato'})}>
                <Text style={datosWhatsApp.animalEspecie === 'Gato' ? s.textoActivo : s.textoInactivo}>Gato</Text>
              </TouchableOpacity>
            </View>

            <View style={s.filaBotonesSeleccion}>
              <TouchableOpacity style={[s.botonSeleccion, datosWhatsApp.animalSexo === 'Hembra' && s.botonActivo]} onPress={() => setDatosWhatsApp({...datosWhatsApp, animalSexo: 'Hembra'})}>
                <Text style={datosWhatsApp.animalSexo === 'Hembra' ? s.textoActivo : s.textoInactivo}>Hembra</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.botonSeleccion, datosWhatsApp.animalSexo === 'Macho' && s.botonActivo]} onPress={() => setDatosWhatsApp({...datosWhatsApp, animalSexo: 'Macho'})}>
                <Text style={datosWhatsApp.animalSexo === 'Macho' ? s.textoActivo : s.textoInactivo}>Macho</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Button label="Cancelar" onPress={() => setModalAgendarVisible(false)} variant="secondary" style={{ flex: 1 }} />
              <Button label="Anotar" onPress={guardarTurnoWhatsApp} variant="primary" style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL: NUEVO PERRITO */}
      <Modal visible={modalAnimalVisible} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={s.modalSheet}>
            <Text style={s.modalTitulo}>Nuevo Animal</Text>
            
            <Text style={s.labelFino}>Nombre</Text>
            <TextInput style={s.input} placeholder="Ej: Firulais" value={nuevoAnimal.nombre} onChangeText={(t) => setNuevoAnimal({...nuevoAnimal, nombre: t})} />
            
            <Text style={s.labelFino}>Edad</Text>
            <TextInput style={s.input} placeholder="Ej: 2 meses, 3 años" value={nuevoAnimal.edad} onChangeText={(t) => setNuevoAnimal({...nuevoAnimal, edad: t})} />
            
            <Text style={s.labelFino}>Tamaño</Text>
            <TextInput style={s.input} placeholder="Pequeño, Mediano, Grande" value={nuevoAnimal.tamaño} onChangeText={(t) => setNuevoAnimal({...nuevoAnimal, tamaño: t})} />
            
            <Text style={s.labelFino}>Descripción</Text>
            <TextInput 
              style={[s.input, {height: 80, textAlignVertical: 'top'}]} 
              placeholder="¿Cómo es su personalidad? ¿Está vacunado?" 
              multiline={true}
              value={nuevoAnimal.descripcion} 
              onChangeText={(t) => setNuevoAnimal({...nuevoAnimal, descripcion: t})} 
            />

            <Text style={s.labelFino}>Fotos (Máx 2)</Text>
            <TouchableOpacity style={s.botonSincronizar} onPress={seleccionarImagenes}>
              <Text style={s.textoSincronizar}>📷 Elegir Fotos ({imagenesSeleccionadas.length}/2)</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Button label="Cancelar" onPress={() => setModalAnimalVisible(false)} variant="secondary" style={{ flex: 1 }} disabled={subiendoAnimal} />
              <Button label={subiendoAnimal ? "Guardando..." : "Guardar Animal"} onPress={guardarPerrito} variant="primary" style={{ flex: 1 }} disabled={subiendoAnimal} />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL: EVALUACIÓN / DEVOLUCIÓN */}
      <Modal visible={modalEvaluacionVisible} animationType="fade" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalSheet}>
            <Text style={s.modalTitulo}>Dejar una Devolución</Text>
            <Text style={{marginBottom: 15, color: '#475569'}}>Cambio de estado a: <Text style={{fontWeight: '700', color: '#0f172a'}}>{nuevoEstado}</Text></Text>
            <TextInput style={[s.input, {height: 100, textAlignVertical: 'top'}]} placeholder="Escribe la nota..." multiline={true} value={notaDevolucion} onChangeText={setNotaDevolucion} />
            
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Button label="Cancelar" onPress={() => setModalEvaluacionVisible(false)} variant="secondary" style={{ flex: 1 }} />
              <Button label="Guardar" onPress={guardarEvaluacion} variant="primary" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: CARGAR ADOPTANTE ANTIGUO */}
      <Modal visible={modalManualVisible} animationType="slide" transparent={true}>
        <View style={s.modalOverlay}>
          <ScrollView contentContainerStyle={s.modalSheet}>
            <Text style={s.modalTitulo}>Cargar Registro Antiguo</Text>
            
            <TextInput style={s.input} placeholder="Nombre del Perro" value={datosManual.animalNombre} onChangeText={(t) => setDatosManual({...datosManual, animalNombre: t})} />
            <TextInput style={s.input} placeholder="Nombre del Adoptante" value={datosManual.adoptanteNombre} onChangeText={(t) => setDatosManual({...datosManual, adoptanteNombre: t})} />
            <TextInput style={s.input} placeholder="DNI del Adoptante" keyboardType="numeric" value={datosManual.adoptanteDni} onChangeText={(t) => setDatosManual({...datosManual, adoptanteDni: t})} />
            <TextInput style={s.input} placeholder="Teléfono" keyboardType="phone-pad" value={datosManual.adoptanteTelefono} onChangeText={(t) => setDatosManual({...datosManual, adoptanteTelefono: t})} />
            <TextInput style={s.input} placeholder="Fecha (Ej: Marzo 2023)" value={datosManual.fechaAdopcion} onChangeText={(t) => setDatosManual({...datosManual, fechaAdopcion: t})} />
            
            <TextInput 
              style={[s.input, {height: 80, textAlignVertical: 'top'}]} 
              placeholder="Notas iniciales de seguimiento..." 
              multiline={true} 
              value={datosManual.notasSeguimiento} 
              onChangeText={(t) => setDatosManual({...datosManual, notasSeguimiento: t})} 
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Button label="Cancelar" onPress={() => setModalManualVisible(false)} variant="secondary" style={{ flex: 1 }} />
              <Button label="Guardar Registro" onPress={guardarManual} variant="primary" style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

// Componente local para las tarjetas del menú
function MenuCard({ title, icon, count, subtitle, onPress }: { title: string; icon: string; count: number; subtitle?: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.menuCard} onPress={onPress} activeOpacity={0.8}>
      <Text style={s.menuIcon}>{icon}</Text>
      <Text style={s.menuTitle}>{title}</Text>
      <View style={s.menuCountBadge}>
        <Text style={s.menuCountText}>{count}</Text>
      </View>
      {subtitle && <Text style={s.menuSubtitle}>{subtitle}</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  header: {
    padding: 24,
    paddingTop: 50,
    backgroundColor: '#1e3a8a',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonVolver: { position: 'absolute', left: 20, top: 52 },
  textoVolver: { color: '#93c5fd', fontWeight: '600', fontSize: 14 },
  titulo: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  contenido: { padding: 20 },
  
  botonSincronizar: {
    backgroundColor: '#eff6ff',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  textoSincronizar: { color: '#1e40af', fontWeight: '700', fontSize: 14 },
  
  gridMenu: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  menuCard: {
    backgroundColor: '#ffffff',
    width: '48%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  menuIcon: { fontSize: 32, marginBottom: 8 },
  menuTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a', textAlign: 'center', marginBottom: 4 },
  menuCountBadge: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, marginTop: 'auto' },
  menuCountText: { fontSize: 12, fontWeight: '700', color: '#1e40af' },
  menuSubtitle: { fontSize: 10, color: '#64748b', marginTop: 2 },
  
  botonCargaManual: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  textoCargaManual: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  
  // Animales
  cardMini: { padding: 14, marginBottom: 8 },
  nombreAnimal: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  detalleAnimal: { fontSize: 12, color: '#64748b' },
  
  // Filtros
  filtroContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filtroBtn: { backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  filtroBtnActivo: { backgroundColor: '#1e3a8a' },
  filtroText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  filtroTextActivo: { color: '#ffffff' },
  
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
  labelFino: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#0f172a',
    marginBottom: 10,
    justifyContent: 'center',
  },
  filaBotonesSeleccion: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  botonSeleccion: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#f1f5f9' },
  botonActivo: { backgroundColor: '#1e3a8a' },
  textoActivo: { color: '#ffffff', fontWeight: '700' },
  textoInactivo: { color: '#475569', fontWeight: '700' },
});
