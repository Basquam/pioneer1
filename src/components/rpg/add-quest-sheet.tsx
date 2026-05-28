import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
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

import { GlowButton } from '@/components/rpg/glow-button';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import {
  countTodayUserQuests,
  formatTodayFocusLabel,
  getDailyFocusLimit,
  getDailyFocusOverLimitMessage,
} from '@/lib/daily-focus';
import { getTaskCategoryMeta, TASK_CATEGORIES } from '@/lib/task-categories';
import type { TaskCategory } from '@/types/narrative';

type AddQuestSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function AddQuestSheet({ visible, onClose }: AddQuestSheetProps) {
  const { activeUniverse, currentChapter, playerProgress, addUserQuest } = useGame();
  const { palette } = activeUniverse;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('cleaning');
  const [confirmOverLimit, setConfirmOverLimit] = useState(false);

  const selectedMeta = getTaskCategoryMeta(category);
  const modalBottomInset = useModalBottomInset(32);
  const focusLimit = getDailyFocusLimit(playerProgress);
  const todayFocusCount = countTodayUserQuests(playerProgress.userQuests);
  const atFocusLimit = todayFocusCount >= focusLimit;

  const handleClose = () => {
    setTitle('');
    setCategory('cleaning');
    setConfirmOverLimit(false);
    onClose();
  };

  const submitQuest = () => {
    if (!title.trim()) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addUserQuest(title, category);
    setTitle('');
    setCategory('cleaning');
    setConfirmOverLimit(false);
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    if (atFocusLimit && !confirmOverLimit) {
      setConfirmOverLimit(true);
      return;
    }
    submitQuest();
  };

  useEffect(() => {
    if (visible) return;
    setTitle('');
    setCategory('cleaning');
    setConfirmOverLimit(false);
  }, [visible]);

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
              <Text style={[styles.eyebrow, { color: palette.gold }]}>NEW QUEST</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text style={[styles.close, { color: palette.fog }]}>✕</Text>
              </Pressable>
            </View>

            <Text style={[styles.title, { color: palette.bone }]}>Add Quest</Text>
            <Text style={[styles.sub, { color: palette.fog }]} numberOfLines={2}>
              {currentChapter
                ? `Turn a real task into a quest for ${currentChapter.title}.`
                : 'Turn a real task into a frontier quest.'}
            </Text>

            <View style={[styles.focusRow, { borderColor: palette.panelBorder }]}>
              <Text style={[styles.focusLabel, { color: palette.gold }]}>
                {formatTodayFocusLabel(todayFocusCount, focusLimit)}
              </Text>
              <Text style={[styles.focusHint, { color: palette.fog }]}>
                {todayFocusCount < focusLimit
                  ? 'First three quests today become Focus Quests on the board.'
                  : 'You can still add more — they just won’t be marked as Focus Quests.'}
              </Text>
            </View>

            {confirmOverLimit && (
              <View style={[styles.warningBox, { backgroundColor: palette.panel, borderColor: palette.accent }]}>
                <Text style={[styles.warningText, { color: palette.bone }]}>
                  {getDailyFocusOverLimitMessage(focusLimit)}
                </Text>
              </View>
            )}

            <Text style={[styles.label, { color: palette.gold }]}>REAL TASK</Text>
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

            <Text style={[styles.label, { color: palette.gold }]}>QUEST TYPE</Text>
            <Text style={[styles.categoryHelper, { color: palette.fog }]}>
              Pick a type. We&apos;ll weave it into the saga.
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {TASK_CATEGORIES.map((cat) => {
                const selected = category === cat;
                const meta = getTaskCategoryMeta(cat);
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      void Haptics.selectionAsync();
                      setCategory(cat);
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

            <GlowButton
              label={confirmOverLimit ? 'CONTINUE ANYWAY' : 'CREATE QUEST'}
              hint={confirmOverLimit ? 'Add beyond today\'s Focus Quests' : 'Add to the Quest Board'}
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
