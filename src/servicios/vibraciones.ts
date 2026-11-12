import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export function vibrarIngresoValido(): void {
  if (Platform.OS === 'android') {
    void Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm);
  } else {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

export function vibrarIngresoInvalido(): void {
  if (Platform.OS === 'android') {
    void Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Reject);
  } else {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
}
