// Configuración dinámica: la clave de Google Maps viene de una variable de entorno
// para no guardarla en el repositorio. El resto de la identidad sigue en app.json.
import type { ConfigContext, ExpoConfig } from 'expo/config';

const CLAVE_MAPS = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';

export default ({ config }: ConfigContext): ExpoConfig => {
  const configAndroid = config.android?.config ?? {};

  return {
    ...config,
    name: config.name ?? 'Reservas Deportivas',
    slug: config.slug ?? 'reservas-deportivas',
    android: {
      ...config.android,
      config: CLAVE_MAPS
        ? {
            ...configAndroid,
            googleMaps: {
              ...configAndroid.googleMaps,
              apiKey: CLAVE_MAPS,
            },
          }
        : configAndroid,
    },
  };
};
