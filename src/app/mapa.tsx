// Mapa de complejos: un marcador por complejo y cuál queda más cerca.
// Si se niega la ubicación, el mapa se muestra centrado en Villaguay y todo sigue andando.
import Ionicons from '@react-native-vector-icons/ionicons';
import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Boton } from '@/components/Boton';
import { EstadoPantalla } from '@/components/EstadoPantalla';
import { Etiqueta } from '@/components/Etiqueta';
import { Tarjeta } from '@/components/Tarjeta';
import { useCargar } from '@/hooks/useCargar';
import { espaciosServicio } from '@/servicios/espacios';
import { identidad } from '@/tema/marca';
import { fuente } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import type { Coordenadas, Espacio } from '@/tipos';
import { distanciaKm } from '@/utilidades/distancia';
import { abrirComoLlegar } from '@/utilidades/mapas';
import { complejoDe } from '@/utilidades/complejo';

// Centro de Villaguay: el mapa arranca acá si no hay permiso de ubicación.
const VILLAGUAY: Coordenadas = { latitud: -31.8667, longitud: -59.0333 };

type Complejo = {
  nombre: string;
  coordenadas: Coordenadas;
  espacios: number;
};

/**
 * Un complejo por nombre, ubicado en el promedio de las coordenadas de sus espacios.
 * Si la API no sabe el complejo ("—"), ese espacio va solo, con su propio nombre y lugar:
 * promediar espacios que están en lugares distintos daría un punto que no existe.
 */
function agruparComplejos(espacios: Espacio[]): Complejo[] {
  const porNombre = new Map<string, Espacio[]>();
  for (const e of espacios) {
    const clave = complejoDe(e) ?? e.nombre;
    porNombre.set(clave, [...(porNombre.get(clave) ?? []), e]);
  }
  return [...porNombre.entries()].map(([nombre, lista]) => ({
    nombre,
    espacios: lista.length,
    coordenadas: {
      latitud: lista.reduce((suma, e) => suma + e.coordenadas.latitud, 0) / lista.length,
      longitud: lista.reduce((suma, e) => suma + e.coordenadas.longitud, 0) / lista.length,
    },
  }));
}

type Permiso = 'pendiente' | 'concedido' | 'denegado';

export default function MapaPantalla() {
  const t = useTema();
  const mapa = useRef<MapView>(null);
  const [permiso, setPermiso] = useState<Permiso>('pendiente');
  const [ubicacion, setUbicacion] = useState<Coordenadas | null>(null);

  const { datos, cargando, error, recargar } = useCargar(() => espaciosServicio.listar());
  const complejos = useMemo(() => agruparComplejos(datos ?? []), [datos]);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!activo) return;
        if (status !== 'granted') {
          setPermiso('denegado');
          return;
        }
        setPermiso('concedido');
        const posicion = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (activo) {
          setUbicacion({
            latitud: posicion.coords.latitude,
            longitud: posicion.coords.longitude,
          });
        }
      } catch {
        // Sin GPS o sin señal: el mapa sigue andando, solo que sin "más cerca".
        if (activo) setPermiso((actual) => (actual === 'pendiente' ? 'denegado' : actual));
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const masCerca = useMemo(() => {
    if (!ubicacion || complejos.length === 0) return null;
    return complejos.reduce((mejor, c) =>
      distanciaKm(ubicacion, c.coordenadas) < distanciaKm(ubicacion, mejor.coordenadas) ? c : mejor,
    );
  }, [ubicacion, complejos]);

  function ajustarMapa() {
    if (complejos.length === 0) return;
    const puntos = complejos.map((c) => ({
      latitude: c.coordenadas.latitud,
      longitude: c.coordenadas.longitud,
    }));
    mapa.current?.fitToCoordinates(puntos, {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
      animated: false,
    });
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <Stack.Screen options={{ title: 'Complejos deportivos' }} />

      <EstadoPantalla
        cargando={cargando && !datos}
        error={error}
        vacio={!!datos && complejos.length === 0}
        mensajeVacio="Todavía no hay complejos cargados."
        onReintentar={recargar}
      >
        <MapView
          ref={mapa}
          style={estilos.mapa}
          showsUserLocation={permiso === 'concedido'}
          onMapReady={ajustarMapa}
          initialRegion={{
            latitude: VILLAGUAY.latitud,
            longitude: VILLAGUAY.longitud,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
          }}
        >
          {complejos.map((c) => (
            <Marker
              key={c.nombre}
              coordinate={{ latitude: c.coordenadas.latitud, longitude: c.coordenadas.longitud }}
              title={c.nombre}
              description={`${c.espacios} ${c.espacios === 1 ? 'espacio' : 'espacios'}`}
              pinColor={c.nombre === masCerca?.nombre ? identidad.verde : identidad.naranja}
            />
          ))}
        </MapView>

        <ScrollView style={estilos.panel} contentContainerStyle={estilos.panelContenido}>
          {permiso === 'denegado' && (
            <Tarjeta>
              <Text style={[estilos.texto, { color: t.texto }]}>
                No usamos tu ubicación, así que el mapa muestra Villaguay. Si querés saber qué
                complejo te queda más cerca, activá el permiso.
              </Text>
              <Boton
                titulo="Abrir ajustes"
                variante="secundario"
                onPress={() => Linking.openSettings()}
              />
            </Tarjeta>
          )}

          {permiso === 'concedido' && !ubicacion && (
            <Text style={[estilos.texto, { color: t.textoSuave }]}>Buscando tu ubicación…</Text>
          )}

          {complejos.map((c) => {
            const esMasCerca = c.nombre === masCerca?.nombre;
            const km = ubicacion ? distanciaKm(ubicacion, c.coordenadas) : null;
            return (
              <Tarjeta key={c.nombre}>
                <View style={estilos.fila}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[estilos.nombre, { color: t.texto }]}>{c.nombre}</Text>
                    <Text style={[estilos.texto, { color: t.textoSuave }]}>
                      {c.espacios} {c.espacios === 1 ? 'espacio' : 'espacios'}
                      {km !== null ? ` · a ${km.toFixed(1).replace('.', ',')} km` : ''}
                    </Text>
                  </View>
                  {esMasCerca && <Etiqueta texto="Más cerca" tono="exito" />}
                </View>
                <Boton
                  titulo="Cómo llegar"
                  variante="secundario"
                  icono={<Ionicons name="navigate-outline" size={22} color={t.texto} />}
                  onPress={() => abrirComoLlegar(c.coordenadas, c.nombre)}
                />
              </Tarjeta>
            );
          })}
        </ScrollView>
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  mapa: { flex: 1 },
  panel: { maxHeight: '45%' },
  panelContenido: { padding: 16, gap: 12 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nombre: { fontSize: 20, fontFamily: fuente.negrita },
  texto: { fontFamily: fuente.regular, fontSize: 16, lineHeight: 22 },
});
