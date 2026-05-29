import { type Href, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AddQuestTrigger } from '@/components/rpg/add-quest-trigger';
import { DailyStreakDisplay } from '@/components/rpg/daily-streak-display';
import { PromiseCardSheet } from '@/components/rpg/promise-card-sheet';
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
import { canLockTodayFocus, getFocusLockCopy } from '@/lib/focus-lock';
import { buildPromiseCard } from '@/lib/promise-card';
import { getDailyCrewCodeLine } from '@/lib/crew-code';
import { QuickCaptureInput } from '@/components/rpg/quick-capture-input';
import { TraitAlignedSuggestionsPanel } from '@/components/rpg/trait-aligned-suggestions';

export function DailyOperationsBriefing() {
  const ui = useUniverseUiCopy();
  const {
    activeUniverse,
    activeSaga,
    currentChapter,
    player,
    playerProgress,
    quests,
    villainInfluence,
    isTodayFocusLocked,
    lockTodayFocus,
    openQuestPackSheet,
  } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const panelBorder = getPanelBorderColor(palette, visualTheme);
  const accentColor = getPanelAccentColor(palette, visualTheme);
  const goldAccent = getPanelAccentColor(palette, visualTheme, 'gold');
  const focusLockCopy = getFocusLockCopy(activeUniverse.id);
  const showLockButton = canLockTodayFocus(playerProgress, activeUniverse.id);
  const [promiseCardVisible, setPromiseCardVisible] = useState(false);
  const crewCodeLine = useMemo(() => getDailyCrewCodeLine(activeSaga), [activeSaga]);

  const promiseCard = useMemo(
    () =>
      isTodayFocusLocked
        ? buildPromiseCard(playerProgress, activeUniverse, activeSaga, quests)
        : null,
    [activeSaga, activeUniverse, isTodayFocusLocked, playerProgress, quests],
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

        {crewCodeLine ? (
          <Text style={[styles.crewCodeLine, { color: palette.gold }]} numberOfLines={3}>
            {crewCodeLine}
          </Text>
        ) : null}

        <DailyStreakDisplay variant="briefing" />

        <TodayFocusDisplay variant="briefing" />

        <QuickCaptureInput />

        <TraitAlignedSuggestionsPanel />

        {isTodayFocusLocked ? (
          <View style={[styles.lockedBlock, { borderColor: goldAccent, backgroundColor: `${palette.primary}33` }]}>
            <Text style={[styles.lockedTitle, { color: palette.bone }]}>{focusLockCopy.lockedMessage}</Text>
            <Text style={[styles.lockedFlavor, { color: palette.gold }]}>{focusLockCopy.lockedFlavor}</Text>
            {promiseCard ? (
              <Pressable
                onPress={() => setPromiseCardVisible(true)}
                style={[styles.promiseButton, { borderColor: palette.gold, backgroundColor: palette.night }]}>
                <Text style={[styles.promiseButtonText, { color: palette.bone }]}>VIEW PROMISE CARD</Text>
              </Pressable>
            ) : null}
          </View>
        ) : showLockButton ? (
          <Pressable
            onPress={handleLockFocus}
            style={[styles.lockButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
            <Text style={[styles.lockButtonText, { color: palette.bone }]}>{focusLockCopy.lockButtonLabel}</Text>
          </Pressable>
        ) : null}

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

        <Pressable
          onPress={openQuestPackSheet}
          style={[styles.packEntry, { borderColor: panelBorder, backgroundColor: `${palette.primary}55` }]}>
          <Text style={[styles.packEntryLabel, { color: goldAccent }]}>SUGGESTED QUEST PACKS</Text>
          <Text style={[styles.packEntryHint, { color: palette.fog }]}>
            Quick bundles — Morning Reset, Deep Work Sprint, Study Session, and more.
          </Text>
        </Pressable>
      </View>

      <PromiseCardSheet visible={promiseCardVisible} onClose={() => setPromiseCardVisible(false)} />
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
  crewCodeLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
    marginTop: -4,
  },
  chapterBlock: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    gap: 4,
  },
  chapterLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  chapterTitle: { fontFamily: GameFonts.ui, fontSize: 16, letterSpacing: 1 },
  lockedBlock: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
    transform: [{ skewX: '-2deg' }],
  },
  lockedTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 1,
  },
  lockedFlavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  promiseButton: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  promiseButtonText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  lockButton: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    transform: [{ skewX: '-4deg' }],
  },
  lockButtonText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  packEntry: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
    transform: [{ skewX: '-2deg' }],
  },
  packEntryLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 2,
  },
  packEntryHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    lineHeight: 14,
  },
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
