// Logo de Activá Villaguay para el encabezado. Prueba visual, sin commitear.
import { Image } from 'expo-image';

export function LogoEncabezado() {
  return (
    <Image
      source={require('../../assets/images/splash-icon.png')}
      style={{ width: 42, height: 42 }}
      contentFit="contain"
      accessibilityLabel="Activá Villaguay"
    />
  );
}
