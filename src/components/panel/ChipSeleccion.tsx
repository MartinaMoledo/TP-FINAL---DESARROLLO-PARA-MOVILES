// Chip para elegir canchas, días u horas dentro del panel del personal.
import { Pressable, StyleSheet, Text } from 'react-native';

import { fuente } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

type Props = {
  texto: string;
  activo: boolean;
  onPress: () => void;
  deshabilitado?: boolean;
};

export function ChipSeleccion({ texto, activo, onPress, deshabilitado = false }: Props) {
  const t = useTema();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo, disabled: deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={[
        estilos.chip,
        {
          backgroundColor: activo ? t.primario : t.tarjeta,
          borderColor: activo ? t.primario : t.borde,
          opacity: deshabilitado ? 0.5 : 1,
        },
      ]}
    >
      <Text style={[estilos.texto, { color: activo ? t.sobrePrimario : t.texto }]}>
        {texto}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { fontSize: 15, fontFamily: fuente.seminegrita },
});
