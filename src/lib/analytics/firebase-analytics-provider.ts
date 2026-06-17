/**
 * Web / fallback analytics provider — safe no-op implementation.
 *
 * On native builds Metro resolves firebase-analytics-provider.native.ts instead,
 * which uses the real @react-native-firebase/analytics SDK.
 *
 * This file is also used by TypeScript for type resolution since TS does not
 * understand Metro's platform extension rules.
 *
 * See docs/firebase-setup.md for setup steps.
 * Config files are wired automatically by app.config.js when present.
 */
import type { AnalyticsProvider } from './analytics-types';

export const firebaseAnalyticsProvider: AnalyticsProvider = {
  async logEvent() {},
  async logScreenView() {},
  async setUserProperty() {},
  async setAnalyticsCollectionEnabled() {},
};
