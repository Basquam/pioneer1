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
import { QuestReminderPicker } from '@/components/rpg/quest-reminder-picker';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import { isDailyFocusQuest, getDailyFocusLimit } from '@/lib/daily-focus';
import { getLocalDateKey } from '@/lib/daily-streak';
import { isQuestInLockedFocus } from '@/lib/focus-lock';
import {
  computeQuestReadiness,
  formatReadinessLabel,
  getQuestReadinessSuggestion,
  getReadinessItemLabel,
  type ReadinessItemKey,
  type UserQuestReadinessUpdates,
} from '@/lib/quest-readiness';
import {
  getDefaultPrepPreset,
  getPrepPresets,
  getQuestPrepCopy,
  isPrepPreset,
} from '@/lib/quest-prep';
import { generateStarterTaskTitle, getStarterToggleCopy } from '@/lib/two-minute-starter';
import { userQuestToBoardQuest } from '@/lib/quest-board';
import { requestLocalReminderPermissions } from '@/lib/local-notifications';
import {
  buildQuestReminderFields,
  getQuestReminderSelection,
  type QuestReminderSelection,
} from '@/lib/quest-reminders';

type ImproveQuestSheetProps = {
  questId: string | null;
  onClose: () => void;
};

const READINESS_ITEM_KEYS_LIST: ReadinessItemKey[] = ['starter', 'plan', 'prep', 'focus'];

