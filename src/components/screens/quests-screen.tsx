import { type Href, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AddQuestTrigger } from '@/components/rpg/add-quest-trigger';
import { CharacterDialoguePanel } from '@/components/rpg/character-dialogue-panel';
import { CinematicEmptyState } from '@/components/rpg/cinematic-empty-state';
import { CoachMascotTip } from '@/components/rpg/coach-mascot-tip';
import { MascotGuideFromContext } from '@/components/rpg/mascot-guide-card';
import { CollapsibleSection } from '@/components/rpg/collapsible-section';
import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { GameHud } from '@/components/rpg/game-hud';
import { NarrativeMomentOverlay } from '@/components/rpg/narrative-moment-overlay';
import { QuestBoardEntryList } from '@/components/rpg/quest-board-entry-list';
import { QuestBoardFiltersBar } from '@/components/rpg/quest-board-filters-bar';
import { QuestBoardTabBar } from '@/components/rpg/quest-board-tab-bar';
import { QuestLifecycleReviewList } from '@/components/rpg/quest-lifecycle-review-list';
import { QuestCard } from '@/components/rpg/quest-card';
import { QuestInboxPanel } from '@/components/rpg/quest-inbox-panel';
import { RecurringQuestsPanel } from '@/components/rpg/recurring-quests-panel';
import { SagaPreviewEmptyState } from '@/components/rpg/saga-preview-empty-state';
import { ScreenScroll } from '@/components/rpg/screen-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { TodayFocusDisplay } from '@/components/rpg/today-focus-display';
import { VillainMeter } from '@/components/rpg/villain-meter';
import { XpPopup } from '@/components/rpg/xp-popup';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { buildUserQuestBoardEntries } from '@/lib/quest-chain';
import { getLocalDateKey } from '@/lib/daily-streak';
import { canLockTodayFocus, getFocusLockCopy } from '@/lib/focus-lock';
import {
  buildQuestBoardTabContent,
  countQuestBoardTabItems,
  DEFAULT_QUEST_BOARD_FILTERS,
  getChapterBoardTabLabel,
  QUEST_LIFECYCLE_NEEDS_DECISION_COPY,
  type QuestBoardFilters,
  type QuestBoardTab,
} from '@/lib/quest-board-organization';
import { getQuestLifecycleReviewFlavor } from '@/lib/quest-lifecycle';

