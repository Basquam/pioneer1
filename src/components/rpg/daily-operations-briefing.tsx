import { type Href, router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AddQuestTrigger } from '@/components/rpg/add-quest-trigger';
import { GlowButton } from '@/components/rpg/glow-button';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function DailyOperationsBriefing() {
  const { activeUniverse, activeSaga, currentChapter, player, quests, villainInfluence } = useGame();
  const { palette } = activeUniverse;

  const { remainingBounties, userQuestCount } = useMemo(() => {
    const templates = quests.filter((quest) => quest.source === 'template');
    const userQuests = quests.filter((quest) => quest.source === 'user');

    return {
      remainingBounties: templates.filter((quest) => !quest.completed).length,
      userQuestCount: userQuests.filter((quest) => !quest.completed).length,
    };
  }, [quests]);

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(120)}
      style={[styles.panel, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
      <View style={[styles.accent, { backgroundColor: palette.primary }]} />

      <View style={styles.inner}>
        <Text style={[styles.eyebrow, { color: palette.gold }]}>DAILY OPERATIONS</Text>
        <Text style={[styles.title, { color: palette.bone }]}>MISSION BRIEFING</Text>
        <Text style={[styles.subtitle, { color: palette.fog }]}>
          {activeUniverse.locationName} · {activeSaga.title}
        </Text>

        <View style={[styles.chapterBlock, { borderColor: palette.panelBorder }]}>
          <Text style={[styles.chapterLabel, { color: palette.accent }]}>TODAY&apos;S CHAPTER</Text>
          <Text style={[styles.chapterTitle, { color: palette.bone }]}>
            Ch. {currentChapter.order} — {currentChapter.title}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCell
            label="BOUNTIES LEFT"
            value={String(remainingBounties)}
            palette={palette}
          />
          <StatCell label="YOUR QUESTS" value={String(userQuestCount)} palette={palette} />
          <StatCell label="LEVEL" value={String(player.level)} palette={palette} />
          <StatCell label="XP" value={String(player.totalXp)} palette={palette} />
          <StatCell label="REPUTATION" value={String(player.reputation)} palette={palette} />
          <StatCell label="VILLAIN" value={`${villainInfluence}%`} palette={palette} danger />
        </View>

        <GlowButton
          label="GO TO QUEST BOARD"
          hint="CLAIM TODAY'S BOUNTIES"
          onPress={() => router.push('/(game)/quests' as Href)}
        />

        <AddQuestTrigger variant="banner" />
      </View>
    </Animated.View>
  );
}

function StatCell({
  label,
  value,
  palette,
  danger,
}: {
  label: string;
  value: string;
  palette: { gold: string; fog: string; bone: string; villainGlow: string };
  danger?: boolean;
}) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statLabel, { color: palette.fog }]}>{label}</Text>
      <Text style={[styles.statValue, { color: danger ? palette.villainGlow : palette.gold }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 2,
    overflow: 'hidden',
    transform: [{ skewX: '-2deg' }],
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  inner: { padding: 18, paddingLeft: 22, gap: 12, transform: [{ skewX: '2deg' }] },
  eyebrow: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 3 },
  title: { fontFamily: GameFonts.display, fontSize: 28, letterSpacing: 2, lineHeight: 34 },
  subtitle: { fontFamily: GameFonts.uiSemi, fontSize: 11, letterSpacing: 1 },
  chapterBlock: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    gap: 4,
  },
  chapterLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  chapterTitle: { fontFamily: GameFonts.ui, fontSize: 16, letterSpacing: 1 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCell: {
    width: '30%',
    minWidth: 92,
    flexGrow: 1,
    gap: 2,
  },
  statLabel: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 1.5 },
  statValue: { fontFamily: GameFonts.ui, fontSize: 18, letterSpacing: 1 },
});
