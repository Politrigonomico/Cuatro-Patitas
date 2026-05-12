// ============================================================
// hooks/useAnimals.ts
// Estado y operaciones para la colección Animales.
// Uso: const { animales, loading, addAnimal, refetch } = useAnimals('En adopción');
// ============================================================
import { useCallback, useEffect, useState } from 'react';
import {
  addAnimal as addAnimalService,
  getAnimalesAdoptados,
  getAnimalesEnAdopcion,
} from '../services/animals.service';
import type { Animal, NuevoAnimal } from '../types';

type Filtro = 'En adopción' | 'Adoptado';

export function useAnimals(filtro: Filtro = 'En adopción') {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data =
        filtro === 'Adoptado'
          ? await getAnimalesAdoptados()
          : await getAnimalesEnAdopcion();
      setAnimales(data);
    } catch (e) {
      setError('No se pudieron cargar los animales.');
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => { fetch(); }, [fetch]);

  const addAnimal = async (data: NuevoAnimal) => {
    await addAnimalService(data);
    await fetch();
  };

  return { animales, loading, error, refetch: fetch, addAnimal };
}
