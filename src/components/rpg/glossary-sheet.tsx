import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import { getGlossaryEntries } from '@/lib/glossary-copy';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';

type GlossarySheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function GlossarySheet({ visible, onClose }: GlossarySheetProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);
  const entries = getGlossaryEntries(activeUniverse, ui, activeSaga.id);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: `${palette.void}ee` }]} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: palette.night,
              borderColor: palette.panelBorder,
              maxHeight: GameLayout.modalMaxHeight,
            },
          ]}
          onPress={(event) => event.stopPropagation()}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: palette.bone }]}>HELP / GLOSSARY</Text>
            <Text style={[styles.subtitle, { color: palette.fog }]}>
              Terms for {activeUniverse.name}. Wording shifts by universe.
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.scrollContent, { paddingBottom: modalBottomInset }]}>
            {entries.map((entry) => (
              <View
                key={entry.term}
                style={[
                  styles.entry,
                  { backgroundColor: palette.panel, borderColor: palette.panelBorder },
                ]}>
                <Text style={[styles.entryTerm, { color: palette.gold }]}>{entry.term}</Text>
                <Text style={[styles.entryBody, { color: palette.bone }]}>{entry.body}</Text>
              </View>
            ))}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={[styles.closeButton, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
            <Text style={[styles.closeLabel, { color: palette.fog }]}>CLOSE</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 16,
    transform: [{ skewX: '-2deg' }],
    gap: 12,
  },
  header: {
    paddingHorizontal: GameLayout.panelPadding,
    gap: 6,
  },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.4,
    lineHeight: 15,
  },
  scrollContent: {
    paddingHorizontal: GameLayout.panelPadding,
    gap: 8,
  },
  entry: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
  entryTerm: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  entryBody: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  closeButton: {
    marginHorizontal: GameLayout.panelPadding,
    marginBottom: 12,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    transform: [{ skewX: '-3deg' }],
  },
  closeLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 2,
  },
});
