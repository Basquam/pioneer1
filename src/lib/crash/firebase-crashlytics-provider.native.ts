/**
 * Native Crashlytics provider using @react-native-firebase/crashlytics.
 *
 * Loaded lazily via require() inside try/catch so the app never crashes if the
 * native module is missing or Firebase config files are absent.
 */
import type { FirebaseCrashlyticsTypes } from '@react-native-firebase/crashlytics';

import type { CrashReporter } from './crash-types';

let cachedInstance: FirebaseCrashlyticsTypes.Module | null = null;

function getCrashlytics(): FirebaseCrashlyticsTypes.Module | null {
  if (cachedInstance) return cachedInstance;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-firebase/crashlytics') as {
      default: () => FirebaseCrashlyticsTypes.Module;
    };
    cachedInstance = mod.default();
    return cachedInstance;
  } catch {
    return null;
  }
}

export const firebaseCrashlyticsProvider: CrashReporter = {
  async setCollectionEnabled(enabled) {
    try {
      await getCrashlytics()?.setCrashlyticsCollectionEnabled(enabled);
    } catch {}
  },

  async recordError(error, attributes) {
    try {
      const crashlytics = getCrashlytics();
      if (!crashlytics) return;
      if (attributes) {
        await crashlytics.setAttributes(attributes);
      }
      crashlytics.recordError(error);
    } catch {}
  },

  async log(message) {
    try {
      getCrashlytics()?.log(message);
    } catch {}
  },

  async setAttribute(name, value) {
    try {
      await getCrashlytics()?.setAttribute(name, value);
    } catch {}
  },

  async setAttributes(attributes) {
    try {
      await getCrashlytics()?.setAttributes(attributes);
    } catch {}
  },

  async crash() {
    try {
      getCrashlytics()?.crash();
    } catch {}
  },
};
