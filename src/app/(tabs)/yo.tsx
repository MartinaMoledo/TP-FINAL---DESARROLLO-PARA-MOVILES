// Cuenta y sesión: perfil, rol, datos de contacto y salida.
import { router } from 'expo-router';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Boton } from '@/components/Boton';
import { Etiqueta } from '@/components/Etiqueta';
import { Tarjeta } from '@/components/Tarjeta';
import { esPersonal, useSesion } from '@/contextos/SesionContexto';
import { tamanos, useTema } from '@/tema/useTema';
import type { Rol } from '@/tipos';

const NOMBRE_ROL: Record<Rol, string> = {
  jugador: 'Jugador',
  encargado: 'Encargado',
  administrador: 'Administrador',
};

export default function YoPantalla() {
  const t = useTema();
  const { usuario, salir } = useSesion();

  function confirmarSalida() {
    Alert.alert('Cerrar sesión', '¿Querés salir de tu cuenta?', [
      { text: 'Volver', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await salir();
          router.replace('/(tabs)');
        },
      },
    ]);
  }

  if (!usuario) {
    return (
      <ScrollView
        style={{ backgroundColor: t.fondo }}
        contentContainerStyle={estilos.contenido}
      >
        <View style={estilos.encabezado}>
          <Text style={[estilos.titulo, { color: t.texto }]}>Tu cuenta</Text>
          <Text style={[estilos.texto, { color: t.textoSuave }]}>
            Podés mirar espacios y disponibilidad sin cuenta. Para reservar y ver tus
            turnos, ingresá o creá una cuenta.
          </Text>
        </View>

        <Tarjeta style={estilos.tarjeta}>
          <Boton
            titulo="Ingresar"
            onPress={() => router.push('/(auth)/ingreso')}
          />
          <Boton
            titulo="Crear cuenta"
            variante="secundario"
            onPress={() => router.push('/(auth)/registro')}
          />
        </Tarjeta>

        <Tarjeta style={estilos.tarjeta}>
          <Text style={[estilos.subtitulo, { color: t.texto }]}>Sin cuenta también podés</Text>
          <Text style={[estilos.texto, { color: t.textoSuave }]}>
            Ver los espacios, los precios y la grilla de turnos de los próximos días.
          </Text>
          <Boton
            titulo="Ver espacios"
            variante="fantasma"
            onPress={() => router.replace('/(tabs)')}
          />
        </Tarjeta>
      </ScrollView>
    );
  }

  const inicial = usuario.nombre.trim().charAt(0).toUpperCase() || '?';

  return (
    <ScrollView
      style={{ backgroundColor: t.fondo }}
      contentContainerStyle={estilos.contenido}
    >
      <View style={estilos.perfil}>
        <View style={[estilos.avatar, { backgroundColor: t.primario }]}>
          <Text style={[estilos.inicial, { color: t.sobrePrimario }]}>{inicial}</Text>
        </View>
        <Text style={[estilos.titulo, { color: t.texto }]}>{usuario.nombre}</Text>
        <Text style={[estilos.texto, { color: t.textoSuave }]}>{usuario.email}</Text>
        <Etiqueta texto={NOMBRE_ROL[usuario.rol]} tono="exito" />
      </View>

      <Tarjeta style={estilos.tarjeta}>
        <Text style={[estilos.subtitulo, { color: t.texto }]}>Datos de contacto</Text>
        <View style={estilos.dato}>
          <Text style={[estilos.etiquetaDato, { color: t.textoSuave }]}>Teléfono</Text>
          <Text style={[estilos.valorDato, { color: t.texto }]}>{usuario.telefono}</Text>
        </View>
        <View style={estilos.dato}>
          <Text style={[estilos.etiquetaDato, { color: t.textoSuave }]}>Rol</Text>
          <Text style={[estilos.valorDato, { color: t.texto }]}>
            {NOMBRE_ROL[usuario.rol]}
          </Text>
        </View>
        <View style={estilos.dato}>
          <Text style={[estilos.etiquetaDato, { color: t.textoSuave }]}>Favoritos</Text>
          <Text style={[estilos.valorDato, { color: t.texto }]}>
            {usuario.espaciosFavoritos.length}
          </Text>
        </View>
        <View style={estilos.dato}>
          <Text style={[estilos.etiquetaDato, { color: t.textoSuave }]}>Ausencias</Text>
          <Text style={[estilos.valorDato, { color: t.texto }]}>
            {usuario.ausencias} · {usuario.cancelacionesTardias} cancelaciones tardías
          </Text>
        </View>
      </Tarjeta>

      {esPersonal(usuario) ? (
        <Tarjeta style={estilos.tarjeta}>
          <Text style={[estilos.subtitulo, { color: t.texto }]}>Zona del personal</Text>
          <Text style={[estilos.texto, { color: t.textoSuave }]}>
            Desde las pestañas podés ver la agenda, las reservas del día con los teléfonos
            y registrar ingresos escaneando el QR.
          </Text>
          <Boton
            titulo="Ir a la agenda"
            onPress={() => router.replace('/(tabs)/agenda')}
          />
        </Tarjeta>
      ) : null}

      <Boton titulo="Cerrar sesión" variante="peligro" onPress={confirmarSalida} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 20, paddingBottom: 40, gap: 16 },
  encabezado: { gap: 6, marginTop: 8 },
  perfil: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: { fontSize: 34, fontWeight: '800' },
  titulo: { fontSize: 30, fontWeight: '800', textAlign: 'center' },
  subtitulo: { fontSize: tamanos.texto, fontWeight: '800' },
  texto: { fontSize: tamanos.texto, lineHeight: 23 },
  tarjeta: { gap: 12 },
  dato: { gap: 2 },
  etiquetaDato: { fontSize: 14, fontWeight: '600' },
  valorDato: { fontSize: tamanos.texto, fontWeight: '600' },
});
