import type {
  ChapterRewardPayload,
  CharacterReactionPayload,
  QuestCompletionPayload,
} from '@/lib/reward-event-queue';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isQuestCompletionPayload(value: unknown): value is QuestCompletionPayload {
  if (!isRecord(value)) return false;
  return (
    typeof value.questId === 'string' &&
    (value.source === 'user' || value.source === 'template') &&
    typeof value.narrativeTitle === 'string' &&
    typeof value.earnedXp === 'number' &&
    typeof value.earnedReputation === 'number'
  );
}

export function isCharacterReactionPayload(value: unknown): value is CharacterReactionPayload {
  if (!isRecord(value)) return false;
  return (
    typeof value.questId === 'string' &&
    typeof value.narrativeTitle === 'string' &&
    typeof value.characterId === 'string' &&
    typeof value.characterLine === 'string'
  );
}

export function isChapterRewardPayload(value: unknown): value is ChapterRewardPayload {
  if (!isRecord(value)) return false;
  return (
    typeof value.chapterId === 'string' &&
    typeof value.chapterOrder === 'number' &&
    typeof value.chapterTitle === 'string' &&
    typeof value.successDialogue === 'string' &&
    typeof value.earnedXp === 'number' &&
    typeof value.earnedReputation === 'number' &&
    (value.nextChapterId === null || typeof value.nextChapterId === 'string')
  );
}
