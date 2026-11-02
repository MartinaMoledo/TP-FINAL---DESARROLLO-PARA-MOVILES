// Tira de días para la agenda y las reservas del personal.
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { diasDeLaSemana, hoyISO, sumarDias } from '@/utilidades/fechas';
import { useTema } from '@/tema/useTema';

type Props = {
  fecha: string;
  onCambiar: (fecha: string) => void;
  dias?: number;
};

function etiquetaDeDia(fecha: string, hoy: string): string {
  if (fecha === hoy) return 'Hoy';
  if (fecha === sumarDias(hoy, 1)) return 'Mañana';

  const [, mes, dia] = fecha.split('-');
  return `${diasDeLaSemana[new Date(`${fecha}T12:00:00`).getDay()]} ${dia}/${mes}`;
}

export function SelectorFecha({ fecha, onCambiar, dias = 7 }: Props) {
  const t = useTema();
  const hoy = hoyISO();

  const fechas = useMemo(
    () => Array.from({ length: dias }, (_, i) => sumarDias(hoy, i)),
    [dias, hoy]
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={estilos.contenido}
    >
      {fechas.map((dia) => {
        const activo = dia === fecha;
        return (
          <Pressable
            key={dia}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            onPress={() => onCambiar(dia)}
            style={[
              estilos.dia,
              {
                backgroundColor: activo ? t.primario : t.tarjeta,
                borderColor: activo ? t.primario : t.borde,
              },
            ]}
          >
            <Text
              style={{
                color: activo ? t.sobrePrimario : t.texto,
                fontWeight: '700',
                fontSize: 14,
              }}
            >
              {etiquetaDeDia(dia, hoy)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dia: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
