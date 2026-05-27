import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInLeft } from 'react-native-reanimated';

import { CharacterPortrait } from '@/components/rpg/character-portrait';
import { GameFonts } from '@/constants/typography';
import { getCharacter } from '@/lib/narrative-helpers';
import { useGame } from '@/hooks/use-game';
import type { DialogueBeat } from '@/types/narrative';

const CHAR_DELAY_MS = 22;

type CharacterDialoguePanelProps = {
  beat: DialogueBeat;
  animate?: boolean;
  onTypingComplete?: () => void;
};

export function CharacterDialoguePanel({
  beat,
  animate = true,
  onTypingComplete,
}: CharacterDialoguePanelProps) {
  const { activeUniverse, activeSaga, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const character = getCharacter(activeSaga, beat.characterId);
  const [visibleText, setVisibleText] = useState(animate ? '' : beat.line);

  useEffect(() => {
    if (!animate) {
      setVisibleText(beat.line);
      return;
    }
    setVisibleText('');
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setVisibleText(beat.line.slice(0, index));
      if (index >= beat.line.length) {
        clearInterval(interval);
        onTypingComplete?.();
      }
    }, CHAR_DELAY_MS);
    return () => clearInterval(interval);
  }, [animate, beat.line, onTypingComplete]);

  if (!character) return null;

  const tier = playerProgress.relationshipByCharacter[character.id];

  return (
    <Animated.View entering={FadeInLeft.duration(400)} style={styles.wrapper}>
      <View
        style={[
          styles.panel,
          {
            backgroundColor: palette.panel,
            borderColor: character.isVillain ? palette.villainGlow : palette.panelBorder,
          },
        ]}>
        <View style={[styles.accent, { backgroundColor: character.isVillain ? palette.villainGlow : palette.primary }]} />
        <View style={styles.row}>
          <CharacterPortrait character={character} size="md" />
          <View style={styles.body}>
            <View style={styles.headerRow}>
              <View style={styles.nameBlock}>
                <Text style={[styles.speaker, { color: palette.gold }]}>{character.name.toUpperCase()}</Text>
                <Text style={[styles.role, { color: palette.fog }]}>{character.role}</Text>
              </View>
              {beat.badge && (
                <View style={[styles.badge, { backgroundColor: character.isVillain ? palette.villain : palette.primary }]}>
                  <Text style={[styles.badgeText, { color: palette.bone }]}>{beat.badge}</Text>
                </View>
              )}
            </View>
            <Animated.Text entering={FadeIn.duration(250)} key={beat.line} style={[styles.line, { color: palette.bone }]}>
              {visibleText}
              {animate && visibleText.length < beat.line.length && (
                <Text style={{ color: palette.accent }}>▌</Text>
              )}
            </Animated.Text>
            {tier && !character.isVillain && (
              <Text style={[styles.tier, { color: palette.accent }]}>RELATIONSHIP · {tier.toUpperCase()}</Text>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'stretch' },
  panel: { borderWidth: 1, overflow: 'hidden', transform: [{ skewX: '-2deg' }] },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  row: { flexDirection: 'row', padding: 14, paddingLeft: 18, gap: 12 },
  body: { flex: 1, gap: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  nameBlock: { flex: 1, gap: 2 },
  speaker: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 2 },
  role: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, transform: [{ skewX: '-8deg' }] },
  badgeText: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  line: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  tier: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 2, marginTop: 2 },
});
