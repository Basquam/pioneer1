import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  getQuestBoardTabLabel,
  QUEST_BOARD_TAB_ORDER,
  type QuestBoardTab,
} from '@/lib/quest-board-organization';
import { getUniverseSkin } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';

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
  const skin = getUniverseSkin(universeId);

  return (
    <View style={[styles.panel, { borderColor: `${skin.accentPrimary}44`, backgroundColor: `${palette.panel}cc` }]}>
      <Text style={[QuestoryTypography.caption, { color: skin.accentPrimary, letterSpacing: 2, marginBottom: 6 }]}>
        MISSION BOARD · FILTER
      </Text>
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
                  backgroundColor: selected ? `${skin.accentPrimary}22` : palette.panel,
                  borderColor: selected ? skin.accentPrimary : palette.panelBorder,
                },
              ]}>
              <Text style={[QuestoryTypography.caption, { color: selected ? palette.bone : palette.fog, letterSpacing: 0.8 }]}>
                {getQuestBoardTabLabel(tab, universeId)}
              </Text>
              {showCount ? (
                <View style={[styles.countBadge, { backgroundColor: selected ? skin.accentPrimary : palette.panelBorder }]}>
                  <Text style={[styles.countText, { color: selected ? palette.primary : palette.fog }]}>
                    {count}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  row: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 10,
    lineHeight: 12,
  },
});
