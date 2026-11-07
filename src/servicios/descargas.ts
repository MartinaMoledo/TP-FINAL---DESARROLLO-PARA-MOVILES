// "Guardar para ver sin datos": descarga las fotos y el video de un espacio al teléfono
// con la API nueva de expo-file-system (File, Directory, Paths) y las vuelve a leer de ahí.
//
// Estructura en el teléfono (Paths.document no lo borra el sistema):
//   espacios/<id>/foto-0.jpg, foto-1.jpg, video.mp4   <- lo que se descarga y se puede borrar
//   espacios/<id>/subidas/foto-<fecha>.jpg            <- fotos que subió la persona desde la galería
import { Directory, File, Paths } from 'expo-file-system';

import type { Espacio } from '@/tipos';
import { ErrorApi } from './cliente';

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
    return espacio.imagenes.length > 0 || espacio.videoUrl !== null;
  },

  /** Lo que ya está descargado de un espacio (vacío si no se descargó nada). */
  leer(espacioId: string): ArchivosLocales {
    const archivos = archivosDe(carpetaDe(espacioId));
    const fotos = archivos
      .filter((a) => a.name.startsWith('foto-'))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a) => a.uri);
    const video = archivos.find((a) => a.name.startsWith('video.'))?.uri ?? null;
    return { fotos, video };
  },

  estaDescargado(espacioId: string): boolean {
    const { fotos, video } = this.leer(espacioId);
    return fotos.length > 0 || video !== null;
  },

  /** Descarga fotos y video. `onProgreso` recibe un número de 0 a 1 para toda la descarga. */
  async descargar(espacio: Espacio, onProgreso?: (fraccion: number) => void): Promise<void> {
    const urls = [
      ...espacio.imagenes.map((url, i) => ({
        url,
        nombre: `foto-${i}.${extensionDe(url, 'jpg')}`,
      })),
      ...(espacio.videoUrl
        ? [{ url: espacio.videoUrl, nombre: `video.${extensionDe(espacio.videoUrl, 'mp4')}` }]
        : []),
    ];

    if (urls.length === 0) {
      throw new ErrorApi('SIN_ARCHIVOS', 'Este espacio no tiene fotos ni video para guardar.');
    }

    const carpeta = carpetaDe(espacio.id);
    carpeta.create({ intermediates: true, idempotent: true });

    try {
      for (let i = 0; i < urls.length; i++) {
        const { url, nombre } = urls[i];
        await File.downloadFileAsync(url, new File(carpeta, nombre), {
          idempotent: true,
          onProgress: ({ bytesWritten, totalBytes }) => {
            const parcial = totalBytes > 0 ? bytesWritten / totalBytes : 0;
            onProgreso?.((i + parcial) / urls.length);
          },
        });
        onProgreso?.((i + 1) / urls.length);
      }
    } catch {
      // Un archivo a medias no sirve: se borra todo lo descargado para no mostrar fotos rotas.
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
