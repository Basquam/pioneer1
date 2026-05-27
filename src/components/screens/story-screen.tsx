import { ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CharacterCard } from '@/components/rpg/character-card';
import { CharacterDialoguePanel } from '@/components/rpg/character-dialogue-panel';
import { ChapterCard } from '@/components/rpg/chapter-card';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { VillainMeter } from '@/components/rpg/villain-meter';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import type { Chapter } from '@/types/narrative';

export function StoryScreen() {
  const { activeUniverse, activeSaga, chapters, currentChapter, playerProgress, characters } = useGame();
  const leadBeat = currentChapter.introScene[1] ?? currentChapter.introScene[0];

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.pad}>
          <SectionHeader
            eyebrow="NARRATIVE LOG"
            title="STORY PROGRESS"
            right={activeSaga.villainName}
          />
          <VillainMeter />
          {leadBeat && <CharacterDialoguePanel beat={leadBeat} animate={false} />}
          <Text style={[styles.section, { color: activeUniverse.palette.gold }]}>CHAPTERS</Text>
          {chapters.map((ch: Chapter, i: number) => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              index={i}
              unlocked={(playerProgress.chapterCompletions[ch.id] ?? 0) > 0 || ch.order === 1}
              active={currentChapter.id === ch.id}
            />
          ))}
          <Text style={[styles.section, { color: activeUniverse.palette.gold }]}>CAST</Text>
          {characters.map((character, i) => (
            <CharacterCard
              key={character.id}
              character={character}
              index={i}
              relationship={playerProgress.relationshipByCharacter[character.id]}
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
  section: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3, marginTop: 8 },
});
