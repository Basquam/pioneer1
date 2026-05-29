import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GlowButton } from '@/components/rpg/glow-button';
import { CollapsibleSection } from '@/components/rpg/collapsible-section';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import { getLocalDateKey } from '@/lib/daily-streak';
import {
  countTodayUserQuests,
  formatTodayFocusLabel,
  getDailyFocusLimit,
  getDailyFocusOverLimitMessage,
} from '@/lib/daily-focus';
import { getFocusLockCopy } from '@/lib/focus-lock';
import { getTaskCategoryMeta, TASK_CATEGORIES } from '@/lib/task-categories';
import { generateStarterTaskTitle, getStarterToggleCopy } from '@/lib/two-minute-starter';
import {
  getDefaultPrepPreset,
  getPrepPresets,
  getQuestPrepCopy,
  isPrepPreset,
} from '@/lib/quest-prep';
import {
  AFTER_QUEST_REWARD_PRESETS,
  getAfterQuestRewardCopy,
  getDefaultAfterQuestRewardPreset,
  isPresetAfterQuestReward,
} from '@/lib/after-quest-reward';
import {
  getDefaultRecoveryCategory,
  getDefaultRecoveryTaskTitle,
  RECOVERY_QUEST_CATEGORIES,
} from '@/lib/recovery-quest';
import {
  DEFAULT_QUEST_RISK_LEVEL,
  getHighRiskSuggestionLines,
  getQuestRiskFlavorLabel,
  getQuestRiskOptions,
} from '@/lib/quest-risk';
import {
  QUEST_DEFAULTS_APPLIED_COPY,
  resolveAddQuestDefaults,
} from '@/lib/quest-defaults';
import type { QuestRiskLevel, RecurrenceType, TaskCategory, WeekdayKey } from '@/types/narrative';
import {
  getWeekdayKeyForDate,
  WEEKDAY_OPTIONS,
} from '@/lib/recurring-quests';

type AddQuestSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function AddQuestSheet({ visible, onClose }: AddQuestSheetProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse, currentChapter, playerProgress, addUserQuest, addQuestRecoveryMode, isTodayFocusLocked, openQuestPackSheet } = useGame();
  const { palette } = activeUniverse;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('cleaning');
  const [confirmOverLimit, setConfirmOverLimit] = useState(false);
  const [easierToStart, setEasierToStart] = useState(false);
  const [starterTitle, setStarterTitle] = useState('');
  const [prepEnabled, setPrepEnabled] = useState(false);
  const [prepStepTitle, setPrepStepTitle] = useState('');
  const [rewardEnabled, setRewardEnabled] = useState(false);
  const [rewardTitle, setRewardTitle] = useState('');
  const [riskLevel, setRiskLevel] = useState<QuestRiskLevel>(DEFAULT_QUEST_RISK_LEVEL);
  const [behaviorToolsOpen, setBehaviorToolsOpen] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | RecurrenceType>('none');
  const [preferredDays, setPreferredDays] = useState<Set<WeekdayKey>>(new Set());
  const [preferredTimeLabel, setPreferredTimeLabel] = useState('');
  const [markAsFocus, setMarkAsFocus] = useState(false);
  const [plannedTimeLabel, setPlannedTimeLabel] = useState('');
  const [plannedLocation, setPlannedLocation] = useState('');
  const [afterCurrentHabit, setAfterCurrentHabit] = useState('');
  const [planText, setPlanText] = useState('');
  const [defaultsApplied, setDefaultsApplied] = useState(false);

  const starterCopy = getStarterToggleCopy(activeUniverse.id);
  const prepCopy = getQuestPrepCopy(activeUniverse.id);
  const rewardCopy = getAfterQuestRewardCopy(activeUniverse.id);
  const focusLockCopy = getFocusLockCopy(activeUniverse.id);
  const prepPresets = useMemo(() => getPrepPresets(category), [category]);
  const riskOptions = useMemo(() => getQuestRiskOptions(), []);
  const highRiskSuggestions = useMemo(
    () =>
      riskLevel === 'high'
        ? getHighRiskSuggestionLines({
            starterEnabled: easierToStart,
            prepEnabled,
          })
        : [],
    [easierToStart, prepEnabled, riskLevel],
  );
  const categoryOptions = addQuestRecoveryMode ? RECOVERY_QUEST_CATEGORIES : TASK_CATEGORIES;
  const trimmedTitle = title.trim();
  const suggestedStarter = useMemo(
    () => (trimmedTitle ? generateStarterTaskTitle(trimmedTitle, category) : ''),
    [trimmedTitle, category],
  );

  const selectedMeta = getTaskCategoryMeta(category);
  const modalBottomInset = useModalBottomInset(32);
  const focusLimit = getDailyFocusLimit(playerProgress);
  const todayFocusCount = countTodayUserQuests(
    playerProgress.userQuests,
    getLocalDateKey(),
    activeUniverse.id,
  );
  const atFocusLimit = todayFocusCount >= focusLimit;

  const resetForm = () => {
    setTitle('');
    setCategory('cleaning');
    setConfirmOverLimit(false);
    setEasierToStart(false);
    setStarterTitle('');
    setPrepEnabled(false);
    setPrepStepTitle('');
    setRewardEnabled(false);
    setRewardTitle('');
    setRiskLevel(DEFAULT_QUEST_RISK_LEVEL);
    setBehaviorToolsOpen(false);
    setRepeatMode('none');
    setPreferredDays(new Set());
    setPreferredTimeLabel('');
    setMarkAsFocus(false);
    setPlannedTimeLabel('');
    setPlannedLocation('');
    setAfterCurrentHabit('');
    setPlanText('');
    setDefaultsApplied(false);
  };

  const applyCategoryDefaults = (nextCategory: TaskCategory, taskTitle: string) => {
    if (addQuestRecoveryMode) {
      setDefaultsApplied(false);
      return;
    }

    const resolved = resolveAddQuestDefaults(playerProgress.questDefaults, nextCategory, taskTitle);
    const hasDefaults = Object.keys(resolved).length > 0;

    if (resolved.riskLevel) {
      setRiskLevel(resolved.riskLevel);
    }

    if (resolved.starterEnabled != null) {
      setEasierToStart(resolved.starterEnabled);
      setStarterTitle(
        resolved.starterEnabled
          ? resolved.starterTitle ?? generateStarterTaskTitle(taskTitle, nextCategory)
          : '',
      );
    }

    if (resolved.prepEnabled != null) {
      setPrepEnabled(resolved.prepEnabled);
      setPrepStepTitle(resolved.prepEnabled ? resolved.prepStepTitle ?? getDefaultPrepPreset(nextCategory) : '');
    }

    if (resolved.rewardEnabled != null) {
      setRewardEnabled(resolved.rewardEnabled);
      setRewardTitle(resolved.rewardEnabled ? resolved.afterQuestReward ?? getDefaultAfterQuestRewardPreset() : '');
    }

    setPlannedTimeLabel(resolved.plannedTimeLabel ?? '');
    setPlannedLocation(resolved.plannedLocation ?? '');
    setAfterCurrentHabit(resolved.afterCurrentHabit ?? '');
    setPlanText(resolved.implementationIntention ?? '');
    setMarkAsFocus(resolved.focusPinned === true);

    if (hasDefaults) {
      setBehaviorToolsOpen(true);
      setDefaultsApplied(true);
    } else {
      setDefaultsApplied(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const submitQuest = () => {
    if (!trimmedTitle) return;
    const starter = easierToStart ? starterTitle.trim() || suggestedStarter : '';
    const prep = prepEnabled ? prepStepTitle.trim() : '';
    const reward = rewardEnabled ? rewardTitle.trim() : '';
    const todayWeekday = getWeekdayKeyForDate(getLocalDateKey());
    const weeklyDays =
      preferredDays.size > 0 ? Array.from(preferredDays) : [todayWeekday];
    const recurring =
      repeatMode === 'none'
        ? undefined
        : {
            recurrenceType: repeatMode,
            ...(preferredTimeLabel.trim() ? { preferredTimeLabel: preferredTimeLabel.trim() } : {}),
            ...(repeatMode === 'weekly' ? { preferredDays: weeklyDays } : {}),
          };

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addUserQuest(trimmedTitle, category, {
      ...(starter ? { starterTaskTitle: starter } : {}),
      ...(prep ? { prepStepTitle: prep } : {}),
      ...(reward ? { afterQuestReward: reward } : {}),
      riskLevel,
      ...(recurring ? { recurring } : {}),
      ...(plannedTimeLabel.trim() ? { plannedTimeLabel: plannedTimeLabel.trim() } : {}),
      ...(plannedLocation.trim() ? { plannedLocation: plannedLocation.trim() } : {}),
      ...(afterCurrentHabit.trim() ? { afterCurrentHabit: afterCurrentHabit.trim() } : {}),
      ...(planText.trim() ? { implementationIntention: planText.trim() } : {}),
      ...(markAsFocus ? { focusPinned: true } : {}),
    });
    resetForm();
  };

  const handleCreate = () => {
    if (!trimmedTitle) return;
    if (atFocusLimit && !confirmOverLimit) {
      setConfirmOverLimit(true);
      return;
    }
    submitQuest();
  };

  const handleToggleEasier = (enabled: boolean) => {
    void Haptics.selectionAsync();
    setEasierToStart(enabled);
    if (enabled) {
      setStarterTitle(suggestedStarter);
    } else {
      setStarterTitle('');
    }
  };

  const handleTogglePrep = (enabled: boolean) => {
    void Haptics.selectionAsync();
    setPrepEnabled(enabled);
    if (enabled) {
      setPrepStepTitle(getDefaultPrepPreset(category));
    } else {
      setPrepStepTitle('');
    }
  };

  const handleToggleReward = (enabled: boolean) => {
    void Haptics.selectionAsync();
    setRewardEnabled(enabled);
    if (enabled) {
      setRewardTitle(getDefaultAfterQuestRewardPreset());
    } else {
      setRewardTitle('');
    }
  };

  useEffect(() => {
    if (visible) return;
    resetForm();
  }, [visible]);

  useEffect(() => {
    if (!visible || addQuestRecoveryMode) return;
    applyCategoryDefaults(category, trimmedTitle);
  }, [category, visible, addQuestRecoveryMode, playerProgress.questDefaults]);

  useEffect(() => {
    if (!visible || addQuestRecoveryMode || !defaultsApplied || !trimmedTitle) return;
    const resolved = resolveAddQuestDefaults(playerProgress.questDefaults, category, trimmedTitle);
    if (resolved.starterEnabled) {
      setStarterTitle(resolved.starterTitle ?? generateStarterTaskTitle(trimmedTitle, category));
    }
    if (resolved.implementationIntention) {
      setPlanText(resolved.implementationIntention);
    }
  }, [
    trimmedTitle,
    defaultsApplied,
    category,
    visible,
    addQuestRecoveryMode,
    playerProgress.questDefaults,
  ]);

  useEffect(() => {
    if (!visible || !addQuestRecoveryMode) return;

    const recoveryCategory = getDefaultRecoveryCategory();
    const recoveryTitle = getDefaultRecoveryTaskTitle(recoveryCategory);
    setEasierToStart(true);
    setCategory(recoveryCategory);
    setTitle(recoveryTitle);
    setStarterTitle(generateStarterTaskTitle(recoveryTitle, recoveryCategory));
    setPrepEnabled(false);
    setPrepStepTitle('');
    setRewardEnabled(false);
    setRewardTitle('');
    setBehaviorToolsOpen(true);
  }, [visible, addQuestRecoveryMode]);

  useEffect(() => {
    if (!easierToStart || !trimmedTitle) return;
    setStarterTitle(suggestedStarter);
  }, [easierToStart, suggestedStarter, trimmedTitle]);

  useEffect(() => {
    if (!prepEnabled) return;
    const isKnownPreset = prepStepTitle.trim().length > 0 &&
      TASK_CATEGORIES.some((cat) => isPrepPreset(prepStepTitle, cat));
    if (!prepStepTitle.trim() || (isKnownPreset && !isPrepPreset(prepStepTitle, category))) {
      setPrepStepTitle(getDefaultPrepPreset(category));
    }
  }, [category, prepEnabled, prepStepTitle]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={handleClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: palette.night, borderColor: palette.panelBorder, maxHeight: GameLayout.modalMaxHeight },
          ]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.sheetScroll, { paddingBottom: modalBottomInset }]}>
            <View style={styles.header}>
              <Text style={[styles.eyebrow, { color: palette.gold }]}>{ui.addQuestSheetEyebrow}</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text style={[styles.close, { color: palette.fog }]}>✕</Text>
              </Pressable>
            </View>

            <Text style={[styles.title, { color: palette.bone }]}>{ui.addQuestSheetTitle}</Text>
            <Text style={[styles.sub, { color: palette.fog }]} numberOfLines={2}>
              {ui.addQuestSubtitle(currentChapter?.title)}
            </Text>

            <Pressable
              onPress={() => {
                void Haptics.selectionAsync();
                openQuestPackSheet();
              }}
              style={[styles.packEntry, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
              <Text style={[styles.packEntryLabel, { color: palette.gold }]}>SUGGESTED QUEST PACKS</Text>
              <Text style={[styles.packEntryHint, { color: palette.fog }]}>
                Add 2–3 quests at once — Morning Reset, Deep Work, and more.
              </Text>
            </Pressable>

            <View style={[styles.focusRow, { borderColor: palette.panelBorder }]}>
              <Text style={[styles.focusLabel, { color: palette.gold }]}>
                {formatTodayFocusLabel(todayFocusCount, focusLimit, activeUniverse.id)}
              </Text>
              <Text style={[styles.focusHint, { color: palette.fog }]}>
                {todayFocusCount < focusLimit
                  ? ui.addQuestFocusHintUnder
                  : ui.addQuestFocusHintOver}
              </Text>
            </View>

            {confirmOverLimit && (
              <View style={[styles.warningBox, { backgroundColor: palette.panel, borderColor: palette.accent }]}>
                <Text style={[styles.warningText, { color: palette.bone }]}>
                  {getDailyFocusOverLimitMessage(focusLimit, activeUniverse.id)}
                </Text>
              </View>
            )}

            {isTodayFocusLocked && (
              <View style={[styles.focusLockedBox, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
                <Text style={[styles.focusLockedText, { color: palette.bone }]}>
                  {focusLockCopy.addQuestLockedHint}
                </Text>
              </View>
            )}

            <Text style={[styles.label, { color: palette.gold }]}>{ui.realTaskLabel}</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Clean kitchen"
              placeholderTextColor={`${palette.fog}88`}
              style={[
                styles.input,
                { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
              ]}
              autoFocus
            />

            {addQuestRecoveryMode && (
              <View style={[styles.recoveryHintBox, { borderColor: palette.gold, backgroundColor: palette.panel }]}>
                <Text style={[styles.recoveryHint, { color: palette.bone }]}>
                  Recovery quest — pick a tiny task and start with the 2-minute version.
                </Text>
              </View>
            )}

            <Text style={[styles.label, { color: palette.gold }]}>{ui.addQuestTypeLabel}</Text>
            <Text style={[styles.categoryHelper, { color: palette.fog }]}>
              Pick a type — we weave it into the saga.
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {categoryOptions.map((cat) => {
                const selected = category === cat;
                const meta = getTaskCategoryMeta(cat);
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setCategory(cat);
                      if (addQuestRecoveryMode) {
                        const recoveryTitle = getDefaultRecoveryTaskTitle(cat);
                        setTitle(recoveryTitle);
                        setEasierToStart(true);
                        setStarterTitle(generateStarterTaskTitle(recoveryTitle, cat));
                      } else {
                        applyCategoryDefaults(cat, trimmedTitle);
                      }
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected ? palette.primary : palette.panel,
                        borderColor: selected ? palette.gold : palette.panelBorder,
                      },
                    ]}>
                    <Text style={[styles.chipIcon, { color: selected ? palette.bone : palette.fog }]}>
                      {meta.icon}
                    </Text>
                    <Text
                      style={[styles.chipFlavor, { color: selected ? palette.bone : palette.fog }]}
                      numberOfLines={2}>
                      {meta.label}
                    </Text>
                    <Text
                      style={[
                        styles.chipRealWorld,
                        { color: selected ? palette.gold : `${palette.fog}cc` },
                      ]}
                      numberOfLines={2}>
                      {meta.realWorldLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Text style={[styles.categoryHint, { color: palette.fog }]}>{selectedMeta.description}</Text>

            {defaultsApplied && !addQuestRecoveryMode ? (
              <Text style={[styles.defaultsHint, { color: palette.accent }]}>{QUEST_DEFAULTS_APPLIED_COPY}</Text>
            ) : null}

            <Text style={[styles.label, { color: palette.gold }]}>REPEAT THIS QUEST</Text>
            <View style={styles.repeatOptions}>
              {(
                [
                  { id: 'none', label: 'No repeat' },
                  { id: 'daily', label: 'Daily' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                ] as const
              ).map((option) => {
                const selected = repeatMode === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setRepeatMode(option.id);
                      if (option.id !== 'weekly') {
                        setPreferredDays(new Set());
                      }
                    }}
                    style={[
                      styles.repeatChip,
                      {
                        backgroundColor: selected ? palette.primary : palette.panel,
                        borderColor: selected ? palette.gold : palette.panelBorder,
                      },
                    ]}>
                    <Text style={[styles.repeatChipText, { color: selected ? palette.bone : palette.fog }]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {repeatMode === 'weekly' && (
              <View style={styles.weekdayRow}>
                {WEEKDAY_OPTIONS.map((day) => {
                  const selected = preferredDays.has(day.key);
                  return (
                    <Pressable
                      key={day.key}
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setPreferredDays((prev) => {
                          const next = new Set(prev);
                          if (next.has(day.key)) {
                            next.delete(day.key);
                          } else {
                            next.add(day.key);
                          }
                          return next;
                        });
                      }}
                      style={[
                        styles.weekdayChip,
                        {
                          backgroundColor: selected ? palette.primary : palette.night,
                          borderColor: selected ? palette.gold : palette.panelBorder,
                        },
                      ]}>
                      <Text style={[styles.weekdayChipText, { color: selected ? palette.bone : palette.fog }]}>
                        {day.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {repeatMode !== 'none' && (
              <>
                <Text style={[styles.repeatHint, { color: palette.fog }]}>
                  {repeatMode === 'weekly'
                    ? 'Pick days for this routine. If none selected, today’s weekday is used.'
                    : repeatMode === 'monthly'
                      ? 'Generates on the same day of the month you create it.'
                      : 'Generates a fresh quest each day under Your Quests.'}
                </Text>
                <TextInput
                  value={preferredTimeLabel}
                  onChangeText={setPreferredTimeLabel}
                  placeholder="Preferred time (optional) — e.g. Morning"
                  placeholderTextColor={`${palette.fog}88`}
                  style={[
                    styles.input,
                    { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
                  ]}
                />
              </>
            )}

            <CollapsibleSection
              title="Optional behavior tools"
              hint="Starter, prep, risk, and rewards — expand if helpful."
              expanded={behaviorToolsOpen}
              onToggle={() => setBehaviorToolsOpen((open) => !open)}
              palette={palette}>
              <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
                <View style={styles.toggleCopy}>
                  <Text style={[styles.toggleLabel, { color: palette.bone }]}>{starterCopy.toggleLabel}</Text>
                  <Text style={[styles.toggleHint, { color: palette.fog }]}>{starterCopy.universeHint}</Text>
                </View>
                <Switch
                  value={easierToStart}
                  onValueChange={handleToggleEasier}
                  trackColor={{ false: palette.panelBorder, true: palette.primary }}
                  thumbColor={easierToStart ? palette.gold : palette.fog}
                />
              </View>

              {easierToStart && (
                <View style={[styles.starterBox, { backgroundColor: palette.night, borderColor: palette.gold }]}>
                  <Text style={[styles.starterLabel, { color: palette.gold }]}>STARTER TASK</Text>
                  <TextInput
                    value={starterTitle}
                    onChangeText={setStarterTitle}
                    placeholder={suggestedStarter}
                    placeholderTextColor={`${palette.fog}88`}
                    style={[
                      styles.input,
                      { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
                    ]}
                  />
                  <Text style={[styles.starterHint, { color: palette.fog }]}>
                    Main task stays: {trimmedTitle || 'enter a task above'}
                  </Text>
                </View>
              )}

              <Text style={[styles.toolsLabel, { color: palette.gold }]}>QUEST RISK</Text>
              <View style={styles.riskOptions}>
                {riskOptions.map((option) => {
                  const selected = riskLevel === option.level;
                  const flavorLabel = getQuestRiskFlavorLabel(option.level, activeUniverse.id);
                  return (
                    <Pressable
                      key={option.level}
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setRiskLevel(option.level);
                      }}
                      style={[
                        styles.riskChip,
                        {
                          backgroundColor: selected ? palette.primary : palette.night,
                          borderColor: selected ? palette.gold : palette.panelBorder,
                        },
                      ]}>
                      <Text style={[styles.riskSimple, { color: selected ? palette.bone : palette.fog }]}>
                        {option.simpleLabel}
                      </Text>
                      <Text style={[styles.riskFlavor, { color: selected ? palette.gold : `${palette.fog}cc` }]}>
                        {flavorLabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {highRiskSuggestions.length > 0 && (
                <View style={[styles.highRiskBox, { backgroundColor: palette.night, borderColor: palette.accent }]}>
                  {highRiskSuggestions.map((line) => (
                    <Text key={line} style={[styles.highRiskLine, { color: palette.bone }]}>
                      · {line}
                    </Text>
                  ))}
                </View>
              )}

              <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
                <View style={styles.toggleCopy}>
                  <Text style={[styles.toggleLabel, { color: palette.bone }]}>{prepCopy.sectionLabel}</Text>
                  <Text style={[styles.toggleHint, { color: palette.fog }]}>{prepCopy.helperText}</Text>
                </View>
                <Switch
                  value={prepEnabled}
                  onValueChange={handleTogglePrep}
                  trackColor={{ false: palette.panelBorder, true: palette.primary }}
                  thumbColor={prepEnabled ? palette.gold : palette.fog}
                />
              </View>

              {prepEnabled && (
                <View style={[styles.prepBox, { backgroundColor: palette.night, borderColor: palette.gold }]}>
                  <Text style={[styles.prepLabel, { color: palette.gold }]}>PREP STEP</Text>
                  <View style={styles.presetList}>
                    {prepPresets.map((preset) => {
                      const selected = prepStepTitle === preset;
                      return (
                        <Pressable
                          key={preset}
                          onPress={() => {
                            void Haptics.selectionAsync();
                            setPrepStepTitle(preset);
                          }}
                          style={[
                            styles.presetChip,
                            {
                              backgroundColor: selected ? palette.primary : palette.panel,
                              borderColor: selected ? palette.gold : palette.panelBorder,
                            },
                          ]}>
                          <Text
                            style={[styles.presetChipText, { color: selected ? palette.bone : palette.fog }]}
                            numberOfLines={3}>
                            {preset}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <TextInput
                    value={prepStepTitle}
                    onChangeText={setPrepStepTitle}
                    placeholder={getDefaultPrepPreset(category)}
                    placeholderTextColor={`${palette.fog}88`}
                    style={[
                      styles.input,
                      { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
                    ]}
                  />
                </View>
              )}

              <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
                <View style={styles.toggleCopy}>
                  <Text style={[styles.toggleLabel, { color: palette.bone }]}>{rewardCopy.sectionPrompt}</Text>
                  <Text style={[styles.toggleHint, { color: palette.fog }]}>{rewardCopy.helperText}</Text>
                </View>
                <Switch
                  value={rewardEnabled}
                  onValueChange={handleToggleReward}
                  trackColor={{ false: palette.panelBorder, true: palette.primary }}
                  thumbColor={rewardEnabled ? palette.gold : palette.fog}
                />
              </View>

              {rewardEnabled && (
                <View style={[styles.prepBox, { backgroundColor: palette.night, borderColor: palette.gold }]}>
                  <Text style={[styles.prepLabel, { color: palette.gold }]}>REWARD RITUAL</Text>
                  <View style={styles.presetList}>
                    {AFTER_QUEST_REWARD_PRESETS.map((preset) => {
                      const selected = rewardTitle === preset;
                      return (
                        <Pressable
                          key={preset}
                          onPress={() => {
                            void Haptics.selectionAsync();
                            setRewardTitle(preset);
                          }}
                          style={[
                            styles.presetChip,
                            {
                              backgroundColor: selected ? palette.primary : palette.panel,
                              borderColor: selected ? palette.gold : palette.panelBorder,
                            },
                          ]}>
                          <Text
                            style={[styles.presetChipText, { color: selected ? palette.bone : palette.fog }]}
                            numberOfLines={2}>
                            {preset}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <TextInput
                    value={isPresetAfterQuestReward(rewardTitle) ? '' : rewardTitle}
                    onChangeText={setRewardTitle}
                    placeholder="Your own reward…"
                    placeholderTextColor={`${palette.fog}88`}
                    style={[
                      styles.input,
                      { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
                    ]}
                  />
                </View>
              )}

              {(plannedTimeLabel || plannedLocation || afterCurrentHabit || planText || markAsFocus) && (
                <View style={[styles.prepBox, { backgroundColor: palette.night, borderColor: palette.panelBorder }]}>
                  <Text style={[styles.prepLabel, { color: palette.gold }]}>PLAN CONTEXT</Text>
                  <TextInput
                    value={plannedTimeLabel}
                    onChangeText={setPlannedTimeLabel}
                    placeholder="Planned time (optional)"
                    placeholderTextColor={`${palette.fog}88`}
                    style={[
                      styles.input,
                      { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
                    ]}
                  />
                  <TextInput
                    value={plannedLocation}
                    onChangeText={setPlannedLocation}
                    placeholder="Planned location (optional)"
                    placeholderTextColor={`${palette.fog}88`}
                    style={[
                      styles.input,
                      { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
                    ]}
                  />
                  <TextInput
                    value={afterCurrentHabit}
                    onChangeText={setAfterCurrentHabit}
                    placeholder="After current habit (optional)"
                    placeholderTextColor={`${palette.fog}88`}
                    style={[
                      styles.input,
                      { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
                    ]}
                  />
                  <TextInput
                    value={planText}
                    onChangeText={setPlanText}
                    placeholder="Implementation plan (optional)"
                    placeholderTextColor={`${palette.fog}88`}
                    style={[
                      styles.input,
                      { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
                    ]}
                  />
                  <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
                    <Text style={[styles.toggleLabel, { color: palette.bone }]}>Mark as daily focus</Text>
                    <Switch
                      value={markAsFocus}
                      onValueChange={(enabled) => {
                        void Haptics.selectionAsync();
                        setMarkAsFocus(enabled);
                      }}
                      trackColor={{ false: palette.panelBorder, true: palette.primary }}
                      thumbColor={markAsFocus ? palette.gold : palette.fog}
                    />
                  </View>
                </View>
              )}
            </CollapsibleSection>

            <GlowButton
              label={confirmOverLimit ? 'CONTINUE ANYWAY' : ui.addQuestCreateLabel}
              hint={confirmOverLimit ? ui.addQuestConfirmOverLimitHint : ui.addQuestCreateHint}
              onPress={handleCreate}
            />
            {confirmOverLimit && (
              <Pressable onPress={() => setConfirmOverLimit(false)} style={styles.cancelLink}>
                <Text style={[styles.cancelText, { color: palette.fog }]}>GO BACK</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  dismissArea: { flex: 1 },
  sheet: {
    borderTopWidth: 1,
    transform: [{ skewX: '-1deg' }],
  },
  sheetScroll: {
    paddingHorizontal: GameLayout.screenPaddingHorizontal,
    paddingTop: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 3 },
  close: { fontFamily: GameFonts.ui, fontSize: 18 },
  title: { fontFamily: GameFonts.display, fontSize: 24, lineHeight: 30 },
  sub: { fontFamily: GameFonts.displayRegular, fontSize: 13, fontStyle: 'italic', marginBottom: 4, lineHeight: 19 },
  packEntry: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
    marginBottom: 4,
  },
  packEntryLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 2,
  },
  packEntryHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    lineHeight: 14,
  },
  focusRow: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 10,
    gap: 2,
  },
  focusLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  focusHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  warningBox: {
    borderWidth: 1,
    padding: 12,
    transform: [{ skewX: '-2deg' }],
  },
  warningText: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  cancelLink: { alignItems: 'center', paddingVertical: 4 },
  cancelText: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2 },
  label: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2, marginTop: 4 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: GameFonts.ui,
    fontSize: 15,
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
  toggleCopy: { flex: 1, gap: 4 },
  toggleLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  toggleHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  toggleUniverseHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
    lineHeight: 14,
    fontStyle: 'italic',
    marginTop: 2,
  },
  starterBox: {
    borderWidth: 1,
    padding: 12,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  starterLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 2,
  },
  starterHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.3,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  prepBox: {
    borderWidth: 1,
    padding: 12,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  prepLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 2,
  },
  presetList: { gap: 8 },
  presetChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    transform: [{ skewX: '-2deg' }],
  },
  presetChipText: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 0.3,
    lineHeight: 17,
  },
  prepCustomLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1,
  },
  recoveryHintBox: {
    borderWidth: 1,
    padding: 12,
    transform: [{ skewX: '-2deg' }],
  },
  recoveryHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  focusLockedBox: {
    borderWidth: 1,
    padding: 12,
    transform: [{ skewX: '-2deg' }],
  },
  focusLockedText: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  chips: { gap: 8, paddingVertical: 4 },
  categoryHelper: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.3,
    lineHeight: 16,
    marginTop: -4,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 96,
    maxWidth: 120,
    transform: [{ skewX: '-6deg' }],
    alignItems: 'center',
    gap: 2,
  },
  chipIcon: { fontSize: 14, marginBottom: 2 },
  chipFlavor: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 13,
  },
  chipRealWorld: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 12,
  },
  categoryHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
    marginTop: -4,
  },
  defaultsHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.4,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  repeatOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  repeatChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    transform: [{ skewX: '-2deg' }],
  },
  repeatChipText: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 1,
  },
  weekdayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  weekdayChip: {
    borderWidth: 1,
    minWidth: 42,
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  weekdayChipText: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  repeatHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  toolsLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 2,
  },
  riskOptions: {
    gap: 8,
  },
  riskChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
    transform: [{ skewX: '-2deg' }],
  },
  riskSimple: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 1,
  },
  riskFlavor: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  riskDescription: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  highRiskBox: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
  highRiskTitle: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 2,
  },
  highRiskLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