export function QuestsScreen() {
  const ui = useUniverseUiCopy();
  const {
    activeUniverse,
    currentChapter,
    playerProgress,
    quests,
    storyLine,
    isSagaPreview,
    activeInboxItems,
    openAddQuestSheet,
    maybeShowVillainTaunt,
    restoreDefaultStory,
    isTodayFocusLocked,
    lockTodayFocus,
    requestedQuestBoardTab,
    clearRequestedQuestBoardTab,
    showMinimumViableDayActive,
    hasOnboarded,
  } = useGame();

  const [activeTab, setActiveTab] = useState<QuestBoardTab>('today');
  const [filters, setFilters] = useState<QuestBoardFilters>(DEFAULT_QUEST_BOARD_FILTERS);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [expandedCompletedDates, setExpandedCompletedDates] = useState<Record<string, boolean>>(() => ({
    [getLocalDateKey()]: true,
  }));

  useEffect(() => {
    if (!requestedQuestBoardTab) return;
    setActiveTab(requestedQuestBoardTab);
    clearRequestedQuestBoardTab();
  }, [clearRequestedQuestBoardTab, requestedQuestBoardTab]);

  useEffect(() => {
    if (!currentChapter) return;
    maybeShowVillainTaunt();
  }, [currentChapter?.id, maybeShowVillainTaunt]);

  const today = getLocalDateKey();
  const { palette } = activeUniverse;
  const focusLockCopy = getFocusLockCopy(activeUniverse.id);
  const showLockButton = canLockTodayFocus(playerProgress, activeUniverse.id);

  const { chapterQuests, userQuests } = useMemo(
    () => ({
      chapterQuests: quests.filter((quest) => quest.source === 'template'),
      userQuests: quests.filter((quest) => quest.source === 'user'),
    }),
    [quests],
  );

  const userQuestEntries = useMemo(() => buildUserQuestBoardEntries(userQuests), [userQuests]);

  const recurringTemplateCount = useMemo(
    () => playerProgress.recurringQuestTemplates.filter((template) => template.isActive).length,
    [playerProgress.recurringQuestTemplates],
  );

  const tabCounts = useMemo(() => {
    const counts: Partial<Record<QuestBoardTab, number>> = {};
    const tabs: QuestBoardTab[] = [
      'today',
      'review',
      'focus',
      'chapter',
      'inbox',
      'recurring',
      'completed',
    ];
    for (const tab of tabs) {
      counts[tab] = countQuestBoardTabItems({
        tab,
        userEntries: userQuestEntries,
        chapterQuests,
        inboxCount: activeInboxItems.length,
        recurringTemplateCount,
        today,
        minimumViableDayActive: showMinimumViableDayActive,
      });
    }
    return counts;
  }, [activeInboxItems.length, chapterQuests, recurringTemplateCount, showMinimumViableDayActive, today, userQuestEntries]);

  const tabContent = useMemo(
    () =>
      buildQuestBoardTabContent({
        tab: activeTab,
        userEntries: userQuestEntries,
        chapterQuests,
        filters,
        today,
        minimumViableDayActive: showMinimumViableDayActive,
      }),
    [activeTab, chapterQuests, filters, showMinimumViableDayActive, today, userQuestEntries],
  );

  const hasPersonalQuests = playerProgress.userQuests.some(
    (quest) => quest.sourceSagaId === playerProgress.selectedSagaId,
  );

  const handleLockFocus = () => {
    const confirm = () => lockTodayFocus();

    if (Platform.OS === 'web') {
      if (window.confirm(`${focusLockCopy.lockConfirmTitle}\n\n${focusLockCopy.lockConfirmMessage}`)) {
        confirm();
      }
      return;
    }

    Alert.alert(focusLockCopy.lockConfirmTitle, focusLockCopy.lockConfirmMessage, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Lock Focus', onPress: confirm },
    ]);
  };

  const toggleCompletedGroup = (dateKey: string) => {
    setExpandedCompletedDates((current) => ({
      ...current,
      [dateKey]: !current[dateKey],
    }));
  };

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
  const chapterTabLabel = getChapterBoardTabLabel(activeUniverse.id);

  const renderTabBody = () => {
    switch (activeTab) {
      case 'inbox':
        return (
          <>
            <Text style={[styles.tabHint, { color: palette.fog }]}>
              Quick-captured tasks waiting to become quests.
            </Text>
            <QuestInboxPanel />
          </>
        );

      case 'review':
        if (tabContent.entries.length === 0) {
          return (
            <Text style={[styles.emptyLine, { color: palette.fog }]}>
              No quests waiting for a decision.
            </Text>
          );
        }
        return (
          <>
            <Text style={[styles.tabHint, { color: palette.fog }]}>
              {getQuestLifecycleReviewFlavor(activeUniverse.id)}
            </Text>
            <Text style={[styles.reviewDecisionLine, { color: palette.bone }]}>
              {QUEST_LIFECYCLE_NEEDS_DECISION_COPY}
            </Text>
            <QuestLifecycleReviewList entries={tabContent.entries} palette={palette} />
          </>
        );

      case 'focus':
        return (
          <>
            <TodayFocusDisplay variant="inline" />
            {!isTodayFocusLocked && showLockButton ? (
              <Pressable
                onPress={handleLockFocus}
                style={[styles.lockButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
                <Text style={[styles.lockButtonText, { color: palette.bone }]}>
                  {focusLockCopy.lockButtonLabel}
                </Text>
              </Pressable>
            ) : null}
            {isTodayFocusLocked ? (
              <Text style={[styles.lockedHint, { color: palette.gold }]}>{focusLockCopy.lockedFlavor}</Text>
            ) : null}
            {tabContent.entries.length === 0 ? (
              <CinematicEmptyState
                title="No focus quests yet."
                message="Add a quest or pin one as focus to build today's window."
                primaryLabel={ui.addQuestButtonLabel}
                onPrimaryPress={openAddQuestSheet}
                coachContext={{ kind: 'empty', variant: 'focus-empty' }}
              />
            ) : (
              <QuestBoardEntryList entries={tabContent.entries} />
            )}
          </>
        );

      case 'chapter':
        if (tabContent.chapterQuests.length === 0) {
          return (
            <>
              <MascotGuideFromContext
                contextId="quest_board_chapter_cleared"
                screenName="/(game)/quests"
              />
              <CinematicEmptyState
                title={ui.chapterTemplatesClearedTitle}
                message={ui.chapterTemplatesClearedContinueMessage}
                primaryLabel={ui.hqReturnLabel}
                onPrimaryPress={() => router.push('/(game)/hq' as Href)}
                index={1}
              />
            </>
          );
        }
        return (
          <>
            <Text style={[styles.tabHint, { color: palette.fog }]}>
              {ui.chapterTemplatesLabel} — story missions for this chapter.
            </Text>
            {tabContent.chapterQuests.map((quest, index) => (
              <QuestCard key={quest.id} quest={quest} index={index} />
            ))}
          </>
        );

      case 'recurring':
        return (
          <>
            {tabContent.entries.length > 0 ? (
              <>
                <Text style={[styles.sectionMiniLabel, { color: palette.gold }]}>TODAY'S INSTANCES</Text>
                <QuestBoardEntryList entries={tabContent.entries} />
              </>
            ) : null}
            <Text style={[styles.sectionMiniLabel, { color: palette.gold }]}>ACTIVE ROUTINES</Text>
            <RecurringQuestsPanel />
          </>
        );

      case 'completed':
        if (tabContent.completedGroups.length === 0) {
          return (
            <CoachMascotTip
              context={{ kind: 'empty', variant: 'no-completed' }}
              messageOverride="No completed quests in the last few days."
            />
          );
        }
        return tabContent.completedGroups.map((group) => {
          const expanded = expandedCompletedDates[group.dateKey] === true;
          return (
            <CollapsibleSection
              key={group.dateKey}
              title={`${group.label} · ${group.quests.length}`}
              hint={group.dateKey === today ? "Today's wins" : 'Tap to expand'}
              expanded={expanded}
              onToggle={() => toggleCompletedGroup(group.dateKey)}
              palette={palette}
              style={styles.completedGroup}>
              {group.quests.map((quest, index) => (
                <QuestCard key={quest.id} quest={quest} index={index} />
              ))}
            </CollapsibleSection>
          );
        });

      case 'today':
      default:
        if (
          !hasPersonalQuests &&
          tabContent.entries.length === 0 &&
          tabContent.chapterQuests.length === 0
        ) {
          return (
            <>
              <MascotGuideFromContext
                contextId="quest_board_empty_state"
                screenName="/(game)/quests"
                onAction={openAddQuestSheet}
              />
              <CinematicEmptyState
                title={ui.noQuestsYetTitle}
                message={ui.noQuestsYetMessage}
                primaryLabel={ui.addQuestButtonLabel}
                onPrimaryPress={openAddQuestSheet}
                index={1}
              />
            </>
          );
        }

        if (tabContent.entries.length === 0 && tabContent.chapterQuests.length === 0) {
          return (
            <CinematicEmptyState
              title="Nothing active right now."
              message={`Check ${chapterTabLabel.toLowerCase()}, focus, or completed tabs.`}
              primaryLabel={ui.addQuestButtonLabel}
              onPrimaryPress={openAddQuestSheet}
            />
          );
        }

        return <QuestBoardEntryList entries={tabContent.entries} />;
    }
  };

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScreenScroll>
        <Animated.View entering={FadeInDown.duration(500)}>
          <SectionHeader eyebrow={ui.questBoardEyebrow} title={ui.questBoardTitle} />
        </Animated.View>
        {hasOnboarded ? (
          <>
            <GameHud compact />
            <VillainMeter />
          </>
        ) : null}
        {hasOnboarded && leadBeat ? <CharacterDialoguePanel beat={leadBeat} animate={false} /> : null}
        <Text style={[styles.hint, { color: palette.fog }]}>
          {hasOnboarded ? ui.questsBoardHint : 'Complete your first quest from HQ, then return here for the full board.'}
        </Text>

        {hasOnboarded && !hasPersonalQuests ? (
          <MascotGuideFromContext
            contextId="quest_board_custom_empty"
            screenName="/(game)/quests"
            onAction={openAddQuestSheet}
          />
        ) : null}

        {hasOnboarded ? (
          <>
            <AddQuestTrigger variant="banner" />

            <QuestBoardTabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              universeId={activeUniverse.id}
              tabCounts={tabCounts}
              palette={palette}
            />

            {activeTab !== 'inbox' ? (
              <QuestBoardFiltersBar
                filters={filters}
                onChange={setFilters}
                expanded={filtersExpanded}
                onToggleExpanded={() => setFiltersExpanded((open) => !open)}
                palette={palette}
              />
            ) : null}
          </>
        ) : null}

        <View style={styles.tabBody}>{renderTabBody()}</View>

        {hasOnboarded ? <DialoguePanel line={storyLine} badge="AFTERMATH" animate={false} /> : null}
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
  tabBody: {
    marginTop: 12,
    gap: 10,
  },
  tabHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  reviewDecisionLine: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  sectionMiniLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
    marginBottom: 2,
  },
  lockButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
  },
  lockButtonText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  lockedHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  emptyLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  completedGroup: {
    marginBottom: 8,
  },
});
