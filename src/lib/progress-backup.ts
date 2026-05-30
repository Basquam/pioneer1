import { Platform } from 'react-native';

import { getAppVersion, getAppVersionLabel } from '@/lib/app-info';
import { restorePlayerProgress } from '@/lib/player-progress-storage';
import {
  CURRENT_PLAYER_PROGRESS_SCHEMA_VERSION,
  readPlayerProgressSchemaVersion,
} from '@/lib/player-progress-migration';
import type { PlayerProgress } from '@/types/narrative';

export const PROGRESS_BACKUP_FORMAT = 'pioneer-progress-backup' as const;
export const PROGRESS_BACKUP_FORMAT_VERSION = 1;

export type ProgressBackupFile = {
  format: typeof PROGRESS_BACKUP_FORMAT;
  formatVersion: typeof PROGRESS_BACKUP_FORMAT_VERSION;
  appVersion: string;
  /** Human-readable version + native build when available. */
  appVersionLabel: string;
  exportedAt: string;
  schemaVersion: number;
  playerProgress: PlayerProgress;
};

export type ProgressBackupValidationResult =
  | { ok: true; backup: ProgressBackupFile; playerProgress: PlayerProgress }
  | { ok: false; error: string };

export { getAppVersion, getAppVersionLabel } from '@/lib/app-info';

export function createProgressBackup(playerProgress: PlayerProgress): ProgressBackupFile {
  const restored = restorePlayerProgress(playerProgress);
  return {
    format: PROGRESS_BACKUP_FORMAT,
    formatVersion: PROGRESS_BACKUP_FORMAT_VERSION,
    appVersion: getAppVersion(),
    appVersionLabel: getAppVersionLabel(),
    exportedAt: new Date().toISOString(),
    schemaVersion: restored.schemaVersion,
    playerProgress: restored,
  };
}

export function serializeProgressBackup(playerProgress: PlayerProgress): string {
  return JSON.stringify(createProgressBackup(playerProgress), null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) && Object.values(value).every((entry) => typeof entry === 'string')
  );
}

function isStringArrayRecord(value: unknown): value is Record<string, string[]> {
  return (
    isRecord(value) &&
    Object.values(value).every((entry) => isStringArray(entry))
  );
}

/** Core fields required before migration can safely run. */
export function hasMinimalPlayerProgressFields(raw: unknown): boolean {
  if (!isRecord(raw)) return false;
  if (typeof raw.hasOnboarded !== 'boolean') return false;
  if (typeof raw.selectedUniverseId !== 'string') return false;
  if (typeof raw.selectedSagaId !== 'string') return false;
  if (typeof raw.currentChapterId !== 'string') return false;
  if (typeof raw.totalXp !== 'number') return false;
  if (typeof raw.level !== 'number') return false;
  if (typeof raw.reputation !== 'number') return false;
  if (!isStringArray(raw.unlockedRewards)) return false;
  if (!Array.isArray(raw.userQuests)) return false;
  if (!isRecord(raw.villainInfluenceBySaga)) return false;
  if (!isRecord(raw.chapterCompletions)) return false;
  if (!isRecord(raw.relationshipByCharacter)) return false;
  if (!isRecord(raw.characterAffinity)) return false;
  if (!isStringArray(raw.seenChapterIntros)) return false;
  if (!isStringRecord(raw.activeChapterBySagaId)) return false;
  if (!isStringArrayRecord(raw.completedChapterIdsBySagaId)) return false;
  if (!isStringArrayRecord(raw.completedQuestIdsBySagaId)) return false;
  if (!isRecord(raw.dismissedTauntBySagaId)) return false;
  if (raw.lastActiveDate !== null && typeof raw.lastActiveDate !== 'string') return false;
  if (typeof raw.dailyStreak !== 'number') return false;
  if (typeof raw.dailyFocusLimit !== 'number') return false;
  if (!isRecord(raw.activityByDate)) return false;
  if (!isStringRecord(raw.lastSagaByUniverseId)) return false;
  if (raw.tutorialSeen !== undefined && typeof raw.tutorialSeen !== 'boolean') return false;
  if (raw.firstUniverseId !== null && raw.firstUniverseId !== undefined && typeof raw.firstUniverseId !== 'string') {
    return false;
  }
  if (raw.firstSagaId !== null && raw.firstSagaId !== undefined && typeof raw.firstSagaId !== 'string') {
    return false;
  }
  if (
    raw.onboardingCompletedAt !== null &&
    raw.onboardingCompletedAt !== undefined &&
    typeof raw.onboardingCompletedAt !== 'string'
  ) {
    return false;
  }
  if (
    raw.schemaVersion !== undefined &&
    (typeof raw.schemaVersion !== 'number' || !Number.isFinite(raw.schemaVersion))
  ) {
    return false;
  }

  return true;
}

