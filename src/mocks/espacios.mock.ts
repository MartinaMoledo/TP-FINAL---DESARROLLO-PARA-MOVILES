// Datos inventados. Incluyen casos feos: un espacio sin video y uno dado de baja.
import type { Espacio } from '@/tipos';

export const ESPACIOS_MOCK: Espacio[] = [
  {
    id: 'esp-01', nombre: 'Cancha 1 — Fútbol 5', deporteId: 'dep-futbol5',
    complejo: 'Polideportivo Municipal', superficie: 'césped sintético',
    techado: false, iluminacion: true, capacidad: 10, precioPorHora: 12000,
    coordenadas: { latitud: -31.8642, longitud: -59.0281 },
    imagenes: [], videoUrl: null,
    reglas: 'No se permite calzado con tapones de aluminio.', activo: true,
  },
  {
    id: 'esp-02', nombre: 'Cancha 2 — Fútbol 5', deporteId: 'dep-futbol5',
    complejo: 'Polideportivo Municipal', superficie: 'césped sintético',
    techado: false, iluminacion: true, capacidad: 10, precioPorHora: 12000,
    coordenadas: { latitud: -31.8643, longitud: -59.0283 },
    imagenes: [], videoUrl: 'https://example.com/video-de-prueba.mp4',
    reglas: 'No se permite calzado con tapones de aluminio.', activo: true,
  },
  {
    id: 'esp-03', nombre: 'Cancha de Fútbol 11', deporteId: 'dep-futbol11',
    complejo: 'Polideportivo Municipal', superficie: 'césped natural',
    techado: false, iluminacion: false, capacidad: 22, precioPorHora: 25000,
    coordenadas: { latitud: -31.8650, longitud: -59.0290 },
    imagenes: [], videoUrl: null,
    reglas: 'Prohibido ingresar con bebidas en vidrio. Este texto es larguísimo a propósito para probar que el diseño no se rompe: se usa el mismo texto repetido una y otra vez para simular reglas muy extensas que el director puede cargar. Prohibido ingresar con bebidas en vidrio.',
    activo: true,
  },
  {
    id: 'esp-04', nombre: 'Cancha de Básquet 1', deporteId: 'dep-basquet',
    complejo: 'Gimnasio Cerrado', superficie: 'parquet',
    techado: true, iluminacion: true, capacidad: 10, precioPorHora: 9000,
    coordenadas: { latitud: -31.8601, longitud: -59.0150 },
    imagenes: [], videoUrl: null,
    reglas: 'Calzado deportivo limpio.', activo: true,
  },
  {
    id: 'esp-05', nombre: 'Cancha de Tenis 1', deporteId: 'dep-tenis',
    complejo: 'Parque Berduc', superficie: 'polvo de ladrillo',
    techado: false, iluminacion: true, capacidad: 4, precioPorHora: 6000,
    coordenadas: { latitud: -31.8700, longitud: -59.0400 },
    imagenes: [], videoUrl: null,
    reglas: 'Traer pelotas propias.', activo: true,
  },
];
