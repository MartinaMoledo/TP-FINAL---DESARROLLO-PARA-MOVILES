// Notificaciones locales: recordatorio del turno, aviso de suspencion y turno liberado.

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Storage } from 'expo-sqlite/kv-store';

// Para que aparezca la notificacion si la app esta abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CANAL = 'turnos';
const HORAS_ANTES = 2;

const claveRecordatorio = (reservaId: string) => `recordatorio:${reservaId}`;

export async function pedirPermisoNotificaciones(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Aviso de tus turnos',
      // eslint-disable-next-line import/namespace -- AndroidImportance sí existe: la librería lo exporta con `export *` desde un archivo de tipos que esta regla no sigue.
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250, 250],
    });
  }

  const actual = await Notifications.getPermissionsAsync();
  if (actual.status === 'granted') return true;
  // si niega para siempre el sistema ya no muestra el cartel
  if (!actual.canAskAgain) return false;

  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.status === 'granted';
}

type DatosRecordatorio = {
  reservaId: string;
  inicio: string;
  nombreEspacio: string;
};

export async function programarRecordatorio({
  reservaId,
  inicio,
  nombreEspacio,
}: DatosRecordatorio): Promise<void> {
  const cuando = Date.parse(inicio) - HORAS_ANTES * 60 * 60 * 1000;
  if (cuando <= Date.now()) return;

  const hayPermiso = await pedirPermisoNotificaciones();
  if (!hayPermiso) return;

  // si ya habia una reserva se reprograma sin eliminar la duplicada
  await cancelarRecordatorio(reservaId);

  const hora = inicio.slice(11, 16);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Tu turno es en 2 horas',
      body: `${nombreEspacio} a las ${hora}. Se paga allí.`,
      data: { ruta: '/(tabs)/reservas', reservaId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: cuando,
      channelId: CANAL,
    },
  });

  await Storage.setItemAsync(claveRecordatorio(reservaId), id);
}

export async function cancelarRecordatorio(reservaId: string): Promise<void> {
    const clave = claveRecordatorio(reservaId);
    const id = await Storage.getItemAsync(clave);
    if (!id) return;

    await Notifications.cancelScheduledNotificationAsync(id);
    await Storage.removeItemAsync(clave);
}