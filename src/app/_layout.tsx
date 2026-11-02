import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { esPersonal, ProveedorSesion, useSesion } from '@/contextos/SesionContexto';
import { useTema } from '@/tema/useTema';

export default function LayoutRaiz() {
  return (
    <ProveedorSesion>
      <Raiz />
    </ProveedorSesion>
  );
}

function Raiz() {
  const t = useTema();
  const { usuario, cargando } = useSesion();
  const segmentos = useSegments();

  useEffect(() => {
    if (cargando) return;

    const grupo = segmentos[0];
    const pantalla = segmentos[1];
    const enAuth = grupo === '(auth)';

    // Con sesión abierta no tiene sentido quedarse en las pantallas de ingreso.
    if (usuario && enAuth) {
      router.replace(esPersonal(usuario) ? '/(tabs)/agenda' : '/(tabs)');
      return;
    }

    // Encargados y administradores trabajan en la zona del personal.
    if (esPersonal(usuario)) {
      const zonaJugador =
        grupo === '(tabs)' &&
        (pantalla === undefined || pantalla === 'reservas');
      if (zonaJugador) router.replace('/(tabs)/agenda');
      return;
    }

    // Jugadores y anónimos no entran a agenda, reservas del día ni escaneo.
    const zonaPersonal =
      grupo === '(tabs)' &&
      (pantalla === 'agenda' || pantalla === 'reservas-dia' || pantalla === 'escanear');
    if (zonaPersonal) {
      router.replace(usuario ? '/(tabs)' : '/(auth)/ingreso');
    }
  }, [cargando, usuario, segmentos]);

  if (cargando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.fondo }}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color={t.primario} />
      </View>
    );
  }

  return (
    <>
      {/* `auto` cambia los íconos de la barra de estado según el tema del sistema. */}
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.tarjeta },
          headerTintColor: t.texto,
          contentStyle: { backgroundColor: t.fondo },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="espacio/[id]" options={{ title: 'Espacio' }} />
      </Stack>
    </>
  );
}
