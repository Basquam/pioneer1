export const GameLayout = {
  screenPaddingHorizontal: 20,
  screenPaddingTop: 8,
  screenContentGap: 14,
  /** Legacy static inset — prefer useTabBarScrollInset() on tab screens. */
  scrollBottomInset: 100,
  modalHorizontalPadding: 20,
  modalVerticalPadding: 36,
  modalMaxHeight: '88%' as const,
  panelPadding: 16,
  sectionLabelMarginTop: 8,
  /** Tab bar content above the home-indicator inset. */
  tabBarInnerHeight: 52,
  tabBarBottomPadding: 8,
  tabBarScrollBuffer: 20,
  /** GlowButton block height incl. margins — used for onboarding footers. */
  footerButtonBlockHeight: 92,
} as const;

export function getTabBarOffset(bottomInset: number) {
  return GameLayout.tabBarInnerHeight + GameLayout.tabBarBottomPadding + bottomInset;
}

export function getTabBarScrollInset(bottomInset: number) {
  return getTabBarOffset(bottomInset) + GameLayout.tabBarScrollBuffer;
}

export function getOnboardingScrollInset(bottomInset: number, hasFooter: boolean) {
  if (!hasFooter) return bottomInset + 16;
  return GameLayout.footerButtonBlockHeight + bottomInset + 12;
}
