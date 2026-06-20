import { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AddQuestTrigger } from '@/components/rpg/add-quest-trigger';
import { DailyStreakDisplay } from '@/components/rpg/daily-streak-display';
import { PromiseCardSheet } from '@/components/rpg/promise-card-sheet';
import { TodayFocusDisplay } from '@/components/rpg/today-focus-display';
import { ContextualCoachTipCard } from '@/components/rpg/contextual-coach-tip-card';
import { MinimumViableDayBriefingActivate } from '@/components/rpg/minimum-viable-day-banner';
import { NextBestActionCard } from '@/components/rpg/next-best-action-card';
import { QuestLoadMeter } from '@/components/rpg/quest-load-meter';
import { QuickCaptureInput } from '@/components/rpg/quick-capture-input';
import { TraitAlignedSuggestionsPanel } from '@/components/rpg/trait-aligned-suggestions';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { GameFonts } from '@/constants/typography';
import {
  getPanelAccentColor,
  getPanelBorderColor,
} from '@/constants/universe-visual-theme';
import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
import { canLockTodayFocus, getFocusLockCopy } from '@/lib/focus-lock';
import { buildPromiseCard } from '@/lib/promise-card';
import { getDailyCrewCodeLine } from '@/lib/crew-code';
import { getStoryDrivenBriefingHint } from '@/lib/quest-style-profile';
import { isEarlyHqExperience } from '@/lib/hq-experience';
import { QuestoryTheme } from '@/theme/questory-theme';
import { getUniverseSkin } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';

/** Secondary HQ support systems — hero/threat/command live in dedicated HQ golden components. */
export function DailyOperationsBriefing() {
  const {
    activeUniverse,
    activeSaga,
    playerProgress,
    hasOnboarded,
    quests,
    isTodayFocusLocked,
    lockTodayFocus,
    openQuestPackSheet,
  } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const skin = getUniverseSkin(activeUniverse.id);
  const panelBorder = getPanelBorderColor(palette, visualTheme);
  const goldAccent = getPanelAccentColor(palette, visualTheme, 'gold');
  const focusLockCopy = getFocusLockCopy(activeUniverse.id);
  const showLockButton = canLockTodayFocus(playerProgress, activeUniverse.id);
  const [promiseCardVisible, setPromiseCardVisible] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);

  const earlyHq = useMemo(
    () => isEarlyHqExperience({ ...playerProgress, hasOnboarded }),
    [hasOnboarded, playerProgress],
  );
  const showAdvancedTools = !earlyHq || showMoreTools;

  const crewCodeLine = useMemo(() => getDailyCrewCodeLine(activeSaga), [activeSaga]);
  const storyStyleHint = useMemo(
    () => getStoryDrivenBriefingHint(playerProgress.questStyleProfile),
    [playerProgress.questStyleProfile],
  );

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

  if (!showAdvancedTools && earlyHq && !showMoreTools) {
    return (
      <Animated.View entering={FadeInDown.duration(400).delay(240)}>
        <Pressable onPress={() => setShowMoreTools(true)} style={styles.moreToolsButton}>
          <Text style={[QuestoryTypography.caption, { color: palette.accent, letterSpacing: 1.2 }]}>
            Show support systems ›
          </Text>
          <Text style={[QuestoryTypography.caption, { color: palette.fog }]}>
            Streaks, quick capture, quest load, and more
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(240)}>
      <View style={[styles.supportPanel, { borderColor: skin.surfaceBorder, backgroundColor: QuestoryTheme.colors.background.panel }]}>
        <QuestoryStatusPill label="SUPPORT SYSTEMS" tone="muted" />
        <Text style={[QuestoryTypography.sectionTitle, { color: palette.bone }]}>Operations Toolkit</Text>

        {showAdvancedTools && crewCodeLine ? (
          <Text style={[styles.crewCodeLine, { color: palette.gold }]} numberOfLines={3}>
            {crewCodeLine}
          </Text>
        ) : null}

        {showAdvancedTools && storyStyleHint ? (
          <Text style={[styles.storyStyleHint, { color: palette.fog }]} numberOfLines={3}>
            {storyStyleHint}
          </Text>
        ) : null}

        <NextBestActionCard />

        {showAdvancedTools ? (
          <>
            <ContextualCoachTipCard />
            <MinimumViableDayBriefingActivate />
            <DailyStreakDisplay variant="briefing" />
            <TodayFocusDisplay variant="briefing" />
            <QuestLoadMeter />
            <QuickCaptureInput />
            <TraitAlignedSuggestionsPanel />
          </>
        ) : null}

        {showAdvancedTools && isTodayFocusLocked ? (
          <View style={[styles.lockedBlock, { borderColor: goldAccent, backgroundColor: `${palette.primary}33` }]}>
            <Text style={[QuestoryTypography.body, { color: palette.bone }]}>{focusLockCopy.lockedMessage}</Text>
            <Text style={[QuestoryTypography.flavor, { color: palette.gold }]}>{focusLockCopy.lockedFlavor}</Text>
            {promiseCard ? (
              <Pressable
                onPress={() => setPromiseCardVisible(true)}
                style={[styles.promiseButton, { borderColor: palette.gold, backgroundColor: palette.night }]}>
                <Text style={[QuestoryTypography.caption, { color: palette.bone, letterSpacing: 1.5 }]}>
                  VIEW PROMISE CARD
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : showAdvancedTools && showLockButton ? (
          <Pressable
            onPress={handleLockFocus}
            style={[styles.lockButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
            <Text style={[QuestoryTypography.caption, { color: palette.bone, letterSpacing: 1.5 }]}>
              {focusLockCopy.lockButtonLabel}
            </Text>
          </Pressable>
        ) : null}

        {showAdvancedTools ? (
          <>
            <AddQuestTrigger variant="banner" />
            <Pressable
              onPress={openQuestPackSheet}
              style={[styles.packEntry, { borderColor: panelBorder, backgroundColor: `${palette.primary}55` }]}>
              <Text style={[QuestoryTypography.caption, { color: goldAccent, letterSpacing: 2 }]}>
                SUGGESTED QUEST PACKS
              </Text>
              <Text style={[QuestoryTypography.bodySmall, { color: palette.fog }]}>
                Quick bundles — Morning Reset, Deep Work Sprint, Study Session, and more.
              </Text>
            </Pressable>
          </>
        ) : null}
      </View>

      <PromiseCardSheet visible={promiseCardVisible} onClose={() => setPromiseCardVisible(false)} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  supportPanel: {
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginTop: 4,
  },
  crewCodeLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  storyStyleHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  moreToolsButton: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
    marginTop: 4,
  },
  lockedBlock: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  promiseButton: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  lockButton: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  packEntry: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
});
