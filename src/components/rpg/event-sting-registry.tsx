import { useEffect, type MutableRefObject } from 'react';
import { Platform } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

import {
  AMBIENT_TENSION_AUDIO_BY_UNIVERSE_ID,
  EVENT_STING_MODULES_BY_UNIVERSE_ID,
  eventStingPlayerKey,
} from '@/constants/audio';
import { createExpoAmbientPlayer } from '@/lib/ambient-expo-player';
import type { AdapterRegistry } from '@/lib/ambient-track-playback';
import type { EventStingKind } from '@/lib/celebration-sting-resolver';
import type { EventStingPlayerMap } from '@/lib/event-sting-playback';

const IS_WEB = Platform.OS === 'web';

type NativeEventStingTrackProps = {
  playerKey: string;
  module: number;
  playersRef: MutableRefObject<EventStingPlayerMap>;
  onRegistryChange: () => void;
};

function NativeEventStingTrack({
  playerKey,
  module,
  playersRef,
  onRegistryChange,
}: NativeEventStingTrackProps) {
  const player = useAudioPlayer(module);

  useEffect(() => {
    playersRef.current[playerKey] = player;
    onRegistryChange();
    return () => {
      delete playersRef.current[playerKey];
      onRegistryChange();
    };
  }, [module, onRegistryChange, player, playerKey, playersRef]);

  return null;
}

type NativeTensionTrackProps = {
  adapterKey: string;
  module: number;
  adaptersRef: MutableRefObject<AdapterRegistry>;
  onRegistryChange: () => void;
};

function NativeTensionTrack({
  adapterKey,
  module,
  adaptersRef,
  onRegistryChange,
}: NativeTensionTrackProps) {
  const player = useAudioPlayer(module);

  useEffect(() => {
    player.loop = true;
    adaptersRef.current[adapterKey] = createExpoAmbientPlayer(player);
    onRegistryChange();
    return () => {
      adaptersRef.current[adapterKey]?.hardStop();
      adaptersRef.current[adapterKey] = null;
      onRegistryChange();
    };
  }, [adapterKey, adaptersRef, module, onRegistryChange, player]);

  return null;
}

type EventStingRegistryProps = {
  playersRef: MutableRefObject<EventStingPlayerMap>;
  onRegistryChange: () => void;
};

export function EventStingRegistry({ playersRef, onRegistryChange }: EventStingRegistryProps) {
  if (IS_WEB) return null;

  return (
    <>
      {Object.entries(EVENT_STING_MODULES_BY_UNIVERSE_ID).flatMap(([universeId, modules]) =>
        (Object.entries(modules) as [EventStingKind, number][]).map(([kind, module]) => (
          <NativeEventStingTrack
            key={eventStingPlayerKey(universeId, kind)}
            playerKey={eventStingPlayerKey(universeId, kind)}
            module={module}
            playersRef={playersRef}
            onRegistryChange={onRegistryChange}
          />
        )),
      )}
    </>
  );
}

type AmbientTensionRegistryProps = {
  adaptersRef: MutableRefObject<AdapterRegistry>;
  onRegistryChange: () => void;
};

export function AmbientTensionRegistry({
  adaptersRef,
  onRegistryChange,
}: AmbientTensionRegistryProps) {
  if (IS_WEB) return null;

  return (
    <>
      {Object.entries(AMBIENT_TENSION_AUDIO_BY_UNIVERSE_ID).map(([universeId, module]) => (
        <NativeTensionTrack
          key={`${universeId}::tension`}
          adapterKey={`${universeId}::tension`}
          module={module}
          adaptersRef={adaptersRef}
          onRegistryChange={onRegistryChange}
        />
      ))}
    </>
  );
}
