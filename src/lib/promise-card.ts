import { Platform, Share } from 'react-native';

import { getLocalDateKey } from '@/lib/daily-streak';
import { isTodayFocusLocked } from '@/lib/focus-lock';
import type { BoardQuest, PlayerProgress, Saga, Universe } from '@/types/narrative';

export type PromiseCardQuest = {
  narrativeTitle: string;
  originalTitle: string;
};

export type PromiseCard = {
  dateKey: string;
  dateLabel: string;
  universeId: string;
  universeName: string;
  sagaId: string;
  sagaTitle: string;
  commitmentLine: string;
  quests: PromiseCardQuest[];
};

const BASE_COMMITMENT = "I choose these quests as today's story.";

const UNIVERSE_COMMITMENT: Record<string, string> = {
  'dust-and-iron': 'I mark this trail and ride it today.',
  neuronet: 'I lock this execution window.',
  'neon-ashes': 'I pin these leads to the board.',
};

export function getPromiseCommitmentLine(universeId: string): string {
  return UNIVERSE_COMMITMENT[universeId] ?? BASE_COMMITMENT;
}

export function formatPromiseCardDate(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function buildPromiseCard(
  progress: Pick<PlayerProgress, 'focusLockedDate' | 'lockedFocusQuestIds'>,
  universe: Pick<Universe, 'id' | 'name'>,
  saga: Pick<Saga, 'id' | 'title'>,
  boardQuests: BoardQuest[],
  today: string = getLocalDateKey(),
): PromiseCard | null {
  if (!isTodayFocusLocked(progress, today)) return null;

  const lockedIds = progress.lockedFocusQuestIds;
  if (lockedIds.length === 0) return null;

  const lockedIdSet = new Set(lockedIds);
  const questById = new Map(
    boardQuests
      .filter((quest) => quest.source === 'user' && lockedIdSet.has(quest.id))
      .map((quest) => [quest.id, quest] as const),
  );

  const quests = lockedIds
    .map((id) => questById.get(id))
    .filter((quest): quest is BoardQuest => quest != null)
    .map((quest) => ({
      narrativeTitle: quest.narrativeTitle,
      originalTitle: quest.originalTitle,
    }));

  if (quests.length === 0) return null;

  const dateKey = progress.focusLockedDate ?? today;

  return {
    dateKey,
    dateLabel: formatPromiseCardDate(dateKey),
    universeId: universe.id,
    universeName: universe.name,
    sagaId: saga.id,
    sagaTitle: saga.title,
    commitmentLine: getPromiseCommitmentLine(universe.id),
    quests,
  };
}

export function formatPromiseCardPlainText(card: PromiseCard): string {
  const lines = [
    `Today's Story — ${card.dateLabel}`,
    `${card.universeName} · ${card.sagaTitle}`,
    '',
    card.commitmentLine,
    '',
    "Today's Story:",
  ];

  card.quests.forEach((quest, index) => {
    lines.push(`${index + 1}. ${quest.originalTitle}`);
  });

  return lines.join('\n');
}

export async function copyPromiseCardText(text: string): Promise<boolean> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  try {
    await Share.share({ message: text });
    return true;
  } catch {
    return false;
  }
}
