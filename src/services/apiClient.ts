/**
 * Finalized Frontend Fetch Architecture
 * This replaces direct Gemini calls for the feed and delegates logic to the FastAPI backend.
 */

import { auth } from '../lib/firebase';
import * as geminiService from './gemini';
import { getFilteredFallbacks, CURATED_FALLBACKS } from './staticFallbacks';
import { generateCacheKey } from '../utils/cacheUtils.js';

const API_BASE_URL = "/api/v1";

// ─── Configurable Limits ─────────────────────────────────────────────────────
const MEMORY_CACHE_CAPACITY = 50;          // In-memory LRU capacity
const LOCALSTORAGE_MAX_ENTRIES = 30;       // Max persistent cache entries
const LOCALSTORAGE_KEY_PREFIX = 'cache_'; // Prefix for all cache keys in localStorage

// ─── In-Memory LRU Cache (fast, ephemeral) ─────────────────────────────────
class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, { value: V; timestamp: number }>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    const item = this.cache.get(key)!;
    // Refresh the item's position
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  set(key: K, value: V) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Remove the first (least recently used) item
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }
}

const memoryCache = new LRUCache<string, any>(MEMORY_CACHE_CAPACITY);

// ─── Persistent localStorage Cache with LRU Eviction ────────────────────────

interface PersistentCacheEntry {
  data: any;
  timestamp: number;
}

/**
 * Returns all cache keys currently stored in localStorage along with their
 * parsed metadata. Only keys matching the LOCALSTORAGE_KEY_PREFIX are included.
 */
function getAllPersistentCacheEntries(): Array<{ key: string; entry: PersistentCacheEntry }> {
  const entries: Array<{ key: string; entry: PersistentCacheEntry }> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LOCALSTORAGE_KEY_PREFIX)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as PersistentCacheEntry;
          entries.push({ key, entry: parsed });
        }
      } catch {
        // Corrupted entry — skip
      }
    }
  }
  return entries;
}

/**
 * Evicts the oldest entries from localStorage until the total count is
 * at or below the target. Entries are sorted by timestamp (oldest first).
 */
function evictOldestPersistentEntries(targetCount: number): void {
  const entries = getAllPersistentCacheEntries();
  if (entries.length <= targetCount) return;

  // Sort by timestamp ascending (oldest first)
  entries.sort((a, b) => a.entry.timestamp - b.entry.timestamp);

  const toRemove = entries.length - targetCount;
  for (let i = 0; i < toRemove; i++) {
    try {
      localStorage.removeItem(entries[i].key);
    } catch {
      // Ignore removal errors
    }
  }
}

/**
 * Saves data to the two-tier cache (memory + localStorage).
 * Implements LRU eviction for localStorage to prevent QuotaExceededError.
 */
const saveToCache = (key: string, data: any) => {
  // 1. Always update in-memory cache
  memoryCache.set(key, data);

  const storageKey = `${LOCALSTORAGE_KEY_PREFIX}${key}`;
  const payload = JSON.stringify({ data, timestamp: Date.now() } as PersistentCacheEntry);

  try {
    // 2. Pre-emptively evict oldest entries if we're at capacity
    const currentEntries = getAllPersistentCacheEntries();
    if (currentEntries.length >= LOCALSTORAGE_MAX_ENTRIES) {
      evictOldestPersistentEntries(LOCALSTORAGE_MAX_ENTRIES - 1);
    }

    // 3. Attempt to write
    localStorage.setItem(storageKey, payload);
  } catch (e: any) {
    // QuotaExceededError or other storage failure
    // Note: we check .name instead of instanceof DOMException because
    // DOMException may not be available in SSR / test environments.
    if (e && e.name === 'QuotaExceededError') {
      console.warn('[Cache] QuotaExceededError — evicting 20% oldest entries and retrying...');
      evictOldestPersistentEntries(Math.floor(LOCALSTORAGE_MAX_ENTRIES * 0.8));

      try {
        localStorage.setItem(storageKey, payload);
      } catch (retryErr) {
        console.warn('[Cache] Retry failed after eviction — skipping persistent cache for this entry');
      }
    } else {
      console.warn('[Cache] localStorage write failed:', e);
    }
  }
};

/**
 * Retrieves data from the two-tier cache.
 * Memory cache is checked first; localStorage is the fallback.
 */
const getFromCache = (key: string) => {
  // 1. Check in-memory first
  const mem = memoryCache.get(key);
  if (mem) return mem;

  // 2. Fall back to localStorage
  try {
    const storageKey = `${LOCALSTORAGE_KEY_PREFIX}${key}`;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed = JSON.parse(cached) as PersistentCacheEntry;
      // Promote back to memory cache
      memoryCache.set(key, parsed.data);
      return parsed.data;
    }
  } catch (e) {
    return null;
  }
  return null;
};

// ─── Auth & Fetch Helpers ───────────────────────────────────────────────────

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }
  return {
    "Content-Type": "application/json"
  };
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  const headers = await getAuthHeaders();
  const mergedOptions = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(url, mergedOptions);
    if (response.ok) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('backend-status', { detail: { online: true, timestamp: Date.now() } }));
      }
      return response;
    }

    // Don't retry on 4xx (client errors) other than 429
    if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('backend-status', { detail: { online: true, timestamp: Date.now() } }));
      }
      return response;
    }

    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backend-status', { detail: { online: true, timestamp: Date.now() } }));
    }
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backend-status', { detail: { online: false, timestamp: Date.now() } }));
    }
    throw error;
  }
}

// ─── API Client Methods ─────────────────────────────────────────────────────

