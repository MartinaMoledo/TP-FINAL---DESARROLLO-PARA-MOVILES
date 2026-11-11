// Elige una hora en punto con una tira horizontal de chips.
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChipSeleccion } from '@/components/panel/ChipSeleccion';
import { fuente } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

type Props = {
  etiqueta: string;
  horas: string[];
  valor: string;
  onCambiar: (hora: string) => void;
  deshabilitado?: boolean;
};

export function SelectorHora({ etiqueta, horas, valor, onCambiar, deshabilitado }: Props) {
  const t = useTema();

  return (
    <View style={estilos.contenedor}>
      <Text style={[estilos.etiqueta, { color: t.texto }]}>{etiqueta}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.horas}
      >
        {horas.map((hora) => (
          <ChipSeleccion
            key={hora}
            texto={hora}
            activo={valor === hora}
            deshabilitado={deshabilitado}
            onPress={() => onCambiar(hora)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: 8 },
  etiqueta: { fontSize: 15, fontFamily: fuente.seminegrita },
  horas: { gap: 8, paddingRight: 8 },
});
