import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { getTheme } from '@/data/themes';
import type { ThemeId } from '@/types/theme';

type MapNodeProps = {
  themeId: ThemeId;
  active: boolean;
  influence: number;
  onPress: () => void;
};

export function MapNode({ themeId, active, influence, onPress }: MapNodeProps) {
  const theme = getTheme(themeId);
  const { colors } = theme;

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Pressable
        onPress={onPress}
        style={[
          styles.node,
          {
            backgroundColor: colors.panel,
            borderColor: active ? colors.gold : colors.panelBorder,
          },
        ]}>
        <Text style={styles.icon}>{theme.icon}</Text>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.bone }]}>{theme.name}</Text>
          <Text style={[styles.loc, { color: colors.fog }]}>{theme.locationName}</Text>
        </View>
        <View style={styles.threat}>
          <Text style={[styles.threatLabel, { color: colors.villainGlow }]}>THREAT</Text>
          <Text style={[styles.threatVal, { color: colors.bone }]}>{influence}%</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  node: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 2,
    marginBottom: 10,
    gap: 12,
  },
  icon: { fontSize: 28 },
  info: { flex: 1 },
  name: { fontFamily: GameFonts.ui, fontSize: 15, letterSpacing: 1 },
  loc: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1, marginTop: 2 },
  threat: { alignItems: 'flex-end' },
  threatLabel: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 2 },
  threatVal: { fontFamily: GameFonts.ui, fontSize: 18 },
});
