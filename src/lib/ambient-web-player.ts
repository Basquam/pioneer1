import { ambientDebug } from '@/lib/ambient-audio-debug';
import type { AmbientPlayerAdapter, PlayResult } from '@/lib/ambient-player-adapter';

export function createWebAmbientPlayer(audio: HTMLAudioElement): AmbientPlayerAdapter {
  return {
    backend: 'web-html',
    setVolume: (volume) => {
      audio.volume = volume;
    },
    getVolume: () => audio.volume,
    setLoop: (loop) => {
      audio.loop = loop;
    },
    playWithResult: async (): Promise<PlayResult> => {
      ambientDebug('safePlay called', { backend: 'web-html' });
      try {
        await audio.play();
        ambientDebug('player.play succeeded', {
          backend: 'web-html',
          volume: audio.volume,
          paused: audio.paused,
          currentTime: audio.currentTime,
          readyState: audio.readyState,
        });
        return { ok: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        ambientDebug('player.play failed', { backend: 'web-html', error: message });
        return { ok: false, error: message };
      }
    },
    pause: () => {
      audio.pause();
      ambientDebug('player paused', {
        backend: 'web-html',
        volume: audio.volume,
        paused: audio.paused,
      });
    },
    hardStop: () => {
      audio.pause();
      audio.volume = 0;
      audio.currentTime = 0;
      ambientDebug('player hard stopped', {
        backend: 'web-html',
        paused: audio.paused,
        currentTime: audio.currentTime,
      });
    },
    isPlaying: () => !audio.paused && !audio.ended,
    isPaused: () => audio.paused,
    isLoaded: () => audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA,
    getDebugState: () => ({
      backend: 'web-html',
      src: audio.currentSrc || audio.src,
      volume: audio.volume,
      paused: audio.paused,
      ended: audio.ended,
      loop: audio.loop,
      readyState: audio.readyState,
      currentTime: audio.currentTime,
      duration: Number.isFinite(audio.duration) ? audio.duration : null,
      error: audio.error
        ? { code: audio.error.code, message: audio.error.message }
        : null,
    }),
  };
}
