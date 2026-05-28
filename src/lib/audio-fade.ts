import { ambientDebug } from '@/lib/ambient-audio-debug';

type VolumeTarget = {
  volume: number;
};

export function createVolumeTarget(
  getVolume: () => number,
  setVolume: (volume: number) => void,
): VolumeTarget {
  return {
    get volume() {
      return getVolume();
    },
    set volume(value: number) {
      setVolume(value);
    },
  };
}

export function fadeVolume(
  target: VolumeTarget,
  from: number,
  to: number,
  durationMs: number,
  onComplete?: () => void,
): () => void {
  if (durationMs <= 0) {
    target.volume = to;
    if (__DEV__) {
      ambientDebug('Fade skipped (zero duration)', { volume: target.volume });
    }
    onComplete?.();
    return () => undefined;
  }

  const start = Date.now();
  let frameId = 0;
  let lastLoggedAt = 0;

  const tick = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(1, elapsed / durationMs);
    target.volume = from + (to - from) * progress;

    if (__DEV__ && elapsed - lastLoggedAt >= 500) {
      lastLoggedAt = elapsed;
      ambientDebug('Fade volume', {
        volume: Number(target.volume.toFixed(3)),
        progress: Number(progress.toFixed(2)),
        from,
        to,
      });
    }

    if (progress < 1) {
      frameId = requestAnimationFrame(tick);
      return;
    }

    if (__DEV__) {
      ambientDebug('Fade complete', { volume: Number(target.volume.toFixed(3)) });
    }
    onComplete?.();
  };

  if (__DEV__) {
    ambientDebug('Fade started', { from, to, durationMs });
  }

  frameId = requestAnimationFrame(tick);

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
  };
}
