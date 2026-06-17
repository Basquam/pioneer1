/**
 * Central sound API for Questory.
 *
 * Ambience playback is delegated to AmbientAudioProvider via a registered bridge.
 * Event stings reuse universe-specific assets from constants/audio.ts.
 *
 * Missing dedicated assets (graceful no-op until added):
 * - quest_created
 * - notification_cue
 * - mascot_tip
 * - button_tap
 */
import { Platform } from 'react-native';

import { ANALYTICS_EVENTS } from '@/lib/analytics/analytics-events';
import { trackEvent } from '@/lib/analytics/analytics-service';
import { loadAudioSettings, saveAudioSettings } from '@/lib/audio-settings-storage';
import { ambientDebug } from '@/lib/ambient-audio-debug';
import type { EventStingKind } from '@/lib/celebration-sting-resolver';
import { universeHasEventStings } from '@/constants/audio';
import {
  type EventStingPlayerMap,
  playEventSting,
  stopWebEventSting,
} from '@/lib/event-sting-playback';

const IS_WEB = Platform.OS === 'web';
const DEDUPE_MS = 450;

export type SoundPlaybackBridge = {
  playSting: (kind: EventStingKind) => void;
  stopAmbience: () => void;
  startAmbienceForUniverse: (universeId: string) => void;
  stopAllAudio: () => void;
  unlockWebPlayback: () => void;
  getGate: () => {
    soundEffectsEnabled: boolean;
    webPlaybackUnlocked: boolean;
    universeId: string;
  };
  getNativeStingPlayers: () => EventStingPlayerMap;
};

let bridge: SoundPlaybackBridge | null = null;
let ambientEnabled = true;
let soundEffectsEnabled = true;
let initialised = false;

const lastPlayedAt: Record<string, number> = {};

function shouldDedupe(key: string): boolean {
  const now = Date.now();
  const last = lastPlayedAt[key] ?? 0;
  if (now - last < DEDUPE_MS) return true;
  lastPlayedAt[key] = now;
  return false;
}

function persistSettings(): void {
  void saveAudioSettings({ ambientEnabled, soundEffectsEnabled });
}

export function registerSoundPlaybackBridge(next: SoundPlaybackBridge | null): void {
  bridge = next;
}

export async function initSoundSystem(): Promise<{ ambientEnabled: boolean; soundEffectsEnabled: boolean }> {
  if (initialised) {
    return { ambientEnabled, soundEffectsEnabled };
  }
  initialised = true;

  try {
    const settings = await loadAudioSettings();
    ambientEnabled = settings.ambientEnabled;
    soundEffectsEnabled = settings.soundEffectsEnabled;
    if (__DEV__) {
      ambientDebug('Sound system initialised', settings);
    }
    return settings;
  } catch (err) {
    if (__DEV__) {
      ambientDebug('Sound system init failed — using defaults', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
    return { ambientEnabled: true, soundEffectsEnabled: true };
  }
}

export function setAmbienceEnabled(enabled: boolean): void {
  try {
    ambientEnabled = enabled;
    persistSettings();
    if (enabled && IS_WEB) {
      bridge?.unlockWebPlayback();
    }
    if (!enabled) {
      bridge?.stopAmbience();
      stopWebEventSting();
    }
    trackEvent(enabled ? ANALYTICS_EVENTS.ambience_enabled : ANALYTICS_EVENTS.ambience_disabled);
    if (__DEV__) {
      ambientDebug('Ambience preference updated', { enabled });
    }
  } catch {
    // Never throw to UI.
  }
}

export function getAmbienceEnabled(): boolean {
  return ambientEnabled;
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    soundEffectsEnabled = enabled;
    persistSettings();
    if (enabled && IS_WEB) {
      bridge?.unlockWebPlayback();
    }
    if (!enabled) {
      stopWebEventSting();
    }
    trackEvent(enabled ? ANALYTICS_EVENTS.sound_enabled : ANALYTICS_EVENTS.sound_disabled);
    if (__DEV__) {
      ambientDebug('Sound effects preference updated', { enabled });
    }
  } catch {
    // Never throw to UI.
  }
}

export function getSoundEnabled(): boolean {
  return soundEffectsEnabled;
}

function playMappedSting(kind: EventStingKind, dedupeKey: string): void {
  try {
    if (!soundEffectsEnabled) return;
    if (shouldDedupe(dedupeKey)) return;
    if (!bridge) {
      if (__DEV__) {
        ambientDebug('Sound sting skipped — bridge not ready', { kind, dedupeKey });
      }
      return;
    }

    const gate = bridge.getGate();
    if (!universeHasEventStings(gate.universeId)) {
      if (__DEV__) {
        ambientDebug('Sound sting skipped — no assets for universe', {
          kind,
          universeId: gate.universeId,
        });
      }
      return;
    }

    void playEventSting(kind, { ...gate, soundEffectsEnabled }, bridge.getNativeStingPlayers());
  } catch (err) {
    if (__DEV__) {
      ambientDebug('playMappedSting failed', {
        kind,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

/** TODO(asset): quest_created — add a short positive chime asset. */
export function playQuestCreated(): void {
  if (__DEV__) {
    ambientDebug('playQuestCreated — no dedicated asset yet (no-op)');
  }
}

export function playQuestCompleted(): void {
  playMappedSting('questComplete', 'questComplete');
}

export function playChapterCompleted(): void {
  playMappedSting('chapterComplete', 'chapterComplete');
}

export function playSagaUnlocked(): void {
  playMappedSting('rewardUnlock', 'sagaUnlocked');
}

/** TODO(asset): notification_cue — add a soft notification blip asset. */
export function playNotificationCue(): void {
  if (__DEV__) {
    ambientDebug('playNotificationCue — no dedicated asset yet (no-op)');
  }
}

/** TODO(asset): mascot_tip — add a subtle UI acknowledgment asset. */
export function playMascotTip(): void {
  if (__DEV__) {
    ambientDebug('playMascotTip — no dedicated asset yet (no-op)');
  }
}

/** TODO(asset): button_tap — add a soft tap asset for primary actions. */
export function playButtonTap(): void {
  // Intentional no-op until a tap asset exists.
}

export function stopAmbience(): void {
  try {
    bridge?.stopAmbience();
  } catch {
    // Never throw to UI.
  }
}

export function startAmbienceForUniverse(universeId: string): void {
  try {
    bridge?.startAmbienceForUniverse(universeId);
  } catch {
    // Never throw to UI.
  }
}

export function stopAllAudio(): void {
  try {
    bridge?.stopAllAudio();
    stopWebEventSting();
  } catch {
    // Never throw to UI.
  }
}

export function playCelebrationSting(kind: EventStingKind): void {
  playMappedSting(kind, `celebration:${kind}`);
}

export function playVillainSting(): void {
  playMappedSting('villainAppearance', 'villainAppearance');
}
