import AsyncStorage from '@react-native-async-storage/async-storage';

import { firebaseCrashlyticsProvider } from './firebase-crashlytics-provider';
import type { CrashContext, CrashReporter, CrashSeverity, SafeCrashContextKey } from './crash-types';

const CRASH_REPORTING_ENABLED_KEY = 'questory-crash-reporting-enabled';

const MAX_STRING_LENGTH = 100;
const MAX_STACK_LENGTH = 500;

const BLOCKED_ATTRIBUTE_KEYS = new Set([
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
]);

const ALLOWED_ATTRIBUTE_KEYS = new Set([
  'screen_name',
  'chapter_id',
  'saga_id',
  'universe_id',
  'quest_category',
  'quest_source',
  'mascot_preference',
  'analytics_enabled',
  'has_onboarded',
]);

const BLOCKED_ATTRIBUTE_SUBSTRINGS = ['title', 'description', 'note', 'text', 'email', 'name'] as const;

const SAFE_CONTEXT_KEYS: ReadonlySet<SafeCrashContextKey> = new Set([
  'screenName',
  'universeId',
  'sagaId',
  'chapterId',
  'questCategory',
  'questSource',
  'level',
  'feature',
  'action',
  'reason',
]);

let provider: CrashReporter = firebaseCrashlyticsProvider;
let crashReportingEnabled = true;
let initialised = false;

function isBlockedAttributeKey(key: string): boolean {
  if (ALLOWED_ATTRIBUTE_KEYS.has(key)) return false;
  if (BLOCKED_ATTRIBUTE_KEYS.has(key)) return true;
  const lower = key.toLowerCase();
  return BLOCKED_ATTRIBUTE_SUBSTRINGS.some((sub) => lower.includes(sub));
}

function contextKeyToAttributeKey(key: SafeCrashContextKey): string {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

function truncateString(value: string, max = MAX_STRING_LENGTH): string {
  if (value.length <= max) return value;
  return value.slice(0, max);
}

function sanitiseAttributeValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '0';
  return truncateString(value);
}

function sanitiseContext(context?: CrashContext): Record<string, string> {
  if (!context) return {};

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(context)) {
    if (!SAFE_CONTEXT_KEYS.has(key as SafeCrashContextKey)) continue;
    if (value === null || value === undefined) continue;

    const attributeKey = contextKeyToAttributeKey(key as SafeCrashContextKey);
    if (isBlockedAttributeKey(attributeKey)) continue;

    result[attributeKey] = sanitiseAttributeValue(value);
  }
  return result;
}

function sanitiseAttributes(attributes: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (isBlockedAttributeKey(key)) continue;
    result[truncateString(key, 40)] = truncateString(value);
  }
  return result;
}

function messageLooksUnsafe(message: string): boolean {
  const lower = message.toLowerCase();
  if (message.length > 120) return true;
  return BLOCKED_ATTRIBUTE_SUBSTRINGS.some((sub) => lower.includes(sub));
}

function sanitiseErrorForReporting(error: Error): Error {
  const safeMessage = messageLooksUnsafe(error.message)
    ? 'Application error'
    : truncateString(error.message);

  const sanitized = new Error(safeMessage);
  sanitized.name = truncateString(error.name || 'Error', 80);

  if (error.stack) {
    sanitized.stack = truncateString(error.stack, MAX_STACK_LENGTH);
  }

  return sanitized;
}

function devLog(
  kind: 'error' | 'message',
  payload: { error?: Error; message?: string; severity?: CrashSeverity; context?: Record<string, string> },
): void {
  if (!__DEV__) return;
  if (kind === 'error') {
    console.warn('[Crash]', payload.severity ?? 'error', payload.error?.name, payload.context ?? '');
  } else {
    console.log('[Crash]', payload.message, payload.context ?? '');
  }
}

export async function initCrashReporting(overrideProvider?: CrashReporter): Promise<void> {
  if (initialised) return;
  initialised = true;

  if (overrideProvider) {
    provider = overrideProvider;
  }

  try {
    const stored = await AsyncStorage.getItem(CRASH_REPORTING_ENABLED_KEY);
    if (stored !== null) {
      crashReportingEnabled = stored === 'true';
    }
    await provider.setCollectionEnabled(crashReportingEnabled);
    if (__DEV__) {
      console.log('[Crash] Initialised. Collection enabled:', crashReportingEnabled);
    }
  } catch (err) {
    if (__DEV__) {
      console.warn('[Crash] Failed to load enabled preference:', err);
    }
  }
}

export async function setCrashReportingEnabled(enabled: boolean): Promise<void> {
  crashReportingEnabled = enabled;
  try {
    await AsyncStorage.setItem(CRASH_REPORTING_ENABLED_KEY, enabled ? 'true' : 'false');
    await provider.setCollectionEnabled(enabled);
    if (__DEV__) {
      console.log('[Crash] Collection enabled set to:', enabled);
    }
  } catch (err) {
    if (__DEV__) {
      console.warn('[Crash] Failed to persist enabled preference:', err);
    }
  }
}

export function getCrashReportingEnabled(): boolean {
  return crashReportingEnabled;
}

export function reportError(
  error: unknown,
  context?: CrashContext,
  severity: CrashSeverity = 'error',
): void {
  try {
    const normalized =
      error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unknown error');
    const attributes = sanitiseContext(context);
    attributes.severity = severity;

    devLog('error', { error: normalized, severity, context: attributes });

    if (!crashReportingEnabled) return;

    const safeError = sanitiseErrorForReporting(normalized);
    void provider.recordError(safeError, attributes).catch(() => undefined);
  } catch {
    // Never throw to callers.
  }
}

export function logCrashMessage(message: string, context?: CrashContext): void {
  try {
    const safeMessage = truncateString(message);
    const attributes = sanitiseContext(context);

    devLog('message', { message: safeMessage, context: attributes });

    if (!crashReportingEnabled) return;

    void provider.log(safeMessage).catch(() => undefined);
    if (Object.keys(attributes).length > 0) {
      void provider.setAttributes(attributes).catch(() => undefined);
    }
  } catch {
    // Never throw to callers.
  }
}

export function setCrashUserProperty(name: string, value: string): void {
  try {
    if (isBlockedAttributeKey(name)) return;
    if (!crashReportingEnabled) return;

    const safeName = truncateString(name, 24);
    const safeValue = truncateString(value);

    void provider.setAttribute(safeName, safeValue).catch(() => undefined);
  } catch {
    // Never throw to callers.
  }
}

export function setCrashAttributes(attributes: Record<string, string>): void {
  try {
    if (!crashReportingEnabled) return;

    const sanitised = sanitiseAttributes(attributes);
    if (Object.keys(sanitised).length === 0) return;

    void provider.setAttributes(sanitised).catch(() => undefined);
  } catch {
    // Never throw to callers.
  }
}

export function crashForTest(): void {
  try {
    if (__DEV__) {
      console.warn('[Crash] crashForTest invoked');
    }
    if (!crashReportingEnabled) return;
    void provider.crash().catch(() => undefined);
  } catch {
    // Never throw to callers.
  }
}
