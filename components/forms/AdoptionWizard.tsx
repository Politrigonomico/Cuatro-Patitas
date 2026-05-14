// ============================================================
// components/forms/AdoptionWizard.tsx
// Wizard de 4 pasos para solicitar una adopción.
// Uso: <AdoptionWizard animal={animal} onSubmit={fn} onClose={fn} />
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
  View,
} from 'react-native';
import type { Animal, DatosAdoptante } from '../../types';
import { Button } from '../ui';

const INITIAL_DATOS: DatosAdoptante = {
  nombreCompleto: '', dni: '', telefono: '', tipoVivienda: '', tienePatio: '',
  esAlquilado: '', quienesViven: '', todosDeAcuerdo: '', tieneOtrasMascotas: '',
  horasSolo: '', acuerdoSeguimiento: '',
};

interface Props {
  visible: boolean;
  animal: Animal | null;
  onSubmit: (animalId: string, animalNombre: string, datos: DatosAdoptante) => Promise<void>;
  onClose: () => void;
  user?: any;
  dni?: string;
}

export function AdoptionWizard({ visible, animal, onSubmit, onClose, user, dni }: Props) {
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState<DatosAdoptante>(INITIAL_DATOS);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (visible && user) {
      setDatos((prev) => ({
        ...prev,
        nombreCompleto: user.displayName || prev.nombreCompleto,
        dni: dni || prev.dni,
      }));
    }
  }, [visible, user, dni]);

  const set = (key: keyof DatosAdoptante, val: string) =>
    setDatos((prev) => ({ ...prev, [key]: val }));

  const handleClose = () => { setPaso(1); setDatos(INITIAL_DATOS); onClose(); };

  const avanzar = () => {
    if (paso === 1 && (!datos.nombreCompleto || !datos.dni || !datos.telefono))
      return Alert.alert('Atención', 'Completá nombre, DNI y teléfono.');
    if (paso === 2 && (!datos.tipoVivienda || !datos.tienePatio || !datos.esAlquilado))
      return Alert.alert('Atención', 'Completá los datos de tu hogar.');
    if (paso === 3 && (!datos.quienesViven || !datos.todosDeAcuerdo || !datos.tieneOtrasMascotas))
      return Alert.alert('Atención', 'Completá los datos de convivencia.');
    setPaso(paso + 1);
  };

  const enviar = async () => {
    if (!datos.horasSolo || !datos.acuerdoSeguimiento)
      return Alert.alert('Atención', 'Completá los compromisos finales.');
    if (!animal) return;
    setLoading(true);
    try {
      await onSubmit(animal.id, animal.nombre, datos);
      Alert.alert('¡Éxito!', 'Tu solicitud fue enviada. Te contactaremos pronto.');
      handleClose();
    } catch {
      Alert.alert('Error', 'No se pudo enviar la solicitud.');
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
          {/* Header */}
          <View style={s.header}>
            <Text style={s.titulo}>Adoptar a {animal?.nombre}</Text>
            <View style={s.dots}>
              {[1, 2, 3, 4].map((n) => (
                <View key={n} style={[s.dot, n === paso && s.dotActive]} />
              ))}
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {paso === 1 && (
              <Step title="Tus datos personales">
                <Field label="Nombre completo" value={datos.nombreCompleto} onChange={(v) => set('nombreCompleto', v)} placeholder="Juan Pérez" />
                <Field label="DNI (sin puntos)" value={datos.dni} onChange={(v) => set('dni', v)} placeholder="30123456" keyboard="numeric" />
                <Field label="WhatsApp" value={datos.telefono} onChange={(v) => set('telefono', v)} placeholder="11 5555-1234" keyboard="phone-pad" />
              </Step>
            )}
            {paso === 2 && (
              <Step title="Tu hogar">
                <Field label="Tipo de vivienda" value={datos.tipoVivienda} onChange={(v) => set('tipoVivienda', v)} placeholder="Casa / Departamento" />
                <Field label="¿Tiene patio?" value={datos.tienePatio} onChange={(v) => set('tienePatio', v)} placeholder="Sí / No" />
                <Field label="¿Es alquilado?" value={datos.esAlquilado} onChange={(v) => set('esAlquilado', v)} placeholder="Sí / No" />
              </Step>
            )}
            {paso === 3 && (
              <Step title="Convivencia">
                <Field label="¿Quiénes viven en la casa?" value={datos.quienesViven} onChange={(v) => set('quienesViven', v)} placeholder="Describe a los convivientes" />
                <Field label="¿Todos están de acuerdo?" value={datos.todosDeAcuerdo} onChange={(v) => set('todosDeAcuerdo', v)} placeholder="Sí / No" />
                <Field label="¿Tenés otras mascotas?" value={datos.tieneOtrasMascotas} onChange={(v) => set('tieneOtrasMascotas', v)} placeholder="Sí / No / Cuáles" />
              </Step>
            )}
            {paso === 4 && (
              <Step title="Compromisos finales">
                <Field label="¿Cuántas horas pasa solo?" value={datos.horasSolo} onChange={(v) => set('horasSolo', v)} placeholder="Ej: 4 horas" />
                <Field label="¿Aceptás seguimiento post-adopción?" value={datos.acuerdoSeguimiento} onChange={(v) => set('acuerdoSeguimiento', v)} placeholder="Sí, acepto" />
              </Step>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={s.footer}>
            {paso > 1 ? (
              <Button label="Atrás" onPress={() => setPaso(paso - 1)} variant="ghost" style={{ flex: 1 }} />
            ) : (
              <Button label="Cancelar" onPress={handleClose} variant="ghost" style={{ flex: 1 }} />
            )}
            {paso < 4 ? (
              <Button label="Siguiente →" onPress={avanzar} variant="primary" style={{ flex: 2 }} />
            ) : (
              <Button label="Enviar solicitud" onPress={enviar} variant="success" loading={loading} style={{ flex: 2 }} />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ paddingVertical: 4 }}>
      <Text style={stepS.title}>{title}</Text>
      {children}
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboard,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboard?: 'default' | 'numeric' | 'phone-pad';
}) {
  return (
    <View style={fieldS.container}>
      <Text style={fieldS.label}>{label}</Text>
      <TextInput
        style={fieldS.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboard ?? 'default'}
      />
    </View>
  );
}

const stepS = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
});

const fieldS = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 13,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
});

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
  header: { marginBottom: 20 },
  titulo: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  dots: { flexDirection: 'row', gap: 6, marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#e2e8f0' },
  dotActive: { backgroundColor: '#1e3a8a', width: 24 },
  footer: { flexDirection: 'row', gap: 10, marginTop: 20 },
});
