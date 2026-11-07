// Botón de filtro. `tipo="deporte"` es el chip principal; `tipo="complejo"` es el gris,
// más chico, que va debajo de la fecha.
import { Pressable, StyleSheet, Text } from 'react-native';

import { useMarca } from '@/tema/marca';
import { fuente } from '@/tema/tipografia';

type Props = {
  texto: string;
  activo: boolean;
  onPress: () => void;
  tipo?: 'deporte' | 'complejo';
};

export function FiltroChip({ texto, activo, onPress, tipo = 'deporte' }: Props) {
  const m = useMarca();
  const chico = tipo === 'complejo';

  const colores = chico
    ? {
        fondo: activo ? m.grisActivoFondo : m.grisFondo,
        texto: activo ? m.grisActivoTexto : m.grisTexto,
        borde: 'transparent',
      }
    : {
        fondo: activo ? m.chipActivoFondo : m.chipFondo,
        texto: activo ? m.chipActivoTexto : m.chipTexto,
        borde: activo ? m.chipActivoBorde : 'transparent',
      };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={[
        chico ? estilos.chipChico : estilos.chip,
        { backgroundColor: colores.fondo, borderColor: colores.borde },
      ]}
    >
      <Text
        style={[
          chico ? estilos.textoChico : estilos.texto,
          { color: colores.texto },
        ]}
      >
        {texto}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { fontSize: 16, fontFamily: fuente.seminegrita },
  chipChico: {
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoChico: { fontSize: 14, fontFamily: fuente.media },
});