export async function fetchLatestFeed() {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/opportunities/latest`, {
      method: 'GET'
    });

    if (!response.ok) throw new Error("API_ERROR");

    return await response.json();
  } catch (error) {
    console.warn("fetchLatestFeed failed", error);
    return { items: [], num_results: 0 };
  }
}

export async function fetchSimilarOpportunities(id: string) {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/opportunities/${id}/similar`, {
      method: 'GET'
    });

    if (!response.ok) throw new Error("API_ERROR");

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("fetchSimilarOpportunities failed", error);
    return { items: [] };
  }
}

export async function fetchLeaderboard() {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/leaderboard`, {
      method: "GET"
    });
    if (!response.ok) throw new Error("API_ERROR");
    return await response.json();
  } catch (error) {
    console.warn("fetchLeaderboard failed", error);
    return { data: { leaderboard: [] } };
  }
}

export async function fetchApplications(status?: string) {
  const params = new URLSearchParams();

  if (status && status !== "All") {
    params.set("status", status);
  }

  const response = await fetchWithRetry(
    `${API_BASE_URL}/applications?${params.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  return response.json();
}

export async function createApplicationTracker(
  opportunityId: string,
  status = "interested",
  notes = ""
) {
  const response = await fetchWithRetry(
    `${API_BASE_URL}/applications`,
    {
      method: "POST",
      body: JSON.stringify({
        opportunityId,
        status,
        notes,
      }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to create application");
  }

  return response.json();
}

export async function updateApplicationTracker(
  applicationId: string,
  updates: {
    status?: string;
    notes?: string;
    deadline?: string;
  }
) {
  const response = await fetchWithRetry(
    `${API_BASE_URL}/applications/${applicationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to update application");
  }

  return response.json();
}

export async function deleteApplicationTracker(
  applicationId: string
) {
  const response = await fetchWithRetry(
    `${API_BASE_URL}/applications/${applicationId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete application");
  }

  return response.json();
}
export async function fetchSmartFeed(profile: any, cursor?: string) {

  const userId = auth.currentUser?.uid;

  // Personalized feeds must never share cache entries between users.
  // Anonymous requests use a non-personalized cache key.
  const cacheKey = userId
    ? `smart_feed_user_${userId}_${cursor || ''}`
    : generateCacheKey('smart_feed', { ...profile, cursor });

  try {
    const searchParams = new URLSearchParams();
    if (cursor) searchParams.append('cursor', cursor);

    if (profile?.domain) searchParams.append('domain', profile.domain);
    if (profile?.skills) {
      const skl = Array.isArray(profile.skills) ? profile.skills.join(',') : String(profile.skills);
      searchParams.append('skills', skl);
    }
    if (profile?.country) searchParams.append('country', profile.country);
    if (profile?.field) searchParams.append('field', profile.field);

    const url = `${API_BASE_URL}/opportunities?${searchParams.toString()}`;
    const response = await fetchWithRetry(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("API_ERROR");

    const data = await response.json();

    const hasMissingDbMarker = data.items && data.items.some((i: any) => i.id === "sys_nodeDbMissing");

    if (!data.items || data.items.length < 3 || hasMissingDbMarker) {
      console.log("DB returned sparse results or missing database, triggering Gemini supplemental discovery...");
      let geminiSuccess = false;
      try {
        const geminiItems = await geminiService.generateSmartFeed(profile, 1);
        if (geminiItems && geminiItems.length > 0) {
          // Filter out missing DB placeholder first
          const cleanDbItems = (data.items || []).filter((item: any) => item.id !== "sys_nodeDbMissing");
          data.items = [
            ...cleanDbItems,
            ...geminiItems.map((item: any) => ({ ...item, isAI_Supplement: true }))
          ];
          data.meta = { ...data.meta, note: "Supplemented with AI-discovered opportunities" };
          // For AI supplements, we can't easily cursor paginate, so we just return no cursor
          geminiSuccess = true;
        }
      } catch (geminiError) {
        console.warn("Gemini supplement failed, resolving to local static fallbacks", geminiError);
      }

      // Only fallback to static items if DB returned absolutely nothing
      const cleanDbItems = (data.items || []).filter((item: any) => item.id !== "sys_nodeDbMissing");
      if (cleanDbItems.length === 0) {
        const staticItems = getFilteredFallbacks(profile, 6);
        data.items = staticItems.map((item: any) => ({ ...item, isFallback: true }));
      } else {
        data.items = cleanDbItems;
      }
    }

    if (!cursor && data.items && data.items.length > 0) {
      saveToCache(cacheKey, data);
    }
    return data;
  } catch (error) {
    console.warn("Backend feed failed, using fallback", error);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return { ...cached, isFallback: true };
    }


    try {
      const geminiItems = await geminiService.generateSmartFeed(profile, 1);
      if (geminiItems && geminiItems.length > 0) {
        return {
          items: geminiItems.map((i: any) => ({...i, isAI_Supplement: true})),
          isFallback: true
        };
      }
    } catch (e) {
      console.warn("Gemini recovery failed during complete offline event, resolving to curated local static list", e);
    }

    return {
      items: getFilteredFallbacks(profile, 6).map((item: any) => ({ ...item, isFallback: true })),
      isFallback: true
    };
  }
}

export async function generateApplyAssistBackend(opportunity: any, profile: any) {
  try {
    const content = await geminiService.generateApplyDraft(opportunity, profile);
    return { content: content || "Draft could not be generated." };
  } catch (error) {
    return { content: "Our AI is currently optimizing your draft. Please try again in 60s." };
  }
}

export async function generateContextualCoverLetter(params: {
  opportunityTitle: string;
  organization?: string;
  jobDescription?: string;
  candidateProfile?: any;
  customMotivation?: string;
  tone?: string;
}) {
  const response = await fetchWithRetry(`${API_BASE_URL}/ai/cover-letter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate cover letter");
  }

  const data = await response.json();
  return data.data?.coverLetter || data.coverLetter || "";
}


export async function refineQueryBackend(query: string, profile: any) {
  try {
    const result = await geminiService.refineSearchQuery(query, profile);
    return result || query;
  } catch (error) {
    return query;
  }
}

export async function runScoutProtocolBackend(parameters: any, profile: any) {
  try {
    const searchParams = new URLSearchParams();
    if (parameters.tech) searchParams.append('q', parameters.tech);
    if (parameters.goal) searchParams.append('type', parameters.goal);

    const url = `${API_BASE_URL}/search?${searchParams.toString()}`;
    const response = await fetchWithRetry(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("API_ERROR");

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error("No database results for scout");
    }
    return data;
  } catch (error) {
    console.warn("Scout backend failed or returned empty results, falling back to local matches", error);
    // Dynamic local matching based on scout inputs as safety net
    const scouted = getFilteredFallbacks({
      skills: parameters.tech || "",
      field: parameters.field || ""
    }, 5);
    return {
      results: scouted.map((item: any) => ({ ...item, isFallback: true })),
      meta: { total_found: scouted.length }
    };
  }
}

export async function chatWithAIMentorBackend(messages: any[], newMessage: string) {
  try {
    return await geminiService.chatWithMentor(messages, newMessage);
  } catch (error) {
    return { text: "I'm having trouble connecting to my knowledge base right now." };
  }
}

export async function fetchExploreFeed(cursor?: string, limit: number = 20) {
  const cacheKey = generateCacheKey('explore_feed', { cursor, limit });
  try {
    const searchParams = new URLSearchParams();
    if (cursor) searchParams.append('cursor', cursor);
    searchParams.append('limit', limit.toString());

    const url = `${API_BASE_URL}/opportunities/trending?${searchParams.toString()}`;
    const response = await fetchWithRetry(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("API_ERROR");

    const data = await response.json();

    const hasMissingDbMarker = data.items && data.items.some((i: any) => i.id === "sys_nodeDbMissing");

    if (!data.items || data.items.length < 3 || hasMissingDbMarker) {
      console.log("DB returned sparse explore results, triggering Gemini supplemental discovery...");
      let geminiSuccess = false;
      try {
        const geminiItems = await geminiService.generateExploreFeed(1);
        if (geminiItems && geminiItems.length > 0) {
          data.items = [
            ...(data.items || []).filter((item: any) => item.id !== "sys_nodeDbMissing"),
            ...geminiItems.map((item: any) => ({ ...item, isAI_Supplement: true }))
          ];
          geminiSuccess = true;
        }
      } catch (e) {
        console.warn("Gemini explore supplement failed", e);
      }

      const cleanDbItems = (data.items || []).filter((item: any) => item.id !== "sys_nodeDbMissing");
      if (cleanDbItems.length === 0) {
        const staticItems = getFilteredFallbacks({}, 6);
        data.items = staticItems.map((item: any) => ({ ...item, isFallback: true }));
      } else {
        data.items = cleanDbItems;
      }
    }

    if (!cursor && data.items && data.items.length > 0) {
      saveToCache(cacheKey, data);
    }
    return data;
  } catch (error) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return { ...cached, isFallback: true };
    }

    try {
      const geminiItems = await geminiService.generateExploreFeed(1);
      if (geminiItems && geminiItems.length > 0) {
        return {
          items: geminiItems.map((i: any) => ({...i, isAI_Supplement: true})),
          isFallback: true
        };
      }
    } catch (e) {
      console.warn("Explore recovery failed completely during offline event", e);
    }

    return {
      items: getFilteredFallbacks({}, 6).map((item: any) => ({ ...item, isFallback: true })),
      isFallback: true
    };
  }
}

export async function searchOpportunities(
  query: string,
  filters?: {
    types?: string[];
    locationTypes?: string[];
    stipend?: string;
    minSalary?: number;
    deadlineType?: string;
    startDate?: string;
    endDate?: string;
    isFree?: boolean;
    verifiedOnly?: boolean;
  },
  page: number = 1,
  limit: number = 12,
  sortBy: string = 'Most relevant'
) {
  const cacheKey = generateCacheKey('search', { query: query.toLowerCase().trim(), ...filters, page, limit, sortBy });

  try {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    searchParams.append('sortBy', sortBy);
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    if (filters) {
      if (filters.types && filters.types.length > 0) {
        searchParams.append('types', filters.types.join(','));
      }
      if (filters.locationTypes && filters.locationTypes.length > 0) {
        searchParams.append('locationTypes', filters.locationTypes.join(','));
      }
      if (filters.stipend) {
        searchParams.append('stipend', filters.stipend);
      }
      if (filters.minSalary) {
        searchParams.append('minSalary', filters.minSalary.toString());
      }
      if (filters.deadlineType) {
        searchParams.append('deadlineType', filters.deadlineType);
      }
      if (filters.startDate) {
        searchParams.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        searchParams.append('endDate', filters.endDate);
      }
      if (filters.isFree !== undefined) {
        searchParams.append('isFree', String(filters.isFree));
      }
      if (filters.verifiedOnly !== undefined) {
        searchParams.append('verifiedOnly', String(filters.verifiedOnly));
      }
    }

    const url = `${API_BASE_URL}/search?${searchParams.toString()}`;

    const response = await fetchWithRetry(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) throw new Error("API_ERROR");

    const data = await response.json();

    const type = (filters?.types && filters.types.length > 0) ? filters.types[0] : undefined;

    if (!data.results || data.results.length === 0) {
      console.log("DB search empty, using Gemini Scout Protocol...");
      let geminiSuccess = false;
      try {
        const geminiRes = await geminiService.runScoutProtocol({ tech: query, goal: type }, {});
        if (geminiRes && geminiRes.results && geminiRes.results.length > 0) {
          data.results = geminiRes.results.map((r: any) => ({ ...r, isAI_Supplement: true }));
          data.meta = geminiRes.meta || data.meta;
          data.isAI_Supplement = true;
          geminiSuccess = true;
        }
      } catch (e) {
        console.warn("Gemini scout supplement failed, resorting to static matchers", e);
      }

      const cleanDbItems = (data.results || []).filter((item: any) => item.id !== "sys_nodeDbMissing");
      if (cleanDbItems.length === 0) {
        const localMatches = getFilteredFallbacks({ field: type }, 6, query);
        data.results = localMatches.map((item: any) => ({ ...item, isFallback: true }));
        data.isFallback = true;
      } else {
        data.results = cleanDbItems;
      }
    }

    if (data.results && data.results.length > 0) saveToCache(cacheKey, data);
    return data;
  } catch (error) {
    const cached = getFromCache(cacheKey);
    if (cached) return { ...cached, isFallback: true };

    const type = (filters?.types && filters.types.length > 0) ? filters.types[0] : undefined;

    try {
      const geminiRes = await geminiService.runScoutProtocol({ tech: query, goal: type }, {});
      if (geminiRes && geminiRes.results && geminiRes.results.length > 0) {
        return {
          results: geminiRes.results.map((r: any) => ({ ...r, isAI_Supplement: true })),
          meta: geminiRes.meta,
          isFallback: true
        };
      }
    } catch(e) {
      console.warn("Scout recovery failed completely during exception block", e);
    }

    const localMatches = getFilteredFallbacks({ field: type }, 6, query);
    return {
      results: localMatches.map((item: any) => ({ ...item, isFallback: true })),
      isFallback: true
    };
  }
}

export async function fetchNotifications() {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/notifications`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("API_ERROR");
    return await response.json();
  } catch (error) {
    console.warn("Could not fetch notifications");
    return [];
  }
}

export async function markNotificationRead(id: string) {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/notifications/${id}/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function markAllNotificationsRead() {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/notifications/read-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function fetchSystemStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('backend-status', { detail: { online: true, timestamp: Date.now() } }));
      }
      return await response.json();
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backend-status', { detail: { online: true, timestamp: Date.now() } }));
    }
    return null;
  } catch (e) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('backend-status', { detail: { online: false, timestamp: Date.now() } }));
    }
    return null;
  }
}

