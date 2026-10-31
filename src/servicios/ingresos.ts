import { RESERVAS_MOCK } from '@/mocks/reservas.mock';
import { esperar } from '@/mocks/config';
import { ErrorApi, USAR_MOCKS } from './cliente';

export const ingresosServicio = {
  async registrar(codigoQr: string) {
    if (USAR_MOCKS) {
      await esperar();

      const reserva = RESERVAS_MOCK.find(
        (r) => r.codigoQr === codigoQr
      );

      if (!reserva) {
        throw new ErrorApi(
          'QR_INVALIDO',
          'No existe una reserva con este código.',
          404
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

      return reserva;
    }

    throw new ErrorApi(
      'API_NO_CONFIGURADA',
      'Falta conectar el registro de ingresos con la API.',
      503
    );
  },
};