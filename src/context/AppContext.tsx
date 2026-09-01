import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';
import { fetchSystemStats, trackInteraction } from '../services/apiClient';

// ─── Context shape ────────────────────────────────────────────────────────────

interface AppContextType {
  // Authentication
  user: any;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  loading: boolean;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;

  // Opportunity detail routing
  selectedOppId: string | null;
  setSelectedOppId: (id: string | null) => void;
  viewOpportunity: (id: string, title?: string) => void;
  clearSelectedOpportunity: () => void;

  // Bookmarks — dedicated slice to avoid full-profile re-renders on toggle
  bookmarkedIds: string[];
  toggleBookmark: (opportunityId: string) => Promise<void>;
  isBookmarked: (opportunityId: string) => boolean;

  // Explore search query — shared across Topbar and Opportunities
  appSearchQuery: string;
  setAppSearchQuery: (query: string) => void;

  // Backend status
  backendReady: boolean;
  lastSyncedTime: string;

  // UI theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  gettingStartedStep: string | null;
  setGettingStartedStep: (step: string | null) => void;

  // Gamified Bounty System (Karma)
  karmaBalance: number;
  setKarmaBalance: React.Dispatch<React.SetStateAction<number>>;
  refreshKarma: () => Promise<void>;
  karmaBumpFlag: number;
  triggerKarmaAnimation: () => void;
}

