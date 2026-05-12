// ============================================================
// hooks/useCastrations.ts
// Estado y operaciones para Castraciones y Campañas.
// ============================================================
import { useCallback, useEffect, useState } from 'react';
import {
  addCampana,
  addCastracion,
  addCastracionManual,
  deleteCampana,
  deleteCastracion,
  getCampanaAbierta,
  getCampanas,
  getCastraciones,
  updateCastracionEstado,
  updateCupoYEstadoCampana,
} from '../services/castrations.service';
import type { Campana, Castracion, NuevaCampana, NuevaCastracion } from '../types';

export function useCastrations() {
  const [castraciones, setCastraciones] = useState<Castracion[]>([]);
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [campanaActiva, setCampanaActiva] = useState<Campana | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [casts, camps, activa] = await Promise.all([
        getCastraciones(),
        getCampanas(),
        getCampanaAbierta(),
      ]);
      setCastraciones(casts);
      setCampanas(camps);
      setCampanaActiva(activa);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const crearCampana = async (data: NuevaCampana) => {
    await addCampana(data);
    await fetch();
  };

  const eliminarCampana = async (id: string) => {
    await deleteCampana(id);
    await fetch();
  };

  // Inscripción pública desde la pantalla de inicio
  const inscribirEnCampana = async (data: NuevaCastracion) => {
    if (!campanaActiva) throw new Error('No hay campaña activa.');
    await addCastracion(data, campanaActiva.id);
  };

  // Ingreso manual desde admin (WhatsApp)
  const agregarTurnoManual = async (data: NuevaCastracion) => {
    await addCastracionManual(data);
    await fetch();
  };

  // Actualiza estado y ajusta cupo de la campaña si corresponde
  const actualizarEstadoTurno = async (
    turno: Castracion,
    nuevoEstado: string,
    nota: string
  ) => {
    const estadoAnterior = turno.estadoTurno;
    let diferenciaCupo = 0;

    if (estadoAnterior !== 'Aprobado' && nuevoEstado === 'Aprobado') diferenciaCupo = -1;
    else if (estadoAnterior === 'Aprobado' && nuevoEstado !== 'Aprobado') diferenciaCupo = 1;

    if (diferenciaCupo !== 0 && turno.campanaId) {
      const camp = campanas.find((c) => c.id === turno.campanaId);
      if (camp) {
        const nuevoCupo = parseInt(camp.cupo) + diferenciaCupo;
        await updateCupoYEstadoCampana(turno.campanaId, nuevoCupo);
      }
    }

    await updateCastracionEstado(turno.id, nuevoEstado, nota);
    await fetch();
  };

  const eliminarCastracion = async (id: string) => {
    await deleteCastracion(id);
    await fetch();
  };

  return {
    castraciones,
    campanas,
    campanaActiva,
    loading,
    refetch: fetch,
    crearCampana,
    eliminarCampana,
    inscribirEnCampana,
    agregarTurnoManual,
    actualizarEstadoTurno,
    eliminarCastracion,
  };
}
