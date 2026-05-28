import { StyleSheet, Text, View } from 'react-native';

import { useGame } from '@/hooks/use-game';
import type { NarrativeCharacter } from '@/types/narrative';

type CharacterPortraitProps = {
  character: NarrativeCharacter;
  size?: 'sm' | 'md';
};

export function CharacterPortrait({ character, size = 'md' }: CharacterPortraitProps) {
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const dim = size === 'sm' ? 40 : 52;
  const isVillain = character.isVillain;

  return (
    <View
      style={[
        styles.frame,
        {
          width: dim,
          height: dim,
          borderColor: isVillain ? palette.villainGlow : palette.gold,
          backgroundColor: palette.ink,
        },
      ]}>
      <Text style={[styles.emoji, { fontSize: size === 'sm' ? 18 : 24 }]}>{character.portrait}</Text>
      {!isVillain && playerProgress.relationshipByCharacter[character.id] && (
        <View style={[styles.dot, { backgroundColor: palette.accent }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-4deg' }],
  },
  emoji: {},
  dot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
