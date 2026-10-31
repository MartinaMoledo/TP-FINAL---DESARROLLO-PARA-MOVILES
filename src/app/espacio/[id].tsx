
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EstadoPantalla } from '@/components/EstadoPantalla';
import { useCargar } from '@/hooks/useCargar';
import { espaciosServicio } from '@/servicios/espacios';
import { tamanos, useTema } from '@/tema/useTema';
import { hoyISO } from '@/utilidades/fechas';
import { Alert } from 'react-native';
import { reservasServicio } from '@/servicios/reservas';

function sumarDias(fecha: string, dias: number) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const resultado = new Date(Date.UTC(anio, mes - 1, dia + dias));
  return resultado.toISOString().slice(0, 10);
}

export default function EspacioPantalla() {
  const t = useTema();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [fecha, setFecha] = useState(hoyISO);
  const [cantidadPersonas, setCantidadPersonas] = useState(1);

  const { datos, cargando, error, recargar } = useCargar(async () => {
    const [espacio, turnos] = await Promise.all([
      espaciosServicio.obtener(id),
      espaciosServicio.turnos(id, fecha),
    ]);
    return { espacio, turnos };
  }, [id, fecha]);

  const colores = {
    libre: t.libre,
    reservado: t.ocupado,
    fijo: t.fijo,
    mantenimiento: t.mantenimiento,
  };

  const etiquetas = {
    libre: 'LIBRE',
    reservado: 'OCUPADO',
    fijo: 'FIJO',
    mantenimiento: 'MANTENIMIENTO',
  };

  const fechas = Array.from(
    { length: 7 },
    (_, i) => sumarDias(hoyISO(), i)
  );

  const reservarTurno = (turnoId: string) => {
    Alert.alert('Confirmar reserva', '¿Querés reservar este turno?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reservar',
        onPress: async () => {
          try {
            await reservasServicio.reservar(turnoId, cantidadPersonas);
            Alert.alert('¡Reserva confirmada!', 'Tu turno fue reservado.');
            recargar();
          } catch (e) {
            Alert.alert(
              'No se pudo reservar',
              e instanceof Error ? e.message : 'Ocurrió un error.'
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
              source={
                id === 'esp-01'
                  ? require('../../../assets/canchas/cancha_01.jpg')
                  : require('../../../assets/canchas/cancha_02.jpg')
              }
              style={estilos.imagen}
            />

            <Text style={[estilos.titulo, { color: t.texto }]}>
              {datos.espacio.nombre}
            </Text>

            <Text style={[estilos.texto, { color: t.textoSuave }]}>
              {datos.espacio.complejo}
            </Text>

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
                    Math.min(datos.espacio.capacidad, n + 1)
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
                      backgroundColor: fecha === dia ? '#D71920' : t.tarjeta,
                      borderColor: t.borde,
                    },
                  ]}
                >
                  <Text style={{
                    color: fecha === dia ? '#FFFFFF' : t.texto,
                    fontWeight: '600',
                  }}>
                    {dia.slice(8, 10)}/{dia.slice(5, 7)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[estilos.texto, { color: t.textoSuave }]}>
              Turnos del {fecha}
            </Text>

            {datos.turnos.map((turno) => (
              <View
                key={turno.id}
                style={[
                  estilos.fila,
                  {
                    borderColor: t.borde,
                    backgroundColor: t.tarjeta,
                  },
                ]}
              >
                <Text style={[estilos.hora, { color: t.texto }]}>
                  {turno.inicio}
                </Text>

                <Text style={[
                  estilos.estado,
                  { color: colores[turno.estado] },
                ]}>
                  {etiquetas[turno.estado]}
                  {turno.motivoBloqueo
                    ? ` — ${turno.motivoBloqueo}`
                    : ''}
                </Text>

                {turno.estado === 'libre' &&
                  new Date(`${fecha}T${turno.inicio}:00-03:00`).getTime() > Date.now() && (
                    <Pressable
                      onPress={() => reservarTurno(turno.id)}
                      style={estilos.botonReservar}
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                        Reservar
                      </Text>
                    </Pressable>
                  )}
              </View>
            ))}
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
  botonReservar: {
  backgroundColor: '#D71920',
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
