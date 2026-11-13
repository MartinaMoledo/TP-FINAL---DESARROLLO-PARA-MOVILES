// Ficha de un espacio: fotos, nombre y precio, Reservar, información, mapa y video.
// "Reservar" lleva a la grilla de turnos (src/app/espacio/[id].tsx).
import Ionicons from '@react-native-vector-icons/ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Boton } from '@/components/Boton';
import { EstadoPantalla } from '@/components/EstadoPantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { esPersonal, useSesion } from '@/contextos/SesionContexto';
import { useCargar } from '@/hooks/useCargar';
import { descargasServicio } from '@/servicios/descargas';
import { espaciosServicio } from '@/servicios/espacios';
import { favoritosServicio } from '@/servicios/favoritos';
import { useMarca } from '@/tema/marca';
import { fuente } from '@/tema/tipografia';
import { tamanos, useTema } from '@/tema/useTema';
import { fuentesDeFotos } from '@/utilidades/fotosEspacio';
import { abrirComoLlegar } from '@/utilidades/mapas';
import { complejoDe } from '@/utilidades/complejo';

const ALTO_FOTO = 250;

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  const t = useTema();
  return (
    <View style={estilos.dato}>
      <Text style={[estilos.datoEtiqueta, { color: t.textoSuave }]}>{etiqueta}</Text>
      <Text style={[estilos.datoValor, { color: t.texto }]}>{valor}</Text>
    </View>
  );
}

function VideoEspacio({ fuente }: { fuente: string }) {
  const t = useTema();
  const [fallo, setFallo] = useState(false);
  const player = useVideoPlayer(fuente);

  useEffect(() => {
    const suscripcion = player.addListener('statusChange', ({ status }) => {
      if (status === 'error') setFallo(true);
    });
    return () => suscripcion.remove();
  }, [player]);

  if (fallo) {
    return (
      <Text style={[estilos.texto, { color: t.error }]}>
        No pudimos reproducir el video. Revisá tu conexión o guardalo para verlo sin datos.
      </Text>
    );
  }

  return <VideoView player={player} nativeControls contentFit="contain" style={estilos.video} />;
}

