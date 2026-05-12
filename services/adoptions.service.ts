// ============================================================
// services/adoptions.service.ts
// Lógica de Firestore para Solicitudes_Adopciones y Seguimiento.
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
import type { DatosAdoptante, Seguimiento, Solicitud } from '../types';
import { COLLECTIONS, db } from './firebase';

export async function getSolicitudes(): Promise<Solicitud[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.SOLICITUDES));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Solicitud));
}

export async function getSolicitudesByDni(dni: string): Promise<Solicitud[]> {
  const q = query(
    collection(db, COLLECTIONS.SOLICITUDES),
    where('datosAdoptante.dni', '==', dni)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Solicitud));
}

export async function addSolicitud(
  animalId: string,
  animalNombre: string,
  datos: DatosAdoptante
): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.SOLICITUDES), {
    animalId,
    animalNombre,
    datosAdoptante: datos,
    estadoSolicitud: 'Pendiente',
    notaDevolucion: '',
  });
}

export async function updateSolicitudEstado(
  id: string,
  estado: string,
  nota: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.SOLICITUDES, id), {
    estadoSolicitud: estado,
    notaDevolucion: nota,
  });
}

export async function deleteSolicitud(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.SOLICITUDES, id));
}

// ---- Seguimiento ----
export async function getSeguimientos(): Promise<Seguimiento[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.SEGUIMIENTO));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Seguimiento));
}

export async function addSeguimiento(data: Omit<Seguimiento, 'id'>): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.SEGUIMIENTO), data);
}

export async function updateNotaSeguimiento(id: string, nota: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.SEGUIMIENTO, id), { notasSeguimiento: nota });
}

export async function deleteSeguimiento(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.SEGUIMIENTO, id));
}
