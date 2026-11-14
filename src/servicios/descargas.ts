// "Guardar para ver sin datos": guarda las fotos y el video de un espacio en el teléfono
// con la API nueva de expo-file-system (File, Directory, Paths) y los vuelve a leer de ahí.
// Si el espacio tiene foto o video en el proyecto (assets/canchas y assets/videos), se copian
// esos; si no, se descargan los de la API.
//
// Estructura en el teléfono (Paths.document no lo borra el sistema):
//   espacios/<id>/foto-0.jpg, foto-1.jpg, video.mp4   <- lo que se descarga y se puede borrar
//   espacios/<id>/subidas/foto-<fecha>.jpg            <- fotos que subió la persona desde la galería
import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';

import type { Espacio } from '@/tipos';
import { moduloFotoDeEspacio } from '@/utilidades/fotosEspacio';
import { moduloVideoDeEspacio } from '@/utilidades/videosEspacio';
import { ErrorApi } from './cliente';

// Nombres de las copias de la foto y el video del proyecto. Son distintos de los que usaba la
// descarga de la API (foto-0.jpg, video.mp4...), así se reconocen las copias viejas.
const FOTO_PROYECTO = 'foto-cancha.png';
const VIDEO_PROYECTO = 'video-cancha.mp4';

/** Algo para guardar: un archivo del proyecto (modulo) o una URL de la API. */
type Fuente = { nombre: string; modulo?: number; url?: string };

export type ArchivosLocales = {
  fotos: string[];
  video: string | null;
};

function carpetaDe(espacioId: string): Directory {
  return new Directory(Paths.document, 'espacios', espacioId);
}

function carpetaDeSubidas(espacioId: string): Directory {
  return new Directory(carpetaDe(espacioId), 'subidas');
}

/** Extensión de una URL ("foto.jpg?x=1" -> "jpg"), o la que se pase por defecto. */
function extensionDe(url: string, porDefecto: string): string {
  const sinQuery = url.split('?')[0];
  const coincidencia = /\.([a-zA-Z0-9]{2,4})$/.exec(sinQuery);
  return coincidencia ? coincidencia[1].toLowerCase() : porDefecto;
}

function archivosDe(carpeta: Directory): File[] {
  if (!carpeta.exists) return [];
  return carpeta.list().filter((item): item is File => item instanceof File);
}

