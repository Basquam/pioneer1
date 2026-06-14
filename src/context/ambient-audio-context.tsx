import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

import {
  AMBIENT_AUDIO_BY_UNIVERSE_ID,
  AMBIENT_AUDIO_MODULE,
  AMBIENT_TENSION_AUDIO_BY_UNIVERSE_ID,
  AmbientAudioConfig,
  NEON_ASHES_AMBIENT_AUDIO_MODULE,
  NEURONET_AMBIENT_AUDIO_MODULE,
  getAmbientAudioModule,
  getAmbientTensionAudioModule,
  universeHasAmbientAudio,
} from '@/constants/audio';
import { GameFonts } from '@/constants/typography';
import {
  AmbientTensionRegistry,
  EventStingRegistry,
} from '@/components/rpg/event-sting-registry';
import { EventStingCoordinator } from '@/components/rpg/event-sting-coordinator';
import { useGame } from '@/hooks/use-game';
import { ambientDebug } from '@/lib/ambient-audio-debug';
import {
  resolveAmbientAudioUri,
  resolveAmbientTensionAudioUri,
} from '@/lib/ambient-audio-source';
import { createExpoAmbientPlayer } from '@/lib/ambient-expo-player';
import type { AmbientPlayerAdapter } from '@/lib/ambient-player-adapter';
import {
  getTensionAdapterKey,
  isAmbientTensionActive,
} from '@/lib/ambient-tension';
import { applyDustAndIronTensionMix } from '@/lib/ambient-tension-playback';
import {
  type AdapterRegistry,
  pauseAllExcept,
  startAmbientTrack,
  stopAllAmbientTracks,
  switchAmbientTrack,
} from '@/lib/ambient-track-playback';
import { createWebAmbientPlayer } from '@/lib/ambient-web-player';
import type { EventStingKind } from '@/lib/celebration-sting-resolver';
import {
  type EventStingPlayerMap,
  playEventSting,
  stopWebEventSting,
} from '@/lib/event-sting-playback';
import { loadAudioSettings, saveAudioSettings } from '@/lib/audio-settings-storage';
import { SHOW_INTERNAL_TOOLS } from '@/lib/internal-test-tools';

const IS_WEB = Platform.OS === 'web';

type AmbientAudioContextValue = {
  ambientEnabled: boolean;
  setAmbientEnabled: (enabled: boolean) => void;
  isHydrated: boolean;
  webPlaybackUnlocked: boolean;
  unlockWebPlayback: () => void;
  needsWebUnlock: boolean;
  devTestAmbience: () => void;
  devStopAmbience: () => void;
};

const AmbientAudioContext = createContext<AmbientAudioContextValue | null>(null);

function logResolvedAmbientModule(universeId: string, module: number) {
  if (!__DEV__) return;

  ambientDebug('Resolved ambient module', {
    universeId,
    module,
    isDustModule: module === AMBIENT_AUDIO_MODULE,
    isNeuronetModule: module === NEURONET_AMBIENT_AUDIO_MODULE,
    isNeonAshesModule: module === NEON_ASHES_AMBIENT_AUDIO_MODULE,
    neuronetLookup: getAmbientAudioModule('neuronet'),
    dustLookup: getAmbientAudioModule('dust-and-iron'),
    neonAshesLookup: getAmbientAudioModule('neon-ashes'),
    neuronetDistinctFromDust:
      getAmbientAudioModule('neuronet') !== getAmbientAudioModule('dust-and-iron'),
    neonAshesDistinctFromDust:
      getAmbientAudioModule('neon-ashes') !== getAmbientAudioModule('dust-and-iron'),
    neonAshesDistinctFromNeuronet:
      getAmbientAudioModule('neon-ashes') !== getAmbientAudioModule('neuronet'),
  });
}

