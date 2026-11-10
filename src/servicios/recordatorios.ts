import Storage from 'expo-sqlite/kv-store';

const clave = (reservaId: string) => `recordatorio:${reservaId}`;

export const recordatoriosServicio = {
  async guardar(reservaId: string, avisoId: string): Promise<void> {
    await Storage.setItemAsync(clave(reservaId), avisoId);
  },

  async leer(reservaId: string): Promise<string | null> {
    return Storage.getItemAsync(clave(reservaId));
  },

  async borrar(reservaId: string): Promise<void> {
    await Storage.removeItemAsync(clave(reservaId));
  },
};