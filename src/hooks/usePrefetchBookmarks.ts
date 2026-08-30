/**
 * usePrefetchBookmarks.ts
 *
 * Addresses the proactive-prefetch gap in offline support:
 * The opportunistic approach (only caching when the Bookmarks tab is opened)
 * fails the acceptance criteria if the user goes offline before visiting that tab.
 *
 * This hook fires a background prefetch of ALL bookmarked opportunity IDs
 * whenever the user is online and their bookmark list changes (e.g. on login).
 * It is fire-and-forget — it never blocks the UI or shows a loading indicator.
 */

import { useEffect, useRef } from 'react';
import { fetchOpportunityById } from '../services/apiClient';
import { saveBookmarksToIDB } from '../lib/offlineStore';

interface UsePrefetchBookmarksOptions {
  bookmarkIds: string[] | undefined;
}

export function usePrefetchBookmarks({ bookmarkIds }: UsePrefetchBookmarksOptions): void {
  const previousIdsRef = useRef<string>('');

  useEffect(() => {
    if (!bookmarkIds || bookmarkIds.length === 0) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    // Stable serialisation to avoid re-running on reference changes
    const serialised = [...bookmarkIds].sort().join(',');
    if (serialised === previousIdsRef.current) return;
    previousIdsRef.current = serialised;

    // Background: fetch all bookmark details and persist to IDB
    const prefetch = async () => {
      try {
        const results = await Promise.all(
          bookmarkIds.map((id) => fetchOpportunityById(id)),
        );
        const valid = results.filter(Boolean) as Record<string, unknown>[];
        if (valid.length > 0) {
          await saveBookmarksToIDB(valid);
          console.info(`[PWA] Prefetched ${valid.length} bookmarks to IDB for offline access.`);
        }
      } catch (err) {
        // Never propagate — this is a best-effort background operation
        console.warn('[PWA] Background bookmark prefetch failed:', err);
      }
    };

    void prefetch();
  }, [bookmarkIds]);
}
