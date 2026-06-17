/**
 * Web / fallback Crashlytics provider — safe no-op implementation.
 *
 * On native builds Metro resolves firebase-crashlytics-provider.native.ts instead.
 */
import type { CrashReporter } from './crash-types';

export const firebaseCrashlyticsProvider: CrashReporter = {
  async setCollectionEnabled() {},
  async recordError(error, attributes) {
    if (__DEV__) {
      console.log('[Crashlytics] recordError (web noop)', error.name, attributes ?? '');
    }
  },
  async log(message) {
    if (__DEV__) {
      console.log('[Crashlytics] log (web noop)', message);
    }
  },
  async setAttribute() {},
  async setAttributes() {},
  async crash() {
    if (__DEV__) {
      console.warn('[Crashlytics] crash() is a no-op on web.');
    }
  },
};
