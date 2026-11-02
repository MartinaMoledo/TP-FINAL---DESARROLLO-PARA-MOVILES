// Colores claros y oscuros. Se leen de acá, nunca a mano en cada pantalla.
// La paleta sale de la placa de identidad del grupo:
// negro, verde menta, verde oscuro, naranja y amarillo.
import { useColorScheme } from 'react-native';

/** Colores de marca. Se usan para íconos, splash y detalles visuales. */
export const paleta = {
  negro: '#000000',
  menta: '#28E8A0',
  verdeOscuro: '#106048',
  naranja: '#C06020',
  amarillo: '#F0E038',
  blanco: '#FFFFFF',
} as const;

const claro = {
  fondo: '#F2F9F5',
  tarjeta: '#FFFFFF',
  texto: '#08150F',
  textoSuave: '#4B6156',
  borde: '#CFE3D8',
  // Botones y enlaces: verde oscuro para que el blanco tenga buen contraste.
  primario: '#106048',
  sobrePrimario: '#FFFFFF',
  // El menta es un color de marca muy claro: va sobre fondo oscuro o como relleno.
  acento: '#28E8A0',
  sobreAcento: '#00281B',
  advertencia: '#C06020',
  error: '#B3261E',
  sobreError: '#FFFFFF',
  libre: '#106048',
  ocupado: '#B3261E',
  fijo: '#5B2A86',
  mantenimiento: '#A34F19',
};

const oscuro: typeof claro = {
  fondo: '#000000',
  tarjeta: '#0D1A13',
  texto: '#EAFBF3',
  textoSuave: '#A2B9AC',
  borde: '#223B2E',
  // En oscuro el menta brilla y el texto va en verde muy oscuro.
  primario: '#28E8A0',
  sobrePrimario: '#00281B',
  acento: '#28E8A0',
  sobreAcento: '#00281B',
  advertencia: '#F0E038',
  error: '#FF8A80',
  sobreError: '#3A0A06',
  libre: '#28E8A0',
  ocupado: '#FF8A80',
  fijo: '#D0A2F5',
  mantenimiento: '#FFB870',
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
