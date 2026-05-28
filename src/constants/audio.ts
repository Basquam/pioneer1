export const AmbientAudioConfig = {
  wildWestUniverseId: 'dust-and-iron',
  neuronetUniverseId: 'neuronet',
  neonAshesUniverseId: 'neon-ashes',
  /** Temporarily raised for easier verification — tune down before release. */
  targetVolume: 0.35,
  devTestVolume: 0.8,
  fadeInMs: 3500,
  fadeOutMs: 1200,
} as const;

/** Bundled frontier ambience — resolved to a URI at runtime. */
export const AMBIENT_AUDIO_MODULE = require('@/assets/audio/dustfall-ambient.wav');

/** Bundled NeuroNet cyberpunk ambience — rain, synth hum, electric buzz, city drone. */
export const NEURONET_AMBIENT_AUDIO_MODULE = require('@/assets/audio/neuronet-ambient.wav');

/** Bundled Neon Ashes noir ambience — rain on glass, jazz club murmur, city rumble, vinyl crackle. */
export const NEON_ASHES_AMBIENT_AUDIO_MODULE = require('@/assets/audio/neon-ashes-ambient.wav');

export const AMBIENT_AUDIO_BY_UNIVERSE_ID: Record<string, number | null> = {
  'dust-and-iron': AMBIENT_AUDIO_MODULE,
  neuronet: NEURONET_AMBIENT_AUDIO_MODULE,
  'neon-ashes': NEON_ASHES_AMBIENT_AUDIO_MODULE,
};

export function getAmbientAudioModule(universeId: string): number | null {
  return AMBIENT_AUDIO_BY_UNIVERSE_ID[universeId] ?? null;
}

export function universeHasAmbientAudio(universeId: string): boolean {
  return getAmbientAudioModule(universeId) !== null;
}
