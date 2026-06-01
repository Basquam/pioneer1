import type { AppMascot, AppMascotId } from '@/types/narrative';

/** Optional portrait assets — safe when files are absent (initials used instead). */
export const MASCOT_PORTRAITS: Partial<Record<AppMascotId, number>> = {};

export const APP_MASCOTS: Record<AppMascotId, AppMascot> = {
  sasha: {
    id: 'sasha',
    name: 'Sasha',
    role: 'Planning Coach',
    toneDescription: 'Strategic, clear, calm, direct.',
    initials: 'S',
    portrait: MASCOT_PORTRAITS.sasha,
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus',
    role: 'Momentum Coach',
    toneDescription: 'Warm, encouraging, slightly playful, supportive.',
    initials: 'M',
    portrait: MASCOT_PORTRAITS.marcus,
  },
};

export const MASCOT_PREFERENCE_OPTIONS: Array<{
  value: import('@/types/narrative').MascotPreference;
  label: string;
  hint: string;
}> = [
  { value: 'both', label: 'Sasha & Marcus', hint: 'Context-aware tips from both coaches.' },
  { value: 'sasha', label: 'Sasha only', hint: 'Planning and load-management guidance.' },
  { value: 'marcus', label: 'Marcus only', hint: 'Motivation and first-action encouragement.' },
  { value: 'minimal', label: 'Minimal tips', hint: 'Short helper text without mascot cards.' },
  { value: 'off', label: 'Off', hint: 'Plain helper text only.' },
];

export function getAppMascot(id: AppMascotId): AppMascot {
  return APP_MASCOTS[id];
}
