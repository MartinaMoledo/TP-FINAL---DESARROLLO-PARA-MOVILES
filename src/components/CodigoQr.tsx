// Codigo QR de reservas
// Funciona sin internet

import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { fuente } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

type Props = {
  codigo: string;
  tamano?: number;
};

export function CodigoQr({ codigo, tamano = 200 }: Props) {
  const t = useTema();

  return (
    <View style={estilos.contenedor}>
      <View
        style={[estilos.caja, { borderColor: t.borde }]}
        accessible
        role="img"
        accessibilityLabel={`Código QR de la reserva. Código ${codigo}`}
      >
        <QRCode
          value={codigo}
          size={tamano}
          color="#000000"
          backgroundColor="#FFFFFF"
          quietZone={12}
          ecl="M"
        />
      </View>
      <Text style={[estilos.codigo, { color: t.texto }]} selectable>
        {codigo}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { alignItems: 'center', gap: 8 },
  caja: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
  },
  codigo: {
    fontFamily: fuente.seminegrita,
    fontSize: 18,
    letterSpacing: 1,
  },
});
