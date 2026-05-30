import { useEffect, useRef } from 'react';

import { useGame } from '@/hooks/use-game';
import { syncQuestReminderNotifications } from '@/lib/local-notifications';

/** Keeps scheduled local quest cues aligned with progress — no UI. */
export function QuestReminderSync() {
  const { activeUniverse, playerProgress, applyQuestReminderSyncUpdates } = useGame();
  const syncingRef = useRef(false);

  useEffect(() => {
    if (syncingRef.current) return;

    syncingRef.current = true;
    let cancelled = false;

    void syncQuestReminderNotifications(playerProgress, activeUniverse.id)
      .then((updates) => {
        if (cancelled || updates.length === 0) return;
        applyQuestReminderSyncUpdates(updates);
      })
      .finally(() => {
        syncingRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [
    activeUniverse.id,
    applyQuestReminderSyncUpdates,
    playerProgress.reminderPreferences,
    playerProgress.userQuests,
  ]);

  return null;
}
