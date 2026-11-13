
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNetworkState } from 'expo-network';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fuente } from '@/tema/tipografia';
import { tamanos, useTema } from '@/tema/useTema';

export function AvisoDeRed() {
  const t = useTema();
  const red = useNetworkState();
  const margenes = useSafeAreaInsets();

  const [anterior, setAnterior] = useState(red.isInternetReachable);
  const [volvio, setVolvio] = useState(false);

  if (red.isInternetReachable !== anterior) {
    setAnterior(red.isInternetReachable);
    if (anterior === false && red.isInternetReachable === true) {
      setVolvio(true);
    }
  }

  // A los 3 segundos se saca el cartel de "volvio".
  useEffect(() => {
    if (!volvio) return;
    const reloj = setTimeout(() => setVolvio(false), 3000);
    return () => clearTimeout(reloj);
  }, [volvio]);


  if (red.isInternetReachable === false) {
    return (
      <View style={[estilos.barra, { backgroundColor: t.primario, paddingTop: margenes.top + 6 }]}>
        <Text style={[estilos.texto, { color: t.sobrePrimario }]}>
          Sin conexion. Ves los ultimos datos guardados.
        </Text>
      </View>
    );
  }

  if (volvio) {
    return (
      <View style={[estilos.barra, { backgroundColor: t.acento, paddingTop: margenes.top + 6 }]}>
        <Text style={[estilos.texto, { color: t.sobreAcento }]}>Volvio la conexion.</Text>
      </View>
    );
  }

  return null;
}

const estilos = StyleSheet.create({
  barra: { paddingBottom: 6, paddingHorizontal: 16 },
  texto: {
    fontFamily: fuente.negrita,
    fontSize: tamanos.texto - 2,
    textAlign: 'center',
  },
});