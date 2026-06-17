import AsyncStorage from '@react-native-async-storage/async-storage';

import { firebaseAnalyticsProvider } from './firebase-analytics-provider';
import type { AnalyticsEventName, AnalyticsParams, AnalyticsProvider } from './analytics-types';

const ANALYTICS_ENABLED_KEY = 'questory-analytics-enabled';

/**
 * Param keys that might contain user-written free text — block them at the
 * service layer so privacy rules are enforced even if a caller slips a PII key
 * through a typed wrapper.
 */
const BLOCKED_PARAM_KEYS = new Set([
  'title',
  'description',
  'note',
  'notes',
  'text',
  'email',
  'name',
  'body',
  'content',
  'label',
  'message',
  'summary',
  'original_title',
  'narrative_title',
]);

/** Safe param keys that contain blocked substrings but are intentional metadata. */
const ALLOWED_PARAM_KEYS = new Set([
  'screen_name',
  'chapter_id',
  'chapter_index',
  'saga_id',
  'universe_id',
  'quest_id',
  'mascot_id',
  'tip_context',
  'notification_type',
  'reward_id',
  'item_id',
  'unlock_type',
  'quest_source',
  'permission_status',
]);

const BLOCKED_PARAM_SUBSTRINGS = ['title', 'description', 'note', 'text', 'email', 'name'] as const;

function isBlockedParamKey(key: string): boolean {
  if (ALLOWED_PARAM_KEYS.has(key)) return false;
  if (BLOCKED_PARAM_KEYS.has(key)) return true;
  const lower = key.toLowerCase();
  return BLOCKED_PARAM_SUBSTRINGS.some((sub) => lower.includes(sub));
}

let provider: AnalyticsProvider = firebaseAnalyticsProvider;
let analyticsEnabled = true;

/**
 * Initialise the analytics service.
 * Must be called once at app startup, before any tracking calls.
 * Safe to call multiple times — subsequent calls are ignored.
 */
let initialised = false;

export async function initAnalytics(overrideProvider?: AnalyticsProvider): Promise<void> {
  if (initialised) return;
  initialised = true;

  if (overrideProvider) {
    provider = overrideProvider;
  }

  try {
    const stored = await AsyncStorage.getItem(ANALYTICS_ENABLED_KEY);
    if (stored !== null) {
      analyticsEnabled = stored === 'true';
    }
    await provider.setAnalyticsCollectionEnabled(analyticsEnabled);
    if (__DEV__) {
      console.log('[Analytics] Initialised. Collection enabled:', analyticsEnabled);
    }
  } catch (err) {
    if (__DEV__) {
      console.warn('[Analytics] Failed to load enabled preference:', err);
    }
  }
}

/** Enable or disable analytics collection and persist the preference. */
export async function setAnalyticsEnabled(enabled: boolean): Promise<void> {
  analyticsEnabled = enabled;
  try {
    await AsyncStorage.setItem(ANALYTICS_ENABLED_KEY, enabled ? 'true' : 'false');
    await provider.setAnalyticsCollectionEnabled(enabled);
    if (__DEV__) {
      console.log('[Analytics] Collection enabled set to:', enabled);
    }
  } catch (err) {
    if (__DEV__) {
      console.warn('[Analytics] Failed to persist enabled preference:', err);
    }
  }
}

/** Synchronous read of the current enabled state. */
export function getAnalyticsEnabled(): boolean {
  return analyticsEnabled;
}

/**
 * Sanitise params before sending to Firebase:
 * - Remove null / undefined values
 * - Block keys that might contain PII
 * - Truncate string values to Firebase's 100-char limit
 * - Keep number and boolean as-is (Firebase supports both)
 */
function sanitiseParams(
  params: AnalyticsParams,
): Record<string, string | number | boolean> | undefined {
  const out: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (isBlockedParamKey(key)) {
      if (__DEV__) {
        console.warn('[Analytics] Blocked param key:', key);
      }
      continue;
    }
    if (value === null || value === undefined) continue;

    if (typeof value === 'string') {
      out[key] = value.slice(0, 100);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      out[key] = value;
    }
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Track a custom analytics event.
 * Never throws — all errors are caught internally.
 */
export function trackEvent(name: AnalyticsEventName, params?: AnalyticsParams): void {
  if (__DEV__) {
    console.log('[Analytics]', name, params ?? '');
  }
  if (!analyticsEnabled) return;

  const sanitised = params ? sanitiseParams(params) : undefined;

  void provider.logEvent(name, sanitised).catch((err) => {
    if (__DEV__) {
      console.warn('[Analytics] logEvent error:', name, err);
    }
  });
}

/**
 * Track a screen view event.
 * Never throws — all errors are caught internally.
 */
export function trackScreenView(screenName: string, screenClass?: string): void {
  if (__DEV__) {
    console.log('[Analytics] screen_view:', screenName);
  }
  if (!analyticsEnabled) return;

  void provider.logScreenView(screenName, screenClass).catch((err) => {
    if (__DEV__) {
      console.warn('[Analytics] logScreenView error:', screenName, err);
    }
  });
}

/**
 * Set a Firebase user property.
 * Property names are capped at 24 characters per Firebase limits.
 * Never throws.
 */
export function setAnalyticsUserProperty(name: string, value: string | null): void {
  if (!analyticsEnabled) return;
  const safeName = name.slice(0, 24);
  void provider.setUserProperty(safeName, value).catch((err) => {
    if (__DEV__) {
      console.warn('[Analytics] setUserProperty error:', safeName, err);
    }
  });
}
