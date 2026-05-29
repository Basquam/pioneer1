import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getTaskCategoryMeta } from '@/lib/task-categories';
import { formatRecurrenceLabel } from '@/lib/recurring-quests';
import type { RecurringQuestTemplate } from '@/types/narrative';

export function RecurringQuestsPanel() {
  const { activeUniverse, playerProgress, disableRecurringQuest } = useGame();
  const { palette } = activeUniverse;

  const activeTemplates = playerProgress.recurringQuestTemplates.filter((template) => template.isActive);

  if (activeTemplates.length === 0) {
    return (
      <View style={[styles.emptyBox, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
        <Text style={[styles.emptyTitle, { color: palette.bone }]}>No active routines</Text>
        <Text style={[styles.emptyHint, { color: palette.fog }]}>
          When adding a quest, choose Daily, Weekly, or Monthly under “Repeat this quest.”
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {activeTemplates.map((template) => (
        <RecurringQuestRow
          key={template.id}
          template={template}
          palette={palette}
          onDisable={() => {
            void Haptics.selectionAsync();
            disableRecurringQuest(template.id);
          }}
        />
      ))}
    </View>
  );
}

function RecurringQuestRow({
  template,
  palette,
  onDisable,
}: {
  template: RecurringQuestTemplate;
  palette: {
    bone: string;
    fog: string;
    gold: string;
    panel: string;
    panelBorder: string;
    primary: string;
  };
  onDisable: () => void;
}) {
  const categoryMeta = getTaskCategoryMeta(template.category);

  return (
    <View style={[styles.row, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: palette.bone }]} numberOfLines={2}>
          {template.originalTitle}
        </Text>
        <Text style={[styles.rowMeta, { color: palette.fog }]}>
          {categoryMeta.icon} {categoryMeta.label} · {formatRecurrenceLabel(template)}
        </Text>
        {template.preferredTimeLabel ? (
          <Text style={[styles.rowTime, { color: palette.gold }]}>{template.preferredTimeLabel}</Text>
        ) : null}
      </View>
      <Pressable
        onPress={onDisable}
        style={[styles.disableButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
        <Text style={[styles.disableButtonText, { color: palette.bone }]}>DISABLE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  emptyBox: {
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 13,
    letterSpacing: 1,
  },
  emptyHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
  },
  row: {
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  rowCopy: { gap: 4 },
  rowTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  rowMeta: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    lineHeight: 14,
  },
  rowTime: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    fontStyle: 'italic',
  },
  disableButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  disableButtonText: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 1.5,
  },
});
