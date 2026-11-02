// Agenda, reservas del día y datos de contacto para encargados y administradores.
import type { Espacio, Reserva, Turno, Usuario } from '@/tipos';
import { pedirLista, pedirUno } from './cliente';

export type ReservaDelDia = {
  reserva: Reserva;
  turno: Turno | null;
  espacio: Espacio | null;
  usuario: Usuario | null;
};

async function traerAgenda(fecha: string): Promise<Turno[]> {
  const { datos } = await pedirLista<Turno>('/agenda', {
    conToken: true,
    query: { fecha, porPagina: 500 },
  });
  return datos;
}

async function traerReservas(fecha: string): Promise<Reserva[]> {
  const porPagina = 100;
  const reservas: Reserva[] = [];
  let pagina = 1;
  let total = 0;

  do {
    const { datos, meta } = await pedirLista<Reserva>('/reservas', {
      conToken: true,
      query: { fecha, pagina, porPagina },
    });
    reservas.push(...datos);
    total = meta.total;
    pagina += 1;
  } while (reservas.length < total);

  return reservas;
}

async function traerEspacios(): Promise<Espacio[]> {
  const { datos } = await pedirLista<Espacio>('/espacios');
  return datos;
}

async function traerUsuario(id: string): Promise<Usuario | null> {
  try {
    return await pedirUno<Usuario>(`/usuarios/${id}`, { conToken: true });
  } catch {
    // Si el usuario ya no existe, mostramos la reserva igual.
    return null;
  }
}

export const personalServicio = {
  agenda: traerAgenda,
  reservas: traerReservas,
  espacios: traerEspacios,
  usuario: traerUsuario,

  /** Agenda completa de un día, con el nombre de cada espacio. */
  async agendaDelDia(fecha: string): Promise<{ turnos: Turno[]; espacios: Espacio[] }> {
    const [turnos, espacios] = await Promise.all([traerAgenda(fecha), traerEspacios()]);
    return { turnos, espacios };
  },

  /** Reservas del día enriquecidas con turno, espacio y datos del jugador. */
  async reservasDelDia(fecha: string): Promise<ReservaDelDia[]> {
    const [turnos, reservas, espacios] = await Promise.all([
      traerAgenda(fecha),
      traerReservas(fecha),
      traerEspacios(),
    ]);

    const turnoPorId = new Map(turnos.map((turno) => [turno.id, turno]));
    const espacioPorId = new Map(espacios.map((espacio) => [espacio.id, espacio]));
    const idsUsuarios = [...new Set(reservas.map((reserva) => reserva.usuarioId))];

    const usuarios = new Map<string, Usuario | null>();
    await Promise.all(
      idsUsuarios.map(async (id) => {
        usuarios.set(id, await traerUsuario(id));
      })
    );

    return reservas
      .map((reserva) => {
        const turno = turnoPorId.get(reserva.turnoId) ?? null;
        return {
          reserva,
          turno,
          espacio: espacioPorId.get(reserva.espacioId) ?? null,
          usuario: usuarios.get(reserva.usuarioId) ?? null,
        };
      })
      .sort((a, b) => {
        const espacioA = a.espacio?.nombre ?? '';
        const espacioB = b.espacio?.nombre ?? '';
        if (espacioA !== espacioB) return espacioA.localeCompare(espacioB);
        return (a.turno?.inicio ?? '').localeCompare(b.turno?.inicio ?? '');
      });
  },

  async marcarAusente(reservaId: string): Promise<Reserva> {
    return pedirUno<Reserva>(`/reservas/${reservaId}/ausente`, {
      metodo: 'POST',
      conToken: true,
    });
  },
};
