import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useGame } from '@/hooks/use-game';
import { resolveCharacterPortrait } from '@/lib/narrative-media';
import type { CharacterPortraitContext, NarrativeCharacter } from '@/types/narrative';

type CharacterPortraitProps = {
  character: NarrativeCharacter;
  size?: 'sm' | 'md' | 'lg';
  context?: CharacterPortraitContext;
};

export function CharacterPortrait({ character, size = 'md', context = 'default' }: CharacterPortraitProps) {
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const [useNeutralFallback, setUseNeutralFallback] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const portraitContext = useNeutralFallback ? 'default' : context;
  const portraitImage = resolveCharacterPortrait(character, portraitContext);
  const showImage = portraitImage && !imageFailed;
  const dim = size === 'sm' ? 40 : size === 'lg' ? 72 : 52;
  const emojiSize = size === 'sm' ? 18 : size === 'lg' ? 32 : 24;
  const isVillain = character.isVillain;

  useEffect(() => {
    setUseNeutralFallback(false);
    setImageFailed(false);
  }, [character.id, context]);

  const handleImageError = () => {
    if (!useNeutralFallback && context !== 'default') {
      setUseNeutralFallback(true);
      return;
    }
    setImageFailed(true);
  };

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
      {showImage ? (
        <Image
          source={portraitImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          onError={handleImageError}
          transition={150}
        />
      ) : (
        <Text style={[styles.emoji, { fontSize: emojiSize }]}>{character.portrait}</Text>
      )}
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
    overflow: 'hidden',
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