export async function trackInteraction(opportunityId: string, actionType: 'view' | 'click' | 'save' | 'apply') {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/interactions/track`, {
      method: "POST",
      headers,
      body: JSON.stringify({ opportunity_id: opportunityId, action_type: actionType })
    });
    if (response.ok) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('backend-status', { detail: { online: true, timestamp: Date.now() } }));
      }
    }
    return response.ok;
  } catch (e) {
    // Fire and forget, don't break UI for tracking failures
    console.warn("Failed to track interaction", e);
    return false;
  }
}

export async function fetchOpportunityById(id: string) {
  const staticFallback = CURATED_FALLBACKS.find(fb => fb.id === id || id.includes(fb.id) || fb.id.includes(id));

  try {
    const url = `${API_BASE_URL}/opportunity/${id}`;
    const response = await fetchWithRetry(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Opportunity offline");
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.warn(`Could not sync opportunity details for ${id}:`, error);
    if (staticFallback) return staticFallback;

    const cleanTitle = typeof id === 'string'
      ? id.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      : "Student Tech Opportunity";

    return {
      id,
      title: cleanTitle.length > 3 ? cleanTitle : "Student Tech Opportunity 2026",
      organization: "Verified Student Partner",
      description: "This verified opportunity is open for student applications. Work on cutting-edge engineering, hackathon projects, or industry internships with global mentors.",
      category: "Opportunity",
      type: "Internship",
      location: "Remote / Online",
      deadline: "Active Listing",
      stipend: "Competitive / Free Entry",
      apply_link: "https://yuvahub.xyz",
      tags: ["Student Friendly", "Verified", "Tech"],
      isVerified: true
    };
  }
}

export async function saveOpportunityToTracker(opportunity: any, status: string = "saved", notes?: string) {
  const oppId = opportunity._id || opportunity.id || opportunity.opportunityId;
  const payload = {
    opportunityId: oppId,
    opportunity: {
      title: opportunity.title,
      organization: opportunity.organization || opportunity.org || "",
      platform: opportunity.platform || "YuvaHub",
      applyUrl: opportunity.applyUrl || opportunity.apply_link || "",
      type: opportunity.type || "",
      location: opportunity.location || "",
      deadline: opportunity.deadline || "",
    },
    status,
    notes,
    deadline: opportunity.deadline ? new Date(opportunity.deadline) : undefined,
  };

  return createApplicationTrackerEntry(payload);
}

export async function createApplicationTrackerEntry(data: any) {
  const response = await fetchWithRetry(
    `${API_BASE_URL}/applications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create application");
  }

  return response.json();
}

