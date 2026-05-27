import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function triggerQuestCompleteHaptic(): void {
  if (Platform.OS === 'web') return;

  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
    // Ignore haptic failures on unsupported platforms.
  });
}
