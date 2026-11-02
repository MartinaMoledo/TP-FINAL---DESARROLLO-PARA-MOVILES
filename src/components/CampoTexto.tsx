// Campo de texto con etiqueta y mensaje de error, para los formularios de cuenta.
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { tamanos, useTema } from '@/tema/useTema';

type Props = TextInputProps & {
  etiqueta: string;
  error?: string | null;
  ayuda?: string;
};

export function CampoTexto({ etiqueta, error, ayuda, style, ...props }: Props) {
  const t = useTema();
  const [enfocado, setEnfocado] = useState(false);

  const colorBorde = error ? t.error : enfocado ? t.primario : t.borde;

  return (
    <View style={estilos.contenedor}>
      <Text style={[estilos.etiqueta, { color: t.texto }]}>{etiqueta}</Text>
      <TextInput
        {...props}
        accessibilityLabel={etiqueta}
        onFocus={(e) => {
          setEnfocado(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setEnfocado(false);
          props.onBlur?.(e);
        }}
        placeholderTextColor={t.textoSuave}
        style={[
          estilos.entrada,
          {
            backgroundColor: t.tarjeta,
            borderColor: colorBorde,
            color: t.texto,
          },
          style,
        ]}
      />
      {error ? (
        <Text style={[estilos.mensaje, { color: t.error }]}>{error}</Text>
      ) : ayuda ? (
        <Text style={[estilos.mensaje, { color: t.textoSuave }]}>{ayuda}</Text>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: 6,
  },
  etiqueta: {
    fontSize: 15,
    fontWeight: '700',
  },
  entrada: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: tamanos.texto,
  },
  mensaje: {
    fontSize: 13,
  },
});
