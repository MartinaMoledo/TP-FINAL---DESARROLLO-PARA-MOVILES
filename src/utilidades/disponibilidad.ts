// ¿Le quedan turnos libres a un espacio en un día? Se calcula sobre los turnos que ya
// devuelve el servicio (reservas, fijas y bloqueos ya cruzados): acá no se rehace la grilla.
import type { Turno } from '@/tipos';
import { aISOArgentina } from './fechas';

/** Un turno que ya empezó no se puede reservar, aunque figure libre. */
export function turnoYaPaso(turno: Turno, ahora: number): boolean {
  return Date.parse(aISOArgentina(turno.fecha, turno.inicio)) <= ahora;
}

export function hayTurnoLibre(turnos: Turno[], ahora: number): boolean {
  return turnos.some((t) => t.estado === 'libre' && !turnoYaPaso(t, ahora));
}

export type EstadoDelDiaEspacio = 'disponible' | 'completa' | 'mantenimiento';

/**
 * "disponible" si queda un turno libre que no empezó. Si no queda ninguno:
 * "mantenimiento" si lo que queda está bloqueado (lluvia, arreglos) y nadie lo reservó,
 * y "completa" en cualquier otro caso (reservado, fijo o ya no quedan turnos hoy).
 */
export function estadoDelDia(turnos: Turno[], ahora: number): EstadoDelDiaEspacio {
  if (hayTurnoLibre(turnos, ahora)) return 'disponible';
  const quedan = turnos.filter((t) => !turnoYaPaso(t, ahora));
  const soloMantenimiento =
    quedan.length > 0 && quedan.every((t) => t.estado === 'mantenimiento');
  return soloMantenimiento ? 'mantenimiento' : 'completa';
}
