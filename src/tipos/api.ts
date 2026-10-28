// src/tipos/api.ts — Lo que agrega la API y no está en el PRD (contract/api.ts). NO SE MODIFICA.
import type { Usuario } from './dominio';

export interface Meta {
  total: number;
  pagina: number;
  porPagina: number;
}

/** Éxito con una lista: { datos: [...], meta: {...} } */
export interface RespuestaLista<T> {
  datos: T[];
  meta: Meta;
}

/** Éxito con un solo recurso: { datos: {...}, meta: null } */
export interface RespuestaUno<T> {
  datos: T;
  meta: null;
}

/** Error: { error: { codigo, mensaje } } */
export interface RespuestaError {
  error: { codigo: string; mensaje: string };
}

/** Bloqueo de un espacio (lo usan los endpoints del personal). */
export interface Bloqueo {
  id: string;
  espacioId: string;
  fecha: string; // "AAAA-MM-DD"
  inicio: string | null; // "HH:MM"
  fin: string | null;
  motivo: string;
}

/** Respuesta de POST /auth/registro y POST /auth/ingreso. */
export interface Sesion {
  token: string;
  usuario: Usuario;
}

/** Respuesta de POST /archivos. */
export interface ArchivoSubido {
  url: string;
  tipo: 'imagen' | 'audio' | 'video';
  bytes: number;
}