/** Basic structural validation after migration + sanitize. */
export function validatePlayerProgressShape(raw: unknown): raw is PlayerProgress {
  if (!isRecord(raw)) return false;
  if (!hasMinimalPlayerProgressFields(raw)) return false;
  if (typeof raw.schemaVersion !== 'number') return false;
  return true;
}

function extractRawPlayerProgress(parsed: unknown): Record<string, unknown> | null {
  if (!isRecord(parsed)) return null;

  if (hasMinimalPlayerProgressFields(parsed)) {
    return parsed;
  }

  if (parsed.format === PROGRESS_BACKUP_FORMAT && isRecord(parsed.playerProgress)) {
    return hasMinimalPlayerProgressFields(parsed.playerProgress) ? parsed.playerProgress : null;
  }

  if (isRecord(parsed.playerProgress) && hasMinimalPlayerProgressFields(parsed.playerProgress)) {
    return parsed.playerProgress;
  }

  return null;
}

export function validateProgressBackupJson(rawJson: string): ProgressBackupValidationResult {
  const trimmed = rawJson.trim();
  if (!trimmed) {
    return { ok: false, error: 'Paste a backup JSON first.' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, error: 'Invalid JSON. Check the text and try again.' };
  }

  const rawProgress = extractRawPlayerProgress(parsed);
  if (!rawProgress) {
    return {
      ok: false,
      error: 'Backup is missing required save fields.',
    };
  }

  let playerProgress: PlayerProgress;
  try {
    playerProgress = restorePlayerProgress(rawProgress);
  } catch {
    return {
      ok: false,
      error: 'Backup could not be migrated safely. Check the file and try again.',
    };
  }

  const backup: ProgressBackupFile = isRecord(parsed) &&
    parsed.format === PROGRESS_BACKUP_FORMAT &&
    typeof parsed.exportedAt === 'string'
    ? {
        format: PROGRESS_BACKUP_FORMAT,
        formatVersion:
          typeof parsed.formatVersion === 'number'
            ? (parsed.formatVersion as ProgressBackupFile['formatVersion'])
            : PROGRESS_BACKUP_FORMAT_VERSION,
        appVersion: typeof parsed.appVersion === 'string' ? parsed.appVersion : getAppVersion(),
        appVersionLabel:
          typeof parsed.appVersionLabel === 'string'
            ? parsed.appVersionLabel
            : getAppVersionLabel(),
        exportedAt: parsed.exportedAt,
        schemaVersion:
          typeof parsed.schemaVersion === 'number'
            ? parsed.schemaVersion
            : readPlayerProgressSchemaVersion(rawProgress),
        playerProgress,
      }
    : createProgressBackup(playerProgress);

  return { ok: true, backup, playerProgress };
}

export function buildProgressBackupFilename(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `pioneer-progress-${stamp}.json`;
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  return false;
}

export function downloadProgressBackupJson(json: string, filename = buildProgressBackupFilename()): boolean {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return false;
  }

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

export { CURRENT_PLAYER_PROGRESS_SCHEMA_VERSION };
