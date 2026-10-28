// Arma la grilla de un día cruzando reservas, fijas y bloqueos (igual que hace la API real).
// Casos feos incluidos:
//   - pasado mañana: día entero bloqueado por lluvia en las canchas descubiertas
//   - mañana en esp-04: grilla completa SIN ningún turno libre
//   - esp-02 los martes a las 21: reserva fija
import type { Espacio, EstadoTurno, Turno } from '@/tipos';
import { diaDeLaSemana, hoyISO, sumarDias } from '@/utilidades/fechas';
import { FIJAS_MOCK } from './fijas.mock';

/** Turnos que se reservaron mientras la app está abierta (los marca la reserva mock). */
export const turnosReservados = new Map<string, string>(); // turnoId -> reservaId

export function idDeTurno(espacioId: string, fecha: string, hora: number): string {
  return `tur-${espacioId}-${fecha}-${String(hora).padStart(2, '0')}`;
}

export function crearTurnos(espacio: Espacio, fecha: string): Turno[] {
  const hoy = hoyISO();
  const diaLluvia = sumarDias(hoy, 2);
  const diaLleno = sumarDias(hoy, 1);
  const dia = diaDeLaSemana(fecha);
  const turnos: Turno[] = [];

  for (let hora = 8; hora < 24; hora++) {
    const inicio = `${String(hora).padStart(2, '0')}:00`;
    const fin = hora === 23 ? '24:00' : `${String(hora + 1).padStart(2, '0')}:00`;
    const id = idDeTurno(espacio.id, fecha, hora);

    let estado: EstadoTurno = 'libre';
    let reservaId: string | null = null;
    let motivoBloqueo: string | null = null;

    const fija = FIJAS_MOCK.find(
      (f) => f.activa && f.espacioId === espacio.id && f.dia === dia && inicio >= f.inicio && inicio < f.fin,
    );

    if (fecha === diaLluvia && !espacio.techado) {
      estado = 'mantenimiento';
      motivoBloqueo = 'Cancha anegada';
    } else if (espacio.id === 'esp-04' && fecha === diaLleno) {
      estado = hora % 3 === 0 ? 'mantenimiento' : hora % 3 === 1 ? 'fijo' : 'reservado';
      motivoBloqueo = estado === 'mantenimiento' ? 'Pintura del piso' : null;
    } else if (fija) {
      estado = 'fijo';
    } else if (turnosReservados.has(id)) {
      estado = 'reservado';
      reservaId = turnosReservados.get(id) ?? null;
    } else if (espacio.id === 'esp-02' && hora === 18) {
      estado = 'reservado';
      reservaId = 'res-1000';
    }

    turnos.push({ id, espacioId: espacio.id, fecha, inicio, fin, estado, reservaId, motivoBloqueo, precio: espacio.precioPorHora });
  }
  return turnos;
}
