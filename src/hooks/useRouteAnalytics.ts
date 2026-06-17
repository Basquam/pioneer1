import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { trackScreenViewed } from '@/lib/analytics/questory-analytics';

/**
 * Tracks a `screen_viewed` analytics event whenever the active pathname changes.
 * Deduplicates — will not re-fire for the same path unless navigation occurs.
 *
 * Mount this hook once in the root layout component that wraps all screens.
 * It must not alter navigation behaviour.
 */
export function useRouteAnalytics(): void {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === lastTracked.current) return;
    lastTracked.current = pathname;
    trackScreenViewed(pathname);
  }, [pathname]);
}
