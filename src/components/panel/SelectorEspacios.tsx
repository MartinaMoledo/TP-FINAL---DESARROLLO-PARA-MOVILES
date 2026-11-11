// Elige una o varias canchas con chips. Con `multiple` se pueden sumar.
import { StyleSheet, Text, View } from 'react-native';

import { ChipSeleccion } from '@/components/panel/ChipSeleccion';
import { fuente } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import type { Espacio } from '@/tipos';

type Props = {
  espacios: Espacio[];
  seleccionados: string[];
  onCambiar: (ids: string[]) => void;
  multiple?: boolean;
  deshabilitado?: boolean;
};

export function SelectorEspacios({
  espacios,
  seleccionados,
  onCambiar,
  multiple = false,
  deshabilitado = false,
}: Props) {
  const t = useTema();

  function alternar(id: string) {
    if (multiple) {
      onCambiar(
        seleccionados.includes(id)
          ? seleccionados.filter((elegido) => elegido !== id)
          : [...seleccionados, id]
      );
    } else {
      onCambiar(seleccionados.includes(id) ? [] : [id]);
    }
  }

  if (espacios.length === 0) {
    return (
      <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
        No hay canchas cargadas.
      </Text>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.chips}>
        {espacios.map((espacio) => (
          <ChipSeleccion
            key={espacio.id}
            texto={espacio.nombre}
            activo={seleccionados.includes(espacio.id)}
            deshabilitado={deshabilitado}
            onPress={() => alternar(espacio.id)}
          />
        ))}
      </View>
      {multiple ? (
        <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
          Podés elegir más de una cancha.
        </Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ayuda: { fontSize: 13, fontFamily: fuente.regular },
});
