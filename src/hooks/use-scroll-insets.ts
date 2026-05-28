import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getOnboardingScrollInset,
  getTabBarOffset,
  getTabBarScrollInset,
} from '@/constants/layout';

export function useTabBarScrollInset() {
  const insets = useSafeAreaInsets();
  return getTabBarScrollInset(insets.bottom);
}

export function useTabBarOffset() {
  const insets = useSafeAreaInsets();
  return getTabBarOffset(insets.bottom);
}

export function useOnboardingScrollInset(hasFooter = false) {
  const insets = useSafeAreaInsets();
  return getOnboardingScrollInset(insets.bottom, hasFooter);
}

export function useModalBottomInset(extra = 0) {
  const insets = useSafeAreaInsets();
  return insets.bottom + extra;
}
