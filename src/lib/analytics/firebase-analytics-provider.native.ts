/**
 * Native analytics provider using @react-native-firebase/analytics.
 *
 * Metro selects this file on iOS and Android builds, bypassing the web no-op.
 * The SDK is loaded lazily via require() inside a try/catch so the app never
 * crashes if the native module is missing or google-services.json is absent.
 */
import type { FirebaseAnalyticsTypes } from '@react-native-firebase/analytics';

import type { AnalyticsProvider } from './analytics-types';

let cachedInstance: FirebaseAnalyticsTypes.Module | null = null;

function getAnalytics(): FirebaseAnalyticsTypes.Module | null {
  if (cachedInstance) return cachedInstance;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-firebase/analytics') as {
      default: () => FirebaseAnalyticsTypes.Module;
    };
    cachedInstance = mod.default();
    return cachedInstance;
  } catch {
    return null;
  }
}

export const firebaseAnalyticsProvider: AnalyticsProvider = {
  async logEvent(name, params) {
    try {
      await getAnalytics()?.logEvent(name, params);
    } catch {}
  },

  async logScreenView(screenName, screenClass) {
    try {
      await getAnalytics()?.logScreenView({
        screen_name: screenName,
        screen_class: screenClass ?? screenName,
      });
    } catch {}
  },

  async setUserProperty(name, value) {
    try {
      await getAnalytics()?.setUserProperty(name, value);
    } catch {}
  },

  async setAnalyticsCollectionEnabled(enabled) {
    try {
      await getAnalytics()?.setAnalyticsCollectionEnabled(enabled);
    } catch {}
  },
};
