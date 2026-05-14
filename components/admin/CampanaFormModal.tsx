import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import app from '../../firebaseConfig';
import { Button } from '../../components/ui';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CampanaFormModal({ visible, onClose, onSuccess }: Props) {
  const [nuevaCampana, setNuevaCampana] = useState({ fecha: '', lugar: '', cupo: '', estado: 'Abierta' });
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatearFechaAutomatica = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).replace(/^\w/, (c) => c.toUpperCase());
  };

  const guardarCampana = async () => {
    if (!nuevaCampana.fecha || !nuevaCampana.lugar || !nuevaCampana.cupo) {
      return Alert.alert("Atención", "Completa todos los datos de la campaña.");
    }
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, 'Campañas'), nuevaCampana);
      Alert.alert("¡Éxito!", "Campaña creada y abierta al público.");
      setNuevaCampana({ fecha: '', lugar: '', cupo: '', estado: 'Abierta' });
      onSuccess();
    } catch { 
      Alert.alert("Error", "No se pudo crear la campaña."); 
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.modalOverlay}
      >
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
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="¿Dónde será?" value={nuevaCampana.lugar} onChangeText={(t) => setNuevaCampana({...nuevaCampana, lugar: t})} />
          
          <Text style={s.labelFino}>Cupo Máximo</Text>
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="Cantidad de animales" keyboardType="numeric" value={nuevaCampana.cupo} onChangeText={(t) => setNuevaCampana({...nuevaCampana, cupo: t})} />
          
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Button label="Cancelar" onPress={onClose} variant="secondary" style={{ flex: 1 }} />
            <Button label="Publicar" onPress={guardarCampana} variant="primary" style={{ flex: 1 }} />
          </View>
        </View>
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
});
