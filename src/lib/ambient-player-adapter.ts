export type PlayResult = {
  ok: boolean;
  error?: string;
};

export type AmbientPlayerAdapter = {
  backend: 'web-html' | 'expo-audio';
  setVolume: (volume: number) => void;
  getVolume: () => number;
  setLoop: (loop: boolean) => void;
  playWithResult: () => Promise<PlayResult>;
  pause: () => void;
  /** Pause, mute, and reset playback position where supported. */
  hardStop: () => void;
  isPlaying: () => boolean;
  isPaused: () => boolean;
  isLoaded: () => boolean;
  getDebugState: () => Record<string, unknown>;
};
