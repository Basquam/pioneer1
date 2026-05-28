import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { GameLayout } from '@/constants/layout';
import { useOnboardingScrollInset } from '@/hooks/use-scroll-insets';

type OnboardingScrollProps = {
  children: ReactNode;
  footer?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function OnboardingScroll({ children, footer, contentContainerStyle }: OnboardingScrollProps) {
  const scrollInset = useOnboardingScrollInset(Boolean(footer));

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: footer ? GameLayout.screenContentGap : scrollInset },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled>
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    gap: GameLayout.screenContentGap,
  },
  footer: {
    paddingTop: 4,
  },
});
