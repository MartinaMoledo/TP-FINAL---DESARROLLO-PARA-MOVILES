// La API manda "—" en `complejo` cuando no se sabe en qué complejo está un espacio
// (el PRD solo nombra el Polideportivo Municipal y el Parque Berduc). Eso no es un complejo:
// no tiene que aparecer como filtro, ni en las tarjetas, ni agrupar espacios en el mapa.
import type { Espacio } from '@/tipos';

const SIN_DATO = ['', '-', '–', '—'];

/** Nombre del complejo, o null si la API no lo sabe. */
export function complejoDe(espacio: Espacio): string | null {
  const nombre = espacio.complejo.trim();
  return SIN_DATO.includes(nombre) ? null : nombre;
}
