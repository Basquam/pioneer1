import Constants from 'expo-constants';

export function getAppName(): string {
  return Constants.expoConfig?.name ?? 'Pioneer';
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
