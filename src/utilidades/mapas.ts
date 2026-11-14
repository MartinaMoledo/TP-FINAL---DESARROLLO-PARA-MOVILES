// Abre la app de mapas del teléfono con la ruta hasta un lugar ("Cómo llegar").
import { Linking, Platform } from 'react-native';

import type { Coordenadas } from '@/tipos';

export async function abrirComoLlegar(destino: Coordenadas, nombre: string): Promise<void> {
  const { latitud, longitud } = destino;
  const etiqueta = encodeURIComponent(nombre);

  const nativa = Platform.select({
    // maps:// abre directo la app Mapas (http:// puede abrirse en el navegador).
    // Sin origen (saddr), arranca la ruta desde la ubicación actual. dirflg=d: en auto.
    ios: `maps://?daddr=${latitud},${longitud}&dirflg=d`,
    default: `geo:0,0?q=${latitud},${longitud}(${etiqueta})`,
  });
  const web = `https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}`;

  try {
    await Linking.openURL(nativa);
  } catch {
    // Si el teléfono no tiene una app que abra el enlace, se abre en el navegador.
    await Linking.openURL(web);
  }
}
