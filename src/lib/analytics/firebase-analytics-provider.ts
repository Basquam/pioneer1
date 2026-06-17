/**
 * Web / fallback analytics provider — safe no-op implementation.
 *
 * On native builds Metro resolves firebase-analytics-provider.native.ts instead,
 * which uses the real @react-native-firebase/analytics SDK.
 *
 * This file is also used by TypeScript for type resolution since TS does not
 * understand Metro's platform extension rules.
 *
 * TODO: Before a native release build, add the Firebase config files:
 *   Android → google-services.json  (root of the project)
 *   iOS     → GoogleService-Info.plist  (root of the project)
 * Then reference them in app.json under expo.android.googleServicesFile
 * and expo.ios.googleServicesFile. Do NOT commit those files to source control.
 */
import type { AnalyticsProvider } from './analytics-types';

export const firebaseAnalyticsProvider: AnalyticsProvider = {
  async logEvent() {},
  async logScreenView() {},
  async setUserProperty() {},
  async setAnalyticsCollectionEnabled() {},
};