// ─── Context creation ─────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'dashboard';
    const path = window.location.pathname;
    if (path === '/') return 'dashboard';
    const tabName = path.substring(1);
    const publicTabs = ['opportunities', 'about', 'privacy', 'terms', 'cookies', 'guidelines', 'security', 'support', 'legal'];
    if (publicTabs.includes(tabName)) return tabName;
    const privateTabs = ['dashboard', 'bookmarks', 'submit', 'mentorship', 'community', 'profile', 'settings', 'admin', 'ai_assistant'];
    if (privateTabs.includes(tabName)) return tabName;
    return 'dashboard';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [selectedOppId, setSelectedOppId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const oppMatch = window.location.pathname.match(/^\/opportunity\/([^/]+)/);
    return oppMatch ? oppMatch[1] : null;
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  
  // Authentication state
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendReady, setBackendReady] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleTimeString());
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const lastConnectedRef = useRef(typeof navigator !== 'undefined' && navigator.onLine ? Date.now() : 0);
  const [theme, setTheme] = useState<'light'>('light');
  
  const [gettingStartedStep, setGettingStartedStep] = useState<string | null>(null);

  // Gamified Bounty System
  const [karmaBalance, setKarmaBalance] = useState(0);
  const [karmaBumpFlag, setKarmaBumpFlag] = useState(0);

  const triggerKarmaAnimation = useCallback(() => {
    setKarmaBumpFlag(prev => prev + 1);
  }, []);

  const refreshKarma = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/v1/karma/balance', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKarmaBalance(prev => {
           if (prev !== data.balance) triggerKarmaAnimation();
           return data.balance;
        });
      }
    } catch(e) {
      console.error('[Karma] Failed to fetch balance', e);
    }
  }, [triggerKarmaAnimation]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('yuvahub-theme', 'light');
  }, []);

  const toggleTheme = useCallback(() => {}, []);

  // ─── Backend health check ─────────────────────────────────────────────────────

  useEffect(() => {
    const abortController = new AbortController();
    let mounted = true;

    const verifyFeedEndpoint = async () => {
      try {
        await fetch("/api/v1/opportunities", { signal: abortController.signal });
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('[Verify Feed] Error:', err);
      }
    };
    verifyFeedEndpoint();

    const checkBackend = async () => {
      if (!mounted) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setBackendReady(false);
        return;
      }
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      const stats = await fetchSystemStats();
      if (!mounted) return;
      if (stats) {
        lastConnectedRef.current = Date.now();
        setBackendReady(true);
        setLastSyncedTime(new Date().toLocaleTimeString());
      } else {
        const timeSinceLastConnect = Date.now() - lastConnectedRef.current;
        if (timeSinceLastConnect >= 2000) {
          setBackendReady(false);
        }
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 60000);

    const handleBackendStatus = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newStatus = customEvent.detail.online;
      const timestamp = customEvent.detail.timestamp || Date.now();

      if (newStatus) {
        lastConnectedRef.current = timestamp;
        setBackendReady(true);
        setLastSyncedTime(new Date().toLocaleTimeString());
      } else {
        const timeSinceLastConnect = Date.now() - lastConnectedRef.current;
        if (timeSinceLastConnect >= 2000) {
          setBackendReady(false);
        }
      }
    };

    window.addEventListener('backend-status', handleBackendStatus);

    const handleOnline = () => {
      void checkBackend();
    };

    const handleOffline = () => {
      setBackendReady(false);
    };

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        void checkBackend();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      mounted = false;
      abortController.abort();
      clearInterval(interval);
      window.removeEventListener('backend-status', handleBackendStatus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []);

  // ─── Opportunity URL routing ──────────────────────────────────────────────────

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const oppMatch = path.match(/^\/opportunity\/([^/]+)/);
      if (oppMatch) {
         setSelectedOppId(oppMatch[1]);
      } else {
         setSelectedOppId(null);
         if (path === '/') {
           setActiveTab('dashboard');
         } else {
           const tabName = path.substring(1);
           const allTabs = ['opportunities', 'about', 'privacy', 'terms', 'cookies', 'guidelines', 'security', 'support', 'legal', 'dashboard', 'bookmarks', 'submit', 'mentorship', 'mentorship_advisory', 'community', 'profile', 'settings', 'admin', 'ai_assistant'];
           if (allTabs.includes(tabName)) {
             setActiveTab(tabName);
           }
         }
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const viewOpportunity = useCallback((id: string, title?: string) => {
    const cleanTitle = title
      ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : 'view';
    window.history.pushState(null, '', `/opportunity/${id}/${cleanTitle}`);
    setSelectedOppId(id);
  }, []);

  const clearSelectedOpportunity = useCallback(() => {
    window.history.pushState(null, '', '/');
    setSelectedOppId(null);
  }, []);

  // ─── Auth + profile sync ──────────────────────────────────────────────────────

  useEffect(() => {
    if (selectedOppId) return; // handled by viewOpportunity
    if (typeof window === 'undefined') return;
    const currentPath = window.location.pathname;
    const expectedPath = activeTab === 'dashboard' ? '/' : `/${activeTab}`;
    if (currentPath !== expectedPath) {
      window.history.pushState(null, '', expectedPath);
    }
  }, [activeTab, selectedOppId]);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!mounted) return;
      setUser(currentUser);

      if (currentUser) {
        try {
          // Timeout protection so app never hangs on loading screen if backend/Firebase is slow/offline
          const tokenPromise = currentUser.getIdToken();
          const tokenTimeout = new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error('getIdToken timeout')), 2500)
          );
          const token = await Promise.race([tokenPromise, tokenTimeout]);

          const syncController = new AbortController();
          const fetchTimeout = setTimeout(() => syncController.abort(), 3000);

          const response = await fetch('/api/v1/auth/sync', {
            signal: syncController.signal,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          clearTimeout(fetchTimeout);

          if (!mounted) return;
          if (response.ok) {
            const data = await response.json();
            if (data.profile) {
              const localOnboarded = typeof localStorage !== 'undefined' && (
                (currentUser?.uid && localStorage.getItem(`yuvahub-onboarded-${currentUser.uid}`) === 'true') ||
                (currentUser?.email && localStorage.getItem(`yuvahub-onboarded-${currentUser.email}`) === 'true') ||
                localStorage.getItem('yuvahub-user-onboarded') === 'true'
              );

              const mergedProfile: UserProfile = {
                ...data.profile,
                onboarded: Boolean(
                  data.profile.onboarded || 
                  data.profile.college || 
                  data.profile.field || 
                  localOnboarded
                )
              };

              setProfile(mergedProfile);
              setBookmarkedIds(data.profile.bookmarks ?? []);
              refreshKarma();
            } else {
              throw new Error('No profile returned from sync endpoint');
            }
          } else {
            throw new Error('Backend sync failed with status ' + response.status);
          }
        } catch (error) {
          if (!mounted) return;
          console.warn('Auth sync falling back to local user profile:', error);
          const localOnboarded = typeof localStorage !== 'undefined' && (
            (currentUser?.uid && localStorage.getItem(`yuvahub-onboarded-${currentUser.uid}`) === 'true') ||
            (currentUser?.email && localStorage.getItem(`yuvahub-onboarded-${currentUser.email}`) === 'true') ||
            localStorage.getItem('yuvahub-user-onboarded') === 'true'
          );
          setProfile({
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
            email: currentUser.email || '',
            avatarUrl: currentUser.photoURL || '',
            onboarded: localOnboarded || true,
          });
          setBookmarkedIds([]);
        }
      } else {
        setProfile(null);
        setBookmarkedIds([]);
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    // Hard fallback timeout: ensure loading spinner disappears after at most 4s regardless of Firebase auth state
    const hardLoadingTimeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 4000);

    return () => {
      mounted = false;
      clearTimeout(hardLoadingTimeout);
      unsubscribe();
    };
  }, [refreshKarma]);

  // ─── Bookmark actions ─────────────────────────────────────────────────────────

  /**
   * Toggles a bookmark for the given opportunity ID.
   * Updates Firestore and local state optimistically so the Bookmarks tab,
   * Opportunities feed, and any OpportunityCard all reflect the change instantly
   * without passing props or re-rendering unrelated components.
   */
  const toggleBookmark = useCallback(async (opportunityId: string) => {
    if (!profile?.uid) return;

    const alreadyBookmarked = bookmarkedIds.includes(opportunityId);

    // Optimistic update — UI reflects immediately
    setBookmarkedIds(prev =>
      alreadyBookmarked
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    );

    // Keep profile.bookmarks in sync so dependent code (e.g. Bookmarks tab) still works
    setProfile(prev =>
      prev
        ? {
            ...prev,
            bookmarks: alreadyBookmarked
              ? (prev.bookmarks ?? []).filter(id => id !== opportunityId)
              : [...(prev.bookmarks ?? []), opportunityId],
          }
        : prev
    );

    try {
      // 1. Update Firebase (Firestore)
      const userRef = doc(db, 'users', profile.uid);
      if (alreadyBookmarked) {
        await updateDoc(userRef, { bookmarks: arrayRemove(opportunityId) });
      } else {
        await updateDoc(userRef, { bookmarks: arrayUnion(opportunityId) });
      }

      // 2. Update MongoDB Backend
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        const method = alreadyBookmarked ? 'DELETE' : 'POST';
        const url = alreadyBookmarked 
          ? `/api/v1/bookmarks/${opportunityId}`
          : '/api/v1/bookmarks';
        const body = alreadyBookmarked ? undefined : JSON.stringify({ opportunityId });
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body
        });
        
        if (!response.ok) {
          throw new Error(`Backend bookmark failed with status ${response.status}`);
        }
      }

      trackInteraction(opportunityId, alreadyBookmarked ? 'view' : 'save');
    } catch (err) {
      console.error('Bookmark toggle failed, rolling back:', err);
      // Roll back on Firestore failure
      setBookmarkedIds(prev =>
        alreadyBookmarked
          ? [...prev, opportunityId]
          : prev.filter(id => id !== opportunityId)
      );
      setProfile(prev =>
        prev
          ? {
              ...prev,
              bookmarks: alreadyBookmarked
                ? [...(prev.bookmarks ?? []), opportunityId]
                : (prev.bookmarks ?? []).filter(id => id !== opportunityId),
            }
          : prev
      );
    }
  }, [profile, bookmarkedIds]);

  /** Convenience selector — avoids creating new arrays in render paths */
  const isBookmarked = useCallback(
    (opportunityId: string) => bookmarkedIds.includes(opportunityId),
    [bookmarkedIds]
  );

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => (prev ? { ...prev, ...updates } : (updates as UserProfile)));
  }, []);

  // ─── Context value ────────────────────────────────────────────────────────────

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      isMobileMenuOpen,
      setIsMobileMenuOpen,
      user,
      profile,
      setProfile,
      updateProfile,
      loading,
      backendReady,
      lastSyncedTime,
      appSearchQuery,
      setAppSearchQuery,
      selectedOppId,
      setSelectedOppId,
      viewOpportunity,
      clearSelectedOpportunity,
      bookmarkedIds,
      toggleBookmark,
      isBookmarked,
      theme,
      toggleTheme,
      gettingStartedStep,
      setGettingStartedStep,
      karmaBalance,
      setKarmaBalance,
      refreshKarma,
      karmaBumpFlag,
      triggerKarmaAnimation
    }}>
      {children}
    </AppContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
