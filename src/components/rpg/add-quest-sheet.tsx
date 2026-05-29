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
  getDefaultRecoveryCategory,
  getDefaultRecoveryTaskTitle,
  RECOVERY_QUEST_CATEGORIES,
} from '@/lib/recovery-quest';
import type { TaskCategory } from '@/types/narrative';

type AddQuestSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function AddQuestSheet({ visible, onClose }: AddQuestSheetProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse, currentChapter, playerProgress, addUserQuest, addQuestRecoveryMode, isTodayFocusLocked } = useGame();
  const { palette } = activeUniverse;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('cleaning');
  const [confirmOverLimit, setConfirmOverLimit] = useState(false);
  const [easierToStart, setEasierToStart] = useState(false);
  const [starterTitle, setStarterTitle] = useState('');
  const [prepEnabled, setPrepEnabled] = useState(false);
  const [prepStepTitle, setPrepStepTitle] = useState('');

  const starterCopy = getStarterToggleCopy(activeUniverse.id);
  const prepCopy = getQuestPrepCopy(activeUniverse.id);
  const focusLockCopy = getFocusLockCopy(activeUniverse.id);
  const prepPresets = useMemo(() => getPrepPresets(category), [category]);
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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const submitQuest = () => {
    if (!trimmedTitle) return;
    const starter = easierToStart ? starterTitle.trim() || suggestedStarter : '';
    const prep = prepEnabled ? prepStepTitle.trim() : '';
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addUserQuest(trimmedTitle, category, {
      ...(starter ? { starterTaskTitle: starter } : {}),
      ...(prep ? { prepStepTitle: prep } : {}),
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

  useEffect(() => {
    if (visible) return;
    resetForm();
  }, [visible]);

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
              <View style={[styles.starterBox, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
                <Text style={[styles.starterLabel, { color: palette.gold }]}>STARTER TASK</Text>
                <TextInput
                  value={starterTitle}
                  onChangeText={setStarterTitle}
                  placeholder={suggestedStarter}
                  placeholderTextColor={`${palette.fog}88`}
                  style={[
                    styles.input,
                    { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
                  ]}
                />
                <Text style={[styles.starterHint, { color: palette.fog }]}>
                  Main task stays: {trimmedTitle || 'enter a task above'}
                </Text>
              </View>
            )}

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

            <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
              <View style={styles.toggleCopy}>
                <Text style={[styles.toggleLabel, { color: palette.bone }]}>{prepCopy.sectionLabel}</Text>
                <Text style={[styles.toggleHint, { color: palette.fog }]}>{prepCopy.helperText}</Text>
                <Text style={[styles.toggleUniverseHint, { color: palette.gold }]}>{prepCopy.universeHint}</Text>
              </View>
              <Switch
                value={prepEnabled}
                onValueChange={handleTogglePrep}
                trackColor={{ false: palette.panelBorder, true: palette.primary }}
                thumbColor={prepEnabled ? palette.gold : palette.fog}
              />
            </View>

            {prepEnabled && (
              <View style={[styles.prepBox, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
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
                            backgroundColor: selected ? palette.primary : palette.night,
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
                <Text style={[styles.prepCustomLabel, { color: palette.fog }]}>Or write your own</Text>
                <TextInput
                  value={prepStepTitle}
                  onChangeText={setPrepStepTitle}
                  placeholder={getDefaultPrepPreset(category)}
                  placeholderTextColor={`${palette.fog}88`}
                  style={[
                    styles.input,
                    { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
                  ]}
                />
              </View>
            )}

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
});
