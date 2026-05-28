import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CharacterPortrait } from '@/components/rpg/character-portrait';
import { RelationshipProgressSection } from '@/components/rpg/relationship-progress-section';
import { GameFonts } from '@/constants/typography';
import type { NarrativeCharacter } from '@/types/narrative';

type CharacterCardProps = {
  character: NarrativeCharacter;
  index: number;
  affinity?: number;
};

export function CharacterCard({ character, index, affinity = 0 }: CharacterCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).springify()} style={styles.card}>
      <CharacterPortrait character={character} />
      <View style={styles.body}>
        <Text style={styles.name}>{character.name}</Text>
        <Text style={styles.role}>{character.role}</Text>
        <Text style={styles.personality}>{character.personality}</Text>
        <RelationshipProgressSection character={character} affinity={affinity} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  body: { flex: 1, gap: 3 },
  name: { fontFamily: GameFonts.ui, fontSize: 15, color: '#f5f0e8', letterSpacing: 1 },
  role: { fontFamily: GameFonts.uiSemi, fontSize: 10, color: '#f4a261', letterSpacing: 1 },
  personality: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    color: '#a8a29e',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
