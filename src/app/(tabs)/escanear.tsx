import { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Alert } from "react-native";
import { ingresosServicio } from "@/servicios/ingresos";
import { useFocusEffect } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";

async function pedirHuella(): Promise<boolean> {
  const hayLector = await LocalAuthentication.hasHardwareAsync();
  const hayHuellas = await LocalAuthentication.isEnrolledAsync();

  if (!hayLector || !hayHuellas) return true;

  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: "Confirma que sos vos para escanear",
  });

  return resultado.success;
}
export default function EscanearPantalla() {
  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [autorizado, setAutorizado] = useState(false);

  useFocusEffect(
    useCallback(() => {
      pedirHuella().then(setAutorizado);
      return () => setAutorizado(false);
    }, []),
  );

  if (!autorizado) {
    return (
      <View style={estilos.pantalla}>
        <Text>Para escanear tenes que confirmar tu identidad.</Text>
        <Pressable
          onPress={() => pedirHuella().then(setAutorizado)}
          style={estilos.boton}
        >
          <Text style={estilos.textoBoton}>Confirmar</Text>
        </Pressable>
      </View>
    );
  }
  if (!permiso) {
    return <View style={estilos.pantalla} />;
  }

  if (!permiso.granted) {
    return (
      <View style={estilos.pantalla}>
        <Text>Necesitamos permiso para usar la cámara.</Text>
        <Pressable onPress={solicitarPermiso} style={estilos.boton}>
          <Text style={estilos.textoBoton}>Permitir cámara</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.titulo}>Escanear QR de reserva</Text>

      <CameraView
        style={estilos.camara}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={
          escaneado
            ? undefined
            : ({ data }) => {
                setEscaneado(true);
                setCodigo(data);

                ingresosServicio
                  .registrar(data)
                  .then(() => {
                    Alert.alert(
                      "Ingreso registrado",
                      "La reserva fue validada correctamente.",
                    );
                  })
                  .catch((error) => {
                    Alert.alert(
                      "No se pudo registrar el ingreso",
                      error instanceof Error
                        ? error.message
                        : "Ocurrió un error.",
                    );
                  });
              }
        }
      />

      {escaneado && (
        <View style={estilos.resultado}>
          <Text>Código detectado: {codigo}</Text>

          <Pressable
            onPress={() => {
              setEscaneado(false);
              setCodigo("");
            }}
            style={estilos.boton}
          >
            <Text style={estilos.textoBoton}>Escanear otro</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 20, gap: 16 },
  titulo: { fontSize: 22, fontWeight: "700" },
  camara: { flex: 1, borderRadius: 12, overflow: "hidden" },
  resultado: { padding: 16, gap: 12 },
  boton: {
    backgroundColor: "#D71920",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBoton: { color: "#FFFFFF", fontWeight: "700" },
});
