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
