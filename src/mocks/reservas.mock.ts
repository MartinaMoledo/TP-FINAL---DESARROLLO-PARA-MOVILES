// Reservas inventadas, relativas a "hoy". Incluyen: próxima, cancelada, cumplida y ausente.
import type { Reserva } from '@/tipos';
import { aISOArgentina, hoyISO, restarHoras, sumarDias } from '@/utilidades/fechas';

function reserva(id: string, espacioId: string, fecha: string, hora: number, estado: Reserva['estado'], personas: number): Reserva {
  const inicio = aISOArgentina(fecha, `${String(hora).padStart(2, '0')}:00`);
  return {
    id,
    turnoId: `tur-${espacioId}-${fecha}-${String(hora).padStart(2, '0')}`,
    espacioId,
    usuarioId: 'usr-207',
    cantidadPersonas: personas,
    codigoQr: `VGY-${id.replace('res-', '')}-${fecha.slice(5).replace('-', '')}-${hora}`,
    estado,
    ingresoEn: estado === 'cumplida' ? inicio : null,
    creadaEn: restarHoras(inicio, 72),
    cancelableHasta: restarHoras(inicio, 4),
  };
}

const hoy = hoyISO();

export const RESERVAS_MOCK: Reserva[] = [
  reserva('res-1180', 'esp-02', sumarDias(hoy, 1), 19, 'confirmada', 10),
  reserva('res-1170', 'esp-01', sumarDias(hoy, -3), 20, 'cumplida', 8),
  reserva('res-1160', 'esp-05', sumarDias(hoy, -6), 10, 'cancelada', 2),
  reserva('res-1150', 'esp-04', sumarDias(hoy, -9), 21, 'ausente', 10),
];
