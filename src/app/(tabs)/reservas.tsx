import { useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Boton } from '@/components/Boton';
import { EstadoPantalla } from '@/components/EstadoPantalla';
import { Etiqueta, etiquetaDeReserva } from '@/components/Etiqueta';
import { Tarjeta } from '@/components/Tarjeta';
import { esPersonal, useSesion } from '@/contextos/SesionContexto';
import { useCargar } from '@/hooks/useCargar';
import { ErrorApi } from '@/servicios/cliente';
import { reservasServicio, type Momento } from '@/servicios/reservas';
import { tamanos, useTema } from '@/tema/useTema';

export default function ReservasPantalla() {
  const t = useTema();
  const { usuario, cargando } = useSesion();

  if (cargando) {
    return (
      <View style={[estilos.centro, { backgroundColor: t.fondo }]}>
        <ActivityIndicator size="large" color={t.primario} />
      </View>
    );
  }

  if (!usuario) {
    return (
      <ScrollView
        style={{ backgroundColor: t.fondo }}
        contentContainerStyle={estilos.contenido}
      >
        <Text style={[estilos.titulo, { color: t.texto }]}>Mis reservas</Text>
        <Tarjeta style={estilos.tarjeta}>
          <Text style={[estilos.subtitulo, { color: t.texto }]}>
            Entrá para ver tus reservas
          </Text>
          <Text style={[estilos.texto, { color: t.textoSuave }]}>
            Sin cuenta podés mirar la disponibilidad. Para reservar un turno y ver tu
            código QR, ingresá o creá una cuenta.
          </Text>
          <Boton titulo="Ingresar" onPress={() => router.push('/(auth)/ingreso')} />
          <Boton
            titulo="Crear cuenta"
            variante="secundario"
            onPress={() => router.push('/(auth)/registro')}
          />
        </Tarjeta>
      </ScrollView>
    );
  }

  if (esPersonal(usuario)) {
    return (
      <View style={[estilos.centro, { backgroundColor: t.fondo }]}>
        <Text style={[estilos.texto, { color: t.textoSuave, textAlign: 'center' }]}>
          Las reservas del día están en la pestaña “Del día” de la zona del personal.
        </Text>
        <Boton titulo="Ir a la agenda" onPress={() => router.replace('/(tabs)/agenda')} />
      </View>
    );
  }

  return <ListaReservas />;
}

function ListaReservas() {
  const t = useTema();
  const [momento, setMomento] = useState<Momento>('proximas');

  const { datos, cargando, error, recargar } = useCargar(
    () => reservasServicio.misReservas(momento),
    [momento]
  );

  function cancelarReserva(reservaId: string) {
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro de que querés cancelar este turno?',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await reservasServicio.cancelar(reservaId);
              Alert.alert('Reserva cancelada', 'Tu turno fue liberado.');
              recargar();
            } catch (e) {
              Alert.alert(
                'No se pudo cancelar',
                e instanceof ErrorApi ? e.message : 'Ocurrió un error.'
              );
            }
          },
        },
      ]
    );
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <View style={estilos.filtros}>
        {(['proximas', 'pasadas'] as Momento[]).map((opcion) => {
          const activo = momento === opcion;
          return (
            <Pressable
              key={opcion}
              accessibilityRole="button"
              accessibilityState={{ selected: activo }}
              onPress={() => setMomento(opcion)}
              style={[
                estilos.filtro,
                {
                  backgroundColor: activo ? t.primario : t.tarjeta,
                  borderColor: activo ? t.primario : t.borde,
                },
              ]}
            >
              <Text
                style={{
                  color: activo ? t.sobrePrimario : t.texto,
                  fontWeight: '700',
                }}
              >
                {opcion === 'proximas' ? 'Próximas' : 'Pasadas'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <EstadoPantalla
        cargando={cargando}
        error={error}
        vacio={!!datos && datos.length === 0}
        mensajeVacio={
          momento === 'proximas'
            ? 'No tenés reservas próximas.'
            : 'No tenés reservas anteriores.'
        }
        onReintentar={recargar}
      >
        <FlatList
          data={datos ?? []}
          keyExtractor={(r) => r.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => {
            const etiqueta = etiquetaDeReserva(item.estado);

            return (
              <Tarjeta style={estilos.tarjeta}>
                <View style={estilos.filaSuperior}>
                  <Text style={[estilos.subtitulo, { color: t.texto }]}>
                    {item.cantidadPersonas} personas
                  </Text>
                  <Etiqueta texto={etiqueta.texto} tono={etiqueta.tono} />
                </View>

                {item.estado === 'confirmada' ? (
                  <View style={[estilos.contenedorQR, { borderColor: t.borde }]}>
                    <QRCode
                      value={item.codigoQr}
                      size={160}
                      backgroundColor="#FFFFFF"
                      color="#000000"
                    />
                  </View>
                ) : null}

                <Text style={[estilos.texto, { color: t.textoSuave }]}>
                  Código: {item.codigoQr}
                </Text>

                {momento === 'proximas' && item.estado === 'confirmada' ? (
                  <Boton
                    titulo="Cancelar reserva"
                    variante="peligro"
                    onPress={() => cancelarReserva(item.id)}
                    style={estilos.botonCancelar}
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
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  contenido: { padding: 20, paddingBottom: 40, gap: 16 },
  titulo: { fontSize: 30, fontWeight: '800', marginTop: 8 },
  subtitulo: { fontSize: tamanos.texto, fontWeight: '800' },
  texto: { fontSize: tamanos.texto, lineHeight: 23 },
  tarjeta: { gap: 10 },
  filtros: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },
  filtro: {
    flex: 1,
    minHeight: 48,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lista: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  contenedorQR: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
  },
  botonCancelar: { marginTop: 4, minHeight: 48 },
});
