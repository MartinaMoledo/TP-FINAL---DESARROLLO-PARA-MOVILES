// Configuración dinámica: la clave de Google Maps viene de una variable de entorno
// para no guardarla en el repositorio. El resto de la identidad sigue en app.json.
import type { ConfigContext, ExpoConfig } from 'expo/config';

const CLAVE_MAPS = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';

export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = [...(config.plugins ?? [])];

  // react-native-maps funciona en Expo Go sin configuración extra. Para el APK
  // necesita su config plugin con la clave de Google Maps; si no hay clave, se
  // omite y el build sigue compilando (el mapa sale en blanco en Android).
  if (CLAVE_MAPS) {
    plugins.push([
      'react-native-maps',
      {
        androidGoogleMapsApiKey: CLAVE_MAPS,
      },
    ]);
  }

  return {
    ...config,
    name: config.name ?? 'Reservas Deportivas',
    slug: config.slug ?? 'reservas-deportivas',
    plugins,
  };
};
