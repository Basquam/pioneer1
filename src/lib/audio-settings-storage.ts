import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@pioneer/audio-settings';

export type AudioSettings = {
  ambientEnabled: boolean;
  soundEffectsEnabled: boolean;
};

const DEFAULT_SETTINGS: AudioSettings = {
  ambientEnabled: true,
  soundEffectsEnabled: true,
};

export async function loadAudioSettings(): Promise<AudioSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AudioSettings>;
    return {
      ambientEnabled: parsed.ambientEnabled ?? DEFAULT_SETTINGS.ambientEnabled,
      soundEffectsEnabled: parsed.soundEffectsEnabled ?? DEFAULT_SETTINGS.soundEffectsEnabled,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveAudioSettings(settings: AudioSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore write failures — local-only preference.
  }
}
