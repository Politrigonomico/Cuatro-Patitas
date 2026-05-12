// ============================================================
// services/animals.service.ts
// Toda la lógica de Firestore para la colección Animales.
// Los hooks y pantallas llaman a estas funciones, no a Firestore directo.
// ============================================================
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { Animal, NuevoAnimal } from '../types';
import { COLLECTIONS, db } from './firebase';

export async function getAnimalesEnAdopcion(): Promise<Animal[]> {
  const q = query(
    collection(db, COLLECTIONS.ANIMALES),
    where('estado', '==', 'En adopción')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Animal));
}

export async function getAnimalesAdoptados(): Promise<Animal[]> {
  const q = query(
    collection(db, COLLECTIONS.ANIMALES),
    where('estado', '==', 'Adoptado')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Animal));
}

export async function addAnimal(data: NuevoAnimal): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.ANIMALES), data);
}

export async function marcarAdoptado(animalId: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.ANIMALES, animalId);
  await updateDoc(ref, { estado: 'Adoptado' });
}
