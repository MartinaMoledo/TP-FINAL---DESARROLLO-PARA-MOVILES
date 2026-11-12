import Storage from 'expo-sqlite/kv-store';
import type { Reserva, Usuario } from '@/tipos';
import { espaciosServicio } from './espacios';
import { favoritosServicio } from './favoritos';
import { reservasServicio } from './reservas';
import {
  avisarAhora,
  cancelarRecordatorio,
  hayPermisoNotificaciones,
} from './notificaciones';
import {
  aISOArgentina,
  hoyISO,
  restarHoras,
  sumarDias,
} from '@/utilidades/fechas';

function fechaDelTurno(reserva: Reserva): string {
  return restarHoras(reserva.cancelableHasta, -4).slice(0, 10);
}

async function revisarSuspensiones(): Promise<void> {
  const reservas = await reservasServicio.misReservas('proximas');
  for (const reserva of reservas) {
    if (reserva.estado !== 'confirmada') continue;

    const clave = `aviso-suspension:${reserva.id}`;
    // ya se avisó
    if (await Storage.getItemAsync(clave)) continue;

    const fecha = fechaDelTurno(reserva);
    const turnos = await espaciosServicio.turnos(reserva.espacioId, fecha);
    const turno = turnos.find((t) => t.id === reserva.turnoId);
    if (turno?.estado !== 'mantenimiento') continue;

    await avisarAhora(
      'Tu turno fue suspendido',
      `El turno del ${fecha} se encuentra suspendido por: ${turno.motivoBloqueo ?? 'el espacio no está disponible'}`,
    );
    await cancelarRecordatorio(reserva.id);
    await Storage.setItemAsync(clave, 'si');
  }
}

async function leerOcupados(clave: string): Promise<string[] | null> {
  const guardado = await Storage.getItemAsync(clave);
  if (!guardado) return null;
  try {
    const lista: unknown = JSON.parse(guardado);
    return Array.isArray(lista)
      ? lista.filter((x): x is string => typeof x === 'string')
      : null;
  } catch {
    return null;
  }
}

async function revisarTurnosLiberados(usuario: Usuario): Promise<void> {
  const favoritos = await favoritosServicio.listar(usuario);
  const hoy = hoyISO();

  for (const espacioId of favoritos) {
    for (const fecha of [hoy, sumarDias(hoy, 1)]) {
      const clave = `ocupados:${espacioId}:${fecha}`;
      const turnos = await espaciosServicio.turnos(espacioId, fecha);
      const ocupadosAntes = await leerOcupados(clave);

      if (ocupadosAntes) {
        const liberado = turnos.find(
          (t) =>
            t.estado === 'libre' &&
            ocupadosAntes.includes(t.id) &&
            Date.parse(aISOArgentina(t.fecha, t.inicio)) > Date.now(),
        );
        if (liberado) {
          await avisarAhora(
            '¡SE LIBERÓ UN TURNO!',
            `Tu favorito del día ${fecha} a las ${liberado.inicio} está libre!`,
          );
        }
      }

      const ocupadosAhora = turnos
        .filter((t) => t.estado === 'reservado')
        .map((t) => t.id);
      await Storage.setItemAsync(clave, JSON.stringify(ocupadosAhora));
    }
  }
}

export async function revisarAvisos(usuario: Usuario): Promise<void> {
  if (usuario.rol !== 'jugador') return;
  if (!(await hayPermisoNotificaciones())) return;

  try {
    await revisarSuspensiones();
    await revisarTurnosLiberados(usuario);
  } catch {
    // no se muestra nada
  }
}
