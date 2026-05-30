import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getFeatureDiscoveryState } from '@/lib/feature-discovery';

export function FeatureDiscoverySettings() {
  const { activeUniverse, playerProgress, setGuidedFeatureDiscovery, setShowAdvancedFeatureTools } =
    useGame();
  const { palette } = activeUniverse;
  const state = getFeatureDiscoveryState(playerProgress);

  return (
    <View style={styles.wrap}>
      <View style={[styles.row, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: palette.bone }]}>Guided feature discovery</Text>
          <Text style={[styles.subtitle, { color: palette.fog }]}>
            Introduce advanced tools gradually instead of all at once.
          </Text>
        </View>
        <Switch
          value={state.guidedDiscoveryEnabled}
          onValueChange={(enabled) => {
            void Haptics.selectionAsync();
            setGuidedFeatureDiscovery(enabled);
          }}
          trackColor={{ false: palette.panelBorder, true: palette.primary }}
          thumbColor={state.guidedDiscoveryEnabled ? palette.gold : palette.fog}
        />
      </View>

      {state.guidedDiscoveryEnabled ? (
        <Pressable
          onPress={() => {
            void Haptics.selectionAsync();
            setShowAdvancedFeatureTools(!state.showAdvancedTools);
          }}
          style={[styles.row, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: palette.bone }]}>Show advanced tools</Text>
            <Text style={[styles.subtitle, { color: palette.fog }]}>
              See every optional behavior tool in Add Quest now.
            </Text>
          </View>
          <Text style={[styles.value, { color: palette.gold }]}>
            {state.showAdvancedTools ? 'ON' : 'OFF'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: {
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    transform: [{ skewX: '-2deg' }],
  },
  copy: { flex: 1, gap: 4, minWidth: 0 },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  value: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.2,
    flexShrink: 0,
  },
});
