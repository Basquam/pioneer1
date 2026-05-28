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
  isPlaying: () => boolean;
  isPaused: () => boolean;
  isLoaded: () => boolean;
  getDebugState: () => Record<string, unknown>;
};
