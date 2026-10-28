// Muestra los tres estados que pide la consigna: cargando, error y vacío.
// Si no hay nada de eso, muestra el contenido.
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { tamanos, useTema } from '@/tema/useTema';

type Props = {
  cargando: boolean;
  error: { message: string } | null;
  vacio: boolean;
  mensajeVacio: string;
  onReintentar: () => void;
  children: ReactNode;
};

export function EstadoPantalla({ cargando, error, vacio, mensajeVacio, onReintentar, children }: Props) {
  const t = useTema();

  if (cargando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator size="large" color={t.primario} />
        <Text style={[estilos.texto, { color: t.textoSuave }]}>Cargando…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={estilos.centro}>
        <Text style={[estilos.texto, { color: t.error }]}>{error.message}</Text>
        <Pressable onPress={onReintentar} style={[estilos.boton, { backgroundColor: t.primario }]}>
          <Text style={[estilos.textoBoton, { color: t.sobrePrimario }]}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (vacio) {
    return (
      <View style={estilos.centro}>
        <Text style={[estilos.texto, { color: t.textoSuave }]}>{mensajeVacio}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const estilos = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  texto: { fontSize: tamanos.texto, textAlign: 'center' },
  boton: { minHeight: tamanos.boton, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  textoBoton: { fontSize: tamanos.texto, fontWeight: '700' },
});
