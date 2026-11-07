// De dónde sale cada foto de un espacio, en este orden:
// 1) copias descargadas en el teléfono, 2) las URLs de la API, 3) fotos de prueba del repo.
import type { ImageSource } from 'expo-image';

import type { Espacio } from '@/tipos';

// Fotos locales de prueba, hasta que la API mande `imagenes` con URLs reales.
const FOTOS_DE_PRUEBA: Record<string, ImageSource> = {
  'esp-01': require('../../assets/canchas/cancha_01.jpg'),
  'esp-02': require('../../assets/canchas/cancha_02.jpg'),
};

export function fuentesDeFotos(espacio: Espacio, locales: string[] = []): ImageSource[] {
  if (locales.length > 0) return locales.map((uri) => ({ uri }));
  if (espacio.imagenes.length > 0) return espacio.imagenes.map((uri) => ({ uri }));
  const prueba = FOTOS_DE_PRUEBA[espacio.id];
  return prueba ? [prueba] : [];
}
