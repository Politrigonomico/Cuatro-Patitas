// ============================================================
// services/firebase.ts
// Punto único de acceso a Firebase que envuelve la configuración principal
// ============================================================
// @ts-ignore: getReactNativePersistence solo está en las definiciones de react-native
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import app from '../firebaseConfig'; // Apunta al archivo original en la raíz

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Nombres de colecciones como constantes para evitar typos
export const COLLECTIONS = {
  ANIMALES: 'Animales',
  SOLICITUDES: 'Solicitudes_Adopciones',
  CASTRACIONES: 'Castraciones',
  CAMPANAS: 'Campañas',
  SEGUIMIENTO: 'Seguimiento',
  USUARIOS: 'Usuarios',
} as const;

export default app;
