// Agenda del día para el personal: quién viene, a qué hora y a qué cancha.
// Muestra las reservas (con teléfono y "Marcar ausente"), las reservas fijas y los bloqueos.
// Los turnos libres no se muestran: eso lo mira el jugador en la grilla, no el encargado.
import { useMemo, useState } from 'react';
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
import { personalServicio, type BloqueDelDia, type ReservaDelDia } from '@/servicios/personal';
import { fuente } from '@/tema/tipografia';
import { tamanos, useTema } from '@/tema/useTema';
import { hoyISO } from '@/utilidades/fechas';

// Una fila de la agenda: una reserva, o una fija o un bloqueo.
type Fila =
  | { tipo: 'reserva'; id: string; inicio: string; espacio: string; reserva: ReservaDelDia }
  | { tipo: 'bloque'; id: string; inicio: string; espacio: string; bloque: BloqueDelDia };

/** "1 reserva" / "3 reservas". */
function plural(cantidad: number, singular: string, varios: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : varios}`;
}

export default function AgendaPantalla() {
  const t = useTema();
  const [fecha, setFecha] = useState(hoyISO());
  const [marcando, setMarcando] = useState<string | null>(null);

  const { datos, cargando, error, recargar } = useCargar(
    () => personalServicio.agendaDelDia(fecha),
    [fecha]
  );

  // Todo junto y en orden de hora, como se vive el día en la puerta.
  const filas = useMemo<Fila[]>(() => {
    if (!datos) return [];
    const reservas: Fila[] = datos.reservas.map((r) => ({
      tipo: 'reserva',
      id: r.reserva.id,
      inicio: r.turno?.inicio ?? '99:99',
      espacio: r.espacio?.nombre ?? '',
      reserva: r,
    }));
    const bloques: Fila[] = datos.bloques.map((b, i) => ({
      tipo: 'bloque',
      id: `bloque-${i}`,
      inicio: b.inicio,
      espacio: b.espacio?.nombre ?? '',
      bloque: b,
    }));
    return [...reservas, ...bloques].sort(
      (a, b) => a.inicio.localeCompare(b.inicio) || a.espacio.localeCompare(b.espacio)
    );
  }, [datos]);

  const cantidadReservas = datos?.reservas.length ?? 0;
  const cantidadFijas = datos?.bloques.filter((b) => b.tipo === 'fijo').length ?? 0;
  const cantidadBloqueos = datos?.bloques.filter((b) => b.tipo === 'mantenimiento').length ?? 0;

  function confirmarAusencia(item: ReservaDelDia) {
    const nombre = item.usuario?.nombre ?? 'esta persona';
    Alert.alert('Marcar ausente', `¿Marcar a ${nombre} como ausente? Se libera su turno.`, [
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
            Alert.alert('No se pudo marcar', e instanceof ErrorApi ? e.message : 'Ocurrió un error.');
          } finally {
            setMarcando(null);
          }
        },
      },
    ]);
  }

  function renderReserva(item: ReservaDelDia) {
    const etiqueta = etiquetaDeReserva(item.reserva.estado);
    const nombre = item.usuario?.nombre ?? 'Jugador sin datos';
    const telefono = item.usuario?.telefono ?? 'Sin teléfono';
    // El PRD: "que quien cancela tarde repetidas veces quede marcado... quiero saberlo".
    const tardias = item.usuario?.cancelacionesTardias ?? 0;

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

        <View style={estilos.filaNombre}>
          <Text style={[estilos.texto, { color: t.textoSuave }]}>
            {nombre} · {item.reserva.cantidadPersonas} personas
          </Text>
          {tardias > 0 ? (
            <Etiqueta
              texto={`Canceló tarde ${tardias} ${tardias === 1 ? 'vez' : 'veces'}`}
              tono="advertencia"
            />
          ) : null}
        </View>

        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Llamar a ${nombre}`}
          disabled={!item.usuario?.telefono}
          onPress={() => {
            const numero = item.usuario?.telefono;
            if (numero) Linking.openURL(`tel:${numero.replace(/[^\d+]/g, '')}`);
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
  }

  function renderBloque(bloque: BloqueDelDia) {
    const esFija = bloque.tipo === 'fijo';
    return (
      <Tarjeta style={estilos.tarjeta}>
        <View style={estilos.filaSuperior}>
          <Text style={[estilos.horario, { color: t.texto }]}>
            {bloque.inicio} a {bloque.fin}
          </Text>
          <Etiqueta
            texto={esFija ? 'Fija' : 'Bloqueado'}
            tono={esFija ? 'fijo' : 'mantenimiento'}
          />
        </View>
        <Text style={[estilos.espacio, { color: t.texto }]}>
          {bloque.espacio?.nombre ?? 'Espacio sin datos'}
        </Text>
        <Text style={[estilos.texto, { color: t.textoSuave }]}>
          {esFija ? `Reserva fija · ${bloque.detalle}` : `Motivo: ${bloque.detalle}`}
        </Text>
      </Tarjeta>
    );
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <SelectorFecha fecha={fecha} onCambiar={setFecha} />

      <EstadoPantalla
        cargando={cargando}
        error={error}
        vacio={!!datos && filas.length === 0}
        mensajeVacio="No hay reservas, fijas ni bloqueos para este día."
        onReintentar={recargar}
      >
        <FlatList
          data={filas}
          keyExtractor={(fila) => fila.id}
          contentContainerStyle={estilos.lista}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={recargar} />}
          ListHeaderComponent={
            <Text style={[estilos.resumen, { color: t.textoSuave }]}>
              {[
                plural(cantidadReservas, 'reserva', 'reservas'),
                cantidadFijas > 0 ? plural(cantidadFijas, 'fija', 'fijas') : null,
                cantidadBloqueos > 0 ? plural(cantidadBloqueos, 'bloqueo', 'bloqueos') : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              {cantidadReservas > 0 ? ' · tocá el teléfono para llamar' : ''}
            </Text>
          }
          renderItem={({ item }) =>
            item.tipo === 'reserva' ? renderReserva(item.reserva) : renderBloque(item.bloque)
          }
        />
      </EstadoPantalla>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  lista: { padding: 16, paddingTop: 0, gap: 12 },
  resumen: { fontSize: 15, marginBottom: 4, fontFamily: fuente.regular },
  tarjeta: { gap: 6 },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  filaNombre: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  horario: { fontSize: tamanos.texto, fontFamily: fuente.negrita },
  espacio: { fontSize: tamanos.texto, fontFamily: fuente.seminegrita },
  texto: { fontSize: 15, fontFamily: fuente.regular },
  telefono: { fontSize: 15, fontFamily: fuente.seminegrita },
  boton: { marginTop: 8, minHeight: 48 },
});
