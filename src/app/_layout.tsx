import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AvisoDeRed } from '@/components/AvisoDeRed';
import { LogoEncabezado } from '@/components/LogoEncabezado';
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

  // Sin sesión no hay nada que bloquear. Se ajusta en el mismo render, como
  // recomienda React, para no disparar un efecto que vuelva a renderizar.
  if (!cargando && !usuario && bloqueada) setBloqueada(false);

  useEffect(() => {
    if (usuario) void revisarAvisos(usuario);
  }, [usuario]);

  useEffect(() => {
    if (cargando) return;

    const grupo = segmentos[0];
    const pantalla = segmentos.length > 1 ? [...segmentos][1] : undefined;
    const enAuth = grupo === '(auth)';

    // Con sesión abierta no tiene sentido quedarse en las pantallas de ingreso.
    // El jugador vuelve a donde estaba (por ejemplo, la grilla para terminar la reserva);
    // el personal va a su Agenda.
    if (usuario && enAuth) {
      if (esPersonal(usuario)) router.replace('/(tabs)/agenda');
      else if (router.canGoBack()) router.back();
      else router.replace('/(tabs)');
      return;
    }

    // Encargados y administradores trabajan en la zona del personal: Espacios y "Mis reservas"
    // son del jugador. Al abrir la app caen en Espacios (la ruta inicial), así que van a la Agenda.
    if (esPersonal(usuario)) {
      const zonaJugador = grupo === '(tabs)' && (pantalla === undefined || pantalla === 'reservas');
      if (zonaJugador) router.replace('/(tabs)/agenda');
      return;
    }

    // Jugadores y anónimos no entran a la agenda, el escaneo ni el panel.
    const pantallasDelPersonal = ['agenda', 'escanear', 'panel'];
    const zonaPersonal =
      grupo === '(tabs)' &&
      pantalla !== undefined &&
      pantallasDelPersonal.includes(pantalla);
    // Sin cuenta, o con cuenta de jugador, se vuelve a Espacios: mirar no pide cuenta (PRD).
    // La cuenta se pide recién al reservar o marcar un favorito.
    if (zonaPersonal) {
      router.replace('/(tabs)');
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
            // Logo de la marca centrado en todas las pantallas con encabezado.
            headerTitleAlign: 'center',
            headerTitle: () => <LogoEncabezado />,
            contentStyle: { backgroundColor: t.fondo },
            // Sin esto, el botón de volver muestra el nombre interno de la ruta: "(tabs)".
            headerBackTitle: 'Volver',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="espacio/[id]" options={{ title: 'Espacio' }} />
          <Stack.Screen name="cuenta" options={{ title: 'Tu cuenta' }} />
        </Stack>
        {/* Tapa toda la app hasta que la persona confirme que es ella. */}
        {usuario && bloqueada && (
          <PantallaBloqueo alDesbloquear={() => setBloqueada(false)} />
        )}
      </View>
    </View>
  );
}
