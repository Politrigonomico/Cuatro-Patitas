// ============================================================
// components/forms/CastrationForm.tsx
// Modal para inscribirse a una campaña de castración.
// ============================================================
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NuevaCastracion } from '../../types';
import { Button } from '../ui';

const INITIAL: NuevaCastracion = {
  responsableNombre: '', responsableDni: '', responsableTelefono: '',
  animalNombre: '', animalEspecie: '', animalSexo: '',
};

interface Props {
  visible: boolean;
  onSubmit: (data: NuevaCastracion) => Promise<void>;
  onClose: () => void;
  titulo?: string;
  user?: any;
  dni?: string;
}

export function CastrationForm({ visible, onSubmit, onClose, titulo = 'Anotarse a la campaña', user, dni }: Props) {
  const [data, setData] = useState<NuevaCastracion>(INITIAL);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (visible && user) {
      setData((prev) => ({
        ...prev,
        responsableNombre: user.displayName || prev.responsableNombre,
        responsableDni: dni || prev.responsableDni,
      }));
    }
  }, [visible, user, dni]);

  const set = (key: keyof NuevaCastracion, val: string) =>
    setData((prev) => ({ ...prev, [key]: val }));

  const handleClose = () => { setData(INITIAL); onClose(); };

  const enviar = async () => {
    const { responsableNombre, responsableDni, responsableTelefono, animalNombre, animalEspecie, animalSexo } = data;
    if (!responsableNombre || !responsableDni || !responsableTelefono || !animalNombre || !animalEspecie || !animalSexo)
      return Alert.alert('Atención', 'Por favor completá todos los campos.');
    setLoading(true);
    try {
      await onSubmit(data);
      Alert.alert('¡Anotado!', 'Tu turno quedó registrado. Te avisaremos por WhatsApp.');
      handleClose();
    } catch {
      Alert.alert('Error', 'No se pudo registrar el turno.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.overlay}
      >
        <View style={s.sheet}>
          <Text style={s.titulo}>{titulo}</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 12 }}>
            {/* Responsable */}
            <Label text="Datos del responsable" />
            <Input label="Nombre completo" value={data.responsableNombre} onChange={(v) => set('responsableNombre', v)} />
            <Input label="DNI (sin puntos)" value={data.responsableDni} onChange={(v) => set('responsableDni', v)} keyboard="numeric" />
            <Input label="WhatsApp" value={data.responsableTelefono} onChange={(v) => set('responsableTelefono', v)} keyboard="phone-pad" />

            {/* Animal */}
            <Label text="Datos de la mascota" />
            <Input label="Nombre de la mascota" value={data.animalNombre} onChange={(v) => set('animalNombre', v)} />

            <Text style={s.subLabel}>Especie</Text>
            <View style={s.toggleRow}>
              <ToggleBtn label="Perro" active={data.animalEspecie === 'Perro'} onPress={() => set('animalEspecie', 'Perro')} color="#1e3a8a" />
              <ToggleBtn label="Gato" active={data.animalEspecie === 'Gato'} onPress={() => set('animalEspecie', 'Gato')} color="#1e3a8a" />
            </View>

            <Text style={s.subLabel}>Sexo</Text>
            <View style={s.toggleRow}>
              <ToggleBtn label="Hembra" active={data.animalSexo === 'Hembra'} onPress={() => set('animalSexo', 'Hembra')} color="#be185d" />
              <ToggleBtn label="Macho" active={data.animalSexo === 'Macho'} onPress={() => set('animalSexo', 'Macho')} color="#1e3a8a" />
            </View>
          </ScrollView>

          <View style={s.footer}>
            <Button label="Cancelar" onPress={handleClose} variant="ghost" style={{ flex: 1 }} />
            <Button label="Confirmar turno" onPress={enviar} loading={loading} variant="primary" style={{ flex: 2 }} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', marginTop: 14, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{text}</Text>;
}

function Input({ label, value, onChange, keyboard }: { label: string; value: string; onChange: (v: string) => void; keyboard?: any }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput style={s.input} value={value} onChangeText={onChange} placeholderTextColor="#94a3b8" keyboardType={keyboard ?? 'default'} />
    </View>
  );
}

function ToggleBtn({ label, active, onPress, color }: { label: string; active: boolean; onPress: () => void; color: string }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.toggleBtn, active && { backgroundColor: color, borderColor: color }]}
    >
      <Text style={[s.toggleText, active && { color: '#fff' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(15,23,42,0.55)', 
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
    padding: Platform.OS === 'web' ? 20 : 0,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: Platform.OS === 'web' ? 28 : 0,
    borderBottomRightRadius: Platform.OS === 'web' ? 28 : 0,
    width: Platform.OS === 'web' ? '100%' : 'auto',
    maxWidth: Platform.OS === 'web' ? 500 : '100%',
    padding: 24,
    paddingBottom: Platform.OS === 'web' ? 24 : 36,
    maxHeight: '90%',
  },
  titulo: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  subLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10,
    padding: 13, fontSize: 15, color: '#0f172a', backgroundColor: '#f8fafc',
  },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  toggleBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    alignItems: 'center', backgroundColor: '#f8fafc',
  },
  toggleText: { fontSize: 15, fontWeight: '600', color: '#475569' },
  footer: { flexDirection: 'row', gap: 10, marginTop: 4 },
});
