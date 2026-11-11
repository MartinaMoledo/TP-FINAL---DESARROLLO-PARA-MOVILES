// Las pestañas de abajo cambian según el rol de quien entró.
import { Tabs } from 'expo-router';

import { esPersonal, useSesion } from '@/contextos/SesionContexto';
import { fuente } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

export default function LayoutPestanas() {
  const t = useTema();
  const { usuario } = useSesion();
  const personal = esPersonal(usuario);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: t.tarjeta },
        headerTintColor: t.texto,
        headerTitleStyle: { fontFamily: fuente.seminegrita },
        // Sin `height` fijo: en Android edge-to-edge la barra del sistema se superpone
        // y una altura fija deja las etiquetas tapadas (parece que no hay pestañas).
        // react-navigation ya calcula la altura sumando el área segura.
        tabBarStyle: { backgroundColor: t.tarjeta, borderTopColor: t.borde },
        tabBarActiveTintColor: t.primario,
        tabBarInactiveTintColor: t.textoSuave,
        tabBarLabelStyle: { fontSize: 15, fontFamily: fuente.media },
        tabBarIconStyle: { display: 'none' },
      }}
    >
      {/* Jugador y anónimo: mirar espacios y sus reservas. */}
      <Tabs.Screen
        name="index"
        options={{ title: 'Espacios', href: personal ? null : undefined }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Mis reservas',
          tabBarLabel: 'Reservas',
          href: personal ? null : undefined,
        }}
      />

      {/* Personal: agenda del día, reservas con datos de contacto y escaneo. */}
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda del día',
          tabBarLabel: 'Agenda',
          href: personal ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="reservas-dia"
        options={{
          title: 'Reservas del día',
          tabBarLabel: 'Del día',
          href: personal ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="escanear"
        options={{
          title: 'Escanear QR',
          tabBarLabel: 'Escanear',
          href: personal ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="panel"
        options={{
          title: 'Panel del personal',
          tabBarLabel: 'Panel',
          href: personal ? undefined : null,
        }}
      />

      <Tabs.Screen name="yo" options={{ title: 'Yo' }} />
    </Tabs>
  );
}
