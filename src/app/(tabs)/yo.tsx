// PROVISORIO: botón de ingreso con el usuario de prueba, para verificar que sesión y token funcionan.
// Persona "Cuenta y sesión": reemplazar por registro, login con formulario y huella (expo-local-authentication).
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ErrorApi } from '@/servicios/cliente';
import { authServicio } from '@/servicios/auth';
import type { Usuario } from '@/tipos';
import { tamanos, useTema } from '@/tema/useTema';

export default function YoPantalla() {
  const t = useTema();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    authServicio.miUsuario().then(setUsuario).catch(() => setUsuario(null));
  }, []);

  async function ingresarDePrueba() {
    setMensaje(null);
    try {
      const sesion = await authServicio.ingresar('emiliano@mail.com', 'villaguay2026');
      setUsuario(sesion.usuario);
    } catch (e) {
      setMensaje(e instanceof ErrorApi ? e.message : 'Algo salió mal.');
    }
  }

  async function salir() {
    await authServicio.salir();
    setUsuario(null);
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      {usuario ? (
        <>
          <Text style={[estilos.titulo, { color: t.texto }]}>Hola, {usuario.nombre}</Text>
          <Text style={[estilos.texto, { color: t.textoSuave }]}>{usuario.email} · {usuario.rol}</Text>
          <Pressable onPress={salir} style={[estilos.boton, { backgroundColor: t.primario }]}>
            <Text style={[estilos.textoBoton, { color: t.sobrePrimario }]}>Salir</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={[estilos.texto, { color: t.textoSuave }]}>No iniciaste sesión.</Text>
          <Pressable onPress={ingresarDePrueba} style={[estilos.boton, { backgroundColor: t.primario }]}>
            <Text style={[estilos.textoBoton, { color: t.sobrePrimario }]}>Ingresar con usuario de prueba</Text>
          </Pressable>
          {mensaje && <Text style={[estilos.texto, { color: t.error }]}>{mensaje}</Text>}
        </>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 24, gap: 16, justifyContent: 'center' },
  titulo: { fontSize: tamanos.titulo, fontWeight: '800' },
  texto: { fontSize: tamanos.texto },
  boton: { minHeight: tamanos.boton, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  textoBoton: { fontSize: tamanos.texto, fontWeight: '700' },
});
