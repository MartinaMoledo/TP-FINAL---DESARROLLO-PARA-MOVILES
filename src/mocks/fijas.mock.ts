// Reservas fijas: ocupan el mismo turno todas las semanas. 0 = domingo, 2 = martes.
import type { ReservaFija } from '@/tipos';

export const FIJAS_MOCK: ReservaFija[] = [
  {
    id: 'fij-07', espacioId: 'esp-02', titular: 'Grupo de los martes',
    dia: 2, inicio: '21:00', fin: '22:00', desde: '2026-03-01', hasta: null, activa: true,
  },
  {
    id: 'fij-08', espacioId: 'esp-03', titular: 'Club Atlético (entrenamiento)',
    dia: 4, inicio: '19:00', fin: '21:00', desde: '2026-03-01', hasta: null, activa: true,
  },
];
