// Interruptores para probar los casos feos sin tocar las pantallas.
import { ErrorApi } from '@/servicios/cliente';

export const simulacion = {
  /** Poné true para ver cómo se comporta toda la app cuando no hay red. */
  errorDeRed: false,
  /** Demora artificial: así se ve el estado "cargando". */
  demoraMs: 400,
};

/** Todos los mocks esperan un poco (los servicios son asíncronos desde el día 1). */
export async function esperar(): Promise<void> {
  await new Promise((resolver) => setTimeout(resolver, simulacion.demoraMs));
  if (simulacion.errorDeRed) {
    throw new ErrorApi('SIN_CONEXION', 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.');
  }
}
