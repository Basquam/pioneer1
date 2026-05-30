import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GlowButton } from '@/components/rpg/glow-button';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getLocalDateKey } from '@/lib/daily-streak';
import {
  computeTomorrowQuestOptions,
  ENVIRONMENT_PREP_EXAMPLES,
  formatTomorrowImplementationIntention,
  getTomorrowSetupCopy,
  type TomorrowSetupInput,
  type TomorrowQuestOption,
} from '@/lib/tomorrow-setup';

type PrimeChoice =
  | 'first-quest'
  | 'captured-task'
  | 'environment-step'
  | 'when-where-plan'
  | null;

type PrimeTomorrowStepProps = {
  onComplete: (input: TomorrowSetupInput) => void;
  onSkip: () => void;
};

export function PrimeTomorrowStep({ onComplete, onSkip }: PrimeTomorrowStepProps) {
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const today = getLocalDateKey();
  const copy = getTomorrowSetupCopy(activeUniverse.id);

  const questOptions = useMemo(
    () => computeTomorrowQuestOptions(playerProgress, activeUniverse.id, today),
    [activeUniverse.id, playerProgress, today],
  );

  const [choice, setChoice] = useState<PrimeChoice>(null);
  const [selectedQuestOptionId, setSelectedQuestOptionId] = useState<string | null>(null);
  const [capturedTask, setCapturedTask] = useState('');
  const [prepStep, setPrepStep] = useState('');
  const [planTask, setPlanTask] = useState('');
  const [planTime, setPlanTime] = useState('');
  const [planLocation, setPlanLocation] = useState('');

  const selectedOption = questOptions.find((option) => option.id === selectedQuestOptionId) ?? null;

  const handleSave = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (choice === 'first-quest' && selectedOption) {
      if (selectedOption.kind === 'user-quest' && selectedOption.questId) {
        onComplete({ kind: 'first-quest', questId: selectedOption.questId });
        return;
      }
      if (selectedOption.kind === 'inbox' && selectedOption.inboxItemId) {
        onComplete({ kind: 'first-quest', inboxItemId: selectedOption.inboxItemId });
        return;
      }
      onComplete({
        kind: 'first-quest',
        taskTitle: selectedOption.suggestedTitle ?? selectedOption.title,
      });
      return;
    }

    if (choice === 'captured-task') {
      onComplete({ kind: 'captured-task', taskTitle: capturedTask });
      return;
    }

    if (choice === 'environment-step') {
      onComplete({ kind: 'environment-step', prepStepTitle: prepStep });
      return;
    }

    if (choice === 'when-where-plan') {
      onComplete({
        kind: 'when-where-plan',
        implementationIntention: formatTomorrowImplementationIntention(planTask, planTime, planLocation),
      });
    }
  };

  const canSave =
    (choice === 'first-quest' && selectedOption != null) ||
    (choice === 'captured-task' && capturedTask.trim().length > 0) ||
    (choice === 'environment-step' && prepStep.trim().length > 0) ||
    (choice === 'when-where-plan' &&
      planTask.trim().length > 0 &&
      planTime.trim().length > 0 &&
      planLocation.trim().length > 0);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.sectionLabel, { color: palette.gold }]}>PRIME TOMORROW</Text>
      <Text style={[styles.flavor, { color: palette.gold }]}>{copy.shutdownPrompt}</Text>
      <Text style={[styles.sectionHint, { color: palette.fog }]}>
        Prepare one small thing now so tomorrow starts easier.
      </Text>

      <View style={styles.choiceList}>
        <ChoiceChip
          label="Choose tomorrow’s first quest"
          selected={choice === 'first-quest'}
          palette={palette}
          onPress={() => {
            void Haptics.selectionAsync();
            setChoice('first-quest');
          }}
        />
        <ChoiceChip
          label="Capture a loose task for tomorrow"
          selected={choice === 'captured-task'}
          palette={palette}
          onPress={() => {
            void Haptics.selectionAsync();
            setChoice('captured-task');
          }}
        />
        <ChoiceChip
          label="Prepare an environment step"
          selected={choice === 'environment-step'}
          palette={palette}
          onPress={() => {
            void Haptics.selectionAsync();
            setChoice('environment-step');
          }}
        />
        <ChoiceChip
          label="Set a when/where plan"
          selected={choice === 'when-where-plan'}
          palette={palette}
          onPress={() => {
            void Haptics.selectionAsync();
            setChoice('when-where-plan');
          }}
        />
      </View>

      {choice === 'first-quest' ? (
        <View style={styles.detailBlock}>
          {questOptions.map((option) => (
            <QuestOptionChip
              key={option.id}
              option={option}
              selected={selectedQuestOptionId === option.id}
              palette={palette}
              onPress={() => {
                void Haptics.selectionAsync();
                setSelectedQuestOptionId(option.id);
              }}
            />
          ))}
        </View>
      ) : null}

      {choice === 'captured-task' ? (
        <TextInput
          value={capturedTask}
          onChangeText={setCapturedTask}
          placeholder="Loose task for tomorrow"
          placeholderTextColor={palette.fog}
          style={[
            styles.input,
            { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
          ]}
        />
      ) : null}

      {choice === 'environment-step' ? (
        <View style={styles.detailBlock}>
          <TextInput
            value={prepStep}
            onChangeText={setPrepStep}
            placeholder="Environment prep step"
            placeholderTextColor={palette.fog}
            style={[
              styles.input,
              { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
            ]}
          />
          <View style={styles.exampleRow}>
            {ENVIRONMENT_PREP_EXAMPLES.map((example) => (
              <Pressable
                key={example}
                onPress={() => {
                  void Haptics.selectionAsync();
                  setPrepStep(example);
                }}
                style={[styles.exampleChip, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.exampleText, { color: palette.fog }]}>{example}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {choice === 'when-where-plan' ? (
        <View style={styles.detailBlock}>
          <TextInput
            value={planTask}
            onChangeText={setPlanTask}
            placeholder="Task"
            placeholderTextColor={palette.fog}
            style={[
              styles.input,
              { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
            ]}
          />
          <TextInput
            value={planTime}
            onChangeText={setPlanTime}
            placeholder="Time"
            placeholderTextColor={palette.fog}
            style={[
              styles.input,
              { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
            ]}
          />
          <TextInput
            value={planLocation}
            onChangeText={setPlanLocation}
            placeholder="Location"
            placeholderTextColor={palette.fog}
            style={[
              styles.input,
              { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
            ]}
          />
        </View>
      ) : null}

      {choice != null && canSave ? (
        <GlowButton
          label="SAVE TOMORROW SETUP"
          hint="Optional — one small prep is enough"
          onPress={handleSave}
        />
      ) : null}

      <Pressable onPress={onSkip} style={styles.skipButton}>
        <Text style={[styles.skipText, { color: palette.fog }]}>Skip for now</Text>
      </Pressable>
    </View>
  );
}

function ChoiceChip({
  label,
  selected,
  palette,
  onPress,
}: {
  label: string;
  selected: boolean;
  palette: { bone: string; fog: string; gold: string; panel: string; panelBorder: string; primary: string };
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choiceChip,
        {
          backgroundColor: selected ? palette.primary : palette.panel,
          borderColor: selected ? palette.gold : palette.panelBorder,
        },
      ]}>
      <Text style={[styles.choiceChipText, { color: selected ? palette.bone : palette.fog }]}>{label}</Text>
    </Pressable>
  );
}

function QuestOptionChip({
  option,
  selected,
  palette,
  onPress,
}: {
  option: TomorrowQuestOption;
  selected: boolean;
  palette: { bone: string; fog: string; gold: string; panel: string; panelBorder: string; primary: string };
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.questOption,
        {
          backgroundColor: selected ? palette.primary : palette.panel,
          borderColor: selected ? palette.gold : palette.panelBorder,
        },
      ]}>
      <Text style={[styles.questOptionTitle, { color: palette.bone }]} numberOfLines={2}>
        {option.title}
      </Text>
      <Text style={[styles.questOptionMeta, { color: palette.fog }]}>{option.subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  sectionLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  flavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  sectionHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  choiceList: { gap: 8 },
  choiceChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  choiceChipText: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    lineHeight: 17,
  },
  detailBlock: { gap: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: GameFonts.ui,
    fontSize: 14,
  },
  exampleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  exampleChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  exampleText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    lineHeight: 14,
  },
  questOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  questOptionTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 13,
    lineHeight: 18,
  },
  questOptionMeta: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
