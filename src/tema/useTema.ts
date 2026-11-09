// Colores claros y oscuros de toda la app. La identidad es la de Activá Villaguay:
// los colores de marca salen de `marca.ts` y acá se traducen a roles semánticos.
import { useColorScheme } from 'react-native';

import { identidad } from './marca';

/** Colores de marca. Se usan para íconos, splash y detalles visuales. */
export const paleta = {
  negro: identidad.negro,
  menta: identidad.menta,
  verdeOscuro: identidad.verde,
  naranja: identidad.naranja,
  amarillo: identidad.amarillo,
  blanco: identidad.blanco,
} as const;

type ColoresTema = {
  fondo: string;
  tarjeta: string;
  texto: string;
  textoSuave: string;
  borde: string;
  primario: string;
  sobrePrimario: string;
  acento: string;
  sobreAcento: string;
  advertencia: string;
  error: string;
  sobreError: string;
  libre: string;
  ocupado: string;
  fijo: string;
  mantenimiento: string;
};

const claro: ColoresTema = {
  // La hoja gris y las tarjetas blancas son la base del mockup de Julieta.
  fondo: '#EEEEEE',
  tarjeta: identidad.blanco,
  texto: '#1F1F1F',
  textoSuave: '#8A8A8A',
  borde: '#D9D9D9',
  // Botones y enlaces: verde de la identidad para que el blanco tenga buen contraste.
  primario: identidad.verde,
  sobrePrimario: identidad.blanco,
  // El menta es un color de marca muy claro: va sobre fondo oscuro o como relleno.
  acento: identidad.menta,
  sobreAcento: '#00281B',
  advertencia: identidad.naranja,
  error: '#B3261E',
  sobreError: identidad.blanco,
  libre: identidad.verde,
  ocupado: '#B3261E',
  fijo: '#5B2A86',
  mantenimiento: '#A34F19',
};

const oscuro: ColoresTema = {
  fondo: '#051A13',
  tarjeta: '#0B221A',
  texto: '#F2F2F2',
  textoSuave: '#9DB0A7',
  borde: '#313131',
  // En oscuro el menta brilla y el texto va en verde muy oscuro.
  primario: identidad.menta,
  sobrePrimario: '#00281B',
  acento: identidad.menta,
  sobreAcento: '#00281B',
  advertencia: identidad.amarillo,
  error: '#FF8A80',
  sobreError: '#3A0A06',
  libre: identidad.menta,
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
