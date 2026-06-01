import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getQuestSuiteById, QUEST_SUITES } from '@/constants/quest-suites';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import type { QuestSuiteId } from '@/types/narrative';

export function ActiveSuiteFocusCard() {
  const { activeUniverse, playerProgress, setActiveSuiteId, clearActiveSuiteId } = useGame();
  const { palette } = activeUniverse;
  const activeSuite = playerProgress.activeSuiteId
    ? getQuestSuiteById(playerProgress.activeSuiteId)
    : null;

  const handleSelect = (suiteId: QuestSuiteId) => {
    void Haptics.selectionAsync();
    if (playerProgress.activeSuiteId === suiteId) {
      clearActiveSuiteId();
      return;
    }
    setActiveSuiteId(suiteId);
  };

  return (
    <View style={[styles.wrapper, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: palette.gold }]}>TODAY'S SUITE FOCUS</Text>
        {activeSuite ? (
          <Pressable onPress={clearActiveSuiteId} hitSlop={8}>
            <Text style={[styles.clearAction, { color: palette.fog }]}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      {activeSuite ? (
        <View style={[styles.activeRow, { borderColor: palette.gold, backgroundColor: palette.panel }]}>
          <Text style={styles.activeIcon}>{activeSuite.icon}</Text>
          <View style={styles.activeCopy}>
            <Text style={[styles.activeLabel, { color: palette.bone }]}>{activeSuite.label}</Text>
            <Text style={[styles.activeDescription, { color: palette.fog }]} numberOfLines={2}>
              {activeSuite.description}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={[styles.helper, { color: palette.fog }]}>
          Pick a real-life domain to personalize quest suggestions.
        </Text>
      )}

      <View style={styles.chips}>
        {QUEST_SUITES.map((suite) => {
          const selected = playerProgress.activeSuiteId === suite.id;
          return (
            <Pressable
              key={suite.id}
              onPress={() => handleSelect(suite.id)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? palette.primary : palette.panel,
                  borderColor: selected ? palette.gold : palette.panelBorder,
                },
              ]}>
              <Text style={styles.chipIcon}>{suite.icon}</Text>
              <Text
                style={[styles.chipLabel, { color: selected ? palette.bone : palette.fog }]}
                numberOfLines={1}>
                {suite.shortLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    padding: 12,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  clearAction: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    padding: 10,
  },
  activeIcon: {
    fontSize: 20,
  },
  activeCopy: {
    flex: 1,
    gap: 2,
  },
  activeLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 13,
  },
  activeDescription: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    lineHeight: 15,
  },
  helper: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    lineHeight: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  chipIcon: {
    fontSize: 12,
  },
  chipLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
  },
});
