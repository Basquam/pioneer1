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
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { AMBIENT_AUDIO_MODULE, AmbientAudioConfig } from '@/constants/audio';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { ambientDebug } from '@/lib/ambient-audio-debug';
import { resolveAmbientAudioUri } from '@/lib/ambient-audio-source';
import { createExpoAmbientPlayer } from '@/lib/ambient-expo-player';
import type { AmbientPlayerAdapter } from '@/lib/ambient-player-adapter';
import { createWebAmbientPlayer } from '@/lib/ambient-web-player';
import { fadeVolume, createVolumeTarget } from '@/lib/audio-fade';
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

type EngineProps = {
  playerRef: React.MutableRefObject<AmbientPlayerAdapter | null>;
  fadeCancelRef: React.MutableRefObject<(() => void) | null>;
  shouldPlay: boolean;
  playerReady: boolean;
};

function useAmbientPlayback({ playerRef, fadeCancelRef, shouldPlay, playerReady }: EngineProps) {
  useEffect(() => {
    fadeCancelRef.current?.();
    fadeCancelRef.current = null;

    const adapter = playerRef.current;
    if (!playerReady || !adapter) {
      if (__DEV__) {
        ambientDebug('Playback skipped — player not ready', { shouldPlay, playerReady });
      }
      return;
    }

    if (!shouldPlay) {
      const currentVolume = adapter.getVolume();
      if (__DEV__) {
        ambientDebug('Stopping ambient playback', {
          volume: currentVolume,
          playing: adapter.isPlaying(),
          paused: adapter.isPaused(),
          state: adapter.getDebugState(),
        });
      }

      if (currentVolume <= 0.001) {
        adapter.pause();
        return;
      }

      fadeCancelRef.current = fadeVolume(
        createVolumeTarget(
          () => adapter.getVolume(),
          (volume) => adapter.setVolume(volume),
        ),
        currentVolume,
        0,
        AmbientAudioConfig.fadeOutMs,
        () => {
          adapter.pause();
        },
      );
      return;
    }

    if (__DEV__) {
      ambientDebug('Starting ambient playback', adapter.getDebugState());
    }

    adapter.setVolume(0);
    void adapter.playWithResult().then((result) => {
      if (__DEV__) {
        ambientDebug('Initial play attempt finished', {
          result,
          state: adapter.getDebugState(),
        });
      }
    });

    fadeCancelRef.current = fadeVolume(
      createVolumeTarget(
        () => adapter.getVolume(),
        (volume) => adapter.setVolume(volume),
      ),
      0,
      AmbientAudioConfig.targetVolume,
      AmbientAudioConfig.fadeInMs,
      () => {
        if (__DEV__) {
          ambientDebug('Ambient at target volume', {
            volume: adapter.getVolume(),
            playing: adapter.isPlaying(),
            state: adapter.getDebugState(),
          });
        }
      },
    );

    return () => {
      fadeCancelRef.current?.();
      fadeCancelRef.current = null;
    };
  }, [fadeCancelRef, playerReady, playerRef, shouldPlay]);
}

function NativeAmbientEngine({ playerRef, fadeCancelRef, shouldPlay }: Omit<EngineProps, 'playerReady'>) {
  const player = useAudioPlayer(AMBIENT_AUDIO_MODULE);
  const status = useAudioPlayerStatus(player);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    ambientDebug('Native engine created (expo-audio)');
  }, []);

  useEffect(() => {
    player.loop = true;
    playerRef.current = createExpoAmbientPlayer(player);
    setPlayerReady(true);
    ambientDebug('Native player adapter registered', playerRef.current.getDebugState());

    return () => {
      setPlayerReady(false);
      playerRef.current = null;
      ambientDebug('Native player adapter released');
    };
  }, [player, playerRef]);

  useEffect(() => {
    if (status.isLoaded) {
      ambientDebug('Native asset loaded', {
        duration: status.duration,
        playing: status.playing,
      });
    }
  }, [status.duration, status.isLoaded, status.playing]);

  useAmbientPlayback({ playerRef, fadeCancelRef, shouldPlay, playerReady });

  return null;
}

