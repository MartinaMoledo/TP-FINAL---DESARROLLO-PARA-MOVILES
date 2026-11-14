// Espacios: listado con filtros por deporte y complejo, fecha con calendario y mapa general.
// Tocar una tarjeta abre la ficha del espacio (src/app/ficha/[id].tsx).
import Ionicons from '@react-native-vector-icons/ionicons';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import Storage from 'expo-sqlite/kv-store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotonModo } from '@/components/BotonModo';

import { CalendarioModal, fechaLarga } from '@/components/CalendarioModal';
import { EstadoPantalla } from '@/components/EstadoPantalla';
import { FiltroChip } from '@/components/FiltroChip';
import { TarjetaEspacio, type EstadoDelDia } from '@/components/TarjetaEspacio';
import { useCargar } from '@/hooks/useCargar';
import { descargasServicio } from '@/servicios/descargas';
import { espaciosServicio } from '@/servicios/espacios';
import { useMarca } from '@/tema/marca';
import { fuente } from '@/tema/tipografia';
import { estadoDelDia, type EstadoDelDiaEspacio } from '@/utilidades/disponibilidad';
import { complejoDe } from '@/utilidades/complejo';
import { hoyISO } from '@/utilidades/fechas';
import { fuentesDeFotos } from '@/utilidades/fotosEspacio';

const TODOS = 'todos';
const CLAVE_FILTROS = 'filtros-espacios';

