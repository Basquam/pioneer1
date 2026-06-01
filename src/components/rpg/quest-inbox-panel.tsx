import * as Haptics from 'expo-haptics';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { CoachMascotTip } from '@/components/rpg/coach-mascot-tip';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getTaskCategoryMeta } from '@/lib/task-categories';
import { QUEST_INBOX_EMPTY_MESSAGE } from '@/lib/quest-inbox';

export function QuestInboxPanel() {
  const { activeUniverse, activeInboxItems, convertInboxItem, archiveInboxItem } = useGame();
  const { palette } = activeUniverse;

  const handleArchive = (itemId: string, title: string) => {
    const confirm = () => {
      void Haptics.selectionAsync();
      archiveInboxItem(itemId);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Archive "${title}"?`)) confirm();
      return;
    }

    Alert.alert('Archive captured task?', `"${title}" will leave your inbox.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', style: 'destructive', onPress: confirm },
    ]);
  };

  if (activeInboxItems.length === 0) {
    return (
      <CoachMascotTip
        context={{ kind: 'empty', variant: 'inbox' }}
        messageOverride={QUEST_INBOX_EMPTY_MESSAGE}
      />
    );
  }

  return (
    <View style={styles.list}>
      {activeInboxItems.map((item) => {
        const categoryMeta = item.suggestedCategory
          ? getTaskCategoryMeta(item.suggestedCategory)
          : null;

        return (
          <View
            key={item.id}
            style={[styles.row, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
            <View style={styles.copy}>
              <Text style={[styles.title, { color: palette.bone }]} numberOfLines={2}>
                {item.title}
              </Text>
              {categoryMeta ? (
                <Text style={[styles.suggestion, { color: palette.fog }]}>
                  Suggested: {categoryMeta.realWorldLabel}
                </Text>
              ) : null}
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={() => {
                  void Haptics.selectionAsync();
                  convertInboxItem(item.id);
                }}
                style={[styles.actionButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
                <Text style={[styles.actionPrimary, { color: palette.bone }]}>CONVERT</Text>
              </Pressable>
              <Pressable
                onPress={() => handleArchive(item.id, item.title)}
                style={[styles.actionButton, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
                <Text style={[styles.actionSecondary, { color: palette.fog }]}>ARCHIVE</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  empty: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  row: {
    borderWidth: 1,
    padding: 12,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  copy: { gap: 4 },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.5,
    lineHeight: 19,
  },
  suggestion: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionPrimary: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  actionSecondary: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.5,
  },
});
