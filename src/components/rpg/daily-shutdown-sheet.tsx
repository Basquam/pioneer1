import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GlowButton } from '@/components/rpg/glow-button';
import { QuestLifecycleActions } from '@/components/rpg/quest-lifecycle-actions';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import { getLocalDateKey } from '@/lib/daily-streak';
import {
  computeDailyShutdownCompletedStats,
  computeDailyShutdownOpenQuests,
  DAILY_SHUTDOWN_HELPED_OPTIONS,
  formatOpenQuestCategories,
  getDailyShutdownCopy,
  getDailyShutdownEntry,
} from '@/lib/daily-shutdown';
import { QUEST_LIFECYCLE_NEEDS_DECISION_COPY } from '@/lib/quest-lifecycle';
import { PrimeTomorrowStep } from '@/components/rpg/prime-tomorrow-step';
import type { TomorrowSetupInput } from '@/lib/tomorrow-setup';
import type {
  DailyShutdownHelpedBy,
  DailyShutdownOpenQuestAction,
  DailyShutdownOpenQuestSummary,
} from '@/types/narrative';

type DailyShutdownSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type ShutdownPhase = 'summary' | 'reflect' | 'prime' | 'done';

export function DailyShutdownSheet({ visible, onClose }: DailyShutdownSheetProps) {
  const {
    activeUniverse,
    playerProgress,
    completeDailyShutdown,
    closeDailyShutdown,
  } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);
  const today = getLocalDateKey();
  const copy = getDailyShutdownCopy(activeUniverse.id);
  const savedEntry = getDailyShutdownEntry(playerProgress, today);

  const [phase, setPhase] = useState<ShutdownPhase>('summary');
  const [helpedBy, setHelpedBy] = useState<DailyShutdownHelpedBy | null>(null);
  const [actionByQuestId, setActionByQuestId] = useState<
    Record<string, DailyShutdownOpenQuestAction>
  >({});

  const completedStats = useMemo(
    () => computeDailyShutdownCompletedStats(playerProgress, today, activeUniverse.id),
    [activeUniverse.id, playerProgress, today],
  );
  const openQuests = useMemo(
    () => computeDailyShutdownOpenQuests(playerProgress, activeUniverse.id, today),
    [activeUniverse.id, playerProgress, today],
  );

  const isQuietDay =
    completedStats.questsCompleted === 0 &&
    completedStats.xpEarned === 0 &&
    completedStats.reputationEarned === 0 &&
    completedStats.identityVotesGained === 0 &&
    completedStats.chaptersCompleted === 0 &&
    openQuests.length === 0;

  const resetState = () => {
    setPhase('summary');
    setHelpedBy(null);
    setActionByQuestId({});
  };

  useEffect(() => {
    if (visible) resetState();
  }, [visible]);

  const handleClose = () => {
    resetState();
    closeDailyShutdown();
  };

  const handleSelectAction = (questId: string, action: DailyShutdownOpenQuestAction) => {
    setActionByQuestId((current) => ({ ...current, [questId]: action }));
  };

  const buildOpenQuestSummaries = (): DailyShutdownOpenQuestSummary[] =>
    openQuests.map(({ quest }) => ({
      questId: quest.id,
      action: actionByQuestId[quest.id] ?? 'leave',
    }));

  const handleContinueToReflect = () => {
    void Haptics.selectionAsync();
    setPhase('reflect');
  };

  const handleContinueToPrime = () => {
    void Haptics.selectionAsync();
    setPhase('prime');
  };

  const handleFinishShutdown = (tomorrowSetup: TomorrowSetupInput = { kind: 'skip' }) => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeDailyShutdown(helpedBy ?? undefined, buildOpenQuestSummaries(), tomorrowSetup);
    setPhase('done');
  };

  const handleDoneClose = () => {
    handleClose();
  };

  if (!visible) return null;

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
            },
          ]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.content, { paddingBottom: modalBottomInset }]}>
            <View style={styles.header}>
              <Text style={[styles.eyebrow, { color: palette.gold }]}>DAILY SHUTDOWN</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text style={[styles.close, { color: palette.fog }]}>✕</Text>
              </Pressable>
            </View>

            {phase === 'done' ? (
              <>
                <Text style={[styles.title, { color: palette.bone }]}>{copy.completion}</Text>
                <Text style={[styles.subtitle, { color: palette.fog }]}>
                  Tomorrow gets a clean start — no penalty for what stays open.
                </Text>
                <GlowButton label="DONE" hint="Rest well" onPress={handleDoneClose} />
              </>
            ) : null}

            {phase === 'summary' ? (
              <>
                <Text style={[styles.title, { color: palette.bone }]}>{copy.title}</Text>
                <Text style={[styles.subtitle, { color: palette.fog }]}>{copy.intro}</Text>
                {savedEntry ? (
                  <Text style={[styles.reopenedHint, { color: palette.fog }]}>
                    You already logged a shutdown today — this update replaces it.
                  </Text>
                ) : null}

                <View style={[styles.section, { borderColor: palette.panelBorder }]}>
                  <Text style={[styles.sectionLabel, { color: palette.gold }]}>COMPLETED TODAY</Text>
                  {isQuietDay ? (
                    <Text style={[styles.quietLine, { color: palette.fog }]}>
                      A quiet day is still a valid day. Nothing to fix here.
                    </Text>
                  ) : (
                    <View style={styles.statsGrid}>
                      <StatChip label="Quests" value={String(completedStats.questsCompleted)} palette={palette} />
                      <StatChip label="XP" value={`+${completedStats.xpEarned}`} palette={palette} />
                      <StatChip
                        label="Rep"
                        value={`+${completedStats.reputationEarned}`}
                        palette={palette}
                      />
                      <StatChip
                        label="Identity"
                        value={String(completedStats.identityVotesGained)}
                        palette={palette}
                      />
                      {completedStats.chaptersCompleted > 0 ? (
                        <StatChip
                          label="Chapters"
                          value={String(completedStats.chaptersCompleted)}
                          palette={palette}
                        />
                      ) : null}
                    </View>
                  )}
                </View>

                {openQuests.length > 0 ? (
                  <View style={[styles.section, { borderColor: palette.panelBorder }]}>
                    <Text style={[styles.sectionLabel, { color: palette.gold }]}>STILL OPEN</Text>
                    <Text style={[styles.sectionHint, { color: palette.fog }]}>
                      {QUEST_LIFECYCLE_NEEDS_DECISION_COPY} Choose what helps tomorrow.
                    </Text>
                    {openQuests.map(({ quest, categories }) => (
                      <View
                        key={quest.id}
                        style={[
                          styles.openQuestCard,
                          { borderColor: palette.panelBorder, backgroundColor: palette.panel },
                        ]}>
                        <Text style={[styles.openQuestTitle, { color: palette.bone }]} numberOfLines={2}>
                          {quest.originalTitle}
                        </Text>
                        <Text style={[styles.openQuestMeta, { color: palette.fog }]}>
                          {formatOpenQuestCategories(categories)}
                        </Text>
                        <QuestLifecycleActions
                          questId={quest.id}
                          palette={palette}
                          showLeave
                          selectedAction={actionByQuestId[quest.id] ?? 'leave'}
                          onSelectAction={(action) => handleSelectAction(quest.id, action)}
                        />
                      </View>
                    ))}
                  </View>
                ) : null}

                <GlowButton
                  label={openQuests.length > 0 ? 'CONTINUE' : 'REFLECT'}
                  hint="Optional — one quick question next"
                  onPress={handleContinueToReflect}
                />
              </>
            ) : null}

            {phase === 'reflect' ? (
              <>
                <Text style={[styles.sectionLabel, { color: palette.gold }]}>WHAT HELPED YOU TODAY?</Text>
                <Text style={[styles.sectionHint, { color: palette.fog }]}>
                  Optional — pick one if something worked.
                </Text>
                <View style={styles.helpedOptions}>
                  {DAILY_SHUTDOWN_HELPED_OPTIONS.map((option) => {
                    const selected = helpedBy === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => {
                          void Haptics.selectionAsync();
                          setHelpedBy(option.value);
                        }}
                        style={[
                          styles.helpedChip,
                          {
                            backgroundColor: selected ? palette.primary : palette.panel,
                            borderColor: selected ? palette.gold : palette.panelBorder,
                          },
                        ]}>
                        <Text style={[styles.helpedChipText, { color: selected ? palette.bone : palette.fog }]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <GlowButton
                  label="CLOSE TODAY"
                  hint="Optional — one quick prime step next"
                  onPress={handleContinueToPrime}
                />
              </>
            ) : null}

            {phase === 'prime' ? (
              <PrimeTomorrowStep
                onComplete={(input) => handleFinishShutdown(input)}
                onSkip={() => handleFinishShutdown({ kind: 'skip' })}
              />
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function StatChip({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: { bone: string; fog: string; panelBorder: string; night: string };
}) {
  return (
    <View style={[styles.statChip, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
      <Text style={[styles.statValue, { color: palette.bone }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: palette.fog }]}>{label}</Text>
    </View>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 2.5,
  },
  close: {
    fontFamily: GameFonts.ui,
    fontSize: 18,
    padding: 4,
  },
  title: {
    fontFamily: GameFonts.display,
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  reopenedHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  section: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 10,
  },
  sectionLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  sectionHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  quietLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 72,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 14,
  },
  statLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 2,
  },
  openQuestCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  openQuestTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    lineHeight: 18,
  },
  openQuestMeta: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  helpedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  helpedChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  helpedChipText: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
  },
});
