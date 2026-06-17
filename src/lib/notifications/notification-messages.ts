export type CoachVoice = 'sasha' | 'marcus';

export type NotificationPreset =
  | 'morningReminder'
  | 'eveningReminder'
  | 'unfinishedQuestReminder'
  | 'comebackReminder'
  | 'testNotification';

export type NotificationCopy = {
  title: string;
  body: string;
  voice: CoachVoice;
};

const SASHA_MESSAGES = [
  'You said you would finish this today.',
  'Your quest is still waiting.',
  'Discipline is built before motivation arrives.',
  'One task. No negotiation.',
  'You already know what needs to be done.',
] as const;

const MARCUS_MESSAGES = [
  'One small quest is enough to restart.',
  'You do not need a perfect day. Just continue.',
  'A short step still moves the story forward.',
  'Come back when you are ready. The path is still here.',
  'Let\u2019s clear one quest together.',
] as const;

const PRESET_VOICE: Record<NotificationPreset, CoachVoice> = {
  morningReminder: 'sasha',
  eveningReminder: 'marcus',
  unfinishedQuestReminder: 'sasha',
  comebackReminder: 'marcus',
  testNotification: 'marcus',
};

const PRESET_TITLE: Record<NotificationPreset, string> = {
  morningReminder: 'Questory · Morning',
  eveningReminder: 'Questory · Evening',
  unfinishedQuestReminder: 'Questory · Quest waiting',
  comebackReminder: 'Questory',
  testNotification: 'Questory · Test',
};

function pickMessage(voice: CoachVoice, preset: NotificationPreset): string {
  const pool = voice === 'sasha' ? SASHA_MESSAGES : MARCUS_MESSAGES;
  const index = preset.charCodeAt(0) % pool.length;
  return pool[index] ?? pool[0];
}

export function getNotificationCopy(preset: NotificationPreset, voice?: CoachVoice): NotificationCopy {
  const resolvedVoice = voice ?? PRESET_VOICE[preset];
  return {
    title: PRESET_TITLE[preset],
    body: pickMessage(resolvedVoice, preset),
    voice: resolvedVoice,
  };
}

export function getTestNotificationCopy(voice: CoachVoice = 'marcus'): NotificationCopy {
  return {
    title: PRESET_TITLE.testNotification,
    body:
      voice === 'sasha'
        ? 'Your quest is still waiting.'
        : 'One small quest is enough to restart.',
    voice,
  };
}
