// Distancia en línea recta entre dos puntos (fórmula de haversine), en kilómetros.
import type { Coordenadas } from '@/tipos';

export function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const radio = 6371;
  const aRad = (grados: number) => (grados * Math.PI) / 180;
  const dLat = aRad(b.latitud - a.latitud);
  const dLon = aRad(b.longitud - a.longitud);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRad(a.latitud)) * Math.cos(aRad(b.latitud)) * Math.sin(dLon / 2) ** 2;
  return 2 * radio * Math.asin(Math.sqrt(h));
}
