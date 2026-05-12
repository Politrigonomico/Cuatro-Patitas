// ============================================================
// services/castrations.service.ts
// Lógica de Firestore para Castraciones y Campañas.
// ============================================================
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { Campana, Castracion, NuevaCampana, NuevaCastracion } from '../types';
import { COLLECTIONS, db } from './firebase';

// ---- Castraciones ----
export async function getCastraciones(): Promise<Castracion[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.CASTRACIONES));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Castracion));
}

export async function getCastracionesByDni(dni: string): Promise<Castracion[]> {
  const q = query(
    collection(db, COLLECTIONS.CASTRACIONES),
    where('responsableDni', '==', dni)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Castracion));
}

export async function addCastracion(
  data: NuevaCastracion,
  campanaId: string
): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.CASTRACIONES), {
    ...data,
    campanaId,
    estadoTurno: 'Pendiente',
    notaDevolucion: '',
  });
}

export async function addCastracionManual(data: NuevaCastracion): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.CASTRACIONES), {
    ...data,
    estadoTurno: 'Pendiente',
    notaDevolucion: 'Ingresado manualmente desde WhatsApp',
  });
}

export async function updateCastracionEstado(
  id: string,
  estado: string,
  nota: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.CASTRACIONES, id), {
    estadoTurno: estado,
    notaDevolucion: nota,
  });
}

export async function deleteCastracion(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.CASTRACIONES, id));
}

// ---- Campañas ----
export async function getCampanas(): Promise<Campana[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.CAMPANAS));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Campana));
}

export async function getCampanaAbierta(): Promise<Campana | null> {
  const q = query(
    collection(db, COLLECTIONS.CAMPANAS),
    where('estado', '==', 'Abierta')
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Campana;
}

export async function addCampana(data: NuevaCampana): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.CAMPANAS), data);
}

export async function updateCupoYEstadoCampana(
  campanaId: string,
  nuevoCupo: number
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.CAMPANAS, campanaId), {
    cupo: nuevoCupo.toString(),
    estado: nuevoCupo > 0 ? 'Abierta' : 'Llena',
  });
}

export async function deleteCampana(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.CAMPANAS, id));
}
