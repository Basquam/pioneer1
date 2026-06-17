import type { AnalyticsEventName } from './analytics-types';

/**
 * Typed event name map for all Questory analytics events.
 * Values are identical to keys — this lets callers reference events as
 * ANALYTICS_EVENTS.quest_created while the type system enforces valid names.
 */
export const ANALYTICS_EVENTS = {
  // General
  app_opened: 'app_opened',
  screen_viewed: 'screen_viewed',

  // Onboarding
  onboarding_started: 'onboarding_started',
  onboarding_completed: 'onboarding_completed',
  universe_selected: 'universe_selected',
  saga_selected: 'saga_selected',

  // Quest / productivity
  quest_created: 'quest_created',
  first_quest_created: 'first_quest_created',
  quest_completed: 'quest_completed',
  first_quest_completed: 'first_quest_completed',
  focus_started: 'focus_started',
  first_focus_started: 'first_focus_started',

  // Story progression
  chapter_started: 'chapter_started',
  chapter_completed: 'chapter_completed',
  saga_completed: 'saga_completed',
  saga_unlocked: 'saga_unlocked',

  // Notifications
  notification_permission_requested: 'notification_permission_requested',
  notification_permission_result: 'notification_permission_result',
  notification_enabled: 'notification_enabled',
  notification_disabled: 'notification_disabled',
  notification_test_sent: 'notification_test_sent',
  daily_reminders_scheduled: 'daily_reminders_scheduled',

  // Mascots / guidance
  mascot_tip_seen: 'mascot_tip_seen',
  mascot_reaction_seen: 'mascot_reaction_seen',
  guide_panel_opened: 'guide_panel_opened',

  // Inventory / rewards
  inventory_item_equipped: 'inventory_item_equipped',
  reward_unlocked: 'reward_unlocked',

  // Developer / testing
  reset_progress_used: 'reset_progress_used',

  // Audio settings
  ambience_enabled: 'ambience_enabled',
  ambience_disabled: 'ambience_disabled',
  sound_enabled: 'sound_enabled',
  sound_disabled: 'sound_disabled',
} as const satisfies Record<AnalyticsEventName, AnalyticsEventName>;
