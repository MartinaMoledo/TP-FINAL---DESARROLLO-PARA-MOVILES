// Carga datos de un servicio y devuelve los tres estados que pide la consigna:
// cargando, error y (lo vacío lo decide la pantalla mirando los datos).
import { ErrorApi } from '@/servicios/cliente';
import { useCallback, useEffect, useState } from 'react';

export function useCargar<T>(cargar: () => Promise<T>, dependencias: unknown[] = []) {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<ErrorApi | null>(null);
  const [intento, setIntento] = useState(0);
  // Las dependencias se comparan por valor para poder pasarlas como array.
  const clave = JSON.stringify(dependencias);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      setCargando(true);
      setError(null);
      try {
        const resultado = await cargar();
        if (!cancelado) setDatos(resultado);
      } catch (e) {
        if (!cancelado) setError(e instanceof ErrorApi ? e : new ErrorApi('ERROR_DESCONOCIDO', 'Algo salió mal.'));
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, intento]);

  const recargar = useCallback(() => {
    setIntento((n) => n + 1);
  }, []);

  return { datos, cargando, error, recargar };
}
