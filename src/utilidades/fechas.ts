// Fechas del PRD: un día suelto es "AAAA-MM-DD"; fecha y hora son ISO 8601 con zona (-03:00).

function dosDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

/** Hoy en formato "AAAA-MM-DD" (hora del teléfono). */
export function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
}

/** Suma (o resta) días a una fecha "AAAA-MM-DD". */
export function sumarDias(fecha: string, dias: number): string {
  const d = new Date(`${fecha}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;
}

/** Día de la semana de una fecha "AAAA-MM-DD": 0 = domingo ... 6 = sábado. */
export function diaDeLaSemana(fecha: string): number {
  return new Date(`${fecha}T12:00:00`).getDay();
}

/** "AAAA-MM-DD" + "HH:MM" -> ISO con zona de Argentina. Ej: "2026-09-19T19:00:00-03:00". */
export function aISOArgentina(fecha: string, hora: string): string {
  return `${fecha}T${hora === '24:00' ? '23:59' : hora}:00-03:00`;
}

/** Resta horas a un ISO con zona -03:00 y devuelve otro ISO con zona -03:00. */
export function restarHoras(iso: string, horas: number): string {
  const ms = Date.parse(iso) - horas * 3600 * 1000;
  const enArgentina = new Date(ms - 3 * 3600 * 1000);
  return `${enArgentina.toISOString().slice(0, 19)}-03:00`;
}
