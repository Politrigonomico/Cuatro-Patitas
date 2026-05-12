// ============================================================
// hooks/useAuth.ts
// Maneja toda la lógica de autenticación Firebase.
// Uso: const { user, loading, isAdmin, signIn, signUp, signOut } = useAuth();
// ============================================================
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { COLLECTIONS, auth, db } from '../services/firebase';

GoogleSignin.configure({
  webClientId: '897321943435-jc7pb4m4t420ca59imlng0ub3s4lsof1.apps.googleusercontent.com',
});

const ADMIN_EMAIL = 'admin@cuatropatitas.com';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dni, setDniState] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === ADMIN_EMAIL);
      if (currentUser) {
        await loadUserDni(currentUser.uid);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loadUserDni = async (uid: string) => {
    const snap = await getDoc(doc(db, COLLECTIONS.USUARIOS, uid));
    if (snap.exists()) {
      setDniState(snap.data().dni ?? '');
    }
  };

  const saveDni = async (newDni: string) => {
    if (!user) return;
    await setDoc(doc(db, COLLECTIONS.USUARIOS, user.uid), {
      dni: newDni,
      email: user.email,
      nombre: user.displayName ?? 'Usuario',
    });
    setDniState(newDni);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      
      if (response.type === 'success') {
        const idToken = response.data.idToken;
        if (!idToken) throw new Error('No se pudo obtener el token de Google');
        
        const googleCredential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, googleCredential);
      }
    } catch (error: any) {
      console.error(error);
      throw new Error("Asegúrate de haber configurado el Web Client ID correctamente.");
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setDniState('');
  };

  return { user, loading, isAdmin, dni, saveDni, signIn, signUp, signInWithGoogle, signOut };
}