export const descargasServicio = {
  /** ¿Tiene fotos o video para guardar? Si no, el botón de descarga no tiene nada que hacer. */
  hayParaDescargar(espacio: Espacio): boolean {
    return descargasServicio.fuentesDe(espacio).length > 0;
  },

  /** Qué se guarda de cada espacio: primero la foto y el video del proyecto; si no hay, los de la API. */
  fuentesDe(espacio: Espacio): Fuente[] {
    const fuentes: Fuente[] = [];

    const foto = moduloFotoDeEspacio(espacio.id);
    if (foto !== null) {
      fuentes.push({ nombre: FOTO_PROYECTO, modulo: foto });
    } else {
      espacio.imagenes.forEach((url, i) =>
        fuentes.push({ nombre: `foto-${i}.${extensionDe(url, 'jpg')}`, url }),
      );
    }

    const video = moduloVideoDeEspacio(espacio.id);
    if (video !== null) {
      fuentes.push({ nombre: VIDEO_PROYECTO, modulo: video });
    } else if (espacio.videoUrl) {
      fuentes.push({ nombre: `video.${extensionDe(espacio.videoUrl, 'mp4')}`, url: espacio.videoUrl });
    }

    return fuentes;
  },

  /** Lo que ya está descargado de un espacio (vacío si no se descargó nada). */
  leer(espacioId: string): ArchivosLocales {
    descargasServicio.limpiarCopiasViejas(espacioId);
    const archivos = archivosDe(carpetaDe(espacioId));
    const fotos = archivos
      .filter((a) => a.name.startsWith('foto-'))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a) => a.uri);
    const video = archivos.find((a) => a.name.startsWith('video'))?.uri ?? null;
    return { fotos, video };
  },

  /**
   * Si el espacio tiene foto o video en el proyecto, borra las copias guardadas antes de la API
   * (los dibujos de cancha), para que no tapen las fotos reales.
   */
  limpiarCopiasViejas(espacioId: string): void {
    const hayFoto = moduloFotoDeEspacio(espacioId) !== null;
    const hayVideo = moduloVideoDeEspacio(espacioId) !== null;
    for (const archivo of archivosDe(carpetaDe(espacioId))) {
      const fotoVieja = hayFoto && archivo.name.startsWith('foto-') && archivo.name !== FOTO_PROYECTO;
      const videoViejo = hayVideo && archivo.name.startsWith('video') && archivo.name !== VIDEO_PROYECTO;
      if (fotoVieja || videoViejo) archivo.delete();
    }
  },

  estaDescargado(espacioId: string): boolean {
    const { fotos, video } = this.leer(espacioId);
    return fotos.length > 0 || video !== null;
  },

  /** Guarda fotos y video. `onProgreso` recibe un número de 0 a 1 para todo el guardado. */
  async descargar(espacio: Espacio, onProgreso?: (fraccion: number) => void): Promise<void> {
    const fuentes = descargasServicio.fuentesDe(espacio);

    if (fuentes.length === 0) {
      throw new ErrorApi('SIN_ARCHIVOS', 'Este espacio no tiene fotos ni video para guardar.');
    }

    const carpeta = carpetaDe(espacio.id);
    carpeta.create({ intermediates: true, idempotent: true });
    // Se empieza de cero: así no quedan mezcladas copias viejas (por ejemplo, las de la API).
    descargasServicio.borrar(espacio.id);

    try {
      for (let i = 0; i < fuentes.length; i++) {
        const { nombre, modulo, url } = fuentes[i];
        const destino = new File(carpeta, nombre);

        if (modulo !== undefined) {
          // Archivo del proyecto: Asset lo deja disponible en el teléfono y después se copia
          // a nuestra carpeta, que el sistema no borra (la de Asset es caché).
          const asset = Asset.fromModule(modulo);
          await asset.downloadAsync();
          if (!asset.localUri) throw new Error('Sin archivo local');
          new File(asset.localUri).copy(destino);
        } else if (url) {
          await File.downloadFileAsync(url, destino, {
            idempotent: true,
            onProgress: ({ bytesWritten, totalBytes }) => {
              const parcial = totalBytes > 0 ? bytesWritten / totalBytes : 0;
              onProgreso?.((i + parcial) / fuentes.length);
            },
          });
        }
        onProgreso?.((i + 1) / fuentes.length);
      }
    } catch {
      // Un archivo a medias no sirve: se borra todo lo guardado para no mostrar fotos rotas.
      descargasServicio.borrar(espacio.id);
      throw new ErrorApi(
        'DESCARGA_FALLIDA',
        'No pudimos guardar los archivos. Revisá tu conexión e intentá de nuevo.',
      );
    }
  },

  /** Borra fotos y video descargados. Las fotos que subió la persona se conservan. */
  borrar(espacioId: string): void {
    for (const archivo of archivosDe(carpetaDe(espacioId))) {
      archivo.delete();
    }
  },

  /** Fotos del estado de la cancha que se subieron desde la galería (solo en este teléfono). */
  fotosSubidas(espacioId: string): string[] {
    return archivosDe(carpetaDeSubidas(espacioId))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a) => a.uri);
  },

  /** Copia una foto elegida de la galería a la carpeta del espacio y devuelve su ruta. */
  async guardarFotoSubida(espacioId: string, uriOrigen: string): Promise<string> {
    const carpeta = carpetaDeSubidas(espacioId);
    carpeta.create({ intermediates: true, idempotent: true });

    const destino = new File(carpeta, `foto-${Date.now()}.${extensionDe(uriOrigen, 'jpg')}`);
    await new File(uriOrigen).copy(destino);
    return destino.uri;
  },
};
