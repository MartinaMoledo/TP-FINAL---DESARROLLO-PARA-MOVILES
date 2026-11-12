import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AvisoDeRed } from '@/components/AvisoDeRed';
import { PantallaBloqueo } from '@/components/PantallaBloqueo';
import {
  esPersonal,
  ProveedorSesion,
  useSesion,
} from '@/contextos/SesionContexto';
import { revisarAvisos } from '@/servicios/avisos';
import { restaurarModo } from '@/tema/modo';
import { fuente, FUENTES } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { reservasServicio } from '@/servicios/reservas';

export default function LayoutRaiz() {
  // Vuelve a poner el modo claro/oscuro que se eligió la última vez.
  useEffect(() => {
    restaurarModo();
  }, []);

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
  // Tipografía Raleway. Si fallara la carga, la app sigue con la fuente del sistema.
  const [fuentesListas, errorFuentes] = useFonts(FUENTES);
  const [bloqueada, setBloqueada] = useState(true);

  useEffect(() => {
    if (!cargando && !usuario) setBloqueada(false);
  }, [cargando, usuario]);

  useEffect(() => {
    if (usuario) void revisarAvisos(usuario);
  }, [usuario]);

  useEffect(() => {
    if (cargando) return;

    const grupo = segmentos[0];
    const pantalla = segmentos.length > 1 ? [...segmentos][1] : undefined;
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

    // Jugadores y anónimos no entran a agenda, reservas del día, escaneo ni panel.
    const pantallasDelPersonal = [
      'agenda',
      'reservas-dia',
      'escanear',
      'panel',
    ];
    const zonaPersonal =
      grupo === '(tabs)' &&
      pantalla !== undefined &&
      pantallasDelPersonal.includes(pantalla);
    if (zonaPersonal) {
      router.replace(usuario ? '/(tabs)' : '/(auth)/ingreso');
    }
  }, [cargando, usuario, segmentos]);

  if (cargando || (!fuentesListas && !errorFuentes)) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.fondo,
        }}
      >
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color={t.primario} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* `auto` cambia los íconos de la barra de estado según el tema del sistema. */}
      <StatusBar style="auto" />
      <AvisoDeRed />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: t.tarjeta },
            headerTintColor: t.texto,
            headerTitleStyle: { fontFamily: fuente.seminegrita },
            contentStyle: { backgroundColor: t.fondo },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="espacio/[id]" options={{ title: 'Espacio' }} />
        </Stack>
        {/* Tapa toda la app hasta que la persona confirme que es ella. */}
        {usuario && bloqueada && (
          <PantallaBloqueo alDesbloquear={() => setBloqueada(false)} />
        )}
      </View>
    </View>
  );
}
