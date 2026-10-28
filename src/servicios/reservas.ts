// Reservar, ver mis reservas y cancelar.
import type { Reserva } from '@/tipos';
import { esperar } from '@/mocks/config';
import { RESERVAS_MOCK } from '@/mocks/reservas.mock';
import { turnosReservados } from '@/mocks/turnos.mock';
import { ESPACIOS_MOCK } from '@/mocks/espacios.mock';
import { aISOArgentina, restarHoras } from '@/utilidades/fechas';
import { ErrorApi, pedirLista, pedirUno, USAR_MOCKS } from './cliente';

export type Momento = 'proximas' | 'pasadas';

const MAXIMO_ACTIVAS = 3;

export const reservasServicio = {
  async misReservas(cuando: Momento = 'proximas'): Promise<Reserva[]> {
    if (USAR_MOCKS) {
      await esperar();
      return RESERVAS_MOCK.filter((r) => (cuando === 'proximas' ? r.estado === 'confirmada' : r.estado !== 'confirmada'));
    }
    const { datos } = await pedirLista<Reserva>('/yo/reservas', { conToken: true, query: { cuando } });
    return datos;
  },

  async reservar(turnoId: string, cantidadPersonas: number): Promise<Reserva> {
    if (USAR_MOCKS) {
      await esperar();
      const activas = RESERVAS_MOCK.filter((r) => r.estado === 'confirmada').length;
      if (activas >= MAXIMO_ACTIVAS) {
        throw new ErrorApi('LIMITE_DE_RESERVAS', 'Ya tenés 3 reservas activas.', 409);
      }
      if (turnosReservados.has(turnoId)) {
        throw new ErrorApi('TURNO_OCUPADO', 'Ese turno ya fue reservado.', 409);
      }
      // turnoId mock: tur-<espacioId>-<AAAA-MM-DD>-<hh>
      const [, espacioId, anio, mes, dia, hh] = turnoId.split('-');
      const fecha = `${anio}-${mes}-${dia}`;
      const inicio = aISOArgentina(fecha, `${hh}:00`);
      const id = `res-${Date.now()}`;
      const nueva: Reserva = {
        id,
        turnoId,
        espacioId: ESPACIOS_MOCK.find((e) => e.id === espacioId)?.id ?? espacioId,
        usuarioId: 'usr-207',
        cantidadPersonas,
        codigoQr: `VGY-${id.slice(4)}`,
        estado: 'confirmada',
        ingresoEn: null,
        creadaEn: new Date().toISOString(),
        cancelableHasta: restarHoras(inicio, 4),
      };
      RESERVAS_MOCK.unshift(nueva);
      turnosReservados.set(turnoId, id);
      return nueva;
    }
    return pedirUno<Reserva>('/reservas', { metodo: 'POST', conToken: true, cuerpo: { turnoId, cantidadPersonas } });
  },

  async cancelar(reservaId: string): Promise<Reserva> {
    if (USAR_MOCKS) {
      await esperar();
      const reserva = RESERVAS_MOCK.find((r) => r.id === reservaId);
      if (!reserva) throw new ErrorApi('RESERVA_NO_ENCONTRADA', 'No existe esa reserva.', 404);
      if (Date.now() > Date.parse(reserva.cancelableHasta)) {
        throw new ErrorApi('CANCELACION_FUERA_DE_PLAZO', 'Faltan menos de 4 horas: tenés que avisarle al encargado.', 409);
      }
      reserva.estado = 'cancelada';
      turnosReservados.delete(reserva.turnoId);
      return reserva;
    }
    return pedirUno<Reserva>(`/reservas/${reservaId}/cancelacion`, { metodo: 'POST', conToken: true });
  },
};
