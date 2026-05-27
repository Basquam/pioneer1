import { type Href, router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AddQuestTrigger } from '@/components/rpg/add-quest-trigger';
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

  useEffect(() => {
    maybeShowVillainTaunt();
  }, [currentChapter.id, maybeShowVillainTaunt]);

  const activeQuests = quests.filter((q) => !q.completed);

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

          <GameHud />
          <VillainMeter />

          <DialoguePanel line={storyLine} badge="FIELD REPORT" animate={false} />

          <View style={styles.quickRow}>
            <QuickLink
              label="QUEST BOARD"
              sub={`${activeQuests.length} active`}
              color={activeUniverse.palette.accent}
              onPress={() => router.push('/(game)/quests' as Href)}
            />
            <QuickLink
              label="STORY"
              sub={`Ch. ${currentChapter.order}`}
              color={activeUniverse.palette.gold}
              onPress={() => router.push('/(game)/story' as Href)}
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
      <AddQuestTrigger variant="fab" />
      <NarrativeMomentOverlay />
      <XpPopup />
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
