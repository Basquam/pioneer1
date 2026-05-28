import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { GameLayout } from '@/constants/layout';

type ScreenScrollProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function ScreenScroll({ children, contentContainerStyle }: ScreenScrollProps) {
  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      <View style={styles.pad}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: GameLayout.scrollBottomInset },
  pad: {
    paddingHorizontal: GameLayout.screenPaddingHorizontal,
    paddingTop: GameLayout.screenPaddingTop,
    gap: GameLayout.screenContentGap,
  },
});
