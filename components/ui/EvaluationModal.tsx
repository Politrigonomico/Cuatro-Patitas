// ============================================================
// components/ui/EvaluationModal.tsx
// Modal reutilizable para cambiar estado de solicitudes/turnos
// y editar notas de seguimiento.
// ============================================================
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from './index';

interface Props {
  visible: boolean;
  nuevoEstado: string;
  onConfirm: (nota: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export function EvaluationModal({
  visible,
  nuevoEstado,
  onConfirm,
  onCancel,
  placeholder = 'Escribe una nota opcional...',
}: Props) {
  const [nota, setNota] = useState('');

  const handleConfirm = () => {
    onConfirm(nota);
    setNota('');
  };

  const handleCancel = () => {
    setNota('');
    onCancel();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.overlay}
      >
        <View style={s.sheet}>
          <Text style={s.title}>Dejar una devolución</Text>
          <Text style={s.subtitle}>
            Cambio de estado a:{' '}
            <Text style={{ fontWeight: '700', color: '#1e3a8a' }}>{nuevoEstado}</Text>
          </Text>
          <TextInput
            style={s.textarea}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            value={nota}
            onChangeText={setNota}
            textAlignVertical="top"
          />
          <View style={s.row}>
            <Button label="Cancelar" onPress={handleCancel} variant="ghost" style={{ flex: 1 }} />
            <Button label="Guardar" onPress={handleConfirm} variant="primary" style={{ flex: 1 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b' },
  textarea: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#0f172a',
    height: 100,
    backgroundColor: '#f8fafc',
  },
  row: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
