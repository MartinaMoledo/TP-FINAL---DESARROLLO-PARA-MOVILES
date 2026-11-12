import { useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  Linking,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';

import { Boton } from '@/components/Boton';
import { ErrorApi } from '@/servicios/cliente';
import { ingresosServicio } from '@/servicios/ingresos';
import {
  vibrarIngresoInvalido,
  vibrarIngresoValido,
} from '@/servicios/vibraciones';

import { fuente } from '@/tema/tipografia';
import { tamanos, useTema } from '@/tema/useTema';

async function pedirHuella(): Promise<boolean> {
  const hayLector = await LocalAuthentication.hasHardwareAsync();
  const hayHuellas = await LocalAuthentication.isEnrolledAsync();

  if (!hayLector || !hayHuellas) return true;

  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirma que sos vos para escanear',
  });

  return resultado.success;
}

type Resultado = {
  valido: boolean;
  titulo: string;
  detalle: string;
};

function horaDe(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  });
}

export default function EscanearPantalla() {
  const t = useTema();
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [autorizado, setAutorizado] = useState(false);
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const leyendo = useRef(false);

  useFocusEffect(
    useCallback(() => {
      pedirHuella().then(setAutorizado);
      return () => setAutorizado(false);
    }, []),
  );

  async function validar(codigo: string) {
    if (leyendo.current) return;
    leyendo.current = true;
    setValidando(true);

    try {
      const reserva = await ingresosServicio.registrar(codigo);
      setResultado({
        valido: true,
        titulo: 'Ingreso válido',
        detalle: `Registrado a las ${horaDe(reserva.ingresoEn ?? new Date().toISOString())}.`,
      });
      vibrarIngresoValido();
    } catch (e) {
      setResultado({
        valido: false,
        titulo: 'Ingreso rechazado',
        detalle:
          e instanceof ErrorApi
            ? e.message
            : 'No se pudo validar. Revisá la conexión y probá de nuevo.',
      });
      vibrarIngresoInvalido();
    } finally {
      setValidando(false);
    }
  }

  function escanearOtro() {
    setResultado(null);
    leyendo.current = false;
  }

  if (!autorizado) {
    return (
      <View style={[estilos.centro, { backgroundColor: t.fondo }]}>
        <Text style={[estilos.texto, { color: t.texto }]}>
          Para escanear tenés que confirmar tu identidad.
        </Text>
        <Boton
          titulo="Confirmar"
          onPress={() => pedirHuella().then(setAutorizado)}
        />
      </View>
    );
  }

  if (!permiso) {
    return <View style={[estilos.centro, { backgroundColor: t.fondo }]} />;
  }

  if (!permiso.granted) {
    return (
      <View style={[estilos.centro, { backgroundColor: t.fondo }]}>
        <Text style={[estilos.titulo, { color: t.texto }]}>
          Necesitamos la cámara
        </Text>
        <Text style={[estilos.texto, { color: t.textoSuave }]}>
          Se usa solo para leer el código QR de las reservas.
        </Text>
        {permiso.canAskAgain ? (
          <Boton titulo="Permitir cámara" onPress={solicitarPermiso} />
        ) : (
          <>
            <Text style={[estilos.texto, { color: t.textoSuave }]}>
              El permiso está desactivado. Activalo desde los ajustes del
              teléfono.
            </Text>
            <Boton
              titulo="Abrir ajustes"
              onPress={() => Linking.openSettings()}
            />
          </>
        )}
      </View>
    );
  }

  if (validando) {
    return (
      <View style={[estilos.centro, { backgroundColor: t.fondo }]}>
        <ActivityIndicator size="large" color={t.primario} />
        <Text style={[estilos.texto, { color: t.texto }]}>
          Validando código…
        </Text>
      </View>
    );
  }

  if (resultado) {
    const color = resultado.valido ? t.libre : t.error;
    return (
      <View style={[estilos.centro, { backgroundColor: t.fondo }]}>
        <View
          style={[estilos.resultado, { borderColor: color }]}
          accessibilityLiveRegion="polite"
        >
          <Text style={[estilos.titulo, { color }]} role="heading">
            {resultado.valido ? '✓ ' : '✕ '}
            {resultado.titulo}
          </Text>
          <Text style={[estilos.texto, { color: t.texto }]}>
            {resultado.detalle}
          </Text>
        </View>
        <Boton titulo="Escanear otro" onPress={escanearOtro} />
      </View>
    );
  }

  return (
    <View style={[estilos.pantalla, { backgroundColor: t.fondo }]}>
      <Text style={[estilos.titulo, { color: t.texto }]}>
        Escanear QR de reserva
      </Text>
      <CameraView
        style={estilos.camara}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => validar(data)}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 20, gap: 16 },
  centro: {
    flex: 1,
    padding: 24,
    gap: 16,
    justifyContent: 'center',
  },
  titulo: { fontSize: 24, fontFamily: fuente.negrita },
  texto: {
    fontSize: tamanos.texto,
    lineHeight: 23,
    fontFamily: fuente.regular,
  },
  camara: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  resultado: { borderWidth: 2, borderRadius: 12, padding: 20, gap: 8 },
});
