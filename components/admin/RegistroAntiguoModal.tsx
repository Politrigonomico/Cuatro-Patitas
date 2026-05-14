import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, Modal, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import app from '../../firebaseConfig';
import { Button } from '../../components/ui';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RegistroAntiguoModal({ visible, onClose, onSuccess }: Props) {
  const [datosManual, setDatosManual] = useState({ animalNombre: '', adoptanteNombre: '', adoptanteDni: '', adoptanteTelefono: '', fechaAdopcion: '', notasSeguimiento: '' });

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
      setDatosManual({ animalNombre: '', adoptanteNombre: '', adoptanteDni: '', adoptanteTelefono: '', fechaAdopcion: '', notasSeguimiento: '' });
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
          <Text style={s.modalTitulo}>Cargar Registro Antiguo</Text>
          
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="Nombre del Perro" value={datosManual.animalNombre} onChangeText={(t) => setDatosManual({...datosManual, animalNombre: t})} />
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="Nombre del Adoptante" value={datosManual.adoptanteNombre} onChangeText={(t) => setDatosManual({...datosManual, adoptanteNombre: t})} />
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="DNI del Adoptante" keyboardType="numeric" value={datosManual.adoptanteDni} onChangeText={(t) => setDatosManual({...datosManual, adoptanteDni: t})} />
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="Teléfono" keyboardType="phone-pad" value={datosManual.adoptanteTelefono} onChangeText={(t) => setDatosManual({...datosManual, adoptanteTelefono: t})} />
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="Fecha (Ej: Marzo 2023)" value={datosManual.fechaAdopcion} onChangeText={(t) => setDatosManual({...datosManual, fechaAdopcion: t})} />
          
          <TextInput placeholderTextColor="#64748b" 
            style={[s.input, {height: 80, textAlignVertical: 'top'}]} 
            placeholder="Notas iniciales de seguimiento..." 
            multiline={true} 
            value={datosManual.notasSeguimiento} 
            onChangeText={(t) => setDatosManual({...datosManual, notasSeguimiento: t})} 
          />

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Button label="Cancelar" onPress={onClose} variant="secondary" style={{ flex: 1 }} />
            <Button label="Guardar Registro" onPress={guardarManual} variant="primary" style={{ flex: 1 }} />
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
});
