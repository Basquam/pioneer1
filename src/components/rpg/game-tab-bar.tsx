import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
import { getUniverseTabMeta } from '@/lib/universe-ui-copy';
import { QuestoryTheme } from '@/theme/questory-theme';
import { getUniverseSkin } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';

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
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const skin = getUniverseSkin(activeUniverse.id);
  const tabMeta = getUniverseTabMeta(activeUniverse.id);

  return (
    <View
      style={[
        styles.barWrap,
        {
          paddingBottom: insets.bottom + 6,
          backgroundColor: QuestoryTheme.colors.background.panel,
          borderTopColor: `${skin.accentPrimary}44`,
        },
        QuestoryTheme.shadow.raised,
      ]}>
      <View pointerEvents="none" style={[styles.barGlow, { backgroundColor: skin.glowColor }]} />
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = tabMeta[route.name] ?? { label: route.name, icon: '•' };

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
              {focused ? (
                <View
                  style={[
                    styles.activePill,
                    {
                      backgroundColor: `${skin.accentPrimary}22`,
                      borderColor: skin.accentPrimary,
                    },
                  ]}
                />
              ) : null}
              <Text style={[styles.icon, { color: focused ? skin.accentPrimary : palette.fog }]}>
                {meta.icon}
              </Text>
              <Text
                style={[
                  QuestoryTypography.caption,
                  {
                    color: focused ? palette.bone : palette.fog,
                    letterSpacing: focused ? 1.5 : 0.8,
                    fontSize: 9,
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}>
                {meta.label}
              </Text>
              {focused && visualTheme.panelUsesHolographic ? (
                <View style={[styles.indicator, { backgroundColor: skin.accentSecondary }]} />
              ) : focused ? (
                <View style={[styles.indicator, { backgroundColor: skin.accentPrimary }]} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    borderTopWidth: 1,
    position: 'relative',
  },
  barGlow: {
    position: 'absolute',
    top: -1,
    left: 24,
    right: 24,
    height: 1,
    opacity: 0.6,
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    minWidth: 0,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: -2,
    left: 2,
    right: 2,
    bottom: -2,
    borderWidth: 1,
    borderRadius: 2,
  },
  icon: { fontSize: 18, zIndex: 1 },
  indicator: {
    width: 16,
    height: 2,
    marginTop: 1,
    transform: [{ skewX: '-10deg' }],
    zIndex: 1,
  },
});
