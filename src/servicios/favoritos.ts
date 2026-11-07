// Espacios favoritos de cada usuario. Hoy se guardan en el teléfono (kv-store) porque la API
// no tiene un endpoint de favoritos; la lista inicial sale de `usuario.espaciosFavoritos`.
// Cuando la cátedra confirme el endpoint, solo cambia este archivo.
import Storage from 'expo-sqlite/kv-store';

import type { Usuario } from '@/tipos';

const clave = (usuarioId: string) => `favoritos:${usuarioId}`;

export const favoritosServicio = {
  async listar(usuario: Usuario): Promise<string[]> {
    const guardado = await Storage.getItemAsync(clave(usuario.id));
    if (guardado) {
      try {
        const lista: unknown = JSON.parse(guardado);
        if (Array.isArray(lista)) return lista.filter((x): x is string => typeof x === 'string');
      } catch {
        // si el valor está roto se vuelve a la lista de la cuenta
      }
    }
    return usuario.espaciosFavoritos;
  },

  /** Marca o desmarca un espacio y devuelve la lista nueva. */
  async alternar(usuario: Usuario, espacioId: string): Promise<string[]> {
    const actuales = await this.listar(usuario);
    const nuevos = actuales.includes(espacioId)
      ? actuales.filter((id) => id !== espacioId)
      : [...actuales, espacioId];
    await Storage.setItemAsync(clave(usuario.id), JSON.stringify(nuevos));
    return nuevos;
  },
};
