import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { TASK_CATEGORIES, getTaskCategoryMeta } from '@/lib/task-categories';
import {
  hasActiveQuestBoardFilters,
  type QuestBoardFilters,
  type QuestBoardReadinessFilter,
  type QuestBoardRiskFilter,
  type QuestBoardSourceFilter,
} from '@/lib/quest-board-organization';
import { getQuestRiskOptions } from '@/lib/quest-risk';
import type { TaskCategory } from '@/types/narrative';

type QuestBoardFiltersBarProps = {
  filters: QuestBoardFilters;
  onChange: (filters: QuestBoardFilters) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
  palette: {
    bone: string;
    fog: string;
    gold: string;
    panel: string;
    panelBorder: string;
    primary: string;
    night: string;
  };
};

const SOURCE_OPTIONS: Array<{ value: QuestBoardSourceFilter; label: string }> = [
  { value: 'user', label: 'User Quest' },
  { value: 'chapter', label: 'Chapter' },
  { value: 'recurring', label: 'Recurring' },
  { value: 'chain', label: 'Chain Step' },
];

const READINESS_OPTIONS: Array<{ value: QuestBoardReadinessFilter; label: string }> = [
  { value: 'all', label: 'Any readiness' },
  { value: 'ready', label: 'Ready' },
  { value: 'building', label: 'Building' },
  { value: 'none', label: 'Not set' },
];

export function QuestBoardFiltersBar({
  filters,
  onChange,
  expanded,
  onToggleExpanded,
  palette,
}: QuestBoardFiltersBarProps) {
  const active = hasActiveQuestBoardFilters(filters);
  const riskOptions = getQuestRiskOptions();

  const toggleCategory = (category: TaskCategory) => {
    void Haptics.selectionAsync();
    onChange({
      ...filters,
      category: filters.category === category ? null : category,
    });
  };

  const setRisk = (risk: QuestBoardRiskFilter) => {
    void Haptics.selectionAsync();
    onChange({ ...filters, risk });
  };

  const setReadiness = (readiness: QuestBoardReadinessFilter) => {
    void Haptics.selectionAsync();
    onChange({ ...filters, readiness });
  };

  const setSource = (source: QuestBoardSourceFilter | null) => {
    void Haptics.selectionAsync();
    onChange({ ...filters, source });
  };

  const clearFilters = () => {
    void Haptics.selectionAsync();
    onChange({
      category: null,
      risk: 'all',
      readiness: 'all',
      source: null,
    });
  };

  return (
    <View style={[styles.wrap, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
      <Pressable onPress={onToggleExpanded} style={styles.header}>
        <Text style={[styles.headerLabel, { color: palette.bone }]}>
          Filters{active ? ' · active' : ''}
        </Text>
        <Text style={[styles.headerAction, { color: palette.gold }]}>{expanded ? 'Hide' : 'Show'}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          <Text style={[styles.groupLabel, { color: palette.gold }]}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {TASK_CATEGORIES.map((category) => {
              const meta = getTaskCategoryMeta(category);
              const selected = filters.category === category;
              return (
                <FilterChip
                  key={category}
                  label={meta.realWorldLabel}
                  selected={selected}
                  onPress={() => toggleCategory(category)}
                  palette={palette}
                />
              );
            })}
          </ScrollView>

          <Text style={[styles.groupLabel, { color: palette.gold }]}>RISK</Text>
          <View style={styles.chipRowWrap}>
            <FilterChip
              label="Any risk"
              selected={filters.risk === 'all'}
              onPress={() => setRisk('all')}
              palette={palette}
            />
            {riskOptions.map((option) => (
              <FilterChip
                key={option.level}
                label={option.simpleLabel}
                selected={filters.risk === option.level}
                onPress={() => setRisk(option.level)}
                palette={palette}
              />
            ))}
          </View>

          <Text style={[styles.groupLabel, { color: palette.gold }]}>READINESS</Text>
          <View style={styles.chipRowWrap}>
            {READINESS_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                selected={filters.readiness === option.value}
                onPress={() => setReadiness(option.value)}
                palette={palette}
              />
            ))}
          </View>

          <Text style={[styles.groupLabel, { color: palette.gold }]}>SOURCE</Text>
          <View style={styles.chipRowWrap}>
            <FilterChip
              label="Any source"
              selected={filters.source == null}
              onPress={() => setSource(null)}
              palette={palette}
            />
            {SOURCE_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                selected={filters.source === option.value}
                onPress={() => setSource(option.value)}
                palette={palette}
              />
            ))}
          </View>

          {active ? (
            <Pressable onPress={clearFilters} style={styles.clearButton}>
              <Text style={[styles.clearText, { color: palette.fog }]}>Clear filters</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
  palette,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  palette: QuestBoardFiltersBarProps['palette'];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? palette.primary : palette.night,
          borderColor: selected ? palette.gold : palette.panelBorder,
        },
      ]}>
      <Text style={[styles.chipText, { color: selected ? palette.bone : palette.fog }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    transform: [{ skewX: '-1deg' }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    letterSpacing: 0.6,
  },
  headerAction: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 1,
  },
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  groupLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 1.6,
    marginTop: 4,
  },
  chipRow: {
    gap: 6,
    paddingVertical: 2,
  },
  chipRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  clearButton: {
    alignSelf: 'flex-start',
    paddingTop: 4,
  },
  clearText: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },
});
