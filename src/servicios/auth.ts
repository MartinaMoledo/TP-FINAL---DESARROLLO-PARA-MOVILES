// Registro, ingreso y sesión. Puede devolver mocks o hablar con la API real.
import type { Sesion, Usuario } from "@/tipos";
import { esperar } from "@/mocks/config";
import { USUARIO_MOCK } from "@/mocks/usuario.mock";
import { ErrorApi, pedirUno, USAR_MOCKS } from "./cliente";
import { borrarToken, guardarToken, leerToken } from "./sesion";
import Storage from "expo-sqlite/kv-store";

export type DatosRegistro = {
  nombre: string;
  email: string;
  contrasena: string; // mínimo 8 caracteres
  telefono: string; // obligatorio
};

const CLAVE_USUARIO = "usuario";

async function guardarUsuario(usuario: Usuario): Promise<void> {
  await Storage.setItemAsync(CLAVE_USUARIO, JSON.stringify(usuario));
}

async function leerUsuarioGuardado(): Promise<Usuario | null> {
  const guardado = await Storage.getItemAsync(CLAVE_USUARIO);
  return guardado ? (JSON.parse(guardado) as Usuario) : null;
}

export const authServicio = {
  async ingresar(email: string, contrasena: string): Promise<Sesion> {
    if (USAR_MOCKS) {
      await esperar();
      if (contrasena.length < 8) {
        throw new ErrorApi(
          "CREDENCIALES_INVALIDAS",
          "Email o contraseña incorrectos.",
          401,
        );
      }
      await guardarToken("token-de-prueba");
      return { token: "token-de-prueba", usuario: USUARIO_MOCK };
    }

    const sesion = await pedirUno<Sesion>("/auth/ingreso", {
      metodo: "POST",
      cuerpo: { email, contrasena },
    });
    await guardarToken(sesion.token);
    await guardarUsuario(sesion.usuario);
    return sesion;
  },

  async registrar(datos: DatosRegistro): Promise<Sesion> {
    if (USAR_MOCKS) {
      await esperar();
      await guardarToken("token-de-prueba");
      return {
        token: "token-de-prueba",
        usuario: {
          ...USUARIO_MOCK,
          nombre: datos.nombre,
          email: datos.email,
          telefono: datos.telefono,
        },
      };
    }

    const sesion = await pedirUno<Sesion>("/auth/registro", {
      metodo: "POST",
      cuerpo: datos,
    });
    await guardarToken(sesion.token);
    return sesion;
  },

  /** Devuelve el usuario de la sesión guardada, o null si no hay sesión. */
  async miUsuario(): Promise<Usuario | null> {
    const token = await leerToken();
    if (!token) return null;

    try {
      let usuario: Usuario;
      if (USAR_MOCKS) {
        await esperar();
        usuario = USUARIO_MOCK;
      } else {
        usuario = await pedirUno<Usuario>('/yo', { conToken: true });
      }
      await guardarUsuario(usuario);
      return usuario;
    } catch (error) {
      // Sin internet seguimos con el usuario guardado: la sesion no se cierra.
      if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') {
        return leerUsuarioGuardado();
      }
      // Si el token venció o la base se reinició, no lo dejamos guardado.
      if (error instanceof ErrorApi && error.estado === 401) {
        await borrarToken();
        await Storage.removeItemAsync(CLAVE_USUARIO);
      }
      throw error;
    }
  },

  async salir(): Promise<void> {
  await borrarToken();
  await Storage.removeItemAsync(CLAVE_USUARIO);
},
};