export async function confirmTrackedApplication(
  applicationId: string
) {
  const response = await fetchWithRetry(
    `${API_BASE_URL}/applications/${applicationId}/confirm`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to confirm application");
  }

  return response.json();
}

export async function updateTrackedApplicationStatus(
  applicationId: string,
  status: string,
  message?: string
) {
  const response = await fetchWithRetry(
    `${API_BASE_URL}/applications/${applicationId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        message,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update application status");
  }

  return response.json();
}
export async function predictEligibility(
  opportunityId: string,
  profile: any,
  opportunity: any
) {
  const response = await fetchWithRetry(
    `${API_BASE_URL}/eligibility/predict`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        opportunityId,
        profile,
        opportunity,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error || "Failed to generate eligibility prediction"
    );
  }

  return response.json();
}

export async function retryTrackedApplication(
  applicationId: string
) {
  const response = await fetchWithRetry(
    `${API_BASE_URL}/applications/${applicationId}/retry`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to retry application");
  }

  return response.json();
}


export async function submitOpportunity(payload: any) {
  try {
    const url = `${API_BASE_URL}/opportunities`;
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to submit opportunity");
    }

    return await response.json();
  } catch (error) {
    console.error("submitOpportunity error:", error);
    throw error;
  }
}

// ─── AI Recommendation Engine API Client Methods ────────────────────────────

export async function fetchPersonalizedRecommendations(params?: { minScore?: number; type?: string; limit?: number; offset?: number }) {
  try {
    const query = new URLSearchParams();
    if (params?.minScore) query.append("minScore", params.minScore.toString());
    if (params?.type && params.type !== "All") query.append("type", params.type);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());

    const url = `${API_BASE_URL}/recommendations?${query.toString()}`;
    const response = await fetchWithRetry(url, { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch recommendations");
    return await response.json();
  } catch (error) {
    console.warn("fetchPersonalizedRecommendations fallback:", error);
    return null;
  }
}

export async function fetchMatchExplanation(opportunityId: string) {
  try {
    const url = `${API_BASE_URL}/recommendations/explanation/${opportunityId}`;
    const response = await fetchWithRetry(url, { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch explanation");
    return await response.json();
  } catch (error) {
    console.warn("fetchMatchExplanation fallback:", error);
    return null;
  }
}

export async function parseProfileSkillsAndInterests(resumeText: string, bioText?: string) {
  try {
    const url = `${API_BASE_URL}/recommendations/parse-profile`;
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, bioText })
    });
    if (!response.ok) throw new Error("Failed to parse skills");
    return await response.json();
  } catch (error) {
    console.warn("parseProfileSkillsAndInterests fallback:", error);
    return null;
  }
}

export async function fetchRecommendationPreferences() {
  try {
    const url = `${API_BASE_URL}/recommendations/preferences`;
    const response = await fetchWithRetry(url, { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch preferences");
    return await response.json();
  } catch (error) {
    console.warn("fetchRecommendationPreferences fallback:", error);
    return null;
  }
}

export async function updateRecommendationPreferences(preferences: any) {
  try {
    const url = `${API_BASE_URL}/recommendations/preferences`;
    const response = await fetchWithRetry(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences)
    });
    if (!response.ok) throw new Error("Failed to update preferences");
    return await response.json();
  } catch (error) {
    console.warn("updateRecommendationPreferences fallback:", error);
    return null;
  }
}

export async function recordRecommendationInteraction(opportunityId: string, interactionType: 'view' | 'save' | 'apply' | 'dismiss', tags: string[] = [], opportunityType: string = "") {
  try {
    const url = `${API_BASE_URL}/recommendations/interaction`;
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId, interactionType, tags, opportunityType })
    });
    return response.ok;
  } catch (error) {
    console.warn("recordRecommendationInteraction fallback:", error);
    return false;
  }
}

export async function fetchProfileCompletenessScore() {
  try {
    const url = `${API_BASE_URL}/recommendations/completeness`;
    const response = await fetchWithRetry(url, { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch completeness");
    return await response.json();
  } catch (error) {
    console.warn("fetchProfileCompletenessScore fallback:", error);
    return null;
  }
}

export async function generateFlashcardsBackend(jobDescription: string) {
  try {
    const url = `${API_BASE_URL}/ai/flashcards`;
    const response = await fetchWithRetry(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to generate flashcards");
    return result.data?.flashcards || [];
  } catch (error) {
    console.warn("generateFlashcardsBackend error:", error);
    throw error;
  }
}

// --- Career Goal Tracker ---

export async function createCareerGoal(goalTitle: string, targetRole: string, targetDate: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/career-goals`, {
    method: 'POST',
    body: JSON.stringify({ goalTitle, targetRole, targetDate }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create career goal");
  }
  return await response.json();
}

export async function fetchEmployerPostings() {
  try {
    const headers = await getAuthHeaders();
    const response = await fetchWithRetry(`${API_BASE_URL}/employer/postings`, {
      method: "GET",
      headers,
    });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.data?.postings || data.postings || [];
  } catch (error) {
    console.error("Failed to fetch employer postings:", error);
    return [];
  }
}

export async function fetchEmployerAnalytics(params: { timeframe?: string; opportunityId?: string } = {}) {
  try {
    const headers = await getAuthHeaders();
    const searchParams = new URLSearchParams();
    if (params.timeframe) searchParams.append("timeframe", params.timeframe);
    if (params.opportunityId) searchParams.append("opportunityId", params.opportunityId);

    const response = await fetchWithRetry(`${API_BASE_URL}/employer/analytics?${searchParams.toString()}`, {
      method: "GET",
      headers,
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Failed to fetch employer analytics:", error);
    return null;
  }
}

export async function fetchCareerGoals() {
  const response = await fetchWithRetry(`${API_BASE_URL}/career-goals`, {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error("Failed to fetch career goals");
  }
  return await response.json();
}

export async function updateCareerGoalMilestone(goalId: string, milestoneId: string, status: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/career-goals/${goalId}/milestones/${milestoneId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error("Failed to update milestone");
  }
  return await response.json();
}

export async function deleteCareerGoal(goalId: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/career-goals/${goalId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error("Failed to delete career goal");
  }
  return await response.json();
}

export async function previewNewsletterClient(params: { email?: string; name?: string; skills?: string[]; field?: string } = {}) {
  const response = await fetchWithRetry(`${API_BASE_URL}/newsletter/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error("Failed to preview newsletter");
  }
  const data = await response.json();
  return data.data || data;
}

export async function triggerNewsletterBatchClient(params: { batchSize?: number; dryRun?: boolean } = {}) {
  const headers = await getAuthHeaders();
  const response = await fetchWithRetry(`${API_BASE_URL}/newsletter/trigger`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error("Failed to trigger newsletter batch");
  }
  const data = await response.json();
  return data.data || data;
}

export async function unsubscribeNewsletterClient(email: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/newsletter/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    throw new Error("Failed to unsubscribe");
  }
  return await response.json();
}


// --- Student Ventures & Campus Startup Capital ---

export async function fetchStudentVentures(filters?: { campusName?: string; sectorDomain?: string; fundingStage?: string; search?: string }) {
  const params = new URLSearchParams();
  if (filters?.campusName && filters.campusName !== 'All') params.append('campusName', filters.campusName);
  if (filters?.sectorDomain && filters.sectorDomain !== 'All') params.append('sectorDomain', filters.sectorDomain);
  if (filters?.fundingStage && filters.fundingStage !== 'All') params.append('fundingStage', filters.fundingStage);
  if (filters?.search) params.append('search', filters.search);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetchWithRetry(`${API_BASE_URL}/campus/ventures${query}`, { method: 'GET' });
  if (!response.ok) {
    throw new Error("Failed to fetch campus student ventures");
  }
  return await response.json();
}

export async function registerStudentVenture(payload: any) {
  const response = await fetchWithRetry(`${API_BASE_URL}/campus/ventures`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to register student venture");
  }
  return await response.json();
}

export async function commitStudentVentureInvestment(id: string, investmentAmountUsd: number, investorName?: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/campus/ventures/${id}/invest`, {
    method: 'POST',
    body: JSON.stringify({ investmentAmountUsd, investorName }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Failed to invest in student venture");
  }
  return await response.json();
}


/* -------------------------------------------------------------------------- */
/* Compatibility API exports for feature tabs/pages.                         */
/* These wrappers keep the frontend API surface aligned with the route views. */
/* -------------------------------------------------------------------------- */

async function apiClientRequest(path: string, method: string = 'GET', body?: any): Promise<any> {
  const response = await fetchWithRetry(`${API_BASE_URL}${path}`, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `Request failed: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response;
}

export async function fetchReviewRequests(...args: any[]): Promise<any> {
  return apiClientRequest('/code-review/requests');
}

export async function createReviewRequest(payload: any): Promise<any> {
  return apiClientRequest('/code-review/requests', 'POST', payload);
}

export async function claimReview(id: string, reviewerName?: string): Promise<any> {
  return apiClientRequest(`/code-review/requests/${encodeURIComponent(id)}/claim`, 'POST', { reviewerName });
}

export async function submitReviewFeedback(id: string, payload: any): Promise<any> {
  return apiClientRequest(`/code-review/requests/${encodeURIComponent(id)}/feedback`, 'POST', payload);
}

export async function fetchMyReviews(...args: any[]): Promise<any> {
  return apiClientRequest('/code-review/my-reviews');
}

export async function fetchCalendarEvents(...args: any[]): Promise<any> {
  return apiClientRequest('/calendar/events');
}

export async function setDeadlineReminder(...args: any[]): Promise<any> {
  const payload = args.length === 1 ? args[0] : { opportunityId: args[0], reminder: args[1] };
  return apiClientRequest('/deadline-reminders', 'POST', payload);
}

export async function deleteDeadlineReminder(id: string, ...args: any[]): Promise<any> {
  return apiClientRequest(`/deadline-reminders/${encodeURIComponent(id)}`, 'DELETE');
}

export async function downloadCalendarICS(...args: any[]): Promise<any> {
  return apiClientRequest('/calendar/ics');
}

export async function fetchConversations(...args: any[]): Promise<any> {
  return apiClientRequest('/messages/conversations');
}

export async function fetchMessages(conversationId: string, ...args: any[]): Promise<any> {
  return apiClientRequest(`/messages/conversations/${encodeURIComponent(conversationId)}`);
}

export async function sendDirectMessage(payload: any, ...args: any[]): Promise<any> {
  return apiClientRequest('/messages', 'POST', payload);
}

export async function markConversationRead(conversationId: string, ...args: any[]): Promise<any> {
  return apiClientRequest(`/messages/conversations/${encodeURIComponent(conversationId)}/read`, 'POST');
}

export async function fetchResources(...args: any[]): Promise<any> {
  return apiClientRequest('/resources');
}

export async function fetchSavedResources(...args: any[]): Promise<any> {
  return apiClientRequest('/resources/saved');
}

export async function submitResource(payload: any): Promise<any> {
  return apiClientRequest('/resources', 'POST', payload);
}

export async function voteResource(id: string, ...args: any[]): Promise<any> {
  return apiClientRequest(`/resources/${encodeURIComponent(id)}/vote`, 'POST', args[0]);
}

export async function saveResource(id: string, ...args: any[]): Promise<any> {
  return apiClientRequest(`/resources/${encodeURIComponent(id)}/save`, 'POST', args[0]);
}

export async function flagResource(id: string, ...args: any[]): Promise<any> {
  return apiClientRequest(`/resources/${encodeURIComponent(id)}/flag`, 'POST', args[0]);
}

export async function fetchStudyGroups(...args: any[]): Promise<any> {
  return apiClientRequest('/study-groups');
}

export async function createStudyGroup(payload: any): Promise<any> {
  return apiClientRequest('/study-groups', 'POST', payload);
}

export async function joinStudyGroup(id: string, ...args: any[]): Promise<any> {
  return apiClientRequest(`/study-groups/${encodeURIComponent(id)}/join`, 'POST', args[0]);
}

export async function leaveStudyGroup(id: string, ...args: any[]): Promise<any> {
  return apiClientRequest(`/study-groups/${encodeURIComponent(id)}/leave`, 'POST', args[0]);
}

export async function fetchAlumniEndowments(...args: any[]): Promise<any> {
  return apiClientRequest('/campus/endowments');
}

export async function createAlumniEndowment(payload: any): Promise<any> {
  return apiClientRequest('/campus/endowments', 'POST', payload);
}

export async function contributeToAlumniEndowment(id: string, payload?: any): Promise<any> {
  return apiClientRequest(`/campus/endowments/${encodeURIComponent(id)}/contribute`, 'POST', payload);
}

export async function fetchAlumniMentorshipSlots(...args: any[]): Promise<any> {
  return apiClientRequest('/campus/mentorship/slots');
}

export async function registerAlumniMentorshipSlot(payload: any): Promise<any> {
  return apiClientRequest('/campus/mentorship/slots', 'POST', payload);
}

export async function bookAlumniMentorshipSession(id: string, studentId?: string, studentName?: string): Promise<any> {
  return apiClientRequest(`/campus/mentorship/slots/${encodeURIComponent(id)}/book`, 'POST', { studentId, studentName });
}

export async function fetchResearchPatents(...args: any[]): Promise<any> {
  return apiClientRequest('/campus/research-patents');
}

export async function registerResearchPatent(payload: any): Promise<any> {
  return apiClientRequest('/campus/research-patents', 'POST', payload);
}

export async function executePatentLicensingAgreement(id: string, payload?: any): Promise<any> {
  return apiClientRequest(`/campus/research-patents/${encodeURIComponent(id)}/license`, 'POST', payload);
}


export async function fetchMentalWellnessCheckIns(...args: any[]): Promise<any> {
  return apiClientRequest('/campus/mental-wellness/check-ins');
}

export async function createMentalWellnessCheckIn(payload: any): Promise<any> {
  return apiClientRequest('/campus/mental-wellness/check-ins', 'POST', payload);
}

export async function assignCounselorCheckIn(id: string, payload?: any): Promise<any> {
  return apiClientRequest(`/campus/mental-wellness/check-ins/${encodeURIComponent(id)}/assign-counselor`, 'POST', payload);
}

// ─── Activity Feed & Digest Preferences ────────────────────────────────────────

export async function fetchActivityFeed(page: number = 1, limit: number = 20, type?: string, startDate?: number, endDate?: number) {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (type) params.append('type', type);
    if (startDate) params.append('startDate', startDate.toString());
    if (endDate) params.append('endDate', endDate.toString());

    const response = await fetchWithRetry(`${API_BASE_URL}/activity/feed?${params.toString()}`, {
      method: "GET"
    });
    if (!response.ok) throw new Error("API_ERROR");
    return await response.json();
  } catch (error) {
    console.warn("fetchActivityFeed failed", error);
    return { items: [], total: 0 };
  }
}

export async function fetchActivityStats() {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/activity/stats`, {
      method: "GET"
    });
    if (!response.ok) throw new Error("API_ERROR");
    return await response.json();
  } catch (error) {
    console.warn("fetchActivityStats failed", error);
    return { data: { totalActions: 0, weeklyKarma: 0, streak: 0 } };
  }
}

export async function getDigestPreferences() {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/activity/digest-preferences`, {
      method: "GET"
    });
    if (!response.ok) throw new Error("API_ERROR");
    return await response.json();
  } catch (error) {
    console.warn("getDigestPreferences failed", error);
    return { data: { frequency: "None" } };
  }
}

export async function updateDigestPreferences(frequency: "Daily" | "Weekly" | "None") {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/activity/digest-preferences`, {
      method: "PUT",
      body: JSON.stringify({ frequency })
    });
    if (!response.ok) throw new Error("API_ERROR");
    return await response.json();
  } catch (error) {
    console.warn("updateDigestPreferences failed", error);
    throw error;
  }
}

// ─── Announcements ────────────────────────────────────────────────────────────

export async function fetchAnnouncements(page: number = 1, limit: number = 20, category?: string) {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (category) params.append('category', category);

    const response = await fetchWithRetry(`${API_BASE_URL}/announcements?${params.toString()}`, {
      method: "GET"
    });
    if (!response.ok) throw new Error("API_ERROR");
    return await response.json();
  } catch (error) {
    console.warn("fetchAnnouncements failed", error);
    return { items: [], total: 0 };
  }
}

export async function fetchActiveAnnouncements() {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/announcements/active`, {
      method: "GET"
    });
    if (!response.ok) throw new Error("API_ERROR");
    return await response.json();
  } catch (error) {
    console.warn("fetchActiveAnnouncements failed", error);
    return { data: [] };
  }
}

export async function createAnnouncement(data: any) {
  const response = await fetchWithRetry(`${API_BASE_URL}/announcements`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Failed to create announcement");
  return response.json();
}

export async function updateAnnouncement(id: string, data: any) {
  const response = await fetchWithRetry(`${API_BASE_URL}/announcements/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Failed to update announcement");
  return response.json();
}

export async function deleteAnnouncement(id: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/announcements/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) throw new Error("Failed to delete announcement");
  return response.json();
}

export async function dismissAnnouncement(id: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/announcements/${id}/dismiss`, {
    method: "POST"
  });
  if (!response.ok) throw new Error("Failed to dismiss announcement");
  return response.json();
}

// ─── Opportunity Notes ────────────────────────────────────────────────────────

export async function fetchOpportunityNote(opportunityId: string) {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/opportunity-notes/${opportunityId}`, {
      method: "GET"
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch opportunity note");
    }
    const data = await response.json();
    return data.data?.note || null;
  } catch (error) {
    console.warn("fetchOpportunityNote failed", error);
    return null;
  }
}

export async function upsertOpportunityNote(opportunityId: string, content: string, color: string, isPinned: boolean) {
  const response = await fetchWithRetry(`${API_BASE_URL}/opportunity-notes`, {
    method: "POST",
    body: JSON.stringify({ opportunityId, content, color, isPinned })
  });
  if (!response.ok) throw new Error("Failed to save opportunity note");
  const data = await response.json();
  return data.data?.note;
}

export async function deleteOpportunityNote(opportunityId: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/opportunity-notes/${opportunityId}`, {
    method: "DELETE"
  });
  if (!response.ok) throw new Error("Failed to delete opportunity note");
  return response.json();
}

export async function bulkGetOpportunityNotes(opportunityIds: string[]) {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/opportunity-notes/bulk`, {
      method: "POST",
      body: JSON.stringify({ opportunityIds })
    });
    if (!response.ok) throw new Error("Failed to fetch bulk opportunity notes");
    const data = await response.json();
    return data.data?.notes || [];
  } catch (error) {
    console.warn("bulkGetOpportunityNotes failed", error);
    return [];
  }
}

