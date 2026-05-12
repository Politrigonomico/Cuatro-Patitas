import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import app from '../../firebaseConfig';
import { globalStyles as styles } from '../../constants/globalStyles';
import { useFocusEffect } from 'expo-router';

export default function Adoptados() {
  const [adoptados, setAdoptados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const cargarAdoptados = async () => {
        try {
          const db = getFirestore(app);
          // Buscamos solo animales con estado "Adoptado"
          const q = query(collection(db, 'Animales'), where('estado', '==', 'Adoptado'));
          const snap = await getDocs(q);
          const lista: any[] = [];
          snap.forEach(doc => lista.push({ id: doc.id, ...doc.data() }));
          setAdoptados(lista);
        } catch (error) { console.error(error); } 
        finally { setCargando(false); }
      };
      cargarAdoptados();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <ScrollView>
        <View style={styles.contenedorCentral}>
          <View style={[styles.header, {backgroundColor: '#059669'}]}>
            <Text style={styles.titulo}>Finales Felices</Text>
            <Text style={{color: 'white'}}>Historias de amigos que ya están en casa</Text>
          </View>

          <View style={styles.contenido}>
            {cargando ? <ActivityIndicator size="large" color="#059669" /> : (
              adoptados.length === 0 ? <Text style={styles.textoVacio}>Aún no hay perros adoptados. ¡Ayúdanos a encontrarles hogar!</Text> :
              adoptados.map((pet) => (
                <View key={pet.id} style={styles.tarjeta}>
                  <Text style={{fontSize: 22, fontWeight: 'bold', color: '#065f46'}}>{pet.nombre}</Text>
                  <Text style={{color: '#374151', marginTop: 5}}>¡Ya vive con su nueva familia!</Text>
                  <View style={{backgroundColor: '#d1fae5', padding: 10, borderRadius: 8, marginTop: 10}}>
                    <Text style={{color: '#065f46', fontStyle: 'italic'}}>&quot;Gracias por darnos la oportunidad de cambiar una vida.&quot;</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}