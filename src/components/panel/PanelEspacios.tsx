// Panel → Espacios: la lista de canchas para que el personal suba fotos del estado.
// El PRD pide "subir fotos del estado de una cancha" desde la galería (expo-image-picker).
// No dice quién: lo dejamos al personal, porque es un reporte de cómo está la cancha.
// Las fotos quedan en este teléfono (la API no tiene dónde guardarlas) y se ven en la ficha.
import Ionicons from '@react-native-vector-icons/ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { Tarjeta } from '@/components/Tarjeta';
import { descargasServicio } from '@/servicios/descargas';
import { fuente } from '@/tema/tipografia';
import { tamanos, useTema } from '@/tema/useTema';
import type { Espacio } from '@/tipos';
import { complejoDe } from '@/utilidades/complejo';

type Props = { espacios: Espacio[] };

export function PanelEspacios({ espacios }: Props) {
  const t = useTema();
  // Fotos subidas por espacio. Se leen del teléfono al abrir y después de cada subida.
  const [fotos, setFotos] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(espacios.map((e) => [e.id, descargasServicio.fotosSubidas(e.id)]))
  );
  const [subiendo, setSubiendo] = useState<string | null>(null);

  async function subirFoto(espacio: Espacio) {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (resultado.canceled) return;

    setSubiendo(espacio.id);
    try {
      await descargasServicio.guardarFotoSubida(espacio.id, resultado.assets[0].uri);
      setFotos((actual) => ({
        ...actual,
        [espacio.id]: descargasServicio.fotosSubidas(espacio.id),
      }));
      Alert.alert('Foto guardada', `Quedó en este teléfono, en la ficha de ${espacio.nombre}.`);
    } catch {
      Alert.alert('No pudimos guardar la foto', 'Probá de nuevo.');
    } finally {
      setSubiendo(null);
    }
  }

  return (
    <View style={estilos.lista}>
      <Text style={[estilos.ayuda, { color: t.textoSuave }]}>
        Subí desde la galería una foto de cómo está cada cancha.
      </Text>

      {espacios.map((espacio) => {
        const subidas = fotos[espacio.id] ?? [];
        const complejo = complejoDe(espacio);
        return (
          <Tarjeta key={espacio.id} style={estilos.tarjeta}>
            <Text style={[estilos.nombre, { color: t.texto }]}>{espacio.nombre}</Text>
            <Text style={[estilos.detalle, { color: t.textoSuave }]}>
              {[complejo, `${subidas.length} ${subidas.length === 1 ? 'foto' : 'fotos'} del estado`]
                .filter(Boolean)
                .join(' · ')}
            </Text>

            {subidas.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={estilos.miniaturas}>
                  {subidas.map((uri) => (
                    <Image key={uri} source={{ uri }} style={estilos.miniatura} contentFit="cover" />
                  ))}
                </View>
              </ScrollView>
            ) : null}

            <View style={estilos.acciones}>
              <Boton
                titulo="Subir foto"
                icono={<Ionicons name="images-outline" size={20} color={t.sobrePrimario} />}
                onPress={() => subirFoto(espacio)}
                cargando={subiendo === espacio.id}
                deshabilitado={subiendo !== null}
                style={estilos.boton}
              />
              <Boton
                titulo="Ver ficha"
                variante="secundario"
                onPress={() =>
                  router.push({ pathname: '/ficha/[id]', params: { id: espacio.id } })
                }
                style={estilos.boton}
              />
            </View>
          </Tarjeta>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  lista: { gap: 12 },
  ayuda: { fontSize: 15, lineHeight: 22, fontFamily: fuente.regular },
  tarjeta: { gap: 8 },
  nombre: { fontSize: tamanos.texto, fontFamily: fuente.seminegrita },
  detalle: { fontSize: 15, fontFamily: fuente.regular },
  miniaturas: { flexDirection: 'row', gap: 8 },
  miniatura: { width: 64, height: 64, borderRadius: 10 },
  acciones: { flexDirection: 'row', gap: 8 },
  boton: { flex: 1 },
});