function AmbientActiveUniverseLogger({
  activeUniverseIdRef,
  playingUniverseIdRef,
}: {
  activeUniverseIdRef: React.MutableRefObject<string>;
  playingUniverseIdRef: React.MutableRefObject<string | null>;
}) {
  const { activeUniverse } = useGame();

  useEffect(() => {
    activeUniverseIdRef.current = activeUniverse.id;

    if (__DEV__) {
      ambientDebug('AmbientAudioProvider activeUniverse.id', {
        activeUniverseId: activeUniverse.id,
        currentlyPlayingUniverseId: playingUniverseIdRef.current,
        ambientModule: getAmbientAudioModule(activeUniverse.id),
      });
    }
  }, [activeUniverse.id, activeUniverseIdRef, playingUniverseIdRef]);

  return null;
}

function NativeAmbientTrack({
  universeId,
  module,
  adaptersRef,
  onRegistryChange,
}: {
  universeId: string;
  module: number;
  adaptersRef: React.MutableRefObject<AdapterRegistry>;
  onRegistryChange: () => void;
}) {
  const player = useAudioPlayer(module);

  useEffect(() => {
    logResolvedAmbientModule(universeId, module);
    player.loop = true;
    adaptersRef.current[universeId] = createExpoAmbientPlayer(player);
    onRegistryChange();
    ambientDebug('Native track registered', {
      universeId,
      state: adaptersRef.current[universeId]?.getDebugState(),
    });

    return () => {
      adaptersRef.current[universeId]?.hardStop();
      adaptersRef.current[universeId] = null;
      onRegistryChange();
      ambientDebug('Native track released', { universeId });
    };
  }, [adaptersRef, module, onRegistryChange, player, universeId]);

  return null;
}

function WebAmbientTrack({
  universeId,
  adaptersRef,
  onRegistryChange,
}: {
  universeId: string;
  adaptersRef: React.MutableRefObject<AdapterRegistry>;
  onRegistryChange: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let active = true;

    void resolveAmbientAudioUri(universeId)
      .then((uri) => {
        if (!active) return;

        if (__DEV__) {
          ambientDebug('Resolved ambient URI', {
            universeId,
            uri,
            module: getAmbientAudioModule(universeId),
          });
        }

        ambientDebug('Web: creating HTMLAudioElement', { universeId, uri });
        const audio = new Audio(uri);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0;
        audioRef.current = audio;
        adaptersRef.current[universeId] = createWebAmbientPlayer(audio);
        onRegistryChange();
        ambientDebug('Web track registered', {
          universeId,
          state: adaptersRef.current[universeId]?.getDebugState(),
        });
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        ambientDebug('Web track load failed', { universeId, error: message });
      });

    return () => {
      active = false;
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.volume = 0;
        audio.currentTime = 0;
        audio.src = '';
      }
      audioRef.current = null;
      adaptersRef.current[universeId] = null;
      onRegistryChange();
      ambientDebug('Web track released', { universeId });
    };
  }, [adaptersRef, onRegistryChange, universeId]);

  return null;
}

function WebTensionTrack({
  universeId,
  adapterKey,
  adaptersRef,
  onRegistryChange,
}: {
  universeId: string;
  adapterKey: string;
  adaptersRef: React.MutableRefObject<AdapterRegistry>;
  onRegistryChange: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let active = true;

    void resolveAmbientTensionAudioUri(universeId)
      .then((uri) => {
        if (!active) return;

        ambientDebug('Web: creating tension HTMLAudioElement', { universeId, adapterKey, uri });
        const audio = new Audio(uri);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = 0;
        audioRef.current = audio;
        adaptersRef.current[adapterKey] = createWebAmbientPlayer(audio);
        onRegistryChange();
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        ambientDebug('Web tension track load failed', { universeId, adapterKey, error: message });
      });

    return () => {
      active = false;
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.volume = 0;
        audio.currentTime = 0;
        audio.src = '';
      }
      audioRef.current = null;
      adaptersRef.current[adapterKey] = null;
      onRegistryChange();
    };
  }, [adapterKey, adaptersRef, onRegistryChange, universeId]);

  return null;
}

