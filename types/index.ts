// ============================================================
// types/index.ts
// Todas las interfaces de la app en un solo lugar.
// Importar desde aquí: import type { Animal, Solicitud } from '@/types';
// ============================================================

export interface Animal {
  id: string;
  nombre: string;
  edad: string;
  tamaño: string;
  estado: 'En adopción' | 'Adoptado' | 'En tránsito';
  descripcion?: string;
  fotos?: string[];
  foto?: string; // Mantenemos foto temporalmente por compatibilidad hacia atrás
}

export interface DatosAdoptante {
  nombreCompleto: string;
  dni: string;
  telefono: string;
  tipoVivienda: string;
  tienePatio: string;
  esAlquilado: string;
  quienesViven: string;
  todosDeAcuerdo: string;
  tieneOtrasMascotas: string;
  horasSolo: string;
  acuerdoSeguimiento: string;
}

export interface Solicitud {
  id: string;
  animalId: string;
  animalNombre: string;
  estadoSolicitud: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Requiere Info';
  notaDevolucion: string;
  userEmail?: string;
  datosAdoptante: DatosAdoptante;
}

export interface Seguimiento {
  id: string;
  animalId?: string;
  animalNombre: string;
  adoptanteNombre: string;
  adoptanteDni: string;
  adoptanteTelefono: string;
  fechaAdopcion: string;
  notasSeguimiento: string;
}

export interface Castracion {
  id: string;
  responsableNombre: string;
  responsableDni: string;
  responsableTelefono: string;
  animalNombre: string;
  animalEspecie: 'Perro' | 'Gato' | '';
  animalSexo: 'Macho' | 'Hembra' | '';
  estadoTurno: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Lista de Espera';
  notaDevolucion: string;
  campanaId?: string;
}

export interface Campana {
  id: string;
  fecha: string;
  lugar: string;
  cupo: string;
  estado: 'Abierta' | 'Llena' | 'Cerrada';
}

export interface Usuario {
  uid: string;
  email: string;
  dni: string;
  nombre?: string;
}

// Tipos utilitarios para formularios (sin el campo 'id')
export type NuevoAnimal = Omit<Animal, 'id'>;
export type NuevaCastracion = Omit<Castracion, 'id' | 'estadoTurno' | 'notaDevolucion' | 'campanaId'>;
export type NuevaCampana = Omit<Campana, 'id'>;
