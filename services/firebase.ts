// ============================================================
// services/firebase.ts
// Punto único de acceso a Firebase que envuelve la configuración principal
// ============================================================
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import app from '../firebaseConfig'; // Apunta al archivo original en la raíz

export const db = getFirestore(app);
export const auth = getAuth(app);

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
