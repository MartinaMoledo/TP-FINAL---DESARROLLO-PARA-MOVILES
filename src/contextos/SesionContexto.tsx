// Sesión compartida por toda la app: quién entró y qué puede ver.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { authServicio, type DatosRegistro } from '@/servicios/auth';
import type { Usuario } from '@/tipos';

type ValorSesion = {
  usuario: Usuario | null;
  cargando: boolean;
  ingresar: (email: string, contrasena: string) => Promise<Usuario>;
  registrar: (datos: DatosRegistro) => Promise<Usuario>;
  salir: () => Promise<void>;
  recargar: () => Promise<void>;
};

const ContextoSesion = createContext<ValorSesion | null>(null);

/** Encargados y administradores comparten la zona del personal. */
export function esPersonal(usuario: Usuario | null): boolean {
  return usuario?.rol === 'encargado' || usuario?.rol === 'administrador';
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    const actual = await authServicio.miUsuario();
    setUsuario(actual);
  }, []);

  useEffect(() => {
    let activo = true;

    authServicio
      .miUsuario()
      .then((actual) => {
        if (activo) setUsuario(actual);
      })
      .catch(() => {
        if (activo) setUsuario(null);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const ingresar = useCallback(async (email: string, contrasena: string) => {
    const sesion = await authServicio.ingresar(email, contrasena);
    setUsuario(sesion.usuario);
    return sesion.usuario;
  }, []);

  const registrar = useCallback(async (datos: DatosRegistro) => {
    const sesion = await authServicio.registrar(datos);
    setUsuario(sesion.usuario);
    return sesion.usuario;
  }, []);

  const salir = useCallback(async () => {
    await authServicio.salir();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, ingresar, registrar, salir, recargar }),
    [usuario, cargando, ingresar, registrar, salir, recargar]
  );

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export function useSesion(): ValorSesion {
  const contexto = useContext(ContextoSesion);
  if (!contexto) {
    throw new Error('useSesion tiene que usarse dentro de <ProveedorSesion>.');
  }
  return contexto;
}
