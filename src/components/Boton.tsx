// Botón de la app. Un solo lugar para tamaños, colores y estado "cargando".
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { fuente } from '@/tema/tipografia';
import { tamanos, useTema } from '@/tema/useTema';

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: VarianteBoton;
  cargando?: boolean;
  deshabilitado?: boolean;
  icono?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Boton({
  titulo,
  onPress,
  variante = 'primario',
  cargando = false,
  deshabilitado = false,
  icono,
  style,
}: Props) {
  const t = useTema();
  const bloqueado = deshabilitado || cargando;

  const colores = {
    primario: { fondo: t.primario, texto: t.sobrePrimario, borde: t.primario },
    secundario: { fondo: t.tarjeta, texto: t.texto, borde: t.borde },
    peligro: { fondo: t.error, texto: t.sobreError, borde: t.error },
    fantasma: { fondo: 'transparent', texto: t.primario, borde: 'transparent' },
  }[variante];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: bloqueado, busy: cargando }}
      disabled={bloqueado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.boton,
        {
          backgroundColor: colores.fondo,
          borderColor: colores.borde,
          opacity: bloqueado ? 0.55 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={colores.texto} />
      ) : (
        <>
          {icono}
          <Text style={[estilos.texto, { color: colores.texto }]}>{titulo}</Text>
        </>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    minHeight: tamanos.boton,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  texto: {
    fontSize: tamanos.texto,
    fontFamily: fuente.negrita,
  },
});
