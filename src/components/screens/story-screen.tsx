import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ChapterCard } from '@/components/rpg/chapter-card';
import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { VillainMeter } from '@/components/rpg/villain-meter';
import { useGame } from '@/hooks/use-game';
import type { StoryChapter } from '@/types/story';

export function StoryScreen() {
  const { theme, chapters, themeProgress, completedQuestCount } = useGame();

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.pad}>
          <SectionHeader
            eyebrow="NARRATIVE LOG"
            title="STORY PROGRESS"
            right={theme.villain.name}
          />
          <VillainMeter />
          <DialoguePanel
            line={`${theme.villain.title} tightens their grip on ${theme.locationName}. Each quest you finish rewrites the ending.`}
            badge="CHRONICLE"
            animate={false}
          />
          {chapters.map((ch: StoryChapter, i: number) => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              index={i}
              unlocked={completedQuestCount >= ch.requiredQuests}
              active={themeProgress.unlockedChapterIndex === ch.index}
            />
          ))}
        </Animated.View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  pad: { paddingHorizontal: 20, gap: 12, paddingTop: 8 },
});
