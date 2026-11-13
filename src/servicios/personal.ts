// Agenda del día, bloqueos, reservas fijas y precios del personal.
import type { Espacio, Reserva, ReservaFija, Turno, Usuario } from '@/tipos';
import { pedirLista, pedirSinRespuesta, pedirUno } from './cliente';

export type ReservaDelDia = {
  reserva: Reserva;
  turno: Turno | null;
  espacio: Espacio | null;
  usuario: Usuario | null;
};

/** Bloqueo de un espacio. Sin horas cubre el día entero. */
export type Bloqueo = {
  id: string;
  espacioId: string;
  fecha: string; // "AAAA-MM-DD"
  inicio: string | null; // "HH:MM"
  fin: string | null;
  motivo: string;
};

export type NuevoBloqueo = {
  espacioIds: string[];
  fecha: string;
  inicio?: string | null;
  fin?: string | null;
  motivo: string;
};

export type DatosFija = {
  espacioId: string;
  titular: string;
  dia: number;
  inicio: string;
  fin: string;
  desde: string;
  hasta?: string | null;
};

/** Sólo se manda lo que cambia; el espacio de una fija no se puede cambiar. */
export type CambiosFija = {
  titular?: string;
  dia?: number;
  inicio?: string;
  fin?: string;
  desde?: string;
  hasta?: string | null;
  activa?: boolean;
};

/** Fija o bloqueo de un espacio en un rango de horas (los turnos seguidos se juntan). */
export type BloqueDelDia = {
  tipo: 'fijo' | 'mantenimiento';
  espacio: Espacio | null;
  inicio: string; // "HH:MM"
  fin: string;
  detalle: string; // titular de la fija o motivo del bloqueo
};

export type AgendaDelDia = {
  reservas: ReservaDelDia[];
  bloques: BloqueDelDia[];
};

/** Junta los turnos fijos y bloqueados seguidos: "08:00 a 24:00 · Lluvia" y no 16 filas. */
function armarBloques(
  turnos: Turno[],
  espacioPorId: Map<string, Espacio>,
  fijas: ReservaFija[],
  fecha: string
): BloqueDelDia[] {
  // 0 = domingo, igual que en las reservas fijas. Mediodía para que la zona horaria no corra el día.
  const dia = new Date(`${fecha}T12:00:00`).getDay();
  const bloques: BloqueDelDia[] = [];

  const ocupados = turnos
    .filter((turno) => turno.estado === 'fijo' || turno.estado === 'mantenimiento')
    .sort((a, b) => a.espacioId.localeCompare(b.espacioId) || a.inicio.localeCompare(b.inicio));

  for (const turno of ocupados) {
    const tipo = turno.estado as BloqueDelDia['tipo'];
    const detalle =
      tipo === 'mantenimiento'
        ? (turno.motivoBloqueo ?? 'Sin motivo')
        : (fijas.find(
            (f) =>
              f.activa &&
              f.espacioId === turno.espacioId &&
              f.dia === dia &&
              turno.inicio >= f.inicio &&
              turno.inicio < f.fin
          )?.titular ?? 'Reserva fija');

    const anterior = bloques[bloques.length - 1];
    const sigue =
      anterior &&
      anterior.espacio?.id === turno.espacioId &&
      anterior.tipo === tipo &&
      anterior.detalle === detalle &&
      anterior.fin === turno.inicio;

    if (sigue) {
      anterior.fin = turno.fin;
    } else {
      bloques.push({
        tipo,
        espacio: espacioPorId.get(turno.espacioId) ?? null,
        inicio: turno.inicio,
        fin: turno.fin,
        detalle,
      });
    }
  }
  return bloques;
}

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

/** Bloqueos desde una fecha, paginados igual que el resto de las listas. */
async function traerBloqueos(desde: string, espacioId?: string): Promise<Bloqueo[]> {
  const porPagina = 100;
  const bloqueos: Bloqueo[] = [];
  let pagina = 1;
  let total = 0;

  do {
    const { datos, meta } = await pedirLista<Bloqueo>('/bloqueos', {
      conToken: true,
      query: { desde, espacioId, pagina, porPagina },
    });
    bloqueos.push(...datos);
    total = meta.total;
    pagina += 1;
  } while (bloqueos.length < total);

  return bloqueos;
}

