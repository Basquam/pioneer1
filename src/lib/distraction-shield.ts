import type { QuestDistractionType } from '@/types/narrative';

export type DistractionOption = {
  type: QuestDistractionType;
  label: string;
};

export const DISTRACTION_SHIELD_OPTIONS: DistractionOption[] = [
  { type: 'phone', label: 'Phone' },
  { type: 'social-media', label: 'YouTube / social media' },
  { type: 'games', label: 'Games' },
  { type: 'bed-couch', label: 'Bed / couch' },
  { type: 'notifications', label: 'Notifications' },
  { type: 'unclear-next-step', label: 'Unclear next step' },
  { type: 'other', label: 'Other' },
];

const SHIELD_SUGGESTIONS: Record<QuestDistractionType, string> = {
  phone: 'Put your phone across the room for this quest.',
  'social-media': 'Close one distracting tab.',
  games: 'Keep the launcher closed until the quest is cleared.',
  'bed-couch': 'Move to a task-ready spot.',
  notifications: 'Silence notifications for this quest.',
  'unclear-next-step': 'Use the starter move first.',
  other: 'Remove one small obstacle before you begin.',
};

export function getDistractionShieldSuggestion(type: QuestDistractionType): string {
  return SHIELD_SUGGESTIONS[type];
}

export function sanitizeQuestDistractionType(raw: unknown): QuestDistractionType | null {
  if (typeof raw !== 'string') return null;
  return DISTRACTION_SHIELD_OPTIONS.some((option) => option.type === raw)
    ? (raw as QuestDistractionType)
    : null;
}

export function getDistractionOptionLabel(type: QuestDistractionType): string {
  return DISTRACTION_SHIELD_OPTIONS.find((option) => option.type === type)?.label ?? type;
}