// ─── Saved Searches ────────────────────────────────────────────────────────────

export async function fetchSavedSearches() {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/saved-searches`, {
      method: "GET"
    });
    if (!response.ok) throw new Error("API_ERROR");
    return await response.json();
  } catch (error) {
    console.warn("fetchSavedSearches failed", error);
    return { data: [], total: 0 };
  }
}

export async function createSavedSearch(data: any) {
  const response = await fetchWithRetry(`${API_BASE_URL}/saved-searches`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Failed to create saved search");
  return response.json();
}

export async function updateSavedSearch(id: string, data: any) {
  const response = await fetchWithRetry(`${API_BASE_URL}/saved-searches/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Failed to update saved search");
  return response.json();
}

export async function deleteSavedSearch(id: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/saved-searches/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) throw new Error("Failed to delete saved search");
  return response.json();
}

export async function previewSavedSearch(filters: any) {
  const response = await fetchWithRetry(`${API_BASE_URL}/saved-searches/preview`, {
    method: "POST",
    body: JSON.stringify({ filters })
  });
  if (!response.ok) throw new Error("Failed to preview saved search");
  return response.json();
}

// ─── Forum Replies ─────────────────────────────────────────────────────────────

export async function getForumReplies(postId: string) {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/community/posts/${postId}/replies`, {
      method: "GET"
    });
    if (!response.ok) throw new Error("API_ERROR");
    return await response.json();
  } catch (error) {
    console.warn("getForumReplies failed", error);
    return { data: [] };
  }
}

export async function createForumReply(postId: string, content: string, parentReplyId?: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/community/posts/${postId}/replies`, {
    method: "POST",
    body: JSON.stringify({ content, parentReplyId })
  });
  if (!response.ok) throw new Error("Failed to create forum reply");
  return response.json();
}