/** Todas las reservas fijas (activas e inactivas), para poder reactivarlas. */
async function traerFijas(): Promise<ReservaFija[]> {
  const porPagina = 100;
  const fijas: ReservaFija[] = [];
  let pagina = 1;
  let total = 0;

  do {
    const { datos, meta } = await pedirLista<ReservaFija>('/fijas', {
      conToken: true,
      query: { pagina, porPagina },
    });
    fijas.push(...datos);
    total = meta.total;
    pagina += 1;
  } while (fijas.length < total);

  return fijas;
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

  /**
   * Agenda del día para el personal: las reservas (con turno, espacio y datos del jugador)
   * y los turnos que ocupan la cancha sin una reserva: las fijas y los bloqueos.
   * Los turnos libres no se muestran: al encargado le sirve saber quién viene, no qué sobra.
   */
  async agendaDelDia(fecha: string): Promise<AgendaDelDia> {
    const [turnos, reservas, espacios, fijas] = await Promise.all([
      traerAgenda(fecha),
      traerReservas(fecha),
      traerEspacios(),
      // Si no se pueden traer las fijas, la agenda igual se muestra (sin el nombre del titular).
      traerFijas().catch(() => [] as ReservaFija[]),
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

    const conDatos: ReservaDelDia[] = reservas.map((reserva) => ({
      reserva,
      turno: turnoPorId.get(reserva.turnoId) ?? null,
      espacio: espacioPorId.get(reserva.espacioId) ?? null,
      usuario: usuarios.get(reserva.usuarioId) ?? null,
    }));

    return {
      reservas: conDatos,
      bloques: armarBloques(turnos, espacioPorId, fijas, fecha),
    };
  },

  async marcarAusente(reservaId: string): Promise<Reserva> {
    return pedirUno<Reserva>(`/reservas/${reservaId}/ausente`, {
      metodo: 'POST',
      conToken: true,
    });
  },

  // --- Bloqueos (encargado y administrador) ---

  bloqueos: traerBloqueos,

  /** Bloquea uno o más espacios. Sin horas, bloquea el día entero. */
  async crearBloqueo(datos: NuevoBloqueo): Promise<Bloqueo[]> {
    const { datos: creados } = await pedirLista<Bloqueo>('/bloqueos', {
      metodo: 'POST',
      conToken: true,
      cuerpo: {
        espacioIds: datos.espacioIds,
        fecha: datos.fecha,
        inicio: datos.inicio ?? null,
        fin: datos.fin ?? null,
        motivo: datos.motivo,
      },
    });
    return creados;
  },

  async borrarBloqueo(id: string): Promise<void> {
    await pedirSinRespuesta(`/bloqueos/${id}`, {
      metodo: 'DELETE',
      conToken: true,
    });
  },

  // --- Reservas fijas (sólo administrador para crear y editar) ---

  fijas: traerFijas,

  async crearFija(datos: DatosFija): Promise<ReservaFija> {
    return pedirUno<ReservaFija>('/fijas', {
      metodo: 'POST',
      conToken: true,
      cuerpo: {
        ...datos,
        hasta: datos.hasta ?? null,
      },
    });
  },

  async editarFija(id: string, cambios: CambiosFija): Promise<ReservaFija> {
    return pedirUno<ReservaFija>(`/fijas/${id}`, {
      metodo: 'PATCH',
      conToken: true,
      cuerpo: cambios,
    });
  },

  async darDeBajaFija(id: string): Promise<void> {
    await pedirSinRespuesta(`/fijas/${id}`, {
      metodo: 'DELETE',
      conToken: true,
    });
  },

  // --- Precio por hora (sólo administrador) ---

  async cambiarPrecio(espacioId: string, precioPorHora: number): Promise<Espacio> {
    return pedirUno<Espacio>(`/espacios/${espacioId}`, {
      metodo: 'PATCH',
      conToken: true,
      cuerpo: { precioPorHora },
    });
  },
};
