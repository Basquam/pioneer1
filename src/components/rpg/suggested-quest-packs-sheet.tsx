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
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import { getLocalDateKey } from '@/lib/daily-streak';
import {
  countTodayUserQuests,
  formatTodayFocusLabel,
  getDailyFocusLimit,
  getDailyFocusOverLimitMessage,
} from '@/lib/daily-focus';
import { getFocusLockCopy } from '@/lib/focus-lock';
import {
  getQuestPackById,
  packItemsToCreateInputs,
  previewQuestPack,
  QUEST_PACKS,
  sortQuestPacksForProfile,
  type QuestPack,
} from '@/lib/quest-packs';
import { getTaskCategoryMeta } from '@/lib/task-categories';

type SuggestedQuestPacksSheetProps = {
  visible: boolean;
  onClose: () => void;
};

type Step = 'pick' | 'preview';

export function SuggestedQuestPacksSheet({ visible, onClose }: SuggestedQuestPacksSheetProps) {
  const {
    activeUniverse,
    activeSaga,
    currentChapter,
    playerProgress,
    addUserQuestPack,
    isTodayFocusLocked,
  } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);
  const focusLockCopy = getFocusLockCopy(activeUniverse.id);

  const [step, setStep] = useState<Step>('pick');
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [confirmOverLimit, setConfirmOverLimit] = useState(false);

  const orderedPacks = useMemo(
    () => sortQuestPacksForProfile(QUEST_PACKS, playerProgress.questStyleProfile),
    [playerProgress.questStyleProfile],
  );

  const selectedPack = selectedPackId ? getQuestPackById(selectedPackId) : undefined;

  const focusLimit = getDailyFocusLimit(playerProgress);
  const todayFocusCount = countTodayUserQuests(
    playerProgress.userQuests,
    getLocalDateKey(),
    activeUniverse.id,
  );

  const previewItems = useMemo(() => {
    if (!selectedPack || !currentChapter) return [];
    return previewQuestPack(
      selectedPack,
      activeUniverse,
      activeSaga,
      currentChapter,
      playerProgress.userQuests,
    );
  }, [activeSaga, activeUniverse, currentChapter, playerProgress.userQuests, selectedPack]);

  const selectedCount = selectedItemIds.size;
  const projectedFocusCount = todayFocusCount + selectedCount;
  const atFocusLimit = projectedFocusCount > focusLimit;

  const resetState = () => {
    setStep('pick');
    setSelectedPackId(null);
    setSelectedItemIds(new Set());
    setConfirmOverLimit(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handlePickPack = (pack: QuestPack) => {
    void Haptics.selectionAsync();
    setSelectedPackId(pack.id);
    setSelectedItemIds(new Set(pack.items.map((item) => item.id)));
    setConfirmOverLimit(false);
    setStep('preview');
  };

  const handleBack = () => {
    void Haptics.selectionAsync();
    setStep('pick');
    setSelectedPackId(null);
    setSelectedItemIds(new Set());
    setConfirmOverLimit(false);
  };

  const toggleItem = (itemId: string) => {
    void Haptics.selectionAsync();
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
    setConfirmOverLimit(false);
  };

  const submitPack = () => {
    if (!selectedPack || selectedCount === 0) return;

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addUserQuestPack(packItemsToCreateInputs(selectedPack, selectedItemIds));
    resetState();
  };

  const handleCreate = () => {
    if (!selectedPack || selectedCount === 0) return;
    if (atFocusLimit && !confirmOverLimit) {
      setConfirmOverLimit(true);
      return;
    }
    submitPack();
  };

  useEffect(() => {
    if (visible) return;
    resetState();
  }, [visible]);

  if (!currentChapter) return null;

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
              <Text style={[styles.eyebrow, { color: palette.gold }]}>
                {step === 'pick' ? 'QUICK START' : 'PACK PREVIEW'}
              </Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text style={[styles.close, { color: palette.fog }]}>✕</Text>
              </Pressable>
            </View>

            {step === 'pick' ? (
              <>
                <Text style={[styles.title, { color: palette.bone }]}>Suggested Quest Packs</Text>
                <Text style={[styles.sub, { color: palette.fog }]}>
                  Pick a pack to add 2–3 quests at once — preview before creating.
                </Text>

                <View style={styles.packList}>
                  {orderedPacks.map((pack) => (
                    <Pressable
                      key={pack.id}
                      onPress={() => handlePickPack(pack)}
                      style={[styles.packCard, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
                      <Text style={[styles.packTitle, { color: palette.bone }]}>{pack.title}</Text>
                      <Text style={[styles.packDescription, { color: palette.fog }]}>{pack.description}</Text>
                      <Text style={[styles.packMeta, { color: palette.gold }]}>
                        {pack.items.length} quests
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : selectedPack ? (
              <>
                <Pressable onPress={handleBack} hitSlop={8}>
                  <Text style={[styles.backLink, { color: palette.accent }]}>← All packs</Text>
                </Pressable>

                <Text style={[styles.title, { color: palette.bone }]}>{selectedPack.title}</Text>
                <Text style={[styles.sub, { color: palette.fog }]}>{selectedPack.description}</Text>

                <View style={[styles.focusRow, { borderColor: palette.panelBorder }]}>
                  <Text style={[styles.focusLabel, { color: palette.gold }]}>
                    {formatTodayFocusLabel(todayFocusCount, focusLimit, activeUniverse.id)}
                  </Text>
                  <Text style={[styles.focusHint, { color: palette.fog }]}>
                    {selectedCount > 0
                      ? `Adding ${selectedCount} — ${projectedFocusCount} total today`
                      : 'Select at least one quest'}
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

                <Text style={[styles.label, { color: palette.gold }]}>Quests in this pack</Text>
                <Text style={[styles.previewHint, { color: palette.fog }]}>
                  Toggle off any quest you do not want. Narrative titles use your active universe.
                </Text>

                <View style={styles.previewList}>
                  {previewItems.map((item) => {
                    const selected = selectedItemIds.has(item.packItemId);
                    const meta = getTaskCategoryMeta(item.category);

                    return (
                      <Pressable
                        key={item.packItemId}
                        onPress={() => toggleItem(item.packItemId)}
                        style={[
                          styles.previewCard,
                          {
                            borderColor: selected ? palette.gold : palette.panelBorder,
                            backgroundColor: palette.panel,
                            opacity: selected ? 1 : 0.55,
                          },
                        ]}>
                        <View style={styles.previewHeader}>
                          <View
                            style={[
                              styles.checkbox,
                              {
                                borderColor: selected ? palette.gold : palette.fog,
                                backgroundColor: selected ? `${palette.gold}33` : 'transparent',
                              },
                            ]}>
                            {selected ? (
                              <Text style={[styles.checkmark, { color: palette.gold }]}>✓</Text>
                            ) : null}
                          </View>
                          <Text style={[styles.narrativeTitle, { color: palette.bone }]} numberOfLines={2}>
                            {item.narrativeTitle}
                          </Text>
                        </View>
                        <Text style={[styles.realTask, { color: palette.fog }]}>
                          {item.originalTitle} · {meta.label}
                        </Text>
                        {item.options?.starterTaskTitle ? (
                          <Text style={[styles.starterHint, { color: palette.accent }]}>
                            2-min starter: {item.options.starterTaskTitle}
                          </Text>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>

                <GlowButton
                  label={confirmOverLimit ? 'CONTINUE ANYWAY' : `ADD ${selectedCount} QUEST${selectedCount === 1 ? '' : 'S'}`}
                  hint={
                    confirmOverLimit
                      ? 'Creates selected quests under Your Quests'
                      : selectedCount === 0
                        ? 'Select at least one quest'
                        : 'Review above, then confirm'
                  }
                  onPress={handleCreate}
                />

                {confirmOverLimit && (
                  <Pressable onPress={() => setConfirmOverLimit(false)} style={styles.cancelConfirm}>
                    <Text style={[styles.cancelConfirmText, { color: palette.fog }]}>Go back</Text>
                  </Pressable>
                )}
              </>
            ) : null}
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
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  dismissArea: { flex: 1 },
  sheet: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    maxHeight: '92%',
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 2,
  },
  close: {
    fontFamily: GameFonts.ui,
    fontSize: 18,
  },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 22,
    letterSpacing: 1,
  },
  sub: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    lineHeight: 18,
  },
  backLink: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 4,
  },
  packList: { gap: 10, marginTop: 4 },
  packCard: {
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  packTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 15,
    letterSpacing: 1,
  },
  packDescription: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
  },
  packMeta: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 2,
  },
  focusRow: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  focusLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 1,
  },
  focusHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    lineHeight: 14,
  },
  warningBox: {
    borderWidth: 1,
    padding: 12,
  },
  warningText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
  },
  focusLockedBox: {
    borderWidth: 1,
    padding: 12,
  },
  focusLockedText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
  },
  label: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 4,
  },
  previewHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 4,
  },
  previewList: { gap: 8 },
  previewCard: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkmark: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
  },
  narrativeTitle: {
    flex: 1,
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  realTask: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    marginLeft: 30,
  },
  starterHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    marginLeft: 30,
    fontStyle: 'italic',
  },
  cancelConfirm: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelConfirmText: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 1,
  },
});
