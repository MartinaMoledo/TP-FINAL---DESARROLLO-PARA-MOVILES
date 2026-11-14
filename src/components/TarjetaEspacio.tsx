// Tarjeta del listado de espacios: nombre, estado del día, etiquetas y una franja de foto
// de todo el ancho abajo, a modo de previsualización.
import { Image, type ImageSource } from 'expo-image';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useMarca } from '@/tema/marca';
import { fuente } from '@/tema/tipografia';
import type { Espacio } from '@/tipos';
import { complejoDe } from '@/utilidades/complejo';

export type EstadoDelDia =
  | 'disponible'
  | 'completa'
  | 'mantenimiento'
  | 'consultando'
  | 'sin-datos';

type Props = {
  espacio: Espacio;
  deporte: string;
  estado: EstadoDelDia;
  foto: ImageSource | number | null;
  onPress: () => void;
};

function EtiquetaChica({ texto, fondo, color }: { texto: string; fondo: string; color: string }) {
  return (
    <View style={[estilos.etiqueta, { backgroundColor: fondo }]}>
      <Text style={[estilos.textoEtiqueta, { color }]}>{texto}</Text>
    </View>
  );
}

export function TarjetaEspacio({ espacio, deporte, estado, foto, onPress }: Props) {
  const m = useMarca();
  // Completa o en mantenimiento: no se puede reservar, la tarjeta va en gris.
  const llena = estado === 'completa' || estado === 'mantenimiento';

  const colores = llena
    ? {
        fondo: m.tarjetaLlena,
        texto: m.textoLlena,
        estadoFondo: m.etiquetaLlenaFondo,
        estadoTexto: m.etiquetaLlenaTexto,
        flechaFondo: m.flechaLlenaFondo,
        flechaIcono: m.flechaLlenaIcono,
      }
    : {
        fondo: m.tarjetaLibre,
        texto: m.textoLibre,
        estadoFondo: m.etiquetaLibreFondo,
        estadoTexto: m.etiquetaLibreTexto,
        flechaFondo: m.flechaLibreFondo,
        flechaIcono: m.flechaLibreIcono,
      };

  const textoEstado = {
    disponible: 'Disponible',
    completa: 'Completa',
    mantenimiento: 'En mantenimiento',
    consultando: 'Consultando…',
    'sin-datos': 'Sin datos',
  }[estado];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${espacio.nombre}, ${textoEstado}. Ver ficha`}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.tarjeta,
        { backgroundColor: colores.fondo, opacity: pressed ? 0.88 : 1 },
      ]}
    >
      <View style={estilos.arriba}>
        <View style={estilos.titulos}>
          <Text style={[estilos.nombre, { color: colores.texto }]}>{espacio.nombre}</Text>
          <Text style={[estilos.sub, { color: colores.texto }]}>
            {deporte}
            {complejoDe(espacio) ? ` · ${complejoDe(espacio)}` : ''}
          </Text>
        </View>

        <View style={[estilos.flecha, { backgroundColor: colores.flechaFondo }]}>
          <Ionicons name="arrow-forward" size={22} color={colores.flechaIcono} />
        </View>
      </View>

      <View style={estilos.etiquetas}>
        <EtiquetaChica
          texto={textoEstado}
          fondo={colores.estadoFondo}
          color={colores.estadoTexto}
        />
        <EtiquetaChica
          texto={espacio.superficie.charAt(0).toUpperCase() + espacio.superficie.slice(1)}
          fondo="rgba(255,255,255,0.2)"
          color={colores.texto}
        />
        <EtiquetaChica
          texto={espacio.iluminacion ? 'Con luz' : 'Sin luz'}
          fondo="rgba(255,255,255,0.2)"
          color={colores.texto}
        />
      </View>

      {foto ? (
        <Image
          source={foto}
          contentFit="cover"
          transition={150}
          accessibilityIgnoresInvertColors
          style={estilos.franja}
        />
      ) : (
        <View style={[estilos.franja, estilos.sinFoto]}>
          <Ionicons name="image-outline" size={26} color={colores.texto} />
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tarjeta: { borderRadius: 22, overflow: 'hidden' },
  arriba: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  titulos: { flex: 1, gap: 2 },
  nombre: { fontSize: 24, fontFamily: fuente.seminegrita },
  sub: { fontSize: 15, fontFamily: fuente.regular, opacity: 0.9 },
  flecha: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etiquetas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
  },
  etiqueta: { borderRadius: 6, paddingHorizontal: 9, paddingVertical: 3 },
  textoEtiqueta: { fontSize: 13, fontFamily: fuente.seminegrita },
  // Proporción fija 16:5: la foto se recorta igual en todas las tarjetas.
  franja: { width: '100%', aspectRatio: 16 / 5 },
  sinFoto: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
});
