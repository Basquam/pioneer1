import { AddQuestSheet } from '@/components/rpg/add-quest-sheet';
import { ChapterCompleteOverlay } from '@/components/rpg/chapter-complete-overlay';
import { ChapterIntroScene } from '@/components/rpg/chapter-intro-scene';
import { HqTutorialOverlay } from '@/components/rpg/hq-tutorial-overlay';
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
  } = useGame();

  return (
    <>
      <ChapterCompleteOverlay />
      <QuestCompleteOverlay />
      <QuestCreatedOverlay />
      <ChapterIntroScene visible={showChapterIntro} onComplete={markChapterIntroSeen} />
      <HqTutorialOverlay
        visible={showHqTutorial}
        onAddQuest={startHqTutorialAddQuest}
        onDismiss={dismissHqTutorial}
      />
      <AddQuestSheet visible={addQuestSheetOpen} onClose={closeAddQuestSheet} />
    </>
  );
}
