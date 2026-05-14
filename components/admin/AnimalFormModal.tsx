import React, { useState } from 'react';
import { View, ScrollView, Text, TextInput, TouchableOpacity, Modal, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import app, { storage } from '../../firebaseConfig';
import { Button } from '../../components/ui';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AnimalFormModal({ visible, onClose, onSuccess }: Props) {
  const [nuevoAnimal, setNuevoAnimal] = useState({ nombre: '', edad: '', tamaño: '', estado: 'En adopción', descripcion: '', fotos: [] as string[] });
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState<string[]>([]);
  const [subiendoAnimal, setSubiendoAnimal] = useState(false);

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
      const urlsSubidas: string[] = [];

      for (const uri of imagenesSeleccionadas) {
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
      onSuccess();
    } catch (e) { 
      console.error(e);
      Alert.alert("Error", "No se pudo guardar."); 
    } finally {
      setSubiendoAnimal(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.modalOverlay}
      >
        <ScrollView contentContainerStyle={s.modalSheet}>
          <Text style={s.modalTitulo}>Nuevo Animal</Text>
          
          <Text style={s.labelFino}>Nombre</Text>
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="Ej: Firulais" value={nuevoAnimal.nombre} onChangeText={(t) => setNuevoAnimal({...nuevoAnimal, nombre: t})} />
          
          <Text style={s.labelFino}>Edad</Text>
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="Ej: 2 meses, 3 años" value={nuevoAnimal.edad} onChangeText={(t) => setNuevoAnimal({...nuevoAnimal, edad: t})} />
          
          <Text style={s.labelFino}>Tamaño</Text>
          <TextInput placeholderTextColor="#64748b" style={s.input} placeholder="Pequeño, Mediano, Grande" value={nuevoAnimal.tamaño} onChangeText={(t) => setNuevoAnimal({...nuevoAnimal, tamaño: t})} />
          
          <Text style={s.labelFino}>Descripción</Text>
          <TextInput placeholderTextColor="#64748b" 
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
            <Button label="Cancelar" onPress={onClose} variant="secondary" style={{ flex: 1 }} disabled={subiendoAnimal} />
            <Button label={subiendoAnimal ? "Guardando..." : "Guardar Animal"} onPress={guardarPerrito} variant="primary" style={{ flex: 1 }} disabled={subiendoAnimal} />
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
});
