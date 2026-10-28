// Mis reservas (próximas). Persona "Grilla y reservas": separar próximas/pasadas, cancelar, límite de 3.
// Persona "QR e ingreso": acá se muestra el código QR de cada reserva.
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { EstadoPantalla } from '@/components/EstadoPantalla';
import { useCargar } from '@/hooks/useCargar';
import { reservasServicio } from '@/servicios/reservas';
import { tamanos, useTema } from '@/tema/useTema';

export default function ReservasPantalla() {
  const t = useTema();
  const { datos, cargando, error, recargar } = useCargar(() => reservasServicio.misReservas('proximas'));

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <EstadoPantalla
        cargando={cargando}
        error={error}
        vacio={!!datos && datos.length === 0}
        mensajeVacio="No tenés reservas próximas."
        onReintentar={recargar}
      >
        <FlatList
          data={datos ?? []}
          keyExtractor={(r) => r.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => (
            <View style={[estilos.tarjeta, { backgroundColor: t.tarjeta, borderColor: t.borde }]}>
              <Text style={[estilos.titulo, { color: t.texto }]}>{item.turnoId}</Text>
              <Text style={[estilos.texto, { color: t.textoSuave }]}>
                {item.cantidadPersonas} personas · {item.estado}
              </Text>
              <Text style={[estilos.texto, { color: t.textoSuave }]}>Código: {item.codigoQr}</Text>
            </View>
          )}
        />
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  lista: { padding: 16, gap: 12 },
  tarjeta: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 4 },
  titulo: { fontSize: tamanos.texto, fontWeight: '700' },
  texto: { fontSize: tamanos.texto },
});
