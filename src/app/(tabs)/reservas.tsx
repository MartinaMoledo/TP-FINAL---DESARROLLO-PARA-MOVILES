import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EstadoPantalla } from '@/components/EstadoPantalla';
import { useCargar } from '@/hooks/useCargar';
import { reservasServicio, type Momento } from '@/servicios/reservas';
import { tamanos, useTema } from '@/tema/useTema';
import QRCode from 'react-native-qrcode-svg';

export default function ReservasPantalla() {
  const t = useTema();
  const [momento, setMomento] = useState<Momento>('proximas');

  const { datos, cargando, error, recargar } = useCargar(
    () => reservasServicio.misReservas(momento),
    [momento]
  );

  const cancelarReserva = (reservaId: string) => {
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
                e instanceof Error ? e.message : 'Ocurrió un error.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <View style={estilos.filtros}>
        {(['proximas', 'pasadas'] as Momento[]).map((opcion) => (
          <Pressable
            key={opcion}
            onPress={() => setMomento(opcion)}
            style={[
              estilos.filtro,
              {
                backgroundColor:
                  momento === opcion ? '#D71920' : t.tarjeta,
                borderColor: t.borde,
              },
            ]}
          >
            <Text
              style={{
                color: momento === opcion ? '#FFFFFF' : t.texto,
                fontWeight: '700',
              }}
            >
              {opcion === 'proximas' ? 'Próximas' : 'Pasadas'}
            </Text>
          </Pressable>
        ))}
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
          renderItem={({ item }) => (
            <View
              style={[
                estilos.tarjeta,
                {
                  backgroundColor: t.tarjeta,
                  borderColor: t.borde,
                },
              ]}
            >
              <Text style={[estilos.titulo, { color: t.texto }]}>
                {item.turnoId}
              </Text>

              <Text style={[estilos.texto, { color: t.textoSuave }]}>
                {item.cantidadPersonas} personas
              </Text>
              <View style={estilos.contenedorQR}>
                <QRCode
                  value={item.codigoQr}
                  size={160}
                  backgroundColor="#FFFFFF"
                  color="#000000"
                />
              </View>

              <Text style={[estilos.texto, { color: t.textoSuave }]}>
                Estado: {item.estado}
              </Text>

              <Text style={[estilos.texto, { color: t.textoSuave }]}>
                Código: {item.codigoQr}
              </Text>

              {momento === 'proximas' && item.estado === 'confirmada' && (
                <Pressable
                  onPress={() => cancelarReserva(item.id)}
                  style={estilos.botonCancelar}
                >
                  <Text style={estilos.textoCancelar}>
                    Cancelar reserva
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        />
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },

  filtros: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
  },

  filtro: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },

  lista: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },

  tarjeta: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },

  titulo: {
    fontSize: tamanos.texto,
    fontWeight: '700',
  },

  texto: {
    fontSize: tamanos.texto,
  },

  botonCancelar: {
    borderWidth: 1,
    borderColor: '#D71920',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },

  textoCancelar: {
    color: '#D71920',
    fontWeight: '700',
  },
  contenedorQR: {
  alignItems: 'center',
  padding: 20,
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  marginTop: 10,
  },
});