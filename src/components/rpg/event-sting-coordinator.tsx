import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { universeHasEventStings } from '@/constants/audio';
import { useAmbientAudio } from '@/context/ambient-audio-context';
import { useGame } from '@/hooks/use-game';
import { getSoundEnabled } from '@/lib/audio/sound-service';
import { resolveCelebrationSting } from '@/lib/celebration-sting-resolver';
import type { EventStingKind } from '@/lib/celebration-sting-resolver';

const IS_WEB = Platform.OS === 'web';

type EventStingCoordinatorProps = {
  playSting: (kind: EventStingKind) => void;
};

export function EventStingCoordinator({ playSting }: EventStingCoordinatorProps) {
  const { activeUniverse, celebrationQueue, narrativeMoment, isCelebrationActive } = useGame();
  const { soundEffectsEnabled, webPlaybackUnlocked } = useAmbientAudio();
  const prevQueueLengthRef = useRef(0);
  const lastTauntKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!universeHasEventStings(activeUniverse.id) || !soundEffectsEnabled) {
      prevQueueLengthRef.current = celebrationQueue.length;
      return;
    }

    const wasEmpty = prevQueueLengthRef.current === 0;
    const nowHasItems = celebrationQueue.length > 0;

    if (wasEmpty && nowHasItems && (!IS_WEB || webPlaybackUnlocked)) {
      const kind = resolveCelebrationSting(celebrationQueue);
      if (kind) {
        playSting(kind);
      }
    }

    prevQueueLengthRef.current = celebrationQueue.length;
  }, [
    activeUniverse.id,
    celebrationQueue,
    playSting,
    soundEffectsEnabled,
    webPlaybackUnlocked,
  ]);

  useEffect(() => {
    if (narrativeMoment?.type !== 'villain_taunt') {
      lastTauntKeyRef.current = null;
      return;
    }

    if (!universeHasEventStings(activeUniverse.id) || !getSoundEnabled()) return;
    if (IS_WEB && !webPlaybackUnlocked) return;
    if (isCelebrationActive) return;

    const tauntKey = `${narrativeMoment.characterId}:${narrativeMoment.line}`;
    if (lastTauntKeyRef.current === tauntKey) return;
    lastTauntKeyRef.current = tauntKey;

    playSting('villainAppearance');
  }, [
    activeUniverse.id,
    isCelebrationActive,
    narrativeMoment,
    playSting,
    soundEffectsEnabled,
    webPlaybackUnlocked,
  ]);

  return null;
}
