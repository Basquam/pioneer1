import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import {
  getQuestBoardTabLabel,
  QUEST_BOARD_TAB_ORDER,
  type QuestBoardTab,
} from '@/lib/quest-board-organization';

type QuestBoardTabBarProps = {
  activeTab: QuestBoardTab;
  onTabChange: (tab: QuestBoardTab) => void;
  universeId: string;
  tabCounts: Partial<Record<QuestBoardTab, number>>;
  palette: {
    bone: string;
    fog: string;
    gold: string;
    panel: string;
    panelBorder: string;
    primary: string;
  };
};

export function QuestBoardTabBar({
  activeTab,
  onTabChange,
  universeId,
  tabCounts,
  palette,
}: QuestBoardTabBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {QUEST_BOARD_TAB_ORDER.map((tab) => {
        const selected = activeTab === tab;
        const count = tabCounts[tab];
        const showCount = typeof count === 'number' && count > 0;

        return (
          <Pressable
            key={tab}
            onPress={() => {
              void Haptics.selectionAsync();
              onTabChange(tab);
            }}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? palette.primary : palette.panel,
                borderColor: selected ? palette.gold : palette.panelBorder,
              },
            ]}>
            <Text style={[styles.chipText, { color: selected ? palette.bone : palette.fog }]}>
              {getQuestBoardTabLabel(tab, universeId)}
            </Text>
            {showCount ? (
              <View style={[styles.countBadge, { backgroundColor: selected ? palette.gold : palette.panelBorder }]}>
                <Text style={[styles.countText, { color: selected ? palette.primary : palette.fog }]}>
                  {count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    lineHeight: 12,
  },
});
