import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getDefaultPrepPreset } from '@/lib/quest-prep';
import {
  formatCategoryDefaultsSummary,
  getCategoryQuestDefaults,
  QUEST_DEFAULTS_PRESETS,
  updateCategoryQuestDefaultsInSettings,
} from '@/lib/quest-defaults';
import { getQuestRiskOptions } from '@/lib/quest-risk';
import { getTaskCategoryMeta, TASK_CATEGORIES } from '@/lib/task-categories';
import type { CategoryQuestDefaults, QuestDefaultsPresetId, TaskCategory } from '@/types/narrative';

export function QuestDefaultsPanel() {
  const { activeUniverse, playerProgress, updateCategoryQuestDefaults, applyQuestDefaultsPreset } =
    useGame();
  const { palette } = activeUniverse;
  const [category, setCategory] = useState<TaskCategory>('work');

  const categoryDefaults = useMemo(
    () => getCategoryQuestDefaults(playerProgress.questDefaults, category),
    [category, playerProgress.questDefaults],
  );
  const riskOptions = useMemo(() => getQuestRiskOptions(), []);
  const categoryMeta = getTaskCategoryMeta(category);
  const activePresetId = playerProgress.questDefaults.activePresetId;

  const saveDefaults = (updates: Partial<CategoryQuestDefaults>) => {
    updateCategoryQuestDefaults(category, updates);
  };

  const handlePreset = (presetId: QuestDefaultsPresetId) => {
    void Haptics.selectionAsync();
    applyQuestDefaultsPreset(presetId);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.intro, { color: palette.fog }]}>
        Optional defaults per task type — applied when you add a quest. Nothing is forced.
      </Text>

      <Text style={[styles.sectionLabel, { color: palette.gold }]}>QUICK PRESETS</Text>
      <View style={styles.presetList}>
        {QUEST_DEFAULTS_PRESETS.map((preset) => {
          const selected = activePresetId === preset.id;
          return (
            <Pressable
              key={preset.id}
              onPress={() => handlePreset(preset.id)}
              style={[
                styles.presetCard,
                {
                  borderColor: selected ? palette.gold : palette.panelBorder,
                  backgroundColor: selected ? `${palette.primary}55` : palette.panel,
                },
              ]}>
              <Text style={[styles.presetTitle, { color: palette.bone }]}>{preset.label}</Text>
              <Text style={[styles.presetDescription, { color: palette.fog }]}>{preset.description}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionLabel, { color: palette.gold }]}>BY CATEGORY</Text>
      <View style={styles.chips}>
        {TASK_CATEGORIES.map((cat) => {
          const selected = category === cat;
          const meta = getTaskCategoryMeta(cat);
          const hasDefaults = formatCategoryDefaultsSummary(
            getCategoryQuestDefaults(playerProgress.questDefaults, cat),
          ) !== 'No defaults set';

          return (
            <Pressable
              key={cat}
              onPress={() => {
                void Haptics.selectionAsync();
                setCategory(cat);
              }}
              style={[
                styles.chip,
                {
                  borderColor: selected ? palette.gold : hasDefaults ? palette.accent : palette.panelBorder,
                  backgroundColor: selected ? palette.primary : palette.night,
                },
              ]}>
              <Text style={[styles.chipText, { color: selected ? palette.bone : palette.fog }]}>
                {meta.icon} {meta.realWorldLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.categorySummary, { color: palette.fog }]}>
        {categoryMeta.description}
      </Text>
      <Text style={[styles.activeSummary, { color: palette.accent }]}>
        {formatCategoryDefaultsSummary(categoryDefaults)}
      </Text>

      <View style={[styles.fieldGroup, { borderColor: palette.panelBorder }]}>
        <Text style={[styles.fieldLabel, { color: palette.gold }]}>DEFAULT RISK</Text>
        <View style={styles.optionRow}>
          {riskOptions.map((option) => {
            const selected = categoryDefaults.defaultRiskLevel === option.level;
            return (
              <Pressable
                key={option.level}
                onPress={() => {
                  void Haptics.selectionAsync();
                  saveDefaults({
                    defaultRiskLevel: selected ? undefined : option.level,
                  });
                }}
                style={[
                  styles.optionChip,
                  {
                    borderColor: selected ? palette.gold : palette.panelBorder,
                    backgroundColor: selected ? palette.primary : palette.night,
                  },
                ]}>
                <Text style={[styles.optionChipText, { color: selected ? palette.bone : palette.fog }]}>
                  {option.simpleLabel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ToggleDefaultRow
        label="Starter enabled by default"
        value={categoryDefaults.defaultStarterEnabled === true}
        palette={palette}
        onValueChange={(enabled) =>
          saveDefaults({ defaultStarterEnabled: enabled ? true : undefined })
        }
      />

      <View style={[styles.fieldGroup, { borderColor: palette.panelBorder }]}>
        <Text style={[styles.fieldLabel, { color: palette.gold }]}>DEFAULT PREP STEP</Text>
        <TextInput
          value={categoryDefaults.defaultPrepStep ?? ''}
          onChangeText={(text) => saveDefaults({ defaultPrepStep: text })}
          placeholder={getDefaultPrepPreset(category)}
          placeholderTextColor={`${palette.fog}88`}
          style={[
            styles.input,
            { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
          ]}
        />
      </View>

      <View style={[styles.fieldGroup, { borderColor: palette.panelBorder }]}>
        <Text style={[styles.fieldLabel, { color: palette.gold }]}>DEFAULT REWARD</Text>
        <TextInput
          value={categoryDefaults.defaultAfterQuestReward ?? ''}
          onChangeText={(text) => saveDefaults({ defaultAfterQuestReward: text })}
          placeholder="e.g. Rest for 5 minutes"
          placeholderTextColor={`${palette.fog}88`}
          style={[
            styles.input,
            { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
          ]}
        />
      </View>

      <View style={[styles.fieldGroup, { borderColor: palette.panelBorder }]}>
        <Text style={[styles.fieldLabel, { color: palette.gold }]}>DEFAULT PLANNED TIME</Text>
        <TextInput
          value={categoryDefaults.defaultPlannedTimeLabel ?? ''}
          onChangeText={(text) => saveDefaults({ defaultPlannedTimeLabel: text })}
          placeholder="e.g. Morning"
          placeholderTextColor={`${palette.fog}88`}
          style={[
            styles.input,
            { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
          ]}
        />
      </View>

      <View style={[styles.fieldGroup, { borderColor: palette.panelBorder }]}>
        <Text style={[styles.fieldLabel, { color: palette.gold }]}>DEFAULT LOCATION</Text>
        <TextInput
          value={categoryDefaults.defaultPlannedLocation ?? ''}
          onChangeText={(text) => saveDefaults({ defaultPlannedLocation: text })}
          placeholder="e.g. Desk"
          placeholderTextColor={`${palette.fog}88`}
          style={[
            styles.input,
            { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
          ]}
        />
      </View>

      <View style={[styles.fieldGroup, { borderColor: palette.panelBorder }]}>
        <Text style={[styles.fieldLabel, { color: palette.gold }]}>DEFAULT HABIT STACK</Text>
        <TextInput
          value={categoryDefaults.defaultAfterCurrentHabit ?? ''}
          onChangeText={(text) => saveDefaults({ defaultAfterCurrentHabit: text })}
          placeholder="e.g. I finish breakfast"
          placeholderTextColor={`${palette.fog}88`}
          style={[
            styles.input,
            { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
          ]}
        />
      </View>

      <ToggleDefaultRow
        label="Mark as focus by default"
        value={categoryDefaults.defaultMarkAsFocus === true}
        palette={palette}
        onValueChange={(enabled) =>
          saveDefaults({ defaultMarkAsFocus: enabled ? true : undefined })
        }
      />
    </View>
  );
}

function ToggleDefaultRow({
  label,
  value,
  palette,
  onValueChange,
}: {
  label: string;
  value: boolean;
  palette: { panelBorder: string; bone: string; primary: string; gold: string; fog: string };
  onValueChange: (enabled: boolean) => void;
}) {
  return (
    <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
      <Text style={[styles.toggleLabel, { color: palette.bone }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={(enabled) => {
          void Haptics.selectionAsync();
          onValueChange(enabled);
        }}
        trackColor={{ false: palette.panelBorder, true: palette.primary }}
        thumbColor={value ? palette.gold : palette.fog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  intro: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  sectionLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
  },
  presetList: { gap: 8 },
  presetCard: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
    transform: [{ skewX: '-2deg' }],
  },
  presetTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 13,
    letterSpacing: 1,
  },
  presetDescription: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    lineHeight: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chipText: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  categorySummary: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  activeSummary: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  fieldGroup: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 8,
  },
  fieldLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: GameFonts.ui,
    fontSize: 13,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  optionChipText: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  toggleRow: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 0.3,
    flex: 1,
  },
});
