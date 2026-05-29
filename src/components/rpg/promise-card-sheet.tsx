import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
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

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import {
  buildPromiseCard,
  copyPromiseCardText,
  formatPromiseCardPlainText,
} from '@/lib/promise-card';

type PromiseCardSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function PromiseCardSheet({ visible, onClose }: PromiseCardSheetProps) {
  const { activeUniverse, activeSaga, playerProgress, quests } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);
  const [copyHint, setCopyHint] = useState<string | null>(null);

  const promiseCard = useMemo(
    () => buildPromiseCard(playerProgress, activeUniverse, activeSaga, quests),
    [activeSaga, activeUniverse, playerProgress, quests],
  );

  const handleClose = () => {
    setCopyHint(null);
    onClose();
  };

  const handleCopy = async () => {
    if (!promiseCard) return;

    const text = formatPromiseCardPlainText(promiseCard);
    const copied = await copyPromiseCardText(text);
    void Haptics.selectionAsync();

    if (copied) {
      setCopyHint(Platform.OS === 'web' ? 'Copied to clipboard.' : 'Share sheet opened — copy from there.');
    } else {
      setCopyHint('Could not copy — select the text below manually.');
    }
  };

  if (!promiseCard) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
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
            contentContainerStyle={[styles.sheetScroll, { paddingBottom: modalBottomInset }]}>
            <View style={styles.header}>
              <Text style={[styles.eyebrow, { color: palette.gold }]}>PROMISE CARD</Text>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Text style={[styles.close, { color: palette.fog }]}>✕</Text>
              </Pressable>
            </View>

            <View style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
              <Text style={[styles.dateLabel, { color: palette.fog }]}>{promiseCard.dateLabel}</Text>

              <View style={[styles.metaRow, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.metaLabel, { color: palette.accent }]}>UNIVERSE</Text>
                <Text style={[styles.metaValue, { color: palette.bone }]}>{promiseCard.universeName}</Text>
              </View>

              <View style={[styles.metaRow, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.metaLabel, { color: palette.accent }]}>SAGA</Text>
                <Text style={[styles.metaValue, { color: palette.bone }]}>{promiseCard.sagaTitle}</Text>
              </View>

              <Text style={[styles.commitment, { color: palette.bone }]}>{promiseCard.commitmentLine}</Text>

              <View style={[styles.questBlock, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.questHeading, { color: palette.gold }]}>LOCKED FOCUS</Text>
                {promiseCard.quests.map((quest, index) => (
                  <View key={`${quest.narrativeTitle}-${index}`} style={styles.questRow}>
                    <Text style={[styles.questNumber, { color: palette.gold }]}>{index + 1}.</Text>
                    <View style={styles.questCopy}>
                      <Text style={[styles.questNarrative, { color: palette.bone }]}>
                        {quest.narrativeTitle}
                      </Text>
                      <Text style={[styles.questReal, { color: palette.fog }]}>{quest.originalTitle}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleCopy}
              style={[styles.copyButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
              <Text style={[styles.copyButtonText, { color: palette.bone }]}>COPY TEXT</Text>
            </Pressable>

            {copyHint ? (
              <Text style={[styles.copyHint, { color: palette.fog }]}>{copyHint}</Text>
            ) : null}

            <View style={[styles.plainPreview, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
              <Text style={[styles.plainPreviewLabel, { color: palette.fog }]}>PLAIN TEXT PREVIEW</Text>
              <Text style={[styles.plainPreviewBody, { color: palette.bone }]}>
                {formatPromiseCardPlainText(promiseCard)}
              </Text>
            </View>
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
  card: {
    borderWidth: 2,
    padding: 16,
    gap: 12,
    transform: [{ skewX: '-2deg' }],
  },
  dateLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1,
    lineHeight: 16,
  },
  metaRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 2,
  },
  metaLabel: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 2 },
  metaValue: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 0.5 },
  commitment: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 16,
    lineHeight: 23,
    fontStyle: 'italic',
  },
  questBlock: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 10,
  },
  questHeading: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  questRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  questNumber: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 1, lineHeight: 20 },
  questCopy: { flex: 1, gap: 2 },
  questNarrative: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.5,
    lineHeight: 19,
  },
  questReal: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  copyButton: {
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    transform: [{ skewX: '-2deg' }],
  },
  copyButtonText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 2,
  },
  copyHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  plainPreview: {
    borderWidth: 1,
    padding: 12,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  plainPreviewLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 2,
  },
  plainPreviewBody: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
});
