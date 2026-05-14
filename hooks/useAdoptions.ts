// ============================================================
// hooks/useAdoptions.ts
// Estado y operaciones para Solicitudes_Adopciones y Seguimiento.
// ============================================================
import { useCallback, useEffect, useState } from 'react';
import {
  addSeguimiento,
  addSolicitud,
  deleteSeguimiento,
  deleteSolicitud,
  getSeguimientos,
  getSolicitudes,
  updateNotaSeguimiento,
  updateSolicitudEstado,
} from '../services/adoptions.service';
import { marcarAdoptado } from '../services/animals.service';
import type { DatosAdoptante, Seguimiento, Solicitud } from '../types';

export function useAdoptions() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [sols, segs] = await Promise.all([getSolicitudes(), getSeguimientos()]);
      setSolicitudes(sols);
      setSeguimientos(segs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const enviarSolicitud = async (
    animalId: string,
    animalNombre: string,
    datos: DatosAdoptante,
    userEmail?: string
  ) => {
    await addSolicitud(animalId, animalNombre, datos, userEmail);
  };

  // Aprueba la solicitud, mueve el animal a "Adoptado" y crea ficha de seguimiento
  const aprobarSolicitud = async (solicitud: Solicitud, nota: string) => {
    await marcarAdoptado(solicitud.animalId);
    await addSeguimiento({
      animalId: solicitud.animalId,
      animalNombre: solicitud.animalNombre,
      adoptanteNombre: solicitud.datosAdoptante.nombreCompleto || 'No registrado',
      adoptanteDni: solicitud.datosAdoptante.dni || 'No registrado',
      adoptanteTelefono: solicitud.datosAdoptante.telefono || 'No registrado',
      fechaAdopcion: new Date().toLocaleDateString('es-AR'),
      notasSeguimiento: nota || 'Adopción aprobada. Pendiente seguimiento.',
    });
    await updateSolicitudEstado(solicitud.id, 'Aprobado', nota);
    await fetch();
  };

  const rechazarSolicitud = async (id: string, estado: string, nota: string) => {
    await updateSolicitudEstado(id, estado, nota);
    await fetch();
  };

  const eliminarSolicitud = async (id: string) => {
    await deleteSolicitud(id);
    await fetch();
  };

  const actualizarNotaSeguimiento = async (id: string, nota: string) => {
    await updateNotaSeguimiento(id, nota);
    await fetch();
  };

  const eliminarSeguimiento = async (id: string) => {
    await deleteSeguimiento(id);
    await fetch();
  };

  const agregarSeguimientoManual = async (data: Omit<Seguimiento, 'id'>) => {
    await addSeguimiento(data);
    await fetch();
  };

  return {
    solicitudes,
    seguimientos,
    loading,
    refetch: fetch,
    enviarSolicitud,
    aprobarSolicitud,
    rechazarSolicitud,
    eliminarSolicitud,
    actualizarNotaSeguimiento,
    eliminarSeguimiento,
    agregarSeguimientoManual,
  };
}
