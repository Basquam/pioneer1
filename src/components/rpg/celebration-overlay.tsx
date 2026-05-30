import { useGame } from '@/hooks/use-game';
import {
  isFullScreenRewardEvent,
  type ChapterRewardPayload,
  type CharacterReactionPayload,
  type QuestCompletionPayload,
} from '@/lib/reward-event-queue';

import { CelebrationToast } from '@/components/rpg/celebration-toast';
import { CharacterReactionCelebration } from '@/components/rpg/character-reaction-celebration';
import { ChapterCompleteOverlay } from '@/components/rpg/chapter-complete-overlay';
import { QuestCompletionCelebration } from '@/components/rpg/quest-completion-celebration';

export function CelebrationOverlay() {
  const { activeCelebration, dismissCelebration } = useGame();

  if (!activeCelebration) return null;

  if (activeCelebration.type === 'questCompletion') {
    return (
      <QuestCompletionCelebration
        event={activeCelebration}
        payload={activeCelebration.payload as QuestCompletionPayload}
        onDismiss={dismissCelebration}
      />
    );
  }

  if (activeCelebration.type === 'characterReaction') {
    return (
      <CharacterReactionCelebration
        event={activeCelebration}
        payload={activeCelebration.payload as CharacterReactionPayload}
        onDismiss={dismissCelebration}
      />
    );
  }

  if (activeCelebration.type === 'chapterReward' || activeCelebration.type === 'storyUnlock') {
    return (
      <ChapterCompleteOverlay chapterComplete={activeCelebration.payload as ChapterRewardPayload} />
    );
  }

  if (isFullScreenRewardEvent(activeCelebration.type)) {
    return null;
  }

  return <CelebrationToast event={activeCelebration} onDismiss={dismissCelebration} />;
}
