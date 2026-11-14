import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Tarjeta } from '@/components/Tarjeta';
import { useSesion } from '@/contextos/SesionContexto';
import { ErrorApi } from '@/servicios/cliente';
import { fuente } from '@/tema/tipografia';
import { tamanos, useTema } from '@/tema/useTema';

export default function IngresoPantalla() {
  const t = useTema();
  const { ingresar } = useSesion();

  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar() {
    if (!email.trim() || !contrasena) {
      setError('Completá el email y la contraseña.');
      return;
    }

    setError(null);
    setCargando(true);
    try {
      await ingresar(email.trim(), contrasena);
      // La guardia de sesión redirige según el rol.
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'No pudimos ingresar. Probá de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  function completarDemo(cuenta: 'jugador' | 'encargado' | 'administrador') {
    setError(null);

    const correos = {
      jugador: 'emiliano@mail.com',
      encargado: 'marcelo@villaguay.demo.ar',
      administrador: 'nahuel@villaguay.demo.ar',
    };

    setEmail(correos[cuenta]);
    setContrasena('villaguay2026');
  }

  return (
    <KeyboardAvoidingView
      style={[estilos.pantalla, { backgroundColor: t.fondo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <View style={estilos.encabezado}>
          <Text style={[estilos.titulo, { color: t.texto }]}>Tu cuenta</Text>
          <Text style={[estilos.texto, { color: t.textoSuave }]}>
            Ingresá para reservar, ver tus turnos y gestionar la agenda.
          </Text>
        </View>

        <Tarjeta style={estilos.formulario}>
          <CampoTexto
            etiqueta="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="vos@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
          />
          <CampoTexto
            etiqueta="Contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            placeholder="Tu contraseña"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            onSubmitEditing={enviar}
            returnKeyType="go"
          />

          {error ? <Text style={[estilos.error, { color: t.error }]}>{error}</Text> : null}

          <Boton titulo="Ingresar" onPress={enviar} cargando={cargando} />
        </Tarjeta>

        <Tarjeta style={estilos.demo}>
          <Text style={[estilos.demoTitulo, { color: t.texto }]}>Cuentas de prueba</Text>
          <Text style={[estilos.texto, { color: t.textoSuave }]}>
            Contraseña: <Text style={{ fontFamily: fuente.negrita }}>villaguay2026</Text>
          </Text>
          <View style={estilos.fila}>
            <Boton
              titulo="Jugador"
              variante="secundario"
              onPress={() => completarDemo('jugador')}
              style={estilos.botonDemo}
            />
            <Boton
              titulo="Encargado"
              variante="secundario"
              onPress={() => completarDemo('encargado')}
              style={estilos.botonDemo}
            />
            <Boton
              titulo="Administrador"
              variante="secundario"
              onPress={() => completarDemo('administrador')}
              style={estilos.botonDemo}
            />
          </View>
        </Tarjeta>

        <Pressable onPress={() => router.push('/(auth)/registro')} style={estilos.enlace}>
          <Text style={[estilos.enlaceTexto, { color: t.primario }]}>
            ¿No tenés cuenta? Crear una
          </Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/(tabs)')} style={estilos.enlace}>
          <Text style={[estilos.texto, { color: t.textoSuave, textAlign: 'center' }]}>
            Seguir mirando espacios sin cuenta
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1 },
  contenido: { padding: 20, paddingBottom: 40, gap: 16 },
  encabezado: { gap: 6, marginTop: 8 },
  titulo: { fontSize: 30, fontFamily: fuente.negrita },
  texto: { fontSize: tamanos.texto, lineHeight: 23, fontFamily: fuente.regular },
  formulario: { gap: 14 },
  demo: { gap: 10 },
  demoTitulo: { fontSize: tamanos.texto, fontFamily: fuente.negrita },
  // Un botón debajo del otro: en fila, "Administrador" no entraba y el texto se cortaba.
  fila: { gap: 10 },
  botonDemo: { minHeight: 48 },
  error: { fontSize: 14, fontFamily: fuente.seminegrita },
  enlace: { paddingVertical: 6 },
  enlaceTexto: { fontSize: tamanos.texto, fontFamily: fuente.negrita, textAlign: 'center' },
});
