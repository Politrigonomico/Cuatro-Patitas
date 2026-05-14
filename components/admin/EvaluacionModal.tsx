import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '../../components/ui';

interface Props {
  visible: boolean;
  nuevoEstado: string;
  onClose: () => void;
  onSave: (nota: string) => void;
}

export default function EvaluacionModal({ visible, nuevoEstado, onClose, onSave }: Props) {
  const [notaDevolucion, setNotaDevolucion] = useState('');

  // Reset nota when modal opens
  useEffect(() => {
    if (visible) setNotaDevolucion('');
  }, [visible]);

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.modalOverlay}
      >
        <View style={s.modalSheet}>
          <Text style={s.modalTitulo}>Dejar una Devolución</Text>
          <Text style={{marginBottom: 15, color: '#475569'}}>
            Cambio de estado a: <Text style={{fontWeight: '700', color: '#0f172a'}}>{nuevoEstado}</Text>
          </Text>
          
          <TextInput placeholderTextColor="#64748b" 
            style={[s.input, {height: 100, textAlignVertical: 'top'}]} 
            placeholder="Escribe la nota..." 
            multiline={true} 
            value={notaDevolucion} 
            onChangeText={setNotaDevolucion} 
          />
          
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Button label="Cancelar" onPress={onClose} variant="secondary" style={{ flex: 1 }} />
            <Button label="Guardar" onPress={() => onSave(notaDevolucion)} variant="primary" style={{ flex: 1 }} />
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
