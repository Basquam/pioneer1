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
import { getTaskCategoryMeta, TASK_CATEGORIES } from '@/lib/task-categories';
import type { TaskCategory } from '@/types/narrative';

type AddQuestSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function AddQuestSheet({ visible, onClose }: AddQuestSheetProps) {
  const { activeUniverse, currentChapter, addUserQuest } = useGame();
  const { palette } = activeUniverse;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('cleaning');

  const selectedMeta = getTaskCategoryMeta(category);

  const handleClose = () => {
    setTitle('');
    setCategory('cleaning');
    onClose();
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addUserQuest(title, category);
    setTitle('');
    setCategory('cleaning');
  };

  useEffect(() => {
    if (visible) return;
    setTitle('');
    setCategory('cleaning');
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
            contentContainerStyle={styles.sheetScroll}>
            <View style={styles.header}>
              <Text style={[styles.eyebrow, { color: palette.gold }]}>NEW BOUNTY</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text style={[styles.close, { color: palette.fog }]}>✕</Text>
              </Pressable>
            </View>

            <Text style={[styles.title, { color: palette.bone }]}>Add Quest</Text>
            <Text style={[styles.sub, { color: palette.fog }]}>
              Turn a real task into a {currentChapter.title} mission.
            </Text>

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

            <Text style={[styles.label, { color: palette.gold }]}>QUEST ARCHETYPE</Text>
            <Text style={[styles.categoryHelper, { color: palette.fog }]}>
              Choose what kind of real-life task this is. We'll turn it into a story quest.
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

            <GlowButton label="CREATE QUEST" hint="Weave it into the story" onPress={handleCreate} />
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
    paddingBottom: 32,
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
