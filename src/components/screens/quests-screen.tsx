import { ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { GameHud } from '@/components/rpg/game-hud';
import { QuestCard } from '@/components/rpg/quest-card';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { VillainMeter } from '@/components/rpg/villain-meter';
import { XpPopup } from '@/components/rpg/xp-popup';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function QuestsScreen() {
  const { theme, quests, allQuestsComplete, themeProgress } = useGame();
  const storyLine = allQuestsComplete ? theme.victoryLine : themeProgress.storyLine;

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.pad}>
          <SectionHeader eyebrow="BOUNTY BOARD" title="ACTIVE QUESTS" />
          <GameHud compact />
          <VillainMeter />
          <Text style={[styles.hint, { color: theme.colors.fog }]}>
            Real tasks disguised as story missions. Tap to complete.
          </Text>
          {quests.map((q, i) => (
            <QuestCard key={q.id} quest={q} index={i} />
          ))}
          <DialoguePanel line={storyLine} badge="AFTERMATH" animate={false} />
        </Animated.View>
      </ScrollView>
      <XpPopup />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  pad: { paddingHorizontal: 20, gap: 12, paddingTop: 8 },
  hint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 4,
  },
});
