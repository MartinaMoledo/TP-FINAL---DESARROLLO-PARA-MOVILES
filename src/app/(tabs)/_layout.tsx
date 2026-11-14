// Las pestañas de abajo cambian según el rol de quien entró.
// Jugador: Espacios, Reservas, Yo. Personal: Agenda, Escanear (al centro), Panel;
// su "Yo" se abre desde el círculo con la inicial, arriba a la izquierda.
// El orden en el que se declaran las pantallas es el orden en el que aparecen en la barra.
import Ionicons from '@react-native-vector-icons/ionicons';
import { Tabs } from 'expo-router';
import { type ColorValue, View } from 'react-native';

import { BotonEscanearCentral } from '@/components/BotonEscanearCentral';
import { BotonModo } from '@/components/BotonModo';
import { BotonPerfil } from '@/components/BotonPerfil';
import { LogoEncabezado } from '@/components/LogoEncabezado';
import { esPersonal, useSesion } from '@/contextos/SesionContexto';
import { fuente } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';

// Ícono de cada pestaña: contorno cuando no está elegida y relleno cuando sí,
// para que se note en qué sección estás (no solo por el color del texto).
type NombreIcono = React.ComponentProps<typeof Ionicons>['name'];
function icono(contorno: NombreIcono, relleno: NombreIcono) {
  function IconoPestana({ focused, color }: { focused: boolean; color: ColorValue }) {
    return <Ionicons name={focused ? relleno : contorno} size={24} color={color} />;
  }
  return IconoPestana;
}

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
        // Logo de la marca centrado, en lugar del título de cada pestaña.
        headerTitleAlign: 'center',
        headerTitle: () => <LogoEncabezado />,
        // El mismo botón luna/sol del listado, arriba a la derecha en todas las pantallas.
        headerRight: () => (
          <View style={{ marginRight: 16 }}>
            <BotonModo />
          </View>
        ),
        // El personal entra a su cuenta desde acá, no desde la barra de abajo.
        headerLeft: personal ? () => <BotonPerfil /> : undefined,
        // Sin `height` fijo: en Android edge-to-edge la barra del sistema se superpone
        // y una altura fija deja las etiquetas tapadas (parece que no hay pestañas).
        // react-navigation ya calcula la altura sumando el área segura.
        tabBarStyle: { backgroundColor: t.tarjeta, borderTopColor: t.borde },
        tabBarActiveTintColor: t.primario,
        tabBarInactiveTintColor: t.textoSuave,
        // Ícono arriba y texto abajo: el texto más chico para que entren cinco pestañas.
        tabBarLabelStyle: { fontSize: 12, fontFamily: fuente.media },
      }}
    >
      {/* Jugador y anónimo: mirar espacios y sus reservas.
          El personal no tiene la pestaña Espacios: las fotos de las canchas las sube desde Panel → Espacios. */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Espacios',
          tabBarIcon: icono('location-outline', 'location'),
          href: personal ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Mis reservas',
          tabBarLabel: 'Reservas',
          tabBarIcon: icono('calendar-outline', 'calendar'),
          href: personal ? null : undefined,
        }}
      />

      {/* Personal: la agenda del día (reservas, fijas y bloqueos), el escaneo y el panel. */}
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda del día',
          tabBarLabel: 'Agenda',
          tabBarIcon: icono('today-outline', 'today'),
          href: personal ? undefined : null,
        }}
      />
      {/* expo-router no deja usar href y tabBarButton juntos: al personal le damos el botón
          central y al resto le ocultamos la pestaña. */}
      <Tabs.Screen
        name="escanear"
        options={
          personal
            ? {
                title: 'Escanear QR',
                tabBarButton: (props) => <BotonEscanearCentral {...props} />,
              }
            : { title: 'Escanear QR', href: null }
        }
      />
      <Tabs.Screen
        name="panel"
        options={{
          title: 'Panel del personal',
          tabBarLabel: 'Panel',
          tabBarIcon: icono('settings-outline', 'settings'),
          href: personal ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="yo"
        options={{
          title: 'Yo',
          tabBarIcon: icono('person-outline', 'person'),
          // El personal abre su cuenta desde el círculo de arriba (pantalla /cuenta).
          href: personal ? null : undefined,
          headerLeft: undefined,
        }}
      />
    </Tabs>
  );
}