function WebAmbientEngine({ playerRef, fadeCancelRef, shouldPlay }: Omit<EngineProps, 'playerReady'>) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    ambientDebug('Web engine created (HTMLAudioElement)');
    void resolveAmbientAudioUri()
      .then((resolvedUri) => {
        setUri(resolvedUri);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        setLoadError(message);
        ambientDebug('Web asset load failed', { error: message });
      });
  }, []);

  useEffect(() => {
    if (!uri) return;

    ambientDebug('Web: creating HTMLAudioElement', { uri });
    const audio = new Audio(uri);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audioRef.current = audio;

    const onLoadStart = () => ambientDebug('Web audio loadstart');
    const onCanPlay = () =>
      ambientDebug('Web audio canplaythrough', {
        duration: Number.isFinite(audio.duration) ? audio.duration : null,
        readyState: audio.readyState,
      });
    const onPlaying = () =>
      ambientDebug('Web audio playing event', {
        volume: audio.volume,
        paused: audio.paused,
        currentTime: audio.currentTime,
      });
    const onPause = () =>
      ambientDebug('Web audio pause event', {
        volume: audio.volume,
        paused: audio.paused,
      });
    const onError = () =>
      ambientDebug('Web audio error event', {
        code: audio.error?.code,
        message: audio.error?.message,
        src: audio.currentSrc || audio.src,
      });

    audio.addEventListener('loadstart', onLoadStart);
    audio.addEventListener('canplaythrough', onCanPlay);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    playerRef.current = createWebAmbientPlayer(audio);
    setPlayerReady(true);
    ambientDebug('Web player adapter registered', playerRef.current.getDebugState());

    return () => {
      audio.removeEventListener('loadstart', onLoadStart);
      audio.removeEventListener('canplaythrough', onCanPlay);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      setPlayerReady(false);
      playerRef.current = null;
      ambientDebug('Web player adapter released');
    };
  }, [playerRef, uri]);

  useEffect(() => {
    if (loadError) {
      ambientDebug('Web engine idle due to load error', { loadError });
    }
  }, [loadError]);

  useAmbientPlayback({ playerRef, fadeCancelRef, shouldPlay, playerReady });

  return null;
}

function AmbientAudioEngine({
  playerRef,
  fadeCancelRef,
}: {
  playerRef: React.MutableRefObject<AmbientPlayerAdapter | null>;
  fadeCancelRef: React.MutableRefObject<(() => void) | null>;
}) {
  const { activeUniverse, isHydrated: gameHydrated } = useGame();
  const { ambientEnabled, isHydrated: settingsHydrated, webPlaybackUnlocked } = useAmbientAudio();

  const wantsAmbient =
    settingsHydrated &&
    gameHydrated &&
    ambientEnabled &&
    activeUniverse.id === AmbientAudioConfig.wildWestUniverseId;

  const shouldPlay = wantsAmbient && (!IS_WEB || webPlaybackUnlocked);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    });
  }, []);

  useEffect(() => {
    if (__DEV__) {
      ambientDebug('Engine state', {
        wantsAmbient,
        shouldPlay,
        webPlaybackUnlocked,
        ambientEnabled,
        universeId: activeUniverse.id,
      });
    }
  }, [activeUniverse.id, ambientEnabled, shouldPlay, wantsAmbient, webPlaybackUnlocked]);

  if (IS_WEB) {
    return (
      <WebAmbientEngine playerRef={playerRef} fadeCancelRef={fadeCancelRef} shouldPlay={shouldPlay} />
    );
  }

  return (
    <NativeAmbientEngine playerRef={playerRef} fadeCancelRef={fadeCancelRef} shouldPlay={shouldPlay} />
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

  if (activeUniverse.id !== AmbientAudioConfig.wildWestUniverseId) {
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
  const playerRef = useRef<AmbientPlayerAdapter | null>(null);
  const fadeCancelRef = useRef<(() => void) | null>(null);

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

    const player = playerRef.current;
    ambientDebug('TEST AMBIENCE clicked', {
      playerReady: Boolean(player),
      state: player?.getDebugState() ?? null,
    });

    if (!player) return;

    player.setLoop(true);
    player.setVolume(AmbientAudioConfig.devTestVolume);
    void player.playWithResult().then((result) => {
      ambientDebug('TEST AMBIENCE result', {
        result,
        state: player.getDebugState(),
      });
    });
  }, []);

  const devStopAmbience = useCallback(() => {
    if (!__DEV__) return;

    fadeCancelRef.current?.();
    fadeCancelRef.current = null;

    const player = playerRef.current;
    ambientDebug('STOP AMBIENCE clicked', {
      playerReady: Boolean(player),
      state: player?.getDebugState() ?? null,
    });

    player?.pause();
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
        <AmbientAudioEngine playerRef={playerRef} fadeCancelRef={fadeCancelRef} />
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