function AmbientTensionTrackRegistry({
  adaptersRef,
  onRegistryChange,
}: {
  adaptersRef: React.MutableRefObject<AdapterRegistry>;
  onRegistryChange: () => void;
}) {
  const entries = useMemo(
    () => Object.keys(AMBIENT_TENSION_AUDIO_BY_UNIVERSE_ID),
    [],
  );

  if (IS_WEB) {
    return (
      <>
        {entries.map((universeId) => (
          <WebTensionTrack
            key={`${universeId}::tension`}
            universeId={universeId}
            adapterKey={`${universeId}::tension`}
            adaptersRef={adaptersRef}
            onRegistryChange={onRegistryChange}
          />
        ))}
      </>
    );
  }

  return <AmbientTensionRegistry adaptersRef={adaptersRef} onRegistryChange={onRegistryChange} />;
}

function AmbientTrackRegistry({
  adaptersRef,
  onRegistryChange,
}: {
  adaptersRef: React.MutableRefObject<AdapterRegistry>;
  onRegistryChange: () => void;
}) {
  const entries = useMemo(
    () =>
      Object.entries(AMBIENT_AUDIO_BY_UNIVERSE_ID).filter(
        (entry): entry is [string, number] => entry[1] !== null,
      ),
    [],
  );

  if (IS_WEB) {
    return (
      <>
        {entries.map(([universeId]) => (
          <WebAmbientTrack
            key={universeId}
            universeId={universeId}
            adaptersRef={adaptersRef}
            onRegistryChange={onRegistryChange}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {entries.map(([universeId, module]) => (
        <NativeAmbientTrack
          key={universeId}
          universeId={universeId}
          module={module}
          adaptersRef={adaptersRef}
          onRegistryChange={onRegistryChange}
        />
      ))}
    </>
  );
}

function AmbientAudioEngine({
  adaptersRef,
  tensionAdaptersRef,
  fadeCancelRef,
  tensionFadeCancelRef,
  activeUniverseIdRef,
  playingUniverseIdRef,
}: {
  adaptersRef: React.MutableRefObject<AdapterRegistry>;
  tensionAdaptersRef: React.MutableRefObject<AdapterRegistry>;
  fadeCancelRef: React.MutableRefObject<(() => void) | null>;
  tensionFadeCancelRef: React.MutableRefObject<(() => void) | null>;
  activeUniverseIdRef: React.MutableRefObject<string>;
  playingUniverseIdRef: React.MutableRefObject<string | null>;
}) {
  const {
    activeUniverse,
    activeSaga,
    narrativeMoment,
    activeCelebration,
    isCelebrationActive,
    isHydrated: gameHydrated,
  } = useGame();
  const { ambientEnabled, isHydrated: settingsHydrated, webPlaybackUnlocked } = useAmbientAudio();
  const [registryVersion, setRegistryVersion] = useState(0);
  const [tensionRegistryVersion, setTensionRegistryVersion] = useState(0);

  const activeUniverseId = activeUniverse.id;
  const hasTrack = universeHasAmbientAudio(activeUniverseId);
  const hasTensionTrack = getAmbientTensionAudioModule(activeUniverseId) !== null;
  const tensionAdapterKey = getTensionAdapterKey(activeUniverseId);
  const wantsAmbient =
    settingsHydrated && gameHydrated && ambientEnabled && hasTrack;
  const shouldPlay = wantsAmbient && (!IS_WEB || webPlaybackUnlocked);
  const tensionActive =
    shouldPlay &&
    hasTensionTrack &&
    isAmbientTensionActive({
      universe: activeUniverse,
      narrativeMoment,
      isCelebrationActive,
      activeCelebration,
      activeSaga,
    });

  const bumpRegistry = useCallback(() => {
    setRegistryVersion((version) => version + 1);
  }, []);

  const bumpTensionRegistry = useCallback(() => {
    setTensionRegistryVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    });
  }, []);

  useEffect(() => {
    if (__DEV__) {
      ambientDebug('Engine state', {
        activeUniverseId,
        currentlyPlayingUniverseId: playingUniverseIdRef.current,
        requestedNextUniverseId: shouldPlay ? activeUniverseId : null,
        wantsAmbient,
        shouldPlay,
        webPlaybackUnlocked,
        ambientEnabled,
        registryVersion,
      });
    }
  }, [
    activeUniverseId,
    ambientEnabled,
    playingUniverseIdRef,
    registryVersion,
    shouldPlay,
    wantsAmbient,
    webPlaybackUnlocked,
  ]);

  useEffect(() => {
    const targetAdapter = hasTrack ? adaptersRef.current[activeUniverseId] ?? null : null;
    const currentlyPlayingUniverseId = playingUniverseIdRef.current;

    if (!shouldPlay) {
      if (__DEV__) {
        ambientDebug('Ambient playback disabled — stopping all tracks', {
          activeUniverseId,
          currentlyPlayingUniverseId,
        });
      }
      stopAllAmbientTracks(adaptersRef.current, fadeCancelRef, playingUniverseIdRef);
      return;
    }

    if (!targetAdapter) {
      if (__DEV__) {
        ambientDebug('Playback waiting for adapter', {
          activeUniverseId,
          currentlyPlayingUniverseId,
        });
      }
      return;
    }

    if (
      currentlyPlayingUniverseId === activeUniverseId &&
      targetAdapter.isPlaying() &&
      targetAdapter.getVolume() >= AmbientAudioConfig.targetVolume * 0.85
    ) {
      pauseAllExcept(adaptersRef.current, activeUniverseId);
      return;
    }

    switchAmbientTrack(
      adaptersRef.current,
      currentlyPlayingUniverseId,
      activeUniverseId,
      fadeCancelRef,
      playingUniverseIdRef,
    );
  }, [
    activeUniverseId,
    adaptersRef,
    fadeCancelRef,
    hasTrack,
    playingUniverseIdRef,
    registryVersion,
    shouldPlay,
  ]);

  useEffect(() => {
    applyDustAndIronTensionMix({
      townAdapters: adaptersRef.current,
      tensionAdapters: tensionAdaptersRef.current,
      townAdapterKey: activeUniverseId,
      tensionAdapterKey,
      tensionActive,
      shouldPlay: shouldPlay && hasTensionTrack,
      fadeCancelRef: tensionFadeCancelRef,
    });
  }, [
    activeCelebration,
    activeUniverse,
    activeUniverseId,
    adaptersRef,
    hasTensionTrack,
    isCelebrationActive,
    narrativeMoment,
    shouldPlay,
    tensionActive,
    tensionAdapterKey,
    tensionAdaptersRef,
    tensionFadeCancelRef,
    tensionRegistryVersion,
  ]);

  useEffect(
    () => () => {
      tensionFadeCancelRef.current?.();
      tensionFadeCancelRef.current = null;
      Object.keys(AMBIENT_TENSION_AUDIO_BY_UNIVERSE_ID).forEach((universeId) => {
        const tensionAdapter = tensionAdaptersRef.current[getTensionAdapterKey(universeId)];
        if (tensionAdapter) {
          tensionAdapter.pause();
          tensionAdapter.setVolume(0);
        }
      });
    },
    [tensionAdaptersRef, tensionFadeCancelRef],
  );

  useEffect(
    () => () => {
      fadeCancelRef.current?.();
      fadeCancelRef.current = null;
      pauseAllExcept(adaptersRef.current, null);
      playingUniverseIdRef.current = null;
    },
    [adaptersRef, fadeCancelRef, playingUniverseIdRef],
  );

  return (
    <>
      <AmbientActiveUniverseLogger
        activeUniverseIdRef={activeUniverseIdRef}
        playingUniverseIdRef={playingUniverseIdRef}
      />
      <AmbientTrackRegistry adaptersRef={adaptersRef} onRegistryChange={bumpRegistry} />
      <AmbientTensionTrackRegistry
        adaptersRef={tensionAdaptersRef}
        onRegistryChange={bumpTensionRegistry}
      />
    </>
  );
}

function AmbientWebUnlockPrompt() {
  const { ambientEnabled, isHydrated, webPlaybackUnlocked, unlockWebPlayback, needsWebUnlock } =
    useAmbientAudio();
  const { activeUniverse, isHydrated: gameHydrated } = useGame();

  if (
    !IS_WEB ||
    !isHydrated ||
    !gameHydrated ||
    webPlaybackUnlocked ||
    !ambientEnabled ||
    !needsWebUnlock
  ) {
    return null;
  }

  if (!universeHasAmbientAudio(activeUniverse.id)) {
    return null;
  }

  const { palette } = activeUniverse;

  return (
    <View pointerEvents="box-none" style={styles.promptHost}>
      <Pressable
        onPress={unlockWebPlayback}
        style={[
          styles.prompt,
          { backgroundColor: palette.panel, borderColor: palette.gold },
        ]}>
        <Text style={[styles.promptText, { color: palette.bone }]}>Tap to enable ambience</Text>
      </Pressable>
    </View>
  );
}

export function AmbientAudioProvider({ children }: { children: ReactNode }) {
  const [ambientEnabled, setAmbientEnabledState] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [webPlaybackUnlocked, setWebPlaybackUnlocked] = useState(!IS_WEB);
  const adaptersRef = useRef<AdapterRegistry>({});
  const tensionAdaptersRef = useRef<AdapterRegistry>({});
  const stingPlayersRef = useRef<EventStingPlayerMap>({});
  const fadeCancelRef = useRef<(() => void) | null>(null);
  const tensionFadeCancelRef = useRef<(() => void) | null>(null);
  const activeUniverseIdRef = useRef('dust-and-iron');
  const playingUniverseIdRef = useRef<string | null>(null);
  const bumpStingRegistry = useCallback(() => {}, []);

  const playSting = useCallback(
    (kind: EventStingKind) => {
      void playEventSting(
        kind,
        {
          ambientEnabled,
          webPlaybackUnlocked,
          universeId: activeUniverseIdRef.current,
        },
        stingPlayersRef.current,
      );
    },
    [ambientEnabled, webPlaybackUnlocked],
  );

  useEffect(() => {
    let mounted = true;

    void loadAudioSettings().then((settings) => {
      if (!mounted) return;
      setAmbientEnabledState(settings.ambientEnabled);
      setIsHydrated(true);
      ambientDebug('Audio settings hydrated', settings);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!__DEV__) return;

    ambientDebug('Ambient module registry check', {
      neuronetModule: getAmbientAudioModule('neuronet'),
      dustModule: getAmbientAudioModule('dust-and-iron'),
      neonAshesModule: getAmbientAudioModule('neon-ashes'),
      neuronetDistinctFromDust:
        getAmbientAudioModule('neuronet') !== getAmbientAudioModule('dust-and-iron'),
      neonAshesDistinctFromDust:
        getAmbientAudioModule('neon-ashes') !== getAmbientAudioModule('dust-and-iron'),
      neonAshesDistinctFromNeuronet:
        getAmbientAudioModule('neon-ashes') !== getAmbientAudioModule('neuronet'),
    });
  }, []);

  const unlockWebPlayback = useCallback(() => {
    if (!IS_WEB) return;
    ambientDebug('Web playback unlocked');
    setWebPlaybackUnlocked(true);
  }, []);

  useEffect(() => {
    if (!IS_WEB || webPlaybackUnlocked) return;

    const unlock = () => {
      ambientDebug('Web playback unlocked (global interaction)');
      setWebPlaybackUnlocked(true);
    };

    window.addEventListener('pointerdown', unlock, { once: true, capture: true });
    window.addEventListener('keydown', unlock, { once: true, capture: true });

    return () => {
      window.removeEventListener('pointerdown', unlock, { capture: true });
      window.removeEventListener('keydown', unlock, { capture: true });
    };
  }, [webPlaybackUnlocked]);

  const setAmbientEnabled = useCallback((enabled: boolean) => {
    if (enabled && IS_WEB) {
      ambientDebug('Web playback unlocked (ambient toggle ON)');
      setWebPlaybackUnlocked(true);
    }
    if (!enabled) {
      stopWebEventSting();
    }
    setAmbientEnabledState(enabled);
    void saveAudioSettings({ ambientEnabled: enabled });
    ambientDebug('Ambient preference updated', { enabled });
  }, []);

  const devTestAmbience = useCallback(() => {
    if (!SHOW_INTERNAL_TOOLS) return;

    if (IS_WEB) {
      setWebPlaybackUnlocked(true);
    }

    fadeCancelRef.current?.();
    fadeCancelRef.current = null;

    const universeId = activeUniverseIdRef.current;
    const player = adaptersRef.current[universeId];

    ambientDebug('TEST AMBIENCE clicked', {
      activeUniverseId: universeId,
      currentlyPlayingUniverseId: playingUniverseIdRef.current,
      playerReady: Boolean(player),
      ambientModule: getAmbientAudioModule(universeId),
      state: player?.getDebugState() ?? null,
    });

    if (!player) return;

    pauseAllExcept(adaptersRef.current, universeId);
    player.setLoop(true);
    player.setVolume(AmbientAudioConfig.devTestVolume);
    void player.playWithResult().then((result) => {
      playingUniverseIdRef.current = universeId;
      ambientDebug('TEST AMBIENCE result', {
        universeId,
        result,
        state: player.getDebugState(),
      });
    });
  }, []);

  const devStopAmbience = useCallback(() => {
    if (!SHOW_INTERNAL_TOOLS) return;

    fadeCancelRef.current?.();
    fadeCancelRef.current = null;

    const universeId = activeUniverseIdRef.current;
    const player = adaptersRef.current[universeId];

    ambientDebug('STOP AMBIENCE clicked', {
      activeUniverseId: universeId,
      currentlyPlayingUniverseId: playingUniverseIdRef.current,
      playerReady: Boolean(player),
      state: player?.getDebugState() ?? null,
    });

    stopAllAmbientTracks(adaptersRef.current, fadeCancelRef, playingUniverseIdRef);
  }, []);

  const needsWebUnlock = IS_WEB && ambientEnabled && !webPlaybackUnlocked;

  const value = useMemo(
    () => ({
      ambientEnabled,
      setAmbientEnabled,
      isHydrated,
      webPlaybackUnlocked,
      unlockWebPlayback,
      needsWebUnlock,
      devTestAmbience,
      devStopAmbience,
    }),
    [
      ambientEnabled,
      devStopAmbience,
      devTestAmbience,
      isHydrated,
      needsWebUnlock,
      setAmbientEnabled,
      unlockWebPlayback,
      webPlaybackUnlocked,
    ],
  );

  return (
    <AmbientAudioContext.Provider value={value}>
      <View style={styles.root}>
        <AmbientAudioEngine
          adaptersRef={adaptersRef}
          tensionAdaptersRef={tensionAdaptersRef}
          fadeCancelRef={fadeCancelRef}
          tensionFadeCancelRef={tensionFadeCancelRef}
          activeUniverseIdRef={activeUniverseIdRef}
          playingUniverseIdRef={playingUniverseIdRef}
        />
        <EventStingRegistry
          playersRef={stingPlayersRef}
          onRegistryChange={bumpStingRegistry}
        />
        <EventStingCoordinator playSting={playSting} />
        <AmbientWebUnlockPrompt />
        {children}
      </View>
    </AmbientAudioContext.Provider>
  );
}

export function useAmbientAudio() {
  const ctx = useContext(AmbientAudioContext);
  if (!ctx) {
    throw new Error('useAmbientAudio must be used within AmbientAudioProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  promptHost: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    zIndex: 50,
    pointerEvents: 'box-none',
  },
  prompt: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    transform: [{ skewX: '-4deg' }],
  },
  promptText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1.5,
  },
});
