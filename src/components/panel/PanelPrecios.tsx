// Cambiar el precio por hora de cada cancha.
import { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Etiqueta } from '@/components/Etiqueta';
import { precioConMoneda, mensajeDeError } from '@/components/panel/comunes';
import { Tarjeta } from '@/components/Tarjeta';
import { personalServicio } from '@/servicios/personal';
import { fuente } from '@/tema/tipografia';
import { tamanos, useTema } from '@/tema/useTema';
import type { Espacio } from '@/tipos';

type Props = {
  espacios: Espacio[];
  esAdmin: boolean;
  recargarEspacios: () => void;
};

export function PanelPrecios({ espacios, esAdmin, recargarEspacios }: Props) {
  const t = useTema();
  const [editando, setEditando] = useState<Espacio | null>(null);
  const [precio, setPrecio] = useState('');
  const [guardando, setGuardando] = useState(false);

  function abrir(espacio: Espacio) {
    setEditando(espacio);
    setPrecio(String(espacio.precioPorHora));
  }

  function cerrar() {
    if (guardando) return;
    setEditando(null);
    setPrecio('');
  }

  function guardar() {
    if (!editando) return;

    const valor = Number(precio.replace(/[^\d]/g, ''));
    if (!Number.isInteger(valor) || valor < 1) {
      Alert.alert('Precio inválido', 'Escribí un número entero de pesos mayor que cero.');
      return;
    }

    setGuardando(true);
    personalServicio
      .cambiarPrecio(editando.id, valor)
      .then(() => {
        Alert.alert(
          'Precio actualizado',
          `${editando.nombre} ahora sale ${precioConMoneda(valor)} por hora.`
        );
        setEditando(null);
        setPrecio('');
        recargarEspacios();
      })
      .catch((e) => Alert.alert('No se pudo cambiar', mensajeDeError(e)))
      .finally(() => setGuardando(false));
  }

  return (
    <View style={estilos.seccion}>
      <Text style={[estilos.titulo, { color: t.texto }]}>Precio por hora</Text>
      <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
        El cambio se ve en la ficha de la cancha y en la grilla de turnos.
      </Text>

      {!esAdmin ? (
        <Tarjeta>
          <Text style={[estilos.aviso, { color: t.textoSuave }]}>
            Sólo el administrador puede cambiar los precios. Desde acá podés consultarlos.
          </Text>
        </Tarjeta>
      ) : null}

      <View style={estilos.lista}>
        {espacios.map((espacio) => (
          <Tarjeta key={espacio.id} style={estilos.tarjeta}>
            <View style={estilos.filaSuperior}>
              <Text style={[estilos.nombre, { color: t.texto }]}>{espacio.nombre}</Text>
              <Etiqueta texto={precioConMoneda(espacio.precioPorHora)} tono="exito" />
            </View>
            <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
              {espacio.complejo} · por hora
            </Text>
            {esAdmin ? (
              <Boton
                titulo="Cambiar precio"
                variante="secundario"
                onPress={() => abrir(espacio)}
                style={estilos.boton}
              />
            ) : null}
          </Tarjeta>
        ))}
      </View>

      <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
        Se listan las canchas activas.
      </Text>

      <Modal
        visible={!!editando}
        transparent
        animationType="fade"
        onRequestClose={cerrar}
      >
        <View style={estilos.fondoModal}>
          <View style={[estilos.hoja, { backgroundColor: t.tarjeta }]}>
            <Text style={[estilos.tituloModal, { color: t.texto }]}>
              {editando?.nombre ?? 'Cambiar precio'}
            </Text>
            <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
              Precio actual: {editando ? precioConMoneda(editando.precioPorHora) : '—'} por
              hora.
            </Text>

            <CampoTexto
              etiqueta="Precio por hora"
              placeholder="12000"
              ayuda="Número entero de pesos, sin puntos."
              value={precio}
              onChangeText={setPrecio}
              keyboardType="number-pad"
              maxLength={9}
            />

            <View style={estilos.accionesModal}>
              <Boton
                titulo="Cancelar"
                variante="secundario"
                onPress={cerrar}
                deshabilitado={guardando}
                style={estilos.botonModal}
              />
              <Boton
                titulo="Guardar"
                onPress={guardar}
                cargando={guardando}
                deshabilitado={guardando}
                style={estilos.botonModal}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  seccion: { gap: 14 },
  titulo: { fontSize: tamanos.titulo, fontFamily: fuente.negrita },
  ayuda: { fontSize: 14, lineHeight: 20, fontFamily: fuente.regular },
  aviso: { fontSize: 15, lineHeight: 22, fontFamily: fuente.regular },
  lista: { gap: 10 },
  tarjeta: { gap: 6 },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  nombre: { flex: 1, fontSize: tamanos.texto, fontFamily: fuente.negrita },
  boton: { minHeight: 48, marginTop: 6 },
  fondoModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  hoja: { borderRadius: 20, padding: 18, gap: 12 },
  tituloModal: { fontSize: 22, fontFamily: fuente.negrita },
  accionesModal: { flexDirection: 'row', gap: 8 },
  botonModal: { flex: 1, minHeight: 48 },
});
