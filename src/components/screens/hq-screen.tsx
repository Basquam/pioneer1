import { type Href, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { DailyOperationsBriefing } from '@/components/rpg/daily-operations-briefing';
import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { NarrativeMomentOverlay } from '@/components/rpg/narrative-moment-overlay';
import { QuestCard } from '@/components/rpg/quest-card';
import { SagaSwitcherSheet } from '@/components/rpg/saga-switcher-sheet';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { StorylinesSection } from '@/components/rpg/storylines-section';
import { XpPopup } from '@/components/rpg/xp-popup';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function HqScreen() {
  const {
    activeUniverse,
    activeSaga,
    currentChapter,
    storyLine,
    quests,
    completedQuestCount,
    maybeShowVillainTaunt,
  } = useGame();
  const [sagaSwitcherVisible, setSagaSwitcherVisible] = useState(false);

  useEffect(() => {
    maybeShowVillainTaunt();
  }, [currentChapter.id, maybeShowVillainTaunt]);

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View style={styles.pad}>
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={styles.icon}>{activeUniverse.icon}</Text>
            <SectionHeader
              eyebrow={`${activeSaga.title.toUpperCase()} · CH ${currentChapter.order}`}
              title={`${activeUniverse.locationName} HQ`}
              right={activeUniverse.name}
            />
          </Animated.View>

          <DailyOperationsBriefing />

          <StorylinesSection onOpenSwitcher={() => setSagaSwitcherVisible(true)} />

          <DialoguePanel line={storyLine} badge="FIELD REPORT" animate={false} />

          <View style={styles.quickRow}>
            <QuickLink
              label="STORY"
              sub={`Ch. ${currentChapter.order} progress`}
              color={activeUniverse.palette.gold}
              onPress={() => router.push('/(game)/story' as Href)}
            />
            <QuickLink
              label="WORLD MAP"
              sub={activeUniverse.locationName}
              color={activeUniverse.palette.accent}
              onPress={() => router.push('/(game)/map' as Href)}
            />
          </View>

          <Text style={[styles.section, { color: activeUniverse.palette.gold }]}>PRIORITY BOUNTIES</Text>
          {quests.slice(0, 2).map((q, i) => (
            <QuestCard key={q.id} quest={q} index={i} />
          ))}
          {completedQuestCount < quests.length && (
            <Pressable onPress={() => router.push('/(game)/quests' as Href)}>
              <Text style={[styles.more, { color: activeUniverse.palette.accent }]}>
                VIEW ALL BOUNTIES ›
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
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
      <Text style={[styles.quickLabel, { color }]}>{label}</Text>
      <Text style={styles.quickSub}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  pad: { paddingHorizontal: 20, gap: 14, paddingTop: 8 },
  icon: { fontSize: 40, marginBottom: 4 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quick: {
    flex: 1,
    borderWidth: 1,
    padding: 12,
    transform: [{ skewX: '-4deg' }],
    gap: 4,
  },
  quickLabel: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 2 },
  quickSub: { fontFamily: GameFonts.uiSemi, fontSize: 10, color: '#a8a29e', letterSpacing: 1 },
  section: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3, marginTop: 8 },
  more: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 2, textAlign: 'center', marginTop: 4 },
});
