// Tarjeta base para listas, formularios y resúmenes.
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTema } from '@/tema/useTema';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export function Tarjeta({ children, style, onPress }: Props) {
  const t = useTema();
  const contenido = [
    estilos.tarjeta,
    { backgroundColor: t.tarjeta, borderColor: t.borde },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [...contenido, { opacity: pressed ? 0.85 : 1 }]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={contenido}>{children}</View>;
}

const estilos = StyleSheet.create({
  tarjeta: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
});