export default function FichaPantalla() {
  const t = useTema();
  const m = useMarca();
  const { usuario } = useSesion();
  const { width: ancho } = useWindowDimensions();
  const { id, fecha } = useLocalSearchParams<{ id: string; fecha?: string }>();

  const { datos, cargando, error, recargar } = useCargar(async () => {
    const [espacio, deportes] = await Promise.all([
      espaciosServicio.obtener(id),
      espaciosServicio.deportes(),
    ]);
    return { espacio, deporte: deportes.find((d) => d.id === espacio.deporteId)?.nombre ?? '' };
  }, [id]);

  const [locales, setLocales] = useState(() => descargasServicio.leer(id));
  const [subidas, setSubidas] = useState(() => descargasServicio.fotosSubidas(id));
  const [progreso, setProgreso] = useState<number | null>(null);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [fotoActual, setFotoActual] = useState(0);

  useEffect(() => {
    if (!usuario) return;
    let activo = true;
    favoritosServicio
      .listar(usuario)
      .then((lista) => {
        if (activo) setFavoritos(lista);
      })
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, [usuario]);

  const espacio = datos?.espacio ?? null;
  const descargado = locales.fotos.length > 0 || locales.video !== null;
  const esFavorito = !!usuario && favoritos.includes(id);

  const fotos = useMemo(
    () => (espacio ? [...fuentesDeFotos(espacio, locales.fotos), ...subidas.map((uri) => ({ uri }))] : []),
    [espacio, locales.fotos, subidas],
  );
  const fuenteVideo = locales.video ?? espacio?.videoUrl ?? null;

  async function descargar() {
    if (!espacio) return;
    if (!descargasServicio.hayParaDescargar(espacio)) {
      Alert.alert('Nada para guardar', 'Este espacio todavía no tiene fotos ni video para guardar.');
      return;
    }
    setProgreso(0);
    try {
      await descargasServicio.descargar(espacio, setProgreso);
      setLocales(descargasServicio.leer(espacio.id));
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof Error ? e.message : 'Ocurrió un error.');
    } finally {
      setProgreso(null);
    }
  }

  function confirmarBorrado() {
    Alert.alert('Borrar lo guardado', 'Se borran las fotos y el video guardados en tu teléfono.', [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          descargasServicio.borrar(id);
          setLocales(descargasServicio.leer(id));
        },
      },
    ]);
  }

  // Las fotos del estado de la cancha son un reporte del personal: solo encargado y administrador.
  async function subirFoto() {
    if (!esPersonal(usuario)) return;

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (resultado.canceled) return;

    try {
      await descargasServicio.guardarFotoSubida(id, resultado.assets[0].uri);
      setSubidas(descargasServicio.fotosSubidas(id));
      Alert.alert('Foto guardada', 'Quedó guardada en este teléfono, al final de las fotos de esta cancha.');
    } catch {
      Alert.alert('No se pudo guardar la foto', 'Probá de nuevo con otra foto.');
    }
  }

  async function alternarFavorito() {
    if (!usuario) {
      Alert.alert('Ingresá para guardar favoritos', 'Con tu cuenta te avisamos cuando se libere un turno.', [
        { text: 'Ahora no', style: 'cancel' },
        { text: 'Ingresar', onPress: () => router.push('/(auth)/ingreso') },
      ]);
      return;
    }
    try {
      setFavoritos(await favoritosServicio.alternar(usuario, id));
    } catch {
      Alert.alert('No se pudo guardar', 'Probá de nuevo en un momento.');
    }
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <Stack.Screen options={{ title: espacio?.nombre ?? 'Espacio' }} />

      <EstadoPantalla
        cargando={cargando && !datos}
        error={error}
        vacio={!datos && !cargando && !error}
        mensajeVacio="No encontramos este espacio."
        onReintentar={recargar}
      >
        {espacio && datos && (
          <ScrollView contentContainerStyle={estilos.contenido}>
            {/* Fotos */}
            <View style={{ height: ALTO_FOTO, backgroundColor: m.tarjetaLlena }}>
              {fotos.length > 0 ? (
                <FlatList
                  data={fotos}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(_, i) => String(i)}
                  onMomentumScrollEnd={(e) =>
                    setFotoActual(Math.round(e.nativeEvent.contentOffset.x / ancho))
                  }
                  renderItem={({ item }) => (
                    <Image
                      source={item}
                      contentFit="cover"
                      transition={150}
                      accessibilityIgnoresInvertColors
                      style={{ width: ancho, height: ALTO_FOTO }}
                    />
                  )}
                />
              ) : (
                <View style={estilos.sinFoto}>
                  <Ionicons name="image-outline" size={44} color={m.textoLlena} />
                  <Text style={{ color: m.textoLlena, fontFamily: fuente.regular, fontSize: tamanos.texto }}>
                    Todavía no hay fotos
                  </Text>
                </View>
              )}

              {fotos.length > 1 && (
                <View style={estilos.contador}>
                  <Text style={estilos.textoContador}>
                    {Math.min(fotoActual + 1, fotos.length)}/{fotos.length}
                  </Text>
                </View>
              )}

              {esPersonal(usuario) && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Subir desde la galería una foto del estado de la cancha"
                  onPress={subirFoto}
                  style={[estilos.camara, { backgroundColor: t.acento }]}
                >
                  <Ionicons name="images-outline" size={24} color={t.sobreAcento} />
                </Pressable>
              )}
            </View>

            <View style={estilos.cuerpo}>
              {/* Nombre, descarga y precio */}
              <View style={estilos.nombreFila}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[estilos.titulo, { color: t.texto }]}>{espacio.nombre}</Text>
                  <Text style={[estilos.texto, { color: t.textoSuave }]}>
                    {datos.deporte}
                    {complejoDe(espacio) ? ` · ${complejoDe(espacio)}` : ''}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    descargado
                      ? 'Borrar lo guardado para ver sin datos'
                      : 'Guardar fotos y video para ver sin datos'
                  }
                  disabled={progreso !== null}
                  onPress={descargado ? confirmarBorrado : descargar}
                  style={[
                    estilos.descarga,
                    {
                      backgroundColor: descargado ? t.primario : t.tarjeta,
                      borderColor: descargado ? t.primario : t.borde,
                    },
                  ]}
                >
                  {progreso !== null ? (
                    <Text style={{ color: t.texto, fontFamily: fuente.negrita, fontSize: 13 }}>
                      {Math.round(progreso * 100)}%
                    </Text>
                  ) : (
                    <Ionicons
                      name={descargado ? 'checkmark' : 'download-outline'}
                      size={24}
                      color={descargado ? t.sobrePrimario : t.texto}
                    />
                  )}
                </Pressable>
              </View>

              <Text style={[estilos.precio, { color: t.texto }]}>
                ${espacio.precioPorHora.toLocaleString('es-AR')} / hora
              </Text>

              {/* Reservar y favorito */}
              <View style={estilos.accionesFila}>
                <Boton
                  titulo="Reservar"
                  style={{ flex: 1 }}
                  onPress={() =>
                    router.push({
                      pathname: '/espacio/[id]',
                      params: { id: espacio.id, ...(fecha ? { fecha } : {}) },
                    })
                  }
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: esFavorito }}
                  accessibilityLabel={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  onPress={alternarFavorito}
                  style={[
                    estilos.favorito,
                    { backgroundColor: t.tarjeta, borderColor: esFavorito ? t.primario : t.borde },
                  ]}
                >
                  <Ionicons
                    name={esFavorito ? 'heart' : 'heart-outline'}
                    size={26}
                    color={esFavorito ? t.primario : t.texto}
                  />
                </Pressable>
              </View>

              {/* Información */}
              <Text style={[estilos.subtitulo, { color: t.texto }]}>Información</Text>
              <Tarjeta>
                <Dato etiqueta="Superficie" valor={espacio.superficie} />
                <Dato etiqueta="Capacidad" valor={`${espacio.capacidad} personas`} />
                <Dato etiqueta="Luz para jugar de noche" valor={espacio.iluminacion ? 'Sí' : 'No'} />
                <Dato etiqueta="Techado" valor={espacio.techado ? 'Sí' : 'No'} />
              </Tarjeta>

              <Text style={[estilos.subtitulo, { color: t.texto }]}>Reglas del lugar</Text>
              <Text style={[estilos.texto, { color: t.texto }]}>{espacio.reglas}</Text>

              {/* Mapa */}
              <Text style={[estilos.subtitulo, { color: t.texto }]}>Ubicación</Text>
              {complejoDe(espacio) && (
                <Text style={[estilos.texto, { color: t.textoSuave }]}>{complejoDe(espacio)}</Text>
              )}
              <MapView
                style={estilos.mapa}
                scrollEnabled={false}
                zoomEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                initialRegion={{
                  latitude: espacio.coordenadas.latitud,
                  longitude: espacio.coordenadas.longitud,
                  latitudeDelta: 0.008,
                  longitudeDelta: 0.008,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: espacio.coordenadas.latitud,
                    longitude: espacio.coordenadas.longitud,
                  }}
                  title={complejoDe(espacio) ?? espacio.nombre}
                />
              </MapView>
              <Boton
                titulo="Cómo llegar"
                variante="secundario"
                icono={<Ionicons name="navigate-outline" size={22} color={t.texto} />}
                onPress={() =>
                  abrirComoLlegar(espacio.coordenadas, complejoDe(espacio) ?? espacio.nombre)
                }
              />

              {/* Video */}
              <Text style={[estilos.subtitulo, { color: t.texto }]}>Video del espacio</Text>
              {fuenteVideo ? (
                <VideoEspacio key={fuenteVideo} fuente={fuenteVideo} />
              ) : (
                <Tarjeta>
                  <Text style={[estilos.texto, { color: t.textoSuave }]}>
                    Este espacio todavía no tiene video.
                  </Text>
                </Tarjeta>
              )}
            </View>
          </ScrollView>
        )}
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { paddingBottom: 40 },
  sinFoto: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  contador: {
    position: 'absolute',
    left: 14,
    bottom: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  textoContador: { color: '#FFFFFF', fontFamily: fuente.negrita, fontSize: 13 },
  camara: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuerpo: { padding: 16, gap: 12 },
  nombreFila: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  titulo: { fontSize: tamanos.titulo + 2, fontFamily: fuente.negrita },
  texto: { fontFamily: fuente.regular, fontSize: tamanos.texto, lineHeight: 24 },
  precio: { fontSize: 22, fontFamily: fuente.negrita },
  descarga: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accionesFila: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  favorito: {
    width: tamanos.boton,
    height: tamanos.boton,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitulo: { fontSize: tamanos.titulo - 4, fontFamily: fuente.negrita, marginTop: 12 },
  dato: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  datoEtiqueta: { fontFamily: fuente.regular, fontSize: 16, flexShrink: 1 },
  datoValor: { fontSize: 16, fontFamily: fuente.negrita, flexShrink: 1, textAlign: 'right' },
  mapa: { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden' },
  video: { width: '100%', aspectRatio: 16 / 9, borderRadius: 16, backgroundColor: '#000000' },
});
