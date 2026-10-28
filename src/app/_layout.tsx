import { Stack } from 'expo-router';
import { useTema } from '@/tema/useTema';

export default function LayoutRaiz() {
  const t = useTema();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.tarjeta },
        headerTintColor: t.texto,
        contentStyle: { backgroundColor: t.fondo },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="espacio/[id]" options={{ title: 'Espacio' }} />
    </Stack>
  );
}
