import type { QuestDistractionType } from '@/types/narrative';

export type DistractionOption = {
  type: QuestDistractionType;
  label: string;
};

/** @deprecated Use FRICTION_SHIELD_OPTIONS */
export const DISTRACTION_SHIELD_OPTIONS: DistractionOption[] = [
  { type: 'phone', label: 'Phone' },
  { type: 'social-media', label: 'Social media / YouTube' },
  { type: 'games', label: 'Games' },
  { type: 'bed-couch', label: 'Bed / couch' },
  { type: 'notifications', label: 'Notifications' },
  { type: 'random-tabs', label: 'Random tabs' },
  { type: 'unclear-next-step', label: 'Unclear next step' },
  { type: 'other', label: 'Other' },
];

export const FRICTION_SHIELD_OPTIONS = DISTRACTION_SHIELD_OPTIONS;

export const FRICTION_SHIELD_APPLIED_MESSAGE = 'Distraction made harder.';

const FRICTION_ACTIONS: Record<QuestDistractionType, string> = {
  phone: 'Put your phone across the room until this quest is cleared.',
  'social-media': 'Close one distracting tab before you begin.',
  games: 'Keep the launcher closed until the quest is cleared.',
  'bed-couch': 'Move to a task-ready spot.',
  notifications: 'Silence notifications for this quest.',
  'random-tabs': 'Close every tab except what you need.',
  'unclear-next-step': 'Use the starter move first.',
  other: 'Remove one small obstacle before you begin.',
};

export function getFrictionShieldAction(type: QuestDistractionType): string {
  return FRICTION_ACTIONS[type];
}

/** @deprecated Use getFrictionShieldAction */
export function getDistractionShieldSuggestion(type: QuestDistractionType): string {
  return getFrictionShieldAction(type);
}

export function sanitizeQuestDistractionType(raw: unknown): QuestDistractionType | null {
  if (typeof raw !== 'string') return null;
  return FRICTION_SHIELD_OPTIONS.some((option) => option.type === raw)
    ? (raw as QuestDistractionType)
    : null;
}

export function getDistractionOptionLabel(type: QuestDistractionType): string {
  return FRICTION_SHIELD_OPTIONS.find((option) => option.type === type)?.label ?? type;
}
