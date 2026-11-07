// Botón redondo para pasar de modo claro a oscuro y al revés (luna / sol, como en el mockup).
import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, StyleSheet, useColorScheme } from 'react-native';

import { useMarca } from '@/tema/marca';
import { elegirModo } from '@/tema/modo';

export function BotonModo() {
  const m = useMarca();
  const oscuro = useColorScheme() === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onPress={() => elegirModo(oscuro ? 'light' : 'dark')}
      style={[estilos.boton, { backgroundColor: m.botonModoFondo }]}
    >
      <Ionicons name={oscuro ? 'sunny' : 'moon'} size={22} color={m.botonModoIcono} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
