// Espacios favoritos de cada usuario. Se guardan en la cuenta, en la API:
//   GET    /yo                              -> el usuario con su lista `espaciosFavoritos`
//   PUT    /yo/espacios-favoritos/<id>      -> agrega uno y devuelve el usuario actualizado
//   DELETE /yo/espacios-favoritos/<id>      -> lo saca (204, sin cuerpo)
// Tienen que estar en la cuenta porque el aviso de "se liberó un turno de tu favorito" sale de ahí.
// Además se guarda una copia en el teléfono (kv-store) para mostrarlos sin conexión.
// Con los datos de prueba (USAR_MOCKS) no hay API: se trabaja solo con la copia del teléfono.
import Storage from 'expo-sqlite/kv-store';

import type { Usuario } from '@/tipos';
import { ErrorApi, pedirSinRespuesta, pedirUno, USAR_MOCKS } from './cliente';

const clave = (usuarioId: string) => `favoritos:${usuarioId}`;

async function leerCopia(usuario: Usuario): Promise<string[]> {
  const guardado = await Storage.getItemAsync(clave(usuario.id));
  if (guardado) {
    try {
      const lista: unknown = JSON.parse(guardado);
      if (Array.isArray(lista)) return lista.filter((x): x is string => typeof x === 'string');
    } catch {
      // si la copia está rota se usa la lista que vino con la cuenta
    }
  }
  return usuario.espaciosFavoritos;
}

async function guardarCopia(usuarioId: string, lista: string[]): Promise<void> {
  try {
    await Storage.setItemAsync(clave(usuarioId), JSON.stringify(lista));
  } catch {
    // la copia es un extra para ver sin conexión: si falla, no se avisa
  }
}

export const favoritosServicio = {
  /** La lista actual: de la API, o la copia del teléfono si no hay conexión. */
  async listar(usuario: Usuario): Promise<string[]> {
    if (USAR_MOCKS) return leerCopia(usuario);
    try {
      const actual = await pedirUno<Usuario>('/yo', { conToken: true });
      await guardarCopia(usuario.id, actual.espaciosFavoritos);
      return actual.espaciosFavoritos;
    } catch (error) {
      if (error instanceof ErrorApi && error.codigo === 'SIN_CONEXION') return leerCopia(usuario);
      throw error;
    }
  },

  /** Marca o desmarca un espacio en la cuenta y devuelve la lista nueva. */
  async alternar(usuario: Usuario, espacioId: string): Promise<string[]> {
    const actuales = await this.listar(usuario);
    const yaEstaba = actuales.includes(espacioId);

    let nuevos: string[];
    if (USAR_MOCKS) {
      nuevos = yaEstaba ? actuales.filter((id) => id !== espacioId) : [...actuales, espacioId];
    } else if (yaEstaba) {
      await pedirSinRespuesta(`/yo/espacios-favoritos/${espacioId}`, {
        metodo: 'DELETE',
        conToken: true,
      });
      nuevos = actuales.filter((id) => id !== espacioId);
    } else {
      const actualizado = await pedirUno<Usuario>(`/yo/espacios-favoritos/${espacioId}`, {
        metodo: 'PUT',
        conToken: true,
      });
      nuevos = actualizado.espaciosFavoritos;
    }

    await guardarCopia(usuario.id, nuevos);
    return nuevos;
  },
};