function saludoSegunHora(): string {
  const hora = new Date().getHours();
  if (hora < 6) return 'Buenas noches';
  if (hora < 13) return 'Buen día';
  if (hora < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function EspaciosPantalla() {
  const m = useMarca();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Esta pantalla tiene su propia franja superior (como el mockup): no lleva la cabecera "Espacios".
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const [saludo] = useState(saludoSegunHora);
  const [fecha, setFecha] = useState(hoyISO);
  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const [deporte, setDeporte] = useState(TODOS);
  const [complejo, setComplejo] = useState(TODOS);
  // Sube cada vez que volvés a esta pantalla: así se ven las fotos recién descargadas.
  const [version, setVersion] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setVersion((v) => v + 1);
    }, []),
  );

  // El último filtro usado se recuerda entre una apertura y otra de la app.
  useEffect(() => {
    Storage.getItemAsync(CLAVE_FILTROS)
      .then((guardado) => {
        if (!guardado) return;
        const filtros = JSON.parse(guardado) as { deporte?: string; complejo?: string };
        if (typeof filtros.deporte === 'string') setDeporte(filtros.deporte);
        if (typeof filtros.complejo === 'string') setComplejo(filtros.complejo);
      })
      .catch(() => {
        // si no se puede leer, se empieza sin filtros
      });
  }, []);

  function elegirFiltros(nuevoDeporte: string, nuevoComplejo: string) {
    setDeporte(nuevoDeporte);
    setComplejo(nuevoComplejo);
    Storage.setItemAsync(
      CLAVE_FILTROS,
      JSON.stringify({ deporte: nuevoDeporte, complejo: nuevoComplejo }),
    ).catch(() => {
      // guardar el filtro es un extra: si falla, no se avisa
    });
  }

  const catalogo = useCargar(async () => {
    const [espacios, deportes] = await Promise.all([
      espaciosServicio.listar(),
      espaciosServicio.deportes(),
    ]);
    return { espacios, deportes };
  });

  const espacios = useMemo(() => catalogo.datos?.espacios ?? [], [catalogo.datos]);
  const idsClave = espacios.map((e) => e.id).join(',');

  // Estado del día: "Disponible" si queda al menos un turno libre que no pasó; si no,
  // "En mantenimiento" o "Completa" según por qué no queda ninguno.
  const disponibilidad = useCargar(async () => {
    const ahora = Date.now();
    const pares = await Promise.all(
      espacios.map(async (e) => {
        try {
          const turnos = await espaciosServicio.turnos(e.id, fecha);
          return [e.id, estadoDelDia(turnos, ahora)] as const;
        } catch {
          return [e.id, null] as const;
        }
      }),
    );
    return Object.fromEntries(pares) as Record<string, EstadoDelDiaEspacio | null>;
  }, [fecha, idsClave]);

  const deportesConEspacios = useMemo(
    () => (catalogo.datos?.deportes ?? []).filter((d) => espacios.some((e) => e.deporteId === d.id)),
    [catalogo.datos, espacios],
  );
  const nombreDeDeporte = useCallback(
    (id: string) => deportesConEspacios.find((d) => d.id === id)?.nombre ?? '',
    [deportesConEspacios],
  );
  // Los espacios sin complejo conocido ("—" en la API) no suman un filtro: aparecen en "Todos".
  const complejos = useMemo(
    () => [...new Set(espacios.map(complejoDe).filter((c): c is string => c !== null))],
    [espacios],
  );

  // Si el filtro guardado ya no existe (cambiaron los espacios), se ignora.
  const deporteActivo = deportesConEspacios.some((d) => d.id === deporte) ? deporte : TODOS;
  const complejoActivo = complejos.includes(complejo) ? complejo : TODOS;

  const filtrados = useMemo(
    () =>
      espacios.filter(
        (e) =>
          (deporteActivo === TODOS || e.deporteId === deporteActivo) &&
          (complejoActivo === TODOS || complejoDe(e) === complejoActivo),
      ),
    [espacios, deporteActivo, complejoActivo],
  );

  const fotosPorEspacio = useMemo(() => {
    void version;
    const mapa: Record<string, ReturnType<typeof fuentesDeFotos>[number] | null> = {};
    for (const e of espacios) {
      console.log('ESPACIO REAL:', e.id, e.nombre);
      mapa[e.id] = fuentesDeFotos(e)[0] ?? null;
    }
    return mapa;
  }, [espacios, version]);

  function estadoDe(id: string): EstadoDelDia {
    if (disponibilidad.cargando) return 'consultando';
    return disponibilidad.datos?.[id] ?? 'sin-datos';
  }

  function recargarTodo() {
    catalogo.recargar();
    disponibilidad.recargar();
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: m.tope }]}>
      {/* Franja superior: botón de mapa, botón de modo y saludo */}
      <View style={[estilos.tope, { paddingTop: insets.top + 10 }]}>
        <View style={estilos.topeFila}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver mapa de complejos"
            onPress={() => router.push('/mapa')}
            style={[estilos.botonMapa, { backgroundColor: m.botonModoFondo }]}
          >
            <Ionicons name="map-outline" size={20} color={m.botonModoIcono} />
            <Text style={[estilos.textoMapa, { color: m.botonModoIcono }]}>Mapa</Text>
          </Pressable>
          <BotonModo />
        </View>
        <Text style={[estilos.saludo, { color: m.saludo }]}>{saludo}</Text>
      </View>

      {/* Hoja redondeada con filtros y tarjetas */}
      <View style={[estilos.hoja, { backgroundColor: m.hoja }]}>
        <EstadoPantalla
          cargando={catalogo.cargando && !catalogo.datos}
          error={catalogo.error}
          vacio={!!catalogo.datos && catalogo.datos.espacios.length === 0}
          mensajeVacio="Todavía no hay espacios cargados."
          onReintentar={catalogo.recargar}
        >
          <FlatList
            data={filtrados}
            keyExtractor={(e) => e.id}
            contentContainerStyle={estilos.lista}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            refreshControl={
              <RefreshControl
                refreshing={catalogo.cargando || disponibilidad.cargando}
                onRefresh={recargarTodo}
              />
            }
            ListHeaderComponent={
              <View style={estilos.encabezado}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={estilos.chips}
                >
                  <FiltroChip
                    texto="Todos"
                    activo={deporteActivo === TODOS}
                    onPress={() => elegirFiltros(TODOS, complejoActivo)}
                  />
                  {deportesConEspacios.map((d) => (
                    <FiltroChip
                      key={d.id}
                      texto={d.nombre}
                      activo={deporteActivo === d.id}
                      onPress={() => elegirFiltros(d.id, complejoActivo)}
                    />
                  ))}
                </ScrollView>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Día elegido: ${fechaLarga(fecha)}. Cambiar día`}
                  onPress={() => setCalendarioAbierto(true)}
                  style={[estilos.fecha, { backgroundColor: m.pildoraFecha }]}
                >
                  <Text style={[estilos.textoFecha, { color: m.pildoraTexto }]}>
                    {fechaLarga(fecha)}
                  </Text>
                  <View style={[estilos.iconoFecha, { backgroundColor: m.pildoraIconoFondo }]}>
                    <Ionicons name="calendar-outline" size={20} color={m.pildoraIcono} />
                  </View>
                </Pressable>

                {complejos.length > 1 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={estilos.chips}
                  >
                    <FiltroChip
                      tipo="complejo"
                      texto="Todos los complejos"
                      activo={complejoActivo === TODOS}
                      onPress={() => elegirFiltros(deporteActivo, TODOS)}
                    />
                    {complejos.map((c) => (
                      <FiltroChip
                        key={c}
                        tipo="complejo"
                        texto={c}
                        activo={complejoActivo === c}
                        onPress={() => elegirFiltros(deporteActivo, c)}
                      />
                    ))}
                  </ScrollView>
                )}
              </View>
            }
            ListEmptyComponent={
              <Text style={[estilos.vacio, { color: m.pie }]}>
                No hay espacios con estos filtros. Probá con otro deporte o complejo.
              </Text>
            }
            ListFooterComponent={
              <Text style={[estilos.pie, { color: m.pie }]}>Reservá para hacer tu actividad</Text>
            }
            renderItem={({ item }) => (
              <TarjetaEspacio
                espacio={item}
                deporte={nombreDeDeporte(item.deporteId)}
                estado={estadoDe(item.id)}
                foto={fotosPorEspacio[item.id] ?? null}
                onPress={() =>
                  router.push({ pathname: '/ficha/[id]', params: { id: item.id, fecha } })
                }
              />
            )}
          />
        </EstadoPantalla>
      </View>

      <CalendarioModal
        visible={calendarioAbierto}
        fecha={fecha}
        onElegir={(nueva) => {
          setFecha(nueva);
          setCalendarioAbierto(false);
        }}
        onCerrar={() => setCalendarioAbierto(false)}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  tope: { paddingHorizontal: 16, paddingBottom: 26, gap: 22 },
  topeFila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  saludo: { fontSize: 36, fontFamily: fuente.media, textAlign: 'center' },
  botonMapa: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textoMapa: { fontSize: 15, fontFamily: fuente.seminegrita },
  hoja: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  lista: { padding: 16, paddingTop: 22, paddingBottom: 32 },
  encabezado: { gap: 14, marginBottom: 16 },
  chips: { gap: 8 },
  fecha: {
    alignSelf: 'center',
    minHeight: 48,
    borderRadius: 999,
    paddingLeft: 22,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  textoFecha: { fontSize: 20, fontFamily: fuente.media },
  iconoFecha: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vacio: { fontSize: 17, fontFamily: fuente.regular, textAlign: 'center', paddingVertical: 24 },
  pie: { fontSize: 15, fontFamily: fuente.regular, textAlign: 'center', marginTop: 24 },
});
