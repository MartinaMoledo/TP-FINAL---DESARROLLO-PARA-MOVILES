// Ayudas compartidas por las tres herramientas del panel del personal.
import { ErrorApi } from '@/servicios/cliente';

/** La API acepta horas en punto entre las 08:00 y las 23:00 para el inicio. */
export const HORAS_INICIO = Array.from(
  { length: 16 },
  (_, i) => `${String(8 + i).padStart(2, '0')}:00`
);

/** El fin puede ser 24:00, que para la API significa el final del día. */
export const HORAS_FIN = Array.from(
  { length: 16 },
  (_, i) => `${String(9 + i).padStart(2, '0')}:00`
);

/** Nombres cortos, en el orden que usa la API: 0 = domingo. */
export const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

/** Horas de fin válidas para un inicio dado (siempre posteriores). */
export function horasFinDesde(inicio: string): string[] {
  return HORAS_FIN.filter((hora) => hora > inicio);
}

/** Mensaje para mostrar en un Alert a partir de un error de la API. */
export function mensajeDeError(error: unknown): string {
  return error instanceof ErrorApi ? error.message : 'Ocurrió un error inesperado.';
}

/** "2026-11-12" -> "12/11/26" */
export function fechaCorta(iso: string): string {
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio.slice(2)}`;
}

export function precioConMoneda(precio: number): string {
  return `$ ${precio.toLocaleString('es-AR')}`;
}

/** "AAAA-MM-DD" con días y meses reales (para validar antes de mandar). */
export function esFechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  return (
    d.getUTCFullYear() === anio &&
    d.getUTCMonth() === mes - 1 &&
    d.getUTCDate() === dia
  );
}

/** Texto de un bloqueo: "Todo el día" o "10:00 a 12:00". */
export function horarioDeBloqueo(inicio: string | null, fin: string | null): string {
  if (!inicio || !fin) return 'Todo el día';
  return `${inicio} a ${fin}`;
}
