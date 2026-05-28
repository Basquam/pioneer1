import { type Href, router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AddQuestTrigger } from '@/components/rpg/add-quest-trigger';
import { DailyStreakDisplay } from '@/components/rpg/daily-streak-display';
import { TodayFocusDisplay } from '@/components/rpg/today-focus-display';
import { GlowButton } from '@/components/rpg/glow-button';
import { PanelChrome } from '@/components/rpg/panel-chrome';
import { GameFonts } from '@/constants/typography';
import {
  getPanelAccentColor,
  getPanelBorderColor,
  getPanelShadow,
  skewTransform,
} from '@/constants/universe-visual-theme';
import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';

export function DailyOperationsBriefing() {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga, currentChapter, player, quests, villainInfluence } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const panelBorder = getPanelBorderColor(palette, visualTheme);
  const accentColor = getPanelAccentColor(palette, visualTheme);
  const goldAccent = getPanelAccentColor(palette, visualTheme, 'gold');

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
      style={[
        styles.panel,
        {
          backgroundColor: palette.panel,
          borderColor: visualTheme.panelUsesHolographic ? palette.accent : goldAccent,
          borderWidth: visualTheme.panelBorderWidth,
          transform: skewTransform(visualTheme.cardSkew),
        },
        getPanelShadow(palette, visualTheme),
      ]}>
      <PanelChrome palette={palette} theme={visualTheme} />
      <View style={[styles.accent, { backgroundColor: accentColor, width: visualTheme.accentLineWidth }]} />

      <View style={[styles.inner, visualTheme.cardSkew !== 0 && styles.innerUnskew]}>
        <Text style={[styles.eyebrow, { color: goldAccent }]}>DAILY OPERATIONS</Text>
        <Text style={[styles.title, { color: palette.bone }]}>MISSION BRIEFING</Text>
        <Text style={[styles.subtitle, { color: palette.fog }]}>
          {activeUniverse.locationName} · {activeSaga.title}
        </Text>

        <DailyStreakDisplay variant="briefing" />

        <TodayFocusDisplay variant="briefing" />

        <View style={[styles.chapterBlock, { borderColor: panelBorder }]}>
          <Text style={[styles.chapterLabel, { color: palette.accent }]}>{ui.todaySectorLabel}</Text>
          <Text style={[styles.chapterTitle, { color: palette.bone }]}>
            {currentChapter
              ? ui.todaySectorLine(currentChapter.order, currentChapter.title)
              : ui.noActiveChapterBriefing}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCell
            label={ui.operationsLeftLabel}
            value={String(remainingBounties)}
            palette={palette}
            goldAccent={goldAccent}
          />
          <StatCell label={ui.personalOpsLeftLabel} value={String(userQuestCount)} palette={palette} goldAccent={goldAccent} />
          <StatCell label="LEVEL" value={String(player.level)} palette={palette} goldAccent={goldAccent} />
          <StatCell label="XP" value={String(player.totalXp)} palette={palette} goldAccent={goldAccent} />
          <StatCell label={ui.reputationLabel} value={String(player.reputation)} palette={palette} goldAccent={goldAccent} />
          <StatCell label={ui.villainStatLabel} value={`${villainInfluence}%`} palette={palette} goldAccent={goldAccent} danger />
        </View>

        <GlowButton
          label={ui.goToQuestBoardLabel}
          hint={ui.goToQuestBoardHint}
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
  goldAccent,
  danger,
}: {
  label: string;
  value: string;
  palette: { fog: string; bone: string; villainGlow: string };
  goldAccent: string;
  danger?: boolean;
}) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statLabel, { color: palette.fog }]}>{label}</Text>
      <Text style={[styles.statValue, { color: danger ? palette.villainGlow : goldAccent }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 2,
    overflow: 'hidden',
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  inner: { padding: 18, paddingLeft: 22, gap: 12 },
  innerUnskew: { transform: [{ skewX: '2deg' }] },
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
