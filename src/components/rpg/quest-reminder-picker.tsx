import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import {
  LOCAL_REMINDERS_WEB_MESSAGE,
  QUEST_REMINDER_PRESET_OPTIONS,
  REMINDER_PRESET_SCHEDULE,
  suggestReminderSelectionFromPlannedTime,
  type QuestReminderSelection,
} from '@/lib/quest-reminders';
import type { UniversePalette } from '@/types/narrative';

type QuestReminderPickerProps = {
  selection: QuestReminderSelection;
  customTime: string;
  plannedTimeLabel?: string;
  onSelectionChange: (selection: QuestReminderSelection) => void;
  onCustomTimeChange: (time: string) => void;
  palette: UniversePalette;
  showWebNotice?: boolean;
};

export function QuestReminderPicker({
  selection,
  customTime,
  plannedTimeLabel,
  onSelectionChange,
  onCustomTimeChange,
  palette,
  showWebNotice = true,
}: QuestReminderPickerProps) {
  const suggestedPreset = suggestReminderSelectionFromPlannedTime(plannedTimeLabel);
  const suggestedLabel = suggestedPreset ? REMINDER_PRESET_SCHEDULE[suggestedPreset].label : null;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: palette.gold }]}>REMIND ME</Text>
      <Text style={[styles.hint, { color: palette.fog }]}>
        Optional local cue — not a required notification.
      </Text>

      {showWebNotice ? (
        <Text style={[styles.webNotice, { color: palette.fog }]}>{LOCAL_REMINDERS_WEB_MESSAGE}</Text>
      ) : null}

      <View style={styles.options}>
        {QUEST_REMINDER_PRESET_OPTIONS.map((option) => {
          const selected = selection === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                void Haptics.selectionAsync();
                onSelectionChange(option.value);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? palette.primary : palette.night,
                  borderColor: selected ? palette.gold : palette.panelBorder,
                },
              ]}>
              <Text style={[styles.chipText, { color: selected ? palette.bone : palette.fog }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {selection === 'custom' ? (
        <TextInput
          value={customTime}
          onChangeText={onCustomTimeChange}
          placeholder="HH:mm — e.g. 19:30"
          placeholderTextColor={`${palette.fog}88`}
          keyboardType="numbers-and-punctuation"
          style={[
            styles.input,
            { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
          ]}
        />
      ) : null}

      {suggestedLabel && selection === 'none' ? (
        <Pressable
          onPress={() => {
            if (!suggestedPreset) return;
            void Haptics.selectionAsync();
            onSelectionChange(suggestedPreset);
          }}
          style={[styles.suggestion, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
          <Text style={[styles.suggestionText, { color: palette.fog }]}>
            Matches your plan: {suggestedLabel} — tap to use
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  hint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  webNotice: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipText: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
  },
  suggestion: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestionText: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
  },
});
