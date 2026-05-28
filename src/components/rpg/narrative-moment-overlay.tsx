import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { CharacterPortrait } from '@/components/rpg/character-portrait';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { getCharacter } from '@/lib/narrative-helpers';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';

export function NarrativeMomentOverlay() {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga, narrativeMoment, dismissNarrativeMoment } = useGame();
  const { palette } = activeUniverse;

  if (!narrativeMoment || narrativeMoment.type !== 'villain_taunt') return null;

  const character = getCharacter(activeSaga, narrativeMoment.characterId);
  if (!character) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <Pressable style={[styles.backdrop, { backgroundColor: `${palette.void}dd` }]} onPress={dismissNarrativeMoment}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <Animated.View
            entering={FadeInDown.duration(450)}
            exiting={FadeOut.duration(250)}
            style={[
              styles.momentCard,
              {
                backgroundColor: palette.panel,
                borderColor: palette.villainGlow,
              },
            ]}>
            <CharacterPortrait character={character} />
            <View style={styles.momentBody}>
              <Text style={[styles.momentBadge, { color: palette.villainGlow }]}>{ui.antagonistTauntBadge}</Text>
              <Text style={[styles.momentName, { color: palette.bone }]}>{character.name}</Text>
              <Text style={[styles.momentLine, { color: palette.bone }]}>{narrativeMoment.line}</Text>
              <Text style={[styles.dismiss, { color: palette.fog }]}>TAP TO DISMISS</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: GameLayout.modalHorizontalPadding,
    paddingVertical: GameLayout.modalVerticalPadding,
  },
  momentCard: {
    borderWidth: 2,
    padding: 20,
    flexDirection: 'row',
    gap: 14,
    transform: [{ skewX: '-2deg' }],
    alignItems: 'flex-start',
  },
  momentBody: { flex: 1, gap: 6, minWidth: 0 },
  momentBadge: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  momentName: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 2 },
  momentLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    marginTop: 4,
  },
  dismiss: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2, marginTop: 8 },
});