export function ImproveQuestSheet({ questId, onClose }: ImproveQuestSheetProps) {
  const { activeUniverse, playerProgress, updateUserQuest } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);
  const starterCopy = getStarterToggleCopy(activeUniverse.id);
  const prepCopy = getQuestPrepCopy(activeUniverse.id);

  const userQuest = useMemo(
    () => playerProgress.userQuests.find((quest) => quest.id === questId) ?? null,
    [playerProgress.userQuests, questId],
  );

  const [starterEnabled, setStarterEnabled] = useState(false);
  const [starterTitle, setStarterTitle] = useState('');
  const [planEnabled, setPlanEnabled] = useState(false);
  const [planText, setPlanText] = useState('');
  const [prepEnabled, setPrepEnabled] = useState(false);
  const [prepStepTitle, setPrepStepTitle] = useState('');
  const [focusPinned, setFocusPinned] = useState(false);
  const [reminderSelection, setReminderSelection] = useState<QuestReminderSelection>('none');
  const [reminderCustomTime, setReminderCustomTime] = useState('');

  const today = getLocalDateKey();
  const focusLimit = getDailyFocusLimit(playerProgress);
  const isAutoFocus =
    userQuest != null &&
    isDailyFocusQuest(userQuest.id, playerProgress.userQuests, focusLimit, today, activeUniverse.id);
  const isLockedFocus =
    userQuest != null && isQuestInLockedFocus(userQuest.id, playerProgress, today);

  const prepPresets = useMemo(
    () => (userQuest ? getPrepPresets(userQuest.category) : []),
    [userQuest],
  );

  const suggestedStarter = useMemo(
    () =>
      userQuest ? generateStarterTaskTitle(userQuest.originalTitle, userQuest.category) : '',
    [userQuest],
  );

  useEffect(() => {
    if (!userQuest) return;
    setStarterEnabled(Boolean(userQuest.starterTaskTitle?.trim()));
    setStarterTitle(userQuest.starterTaskTitle?.trim() ?? '');
    setPlanEnabled(Boolean(userQuest.implementationIntention?.trim()));
    setPlanText(userQuest.implementationIntention?.trim() ?? '');
    setPrepEnabled(Boolean(userQuest.prepStepTitle?.trim()));
    setPrepStepTitle(userQuest.prepStepTitle?.trim() ?? '');
    setFocusPinned(Boolean(userQuest.focusPinned));
    const selection = getQuestReminderSelection(userQuest);
    setReminderSelection(selection);
    setReminderCustomTime(
      selection === 'custom' && userQuest.reminderTime ? userQuest.reminderTime : '',
    );
  }, [userQuest]);

  useEffect(() => {
    if (questId) return;
    setStarterEnabled(false);
    setStarterTitle('');
    setPlanEnabled(false);
    setPlanText('');
    setPrepEnabled(false);
    setPrepStepTitle('');
    setFocusPinned(false);
    setReminderSelection('none');
    setReminderCustomTime('');
  }, [questId]);

  useEffect(() => {
    if (!prepEnabled || !userQuest) return;
    const isKnownPreset =
      prepStepTitle.trim().length > 0 &&
      isPrepPreset(prepStepTitle, userQuest.category);
    if (
      !prepStepTitle.trim() ||
      (isKnownPreset && !isPrepPreset(prepStepTitle, userQuest.category))
    ) {
      setPrepStepTitle(getDefaultPrepPreset(userQuest.category));
    }
  }, [prepEnabled, prepStepTitle, userQuest]);

  if (!questId || !userQuest) return null;

  const boardPreview = userQuestToBoardQuest(
    {
      ...userQuest,
      ...(focusPinned ? { focusPinned: true } : { focusPinned: undefined }),
      ...(starterEnabled && starterTitle.trim() ? { starterTaskTitle: starterTitle.trim() } : {}),
      ...(planEnabled && planText.trim() ? { implementationIntention: planText.trim() } : {}),
      ...(prepEnabled && prepStepTitle.trim() ? { prepStepTitle: prepStepTitle.trim() } : {}),
    },
    isAutoFocus || focusPinned,
    isLockedFocus,
  );
  const readinessPreview = computeQuestReadiness(boardPreview);
  const suggestion = readinessPreview ? getQuestReadinessSuggestion(readinessPreview) : null;

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    const reminderFields = buildQuestReminderFields(reminderSelection, reminderCustomTime);
    const remindersGloballyEnabled =
      playerProgress.reminderPreferences?.remindersEnabled === true;

    if (reminderFields.reminderEnabled && remindersGloballyEnabled) {
      void requestLocalReminderPermissions();
    }

    const updates: UserQuestReadinessUpdates = {
      starterTaskTitle: starterEnabled ? starterTitle.trim() || suggestedStarter : null,
      implementationIntention: planEnabled ? planText.trim() : null,
      prepStepTitle: prepEnabled ? prepStepTitle.trim() : null,
      focusPinned: focusPinned && !isAutoFocus && !isLockedFocus,
      reminderEnabled: reminderFields.reminderEnabled === true,
      reminderTime: reminderFields.reminderTime ?? null,
      reminderLabel: reminderFields.reminderLabel ?? null,
    };

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateUserQuest(questId, updates, { planningSource: 'improve' });
    onClose();
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={handleClose}>
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
              <Text style={[styles.eyebrow, { color: palette.gold }]}>IMPROVE QUEST</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text style={[styles.close, { color: palette.fog }]}>✕</Text>
              </Pressable>
            </View>

            <Text style={[styles.title, { color: palette.bone }]} numberOfLines={2}>
              {userQuest.narrativeTitle}
            </Text>
            <Text style={[styles.sub, { color: palette.fog }]} numberOfLines={2}>
              Small tweaks make starting easier — all optional.
            </Text>

            {readinessPreview && (
              <View style={[styles.readinessBox, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
                <Text style={[styles.readinessLabel, { color: palette.gold }]}>
                  {formatReadinessLabel(readinessPreview.score)}
                </Text>
                <View style={styles.readinessItems}>
                  {READINESS_ITEM_KEYS_LIST.map((key) => {
                    const active = readinessPreview.checklist[key];
                    return (
                      <View
                        key={key}
                        style={[
                          styles.readinessChip,
                          {
                            borderColor: active ? palette.gold : palette.panelBorder,
                            backgroundColor: active ? `${palette.primary}88` : palette.night,
                          },
                        ]}>
                        <Text style={[styles.readinessChipText, { color: active ? palette.bone : palette.fog }]}>
                          {getReadinessItemLabel(key)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
                {suggestion ? (
                  <Text style={[styles.readinessSuggestion, { color: palette.fog }]}>{suggestion}</Text>
                ) : null}
              </View>
            )}

            <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
              <View style={styles.toggleCopy}>
                <Text style={[styles.toggleLabel, { color: palette.bone }]}>{starterCopy.toggleLabel}</Text>
                <Text style={[styles.toggleHint, { color: palette.fog }]}>Make it easy — one tiny first step.</Text>
              </View>
              <Switch
                value={starterEnabled}
                onValueChange={(enabled) => {
                  void Haptics.selectionAsync();
                  setStarterEnabled(enabled);
                  if (enabled && !starterTitle.trim()) setStarterTitle(suggestedStarter);
                }}
                trackColor={{ false: palette.panelBorder, true: palette.primary }}
                thumbColor={starterEnabled ? palette.gold : palette.fog}
              />
            </View>

            {starterEnabled && (
              <View style={[styles.fieldBox, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
                <Text style={[styles.fieldLabel, { color: palette.gold }]}>STARTER MOVE</Text>
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
              </View>
            )}

            <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
              <View style={styles.toggleCopy}>
                <Text style={[styles.toggleLabel, { color: palette.bone }]}>Plan when & where</Text>
                <Text style={[styles.toggleHint, { color: palette.fog }]}>Make it obvious — pin time and place.</Text>
              </View>
              <Switch
                value={planEnabled}
                onValueChange={(enabled) => {
                  void Haptics.selectionAsync();
                  setPlanEnabled(enabled);
                }}
                trackColor={{ false: palette.panelBorder, true: palette.primary }}
                thumbColor={planEnabled ? palette.gold : palette.fog}
              />
            </View>

            {planEnabled && (
              <View style={[styles.fieldBox, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
                <Text style={[styles.fieldLabel, { color: palette.gold }]}>PLAN</Text>
                <TextInput
                  value={planText}
                  onChangeText={setPlanText}
                  placeholder="After dinner at the kitchen counter"
                  placeholderTextColor={`${palette.fog}88`}
                  style={[
                    styles.input,
                    { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
                  ]}
                />
              </View>
            )}

            <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
              <View style={styles.toggleCopy}>
                <Text style={[styles.toggleLabel, { color: palette.bone }]}>{prepCopy.sectionLabel}</Text>
                <Text style={[styles.toggleHint, { color: palette.fog }]}>{prepCopy.helperText}</Text>
              </View>
              <Switch
                value={prepEnabled}
                onValueChange={(enabled) => {
                  void Haptics.selectionAsync();
                  setPrepEnabled(enabled);
                  if (enabled && !prepStepTitle.trim() && userQuest) {
                    setPrepStepTitle(getDefaultPrepPreset(userQuest.category));
                  }
                }}
                trackColor={{ false: palette.panelBorder, true: palette.primary }}
                thumbColor={prepEnabled ? palette.gold : palette.fog}
              />
            </View>

            {prepEnabled && (
              <View style={[styles.fieldBox, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
                <Text style={[styles.fieldLabel, { color: palette.gold }]}>PREP STEP</Text>
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
                <TextInput
                  value={prepStepTitle}
                  onChangeText={setPrepStepTitle}
                  placeholder={getDefaultPrepPreset(userQuest.category)}
                  placeholderTextColor={`${palette.fog}88`}
                  style={[
                    styles.input,
                    { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
                  ]}
                />
              </View>
            )}

            <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
              <View style={styles.toggleCopy}>
                <Text style={[styles.toggleLabel, { color: palette.bone }]}>Mark as focus quest</Text>
                <Text style={[styles.toggleHint, { color: palette.fog }]}>
                  {isAutoFocus || isLockedFocus
                    ? 'Already part of today\'s focus.'
                    : 'Increase commitment — highlight on your board.'}
                </Text>
              </View>
              <Switch
                value={focusPinned || isAutoFocus || isLockedFocus}
                disabled={isAutoFocus || isLockedFocus}
                onValueChange={(enabled) => {
                  void Haptics.selectionAsync();
                  setFocusPinned(enabled);
                }}
                trackColor={{ false: palette.panelBorder, true: palette.primary }}
                thumbColor={focusPinned || isAutoFocus || isLockedFocus ? palette.gold : palette.fog}
              />
            </View>

            <QuestReminderPicker
              selection={reminderSelection}
              customTime={reminderCustomTime}
              plannedTimeLabel={userQuest.plannedTimeLabel}
              onSelectionChange={setReminderSelection}
              onCustomTimeChange={setReminderCustomTime}
              palette={palette}
            />

            <GlowButton label="SAVE CHANGES" hint="Optional improvements — no pressure" onPress={handleSave} />
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
  title: { fontFamily: GameFonts.display, fontSize: 22, lineHeight: 28 },
  sub: { fontFamily: GameFonts.displayRegular, fontSize: 13, fontStyle: 'italic', lineHeight: 19 },
  readinessBox: {
    borderWidth: 1,
    padding: 12,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  readinessLabel: { fontFamily: GameFonts.uiSemi, fontSize: 11, letterSpacing: 1.5 },
  readinessItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  readinessChip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    transform: [{ skewX: '-6deg' }],
  },
  readinessChipText: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1 },
  readinessSuggestion: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
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
  toggleLabel: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 0.5 },
  toggleHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  fieldBox: {
    borderWidth: 1,
    padding: 12,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  fieldLabel: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: GameFonts.ui,
    fontSize: 15,
    letterSpacing: 0.5,
  },
  presetList: { gap: 8 },
  presetChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    transform: [{ skewX: '-2deg' }],
  },
  presetChipText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.3,
    lineHeight: 15,
  },
});
