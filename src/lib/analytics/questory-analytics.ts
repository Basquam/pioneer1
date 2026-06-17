/**
 * Domain-specific analytics wrapper for Questory.
 *
 * Each function maps to a specific product event and enforces the privacy rule:
 * never send user-written text (quest titles, notes, descriptions).
 *
 * All functions are fire-and-forget — they never throw to callers.
 */
import { ANALYTICS_EVENTS } from './analytics-events';
import { trackAnalyticsOnce } from './analytics-dedupe';
import {
  setAnalyticsUserProperty,
  trackEvent,
  trackScreenView,
} from './analytics-service';
import type { MascotId, NotificationType, QuestSource } from './analytics-types';

// ─── General ─────────────────────────────────────────────────────────────────

export function trackAppOpened(params: {
  has_onboarded: boolean;
  universe_id?: string | null;
  saga_id?: string | null;
  chapter_id?: string | null;
  level?: number;
}): void {
  trackEvent(ANALYTICS_EVENTS.app_opened, params);
}

export function trackScreenViewed(pathname: string): void {
  trackScreenView(pathname, 'QuestoryScreen');
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export function trackOnboardingStarted(): void {
  trackEvent(ANALYTICS_EVENTS.onboarding_started);
}

export function trackOnboardingCompleted(params: {
  universe_id: string;
  saga_id: string;
}): void {
  trackEvent(ANALYTICS_EVENTS.onboarding_completed, params);
}

export function trackUniverseSelected(params: { universe_id: string }): void {
  trackEvent(ANALYTICS_EVENTS.universe_selected, params);
}

export function trackSagaSelected(params: { universe_id: string; saga_id: string }): void {
  trackEvent(ANALYTICS_EVENTS.saga_selected, params);
}

// ─── Quest / productivity ────────────────────────────────────────────────────

export function trackQuestCreated(params: {
  universe_id: string;
  saga_id: string;
  chapter_id: string;
  category: string;
  quest_source: QuestSource;
  level?: number;
  is_first_quest: boolean;
}): void {
  trackEvent(ANALYTICS_EVENTS.quest_created, params);
}

export function trackFirstQuestCreated(params: {
  universe_id: string;
  saga_id: string;
  chapter_id: string;
  category: string;
  quest_source: QuestSource;
}): void {
  trackEvent(ANALYTICS_EVENTS.first_quest_created, params);
}

export function trackQuestCompleted(params: {
  universe_id: string;
  saga_id: string;
  chapter_id: string;
  category: string;
  quest_source: QuestSource;
  level: number;
  reputation: number;
  villain_influence: number;
  is_first_completion: boolean;
  quest_id?: string;
}): void {
  trackEvent(ANALYTICS_EVENTS.quest_completed, params);
}

export function trackFirstQuestCompleted(params: {
  universe_id: string;
  saga_id: string;
  chapter_id: string;
  category: string;
  quest_source: QuestSource;
  level: number;
  reputation: number;
  villain_influence: number;
  quest_id?: string;
}): void {
  trackEvent(ANALYTICS_EVENTS.first_quest_completed, params);
}

export function trackFocusStarted(params: {
  universe_id: string;
  saga_id: string;
  chapter_id: string;
  is_first_focus: boolean;
  quest_id?: string;
}): void {
  trackEvent(ANALYTICS_EVENTS.focus_started, params);
}

export function trackFirstFocusStarted(params: {
  universe_id: string;
  saga_id: string;
  chapter_id: string;
  quest_id?: string;
}): void {
  trackEvent(ANALYTICS_EVENTS.first_focus_started, params);
}

// ─── Story progression ───────────────────────────────────────────────────────

export function trackChapterStarted(params: {
  universe_id: string;
  saga_id: string;
  chapter_id: string;
  chapter_index?: number;
  level?: number;
  reputation?: number;
}): void {
  trackEvent(ANALYTICS_EVENTS.chapter_started, params);
}

export function trackChapterCompleted(params: {
  universe_id: string;
  saga_id: string;
  chapter_id: string;
  chapter_index?: number;
  level?: number;
  reputation?: number;
  villain_influence?: number;
  completed_quest_count?: number;
  unlock_type?: string;
}): void {
  trackEvent(ANALYTICS_EVENTS.chapter_completed, params);
}

export function trackSagaCompleted(params: {
  universe_id: string;
  saga_id: string;
  level?: number;
  reputation?: number;
}): void {
  trackEvent(ANALYTICS_EVENTS.saga_completed, params);
}

export function trackSagaUnlocked(params: {
  universe_id: string;
  saga_id: string;
  unlocked_by_chapter_id?: string;
  unlock_type?: string;
}): void {
  trackEvent(ANALYTICS_EVENTS.saga_unlocked, params);
}

// ─── Notifications ───────────────────────────────────────────────────────────

export function trackNotificationPermissionRequested(): void {
  trackEvent(ANALYTICS_EVENTS.notification_permission_requested);
}

export function trackNotificationPermissionResult(params: {
  permission_status: 'granted' | 'denied' | 'undetermined' | 'unsupported';
}): void {
  trackEvent(ANALYTICS_EVENTS.notification_permission_result, params);
}

export function trackNotificationEnabled(params?: {
  notification_type?: NotificationType;
}): void {
  trackEvent(ANALYTICS_EVENTS.notification_enabled, params);
}

export function trackNotificationDisabled(params?: {
  notification_type?: NotificationType;
}): void {
  trackEvent(ANALYTICS_EVENTS.notification_disabled, params);
}

export function trackNotificationTestSent(): void {
  trackEvent(ANALYTICS_EVENTS.notification_test_sent);
}

export function trackDailyRemindersScheduled(): void {
  trackEvent(ANALYTICS_EVENTS.daily_reminders_scheduled);
}

// ─── Mascots / guidance ──────────────────────────────────────────────────────

export function trackMascotTipSeen(params: {
  mascot_id: MascotId;
  tip_context: string;
  universe_id?: string;
  screen_name?: string;
}): void {
  trackEvent(ANALYTICS_EVENTS.mascot_tip_seen, params);
}

export function trackMascotReactionSeen(params: {
  mascot_id: MascotId;
  universe_id?: string;
}): void {
  trackEvent(ANALYTICS_EVENTS.mascot_reaction_seen, params);
}

export function trackGuidePanelOpened(params: {
  mascot_id: MascotId;
  tip_context?: string;
  screen_name?: string;
  universe_id?: string;
}): void {
  trackEvent(ANALYTICS_EVENTS.guide_panel_opened, params);
}

// ─── Inventory / rewards ─────────────────────────────────────────────────────

export function trackInventoryItemEquipped(params: {
  item_id: string;
  universe_id?: string;
}): void {
  trackEvent(ANALYTICS_EVENTS.inventory_item_equipped, params);
}

export function trackRewardUnlocked(params: {
  reward_id: string;
  unlock_type: string;
  universe_id?: string;
  saga_id?: string;
  chapter_id?: string;
}): void {
  trackEvent(ANALYTICS_EVENTS.reward_unlocked, params);
}

// ─── Developer / testing ─────────────────────────────────────────────────────

export function trackResetProgressUsed(): void {
  trackEvent(ANALYTICS_EVENTS.reset_progress_used);
}

// ─── User properties ─────────────────────────────────────────────────────────

export function setUserPropHasOnboarded(value: boolean): void {
  setAnalyticsUserProperty('has_onboarded', value ? 'true' : 'false');
}

export function setUserPropUniverse(universeId: string | null): void {
  setAnalyticsUserProperty('universe_id', universeId);
}

export function setUserPropSaga(sagaId: string | null): void {
  setAnalyticsUserProperty('saga_id', sagaId);
}

export function setUserPropLevel(level: number): void {
  setAnalyticsUserProperty('player_level', String(level));
}

// ─── Story unlock helpers ──────────────────────────────────────────────────────

type ChapterRewardLike = {
  id: string;
  type: string;
  unlockTargetId?: string;
};

/**
 * Tracks reward_unlocked and saga_unlocked for rewards newly added to progress.
 * Skips ids already present in `previousUnlockedIds` to avoid hydration duplicates.
 */
export function trackNewlyUnlockedChapterRewards(
  previousUnlockedIds: string[],
  rewards: ChapterRewardLike[],
  context: {
    universe_id: string;
    saga_id: string;
    chapter_id: string;
  },
): void {
  for (const reward of rewards) {
    if (previousUnlockedIds.includes(reward.id)) continue;

    trackAnalyticsOnce(`reward_unlocked:${reward.id}`, () => {
      trackRewardUnlocked({
        reward_id: reward.id,
        unlock_type: reward.type,
        universe_id: context.universe_id,
        saga_id: context.saga_id,
        chapter_id: context.chapter_id,
      });
    });

    if (reward.type === 'storyUnlock' && reward.unlockTargetId) {
      trackAnalyticsOnce(`saga_unlocked:${reward.unlockTargetId}`, () => {
        trackSagaUnlocked({
          universe_id: context.universe_id,
          saga_id: reward.unlockTargetId!,
          unlocked_by_chapter_id: context.chapter_id,
          unlock_type: reward.type,
        });
      });
    }
  }
}
