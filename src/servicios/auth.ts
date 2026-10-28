// Registro, ingreso y sesión. Hoy puede devolver mocks; mañana habla con la API real.
import type { Sesion, Usuario } from '@/tipos';
import { esperar } from '@/mocks/config';
import { USUARIO_MOCK } from '@/mocks/usuario.mock';
import { ErrorApi, pedirUno, USAR_MOCKS } from './cliente';
import { borrarToken, guardarToken, leerToken } from './sesion';

export type DatosRegistro = {
  nombre: string;
  email: string;
  contrasena: string; // mínimo 8 caracteres
  telefono: string; // obligatorio
};

export const authServicio = {
  async ingresar(email: string, contrasena: string): Promise<Sesion> {
    if (USAR_MOCKS) {
      await esperar();
      if (contrasena.length < 8) throw new ErrorApi('CREDENCIALES_INVALIDAS', 'Email o contraseña incorrectos.', 401);
      await guardarToken('token-de-prueba');
      return { token: 'token-de-prueba', usuario: USUARIO_MOCK };
    }
    const sesion = await pedirUno<Sesion>('/auth/ingreso', { metodo: 'POST', cuerpo: { email, contrasena } });
    await guardarToken(sesion.token);
    return sesion;
  },

  async registrar(datos: DatosRegistro): Promise<Sesion> {
    if (USAR_MOCKS) {
      await esperar();
      await guardarToken('token-de-prueba');
      return { token: 'token-de-prueba', usuario: { ...USUARIO_MOCK, nombre: datos.nombre, email: datos.email, telefono: datos.telefono } };
    }
    const sesion = await pedirUno<Sesion>('/auth/registro', { metodo: 'POST', cuerpo: datos });
    await guardarToken(sesion.token);
    return sesion;
  },

  /** Devuelve el usuario de la sesión guardada, o null si no hay sesión. */
  async miUsuario(): Promise<Usuario | null> {
    const token = await leerToken();
    if (!token) return null;
    if (USAR_MOCKS) {
      await esperar();
      return USUARIO_MOCK;
    }
    return pedirUno<Usuario>('/yo', { conToken: true });
  },

  async salir(): Promise<void> {
    await borrarToken();
  },
};
