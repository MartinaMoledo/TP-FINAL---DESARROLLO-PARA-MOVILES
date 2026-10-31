
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  Image,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EstadoPantalla } from '@/components/EstadoPantalla';
import { useCargar } from '@/hooks/useCargar';
import { espaciosServicio } from '@/servicios/espacios';
import { tamanos, useTema } from '@/tema/useTema';

export default function EspaciosPantalla() {
  const t = useTema();

  const { datos, cargando, error, recargar } = useCargar(
    () => espaciosServicio.listar()
  );

  const [deporte, setDeporte] = useState('Todos');
  const [complejo, setComplejo] = useState('Todos');

  const deportes = useMemo(() => {
    const nombres = (datos ?? []).map((e) => e.nombre.split('—')[1]?.trim()).filter(Boolean);
    return ['Todos', ...new Set(nombres)];
  }, [datos]);

  const complejos = useMemo(
    () => ['Todos', ...new Set((datos ?? []).map((e) => e.complejo))],
    [datos]
  );

  const filtrados = useMemo(() => {
    return (datos ?? []).filter((e) => {
      const coincideDeporte =
        deporte === 'Todos' || e.nombre.includes(deporte);
      const coincideComplejo =
        complejo === 'Todos' || e.complejo === complejo;

      return coincideDeporte && coincideComplejo;
    });
  }, [datos, deporte, complejo]);

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
          data={filtrados}
          keyExtractor={(e) => e.id}
          contentContainerStyle={estilos.lista}
          refreshControl={
            <RefreshControl refreshing={cargando} onRefresh={recargar} />
          }
          ListHeaderComponent={
            <View style={estilos.filtros}>
              <Text style={[estilos.titulo, { color: t.texto }]}>
                Espacios deportivos
              </Text>

              <Text style={{ color: t.textoSuave }}>
                Filtrar por deporte
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {deportes.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setDeporte(d)}
                    style={[
                      estilos.filtro,
                      {
                        backgroundColor:
                          deporte === d ? '#D71920' : t.tarjeta,
                        borderColor: t.borde,
                      },
                    ]}
                  >
                    <Text style={{
                      color: deporte === d ? '#FFFFFF' : t.texto
                    }}>
                      {d}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={{ color: t.textoSuave }}>
                Filtrar por complejo
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {complejos.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setComplejo(c)}
                    style={[
                      estilos.filtro,
                      {
                        backgroundColor:
                          complejo === c ? '#D71920' : t.tarjeta,
                        borderColor: t.borde,
                      },
                    ]}
                  >
                    <Text style={{
                      color: complejo === c ? '#FFFFFF' : t.texto
                    }}>
                      {c}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          }
          ListEmptyComponent={
            <Text style={{ color: t.textoSuave, textAlign: 'center' }}>
              No hay espacios con estos filtros.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/espacio/[id]',
                  params: { id: item.id },
                })
              }
              style={[
                estilos.tarjeta,
                {
                  backgroundColor: t.tarjeta,
                  borderColor: t.borde,
                },
              ]}
            >
              <Text style={[estilos.nombre, { color: t.texto }]}>
                <Image
                  source={
                    item.id === 'esp-01'
                      ? require('../../../assets/canchas/cancha_01.jpg')
                      : require('../../../assets/canchas/cancha_02.jpg')
                  }
                  style={estilos.imagen}
                />{item.nombre}
              </Text>

              <Text style={[estilos.detalle, { color: t.textoSuave }]}>
                {item.complejo} · {item.superficie}
              </Text>

              <Text style={[estilos.detalle, { color: t.textoSuave }]}>
                {item.iluminacion ? 'Con luz' : 'Sin luz'} · $
                {item.precioPorHora.toLocaleString('es-AR')} por hora
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
  filtros: { gap: 12, marginBottom: 16 },
  titulo: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  filtro: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  tarjeta: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    minHeight: tamanos.boton,
  },
  nombre: { fontSize: tamanos.titulo - 4, fontWeight: '700' },
  detalle: { fontSize: tamanos.texto },
  imagen: {
  width: '100%',
  height: 170,
  borderRadius: 10,
  marginBottom: 8,
  },
});
