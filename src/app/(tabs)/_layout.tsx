// Las pestañas de abajo. Para agregar íconos usen @react-native-vector-icons/ionicons.
import { Tabs } from 'expo-router';
import { useTema } from '@/tema/useTema';

export default function LayoutPestanas() {
  const t = useTema();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: t.tarjeta },
        headerTintColor: t.texto,
        tabBarStyle: { backgroundColor: t.tarjeta, borderTopColor: t.borde, height: 64 },
        tabBarActiveTintColor: t.primario,
        tabBarInactiveTintColor: t.textoSuave,
        tabBarLabelStyle: { fontSize: 15, fontWeight: '600', paddingBottom: 8 },
        tabBarIconStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Espacios' }} />
      <Tabs.Screen name="reservas" options={{ title: 'Mis reservas' }} />
      <Tabs.Screen name="yo" options={{ title: 'Yo' }} />
    </Tabs>
  );
}
