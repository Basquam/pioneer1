import * as Haptics from 'expo-haptics';
import { type Href, router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { CoachMascotTip } from '@/components/rpg/coach-mascot-tip';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { canLockTodayFocus, getFocusLockCopy } from '@/lib/focus-lock';
import {
  getQuestLoadLabel,
  getQuestLoadSegmentCount,
  getQuestLoadStatus,
} from '@/lib/quest-load';

const SEGMENT_COUNT = 4;

export function QuestLoadMeter() {
  const {
    activeUniverse,
    playerProgress,
    lockTodayFocus,
    openAddQuestSheet,
    requestQuestBoardTab,
  } = useGame();
  const { palette } = activeUniverse;
  const focusLockCopy = getFocusLockCopy(activeUniverse.id);

  const loadStatus = useMemo(
    () =>
      getQuestLoadStatus({
        progress: playerProgress,
        universeId: activeUniverse.id,
      }),
    [activeUniverse.id, playerProgress],
  );

  const filledSegments = getQuestLoadSegmentCount(loadStatus.loadLevel);
  const meterColor =
    loadStatus.loadLevel === 'overloaded'
      ? palette.villainGlow
      : loadStatus.loadLevel === 'heavy'
        ? palette.accent
        : loadStatus.loadLevel === 'balanced'
          ? palette.gold
          : palette.primary;

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

  const handleAction = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { suggestedAction } = loadStatus;

    switch (suggestedAction.type) {
      case 'add-one-quest':
        openAddQuestSheet();
        return;
      case 'start-focus':
        if (canLockTodayFocus(playerProgress, activeUniverse.id)) {
          handleLockFocus();
          return;
        }
        if (suggestedAction.questBoardTab) {
          requestQuestBoardTab(suggestedAction.questBoardTab);
        }
        router.push('/(game)/quests' as Href);
        return;
      case 'review-quest-load':
      default:
        if (suggestedAction.questBoardTab) {
          requestQuestBoardTab(suggestedAction.questBoardTab);
        }
        router.push('/(game)/quests' as Href);
        return;
    }
  };

  return (
    <View style={[styles.wrap, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.eyebrow, { color: palette.accent }]}>QUEST LOAD</Text>
        <Text style={[styles.levelLabel, { color: meterColor }]}>
          {getQuestLoadLabel(loadStatus.loadLevel)}
        </Text>
      </View>

      <View style={styles.segmentRow}>
        {Array.from({ length: SEGMENT_COUNT }, (_, index) => {
          const active = index < filledSegments;
          return (
            <View
              key={index}
              style={[
                styles.segment,
                {
                  backgroundColor: active ? meterColor : `${palette.fog}33`,
                  borderColor: active ? meterColor : palette.panelBorder,
                },
              ]}
            />
          );
        })}
      </View>

      <Text style={[styles.flavor, { color: palette.gold }]}>{loadStatus.universeFlavor}</Text>
      {loadStatus.loadLevel === 'heavy' || loadStatus.loadLevel === 'overloaded' ? (
        <CoachMascotTip
          context={{ kind: 'quest-load', loadLevel: loadStatus.loadLevel }}
          messageOverride={loadStatus.explanation}
          variant="inline"
        />
      ) : null}

      <Pressable
        onPress={handleAction}
        style={[styles.cta, { borderColor: palette.gold, backgroundColor: `${palette.primary}88` }]}>
        <Text style={[styles.ctaText, { color: palette.bone }]}>{loadStatus.suggestedAction.label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    padding: 12,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
  },
  levelLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 8,
    borderWidth: 1,
  },
  flavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  explanation: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
  },
  cta: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    transform: [{ skewX: '-4deg' }],
    marginTop: 2,
  },
  ctaText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.2,
  },
});
