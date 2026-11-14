// Círculo con la inicial del personal, arriba a la izquierda: abre "Tu cuenta" (datos y cerrar sesión).
// El personal no tiene "Yo" en la barra de abajo, así quedan tres pestañas y el QR va al centro.
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useSesion } from '@/contextos/SesionContexto';
import { fuente } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export function BotonPerfil() {
  const t = useTema();
  const { usuario } = useSesion();
  const inicial = usuario?.nombre.trim().charAt(0).toUpperCase() ?? '?';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Tu cuenta"
      onPress={() => router.push('/cuenta')}
      style={[estilos.circulo, { backgroundColor: t.primario }]}
    >
      <Text style={[estilos.inicial, { color: t.sobrePrimario }]}>{inicial}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  circulo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  inicial: { fontSize: 20, fontFamily: fuente.negrita },
});
