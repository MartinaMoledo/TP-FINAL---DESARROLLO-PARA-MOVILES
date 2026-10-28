// Cliente único de la API. Ninguna pantalla hace fetch: todo pasa por los servicios.
import type { Meta, RespuestaError } from '@/tipos';
import { leerToken } from './sesion';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
export const USAR_MOCKS = process.env.EXPO_PUBLIC_USAR_MOCKS === 'true';

/** Error con el código y el mensaje de la API (o SIN_CONEXION si no hubo red). */
export class ErrorApi extends Error {
  codigo: string;
  estado: number | null;

  constructor(codigo: string, mensaje: string, estado: number | null = null) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.codigo = codigo;
    this.estado = estado;
  }
}

type Opciones = {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  cuerpo?: unknown;
  /** Si es true manda Authorization: Bearer <token>. */
  conToken?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
};

async function pedir(ruta: string, opciones: Opciones = {}): Promise<{ datos: unknown; meta: Meta | null }> {
  const { metodo = 'GET', cuerpo, conToken = false, query } = opciones;

  const params = query
    ? Object.entries(query)
        .filter(([, valor]) => valor !== undefined)
        .map(([clave, valor]) => `${encodeURIComponent(clave)}=${encodeURIComponent(String(valor))}`)
        .join('&')
    : '';
  const url = `${API_URL}${ruta}${params ? `?${params}` : ''}`;

  const cabeceras: Record<string, string> = { Accept: 'application/json' };
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json';
  if (conToken) {
    const token = await leerToken();
    if (token) cabeceras.Authorization = `Bearer ${token}`;
  }

  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), 15000);
  let respuesta: Response;
  try {
    respuesta = await fetch(url, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal: control.signal,
    });
  } catch {
    throw new ErrorApi('SIN_CONEXION', 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.');
  } finally {
    clearTimeout(temporizador);
  }

  if (respuesta.status === 204) return { datos: null, meta: null };

  let json: unknown = null;
  try {
    json = await respuesta.json();
  } catch {
    // respuesta sin cuerpo
  }

  if (!respuesta.ok) {
    const error = (json as RespuestaError | null)?.error;
    throw new ErrorApi(error?.codigo ?? 'ERROR_DESCONOCIDO', error?.mensaje ?? 'Algo salió mal.', respuesta.status);
  }

  const sobre = (json ?? {}) as { datos?: unknown; meta?: Meta | null };
  return { datos: sobre.datos ?? null, meta: sobre.meta ?? null };
}

/** GET que devuelve una lista: { datos: [...], meta }. */
export async function pedirLista<T>(ruta: string, opciones?: Opciones): Promise<{ datos: T[]; meta: Meta }> {
  const { datos, meta } = await pedir(ruta, opciones);
  return { datos: (datos ?? []) as T[], meta: meta ?? { total: 0, pagina: 1, porPagina: 0 } };
}

/** Pedido que devuelve un solo recurso: { datos: {...}, meta: null }. */
export async function pedirUno<T>(ruta: string, opciones?: Opciones): Promise<T> {
  const { datos } = await pedir(ruta, opciones);
  return datos as T;
}

/** Pedido que responde 204 (sin cuerpo). */
export async function pedirSinRespuesta(ruta: string, opciones?: Opciones): Promise<void> {
  await pedir(ruta, opciones);
}
