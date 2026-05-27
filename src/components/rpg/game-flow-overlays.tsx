import { ChapterCompleteOverlay } from '@/components/rpg/chapter-complete-overlay';
import { ChapterIntroScene } from '@/components/rpg/chapter-intro-scene';
import { useGame } from '@/hooks/use-game';

export function GameFlowOverlays() {
  const { showChapterIntro, markChapterIntroSeen } = useGame();

  return (
    <>
      <ChapterCompleteOverlay />
      <ChapterIntroScene visible={showChapterIntro} onComplete={markChapterIntroSeen} />
    </>
  );
}
