// Reservas del día con los datos de contacto del jugador, para el personal.
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Boton } from '@/components/Boton';
import { EstadoPantalla } from '@/components/EstadoPantalla';
import { Etiqueta, etiquetaDeReserva } from '@/components/Etiqueta';
import { SelectorFecha } from '@/components/SelectorFecha';
import { Tarjeta } from '@/components/Tarjeta';
import { useCargar } from '@/hooks/useCargar';
import { ErrorApi } from '@/servicios/cliente';
import { personalServicio, type ReservaDelDia } from '@/servicios/personal';
import { tamanos, useTema } from '@/tema/useTema';
import { hoyISO } from '@/utilidades/fechas';

export default function ReservasDelDiaPantalla() {
  const t = useTema();
  const [fecha, setFecha] = useState(hoyISO());
  const [marcando, setMarcando] = useState<string | null>(null);

  const { datos, cargando, error, recargar } = useCargar(
    () => personalServicio.reservasDelDia(fecha),
    [fecha]
  );

  function confirmarAusencia(item: ReservaDelDia) {
    const nombre = item.usuario?.nombre ?? 'esta persona';
    Alert.alert(
      'Marcar ausente',
      `¿Marcar a ${nombre} como ausente? Se libera su turno.`,
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Sí, marcar',
          style: 'destructive',
          onPress: async () => {
            setMarcando(item.reserva.id);
            try {
              await personalServicio.marcarAusente(item.reserva.id);
              recargar();
            } catch (e) {
              Alert.alert(
                'No se pudo marcar',
                e instanceof ErrorApi ? e.message : 'Ocurrió un error.'
              );
            } finally {
              setMarcando(null);
            }
          },
        },
      ]
    );
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <SelectorFecha fecha={fecha} onCambiar={setFecha} />

      <EstadoPantalla
        cargando={cargando}
        error={error}
        vacio={!!datos && datos.length === 0}
        mensajeVacio="No hay reservas para este día."
        onReintentar={recargar}
      >
        <FlatList
          data={datos ?? []}
          keyExtractor={(item) => item.reserva.id}
          contentContainerStyle={estilos.lista}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
          ListHeaderComponent={
            <Text style={[estilos.resumen, { color: t.textoSuave }]}>
              {datos?.length ?? 0} reservas · tocá el teléfono para llamar
            </Text>
          }
          renderItem={({ item }) => {
            const etiqueta = etiquetaDeReserva(item.reserva.estado);
            const nombre = item.usuario?.nombre ?? 'Jugador sin datos';
            const telefono = item.usuario?.telefono ?? 'Sin teléfono';

            return (
              <Tarjeta style={estilos.tarjeta}>
                <View style={estilos.filaSuperior}>
                  <Text style={[estilos.horario, { color: t.texto }]}>
                    {item.turno ? `${item.turno.inicio} a ${item.turno.fin}` : 'Sin horario'}
                  </Text>
                  <Etiqueta texto={etiqueta.texto} tono={etiqueta.tono} />
                </View>

                <Text style={[estilos.espacio, { color: t.texto }]}>
                  {item.espacio?.nombre ?? 'Espacio sin datos'}
                </Text>

                <Text style={[estilos.texto, { color: t.textoSuave }]}>
                  {nombre} · {item.reserva.cantidadPersonas} personas
                </Text>
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={`Llamar a ${nombre}`}
                  disabled={!item.usuario?.telefono}
                  onPress={() => {
                    const telefono = item.usuario?.telefono;
                    if (telefono) {
                      Linking.openURL(`tel:${telefono.replace(/[^\d+]/g, '')}`);
                    }
                  }}
                >
                  <Text style={[estilos.telefono, { color: t.primario }]}>{telefono}</Text>
                </Pressable>

                {item.reserva.estado === 'confirmada' ? (
                  <Boton
                    titulo="Marcar ausente"
                    variante="peligro"
                    onPress={() => confirmarAusencia(item)}
                    cargando={marcando === item.reserva.id}
                    deshabilitado={marcando !== null}
                    style={estilos.boton}
                  />
                ) : null}
              </Tarjeta>
            );
          }}
        />
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  lista: { padding: 16, paddingTop: 0, gap: 12 },
  resumen: { fontSize: 15, marginBottom: 4 },
  tarjeta: { gap: 6 },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  horario: { fontSize: tamanos.texto, fontWeight: '800' },
  espacio: { fontSize: tamanos.texto, fontWeight: '700' },
  texto: { fontSize: 15 },
  telefono: { fontSize: 15, fontWeight: '700' },
  boton: { marginTop: 8, minHeight: 48 },
});
