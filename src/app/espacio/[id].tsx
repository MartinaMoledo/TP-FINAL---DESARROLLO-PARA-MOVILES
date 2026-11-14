import { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { EstadoPantalla } from '@/components/EstadoPantalla';
import { useSesion } from '@/contextos/SesionContexto';
import { useCargar } from '@/hooks/useCargar';
import { espaciosServicio } from '@/servicios/espacios';
import { tamanos, useTema } from '@/tema/useTema';
import { aISOArgentina, hoyISO } from '@/utilidades/fechas';
import { reservasServicio } from '@/servicios/reservas';
import { programarRecordatorio } from '@/servicios/notificaciones';
import type { EstadoTurno, Turno } from '@/tipos';
import { complejoDe } from '@/utilidades/complejo';
import { turnoYaPaso } from '@/utilidades/disponibilidad';
import { fuentesDeFotos } from '@/utilidades/fotosEspacio';
import { Image } from 'expo-image';

function sumarDias(fecha: string, dias: number) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const resultado = new Date(Date.UTC(anio, mes - 1, dia + dias));
  return resultado.toISOString().slice(0, 10);
}

// Una fila de la grilla: un turno libre (se puede reservar) o un rango de horas que no
// se puede usar (ocupado, fijo o mantenimiento), agrupado: "12:00 a 15:00 · Mantenimiento".
type Fila =
  | { tipo: 'libre'; turno: Turno }
  | { tipo: 'rango'; estado: EstadoTurno; inicio: string; fin: string; motivo: string | null };

/** Arma las filas: oculta lo que ya pasó y junta los turnos no libres que van seguidos. */
function armarFilas(turnos: Turno[], ahora: number): Fila[] {
  const filas: Fila[] = [];
  const visibles = turnos
    .filter((turno) => !turnoYaPaso(turno, ahora))
    .sort((a, b) => a.inicio.localeCompare(b.inicio));

  for (const turno of visibles) {
    if (turno.estado === 'libre') {
      filas.push({ tipo: 'libre', turno });
      continue;
    }
    const anterior = filas[filas.length - 1];
    if (
      anterior?.tipo === 'rango' &&
      anterior.estado === turno.estado &&
      anterior.motivo === turno.motivoBloqueo &&
      anterior.fin === turno.inicio
    ) {
      anterior.fin = turno.fin;
    } else {
      filas.push({
        tipo: 'rango',
        estado: turno.estado,
        inicio: turno.inicio,
        fin: turno.fin,
        motivo: turno.motivoBloqueo,
      });
    }
  }
  return filas;
}

