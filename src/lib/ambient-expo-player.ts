import type { AudioPlayer } from 'expo-audio';

import { ambientDebug } from '@/lib/ambient-audio-debug';
import type { AmbientPlayerAdapter, PlayResult } from '@/lib/ambient-player-adapter';

export function createExpoAmbientPlayer(player: AudioPlayer): AmbientPlayerAdapter {
  return {
    backend: 'expo-audio',
    setVolume: (volume) => {
      player.volume = volume;
    },
    getVolume: () => player.volume,
    setLoop: (loop) => {
      player.loop = loop;
    },
    playWithResult: async (): Promise<PlayResult> => {
      ambientDebug('safePlay called', { backend: 'expo-audio' });
      try {
        player.play();
        ambientDebug('player.play succeeded', {
          backend: 'expo-audio',
          volume: player.volume,
          playing: player.playing,
          paused: player.paused,
          isLoaded: player.isLoaded,
        });
        return { ok: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        ambientDebug('player.play failed', { backend: 'expo-audio', error: message });
        return { ok: false, error: message };
      }
    },
    pause: () => {
      player.pause();
      ambientDebug('player paused', {
        backend: 'expo-audio',
        volume: player.volume,
        playing: player.playing,
        paused: player.paused,
      });
    },
    hardStop: () => {
      player.pause();
      player.volume = 0;
      ambientDebug('player hard stopped', {
        backend: 'expo-audio',
        playing: player.playing,
        paused: player.paused,
        volume: player.volume,
      });
    },
    isPlaying: () => player.playing,
    isPaused: () => player.paused,
    isLoaded: () => player.isLoaded,
    getDebugState: () => ({
      backend: 'expo-audio',
      volume: player.volume,
      playing: player.playing,
      paused: player.paused,
      loop: player.loop,
      isLoaded: player.isLoaded,
      isBuffering: player.isBuffering,
      currentTime: player.currentTime,
      duration: player.duration,
    }),
  };
}
