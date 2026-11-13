// Estados de una lista chica dentro de un formulario: cargando, error o vacío.
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { fuente } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import type { ErrorApi } from '@/servicios/cliente';

type Props = {
  cargando: boolean;
  error: ErrorApi | null;
  vacio: boolean;
  mensajeVacio: string;
  onReintentar: () => void;
  children: ReactNode;
};

export function EstadoLista({
  cargando,
  error,
  vacio,
  mensajeVacio,
  onReintentar,
  children,
}: Props) {
  const t = useTema();

  if (cargando) {
    return (
      <View style={estilos.centro}>
        <ActivityIndicator color={t.primario} />
        <Text style={[estilos.texto, { color: t.textoSuave }]}>Cargando…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={estilos.centro}>
        <Text style={[estilos.texto, { color: t.error }]}>{error.message}</Text>
        <Boton
          titulo="Reintentar"
          variante="secundario"
          onPress={onReintentar}
          style={estilos.boton}
        />
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
  centro: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 12 },
  texto: { fontSize: 15, textAlign: 'center', fontFamily: fuente.regular },
  boton: { minHeight: 44, paddingHorizontal: 24 },
});
