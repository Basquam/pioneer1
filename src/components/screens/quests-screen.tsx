import { type Href, router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AddQuestTrigger } from '@/components/rpg/add-quest-trigger';
import { CharacterDialoguePanel } from '@/components/rpg/character-dialogue-panel';
import { CinematicEmptyState } from '@/components/rpg/cinematic-empty-state';
import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { GameHud } from '@/components/rpg/game-hud';
import { NarrativeMomentOverlay } from '@/components/rpg/narrative-moment-overlay';
import { QuestChainGroup } from '@/components/rpg/quest-chain-group';
import { QuestInboxPanel } from '@/components/rpg/quest-inbox-panel';
import { QuestCard } from '@/components/rpg/quest-card';
import { SagaPreviewEmptyState } from '@/components/rpg/saga-preview-empty-state';
import { ScreenScroll } from '@/components/rpg/screen-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { SectionLabel } from '@/components/rpg/section-label';
import { VillainMeter } from '@/components/rpg/villain-meter';
import { XpPopup } from '@/components/rpg/xp-popup';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { buildUserQuestBoardEntries } from '@/lib/quest-chain';

export function QuestsScreen() {
  const ui = useUniverseUiCopy();
  const {
    activeUniverse,
    activeSaga,
    currentChapter,
    playerProgress,
    quests,
    storyLine,
    isSagaPreview,
    openAddQuestSheet,
    maybeShowVillainTaunt,
    restoreDefaultStory,
  } = useGame();

  useEffect(() => {
    if (!currentChapter) return;
    maybeShowVillainTaunt();
  }, [currentChapter?.id, maybeShowVillainTaunt]);

  const { chapterBounties, userQuests } = useMemo(
    () => ({
      chapterBounties: quests.filter((quest) => quest.source === 'template'),
      userQuests: quests.filter((quest) => quest.source === 'user'),
    }),
    [quests],
  );

  const userQuestEntries = useMemo(() => buildUserQuestBoardEntries(userQuests), [userQuests]);

  const hasPersonalQuests = playerProgress.userQuests.some(
    (quest) => quest.sourceSagaId === activeSaga.id,
  );
  const allChapterBountiesComplete =
    chapterBounties.length > 0 && chapterBounties.every((quest) => quest.completed);

  if (!currentChapter) {
    return (
      <ScreenShell edges={['top']} padded={false}>
        <ScreenScroll>
          <SectionHeader eyebrow={ui.questBoardEyebrow} title={ui.questBoardTitle} />
          {isSagaPreview ? (
            <SagaPreviewEmptyState />
          ) : (
            <CinematicEmptyState
              title={ui.noActiveChapterTitle}
              message={ui.noActiveChapterEmptyMessage}
              primaryLabel={ui.restoreDefaultSagaLabel}
              onPrimaryPress={restoreDefaultStory}
            />
          )}
        </ScreenScroll>
      </ScreenShell>
    );
  }

  const leadBeat = currentChapter.introScene[0];

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScreenScroll>
        <Animated.View entering={FadeInDown.duration(500)}>
          <SectionHeader eyebrow={ui.questBoardEyebrow} title={ui.questBoardTitle} />
        </Animated.View>
        <GameHud compact />
        <VillainMeter />
        {leadBeat && <CharacterDialoguePanel beat={leadBeat} animate={false} />}
        <Text style={[styles.hint, { color: activeUniverse.palette.fog }]}>
          {ui.questsBoardHint}
        </Text>

        <AddQuestTrigger variant="banner" />

        <SectionLabel>QUEST INBOX</SectionLabel>
        <QuestInboxPanel />

        <SectionLabel>{ui.userQuestsLabel}</SectionLabel>
        {!hasPersonalQuests ? (
          <CinematicEmptyState
            title={ui.noQuestsYetTitle}
            message={ui.noQuestsYetMessage}
            primaryLabel={ui.addQuestButtonLabel}
            onPrimaryPress={openAddQuestSheet}
          />
        ) : (
          userQuestEntries.map((entry, index) =>
            entry.kind === 'chain' ? (
              <QuestChainGroup
                key={entry.parent.id}
                parent={entry.parent}
                children={entry.children}
                startIndex={index}
              />
            ) : (
              <QuestCard key={entry.quest.id} quest={entry.quest} index={index} />
            ),
          )
        )}

        <SectionLabel>{ui.chapterTemplatesLabel}</SectionLabel>
        {allChapterBountiesComplete ? (
          <CinematicEmptyState
            title={ui.chapterTemplatesClearedTitle}
            message={ui.chapterTemplatesClearedContinueMessage}
            primaryLabel={ui.hqReturnLabel}
            onPrimaryPress={() => router.push('/(game)/hq' as Href)}
            index={1}
          />
        ) : (
          chapterBounties.map((quest, index) => (
            <QuestCard key={quest.id} quest={quest} index={index + userQuests.length} />
          ))
        )}

        <DialoguePanel line={storyLine} badge="AFTERMATH" animate={false} />
      </ScreenScroll>
      <NarrativeMomentOverlay />
      <XpPopup />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 4,
    lineHeight: 19,
  },
});
