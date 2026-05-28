import { AmbientAudioConfig, getAmbientAudioModule } from '@/constants/audio';
import { ambientDebug } from '@/lib/ambient-audio-debug';
import type { AmbientPlayerAdapter } from '@/lib/ambient-player-adapter';
import { fadeVolume, createVolumeTarget } from '@/lib/audio-fade';

type FadeCancelRef = {
  current: (() => void) | null;
};

export type AdapterRegistry = Record<string, AmbientPlayerAdapter | null>;

function createAdapterVolumeTarget(adapter: AmbientPlayerAdapter) {
  return createVolumeTarget(
    () => adapter.getVolume(),
    (volume) => adapter.setVolume(volume),
  );
}

export function hardStopAmbientAdapter(universeId: string, adapter: AmbientPlayerAdapter) {
  if (__DEV__) {
    ambientDebug('Hard stopping adapter', {
      universeId,
      state: adapter.getDebugState(),
    });
  }
  adapter.hardStop();
}

export function pauseAllExcept(
  adapters: AdapterRegistry,
  exceptUniverseId: string | null,
) {
  for (const [universeId, adapter] of Object.entries(adapters)) {
    if (!adapter || universeId === exceptUniverseId) continue;
    hardStopAmbientAdapter(universeId, adapter);
  }
}

function fadeOutAndPause(
  universeId: string,
  adapter: AmbientPlayerAdapter,
  fadeCancelRef: FadeCancelRef,
  onComplete?: () => void,
) {
  const currentVolume = adapter.getVolume();

  if (__DEV__) {
    ambientDebug('fadeOut started', {
      universeId,
      volume: currentVolume,
      state: adapter.getDebugState(),
    });
  }

  if (currentVolume <= 0.001) {
    adapter.pause();
    if (__DEV__) {
      ambientDebug('fadeOut skipped (already silent)', { universeId });
    }
    onComplete?.();
    return;
  }

  fadeCancelRef.current = fadeVolume(
    createAdapterVolumeTarget(adapter),
    currentVolume,
    0,
    AmbientAudioConfig.fadeOutMs,
    () => {
      if (__DEV__) {
        ambientDebug('fadeOut completed', {
          universeId,
          state: adapter.getDebugState(),
        });
      }
      adapter.pause();
      if (__DEV__) {
        ambientDebug('Old track paused', { universeId, state: adapter.getDebugState() });
      }
      onComplete?.();
    },
  );
}

function fadeInAndPlay(
  universeId: string,
  adapter: AmbientPlayerAdapter,
  fadeCancelRef: FadeCancelRef,
  onStarted?: () => void,
) {
  if (__DEV__) {
    ambientDebug('fadeIn started', {
      universeId,
      state: adapter.getDebugState(),
    });
  }

  adapter.setLoop(true);
  adapter.setVolume(0);
  void adapter.playWithResult().then((result) => {
    if (__DEV__) {
      ambientDebug('New track play attempt finished', {
        universeId,
        result,
        state: adapter.getDebugState(),
      });
    }
  });

  onStarted?.();

  fadeCancelRef.current = fadeVolume(
    createAdapterVolumeTarget(adapter),
    0,
    AmbientAudioConfig.targetVolume,
    AmbientAudioConfig.fadeInMs,
    () => {
      if (__DEV__) {
        ambientDebug('fadeIn completed', {
          universeId,
          volume: adapter.getVolume(),
          playing: adapter.isPlaying(),
          state: adapter.getDebugState(),
        });
      }
    },
  );
}

export function startAmbientTrack(
  universeId: string,
  adapters: AdapterRegistry,
  adapter: AmbientPlayerAdapter,
  fadeCancelRef: FadeCancelRef,
  playingUniverseIdRef: { current: string | null },
) {
  pauseAllExcept(adapters, universeId);
  fadeInAndPlay(universeId, adapter, fadeCancelRef, () => {
    playingUniverseIdRef.current = universeId;
  });
}

export function stopAmbientTrack(
  universeId: string | null,
  adapters: AdapterRegistry,
  adapter: AmbientPlayerAdapter | null | undefined,
  fadeCancelRef: FadeCancelRef,
  playingUniverseIdRef: { current: string | null },
) {
  if (!adapter || !universeId) return;

  if (__DEV__) {
    ambientDebug('Stopping ambient track', {
      universeId,
      state: adapter.getDebugState(),
    });
  }

  fadeCancelRef.current?.();
  fadeCancelRef.current = null;

  fadeOutAndPause(universeId, adapter, fadeCancelRef, () => {
    hardStopAmbientAdapter(universeId, adapter);
    if (playingUniverseIdRef.current === universeId) {
      playingUniverseIdRef.current = null;
    }
  });
}

export function switchAmbientTrack(
  adapters: AdapterRegistry,
  fromUniverseId: string | null,
  toUniverseId: string,
  fadeCancelRef: FadeCancelRef,
  playingUniverseIdRef: { current: string | null },
) {
  fadeCancelRef.current?.();
  fadeCancelRef.current = null;

  const fromAdapter = fromUniverseId ? adapters[fromUniverseId] ?? null : null;
  const toAdapter = adapters[toUniverseId] ?? null;

  if (__DEV__) {
    ambientDebug('Switch requested', {
      currentlyPlayingUniverseId: playingUniverseIdRef.current,
      requestedNextUniverseId: toUniverseId,
      fromUniverseId,
      fromReady: Boolean(fromAdapter),
      toReady: Boolean(toAdapter),
      neuronetModule: getAmbientAudioModule('neuronet'),
      dustModule: getAmbientAudioModule('dust-and-iron'),
      modulesDistinct:
        getAmbientAudioModule('neuronet') !== getAmbientAudioModule('dust-and-iron'),
    });
  }

  if (!toAdapter) {
    if (__DEV__) {
      ambientDebug('Switch aborted — target adapter missing', { toUniverseId });
    }
    return;
  }

  pauseAllExcept(adapters, toUniverseId);

  if (!fromAdapter || fromUniverseId === toUniverseId) {
    startAmbientTrack(toUniverseId, adapters, toAdapter, fadeCancelRef, playingUniverseIdRef);
    return;
  }

  if (fromAdapter.getVolume() <= 0.001 && !fromAdapter.isPlaying()) {
    hardStopAmbientAdapter(fromUniverseId!, fromAdapter);
    startAmbientTrack(toUniverseId, adapters, toAdapter, fadeCancelRef, playingUniverseIdRef);
    return;
  }

  fadeOutAndPause(fromUniverseId!, fromAdapter, fadeCancelRef, () => {
    hardStopAmbientAdapter(fromUniverseId!, fromAdapter);
    if (__DEV__) {
      ambientDebug('Old track stopped after fadeOut', {
        fromUniverseId,
        state: fromAdapter.getDebugState(),
      });
    }
    pauseAllExcept(adapters, toUniverseId);
    startAmbientTrack(toUniverseId, adapters, toAdapter, fadeCancelRef, playingUniverseIdRef);
  });
}

export function stopAllAmbientTracks(
  adapters: AdapterRegistry,
  fadeCancelRef: FadeCancelRef,
  playingUniverseIdRef: { current: string | null },
) {
  fadeCancelRef.current?.();
  fadeCancelRef.current = null;

  const playingId = playingUniverseIdRef.current;
  const playingAdapter = playingId ? adapters[playingId] ?? null : null;

  if (playingAdapter && playingId) {
    stopAmbientTrack(playingId, adapters, playingAdapter, fadeCancelRef, playingUniverseIdRef);
    return;
  }

  pauseAllExcept(adapters, null);
  playingUniverseIdRef.current = null;
}
