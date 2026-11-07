// Modo claro / oscuro elegido con el botón de la pantalla de espacios.
// Appearance.setColorScheme cambia el modo de TODA la app: `useColorScheme` (y por lo tanto
// `useTema`) devuelve lo elegido. Si nunca se eligió, se sigue el modo del teléfono.
import { Appearance } from 'react-native';
import Storage from 'expo-sqlite/kv-store';

const CLAVE = 'modo-tema';

export type Modo = 'light' | 'dark';

export async function restaurarModo(): Promise<void> {
  try {
    const guardado = await Storage.getItemAsync(CLAVE);
    if (guardado === 'light' || guardado === 'dark') Appearance.setColorScheme(guardado);
  } catch {
    // si no se puede leer, se sigue el modo del teléfono
  }
}

export function elegirModo(modo: Modo): void {
  Appearance.setColorScheme(modo);
  Storage.setItemAsync(CLAVE, modo).catch(() => {
    // guardar la elección es un extra: si falla, igual se cambia el modo
  });
}
