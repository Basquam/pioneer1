import { Platform } from 'react-native';
import type { AudioPlayer } from 'expo-audio';
import { Asset } from 'expo-asset';

import { EventStingConfig, getDustAndIronStingModule } from '@/constants/audio';
import { ambientDebug } from '@/lib/ambient-audio-debug';
import type { EventStingKind } from '@/lib/celebration-sting-resolver';
import { safePlay } from '@/lib/safe-audio-play';

const IS_WEB = Platform.OS === 'web';

export type EventStingPlayerMap = Partial<Record<EventStingKind, AudioPlayer>>;

export type EventStingPlaybackGate = {
  ambientEnabled: boolean;
  webPlaybackUnlocked: boolean;
  universeId: string;
};

let webStingAudio: HTMLAudioElement | null = null;
let webStingToken = 0;

function canPlaySting(gate: EventStingPlaybackGate): boolean {
  if (gate.universeId !== 'dust-and-iron') return false;
  if (!gate.ambientEnabled) return false;
  if (IS_WEB && !gate.webPlaybackUnlocked) return false;
  return true;
}

async function resolveStingUri(kind: EventStingKind): Promise<string> {
  const module = getDustAndIronStingModule(kind);
  const asset = Asset.fromModule(module);
  if (!asset.downloaded) {
    await asset.downloadAsync();
  }
  return asset.localUri ?? asset.uri;
}

async function playWebSting(kind: EventStingKind): Promise<void> {
  try {
    const resolvedUri = await resolveStingUri(kind);

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
    ambientDebug('Event sting played (web)', { kind });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('NotAllowedError') && !message.includes('AbortError')) {
      ambientDebug('Event sting failed (web)', { kind, error: message });
    }
  }
}

async function playNativeSting(
  kind: EventStingKind,
  players: EventStingPlayerMap,
): Promise<void> {
  const player = players[kind];
  if (!player) {
    ambientDebug('Event sting skipped — player not ready', { kind });
    return;
  }

  try {
    player.loop = false;
    player.volume = EventStingConfig.volumes[kind];
    if (player.currentTime > 0) {
      player.seekTo(0);
    }
    await safePlay(player);
    ambientDebug('Event sting played (native)', { kind });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ambientDebug('Event sting failed (native)', { kind, error: message });
  }
}

export async function playEventSting(
  kind: EventStingKind,
  gate: EventStingPlaybackGate,
  nativePlayers: EventStingPlayerMap,
): Promise<void> {
  if (!canPlaySting(gate)) return;

  if (IS_WEB) {
    await playWebSting(kind);
    return;
  }

  await playNativeSting(kind, nativePlayers);
}

export function stopWebEventSting(): void {
  webStingToken += 1;
  if (!webStingAudio) return;
  webStingAudio.pause();
  webStingAudio.currentTime = 0;
}
