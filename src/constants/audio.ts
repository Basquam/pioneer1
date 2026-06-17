import type { EventStingKind } from '@/lib/celebration-sting-resolver';

export const AmbientAudioConfig = {
  wildWestUniverseId: 'dust-and-iron',
  neuronetUniverseId: 'neuronet',
  neonAshesUniverseId: 'neon-ashes',
  /** Primary ambience level (0–1). */
  targetVolume: 0.28,
  devTestVolume: 0.8,
  fadeInMs: 3500,
  fadeOutMs: 1200,
  /** Town bed when tension layer is active (0–1 relative to targetVolume). */
  tensionTownMix: 0.55,
  /** Tension overlay level (0–1 relative to targetVolume). */
  tensionOverlayMix: 0.32,
  tensionCrossfadeMs: 1800,
} as const;

export const EventStingConfig = {
  volumes: {
    chapterComplete: 0.38,
    rewardUnlock: 0.34,
    questComplete: 0.32,
    villainAppearance: 0.3,
  } satisfies Record<EventStingKind, number>,
} as const;

/** Default Dust & Iron town ambience loop. */
export const DUST_AND_IRON_TOWN_AMBIENT_MODULE = require('@/assets/audio/ambience/dust-and-iron/create-a-subtle-looping-ambient_053126.mp3');

/** Dust & Iron tension overlay for villain / high-stakes moments. */
export const DUST_AND_IRON_TENSION_AMBIENT_MODULE = require('@/assets/audio/ambience/dust-and-iron/create-a-subtle-looping-tension_053126.mp3');

/** @deprecated Use DUST_AND_IRON_TOWN_AMBIENT_MODULE — kept for dev diagnostics. */
export const AMBIENT_AUDIO_MODULE = DUST_AND_IRON_TOWN_AMBIENT_MODULE;

/** NeuroNet primary cyberpunk ambience loop. */
export const NEURONET_AMBIENT_AUDIO_MODULE = require('@/assets/audio/ambience/neuronet/neuronet-ambient.mp3.mp3');

/** NeuroNet tension overlay for villain / high-stakes moments. */
export const NEURONET_TENSION_AMBIENT_MODULE = require('@/assets/audio/ambience/neuronet/neuronet-tension.mp3.mp3');

/** Bundled Neon Ashes noir ambience — rain on glass, jazz club murmur, city rumble, vinyl crackle. */
export const NEON_ASHES_AMBIENT_AUDIO_MODULE = require('@/assets/audio/neon-ashes-ambient.wav');

export const AMBIENT_AUDIO_BY_UNIVERSE_ID: Record<string, number | null> = {
  'dust-and-iron': DUST_AND_IRON_TOWN_AMBIENT_MODULE,
  neuronet: NEURONET_AMBIENT_AUDIO_MODULE,
  'neon-ashes': NEON_ASHES_AMBIENT_AUDIO_MODULE,
};

export const AMBIENT_TENSION_AUDIO_BY_UNIVERSE_ID: Record<string, number> = {
  'dust-and-iron': DUST_AND_IRON_TENSION_AMBIENT_MODULE,
  neuronet: NEURONET_TENSION_AMBIENT_MODULE,
};

export const DUST_AND_IRON_STING_MODULES: Record<EventStingKind, number> = {
  questComplete: require('@/assets/audio/stings/dust-and-iron/create-a-short-western-quest_053126.mp3'),
  chapterComplete: require('@/assets/audio/stings/dust-and-iron/create-a-short-cinematic-western_053126.mp3'),
  villainAppearance: require('@/assets/audio/stings/dust-and-iron/create-a-short-western-villain_053126.mp3'),
  rewardUnlock: require('@/assets/audio/stings/dust-and-iron/create-a-short-western-reward_060126.mp3'),
};

export const NEURONET_STING_MODULES: Record<EventStingKind, number> = {
  questComplete: require('@/assets/audio/stings/neuronet/neuronet-quest-complete.mp3.mp3'),
  chapterComplete: require('@/assets/audio/stings/neuronet/neuronet-chapter-complete.mp3.mp3'),
  villainAppearance: require('@/assets/audio/stings/neuronet/neuronet-villain.mp3.mp3'),
  rewardUnlock: require('@/assets/audio/stings/neuronet/neuronet-reward-unlock.mp3.mp3'),
};

export const EVENT_STING_MODULES_BY_UNIVERSE_ID: Record<string, Record<EventStingKind, number>> = {
  'dust-and-iron': DUST_AND_IRON_STING_MODULES,
  neuronet: NEURONET_STING_MODULES,
};

export function getAmbientAudioModule(universeId: string): number | null {
  return AMBIENT_AUDIO_BY_UNIVERSE_ID[universeId] ?? null;
}

export function getAmbientTensionAudioModule(universeId: string): number | null {
  return AMBIENT_TENSION_AUDIO_BY_UNIVERSE_ID[universeId] ?? null;
}

export function universeHasAmbientAudio(universeId: string): boolean {
  return getAmbientAudioModule(universeId) !== null;
}

export function getEventStingModule(universeId: string, kind: EventStingKind): number | null {
  return EVENT_STING_MODULES_BY_UNIVERSE_ID[universeId]?.[kind] ?? null;
}

export function universeHasEventStings(universeId: string): boolean {
  return universeId in EVENT_STING_MODULES_BY_UNIVERSE_ID;
}

export function getDustAndIronStingModule(kind: EventStingKind): number {
  return DUST_AND_IRON_STING_MODULES[kind];
}

export function eventStingPlayerKey(universeId: string, kind: EventStingKind): string {
  return `${universeId}::${kind}`;
}
