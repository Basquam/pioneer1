import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import { getDefaultPrepPreset, getPrepPresets } from '@/lib/quest-prep';
import {
  buildHabitStackPlan,
  buildTimedPlan,
  FRICTION_REASON_OPTIONS,
  getFrictionFixCopy,
  getFrictionReasonLabel,
} from '@/lib/quest-friction';
import { generateStarterTaskTitle } from '@/lib/two-minute-starter';
import { isQuestChainSplittable } from '@/lib/quest-chain';
import type { QuestFrictionReason } from '@/types/narrative';

type FrictionReviewSheetProps = {
  questId: string | null;
  onClose: () => void;
};

type QuickAction = 'starter' | 'plan' | 'prep' | 'focus' | 'time' | 'habit' | 'archive' | null;

export function FrictionReviewSheet({ questId, onClose }: FrictionReviewSheetProps) {
  const {
    activeUniverse,
    playerProgress,
    recordFrictionReview,
    markFrictionFixApplied,
    updateUserQuest,
    archiveUserQuest,
    openSplitQuestChain,
  } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);

  const userQuest = useMemo(
    () => playerProgress.userQuests.find((quest) => quest.id === questId) ?? null,
    [playerProgress.userQuests, questId],
  );

  const [phase, setPhase] = useState<'reason' | 'fix'>('reason');
  const [selectedReason, setSelectedReason] = useState<QuestFrictionReason | null>(null);
  const [activeAction, setActiveAction] = useState<QuickAction>(null);
  const [starterTitle, setStarterTitle] = useState('');
  const [planText, setPlanText] = useState('');
  const [prepStepTitle, setPrepStepTitle] = useState('');
  const [timeLabel, setTimeLabel] = useState('');
  const [habitLabel, setHabitLabel] = useState('');
  const [taskTitle, setTaskTitle] = useState('');

  const suggestedStarter = useMemo(
    () =>
      userQuest ? generateStarterTaskTitle(userQuest.originalTitle, userQuest.category) : '',
    [userQuest],
  );

  const prepPresets = useMemo(
    () => (userQuest ? getPrepPresets(userQuest.category) : []),
    [userQuest],
  );

  useEffect(() => {
    if (!userQuest) return;
    setStarterTitle(userQuest.starterTaskTitle?.trim() ?? suggestedStarter);
    setPlanText(userQuest.implementationIntention?.trim() ?? '');
    setPrepStepTitle(userQuest.prepStepTitle?.trim() ?? getDefaultPrepPreset(userQuest.category));
    setTimeLabel(userQuest.plannedTimeLabel?.trim() ?? '');
    setHabitLabel(userQuest.afterCurrentHabit?.trim() ?? '');
    setTaskTitle(userQuest.originalTitle);
  }, [userQuest, suggestedStarter]);

  useEffect(() => {
    if (questId) return;
    setPhase('reason');
    setSelectedReason(null);
    setActiveAction(null);
  }, [questId]);

  if (!questId || !userQuest) return null;

  const fixCopy = selectedReason ? getFrictionFixCopy(selectedReason) : null;

  const handleClose = () => {
    onClose();
  };

  const handleSelectReason = (reason: QuestFrictionReason) => {
    void Haptics.selectionAsync();
    setSelectedReason(reason);
    recordFrictionReview(questId, reason);
    setPhase('fix');
    const primary = getFrictionFixCopy(reason).primaryAction;
    if (primary === 'archive') {
      setActiveAction('archive');
    } else {
      setActiveAction(primary);
    }
  };

  const applyFix = (action: QuickAction, closeAfter = true) => {
    if (!action || action === 'archive') return;

    const updates: Parameters<typeof updateUserQuest>[1] = {};

    switch (action) {
      case 'starter': {
        const starter = starterTitle.trim() || suggestedStarter;
        if (!starter) return;
        updates.starterTaskTitle = starter;
        break;
      }
      case 'plan': {
        const plan = planText.trim() || taskTitle.trim();
        if (!plan) return;
        updates.implementationIntention = plan;
        if (taskTitle.trim() && taskTitle.trim() !== userQuest.originalTitle) {
          updates.originalTitle = taskTitle.trim();
        }
        break;
      }
      case 'prep': {
        const prep = prepStepTitle.trim();
        if (!prep) return;
        updates.prepStepTitle = prep;
        break;
      }
      case 'focus':
        updates.focusPinned = true;
        break;
      case 'time': {
        const time = timeLabel.trim();
        if (!time) return;
        updates.plannedTimeLabel = time;
        updates.implementationIntention = buildTimedPlan(time, taskTitle.trim() || userQuest.originalTitle);
        break;
      }
      case 'habit': {
        const habit = habitLabel.trim();
        if (!habit) return;
        updates.afterCurrentHabit = habit;
        updates.implementationIntention = buildHabitStackPlan(
          habit,
          taskTitle.trim() || userQuest.originalTitle,
        );
        break;
      }
      default:
        return;
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateUserQuest(questId, updates, { planningSource: 'readiness' });
    markFrictionFixApplied(questId);
    if (closeAfter) onClose();
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive this quest?',
      'It will leave your board. Clearing noise is also progress — no penalty.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            markFrictionFixApplied(questId);
            archiveUserQuest(questId);
            onClose();
          },
        },
      ],
    );
  };

  const renderActionPanel = () => {
    switch (activeAction) {
      case 'starter':
        return (
          <View style={[styles.fieldBox, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
            <Text style={[styles.fieldLabel, { color: palette.gold }]}>STARTER MOVE</Text>
            <Text style={[styles.fieldHint, { color: palette.fog }]}>
              Shrink it to the first visible move.
            </Text>
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
            <Pressable
              onPress={() => applyFix('starter')}
              style={[styles.applyButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
              <Text style={[styles.applyButtonText, { color: palette.bone }]}>SAVE STARTER</Text>
            </Pressable>
            {selectedReason === 'too-big' && isQuestChainSplittable(userQuest) ? (
              <Pressable
                onPress={() => {
                  void Haptics.selectionAsync();
                  onClose();
                  openSplitQuestChain(questId);
                }}
                style={[styles.applyButton, { borderColor: palette.accent, backgroundColor: palette.night }]}>
                <Text style={[styles.applyButtonText, { color: palette.accent }]}>SPLIT INTO QUEST CHAIN</Text>
              </Pressable>
            ) : null}
          </View>
        );
      case 'plan':
        return (
          <View style={[styles.fieldBox, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
            <Text style={[styles.fieldLabel, { color: palette.gold }]}>CLARIFY TASK / PLAN</Text>
            <Text style={[styles.fieldHint, { color: palette.fog }]}>
              Make the next action specific.
            </Text>
            <TextInput
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Specific next action"
              placeholderTextColor={`${palette.fog}88`}
              style={[
                styles.input,
                { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
              ]}
            />
            <TextInput
              value={planText}
              onChangeText={setPlanText}
              placeholder="When and where — e.g. After lunch at my desk"
              placeholderTextColor={`${palette.fog}88`}
              style={[
                styles.input,
                { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
              ]}
            />
            <Pressable
              onPress={() => applyFix('plan')}
              style={[styles.applyButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
              <Text style={[styles.applyButtonText, { color: palette.bone }]}>SAVE PLAN</Text>
            </Pressable>
          </View>
        );
      case 'prep':
        return (
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
            <Pressable
              onPress={() => applyFix('prep')}
              style={[styles.applyButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
              <Text style={[styles.applyButtonText, { color: palette.bone }]}>SAVE PREP</Text>
            </Pressable>
          </View>
        );
      case 'time':
        return (
          <View style={[styles.fieldBox, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
            <Text style={[styles.fieldLabel, { color: palette.gold }]}>BETTER MOMENT</Text>
            <Text style={[styles.fieldHint, { color: palette.fog }]}>
              Move it to a time that fits your energy.
            </Text>
            <TextInput
              value={timeLabel}
              onChangeText={setTimeLabel}
              placeholder="Tomorrow morning / After work / Saturday"
              placeholderTextColor={`${palette.fog}88`}
              style={[
                styles.input,
                { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
              ]}
            />
            <Pressable
              onPress={() => applyFix('time')}
              style={[styles.applyButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
              <Text style={[styles.applyButtonText, { color: palette.bone }]}>SAVE TIME</Text>
            </Pressable>
          </View>
        );
      case 'habit':
        return (
          <View style={[styles.fieldBox, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
            <Text style={[styles.fieldLabel, { color: palette.gold }]}>HABIT STACK</Text>
            <Text style={[styles.fieldHint, { color: palette.fog }]}>
              Attach it to something you already do.
            </Text>
            <TextInput
              value={habitLabel}
              onChangeText={setHabitLabel}
              placeholder="I finish breakfast / I open my laptop"
              placeholderTextColor={`${palette.fog}88`}
              style={[
                styles.input,
                { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
              ]}
            />
            <Pressable
              onPress={() => applyFix('habit')}
              style={[styles.applyButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
              <Text style={[styles.applyButtonText, { color: palette.bone }]}>SAVE HABIT STACK</Text>
            </Pressable>
          </View>
        );
      case 'archive':
        return (
          <View style={[styles.fieldBox, { backgroundColor: palette.panel, borderColor: palette.accent }]}>
            <Text style={[styles.fieldHint, { color: palette.fog }]}>
              Clearing noise is also progress. This quest will leave your board — no penalty.
            </Text>
            <Pressable
              onPress={handleArchive}
              style={[styles.applyButton, { borderColor: palette.accent, backgroundColor: palette.night }]}>
              <Text style={[styles.applyButtonText, { color: palette.accent }]}>ARCHIVE QUEST</Text>
            </Pressable>
          </View>
        );
      default:
        return null;
    }
  };

  const quickActions: { key: QuickAction; label: string }[] = [
    { key: 'starter', label: 'Add Starter Move' },
    { key: 'plan', label: 'Add Plan' },
    { key: 'prep', label: 'Add Prep Step' },
    { key: 'focus', label: 'Mark as Focus' },
    { key: 'archive', label: 'Archive Quest' },
  ];

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
              <Text style={[styles.eyebrow, { color: palette.gold }]}>REVIEW FRICTION</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text style={[styles.close, { color: palette.fog }]}>✕</Text>
              </Pressable>
            </View>

            <Text style={[styles.title, { color: palette.bone }]} numberOfLines={2}>
              {userQuest.narrativeTitle}
            </Text>
            <Text style={[styles.sub, { color: palette.fog }]}>
              No guilt — just understanding what made this hard.
            </Text>

            {phase === 'reason' ? (
              <>
                <Text style={[styles.question, { color: palette.bone }]}>
                  Why is this quest hard to start?
                </Text>
                <View style={styles.reasonList}>
                  {FRICTION_REASON_OPTIONS.map((option) => (
                    <Pressable
                      key={option.reason}
                      onPress={() => handleSelectReason(option.reason)}
                      style={[styles.reasonChip, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
                      <Text style={[styles.reasonChipText, { color: palette.bone }]}>{option.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <>
                {selectedReason && fixCopy && (
                  <View style={[styles.fixBox, { borderColor: palette.gold, backgroundColor: palette.panel }]}>
                    <Text style={[styles.fixReason, { color: palette.gold }]}>
                      {getFrictionReasonLabel(selectedReason)}
                    </Text>
                    <Text style={[styles.fixSuggestion, { color: palette.bone }]}>
                      {fixCopy.suggestion}
                    </Text>
                  </View>
                )}

                <Text style={[styles.quickLabel, { color: palette.fog }]}>Quick actions</Text>
                <View style={styles.quickActions}>
                  {quickActions.map((action) => {
                    const isPrimary = fixCopy?.primaryAction === action.key;
                    const isActive = activeAction === action.key;
                    return (
                      <Pressable
                        key={action.key}
                        onPress={() => {
                          void Haptics.selectionAsync();
                          if (action.key === 'focus') {
                            applyFix('focus');
                            return;
                          }
                          setActiveAction(action.key);
                        }}
                        style={[
                          styles.quickChip,
                          {
                            borderColor: isPrimary || isActive ? palette.gold : palette.panelBorder,
                            backgroundColor: isPrimary || isActive ? `${palette.primary}aa` : palette.night,
                          },
                        ]}>
                        <Text style={[styles.quickChipText, { color: palette.bone }]}>{action.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {renderActionPanel()}

                <Pressable onPress={handleClose} style={styles.doneLink}>
                  <Text style={[styles.doneText, { color: palette.fog }]}>Done for now</Text>
                </Pressable>
              </>
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
  title: { fontFamily: GameFonts.display, fontSize: 22, lineHeight: 28 },
  sub: { fontFamily: GameFonts.displayRegular, fontSize: 13, fontStyle: 'italic', lineHeight: 19 },
  question: { fontFamily: GameFonts.ui, fontSize: 15, letterSpacing: 0.3, lineHeight: 22 },
  reasonList: { gap: 8 },
  reasonChip: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    transform: [{ skewX: '-2deg' }],
  },
  reasonChipText: { fontFamily: GameFonts.uiSemi, fontSize: 13, letterSpacing: 0.5 },
  fixBox: {
    borderWidth: 1,
    padding: 14,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
  fixReason: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2 },
  fixSuggestion: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  quickLabel: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2, marginTop: 4 },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickChip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    transform: [{ skewX: '-4deg' }],
  },
  quickChipText: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1 },
  fieldBox: {
    borderWidth: 1,
    padding: 12,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  fieldLabel: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2 },
  fieldHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
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
  applyButton: {
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    transform: [{ skewX: '-4deg' }],
  },
  applyButtonText: { fontFamily: GameFonts.uiSemi, fontSize: 11, letterSpacing: 2 },
  doneLink: { alignItems: 'center', paddingVertical: 8 },
  doneText: { fontFamily: GameFonts.uiSemi, fontSize: 11, letterSpacing: 2 },
});
