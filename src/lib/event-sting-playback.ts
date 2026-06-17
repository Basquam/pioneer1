import { Platform } from 'react-native';
import type { AudioPlayer } from 'expo-audio';
import { Asset } from 'expo-asset';

import {
  EventStingConfig,
  eventStingPlayerKey,
  getEventStingModule,
} from '@/constants/audio';
import { ambientDebug } from '@/lib/ambient-audio-debug';
import type { EventStingKind } from '@/lib/celebration-sting-resolver';
import { reportAssetError } from '@/lib/crash/questory-crash';
import { safePlay } from '@/lib/safe-audio-play';

const IS_WEB = Platform.OS === 'web';

export type EventStingPlayerMap = Partial<Record<string, AudioPlayer>>;

export type EventStingPlaybackGate = {
  soundEffectsEnabled: boolean;
  webPlaybackUnlocked: boolean;
  universeId: string;
};

let webStingAudio: HTMLAudioElement | null = null;
let webStingToken = 0;

function canPlaySting(gate: EventStingPlaybackGate, kind: EventStingKind): boolean {
  if (!getEventStingModule(gate.universeId, kind)) return false;
  if (!gate.soundEffectsEnabled) return false;
  if (IS_WEB && !gate.webPlaybackUnlocked) return false;
  return true;
}

async function resolveStingUri(universeId: string, kind: EventStingKind): Promise<string> {
  const module = getEventStingModule(universeId, kind);
  if (!module) {
    throw new Error(`No event sting module for universe ${universeId}: ${kind}`);
  }

  const asset = Asset.fromModule(module);
  if (!asset.downloaded) {
    await asset.downloadAsync();
  }
  return asset.localUri ?? asset.uri;
}

async function playWebSting(universeId: string, kind: EventStingKind): Promise<void> {
  try {
    const resolvedUri = await resolveStingUri(universeId, kind);

    if (!webStingAudio) {
      webStingAudio = new Audio();
    }

    const token = ++webStingToken;
    webStingAudio.src = resolvedUri;
    webStingAudio.loop = false;
    webStingAudio.volume = EventStingConfig.volumes[kind];
    webStingAudio.currentTime = 0;

    await webStingAudio.play();
    if (token !== webStingToken) {
      webStingAudio.pause();
    }
    ambientDebug('Event sting played (web)', { universeId, kind });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('NotAllowedError') && !message.includes('AbortError')) {
      ambientDebug('Event sting failed (web)', { universeId, kind, error: message });
      reportAssetError(error, { feature: 'audio', action: 'play_sting_web', reason: kind });
    }
  }
}

async function playNativeSting(
  universeId: string,
  kind: EventStingKind,
  players: EventStingPlayerMap,
): Promise<void> {
  const player = players[eventStingPlayerKey(universeId, kind)];
  if (!player) {
    ambientDebug('Event sting skipped — player not ready', { universeId, kind });
    return;
  }

  try {
    player.loop = false;
    player.volume = EventStingConfig.volumes[kind];
    if (player.currentTime > 0) {
      player.seekTo(0);
    }
    await safePlay(player);
    ambientDebug('Event sting played (native)', { universeId, kind });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ambientDebug('Event sting failed (native)', { universeId, kind, error: message });
    reportAssetError(error, { feature: 'audio', action: 'play_sting_native', reason: kind });
  }
}

export async function playEventSting(
  kind: EventStingKind,
  gate: EventStingPlaybackGate,
  nativePlayers: EventStingPlayerMap,
): Promise<void> {
  if (!canPlaySting(gate, kind)) return;

  if (IS_WEB) {
    await playWebSting(gate.universeId, kind);
    return;
  }

  await playNativeSting(gate.universeId, kind, nativePlayers);
}

export function stopWebEventSting(): void {
  webStingToken += 1;
  if (!webStingAudio) return;
  webStingAudio.pause();
  webStingAudio.currentTime = 0;
}
