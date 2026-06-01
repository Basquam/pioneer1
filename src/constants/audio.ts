import type { EventStingKind } from '@/lib/celebration-sting-resolver';

export const AmbientAudioConfig = {
  wildWestUniverseId: 'dust-and-iron',
  neuronetUniverseId: 'neuronet',
  neonAshesUniverseId: 'neon-ashes',
  /** Temporarily raised for easier verification — tune down before release. */
  targetVolume: 0.35,
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
    chapterComplete: 0.28,
    rewardUnlock: 0.24,
    questComplete: 0.22,
    villainAppearance: 0.2,
  } satisfies Record<EventStingKind, number>,
} as const;

/** Default Dust & Iron town ambience loop. */
export const DUST_AND_IRON_TOWN_AMBIENT_MODULE = require('@/assets/audio/ambience/dust-and-iron/create-a-subtle-looping-ambient_053126.mp3');

/** Dust & Iron tension overlay for villain / high-stakes moments. */
export const DUST_AND_IRON_TENSION_AMBIENT_MODULE = require('@/assets/audio/ambience/dust-and-iron/create-a-subtle-looping-tension_053126.mp3');

/** @deprecated Use DUST_AND_IRON_TOWN_AMBIENT_MODULE — kept for dev diagnostics. */
export const AMBIENT_AUDIO_MODULE = DUST_AND_IRON_TOWN_AMBIENT_MODULE;

/** Bundled NeuroNet cyberpunk ambience — rain, synth hum, electric buzz, city drone. */
export const NEURONET_AMBIENT_AUDIO_MODULE = require('@/assets/audio/neuronet-ambient.wav');

/** Bundled Neon Ashes noir ambience — rain on glass, jazz club murmur, city rumble, vinyl crackle. */
export const NEON_ASHES_AMBIENT_AUDIO_MODULE = require('@/assets/audio/neon-ashes-ambient.wav');

export const AMBIENT_AUDIO_BY_UNIVERSE_ID: Record<string, number | null> = {
  'dust-and-iron': DUST_AND_IRON_TOWN_AMBIENT_MODULE,
  neuronet: NEURONET_AMBIENT_AUDIO_MODULE,
  'neon-ashes': NEON_ASHES_AMBIENT_AUDIO_MODULE,
};

export const AMBIENT_TENSION_AUDIO_BY_UNIVERSE_ID: Record<string, number> = {
  'dust-and-iron': DUST_AND_IRON_TENSION_AMBIENT_MODULE,
};

export const DUST_AND_IRON_STING_MODULES: Record<EventStingKind, number> = {
  questComplete: require('@/assets/audio/stings/dust-and-iron/create-a-short-western-quest_053126.mp3'),
  chapterComplete: require('@/assets/audio/stings/dust-and-iron/create-a-short-cinematic-western_053126.mp3'),
  villainAppearance: require('@/assets/audio/stings/dust-and-iron/create-a-short-western-villain_053126.mp3'),
  rewardUnlock: require('@/assets/audio/stings/dust-and-iron/create-a-short-western-reward_060126.mp3'),
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

export function getDustAndIronStingModule(kind: EventStingKind): number {
  return DUST_AND_IRON_STING_MODULES[kind];
}
