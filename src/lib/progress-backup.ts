import { Platform } from 'react-native';

import { getAppVersion } from '@/lib/app-info';
import type { PlayerProgress } from '@/types/narrative';

export const PROGRESS_BACKUP_FORMAT = 'pioneer-progress-backup' as const;
export const PROGRESS_BACKUP_FORMAT_VERSION = 1;

export type ProgressBackupFile = {
  format: typeof PROGRESS_BACKUP_FORMAT;
  formatVersion: typeof PROGRESS_BACKUP_FORMAT_VERSION;
  appVersion: string;
  exportedAt: string;
  playerProgress: PlayerProgress;
};

export type ProgressBackupValidationResult =
  | { ok: true; backup: ProgressBackupFile; playerProgress: PlayerProgress }
  | { ok: false; error: string };

export { getAppVersion } from '@/lib/app-info';

export function createProgressBackup(playerProgress: PlayerProgress): ProgressBackupFile {
  return {
    format: PROGRESS_BACKUP_FORMAT,
    formatVersion: PROGRESS_BACKUP_FORMAT_VERSION,
    appVersion: getAppVersion(),
    exportedAt: new Date().toISOString(),
    playerProgress,
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

/** Basic structural validation before normalize/import replaces current progress. */
export function validatePlayerProgressShape(raw: unknown): raw is PlayerProgress {
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

  return true;
}

function extractPlayerProgress(parsed: unknown): PlayerProgress | null {
  if (!isRecord(parsed)) return null;

  if (validatePlayerProgressShape(parsed)) {
    return parsed;
  }

  if (parsed.format === PROGRESS_BACKUP_FORMAT && isRecord(parsed.playerProgress)) {
    return validatePlayerProgressShape(parsed.playerProgress) ? parsed.playerProgress : null;
  }

  if (validatePlayerProgressShape(parsed.playerProgress)) {
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

  const playerProgress = extractPlayerProgress(parsed);
  if (!playerProgress) {
    return {
      ok: false,
      error: 'Backup is missing required save fields.',
    };
  }

  const backup: ProgressBackupFile = isRecord(parsed) &&
    parsed.format === PROGRESS_BACKUP_FORMAT &&
    typeof parsed.exportedAt === 'string' &&
    typeof parsed.appVersion === 'string'
    ? {
        format: PROGRESS_BACKUP_FORMAT,
        formatVersion:
          typeof parsed.formatVersion === 'number'
            ? (parsed.formatVersion as ProgressBackupFile['formatVersion'])
            : PROGRESS_BACKUP_FORMAT_VERSION,
        appVersion: parsed.appVersion,
        exportedAt: parsed.exportedAt,
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
