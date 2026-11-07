// Identidad de Activá Villaguay para las pantallas de espacios, ficha y mapa.
// Los colores salen de la placa de identidad (hex exactos) y el comportamiento de las
// tarjetas sale del mockup: en claro las tarjetas libres son verdes, en oscuro naranjas.
import { useColorScheme } from 'react-native';

export const identidad = {
  menta: '#29EAA3',
  negro: '#000000',
  naranja: '#C4611C',
  amarillo: '#F0DC34',
  verde: '#136446',
  blanco: '#FFFFFF',
} as const;

type ColoresMarca = {
  // Pantalla de espacios: franja superior y hoja redondeada
  tope: string;
  saludo: string;
  hoja: string;
  pie: string;
  botonModoFondo: string;
  botonModoIcono: string;
  pildoraFecha: string;
  pildoraTexto: string;
  pildoraIconoFondo: string;
  pildoraIcono: string;
  // Tarjeta con turnos libres
  tarjetaLibre: string;
  textoLibre: string;
  etiquetaLibreFondo: string;
  etiquetaLibreTexto: string;
  flechaLibreFondo: string;
  flechaLibreIcono: string;
  // Tarjeta sin turnos libres
  tarjetaLlena: string;
  textoLlena: string;
  etiquetaLlenaFondo: string;
  etiquetaLlenaTexto: string;
  flechaLlenaFondo: string;
  flechaLlenaIcono: string;
  // Chips de deporte
  chipFondo: string;
  chipTexto: string;
  chipActivoFondo: string;
  chipActivoTexto: string;
  chipActivoBorde: string;
  // Botones grises de complejo
  grisFondo: string;
  grisTexto: string;
  grisActivoFondo: string;
  grisActivoTexto: string;
  // Calendario
  calendarioFondo: string;
  calendarioTexto: string;
  calendarioApagado: string;
  calendarioSemana: string;
};

// Valores medidos sobre el mockup de la identidad (modo claro, a la izquierda).
const claro: ColoresMarca = {
  tope: identidad.blanco,
  saludo: identidad.verde,
  hoja: '#EEEEEE',
  pie: '#A9A9A9',
  botonModoFondo: identidad.menta,
  botonModoIcono: identidad.verde,
  pildoraFecha: '#D9D9D9',
  pildoraTexto: identidad.verde,
  pildoraIconoFondo: identidad.menta,
  pildoraIcono: identidad.verde,
  tarjetaLibre: identidad.verde,
  textoLibre: identidad.blanco,
  etiquetaLibreFondo: identidad.menta,
  etiquetaLibreTexto: '#00281B',
  flechaLibreFondo: identidad.menta,
  flechaLibreIcono: '#00281B',
  tarjetaLlena: '#9A9A9A',
  textoLlena: identidad.blanco,
  etiquetaLlenaFondo: identidad.negro,
  etiquetaLlenaTexto: identidad.blanco,
  flechaLlenaFondo: identidad.negro,
  flechaLlenaIcono: identidad.blanco,
  chipFondo: '#2B2B2B',
  chipTexto: identidad.blanco,
  chipActivoFondo: identidad.blanco,
  chipActivoTexto: '#2B2B2B',
  chipActivoBorde: '#2B2B2B',
  grisFondo: '#DADADA',
  grisTexto: '#2B2B2B',
  grisActivoFondo: '#4A4A4A',
  grisActivoTexto: identidad.blanco,
  calendarioFondo: identidad.blanco,
  calendarioTexto: '#1F1F1F',
  calendarioApagado: '#BDBDBD',
  calendarioSemana: '#8A8A8A',
};

// Modo oscuro del mockup (a la derecha).
const oscuro: ColoresMarca = {
  tope: identidad.verde,
  saludo: identidad.blanco,
  hoja: '#051A13',
  pie: identidad.blanco,
  botonModoFondo: identidad.menta,
  botonModoIcono: identidad.verde,
  pildoraFecha: '#313131',
  pildoraTexto: identidad.blanco,
  pildoraIconoFondo: '#555555',
  pildoraIcono: '#D8D8D8',
  tarjetaLibre: identidad.naranja,
  textoLibre: identidad.blanco,
  etiquetaLibreFondo: identidad.blanco,
  etiquetaLibreTexto: identidad.negro,
  flechaLibreFondo: identidad.negro,
  flechaLibreIcono: identidad.blanco,
  tarjetaLlena: '#313131',
  textoLlena: identidad.blanco,
  etiquetaLlenaFondo: '#7A7A7A',
  etiquetaLlenaTexto: '#141414',
  flechaLlenaFondo: '#4A4A4A',
  flechaLlenaIcono: '#BDBDBD',
  chipFondo: identidad.blanco,
  chipTexto: identidad.negro,
  chipActivoFondo: identidad.naranja,
  chipActivoTexto: identidad.blanco,
  chipActivoBorde: identidad.naranja,
  grisFondo: '#2A2A2A',
  grisTexto: '#D0D0D0',
  grisActivoFondo: '#EAEAEA',
  grisActivoTexto: identidad.negro,
  calendarioFondo: '#0B221A',
  calendarioTexto: '#F2F2F2',
  calendarioApagado: '#5C6B64',
  calendarioSemana: '#9DB0A7',
};

export function useMarca() {
  return useColorScheme() === 'dark' ? oscuro : claro;
}
