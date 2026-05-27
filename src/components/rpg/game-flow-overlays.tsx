import { AddQuestSheet } from '@/components/rpg/add-quest-sheet';
import { ChapterCompleteOverlay } from '@/components/rpg/chapter-complete-overlay';
import { ChapterIntroScene } from '@/components/rpg/chapter-intro-scene';
import { QuestCreatedOverlay } from '@/components/rpg/quest-created-overlay';
import { useGame } from '@/hooks/use-game';

export function GameFlowOverlays() {
  const { showChapterIntro, markChapterIntroSeen, addQuestSheetOpen, closeAddQuestSheet } = useGame();

  return (
    <>
      <ChapterCompleteOverlay />
      <QuestCreatedOverlay />
      <ChapterIntroScene visible={showChapterIntro} onComplete={markChapterIntroSeen} />
      <AddQuestSheet visible={addQuestSheetOpen} onClose={closeAddQuestSheet} />
    </>
  );
}
