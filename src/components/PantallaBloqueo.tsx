import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { useSesion } from '@/contextos/SesionContexto';
import {
  guardarClaveApp,
  hayHuella,
  leerClaveApp,
  pedirHuellaAlEntrar,
} from '@/servicios/bloqueo';
import { fuente } from '@/tema/tipografia';
import { tamanos, useTema } from '@/tema/useTema';

type Props = { alDesbloquear: () => void };

type Modo = 'revisando' | 'huella' | 'clave-nueva' | 'clave';

export function PantallaBloqueo({ alDesbloquear }: Props) {
  const t = useTema();
  const { salir } = useSesion();
  const [modo, setModo] = useState<Modo>('revisando');
  const [clave, setClave] = useState('');
  const [repetida, setRepetida] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [entro, setEntro] = useState(false);


  useEffect(() => {
    async function decidir() {
      if (await hayHuella()) {
        setModo('huella');
        setEntro(await pedirHuellaAlEntrar());
        return;
      }
      const guardada = await leerClaveApp();
      setModo(guardada ? 'clave' : 'clave-nueva');
    }
    decidir();
  }, []);

  useEffect(() => {
    if (entro) alDesbloquear();
  }, [entro, alDesbloquear]);

  async function guardarNueva() {
    if (clave.length !== 4) {
      setError('La clave tiene que ser de 4 numeros.');
      return;
    }
    if (clave !== repetida) {
      setError('Las claves no coinciden.');
      return;
    }
    await guardarClaveApp(clave);
    setEntro(true);
  }

  async function entrarConClave() {
    const guardada = await leerClaveApp();
    if (clave === guardada) {
      setEntro(true);
    } else {
      setError('Clave incorrecta.');
      setClave('');
    }
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <Text style={[estilos.titulo, { color: t.texto }]}>App bloqueada</Text>

      {modo === 'revisando' && (
        <Text style={[estilos.texto, { color: t.textoSuave }]}>Un momento...</Text>
      )}

      {modo === 'huella' && (
        <>
          <Text style={[estilos.texto, { color: t.textoSuave }]}>
            Para entrar tenes que confirmar tu identidad.
          </Text>
          <Boton
            titulo="Usar huella"
            onPress={async () => setEntro(await pedirHuellaAlEntrar())}
          />
        </>
      )}

      {modo === 'clave-nueva' && (
        <>
          <Text style={[estilos.texto, { color: t.textoSuave }]}>
            Tu telefono no tiene huella ni rostro. Crea una clave de 4 numeros para proteger la app.
          </Text>
          <CampoTexto
            etiqueta="Clave"
            value={clave}
            onChangeText={setClave}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
          />
          <CampoTexto
            etiqueta="Repetir clave"
            value={repetida}
            onChangeText={setRepetida}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            error={error}
          />
          <Boton titulo="Guardar clave" onPress={guardarNueva} />
        </>
      )}

      {modo === 'clave' && (
        <>
          <Text style={[estilos.texto, { color: t.textoSuave }]}>Escribi la clave de la app.</Text>
          <CampoTexto
            etiqueta="Clave"
            value={clave}
            onChangeText={setClave}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            error={error}
          />
          <Boton titulo="Entrar" onPress={entrarConClave} />
        </>
      )}

      {/* Para no quedar encerrada si te olvidas la clave. */}
      <Boton titulo="Cerrar sesion" variante="fantasma" onPress={salir} />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  titulo: { fontFamily: fuente.negrita, fontSize: tamanos.titulo },
  texto: { fontFamily: fuente.regular, fontSize: tamanos.texto },
});