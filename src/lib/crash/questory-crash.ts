import { getAnalyticsEnabled } from '@/lib/analytics/analytics-service';
import { computeLevel } from '@/lib/level';
import type { PlayerProgress } from '@/types/narrative';

import {
  logCrashMessage,
  reportError,
  setCrashAttributes,
} from './crash-service';
import type { CrashContext } from './crash-types';

type QuestoryCrashParams = CrashContext;

export function reportQuestError(error: unknown, params?: QuestoryCrashParams): void {
  reportError(error, { feature: 'quest', ...params });
}

export function reportProgressionError(error: unknown, params?: QuestoryCrashParams): void {
  reportError(error, { feature: 'progression', ...params });
}

export function reportNotificationError(error: unknown, params?: QuestoryCrashParams): void {
  reportError(error, { feature: 'notification', ...params });
}

export function reportAnalyticsError(error: unknown, params?: QuestoryCrashParams): void {
  reportError(error, { feature: 'analytics', ...params });
}

export function reportStorageError(error: unknown, params?: QuestoryCrashParams): void {
  reportError(error, { feature: 'storage', ...params });
}

export function reportAssetError(error: unknown, params?: QuestoryCrashParams): void {
  reportError(error, { feature: 'asset', ...params });
}

export function logQuestoryBreadcrumb(message: string, params?: QuestoryCrashParams): void {
  logCrashMessage(message, params);
}

export function setQuestoryCrashContext(progress?: PlayerProgress | null): void {
  if (!progress) return;

  const chapterId =
    progress.activeChapterBySagaId[progress.selectedSagaId] ?? progress.currentChapterId;

  setCrashAttributes({
    has_onboarded: progress.hasOnboarded ? 'true' : 'false',
    universe_id: progress.selectedUniverseId,
    saga_id: progress.selectedSagaId,
    chapter_id: chapterId,
    level: String(computeLevel(progress.totalXp).level),
    mascot_preference: progress.mascotPreference ?? 'both',
    analytics_enabled: getAnalyticsEnabled() ? 'true' : 'false',
  });
}
