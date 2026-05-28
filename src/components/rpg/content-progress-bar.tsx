import { StyleSheet, View } from 'react-native';

import type { UniversePalette } from '@/types/narrative';

type ContentProgressBarProps = {
  completed: number;
  total: number;
  palette: UniversePalette;
  height?: number;
};

export function ContentProgressBar({
  completed,
  total,
  palette,
  height = 4,
}: ContentProgressBarProps) {
  const ratio = total > 0 ? Math.min(1, completed / total) : 0;

  return (
    <View style={[styles.track, { backgroundColor: palette.xpTrack, height }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: palette.xpFill,
            width: `${ratio * 100}%`,
            height,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 2,
  },
});
