// Colores claros y oscuros. Se leen de acá, nunca a mano en cada pantalla.
import { useColorScheme } from 'react-native';

const claro = {
  fondo: '#F5F7F5',
  tarjeta: '#FFFFFF',
  texto: '#14201A',
  textoSuave: '#4A5A50',
  borde: '#D5DDD7',
  primario: '#2E7D32',
  sobrePrimario: '#FFFFFF',
  error: '#B3261E',
  libre: '#2E7D32',
  ocupado: '#B3261E',
  fijo: '#6A1B9A',
  mantenimiento: '#E65100',
};

const oscuro: typeof claro = {
  fondo: '#0E1511',
  tarjeta: '#18211B',
  texto: '#EAF1EC',
  textoSuave: '#A9B8AE',
  borde: '#2C3A31',
  primario: '#66BB6A',
  sobrePrimario: '#0E1511',
  error: '#FF8A80',
  libre: '#66BB6A',
  ocupado: '#FF8A80',
  fijo: '#CE93D8',
  mantenimiento: '#FFB74D',
};

export function useTema() {
  return useColorScheme() === 'dark' ? oscuro : claro;
}

/** Tamaños pensados para gente grande: letra y botones grandes. */
export const tamanos = {
  texto: 17,
  titulo: 24,
  boton: 56, // alto mínimo de un botón
};
