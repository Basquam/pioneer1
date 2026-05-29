import { AddQuestSheet } from '@/components/rpg/add-quest-sheet';
import { SuggestedQuestPacksSheet } from '@/components/rpg/suggested-quest-packs-sheet';
import { FrictionReviewSheet } from '@/components/rpg/friction-review-sheet';
import { ImproveQuestSheet } from '@/components/rpg/improve-quest-sheet';
import { ChapterCompleteOverlay } from '@/components/rpg/chapter-complete-overlay';
import { ChapterIntroScene } from '@/components/rpg/chapter-intro-scene';
import { HqTutorialOverlay } from '@/components/rpg/hq-tutorial-overlay';
import { QuestFocusOverlay } from '@/components/rpg/quest-focus-overlay';
import { QuestCompleteOverlay } from '@/components/rpg/quest-complete-overlay';
import { QuestCreatedOverlay } from '@/components/rpg/quest-created-overlay';
import { useGame } from '@/hooks/use-game';

export function GameFlowOverlays() {
  const {
    showChapterIntro,
    markChapterIntroSeen,
    showHqTutorial,
    dismissHqTutorial,
    startHqTutorialAddQuest,
    addQuestSheetOpen,
    closeAddQuestSheet,
    questPackSheetOpen,
    closeQuestPackSheet,
    improveQuestId,
    closeImproveQuest,
    frictionReviewQuestId,
    closeFrictionReview,
  } = useGame();

  return (
    <>
      <ChapterCompleteOverlay />
      <QuestFocusOverlay />
      <QuestCompleteOverlay />
      <QuestCreatedOverlay />
      <ChapterIntroScene visible={showChapterIntro} onComplete={markChapterIntroSeen} />
      <HqTutorialOverlay
        visible={showHqTutorial}
        onAddQuest={startHqTutorialAddQuest}
        onDismiss={dismissHqTutorial}
      />
      <AddQuestSheet visible={addQuestSheetOpen} onClose={closeAddQuestSheet} />
      <SuggestedQuestPacksSheet visible={questPackSheetOpen} onClose={closeQuestPackSheet} />
      <ImproveQuestSheet questId={improveQuestId} onClose={closeImproveQuest} />
      <FrictionReviewSheet questId={frictionReviewQuestId} onClose={closeFrictionReview} />
    </>
  );
}
