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
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import { getTaskCategoryMeta } from '@/lib/task-categories';
import { generateStarterTaskTitle } from '@/lib/two-minute-starter';
import {
  getQuestChainFlavor,
  isQuestChainSplittable,
  MAX_CHAIN_STEPS,
  MIN_CHAIN_STEPS,
  type QuestChainStepInput,
} from '@/lib/quest-chain';

type SplitQuestChainSheetProps = {
  questId: string | null;
  onClose: () => void;
};

type StepDraft = {
  title: string;
  starterEnabled: boolean;
  starterTitle: string;
};

const DEFAULT_STEP_COUNT = 3;

function createEmptyStep(): StepDraft {
  return { title: '', starterEnabled: false, starterTitle: '' };
}

export function SplitQuestChainSheet({ questId, onClose }: SplitQuestChainSheetProps) {
  const { activeUniverse, playerProgress, splitUserQuestIntoChain } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);

  const userQuest = useMemo(
    () => playerProgress.userQuests.find((quest) => quest.id === questId) ?? null,
    [playerProgress.userQuests, questId],
  );

  const [steps, setSteps] = useState<StepDraft[]>(
    Array.from({ length: DEFAULT_STEP_COUNT }, () => createEmptyStep()),
  );

  useEffect(() => {
    if (!questId) {
      setSteps(Array.from({ length: DEFAULT_STEP_COUNT }, () => createEmptyStep()));
    }
  }, [questId]);

  if (!questId || !userQuest || !isQuestChainSplittable(userQuest)) return null;

  const categoryMeta = getTaskCategoryMeta(userQuest.category);
  const filledSteps = steps.filter((step) => step.title.trim().length > 0);
  const canSubmit =
    filledSteps.length >= MIN_CHAIN_STEPS && filledSteps.length <= MAX_CHAIN_STEPS;

  const handleClose = () => {
    onClose();
  };

  const handleAddStep = () => {
    if (steps.length >= MAX_CHAIN_STEPS) return;
    setSteps((prev) => [...prev, createEmptyStep()]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= MIN_CHAIN_STEPS) return;
    setSteps((prev) => prev.filter((_, stepIndex) => stepIndex !== index));
  };

  const updateStep = (index: number, patch: Partial<StepDraft>) => {
    setSteps((prev) => prev.map((step, stepIndex) => (stepIndex === index ? { ...step, ...patch } : step)));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const payload: QuestChainStepInput[] = filledSteps.map((step) => ({
      title: step.title.trim(),
      category: userQuest.category,
      ...(step.starterEnabled && step.starterTitle.trim()
        ? { starterTaskTitle: step.starterTitle.trim() }
        : {}),
    }));

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    splitUserQuestIntoChain(questId, payload);
    handleClose();
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
            {
              backgroundColor: palette.night,
              borderColor: palette.panelBorder,
              maxHeight: GameLayout.modalMaxHeight,
              paddingBottom: modalBottomInset,
            },
          ]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={[styles.eyebrow, { color: palette.gold }]}>QUEST CHAIN</Text>
            <Text style={[styles.title, { color: palette.bone }]}>Break this into smaller moves</Text>
            <Text style={[styles.flavor, { color: palette.fog }]}>{getQuestChainFlavor(activeUniverse.id)}</Text>

            <View style={[styles.parentBox, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
              <Text style={[styles.parentLabel, { color: palette.fog }]}>PARENT QUEST</Text>
              <Text style={[styles.parentTitle, { color: palette.bone }]} numberOfLines={2}>
                {userQuest.originalTitle}
              </Text>
              <Text style={[styles.parentMeta, { color: palette.gold }]}>
                Steps inherit {categoryMeta.realWorldLabel} category
              </Text>
            </View>

            {steps.map((step, index) => {
              const trimmedTitle = step.title.trim();
              const suggestedStarter = trimmedTitle
                ? generateStarterTaskTitle(trimmedTitle, userQuest.category)
                : '';

              return (
                <View
                  key={`chain-step-${index}`}
                  style={[styles.stepBox, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
                  <View style={styles.stepHeader}>
                    <Text style={[styles.stepLabel, { color: palette.gold }]}>STEP {index + 1}</Text>
                    {steps.length > MIN_CHAIN_STEPS ? (
                      <Pressable onPress={() => handleRemoveStep(index)}>
                        <Text style={[styles.removeStep, { color: palette.fog }]}>REMOVE</Text>
                      </Pressable>
                    ) : null}
                  </View>

                  <TextInput
                    value={step.title}
                    onChangeText={(value) => updateStep(index, { title: value })}
                    placeholder="Smaller move title"
                    placeholderTextColor={`${palette.fog}88`}
                    style={[
                      styles.input,
                      { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
                    ]}
                  />

                  <View style={styles.toggleRow}>
                    <Text style={[styles.toggleLabel, { color: palette.bone }]}>Starter move</Text>
                    <Switch
                      value={step.starterEnabled}
                      onValueChange={(enabled) => {
                        void Haptics.selectionAsync();
                        updateStep(index, {
                          starterEnabled: enabled,
                          starterTitle: enabled ? suggestedStarter : '',
                        });
                      }}
                      trackColor={{ false: palette.panelBorder, true: palette.primary }}
                      thumbColor={step.starterEnabled ? palette.gold : palette.fog}
                    />
                  </View>

                  {step.starterEnabled ? (
                    <TextInput
                      value={step.starterTitle}
                      onChangeText={(value) => updateStep(index, { starterTitle: value })}
                      placeholder={suggestedStarter || '2-minute starter'}
                      placeholderTextColor={`${palette.fog}88`}
                      style={[
                        styles.input,
                        { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
                      ]}
                    />
                  ) : null}
                </View>
              );
            })}

            {steps.length < MAX_CHAIN_STEPS ? (
              <Pressable
                onPress={handleAddStep}
                style={[styles.addStepButton, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
                <Text style={[styles.addStepText, { color: palette.fog }]}>+ ADD STEP</Text>
              </Pressable>
            ) : null}

            <Text style={[styles.helper, { color: palette.fog }]}>
              Add {MIN_CHAIN_STEPS}–{MAX_CHAIN_STEPS} steps. Child steps earn split XP; the parent clears when all
              steps are done.
            </Text>

            <GlowButton
              label="CREATE QUEST CHAIN"
              hint={canSubmit ? 'Split and add steps to your board' : `Add at least ${MIN_CHAIN_STEPS} step titles`}
              onPress={handleSubmit}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  dismissArea: { flex: 1 },
  sheet: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    maxHeight: '88%',
  },
  content: { padding: 20, gap: 12 },
  eyebrow: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2 },
  title: { fontFamily: GameFonts.display, fontSize: 22, lineHeight: 28 },
  flavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  parentBox: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
    transform: [{ skewX: '-2deg' }],
  },
  parentLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1.5 },
  parentTitle: { fontFamily: GameFonts.ui, fontSize: 14, lineHeight: 19 },
  parentMeta: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 0.4 },
  stepBox: {
    borderWidth: 1,
    padding: 12,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1.5 },
  removeStep: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1.2 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: GameFonts.ui,
    fontSize: 14,
    minHeight: 44,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 0.4 },
  addStepButton: {
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    transform: [{ skewX: '-2deg' }],
  },
  addStepText: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1.5 },
  helper: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
