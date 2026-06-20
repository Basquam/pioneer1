import { type Href, router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DailyAwarenessCheck } from '@/components/rpg/daily-awareness-check';
import { DailyShutdownBanner } from '@/components/rpg/daily-shutdown-banner';
import { HqStoryConsole } from '@/components/rpg/hq-story-console';
import type { HqActionGridItem } from '@/components/rpg/hq-action-grid';
import { NarrativeMomentOverlay } from '@/components/rpg/narrative-moment-overlay';
import { QuestCard } from '@/components/rpg/quest-card';
import { RecoveryQuestBanner } from '@/components/rpg/recovery-quest-banner';
import { SagaSwitcherSheet } from '@/components/rpg/saga-switcher-sheet';
import { ScreenScroll } from '@/components/rpg/screen-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionLabel } from '@/components/rpg/section-label';
import { SagaPreviewEmptyState } from '@/components/rpg/saga-preview-empty-state';
import { StorylinesSection } from '@/components/rpg/storylines-section';
import { XpPopup } from '@/components/rpg/xp-popup';
import { QuestoryTypography } from '@/theme/typography';
import { useGame } from '@/hooks/use-game';
import { isEarlyHqExperience } from '@/lib/hq-experience';
import { resolveHqGuideContext } from '@/lib/mascots/hq-guide-state';
import { useUniverseUiCopy, getUniverseTabMeta } from '@/lib/universe-ui-copy';

export function HqScreen() {
  const ui = useUniverseUiCopy();
  const {
    activeUniverse,
    currentChapter,
    quests,
    completedQuestCount,
    isSagaPreview,
    maybeShowVillainTaunt,
    hqScrollNonce,
    hasOnboarded,
    playerProgress,
    openAddQuestSheet,
    allQuestsComplete,
    villainInfluence,
    requestQuestBoardTab,
  } = useGame();
  const [sagaSwitcherVisible, setSagaSwitcherVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const awarenessScrollYRef = useRef(0);
  const tabMeta = getUniverseTabMeta(activeUniverse.id);

  const earlyHq = useMemo(
    () => isEarlyHqExperience({ ...playerProgress, hasOnboarded }),
    [hasOnboarded, playerProgress],
  );

  const hqGuideContext = useMemo(
    () =>
      resolveHqGuideContext({
        playerProgress,
        completedQuestCount,
        totalQuests: quests.length,
        allQuestsComplete,
        villainInfluence,
        hasOnboarded,
        earlyHq,
      }),
    [
      allQuestsComplete,
      completedQuestCount,
      earlyHq,
      hasOnboarded,
      playerProgress,
      quests.length,
      villainInfluence,
    ],
  );

  const handleHqGuideAction = () => {
    if (hqGuideContext === 'hq_story_continue') {
      router.push('/(game)/story' as Href);
      return;
    }
    openAddQuestSheet();
  };

  const handlePrimaryMissionPress = () => {
    const remaining = quests.filter((q) => q.source === 'template' && !q.completed).length;
    if (remaining > 0) {
      requestQuestBoardTab('chapter');
    }
    router.push('/(game)/quests' as Href);
  };

  useEffect(() => {
    if (hqScrollNonce === 0) return;
    scrollRef.current?.scrollTo({
      y: Math.max(0, awarenessScrollYRef.current - 24),
      animated: Platform.OS !== 'web',
    });
  }, [hqScrollNonce]);

  useEffect(() => {
    if (!currentChapter) return;
    maybeShowVillainTaunt();
  }, [currentChapter?.id, maybeShowVillainTaunt]);

  const actionItems: HqActionGridItem[] = [
    {
      key: 'quests',
      icon: tabMeta.quests?.icon ?? '⬡',
      label: tabMeta.quests?.label ?? 'QUESTS',
      sub: ui.openQuestBoardLabel,
      primary: true,
      onPress: () => router.push('/(game)/quests' as Href),
    },
    {
      key: 'story',
      icon: tabMeta.story?.icon ?? '📡',
      label: tabMeta.story?.label ?? 'STORY',
      sub: currentChapter
        ? ui.activeSectorProgressSub(currentChapter.order)
        : ui.sectorUnavailableSub,
      onPress: () => router.push('/(game)/story' as Href),
    },
    {
      key: 'add',
      icon: '＋',
      label: 'ADD QUEST',
      sub: 'New operation',
      onPress: openAddQuestSheet,
    },
    {
      key: 'profile',
      icon: tabMeta.profile?.icon ?? '★',
      label: tabMeta.profile?.label ?? 'PROFILE',
      sub: 'Progress',
      onPress: () => router.push('/(game)/profile' as Href),
    },
  ];

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScreenScroll scrollRef={scrollRef}>
        {hasOnboarded ? (
          <HqStoryConsole
            earlyHq={earlyHq}
            guideContext={hqGuideContext}
            onGuideAction={
              hqGuideContext === 'hq_no_user_quest' || hqGuideContext === 'hq_story_continue'
                ? handleHqGuideAction
                : undefined
            }
            onPrimaryMissionPress={handlePrimaryMissionPress}
            actionItems={actionItems}
          />
        ) : null}

        <SectionLabel>{hasOnboarded ? 'UP NEXT' : 'YOUR FIRST QUEST'}</SectionLabel>
        {quests.slice(0, earlyHq ? 1 : 2).map((q, i) => (
          <QuestCard key={q.id} quest={q} index={i} />
        ))}
        {completedQuestCount < quests.length && (
          <Pressable onPress={() => router.push('/(game)/quests' as Href)}>
            <Text style={[styles.more, { color: activeUniverse.palette.accent }]}>
              {ui.openQuestBoardLabel}
            </Text>
          </Pressable>
        )}

        {hasOnboarded && !earlyHq ? (
          <>
            <View
              collapsable={false}
              onLayout={(event) => {
                awarenessScrollYRef.current = event.nativeEvent.layout.y;
              }}>
              <DailyAwarenessCheck />
            </View>
            <DailyShutdownBanner />
            <RecoveryQuestBanner />
            <StorylinesSection onOpenSwitcher={() => setSagaSwitcherVisible(true)} />
          </>
        ) : null}

        {isSagaPreview && hasOnboarded && !earlyHq ? <SagaPreviewEmptyState /> : null}
      </ScreenScroll>
      <NarrativeMomentOverlay />
      <XpPopup />
      <SagaSwitcherSheet
        visible={sagaSwitcherVisible}
        onClose={() => setSagaSwitcherVisible(false)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  more: { ...QuestoryTypography.caption, letterSpacing: 2, textAlign: 'center', marginTop: 4 },
});
