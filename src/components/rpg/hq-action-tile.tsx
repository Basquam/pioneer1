import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getUniverseSkin } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';

type HqActionTileProps = {
  icon: string;
  label: string;
  sub?: string;
  universeId: string;
  emphasis?: boolean;
  onPress: () => void;
};

export function HqActionTile({
  icon,
  label,
  sub,
  universeId,
  emphasis = false,
  onPress,
}: HqActionTileProps) {
  const skin = getUniverseSkin(universeId);

  return (
    <Pressable
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.tile,
        {
          borderColor: emphasis ? skin.accentPrimary : skin.surfaceBorder,
          backgroundColor: emphasis ? `${skin.accentPrimary}18` : 'rgba(13, 10, 20, 0.92)',
          opacity: pressed ? 0.85 : 1,
          transform: [{ skewX: `${skin.cardSkew * 0.5}deg` }],
        },
      ]}>
      <Text style={[styles.icon, { color: skin.accentPrimary }]}>{icon}</Text>
      <Text style={[QuestoryTypography.caption, { color: '#f5f0e6', letterSpacing: 1.5 }]} numberOfLines={1}>
        {label}
      </Text>
      {sub ? (
        <Text style={[QuestoryTypography.caption, { color: '#9a93a8', fontSize: 9 }]} numberOfLines={2}>
          {sub}
        </Text>
      ) : null}
      <View style={[styles.cornerAccent, { backgroundColor: skin.accentPrimary }]} />
    </Pressable>
  );
}

type HqActionTileRowProps = {
  universeId: string;
  tiles: Array<{
    key: string;
    icon: string;
    label: string;
    sub?: string;
    emphasis?: boolean;
    onPress: () => void;
  }>;
};

export function HqActionTileRow({ universeId, tiles }: HqActionTileRowProps) {
  return (
    <View style={styles.row}>
      {tiles.map((tile) => (
        <HqActionTile
          key={tile.key}
          icon={tile.icon}
          label={tile.label}
          sub={tile.sub}
          universeId={universeId}
          emphasis={tile.emphasis}
          onPress={tile.onPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  tile: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
    minHeight: 84,
  },
  icon: { fontSize: 20, lineHeight: 24 },
  cornerAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 2,
  },
});
