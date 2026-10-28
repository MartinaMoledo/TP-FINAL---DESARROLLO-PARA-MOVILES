// Detalle de un espacio + los turnos de hoy.
// Persona "Grilla y reservas": acá va el selector de día (7 días), la grilla completa y el botón Reservar.
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { EstadoPantalla } from '@/components/EstadoPantalla';
import { useCargar } from '@/hooks/useCargar';
import { espaciosServicio } from '@/servicios/espacios';
import { tamanos, useTema } from '@/tema/useTema';
import { hoyISO } from '@/utilidades/fechas';

export default function EspacioPantalla() {
  const t = useTema();
  const { id } = useLocalSearchParams<{ id: string }>();
  const fecha = hoyISO();

  const { datos, cargando, error, recargar } = useCargar(async () => {
    const [espacio, turnos] = await Promise.all([espaciosServicio.obtener(id), espaciosServicio.turnos(id, fecha)]);
    return { espacio, turnos };
  }, [id, fecha]);

  const colorDe = { libre: t.libre, reservado: t.ocupado, fijo: t.fijo, mantenimiento: t.mantenimiento } as const;
  const etiquetaDe = { libre: 'LIBRE', reservado: 'OCUPADO', fijo: 'FIJO', mantenimiento: 'MANTENIMIENTO' } as const;

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <EstadoPantalla cargando={cargando} error={error} vacio={!datos} mensajeVacio="No encontramos este espacio." onReintentar={recargar}>
        {datos && (
          <ScrollView contentContainerStyle={estilos.contenido}>
            <Text style={[estilos.titulo, { color: t.texto }]}>{datos.espacio.nombre}</Text>
            <Text style={[estilos.texto, { color: t.textoSuave }]}>{datos.espacio.complejo}</Text>
            <Text style={[estilos.texto, { color: t.textoSuave }]}>{datos.espacio.reglas}</Text>

            <Text style={[estilos.subtitulo, { color: t.texto }]}>Turnos de hoy ({fecha})</Text>
            {datos.turnos.map((turno) => (
              <View key={turno.id} style={[estilos.fila, { borderColor: t.borde, backgroundColor: t.tarjeta }]}>
                <Text style={[estilos.hora, { color: t.texto }]}>{turno.inicio}</Text>
                <Text style={[estilos.estado, { color: colorDe[turno.estado] }]}>
                  {etiquetaDe[turno.estado]}
                  {turno.motivoBloqueo ? ` — ${turno.motivoBloqueo}` : ''}
                </Text>
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
  contenido: { padding: 16, gap: 8 },
  titulo: { fontSize: tamanos.titulo, fontWeight: '800' },
  subtitulo: { fontSize: tamanos.titulo - 4, fontWeight: '700', marginTop: 16 },
  texto: { fontSize: tamanos.texto },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 12, borderRadius: 10, borderWidth: 1, minHeight: 48 },
  hora: { fontSize: tamanos.texto, fontWeight: '700', width: 64 },
  estado: { fontSize: tamanos.texto, fontWeight: '600', flexShrink: 1 },
});
