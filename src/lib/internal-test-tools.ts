/** Local Metro dev or EAS preview builds with EXPO_PUBLIC_SHOW_INTERNAL_TOOLS=true. */
export const SHOW_INTERNAL_TOOLS =
  __DEV__ || process.env.EXPO_PUBLIC_SHOW_INTERNAL_TOOLS === 'true';

/** Preview APK/AAB internal testing — not local __DEV__. */
export const IS_PREVIEW_INTERNAL_TOOLS = SHOW_INTERNAL_TOOLS && !__DEV__;

export function getInternalToolsSectionLabel(): string {
  return IS_PREVIEW_INTERNAL_TOOLS ? 'INTERNAL TEST TOOLS' : 'DEV / TESTING';
}

export function getInternalToolsSectionHint(): string {
  if (IS_PREVIEW_INTERNAL_TOOLS) {
    return 'Preview build only — not included in production releases.';
  }
  return 'Dev shortcuts — hidden in production builds.';
}
