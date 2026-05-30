import { type Href, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { DailyShutdownBanner } from '@/components/rpg/daily-shutdown-banner';
import { DailyAwarenessCheck } from '@/components/rpg/daily-awareness-check';
import { QuestInboxPanel } from '@/components/rpg/quest-inbox-panel';
import { DailyOperationsBriefing } from '@/components/rpg/daily-operations-briefing';
import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { MinimumViableDayBanner } from '@/components/rpg/minimum-viable-day-banner';
import { NarrativeMomentOverlay } from '@/components/rpg/narrative-moment-overlay';
import { QuestCard } from '@/components/rpg/quest-card';
import { RecoveryQuestBanner } from '@/components/rpg/recovery-quest-banner';
import { SagaSwitcherSheet } from '@/components/rpg/saga-switcher-sheet';
import { ScreenScroll } from '@/components/rpg/screen-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { SectionLabel } from '@/components/rpg/section-label';
import { SagaPreviewEmptyState } from '@/components/rpg/saga-preview-empty-state';
import { StorylinesSection } from '@/components/rpg/storylines-section';
import { XpPopup } from '@/components/rpg/xp-popup';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';

export function HqScreen() {
  const ui = useUniverseUiCopy();
  const {
    activeUniverse,
    activeSaga,
    currentChapter,
    storyLine,
    quests,
    completedQuestCount,
    isSagaPreview,
    maybeShowVillainTaunt,
    hqScrollNonce,
  } = useGame();
  const [sagaSwitcherVisible, setSagaSwitcherVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const awarenessScrollYRef = useRef(0);

  useEffect(() => {
    if (hqScrollNonce === 0) return;

    const scrollY = Math.max(0, awarenessScrollYRef.current - 24);

    scrollRef.current?.scrollTo({
      y: scrollY,
      animated: Platform.OS !== 'web',
    });
  }, [hqScrollNonce]);

  useEffect(() => {
    if (!currentChapter) return;
    maybeShowVillainTaunt();
  }, [currentChapter?.id, maybeShowVillainTaunt]);

  const chapterLabel = ui.hqChapterEyebrow(
    activeSaga.title,
    currentChapter?.order,
  );

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScreenScroll scrollRef={scrollRef}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.icon}>{activeUniverse.icon}</Text>
          <SectionHeader
            eyebrow={chapterLabel}
            title={ui.hqTitle(activeUniverse.locationName)}
            right={activeUniverse.name}
          />
        </Animated.View>

        <MinimumViableDayBanner />

        <DailyOperationsBriefing />

        <SectionLabel>QUEST INBOX</SectionLabel>
        <QuestInboxPanel />

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

        {isSagaPreview && <SagaPreviewEmptyState />}

        <DialoguePanel line={storyLine} badge="FIELD REPORT" animate={false} />

        <View style={styles.quickRow}>
          <QuickLink
            label="STORY"
            sub={
              currentChapter
                ? ui.activeSectorProgressSub(currentChapter.order)
                : ui.sectorUnavailableSub
            }
            color={activeUniverse.palette.gold}
            onPress={() => router.push('/(game)/story' as Href)}
          />
          <QuickLink
            label={ui.worldMapQuickLink}
            sub={activeUniverse.locationName}
            color={activeUniverse.palette.accent}
            onPress={() => router.push('/(game)/map' as Href)}
          />
        </View>

        <SectionLabel>UP NEXT</SectionLabel>
        {quests.slice(0, 2).map((q, i) => (
          <QuestCard key={q.id} quest={q} index={i} />
        ))}
        {completedQuestCount < quests.length && (
          <Pressable onPress={() => router.push('/(game)/quests' as Href)}>
            <Text style={[styles.more, { color: activeUniverse.palette.accent }]}>
              {ui.openQuestBoardLabel}
            </Text>
          </Pressable>
        )}
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

function QuickLink({
  label,
  sub,
  color,
  onPress,
}: {
  label: string;
  sub: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.quick, { borderColor: color }]}>
      <Text style={[styles.quickLabel, { color }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.quickSub} numberOfLines={2}>
        {sub}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  icon: { fontSize: 40, marginBottom: 4 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quick: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    padding: 12,
    transform: [{ skewX: '-4deg' }],
    gap: 4,
  },
  quickLabel: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 2 },
  quickSub: { fontFamily: GameFonts.uiSemi, fontSize: 10, color: '#a8a29e', letterSpacing: 1, lineHeight: 14 },
  more: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 2, textAlign: 'center', marginTop: 4 },
});
