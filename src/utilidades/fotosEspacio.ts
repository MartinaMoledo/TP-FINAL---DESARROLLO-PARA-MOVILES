
// De dónde sale cada foto de un espacio, en este orden:
// 1) copias descargadas en el teléfono ("Guardar para ver sin datos"),
// 2) la foto del espacio incluida en el proyecto (assets/canchas),
// 3) las URLs de la API, como respaldo.

import type { ImageSource } from 'expo-image';
import type { Espacio } from '@/tipos';

// Imágenes definitivas de los 11 espacios deportivos.
const FOTOS_ESPACIOS: Record<string, number> = {
  'esp-01': require('../../assets/canchas/futbol5_cancha1.png'),
  'esp-02': require('../../assets/canchas/futbol5_cancha2.png'),
  'esp-03': require('../../assets/canchas/futbol11_cancha1.png'),
  'esp-04': require('../../assets/canchas/basquet_cancha1.png'),
  'esp-05': require('../../assets/canchas/basquet_cancha2.png'),
  'esp-06': require('../../assets/canchas/basquet_cancha3.png'),
  'esp-07': require('../../assets/canchas/voley_cancha1.png'),
  'esp-08': require('../../assets/canchas/voley_cancha2.png'),
  'esp-09': require('../../assets/canchas/tenis_cancha1.png'),
  'esp-10': require('../../assets/canchas/tenis_cancha2.png'),
  'esp-11': require('../../assets/canchas/gimnasio_1.png'),
};

export function fuentesDeFotos(
  espacio: Espacio,
  locales: string[] = []
): (ImageSource | number)[] {
  // Fotos descargadas para consultar sin conexión.
  if (locales.length > 0) {
    return locales.map((uri) => ({ uri }));
  }

  // Imágenes definitivas incluidas en el proyecto.
  const foto = FOTOS_ESPACIOS[espacio.id];
  if (foto) {
    return [foto];
  }

  // Respaldo para espacios sin imagen local.
  return espacio.imagenes.map((uri) => ({ uri }));
}

/** El archivo de la foto del proyecto (el resultado de require), para poder copiarlo al teléfono. */
export function moduloFotoDeEspacio(id: string): number | null {
  return FOTOS_ESPACIOS[id] ?? null;
}
