// Espacios, deportes y la grilla de turnos de un día.
import type { Deporte, Espacio, Turno } from '@/tipos';
import { esperar } from '@/mocks/config';
import { DEPORTES_MOCK } from '@/mocks/deportes.mock';
import { ESPACIOS_MOCK } from '@/mocks/espacios.mock';
import { crearTurnos } from '@/mocks/turnos.mock';
import { ErrorApi, pedirLista, pedirUno, USAR_MOCKS } from './cliente';

export type FiltrosEspacios = {
  deporteId?: string;
  complejo?: string;
  iluminacion?: boolean;
  techado?: boolean;
};

export const espaciosServicio = {
  async listar(filtros: FiltrosEspacios = {}): Promise<Espacio[]> {
    if (USAR_MOCKS) {
      await esperar();
      return ESPACIOS_MOCK.filter(
        (e) =>
          e.activo &&
          (filtros.deporteId === undefined || e.deporteId === filtros.deporteId) &&
          (filtros.complejo === undefined || e.complejo === filtros.complejo) &&
          (filtros.iluminacion === undefined || e.iluminacion === filtros.iluminacion) &&
          (filtros.techado === undefined || e.techado === filtros.techado),
      );
    }
    const { datos } = await pedirLista<Espacio>('/espacios', { query: { ...filtros } });
    return datos;
  },

  async obtener(id: string): Promise<Espacio> {
    if (USAR_MOCKS) {
      await esperar();
      const espacio = ESPACIOS_MOCK.find((e) => e.id === id);
      if (!espacio) throw new ErrorApi('ESPACIO_NO_ENCONTRADO', 'No existe ese espacio.', 404);
      return espacio;
    }
    return pedirUno<Espacio>(`/espacios/${id}`);
  },

  async deportes(): Promise<Deporte[]> {
    if (USAR_MOCKS) {
      await esperar();
      return DEPORTES_MOCK;
    }
    const { datos } = await pedirLista<Deporte>('/deportes');
    return datos;
  },

  /** Los 16 turnos (08:00 a 24:00) de un día. fecha = "AAAA-MM-DD". */
  async turnos(espacioId: string, fecha: string): Promise<Turno[]> {
    if (USAR_MOCKS) {
      await esperar();
      const espacio = ESPACIOS_MOCK.find((e) => e.id === espacioId);
      if (!espacio) throw new ErrorApi('ESPACIO_NO_ENCONTRADO', 'No existe ese espacio.', 404);
      return crearTurnos(espacio, fecha);
    }
    const { datos } = await pedirLista<Turno>(`/espacios/${espacioId}/turnos`, { query: { fecha } });
    return datos;
  },
};
