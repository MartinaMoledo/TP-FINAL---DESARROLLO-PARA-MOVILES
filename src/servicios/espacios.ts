// Espacios, deportes y la grilla de turnos de un día.
import type { Deporte, Espacio, Turno } from "@/tipos";
import { esperar } from "@/mocks/config";
import { DEPORTES_MOCK } from "@/mocks/deportes.mock";
import { ESPACIOS_MOCK } from "@/mocks/espacios.mock";
import { crearTurnos } from "@/mocks/turnos.mock";
import { ErrorApi, pedirLista, pedirUno, USAR_MOCKS } from "./cliente";
import {
  guardarDeportes,
  guardarEspacios,
  guardarTurnos,
  leerDeportes,
  leerEspacios,
  leerTurnos,
} from "./baseLocal";

export type FiltrosEspacios = {
  deporteId?: string;
  complejo?: string;
  iluminacion?: boolean;
  techado?: boolean;
};

export const espaciosServicio = {
  async listar(filtros: FiltrosEspacios = {}): Promise<Espacio[]> {
    try {
      let lista: Espacio[];
      if (USAR_MOCKS) {
        await esperar();
        lista = ESPACIOS_MOCK.filter(
          (e) =>
            e.activo &&
            (filtros.deporteId === undefined ||
              e.deporteId === filtros.deporteId) &&
            (filtros.complejo === undefined ||
              e.complejo === filtros.complejo) &&
            (filtros.iluminacion === undefined ||
              e.iluminacion === filtros.iluminacion) &&
            (filtros.techado === undefined || e.techado === filtros.techado),
        );
      } else {
        const { datos } = await pedirLista<Espacio>("/espacios", {
          query: { ...filtros },
        });
        lista = datos;
      }
      // Solo guardo la lista completa (sin filtros), para no pisarla con una a medias.
      if (Object.keys(filtros).length === 0) {
        try {
          await guardarEspacios(lista);
        } catch (errorGuardar) {
          console.log("no se pudo guardar espacios:", errorGuardar);
        }
      }
      return lista;
    } catch (error) {
      // Sin internet mostramos lo ultimo que guardamos (si hay algo).
      if (error instanceof ErrorApi && error.codigo === "SIN_CONEXION") {
        const guardados = await leerEspacios();
        if (guardados.length > 0) return guardados;
      }
      throw error;
    }
  },

  async obtener(id: string): Promise<Espacio> {
    try {
      if (USAR_MOCKS) {
        await esperar();
        const espacio = ESPACIOS_MOCK.find((e) => e.id === id);
        if (!espacio)
          throw new ErrorApi(
            "ESPACIO_NO_ENCONTRADO",
            "No existe ese espacio.",
            404,
          );
        return espacio;
      }
      return await pedirUno<Espacio>(`/espacios/${id}`);
    } catch (error) {
      // Sin internet lo busco en la lista guardada.
      if (error instanceof ErrorApi && error.codigo === "SIN_CONEXION") {
        const guardados = await leerEspacios();
        const espacio = guardados.find((e) => e.id === id);
        if (espacio) return espacio;
      }
      throw error;
    }
  },

  async deportes(): Promise<Deporte[]> {
    try {
      let lista: Deporte[];
      if (USAR_MOCKS) {
        await esperar();
        lista = DEPORTES_MOCK;
      } else {
        const { datos } = await pedirLista<Deporte>("/deportes");
        lista = datos;
      }
      try {
        await guardarDeportes(lista);
      } catch (errorGuardar) {
        console.log("no se pudo guardar deportes:", errorGuardar);
      }
      return lista;
    } catch (error) {
      if (error instanceof ErrorApi && error.codigo === "SIN_CONEXION") {
        const guardados = await leerDeportes();
        if (guardados.length > 0) return guardados;
      }
      throw error;
    }
  },

  /** Los 16 turnos (08:00 a 24:00) de un día. fecha = "AAAA-MM-DD". */
  async turnos(espacioId: string, fecha: string): Promise<Turno[]> {
    try {
      let lista: Turno[];
      if (USAR_MOCKS) {
        await esperar();
        const espacio = ESPACIOS_MOCK.find((e) => e.id === espacioId);
        if (!espacio)
          throw new ErrorApi(
            "ESPACIO_NO_ENCONTRADO",
            "No existe ese espacio.",
            404,
          );
        lista = crearTurnos(espacio, fecha);
      } else {
        const { datos } = await pedirLista<Turno>(
          `/espacios/${espacioId}/turnos`,
          { query: { fecha } },
        );
        lista = datos;
      }
      try {
        await guardarTurnos(espacioId, fecha, lista);
      } catch (errorGuardar) {
        console.log("no se pudo guardar turnos:", errorGuardar);
      }
      return lista;
    } catch (error) {
      // Sin internet mostramos los turnos que consultamos antes para ese dia (si los hay).
      if (error instanceof ErrorApi && error.codigo === "SIN_CONEXION") {
        const guardados = await leerTurnos(espacioId, fecha);
        if (guardados) return guardados;
      }
      throw error;
    }
  },
};
