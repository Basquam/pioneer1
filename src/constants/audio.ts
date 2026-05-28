export const AmbientAudioConfig = {
  wildWestUniverseId: 'dust-and-iron',
  neuronetUniverseId: 'neuronet',
  /** Temporarily raised for easier verification — tune down before release. */
  targetVolume: 0.35,
  devTestVolume: 0.8,
  fadeInMs: 3500,
  fadeOutMs: 1200,
} as const;

/** Bundled frontier ambience — resolved to a URI at runtime. */
export const AMBIENT_AUDIO_MODULE = require('@/assets/audio/dustfall-ambient.wav');

/**
 * Placeholder for NeuroNet cyberpunk ambience.
 * Bundle `@/assets/audio/neuronet-ambient.wav` and assign here when ready.
 */
export const NEURONET_AMBIENT_AUDIO_MODULE: number | null = null;

export const AMBIENT_AUDIO_BY_UNIVERSE_ID: Record<string, number | null> = {
  'dust-and-iron': AMBIENT_AUDIO_MODULE,
  neuronet: NEURONET_AMBIENT_AUDIO_MODULE,
};
