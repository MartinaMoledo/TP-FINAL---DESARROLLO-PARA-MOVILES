// Registro de ingresos (QR). En la API real hace falta el espacio donde está la puerta.
import type { Reserva } from '@/tipos';
import { hoyISO } from '@/utilidades/fechas';
import { esperar } from '@/mocks/config';
import { RESERVAS_MOCK } from '@/mocks/reservas.mock';
import { ErrorApi, pedirLista, pedirUno, USAR_MOCKS } from './cliente';

/**
 * El escáner de la compañera manda sólo el código. Para no tocarlo, buscamos
 * la reserva de hoy con ese código y sacamos el espacio desde la API.
 */
async function espacioDelCodigo(codigoQr: string): Promise<string> {
  const fecha = hoyISO();
  const porPagina = 100;
  let pagina = 1;
  let total = 0;

  do {
    const { datos, meta } = await pedirLista<Reserva>('/reservas', {
      conToken: true,
      query: { fecha, pagina, porPagina },
    });

    const reserva = datos.find((r) => r.codigoQr === codigoQr);
    if (reserva) return reserva.espacioId;

    total = meta.total;
    pagina += 1;
  } while ((pagina - 1) * porPagina < total);

  throw new ErrorApi(
    'CODIGO_INVALIDO',
    'Ese código no es de una reserva de hoy.',
    404
  );
}

export const ingresosServicio = {
  async registrar(codigoQr: string, espacioId?: string): Promise<Reserva> {
    if (USAR_MOCKS) {
      await esperar();

      const reserva = RESERVAS_MOCK.find((r) => r.codigoQr === codigoQr);

      if (!reserva) {
        throw new ErrorApi(
          'QR_INVALIDO',
          'No existe una reserva con este código.',
          404
        );
      }

      if (espacioId && reserva.espacioId !== espacioId) {
        throw new ErrorApi(
          'CODIGO_DE_OTRO_ESPACIO',
          'Esa reserva es para otra cancha.',
          422
        );
      }

      if (reserva.estado !== 'confirmada') {
        throw new ErrorApi(
          'RESERVA_INVALIDA',
          'La reserva no está confirmada.',
          409
        );
      }

      if (reserva.ingresoEn) {
        throw new ErrorApi(
          'INGRESO_REGISTRADO',
          'El ingreso ya fue registrado.',
          409
        );
      }

      reserva.ingresoEn = new Date().toISOString();
      reserva.estado = 'cumplida';
      return reserva;
    }

    const espacio = espacioId ?? (await espacioDelCodigo(codigoQr));

    return pedirUno<Reserva>('/ingresos', {
      metodo: 'POST',
      conToken: true,
      cuerpo: { codigoQr, espacioId: espacio },
    });
  },
};
