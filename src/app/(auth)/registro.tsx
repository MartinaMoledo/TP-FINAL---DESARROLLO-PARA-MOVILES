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

const TELEFONO_VALIDO = /^\+?[0-9][0-9 ()-]{5,28}$/;

export default function RegistroPantalla() {
  const t = useTema();
  const { registrar } = useSesion();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar() {
    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim();
    const telefonoLimpio = telefono.trim();

    if (!nombreLimpio) return setError('Falta tu nombre.');
    if (!emailLimpio.includes('@')) return setError('El email no es válido.');
    if (!TELEFONO_VALIDO.test(telefonoLimpio)) {
      return setError('El teléfono no es válido: usá sólo números, espacios o guiones.');
    }
    if (contrasena.length < 8) {
      return setError('La contraseña tiene que tener al menos 8 caracteres.');
    }
    if (contrasena !== repetir) return setError('Las contraseñas no coinciden.');

    setError(null);
    setCargando(true);
    try {
      await registrar({
        nombre: nombreLimpio,
        email: emailLimpio,
        telefono: telefonoLimpio,
        contrasena,
      });
      // La guardia de sesión redirige a la zona del jugador.
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'No pudimos crear la cuenta. Probá de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[estilos.pantalla, { backgroundColor: t.fondo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <View style={estilos.encabezado}>
          <Text style={[estilos.titulo, { color: t.texto }]}>Crear cuenta</Text>
          <Text style={[estilos.texto, { color: t.textoSuave }]}>
            El teléfono es obligatorio: el encargado lo usa si no te presentás.
          </Text>
        </View>

        <Tarjeta style={estilos.formulario}>
          <CampoTexto
            etiqueta="Nombre y apellido"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Emiliano Ruiz"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
          />
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
            etiqueta="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            placeholder="3455-401122"
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
          <CampoTexto
            etiqueta="Contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            placeholder="Al menos 8 caracteres"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <CampoTexto
            etiqueta="Repetir contraseña"
            value={repetir}
            onChangeText={setRepetir}
            placeholder="Repetí la contraseña"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={enviar}
            returnKeyType="go"
          />

          {error ? <Text style={[estilos.error, { color: t.error }]}>{error}</Text> : null}

          <Boton titulo="Crear cuenta" onPress={enviar} cargando={cargando} />
        </Tarjeta>

        <Pressable onPress={() => router.replace('/(auth)/ingreso')} style={estilos.enlace}>
          <Text style={[estilos.enlaceTexto, { color: t.primario }]}>
            Ya tengo cuenta: ingresar
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
  error: { fontSize: 14, fontFamily: fuente.seminegrita },
  enlace: { paddingVertical: 6 },
  enlaceTexto: { fontSize: tamanos.texto, fontFamily: fuente.negrita, textAlign: 'center' },
});
