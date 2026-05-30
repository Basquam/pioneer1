import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  resolveSnoozePresetDate,
  SNOOZE_PRESET_OPTIONS,
  type SnoozePreset,
} from '@/lib/quest-lifecycle';
import type { DailyShutdownOpenQuestAction, UniversePalette } from '@/types/narrative';

const PRIMARY_ACTIONS: Array<{ action: DailyShutdownOpenQuestAction; label: string }> = [
  { action: 'carry-today', label: 'Carry to today' },
  { action: 'snooze', label: 'Snooze' },
  { action: 'split', label: 'Split chain' },
  { action: 'archive', label: 'Archive' },
  { action: 'complete', label: 'Complete now' },
];

type QuestLifecycleActionsProps = {
  questId: string;
  palette: UniversePalette;
  selectedAction?: DailyShutdownOpenQuestAction;
  onSelectAction?: (action: DailyShutdownOpenQuestAction) => void;
  showLeave?: boolean;
};

export function QuestLifecycleActions({
  questId,
  palette,
  selectedAction,
  onSelectAction,
  showLeave = false,
}: QuestLifecycleActionsProps) {
  const {
    carryQuestToToday,
    snoozeQuest,
    archiveUserQuest,
    completeQuest,
    openSplitQuestChain,
  } = useGame();

  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [snoozePreset, setSnoozePreset] = useState<SnoozePreset>('tomorrow');
  const [customDate, setCustomDate] = useState('');

  const resolvedSelection = selectedAction ?? 'leave';

  const notifySelection = (action: DailyShutdownOpenQuestAction) => {
    onSelectAction?.(action);
  };

  const handleAction = (action: DailyShutdownOpenQuestAction) => {
    void Haptics.selectionAsync();
    notifySelection(action);

    switch (action) {
      case 'carry-today':
        carryQuestToToday(questId);
        setSnoozeOpen(false);
        return;
      case 'snooze':
        setSnoozeOpen(true);
        return;
      case 'split':
        openSplitQuestChain(questId);
        setSnoozeOpen(false);
        return;
      case 'archive':
        Alert.alert(
          'Archive this quest?',
          'It leaves your active board but stays in your history.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Archive',
              style: 'destructive',
              onPress: () => archiveUserQuest(questId),
            },
          ],
        );
        setSnoozeOpen(false);
        return;
      case 'complete':
        completeQuest(questId);
        setSnoozeOpen(false);
        return;
      case 'leave':
        setSnoozeOpen(false);
        return;
      default:
        return;
    }
  };

  const handleConfirmSnooze = () => {
    const untilDate = resolveSnoozePresetDate(snoozePreset, customDate);
    if (!untilDate) return;

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    snoozeQuest(questId, untilDate);
    notifySelection('snooze');
    setSnoozeOpen(false);
  };

  const actions = showLeave
    ? [...PRIMARY_ACTIONS, { action: 'leave' as const, label: 'Leave as is' }]
    : PRIMARY_ACTIONS;

  return (
    <View style={styles.container}>
      <View style={styles.actionRow}>
        {actions.map((option) => {
          const selected = resolvedSelection === option.action;
          return (
            <Pressable
              key={option.action}
              onPress={() => handleAction(option.action)}
              style={[
                styles.actionChip,
                {
                  backgroundColor: selected ? palette.primary : palette.night,
                  borderColor: selected ? palette.gold : palette.panelBorder,
                },
              ]}>
              <Text
                style={[
                  styles.actionChipText,
                  { color: selected ? palette.bone : palette.fog },
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {snoozeOpen ? (
        <View style={[styles.snoozePanel, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
          <Text style={[styles.snoozeLabel, { color: palette.gold }]}>SNOOZE UNTIL</Text>
          <View style={styles.actionRow}>
            {SNOOZE_PRESET_OPTIONS.map((option) => {
              const selected = snoozePreset === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    setSnoozePreset(option.value);
                  }}
                  style={[
                    styles.actionChip,
                    {
                      backgroundColor: selected ? palette.primary : palette.night,
                      borderColor: selected ? palette.gold : palette.panelBorder,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.actionChipText,
                      { color: selected ? palette.bone : palette.fog },
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {snoozePreset === 'custom' ? (
            <TextInput
              value={customDate}
              onChangeText={setCustomDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={`${palette.fog}88`}
              autoCapitalize="none"
              style={[
                styles.customDateInput,
                {
                  color: palette.bone,
                  borderColor: palette.panelBorder,
                  backgroundColor: palette.night,
                },
              ]}
            />
          ) : null}
          <Pressable
            onPress={handleConfirmSnooze}
            style={[styles.confirmSnooze, { backgroundColor: palette.primary, borderColor: palette.gold }]}>
            <Text style={[styles.confirmSnoozeText, { color: palette.bone }]}>Confirm snooze</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionChip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  actionChipText: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  snoozePanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  snoozeLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  customDateInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: GameFonts.ui,
    fontSize: 12,
  },
  confirmSnooze: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  confirmSnoozeText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
