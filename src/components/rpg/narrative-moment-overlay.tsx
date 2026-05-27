import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, ZoomIn } from 'react-native-reanimated';

import { CharacterPortrait } from '@/components/rpg/character-portrait';
import { GameFonts } from '@/constants/typography';
import { getCharacter } from '@/lib/narrative-helpers';
import { useGame } from '@/hooks/use-game';

export function NarrativeMomentOverlay() {
  const { activeUniverse, activeSaga, narrativeMoment, dismissNarrativeMoment } = useGame();
  const { palette } = activeUniverse;

  if (!narrativeMoment) return null;

  if (narrativeMoment.type === 'chapter_transition') {
    return (
      <Modal visible transparent animationType="fade" statusBarTranslucent>
        <Pressable
          style={[styles.backdrop, { backgroundColor: palette.void }]}
          onPress={dismissNarrativeMoment}>
          <Animated.View entering={ZoomIn.duration(700)} style={styles.transitionWrap}>
            <Text style={[styles.transitionEyebrow, { color: palette.accent }]}>CHAPTER COMPLETE</Text>
            <Text style={[styles.transitionTitle, { color: palette.bone }]}>
              {narrativeMoment.title}
            </Text>
            <Text style={[styles.transitionHint, { color: palette.fog }]}>TAP TO CONTINUE</Text>
          </Animated.View>
        </Pressable>
      </Modal>
    );
  }

  const character = getCharacter(activeSaga, narrativeMoment.characterId);
  if (!character) return null;

  const isTaunt = narrativeMoment.type === 'villain_taunt';

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <Pressable style={[styles.backdrop, { backgroundColor: `${palette.void}dd` }]} onPress={dismissNarrativeMoment}>
        <Animated.View
          entering={FadeInDown.duration(450)}
          exiting={FadeOut.duration(250)}
          style={[
            styles.momentCard,
            {
              backgroundColor: palette.panel,
              borderColor: isTaunt ? palette.villainGlow : palette.gold,
            },
          ]}>
          <CharacterPortrait character={character} />
          <View style={styles.momentBody}>
            <Text style={[styles.momentBadge, { color: isTaunt ? palette.villainGlow : palette.gold }]}>
              {isTaunt ? 'VILLAIN TAUNT' : 'QUEST CLEARED'}
            </Text>
            <Text style={[styles.momentName, { color: palette.bone }]}>{character.name}</Text>
            {narrativeMoment.type === 'quest_complete' && (
              <Text style={[styles.questRef, { color: palette.fog }]}>{narrativeMoment.questTitle}</Text>
            )}
            <Text style={[styles.momentLine, { color: palette.bone }]}>{narrativeMoment.line}</Text>
            <Text style={[styles.dismiss, { color: palette.fog }]}>TAP TO DISMISS</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: 24 },
  momentCard: {
    borderWidth: 2,
    padding: 20,
    flexDirection: 'row',
    gap: 14,
    transform: [{ skewX: '-2deg' }],
  },
  momentBody: { flex: 1, gap: 6 },
  momentBadge: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  momentName: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 2 },
  questRef: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1 },
  momentLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    marginTop: 4,
  },
  dismiss: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2, marginTop: 8 },
  transitionWrap: { alignItems: 'center', gap: 12 },
  transitionEyebrow: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 4 },
  transitionTitle: { fontFamily: GameFonts.display, fontSize: 36, letterSpacing: 4, textAlign: 'center' },
  transitionHint: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2, marginTop: 24 },
});
