import { useGame } from '@/hooks/use-game';
import {
  isChapterRewardPayload,
  isCharacterReactionPayload,
  isQuestCompletionPayload,
} from '@/lib/celebration-payload';
import {
  isFullScreenRewardEvent,
} from '@/lib/reward-event-queue';

import { CelebrationToast } from '@/components/rpg/celebration-toast';
import { CharacterReactionCelebration } from '@/components/rpg/character-reaction-celebration';
import { ChapterCompleteOverlay } from '@/components/rpg/chapter-complete-overlay';
import { QuestCompletionCelebration } from '@/components/rpg/quest-completion-celebration';

export function CelebrationOverlay() {
  const { activeCelebration, dismissCelebration } = useGame();

  if (!activeCelebration) return null;

  if (activeCelebration.type === 'questCompletion') {
    if (!isQuestCompletionPayload(activeCelebration.payload)) {
      dismissCelebration();
      return null;
    }
    return (
      <QuestCompletionCelebration
        event={activeCelebration}
        payload={activeCelebration.payload}
        onDismiss={dismissCelebration}
      />
    );
  }

  if (activeCelebration.type === 'characterReaction') {
    if (!isCharacterReactionPayload(activeCelebration.payload)) {
      dismissCelebration();
      return null;
    }
    return (
      <CharacterReactionCelebration
        event={activeCelebration}
        payload={activeCelebration.payload}
        onDismiss={dismissCelebration}
      />
    );
  }

  if (activeCelebration.type === 'chapterReward' || activeCelebration.type === 'storyUnlock') {
    if (!isChapterRewardPayload(activeCelebration.payload)) {
      dismissCelebration();
      return null;
    }
    return <ChapterCompleteOverlay chapterComplete={activeCelebration.payload} />;
  }

  if (isFullScreenRewardEvent(activeCelebration.type)) {
    return null;
  }

  return <CelebrationToast event={activeCelebration} onDismiss={dismissCelebration} />;
}