export default function EspacioPantalla() {
  const t = useTema();
  const oscuro = useColorScheme() === 'dark';
  const { usuario } = useSesion();
  // La ficha manda el día que se eligió en el listado: la grilla abre en ese día.
  const { id, fecha: fechaElegida } = useLocalSearchParams<{ id: string; fecha?: string }>();
  const [fecha, setFecha] = useState(() => fechaElegida ?? hoyISO());
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  // El reloj se lee fuera del render y se refresca solo, para que el botón
  // "Reservar" desaparezca cuando el turno ya empezó.
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const temporizador = setInterval(() => setAhora(Date.now()), 60_000);
    return () => clearInterval(temporizador);
  }, []);

  const { datos, cargando, error, recargar } = useCargar(async () => {
    const [espacio, turnos] = await Promise.all([
      espaciosServicio.obtener(id),
      espaciosServicio.turnos(id, fecha),
    ]);
    return { espacio, turnos };
  }, [id, fecha]);

  // Lo que no se puede reservar va en gris: fondo gris y letra gris oscura
  // (en modo oscuro, gris claro para que se lea sobre el fondo).
  const gris = {
    fondo: oscuro ? '#2B302E' : '#E3E3E3',
    texto: oscuro ? '#C4C4C4' : '#4A4A4A',
  };

  const nombres: Record<EstadoTurno, string> = {
    libre: 'Libre',
    reservado: 'Ocupado',
    fijo: 'Reserva fija',
    mantenimiento: 'Mantenimiento',
  };

  const fechas = Array.from({ length: 7 }, (_, i) => sumarDias(hoyISO(), i));
  const filas = useMemo(() => armarFilas(datos?.turnos ?? [], ahora), [datos, ahora]);

  const reservarTurno = (turno: Turno) => {
    // Mirar no pide cuenta, pero reservar sí (PRD y respuesta de la cátedra en el foro).
    if (!usuario) {
      Alert.alert('Necesitás una cuenta para reservar', 'Ingresá o creá una cuenta para seguir.', [
        { text: 'Volver', style: 'cancel' },
        // Al ingresar, la app vuelve acá, a la misma cancha y el mismo día.
        { text: 'Ingresar', onPress: () => router.push('/(auth)/ingreso') },
      ]);
      return;
    }
    Alert.alert('Confirmar reserva', '¿Querés reservar este turno?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reservar',
        onPress: async () => {
          try {
            const reserva = await reservasServicio.reservar(
              turno.id,
              cantidadPersonas,
            );
            await programarRecordatorio({
              reservaId: reserva.id,
              inicio: aISOArgentina(turno.fecha, turno.inicio),
              nombreEspacio: datos?.espacio.nombre ?? 'Tu cancha',
            });
            Alert.alert('¡Reserva confirmada!', 'Tu turno fue reservado.');
            recargar();
          } catch (e) {
            Alert.alert(
              'No se pudo reservar',
              e instanceof Error ? e.message : 'Ocurrió un error.',
            );
          }
        },
      },
    ]);
  };

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <EstadoPantalla
        cargando={cargando && !datos}
        error={error}
        vacio={!datos && !cargando && !error}
        mensajeVacio="No encontramos este espacio."
        onReintentar={recargar}
      >
        {datos && (
          <ScrollView contentContainerStyle={estilos.contenido}>
            <Image
              source={fuentesDeFotos(datos.espacio)[0]}
              style={estilos.imagen}
              contentFit="cover"
            />

            <Text style={[estilos.titulo, { color: t.texto }]}>
              {datos.espacio.nombre}
            </Text>

            {complejoDe(datos.espacio) && (
              <Text style={[estilos.texto, { color: t.textoSuave }]}>
                {complejoDe(datos.espacio)}
              </Text>
            )}

            <View style={[estilos.tarjeta, { backgroundColor: t.tarjeta }]}>
              <Text style={[estilos.subtitulo, { color: t.texto }]}>
                Características
              </Text>

              <Text style={[estilos.texto, { color: t.texto }]}>
                Superficie: {datos.espacio.superficie}
              </Text>
              <Text style={[estilos.texto, { color: t.texto }]}>
                Capacidad: {datos.espacio.capacidad} personas
              </Text>
              <Text style={[estilos.texto, { color: t.texto }]}>
                Iluminación: {datos.espacio.iluminacion ? 'Sí' : 'No'}
              </Text>
              <Text style={[estilos.texto, { color: t.texto }]}>
                Techado: {datos.espacio.techado ? 'Sí' : 'No'}
              </Text>

              <Text style={[estilos.precio, { color: t.texto }]}>
                ${datos.espacio.precioPorHora.toLocaleString('es-AR')} / hora
              </Text>
            </View>

            <Text style={[estilos.subtitulo, { color: t.texto }]}>
              Reglas del espacio
            </Text>
            <Text style={[estilos.texto, { color: t.textoSuave }]}>
              {datos.espacio.reglas}
            </Text>
            <Text style={[estilos.subtitulo, { color: t.texto }]}>
              Cantidad de personas
            </Text>

            <View style={estilos.selectorPersonas}>
              <Pressable
                onPress={() => setCantidadPersonas((n) => Math.max(1, n - 1))}
                style={[estilos.botonCantidad, { backgroundColor: t.tarjeta }]}
              >
                <Text style={{ color: t.texto, fontSize: 22 }}>−</Text>
              </Pressable>

              <Text style={{ color: t.texto, fontSize: 20, fontWeight: '700' }}>
                {cantidadPersonas}
              </Text>

              <Pressable
                onPress={() =>
                  setCantidadPersonas((n) =>
                    Math.min(datos.espacio.capacidad, n + 1),
                  )
                }
                style={[estilos.botonCantidad, { backgroundColor: t.tarjeta }]}
              >
                <Text style={{ color: t.texto, fontSize: 22 }}>+</Text>
              </Pressable>
            </View>
            <Text style={[estilos.subtitulo, { color: t.texto }]}>
              Disponibilidad
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {fechas.map((dia) => (
                <Pressable
                  key={dia}
                  onPress={() => setFecha(dia)}
                  style={[
                    estilos.dia,
                    {
                      backgroundColor: fecha === dia ? t.primario : t.tarjeta,
                      borderColor: fecha === dia ? t.primario : t.borde,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: fecha === dia ? t.sobrePrimario : t.texto,
                      fontWeight: '600',
                    }}
                  >
                    {dia.slice(8, 10)}/{dia.slice(5, 7)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[estilos.texto, { color: t.textoSuave }]}>
              Turnos del {fecha}
            </Text>

            {filas.length === 0 ? (
              <Text style={[estilos.texto, { color: t.textoSuave }]}>
                No quedan turnos para este día. Elegí otro día.
              </Text>
            ) : null}

            {filas.map((fila) =>
              fila.tipo === 'libre' ? (
                <View
                  key={fila.turno.id}
                  style={[estilos.fila, { borderColor: t.tarjeta, backgroundColor: t.tarjeta }]}
                >
                  <Text style={[estilos.hora, { color: t.texto }]}>{fila.turno.inicio}</Text>
                  <Text style={[estilos.estado, { color: t.libre }]}>Libre</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Reservar el turno de las ${fila.turno.inicio}`}
                    onPress={() => reservarTurno(fila.turno)}
                    style={[estilos.botonReservar, { backgroundColor: t.primario }]}
                  >
                    <Text style={{ color: t.sobrePrimario, fontWeight: '700' }}>Reservar</Text>
                  </Pressable>
                </View>
              ) : (
                <View
                  key={`${fila.estado}-${fila.inicio}`}
                  style={[estilos.fila, { borderColor: gris.fondo, backgroundColor: gris.fondo }]}
                >
                  <Text style={[estilos.rango, { color: gris.texto }]}>
                    {fila.inicio} a {fila.fin}
                  </Text>
                  <Text style={[estilos.estado, { color: gris.texto }]}>
                    {nombres[fila.estado]}
                    {fila.motivo ? ` — ${fila.motivo}` : ''}
                  </Text>
                </View>
              ),
            )}
          </ScrollView>
        )}
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { padding: 16, gap: 12, paddingBottom: 40 },
  imagen: { width: '100%', height: 210, borderRadius: 14 },
  titulo: { fontSize: tamanos.titulo, fontWeight: '800' },
  subtitulo: { fontSize: tamanos.titulo - 4, fontWeight: '700', marginTop: 12 },
  texto: { fontSize: tamanos.texto },
  tarjeta: { padding: 16, borderRadius: 14, gap: 8 },
  precio: { fontSize: 22, fontWeight: '800', marginTop: 8 },
  dia: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 48,
  },
  hora: { fontSize: tamanos.texto, fontWeight: '700', width: 64 },
  estado: { fontSize: tamanos.texto, fontWeight: '600', flexShrink: 1 },
  rango: { fontSize: tamanos.texto, fontWeight: '700', width: 120 },
  botonReservar: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectorPersonas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  botonCantidad: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
