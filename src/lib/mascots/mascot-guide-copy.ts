import type { AppMascotId } from '@/types/narrative';

import type { MascotMood } from '@/lib/mascot-assets';

export type MascotGuideContextId =
  | 'first_app_open'
  | 'onboarding_start'
  | 'universe_selection'
  | 'saga_selection'
  | 'onboarding_first_quest'
  | 'hq_empty_state'
  | 'quest_board_empty_state'
  | 'after_first_quest_created'
  | 'after_first_quest_completed'
  | 'chapter_complete'
  | 'notification_settings'
  | 'analytics_settings'
  | 'profile_progress'
  | 'low_progress_encouragement'
  | 'hq_no_user_quest'
  | 'hq_bounties_remain'
  | 'hq_progress_acknowledged'
  | 'hq_villain_high'
  | 'hq_story_continue'
  | 'add_quest_first_time'
  | 'quest_board_custom_empty'
  | 'quest_board_chapter_cleared';

export type MascotGuideCopy = {
  mascot: AppMascotId;
  mood: MascotMood;
  title: string;
  message: string;
  actionLabel?: string;
};

const COPY: Record<MascotGuideContextId, MascotGuideCopy> = {
  first_app_open: {
    mascot: 'marcus',
    mood: 'inviting',
    title: 'Welcome, Pioneer',
    message: 'Your real tasks become quests. Your days become chapters. I will help you restart whenever you need.',
  },
  onboarding_start: {
    mascot: 'marcus',
    mood: 'happy',
    title: 'Your story starts here',
    message: 'Questory turns daily life into a saga. Small quests count. You do not need a perfect plan to begin.',
  },
  universe_selection: {
    mascot: 'sasha',
    mood: 'neutral',
    title: 'Choose your battlefield',
    message: 'Each universe is a world with its own tone. Pick where you want to fight procrastination first.',
  },
  saga_selection: {
    mascot: 'sasha',
    mood: 'approve',
    title: 'Pick a story arc',
    message: 'Sagas are long-form paths. Chapter bounties move the plot. Your personal quests keep you productive between beats.',
  },
  onboarding_first_quest: {
    mascot: 'sasha',
    mood: 'approve',
    title: 'One task. No negotiation.',
    message: 'Pick one real task you can finish today. Small is fine. Vague is fine. Proof starts here.',
  },
  hq_empty_state: {
    mascot: 'marcus',
    mood: 'inviting',
    title: 'Start with one quest',
    message: 'Name one real task. We will weave it into the saga. Momentum begins with a single clear move.',
  },
  quest_board_empty_state: {
    mascot: 'marcus',
    mood: 'neutral',
    title: 'Your board is clear',
    message: 'Custom quests are personal tasks. Chapter bounties advance the story. Add one small quest to get moving.',
  },
  after_first_quest_created: {
    mascot: 'sasha',
    mood: 'approve',
    title: 'Quest locked in',
    message: 'Good. Now finish it. Proof beats intention. One completed quest is worth more than ten planned ones.',
  },
  after_first_quest_completed: {
    mascot: 'marcus',
    mood: 'happy',
    title: 'First win logged',
    message: 'That counts. You do not need a perfect day — one completed quest is enough to restart the run.',
  },
  chapter_complete: {
    mascot: 'sasha',
    mood: 'approve',
    title: 'Chapter cleared',
    message: 'The story moves because you showed up. Take the next beat when you are ready.',
  },
  notification_settings: {
    mascot: 'marcus',
    mood: 'neutral',
    title: 'Gentle reminders',
    message: 'Daily reminders are local only — no server, no spam. A nudge at the right time can bring you back.',
  },
  analytics_settings: {
    mascot: 'sasha',
    mood: 'neutral',
    title: 'Improve the system',
    message: 'Anonymous usage patterns help us sharpen Questory. No quest titles, notes, or personal text ever leave your device.',
  },
  profile_progress: {
    mascot: 'marcus',
    mood: 'happy',
    title: 'Your run so far',
    message: 'Progress here is proof of consistency, not perfection. Every cleared quest is a vote for who you are becoming.',
  },
  low_progress_encouragement: {
    mascot: 'marcus',
    mood: 'inviting',
    title: 'Still in the fight',
    message: 'A quiet day is not a failed day. One small quest is enough to keep the path open.',
  },
  hq_no_user_quest: {
    mascot: 'marcus',
    mood: 'inviting',
    title: 'Name your first quest',
    message: 'Chapter bounties drive the story. Add one personal quest so today has a target you chose.',
    actionLabel: 'ADD QUEST',
  },
  hq_bounties_remain: {
    mascot: 'sasha',
    mood: 'neutral',
    title: 'Bounty waiting',
    message: 'Pick one chapter bounty and finish it. Story progress requires completed bounties — not just good intentions.',
  },
  hq_progress_acknowledged: {
    mascot: 'marcus',
    mood: 'happy',
    title: 'Momentum noted',
    message: 'You moved the needle today. Keep the next step small enough to start without negotiation.',
  },
  hq_villain_high: {
    mascot: 'sasha',
    mood: 'sad',
    title: 'Pressure rising',
    message: 'Villain influence is high. Clear one bounty before the window closes. Delay is the enemy here.',
  },
  hq_story_continue: {
    mascot: 'sasha',
    mood: 'approve',
    title: 'Story ready',
    message: 'All bounties cleared. Continue the chapter arc — the next beat is waiting.',
    actionLabel: 'VIEW STORY',
  },
  add_quest_first_time: {
    mascot: 'marcus',
    mood: 'neutral',
    title: 'Personal quest',
    message: 'This is your task, not a chapter bounty. It helps you stay productive without replacing story missions.',
  },
  quest_board_custom_empty: {
    mascot: 'marcus',
    mood: 'inviting',
    title: 'No custom quests yet',
    message: 'Add tasks from real life. They live beside chapter bounties — separate tracks, same board.',
    actionLabel: 'ADD QUEST',
  },
  quest_board_chapter_cleared: {
    mascot: 'sasha',
    mood: 'approve',
    title: 'Chapter bounties cleared',
    message: 'Story missions for this chapter are done. Return to HQ or add personal quests to keep momentum.',
  },
};

export function getMascotGuideCopy(contextId: MascotGuideContextId): MascotGuideCopy {
  return COPY[contextId];
}
