import { AmbientAudioConfig } from '@/constants/audio';
import { ambientDebug } from '@/lib/ambient-audio-debug';
import type { AmbientPlayerAdapter } from '@/lib/ambient-player-adapter';
import { fadeVolume, createVolumeTarget } from '@/lib/audio-fade';
import type { AdapterRegistry } from '@/lib/ambient-track-playback';

type FadeCancelRef = {
  current: (() => void) | null;
};

function adapterVolumeTarget(adapter: AmbientPlayerAdapter) {
  return createVolumeTarget(
    () => adapter.getVolume(),
    (volume) => adapter.setVolume(volume),
  );
}

export function applyDustAndIronTensionMix({
  townAdapters,
  tensionAdapters,
  townAdapterKey,
  tensionAdapterKey,
  tensionActive,
  shouldPlay,
  fadeCancelRef,
}: {
  townAdapters: AdapterRegistry;
  tensionAdapters: AdapterRegistry;
  townAdapterKey: string;
  tensionAdapterKey: string;
  tensionActive: boolean;
  shouldPlay: boolean;
  fadeCancelRef: FadeCancelRef;
}) {
  const townAdapter = townAdapters[townAdapterKey] ?? null;
  const tensionAdapter = tensionAdapters[tensionAdapterKey] ?? null;

  if (!shouldPlay || !townAdapter) {
    fadeCancelRef.current?.();
    fadeCancelRef.current = null;
    if (tensionAdapter) {
      tensionAdapter.pause();
      tensionAdapter.setVolume(0);
    }
    return;
  }

  if (!tensionAdapter) return;

  const townTarget = AmbientAudioConfig.targetVolume * (tensionActive ? AmbientAudioConfig.tensionTownMix : 1);
  const tensionTarget = tensionActive
    ? AmbientAudioConfig.targetVolume * AmbientAudioConfig.tensionOverlayMix
    : 0;

  fadeCancelRef.current?.();
  fadeCancelRef.current = null;

  if (tensionActive) {
    if (!tensionAdapter.isPlaying()) {
      tensionAdapter.setLoop(true);
      tensionAdapter.setVolume(0);
      void tensionAdapter.playWithResult();
    }
  }

  let completed = 0;
  const onComplete = () => {
    completed += 1;
    if (completed < 2) return;
    if (!tensionActive) {
      tensionAdapter.pause();
      tensionAdapter.setVolume(0);
    }
  };

  const cancelTown = fadeVolume(
    adapterVolumeTarget(townAdapter),
    townAdapter.getVolume(),
    townTarget,
    AmbientAudioConfig.tensionCrossfadeMs,
    onComplete,
  );

  const cancelTension = fadeVolume(
    adapterVolumeTarget(tensionAdapter),
    tensionAdapter.getVolume(),
    tensionTarget,
    AmbientAudioConfig.tensionCrossfadeMs,
    onComplete,
  );

  fadeCancelRef.current = () => {
    cancelTown();
    cancelTension();
  };

  if (__DEV__) {
    ambientDebug('Ambient tension mix updated', {
      tensionActive,
      townTarget,
      tensionTarget,
    });
  }
}
