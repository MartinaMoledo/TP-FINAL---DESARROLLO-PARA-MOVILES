// Botón central de la barra del personal: un círculo con el QR que sobresale de la barra.
// Escanear es la acción principal del encargado en la puerta, por eso va al medio y más grande.
import Ionicons from '@react-native-vector-icons/ionicons';
import type { BottomTabBarButtonProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fuente } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export function BotonEscanearCentral(props: BottomTabBarButtonProps) {
  const t = useTema();
  const activo = props['aria-selected'] === true;

  return (
    <View style={estilos.contenedor}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Escanear QR"
        accessibilityState={{ selected: activo }}
        onPress={props.onPress}
        style={[
          estilos.circulo,
          // El borde del color de la barra hace que el círculo parezca "recortado" de ella.
          { backgroundColor: t.primario, borderColor: t.tarjeta },
          activo && { backgroundColor: t.acento },
        ]}
      >
        <Ionicons name="qr-code-outline" size={30} color={activo ? t.sobreAcento : t.sobrePrimario} />
      </Pressable>
      <Text style={[estilos.texto, { color: activo ? t.primario : t.textoSuave }]}>Escanear</Text>
    </View>
  );
}

const TAMANO = 64;

const estilos = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center' },
  circulo: {
    width: TAMANO,
    height: TAMANO,
    borderRadius: TAMANO / 2,
    borderWidth: 4,
    marginTop: -24, // sobresale de la barra
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  texto: { fontSize: 12, fontFamily: fuente.media, marginTop: 4 },
});
