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
import { MascotGuideFromContext } from '@/components/rpg/mascot-guide-card';
import { CollapsibleSection } from '@/components/rpg/collapsible-section';
import {
  FeatureDiscoveryBadge,
  FeatureDiscoveryHint,
  FeatureDiscoveryTeaser,
} from '@/components/rpg/feature-discovery-badge';
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
  getDefaultPreQuestRitualPreset,
  getPreQuestRitualCopy,
  isPresetPreQuestRitual,
  PRE_QUEST_RITUAL_PRESETS,
} from '@/lib/pre-quest-ritual';
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
  resolveAddQuestDefaults,
  QUEST_DEFAULTS_APPLIED_COPY,
} from '@/lib/quest-defaults';
import {
  mergeResolvedAddQuestDefaults,
  resolveQuestStyleAddQuestDefaults,
} from '@/lib/quest-style-profile';
import { suggestTaskCategory } from '@/lib/suggest-task-category';
import {
  getQuestSuiteById,
  QUEST_SUITES,
} from '@/constants/quest-suites';
import { resolveInventoryAwareSuitePrefill } from '@/lib/inventory-item-effects';
import { formatTraitSuggestionLabel } from '@/lib/trait-aligned-suggestions';
import type { QuestRiskLevel, QuestSuiteId, RecurrenceType, TaskCategory, WeekdayKey } from '@/types/narrative';
import {
  getWeekdayKeyForDate,
  WEEKDAY_OPTIONS,
} from '@/lib/recurring-quests';
import { QuestReminderPicker } from '@/components/rpg/quest-reminder-picker';
import { requestLocalReminderPermissions } from '@/lib/local-notifications';
import {
  buildQuestReminderFields,
  type QuestReminderSelection,
} from '@/lib/quest-reminders';
import {
  getAddQuestBehaviorToolsHint,
  getFeatureIntroHint,
  getFeatureUnlockTeaser,
  getFeatureDiscoveryState,
  getNewlyIntroducedFeaturesInAddQuest,
  isFeatureNewlyIntroduced,
  isFeatureUnlocked,
  isGuidedFeatureDiscoveryActive,
} from '@/lib/feature-discovery';

type AddQuestSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function AddQuestSheet({ visible, onClose }: AddQuestSheetProps) {
  const ui = useUniverseUiCopy();
  const {
    activeUniverse,
    currentChapter,
    playerProgress,
    addUserQuest,
    addQuestRecoveryMode,
    addQuestInboxPrefill,
    addQuestTraitSuggestionPrefill,
    isTodayFocusLocked,
    openQuestPackSheet,
    setShowAdvancedFeatureTools,
  } = useGame();
  const { palette } = activeUniverse;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory | null>(null);
  const [categoryManuallySelected, setCategoryManuallySelected] = useState(false);
  const [suiteId, setSuiteId] = useState<QuestSuiteId | null>(null);
  const [suiteManuallySelected, setSuiteManuallySelected] = useState(false);
  const [confirmOverLimit, setConfirmOverLimit] = useState(false);
  const [easierToStart, setEasierToStart] = useState(false);
  const [starterTitle, setStarterTitle] = useState('');
  const [prepEnabled, setPrepEnabled] = useState(false);
  const [prepStepTitle, setPrepStepTitle] = useState('');
  const [rewardEnabled, setRewardEnabled] = useState(false);
  const [rewardTitle, setRewardTitle] = useState('');
  const [preQuestRitualEnabled, setPreQuestRitualEnabled] = useState(false);
  const [preQuestRitualTitle, setPreQuestRitualTitle] = useState('');
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
  const [reminderSelection, setReminderSelection] = useState<QuestReminderSelection>('none');
  const [reminderCustomTime, setReminderCustomTime] = useState('');
  const [defaultsApplied, setDefaultsApplied] = useState(false);

  const starterCopy = getStarterToggleCopy(activeUniverse.id);
  const prepCopy = getQuestPrepCopy(activeUniverse.id);
  const rewardCopy = getAfterQuestRewardCopy(activeUniverse.id);
  const preQuestRitualCopy = getPreQuestRitualCopy(activeUniverse.id);
  const focusLockCopy = getFocusLockCopy(activeUniverse.id);
  const prepPresets = useMemo(() => (category ? getPrepPresets(category) : []), [category]);
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
  const suggestedTaskCategory = useMemo(
    () => (trimmedTitle ? suggestTaskCategory(trimmedTitle) : null),
    [trimmedTitle],
  );
  const showCategorySuggestion =
    !addQuestRecoveryMode &&
    !addQuestTraitSuggestionPrefill &&
    !categoryManuallySelected &&
    suggestedTaskCategory != null &&
    category !== suggestedTaskCategory;
  const suggestedStarter = useMemo(
    () => (trimmedTitle && category ? generateStarterTaskTitle(trimmedTitle, category) : ''),
    [trimmedTitle, category],
  );

  const selectedMeta = category ? getTaskCategoryMeta(category) : null;
  const selectedSuite = suiteId ? getQuestSuiteById(suiteId) : null;
  const suggestedSuiteId = useMemo(
    () =>
      resolveInventoryAwareSuitePrefill(playerProgress, activeUniverse.id, {
        category,
        activeSuiteId: playerProgress.activeSuiteId,
        title: trimmedTitle,
      }),
    [activeUniverse.id, category, playerProgress, trimmedTitle],
  );
  const showSuiteSuggestion =
    !suiteManuallySelected &&
    suggestedSuiteId != null &&
    suiteId !== suggestedSuiteId &&
    category != null;
  const modalBottomInset = useModalBottomInset(32);
  const focusLimit = getDailyFocusLimit(playerProgress);
  const todayFocusCount = countTodayUserQuests(
    playerProgress.userQuests,
    getLocalDateKey(),
    activeUniverse.id,
  );
  const atFocusLimit = todayFocusCount >= focusLimit;

  const discoveryState = useMemo(
    () => getFeatureDiscoveryState(playerProgress),
    [playerProgress],
  );
  const guidedDiscoveryActive = useMemo(
    () => isGuidedFeatureDiscoveryActive(playerProgress),
    [playerProgress],
  );
  const showStarterTools = isFeatureUnlocked(playerProgress, 'starterMove');
  const showPrepTools = isFeatureUnlocked(playerProgress, 'prepStep');
  const showRewardTools = isFeatureUnlocked(playerProgress, 'rewardRitual');
  const showRiskTools = isFeatureUnlocked(playerProgress, 'riskLevel');
  const showFocusTools = isFeatureUnlocked(playerProgress, 'focusMode');
  const showRepeatTools = isFeatureUnlocked(playerProgress, 'recurringQuest');
  const behaviorToolsHint = useMemo(
    () => getAddQuestBehaviorToolsHint(playerProgress),
    [playerProgress],
  );
  const newlyIntroducedTools = useMemo(
    () => getNewlyIntroducedFeaturesInAddQuest(playerProgress),
    [playerProgress],
  );
  const hasNewBehaviorTools = newlyIntroducedTools.length > 0;

  const resetForm = () => {
    setTitle('');
    setCategory(null);
    setCategoryManuallySelected(false);
    setSuiteId(null);
    setSuiteManuallySelected(false);
    setConfirmOverLimit(false);
    setEasierToStart(false);
    setStarterTitle('');
    setPrepEnabled(false);
    setPrepStepTitle('');
    setRewardEnabled(false);
    setRewardTitle('');
    setPreQuestRitualEnabled(false);
    setPreQuestRitualTitle('');
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
    setReminderSelection('none');
    setReminderCustomTime('');
    setDefaultsApplied(false);
  };

  const applyCategoryDefaults = (nextCategory: TaskCategory, taskTitle: string) => {
    if (addQuestRecoveryMode) {
      setDefaultsApplied(false);
      return;
    }

    const styleResolved = resolveQuestStyleAddQuestDefaults(
      playerProgress.questStyleProfile,
      nextCategory,
      taskTitle,
    );
    const defaultsResolved = resolveAddQuestDefaults(playerProgress.questDefaults, nextCategory, taskTitle);
    const resolved = mergeResolvedAddQuestDefaults(styleResolved, defaultsResolved);
    const hasDefaults = Object.keys(resolved).length > 0;
    const hasStyleDefaults = Object.keys(styleResolved).length > 0;

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

    if (hasDefaults || hasStyleDefaults) {
      setBehaviorToolsOpen(true);
      setDefaultsApplied(hasDefaults);
    } else {
      setDefaultsApplied(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleApplySuggestedCategory = () => {
    if (!suggestedTaskCategory) return;

    void Haptics.selectionAsync();
    setCategory(suggestedTaskCategory);
    setCategoryManuallySelected(true);
    applyCategoryDefaults(suggestedTaskCategory, trimmedTitle);
  };

  useEffect(() => {
    if (!visible || suiteManuallySelected) return;

    const nextSuite = resolveInventoryAwareSuitePrefill(playerProgress, activeUniverse.id, {
      category,
      activeSuiteId: playerProgress.activeSuiteId,
      title: trimmedTitle,
    });
    setSuiteId(nextSuite);
  }, [activeUniverse.id, category, playerProgress, suiteManuallySelected, trimmedTitle, visible]);

  const submitQuest = () => {
    if (!trimmedTitle || !category || !suiteId) return;
    const starter = easierToStart ? starterTitle.trim() || suggestedStarter : '';
    const prep = prepEnabled ? prepStepTitle.trim() : '';
    const reward = rewardEnabled ? rewardTitle.trim() : '';
    const preQuestRitual = preQuestRitualEnabled ? preQuestRitualTitle.trim() : '';
    const reminderFields = buildQuestReminderFields(reminderSelection, reminderCustomTime);
    const remindersGloballyEnabled =
      playerProgress.reminderPreferences?.remindersEnabled === true;

    if (reminderFields.reminderEnabled && remindersGloballyEnabled) {
      void requestLocalReminderPermissions();
    }

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
      suiteId,
      ...(starter ? { starterTaskTitle: starter } : {}),
      ...(prep ? { prepStepTitle: prep } : {}),
      ...(reward ? { afterQuestReward: reward } : {}),
      ...(preQuestRitual ? { preQuestRitual } : {}),
      riskLevel,
      ...(recurring ? { recurring } : {}),
      ...(plannedTimeLabel.trim() ? { plannedTimeLabel: plannedTimeLabel.trim() } : {}),
      ...(plannedLocation.trim() ? { plannedLocation: plannedLocation.trim() } : {}),
      ...(afterCurrentHabit.trim() ? { afterCurrentHabit: afterCurrentHabit.trim() } : {}),
      ...(planText.trim() ? { implementationIntention: planText.trim() } : {}),
      ...(markAsFocus ? { focusPinned: true } : {}),
      ...(reminderFields.reminderEnabled
        ? {
            reminderEnabled: true,
            ...(reminderFields.reminderTime ? { reminderTime: reminderFields.reminderTime } : {}),
            ...(reminderFields.reminderLabel ? { reminderLabel: reminderFields.reminderLabel } : {}),
          }
        : {}),
      ...(addQuestInboxPrefill?.inboxItemId
        ? { convertFromInboxItemId: addQuestInboxPrefill.inboxItemId }
        : {}),
    });
    resetForm();
  };

  const handleCreate = () => {
    if (!trimmedTitle || !category || !suiteId) return;
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
    if (enabled && category) {
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

  const handleTogglePreQuestRitual = (enabled: boolean) => {
    void Haptics.selectionAsync();
    setPreQuestRitualEnabled(enabled);
    if (enabled) {
      setPreQuestRitualTitle(getDefaultPreQuestRitualPreset());
    } else {
      setPreQuestRitualTitle('');
    }
  };

  useEffect(() => {
    if (visible) return;
    resetForm();
  }, [visible]);

  useEffect(() => {
    if (!visible || !addQuestInboxPrefill || addQuestRecoveryMode || addQuestTraitSuggestionPrefill) return;

    setTitle(addQuestInboxPrefill.title);
    setCategoryManuallySelected(false);
    if (addQuestInboxPrefill.suggestedCategory) {
      setCategory(addQuestInboxPrefill.suggestedCategory);
    } else {
      setCategory(null);
    }
    setBehaviorToolsOpen(true);
  }, [visible, addQuestInboxPrefill, addQuestRecoveryMode, addQuestTraitSuggestionPrefill]);

  useEffect(() => {
    if (!visible || !addQuestTraitSuggestionPrefill || addQuestRecoveryMode) return;

    const prefill = addQuestTraitSuggestionPrefill;
    setTitle(prefill.title);
    setCategory(prefill.category);
    setCategoryManuallySelected(true);
    setEasierToStart(prefill.enableStarter);
    if (prefill.enableStarter) {
      setStarterTitle(generateStarterTaskTitle(prefill.title, prefill.category));
    } else {
      setStarterTitle('');
    }
    setBehaviorToolsOpen(true);
  }, [visible, addQuestTraitSuggestionPrefill, addQuestRecoveryMode]);

  useEffect(() => {
    if (!visible || addQuestRecoveryMode || category == null) return;
    applyCategoryDefaults(category, trimmedTitle);
  }, [category, visible, addQuestRecoveryMode, playerProgress.questDefaults, playerProgress.questStyleProfile]);

  useEffect(() => {
    if (!visible || addQuestRecoveryMode || !defaultsApplied || !trimmedTitle || category == null) return;
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
    setCategoryManuallySelected(true);
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
    if (!prepEnabled || category == null) return;
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
            { backgroundColor: palette.night, borderColor: palette.panelBorder, maxHeight: GameLayout.modalMaxHeight, flexShrink: 1 },
          ]}>
          <ScrollView
            style={styles.sheetScrollView}
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

            {visible && playerProgress.userQuests.length === 0 && !addQuestRecoveryMode ? (
              <MascotGuideFromContext
                contextId="add_quest_first_time"
                screenName="/add-quest-sheet"
                expandableDetail="Chapter bounties are story missions tied to the current chapter. Personal quests are yours — they do not replace bounties."
              />
            ) : null}

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

            {addQuestTraitSuggestionPrefill ? (
              <View
                style={[
                  styles.traitSuggestionBox,
                  { borderColor: palette.gold, backgroundColor: palette.panel },
                ]}>
                <Text style={[styles.traitSuggestionLabel, { color: palette.gold }]}>
                  Building toward: {formatTraitSuggestionLabel(addQuestTraitSuggestionPrefill.traitKey)}
                </Text>
                <Text style={[styles.traitSuggestionReason, { color: palette.fog }]}>
                  {addQuestTraitSuggestionPrefill.reason}
                </Text>
              </View>
            ) : null}

            {showCategorySuggestion && suggestedTaskCategory ? (
              <View
                style={[
                  styles.categorySuggestionBox,
                  { borderColor: palette.panelBorder, backgroundColor: palette.panel },
                ]}>
                <Text style={[styles.categorySuggestionText, { color: palette.bone }]}>
                  Suggested category: {getTaskCategoryMeta(suggestedTaskCategory).realWorldLabel}
                </Text>
                <Pressable
                  onPress={handleApplySuggestedCategory}
                  style={[styles.categorySuggestionApply, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
                  <Text style={[styles.categorySuggestionApplyText, { color: palette.bone }]}>APPLY</Text>
                </Pressable>
              </View>
            ) : null}

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
                      setCategoryManuallySelected(true);
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
            {selectedMeta ? (
              <Text style={[styles.categoryHint, { color: palette.fog }]}>{selectedMeta.description}</Text>
            ) : (
              <Text style={[styles.categoryHint, { color: palette.fog }]}>
                Select a category to continue.
              </Text>
            )}

            {category ? (
              <>
                <Text style={[styles.label, { color: palette.gold }]}>QUEST SUITE</Text>
                <Text style={[styles.categoryHelper, { color: palette.fog }]}>
                  Your real-life domain — story stays the same, tasks get more personal.
                </Text>

                {showSuiteSuggestion && suggestedSuiteId ? (
                  <View
                    style={[
                      styles.categorySuggestionBox,
                      { borderColor: palette.panelBorder, backgroundColor: palette.panel },
                    ]}>
                    <Text style={[styles.categorySuggestionText, { color: palette.bone }]}>
                      Suggested suite: {getQuestSuiteById(suggestedSuiteId)?.label ?? suggestedSuiteId}
                    </Text>
                    <Pressable
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setSuiteId(suggestedSuiteId);
                        setSuiteManuallySelected(true);
                      }}
                      style={[
                        styles.categorySuggestionApply,
                        { borderColor: palette.gold, backgroundColor: palette.primary },
                      ]}>
                      <Text style={[styles.categorySuggestionApplyText, { color: palette.bone }]}>APPLY</Text>
                    </Pressable>
                  </View>
                ) : null}

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                  {QUEST_SUITES.map((suite) => {
                    const selected = suiteId === suite.id;
                    return (
                      <Pressable
                        key={suite.id}
                        onPress={() => {
                          void Haptics.selectionAsync();
                          setSuiteManuallySelected(true);
                          setSuiteId(suite.id);
                        }}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: selected ? palette.primary : palette.panel,
                            borderColor: selected ? palette.gold : palette.panelBorder,
                          },
                        ]}>
                        <Text style={[styles.chipIcon, { color: selected ? palette.bone : palette.fog }]}>
                          {suite.icon}
                        </Text>
                        <Text
                          style={[styles.chipFlavor, { color: selected ? palette.bone : palette.fog }]}
                          numberOfLines={2}>
                          {suite.shortLabel}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {selectedSuite ? (
                  <Text style={[styles.categoryHint, { color: palette.fog }]}>
                    {selectedSuite.description}
                  </Text>
                ) : (
                  <Text style={[styles.categoryHint, { color: palette.fog }]}>
                    Pick a suite to continue.
                  </Text>
                )}
              </>
            ) : null}

            {defaultsApplied && !addQuestRecoveryMode ? (
              <Text style={[styles.defaultsHint, { color: palette.accent }]}>{QUEST_DEFAULTS_APPLIED_COPY}</Text>
            ) : null}

            {guidedDiscoveryActive && !discoveryState.showAdvancedTools ? (
              <Pressable
                onPress={() => setShowAdvancedFeatureTools(true)}
                style={[styles.advancedToolsLink, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.advancedToolsLinkText, { color: palette.gold }]}>
                  Show advanced tools
                </Text>
              </Pressable>
            ) : null}

            {showRepeatTools ? (
              <>
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

              </>
            ) : null}

            {showStarterTools ? (
            <CollapsibleSection
              title="Optional behavior tools"
              hint={behaviorToolsHint}
              expanded={behaviorToolsOpen}
              onToggle={() => setBehaviorToolsOpen((open) => !open)}
              palette={palette}>
              {hasNewBehaviorTools ? (
                <FeatureDiscoveryHint
                  hint={getFeatureIntroHint(newlyIntroducedTools[0])}
                  feature={newlyIntroducedTools[0]}
                  showTryThis
                  palette={palette}
                />
              ) : null}

              <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
                <View style={styles.toggleCopy}>
                  <View style={styles.toggleTitleRow}>
                    <Text style={[styles.toggleLabel, { color: palette.bone }]}>{starterCopy.toggleLabel}</Text>
                    {isFeatureNewlyIntroduced(playerProgress, 'starterMove') ? (
                      <FeatureDiscoveryBadge palette={palette} />
                    ) : null}
                  </View>
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

              {showRiskTools ? (
              <>
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

              </>
              ) : null}

              {showPrepTools ? (
              <>
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
                    placeholder={category ? getDefaultPrepPreset(category) : 'Prep step…'}
                    placeholderTextColor={`${palette.fog}88`}
                    style={[
                      styles.input,
                      { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
                    ]}
                  />
                </View>
              )}
              </>
              ) : null}

              {showRewardTools ? (
              <>
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
              </>
              ) : null}

              <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
                <View style={styles.toggleCopy}>
                  <Text style={[styles.toggleLabel, { color: palette.bone }]}>
                    {preQuestRitualCopy.sectionPrompt}
                  </Text>
                  <Text style={[styles.toggleHint, { color: palette.fog }]}>
                    {preQuestRitualCopy.helperText}
                  </Text>
                </View>
                <Switch
                  value={preQuestRitualEnabled}
                  onValueChange={handleTogglePreQuestRitual}
                  trackColor={{ false: palette.panelBorder, true: palette.primary }}
                  thumbColor={preQuestRitualEnabled ? palette.gold : palette.fog}
                />
              </View>

              {preQuestRitualEnabled && (
                <View style={[styles.prepBox, { backgroundColor: palette.night, borderColor: palette.gold }]}>
                  <Text style={[styles.prepLabel, { color: palette.gold }]}>START RITUAL</Text>
                  <View style={styles.presetList}>
                    {PRE_QUEST_RITUAL_PRESETS.map((preset) => {
                      const selected = preQuestRitualTitle === preset;
                      return (
                        <Pressable
                          key={preset}
                          onPress={() => {
                            void Haptics.selectionAsync();
                            setPreQuestRitualTitle(preset);
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
                    value={isPresetPreQuestRitual(preQuestRitualTitle) ? '' : preQuestRitualTitle}
                    onChangeText={setPreQuestRitualTitle}
                    placeholder="Your own ritual…"
                    placeholderTextColor={`${palette.fog}88`}
                    style={[
                      styles.input,
                      { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
                    ]}
                  />
                </View>
              )}

              <QuestReminderPicker
                selection={reminderSelection}
                customTime={reminderCustomTime}
                plannedTimeLabel={plannedTimeLabel.trim() || preferredTimeLabel.trim() || undefined}
                onSelectionChange={setReminderSelection}
                onCustomTimeChange={setReminderCustomTime}
                palette={palette}
              />

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
                    {isFeatureNewlyIntroduced(playerProgress, 'focusMode') ? (
                      <FeatureDiscoveryBadge palette={palette} />
                    ) : null}
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

              {showFocusTools &&
              !markAsFocus &&
              !plannedTimeLabel &&
              !plannedLocation &&
              !afterCurrentHabit &&
              !planText ? (
                <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
                  <View style={styles.toggleCopy}>
                    <Text style={[styles.toggleLabel, { color: palette.bone }]}>Mark as daily focus</Text>
                    {isFeatureNewlyIntroduced(playerProgress, 'focusMode') ? (
                      <FeatureDiscoveryBadge palette={palette} />
                    ) : null}
                    <Text style={[styles.toggleHint, { color: palette.fog }]}>
                      {getFeatureIntroHint('focusMode')}
                    </Text>
                  </View>
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
              ) : null}
            </CollapsibleSection>
            ) : guidedDiscoveryActive ? (
              <FeatureDiscoveryTeaser
                message={getFeatureUnlockTeaser('starterMove')}
                palette={palette}
              />
            ) : null}

            <GlowButton
              label={confirmOverLimit ? 'CONTINUE ANYWAY' : ui.addQuestCreateLabel}
              hint={
                !category
                  ? 'Pick a category first.'
                  : !suiteId
                    ? 'Choose a focus area.'
                    : confirmOverLimit
                      ? ui.addQuestConfirmOverLimitHint
                      : ui.addQuestCreateHint
              }
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
  sheetScrollView: {
    flexGrow: 0,
    flexShrink: 1,
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
  categorySuggestionBox: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  categorySuggestionText: {
    flex: 1,
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 0.4,
    lineHeight: 17,
  },
  categorySuggestionApply: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  categorySuggestionApplyText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  traitSuggestionBox: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    transform: [{ skewX: '-2deg' }],
  },
  traitSuggestionLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  traitSuggestionReason: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  advancedToolsLink: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    transform: [{ skewX: '-2deg' }],
  },
  advancedToolsLinkText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  toggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
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
