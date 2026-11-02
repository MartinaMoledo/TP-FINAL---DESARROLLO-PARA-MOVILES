// Etiquetas de estado: libres, reservados, fijos, mantenimiento y avisos.
import { StyleSheet, Text, View } from 'react-native';

import { useTema } from '@/tema/useTema';
import type { EstadoReserva, EstadoTurno } from '@/tipos';

export type TonoEtiqueta =
  | 'neutro'
  | 'exito'
  | 'libre'
  | 'ocupado'
  | 'fijo'
  | 'mantenimiento'
  | 'advertencia';

type Props = {
  texto: string;
  tono?: TonoEtiqueta;
};

export function Etiqueta({ texto, tono = 'neutro' }: Props) {
  const t = useTema();

  const color = {
    neutro: t.textoSuave,
    exito: t.libre,
    libre: t.libre,
    ocupado: t.ocupado,
    fijo: t.fijo,
    mantenimiento: t.mantenimiento,
    advertencia: t.advertencia,
  }[tono];

  return (
    <View
      style={[
        estilos.etiqueta,
        { backgroundColor: `${color}1F`, borderColor: `${color}55` },
      ]}
    >
      <View style={[estilos.punto, { backgroundColor: color }]} />
      <Text style={[estilos.texto, { color }]}>{texto}</Text>
    </View>
  );
}

/** Texto y tono que corresponden a cada estado de turno. */
export function etiquetaDeTurno(estado: EstadoTurno): { texto: string; tono: TonoEtiqueta } {
  switch (estado) {
    case 'libre':
      return { texto: 'Libre', tono: 'libre' };
    case 'reservado':
      return { texto: 'Reservado', tono: 'ocupado' };
    case 'fijo':
      return { texto: 'Fijo', tono: 'fijo' };
    case 'mantenimiento':
      return { texto: 'Mantenimiento', tono: 'mantenimiento' };
  }
}

/** Texto y tono que corresponden a cada estado de reserva. */
export function etiquetaDeReserva(estado: EstadoReserva): { texto: string; tono: TonoEtiqueta } {
  switch (estado) {
    case 'confirmada':
      return { texto: 'Confirmada', tono: 'libre' };
    case 'cumplida':
      return { texto: 'Cumplida', tono: 'exito' };
    case 'cancelada':
      return { texto: 'Cancelada', tono: 'ocupado' };
    case 'ausente':
      return { texto: 'Ausente', tono: 'mantenimiento' };
  }
}

const estilos = StyleSheet.create({
  etiqueta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  punto: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  texto: {
    fontSize: 13,
    fontWeight: '700',
  },
});
