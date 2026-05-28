import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getAppEnvironmentLabel, getAppName, getAppVersionLabel } from '@/lib/app-info';

export function ProfileAppInfo() {
  const { activeUniverse, activeSaga } = useGame();
  const { palette } = activeUniverse;

  const rows = [
    { label: 'App', value: getAppName() },
    { label: 'Version', value: getAppVersionLabel() },
    { label: 'Environment', value: getAppEnvironmentLabel() },
    { label: 'Universe', value: activeUniverse.id },
    { label: 'Saga', value: activeSaga.id },
  ];

  return (
    <View style={styles.block}>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={[styles.label, { color: palette.fog }]}>{row.label}</Text>
          <Text style={[styles.value, { color: palette.bone }]} selectable numberOfLines={2}>
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 5 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1.2,
    flexShrink: 0,
    minWidth: 72,
  },
  value: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 0.2,
    lineHeight: 13,
    textAlign: 'right',
    flex: 1,
    minWidth: 0,
  },
});
