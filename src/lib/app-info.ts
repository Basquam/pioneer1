import Constants from 'expo-constants';

export function getAppName(): string {
  return Constants.expoConfig?.name ?? 'Questory';
}

export function getAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

export function getAppVersionLabel(): string {
  const version = getAppVersion();
  const build =
    Constants.nativeBuildVersion ??
    Constants.expoConfig?.ios?.buildNumber ??
    Constants.expoConfig?.android?.versionCode;

  if (build !== undefined && build !== null && build !== '') {
    return `${version} · build ${build}`;
  }

  return version;
}

export function getAppEnvironmentLabel(): 'development' | 'production' {
  return __DEV__ ? 'development' : 'production';
}

/** True in Metro dev / local development builds. */
export function isDev(): boolean {
  return __DEV__;
}

/** EAS build profile when running on EAS (`development`, `preview`, `production`). */
export function getBuildProfile(): string | null {
  const profile = process.env.EAS_BUILD_PROFILE;
  return profile && profile.length > 0 ? profile : null;
}

/** Preview/internal APK with dev tools enabled but not local __DEV__. */
export function isPreviewBuild(): boolean {
  return process.env.EXPO_PUBLIC_SHOW_INTERNAL_TOOLS === 'true' && !__DEV__;
}
