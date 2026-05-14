import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Modal, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import app from '../../firebaseConfig';
import { Button } from '../../components/ui';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WhatsAppFormModal({ visible, onClose, onSuccess }: Props) {
  const [datosWhatsApp, setDatosWhatsApp] = useState({ responsableNombre: '', responsableDni: '', responsableTelefono: '', animalNombre: '', animalEspecie: '', animalSexo: '' });

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
      setDatosWhatsApp({ responsableNombre: '', responsableDni: '', responsableTelefono: '', animalNombre: '', animalEspecie: '', animalSexo: '' });
      onSuccess();
    } catch { 
      Alert.alert("Error", "No se pudo guardar."); 
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.modalOverlay}
      >
        <ScrollView contentContainerStyle={s.modalSheet}>
          <Text style={s.modalTitulo}>Agendar de WhatsApp</Text>
          
          <Text style={s.labelFino}>Datos del Responsable</Text>
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="Nombre completo" value={datosWhatsApp.responsableNombre} onChangeText={(t) => setDatosWhatsApp({...datosWhatsApp, responsableNombre: t})} />
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="DNI (Sin puntos)" keyboardType="numeric" value={datosWhatsApp.responsableDni} onChangeText={(t) => setDatosWhatsApp({...datosWhatsApp, responsableDni: t})} />
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="Número de WhatsApp" keyboardType="phone-pad" value={datosWhatsApp.responsableTelefono} onChangeText={(t) => setDatosWhatsApp({...datosWhatsApp, responsableTelefono: t})} />
          
          <Text style={s.labelFino}>Datos del Animal</Text>
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="Nombre de la mascota" value={datosWhatsApp.animalNombre} onChangeText={(t) => setDatosWhatsApp({...datosWhatsApp, animalNombre: t})} />
          
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
            <Button label="Cancelar" onPress={onClose} variant="secondary" style={{ flex: 1 }} />
            <Button label="Anotar" onPress={guardarTurnoWhatsApp} variant="primary" style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(15,23,42,0.6)', 
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    padding: Platform.OS === 'web' ? 20 : 0,
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: Platform.OS === 'web' ? 32 : 0,
    borderBottomRightRadius: Platform.OS === 'web' ? 32 : 0,
    width: Platform.OS === 'web' ? '100%' : 'auto',
    maxWidth: Platform.OS === 'web' ? 500 : '100%',
    padding: 24,
    paddingBottom: Platform.OS === 'web' ? 24 : 40,
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
