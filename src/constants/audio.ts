export const AmbientAudioConfig = {
  wildWestUniverseId: 'dust-and-iron',
  /** Temporarily raised for easier verification — tune down before release. */
  targetVolume: 0.35,
  devTestVolume: 0.8,
  fadeInMs: 3500,
  fadeOutMs: 1200,
} as const;

/** Bundled frontier ambience — resolved to a URI at runtime. */
export const AMBIENT_AUDIO_MODULE = require('@/assets/audio/dustfall-ambient.wav');
