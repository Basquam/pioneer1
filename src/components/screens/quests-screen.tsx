import { type Href, router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AddQuestTrigger } from '@/components/rpg/add-quest-trigger';
import { CharacterDialoguePanel } from '@/components/rpg/character-dialogue-panel';
import { CinematicEmptyState } from '@/components/rpg/cinematic-empty-state';
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
  const {
    activeUniverse,
    activeSaga,
    currentChapter,
    playerProgress,
    quests,
    storyLine,
    openAddQuestSheet,
    maybeShowVillainTaunt,
  } = useGame();

  useEffect(() => {
    maybeShowVillainTaunt();
  }, [currentChapter.id, maybeShowVillainTaunt]);

  const { chapterBounties, userQuests } = useMemo(
    () => ({
      chapterBounties: quests.filter((quest) => quest.source === 'template'),
      userQuests: quests.filter((quest) => quest.source === 'user'),
    }),
    [quests],
  );

  const hasPersonalQuests = playerProgress.userQuests.some(
    (quest) => quest.sourceSagaId === activeSaga.id,
  );
  const allChapterBountiesComplete =
    chapterBounties.length > 0 && chapterBounties.every((quest) => quest.completed);

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

          <Text style={[styles.section, { color: activeUniverse.palette.gold }]}>YOUR QUESTS</Text>
          {!hasPersonalQuests ? (
            <CinematicEmptyState
              title="No personal quests written yet."
              message="Every chore, errand, and habit can become a bounty on the board. Write your first one into the story."
              primaryLabel="ADD QUEST"
              onPrimaryPress={openAddQuestSheet}
            />
          ) : (
            userQuests.map((quest, index) => <QuestCard key={quest.id} quest={quest} index={index} />)
          )}

          <Text style={[styles.section, { color: activeUniverse.palette.gold }]}>CHAPTER BOUNTIES</Text>
          {allChapterBountiesComplete ? (
            <CinematicEmptyState
              title="Chapter bounties cleared."
              message="Continue the story from HQ."
              primaryLabel="RETURN TO HQ"
              onPrimaryPress={() => router.push('/(game)/hq' as Href)}
              index={1}
            />
          ) : (
            chapterBounties.map((quest, index) => (
              <QuestCard key={quest.id} quest={quest} index={index + userQuests.length} />
            ))
          )}

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
