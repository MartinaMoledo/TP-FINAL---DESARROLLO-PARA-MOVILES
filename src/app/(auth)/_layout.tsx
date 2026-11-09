import { Stack } from 'expo-router';

import { useSesion } from '@/contextos/SesionContexto';
import { fuente } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export default function LayoutIngreso() {
  const t = useTema();
  const { usuario } = useSesion();

  // Si ya hay sesión, la guardia del layout raíz redirige a la zona que corresponde.
  if (usuario) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.tarjeta },
        headerTintColor: t.texto,
        headerTitleStyle: { fontFamily: fuente.seminegrita },
        headerBackTitleStyle: { fontFamily: fuente.media },
        contentStyle: { backgroundColor: t.fondo },
        headerBackTitle: 'Volver',
      }}
    >
      <Stack.Screen name="ingreso" options={{ title: 'Ingresar' }} />
      <Stack.Screen name="registro" options={{ title: 'Crear cuenta' }} />
    </Stack>
  );
}
