// Panel del personal: bloqueos, reservas fijas, precio por hora y fotos del estado de las canchas.
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChipSeleccion } from '@/components/panel/ChipSeleccion';
import { PanelBloqueos } from '@/components/panel/PanelBloqueos';
import { PanelEspacios } from '@/components/panel/PanelEspacios';
import { PanelFijas } from '@/components/panel/PanelFijas';
import { PanelPrecios } from '@/components/panel/PanelPrecios';
import { EstadoPantalla } from '@/components/EstadoPantalla';
import { useSesion } from '@/contextos/SesionContexto';
import { useCargar } from '@/hooks/useCargar';
import { personalServicio } from '@/servicios/personal';
import { fuente } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

type Modo = 'bloqueos' | 'fijas' | 'precios' | 'espacios';

const MODOS: { id: Modo; texto: string }[] = [
  { id: 'bloqueos', texto: 'Bloqueos' },
  { id: 'fijas', texto: 'Reservas fijas' },
  { id: 'precios', texto: 'Precios' },
  { id: 'espacios', texto: 'Espacios' },
];

export default function PanelPantalla() {
  const t = useTema();
  const { usuario } = useSesion();
  const [modo, setModo] = useState<Modo>('bloqueos');

  const esAdmin = usuario?.rol === 'administrador';

  const { datos: espacios, cargando, error, recargar } = useCargar(
    () => personalServicio.espacios(),
    []
  );

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <EstadoPantalla
        cargando={cargando}
        error={error}
        vacio={!!espacios && espacios.length === 0}
        mensajeVacio="No hay canchas cargadas para administrar."
        onReintentar={recargar}
      >
        <ScrollView contentContainerStyle={estilos.contenido}>
          <Text style={[estilos.titulo, { color: t.texto }]} role="heading">
            Panel del personal
          </Text>

          <View style={estilos.modos}>
            {MODOS.map((opcion) => (
              <ChipSeleccion
                key={opcion.id}
                texto={opcion.texto}
                activo={modo === opcion.id}
                onPress={() => setModo(opcion.id)}
              />
            ))}
          </View>

          {modo === 'bloqueos' ? (
            <PanelBloqueos espacios={espacios ?? []} />
          ) : modo === 'fijas' ? (
            <PanelFijas espacios={espacios ?? []} esAdmin={esAdmin} />
          ) : modo === 'precios' ? (
            <PanelPrecios
              espacios={espacios ?? []}
              esAdmin={esAdmin}
              recargarEspacios={recargar}
            />
          ) : (
            <PanelEspacios espacios={espacios ?? []} />
          )}
        </ScrollView>
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { padding: 16, paddingBottom: 32, gap: 14 },
  titulo: { fontSize: 28, fontFamily: fuente.negrita },
  modos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
