
import type { VideoSource } from 'expo-video';

const VIDEOS_ESPACIOS: Record<string, VideoSource> = {
  'esp-01': require('../../assets/videos/futbol5_cancha1.mp4'),
  'esp-02': require('../../assets/videos/futbol5_cancha2.mp4'),
  'esp-03': require('../../assets/videos/futbol11_cancha1.mp4'),
  'esp-04': require('../../assets/videos/basquet_cancha1.mp4'),
  'esp-05': require('../../assets/videos/basquet_cancha2.mp4'),
  'esp-06': require('../../assets/videos/basquet_cancha3.mp4'),
  'esp-07': require('../../assets/videos/voley_cancha1.mp4'),
  'esp-08': require('../../assets/videos/voley_cancha2.mp4'),
  'esp-09': require('../../assets/videos/tenis_cancha1.mp4'),
  'esp-10': require('../../assets/videos/tenis_cancha2.mp4'),
  'esp-11': require('../../assets/videos/gimnasio_1.mp4'),
};

export function videoDeEspacio(id: string): VideoSource | null {
  return VIDEOS_ESPACIOS[id] ?? null;
}
