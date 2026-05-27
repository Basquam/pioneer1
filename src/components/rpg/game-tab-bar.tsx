import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

const TAB_META: Record<string, { label: string; icon: string }> = {
  hq: { label: 'HQ', icon: '⌂' },
  quests: { label: 'QUESTS', icon: '⚔' },
  story: { label: 'STORY', icon: '📜' },
  map: { label: 'MAP', icon: '◎' },
  profile: { label: 'PROFILE', icon: '★' },
};

export function GameTabBar(props: {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    navigate: (name: string) => void;
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
  };
}) {
  const { state, navigation } = props;
  const insets = useSafeAreaInsets();
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: insets.bottom + 8,
          backgroundColor: palette.ink,
          borderTopColor: palette.panelBorder,
        },
      ]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const meta = TAB_META[route.name] ?? { label: route.name, icon: '•' };

        const onPress = () => {
          void Haptics.selectionAsync();
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            <Text style={[styles.icon, { color: focused ? palette.gold : palette.fog }]}>
              {meta.icon}
            </Text>
            <Text
              style={[
                styles.label,
                { color: focused ? palette.gold : palette.fog },
              ]}>
              {meta.label}
            </Text>
            {focused && (
              <View style={[styles.indicator, { backgroundColor: palette.primary }]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  icon: { fontSize: 18 },
  label: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1 },
  indicator: {
    width: 20,
    height: 2,
    marginTop: 2,
    transform: [{ skewX: '-12deg' }],
  },
});