export async function upvoteForumReply(postId: string, replyId: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/community/posts/${postId}/replies/${replyId}/upvote`, {
    method: "POST"
  });
  if (!response.ok) throw new Error("Failed to upvote forum reply");
  return response.json();
}

export async function acceptForumAnswer(postId: string, replyId: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/community/posts/${postId}/replies/${replyId}/accept`, {
    method: "PUT"
  });
  if (!response.ok) throw new Error("Failed to accept forum answer");
  return response.json();
}

// ─── Event RSVPs ─────────────────────────────────────────────────────────────

export async function registerForEvent(eventId: string, notes?: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/event-rsvps/${eventId}`, {
    method: "POST",
    body: JSON.stringify({ notes })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to register for event");
  }
  return response.json();
}

export async function cancelEventRegistration(eventId: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/event-rsvps/${eventId}`, {
    method: "DELETE"
  });
  if (!response.ok) throw new Error("Failed to cancel RSVP");
  return response.json();
}

export async function fetchUserRsvps() {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/event-rsvps`, {
      method: "GET"
    });
    if (!response.ok) throw new Error("API_ERROR");
    return await response.json();
  } catch (error) {
    console.warn("fetchUserRsvps failed", error);
    return { data: [] };
  }
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

export async function fetchPublicTestimonials(targetUid?: string) {
  const url = targetUid ? `${API_BASE_URL}/testimonials/public?targetUid=${targetUid}` : `${API_BASE_URL}/testimonials/public`;
  const response = await fetchWithRetry(url, {
    method: "GET"
  });
  if (!response.ok) {
    throw new Error("Failed to fetch testimonials");
  }
  return response.json();
}

export async function createTestimonial(data: any) {
  const response = await fetchWithRetry(`${API_BASE_URL}/testimonials`, {
    method: "POST",
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error("Failed to create testimonial");
  }
  return response.json();
}

export async function fetchTestimonialInbox() {
  const response = await fetchWithRetry(`${API_BASE_URL}/testimonials/inbox`, {
    method: "GET"
  });
  if (!response.ok) throw new Error("Failed to fetch testimonial inbox");
  return response.json();
}

export async function updateTestimonialStatus(id: string, status: string) {
  const response = await fetchWithRetry(`${API_BASE_URL}/testimonials/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error("Failed to update testimonial status");
  return response.json();
}

export async function highlightTestimonial(id: string, isHighlighted: boolean) {
  const response = await fetchWithRetry(`${API_BASE_URL}/testimonials/${id}/highlight`, {
    method: "PATCH",
    body: JSON.stringify({ isHighlighted })
  });
  if (!response.ok) throw new Error("Failed to highlight testimonial");
  return response.json();
}
