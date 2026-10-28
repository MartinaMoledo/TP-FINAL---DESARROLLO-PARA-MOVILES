// Pantalla de ejemplo: lista de espacios con carga, error y vacío resueltos.
// Persona "Espacios y mapa": acá van los filtros por deporte y complejo, y el mapa.
import { router } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { EstadoPantalla } from '@/components/EstadoPantalla';
import { useCargar } from '@/hooks/useCargar';
import { espaciosServicio } from '@/servicios/espacios';
import { tamanos, useTema } from '@/tema/useTema';

export default function EspaciosPantalla() {
  const t = useTema();
  const { datos, cargando, error, recargar } = useCargar(() => espaciosServicio.listar());

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <EstadoPantalla
        cargando={cargando && !datos}
        error={error}
        vacio={!!datos && datos.length === 0}
        mensajeVacio="Todavía no hay espacios cargados."
        onReintentar={recargar}
      >
        <FlatList
          data={datos ?? []}
          keyExtractor={(e) => e.id}
          contentContainerStyle={estilos.lista}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/espacio/[id]', params: { id: item.id } })}
              style={[estilos.tarjeta, { backgroundColor: t.tarjeta, borderColor: t.borde }]}
            >
              <Text style={[estilos.nombre, { color: t.texto }]}>{item.nombre}</Text>
              <Text style={[estilos.detalle, { color: t.textoSuave }]}>
                {item.complejo} · {item.superficie}
              </Text>
              <Text style={[estilos.detalle, { color: t.textoSuave }]}>
                {item.iluminacion ? 'Con luz' : 'Sin luz'} · ${item.precioPorHora.toLocaleString('es-AR')} por hora
              </Text>
            </Pressable>
          )}
        />
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  lista: { padding: 16, gap: 12 },
  tarjeta: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 4, minHeight: tamanos.boton },
  nombre: { fontSize: tamanos.titulo - 4, fontWeight: '700' },
  detalle: { fontSize: tamanos.texto },
});
