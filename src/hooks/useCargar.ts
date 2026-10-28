// Carga datos de un servicio y devuelve los tres estados que pide la consigna:
// cargando, error y (lo vacío lo decide la pantalla mirando los datos).
import { useCallback, useEffect, useState } from 'react';
import { ErrorApi } from '@/servicios/cliente';

export function useCargar<T>(cargar: () => Promise<T>, dependencias: unknown[] = []) {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<ErrorApi | null>(null);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setDatos(await cargar());
    } catch (e) {
      setError(e instanceof ErrorApi ? e : new ErrorApi('ERROR_DESCONOCIDO', 'Algo salió mal.'));
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { datos, cargando, error, recargar };
}
