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
  AmbientAudioConfig,
  NEURONET_AMBIENT_AUDIO_MODULE,
  getAmbientAudioModule,
  universeHasAmbientAudio,
} from '@/constants/audio';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { ambientDebug } from '@/lib/ambient-audio-debug';
import { resolveAmbientAudioUri } from '@/lib/ambient-audio-source';
import { createExpoAmbientPlayer } from '@/lib/ambient-expo-player';
import type { AmbientPlayerAdapter } from '@/lib/ambient-player-adapter';
import {
  type AdapterRegistry,
  pauseAllExcept,
  startAmbientTrack,
  stopAllAmbientTracks,
  switchAmbientTrack,
} from '@/lib/ambient-track-playback';
import { createWebAmbientPlayer } from '@/lib/ambient-web-player';
import { loadAudioSettings, saveAudioSettings } from '@/lib/audio-settings-storage';

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
    neuronetLookup: getAmbientAudioModule('neuronet'),
    dustLookup: getAmbientAudioModule('dust-and-iron'),
    neuronetDistinctFromDust:
      getAmbientAudioModule('neuronet') !== getAmbientAudioModule('dust-and-iron'),
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

function AmbientTrackRegistry({
  adaptersRef,
  onRegistryChange,
}: {
  adaptersRef: React.MutableRefObject<AdapterRegistry>;
  onRegistryChange: () => void;
}) {
  const entries = Object.entries(AMBIENT_AUDIO_BY_UNIVERSE_ID).filter(
    (entry): entry is [string, number] => entry[1] !== null,
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
  fadeCancelRef,
  activeUniverseIdRef,
  playingUniverseIdRef,
}: {
  adaptersRef: React.MutableRefObject<AdapterRegistry>;
  fadeCancelRef: React.MutableRefObject<(() => void) | null>;
  activeUniverseIdRef: React.MutableRefObject<string>;
  playingUniverseIdRef: React.MutableRefObject<string | null>;
}) {
  const { activeUniverse, isHydrated: gameHydrated } = useGame();
  const { ambientEnabled, isHydrated: settingsHydrated, webPlaybackUnlocked } = useAmbientAudio();
  const [registryVersion, setRegistryVersion] = useState(0);

  const activeUniverseId = activeUniverse.id;
  const hasTrack = universeHasAmbientAudio(activeUniverseId);
  const wantsAmbient =
    settingsHydrated && gameHydrated && ambientEnabled && hasTrack;
  const shouldPlay = wantsAmbient && (!IS_WEB || webPlaybackUnlocked);

  const bumpRegistry = useCallback(() => {
    setRegistryVersion((version) => version + 1);
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
  const fadeCancelRef = useRef<(() => void) | null>(null);
  const activeUniverseIdRef = useRef('dust-and-iron');
  const playingUniverseIdRef = useRef<string | null>(null);

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
      neuronetDistinctFromDust:
        getAmbientAudioModule('neuronet') !== getAmbientAudioModule('dust-and-iron'),
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
    setAmbientEnabledState(enabled);
    void saveAudioSettings({ ambientEnabled: enabled });
    ambientDebug('Ambient preference updated', { enabled });
  }, []);

  const devTestAmbience = useCallback(() => {
    if (!__DEV__) return;

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
    if (!__DEV__) return;

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
          fadeCancelRef={fadeCancelRef}
          activeUniverseIdRef={activeUniverseIdRef}
          playingUniverseIdRef={playingUniverseIdRef}
        />
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
