import { type ReactNode, type RefObject } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { GameLayout } from '@/constants/layout';
import { useTabBarScrollInset } from '@/hooks/use-scroll-insets';

type ScreenScrollProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Set false for non-tab screens that manage their own bottom inset. */
  includeTabBarInset?: boolean;
  scrollRef?: RefObject<ScrollView | null>;
};

export function ScreenScroll({
  children,
  contentContainerStyle,
  includeTabBarInset = true,
  scrollRef,
}: ScreenScrollProps) {
  const tabBarInset = useTabBarScrollInset();

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={[
        includeTabBarInset && { paddingBottom: tabBarInset },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled>
      <View style={styles.pad}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  pad: {
    paddingHorizontal: GameLayout.screenPaddingHorizontal,
    paddingTop: GameLayout.screenPaddingTop,
    gap: GameLayout.screenContentGap,
  },
});
