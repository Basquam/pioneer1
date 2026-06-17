/** Safe primitive values that Firebase Analytics accepts as parameter values. */
export type SafeParamValue = string | number | boolean | null | undefined;

/** Key-value params for an analytics event. Keys must be snake_case. */
export type AnalyticsParams = Record<string, SafeParamValue>;

/**
 * All valid analytics event names.
 * Each name is Firebase-safe: lowercase snake_case, under 40 characters,
 * no reserved prefixes (firebase_, google_, ga_).
 */
export type AnalyticsEventName =
  | 'app_opened'
  | 'screen_viewed'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'universe_selected'
  | 'saga_selected'
  | 'quest_created'
  | 'first_quest_created'
  | 'quest_completed'
  | 'first_quest_completed'
  | 'focus_started'
  | 'first_focus_started'
  | 'chapter_started'
  | 'chapter_completed'
  | 'saga_completed'
  | 'saga_unlocked'
  | 'notification_permission_requested'
  | 'notification_permission_result'
  | 'notification_enabled'
  | 'notification_disabled'
  | 'notification_test_sent'
  | 'daily_reminders_scheduled'
  | 'mascot_tip_seen'
  | 'mascot_reaction_seen'
  | 'guide_panel_opened'
  | 'inventory_item_equipped'
  | 'reward_unlocked'
  | 'reset_progress_used';

/** Origin of a quest: user-written or a saga template/system quest. */
export type QuestSource = 'user' | 'template' | 'recovery' | 'inbox';

/** Daily reminder types surfaced in notification analytics. */
export type NotificationType = 'morningReminder' | 'eveningReminder' | 'testNotification';

/** ID of an in-app mascot coach. */
export type MascotId = 'sasha' | 'marcus';

/** Core analytics provider interface. All methods must be fire-and-forget safe. */
export interface AnalyticsProvider {
  logEvent(name: string, params?: Record<string, string | number | boolean>): Promise<void>;
  logScreenView(screenName: string, screenClass?: string): Promise<void>;
  setUserProperty(name: string, value: string | null): Promise<void>;
  setAnalyticsCollectionEnabled(enabled: boolean): Promise<void>;
}
