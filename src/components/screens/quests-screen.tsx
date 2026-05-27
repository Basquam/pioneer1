import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AddQuestTrigger } from '@/components/rpg/add-quest-trigger';
import { CharacterDialoguePanel } from '@/components/rpg/character-dialogue-panel';
import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { GameHud } from '@/components/rpg/game-hud';
import { NarrativeMomentOverlay } from '@/components/rpg/narrative-moment-overlay';
import { QuestCard } from '@/components/rpg/quest-card';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { VillainMeter } from '@/components/rpg/villain-meter';
import { XpPopup } from '@/components/rpg/xp-popup';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function QuestsScreen() {
  const { activeUniverse, currentChapter, quests, storyLine, maybeShowVillainTaunt } = useGame();

  useEffect(() => {
    maybeShowVillainTaunt();
  }, [currentChapter.id, maybeShowVillainTaunt]);

  const { chapterBounties, userQuests } = useMemo(
    () => ({
      chapterBounties: quests.filter((q) => q.source === 'template'),
      userQuests: quests.filter((q) => q.source === 'user'),
    }),
    [quests],
  );

  const leadBeat = currentChapter.introScene[0];

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.pad}>
          <SectionHeader eyebrow="BOUNTY BOARD" title="ACTIVE QUESTS" />
          <GameHud compact />
          <VillainMeter />
          {leadBeat && <CharacterDialoguePanel beat={leadBeat} animate={false} />}
          <Text style={[styles.hint, { color: activeUniverse.palette.fog }]}>
            Real tasks disguised as story missions. Tap to complete.
          </Text>

          <AddQuestTrigger variant="banner" />

          {userQuests.length > 0 && (
            <>
              <Text style={[styles.section, { color: activeUniverse.palette.gold }]}>YOUR QUESTS</Text>
              {userQuests.map((q, i) => (
                <QuestCard key={q.id} quest={q} index={i} />
              ))}
            </>
          )}

          <Text style={[styles.section, { color: activeUniverse.palette.gold }]}>CHAPTER BOUNTIES</Text>
          {chapterBounties.map((q, i) => (
            <QuestCard key={q.id} quest={q} index={i + userQuests.length} />
          ))}

          <DialoguePanel line={storyLine} badge="AFTERMATH" animate={false} />
        </Animated.View>
      </ScrollView>
      <NarrativeMomentOverlay />
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
  section: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3, marginTop: 4 },
});
