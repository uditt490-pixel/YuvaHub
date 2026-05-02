/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, Component, ReactNode, ErrorInfo } from 'react';
import { 
  Search, MapPin, Bell, BellRing, ExternalLink, Filter, Info, 
  Briefcase, GraduationCap, X, Check, User, Sparkles, 
  BellOff, Settings, ChevronRight, Sliders, Globe, 
  Calendar, ArrowRight, LayoutGrid, List, AlertTriangle, RefreshCw,
  Bookmark, BookmarkCheck, Trash2, Wifi, WifiOff, Clock, Mail, ChevronDown,
  Zap, Copy, Loader2, Users, MessageSquare, Send, Trophy, Star, FileText, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchEventsAndSchemes, getSearchSuggestions, getRelatedDomains, getAssistantResponse, generateDraft, getSmartRefinements } from './services/geminiService';
import { Event, UserLocation, UserProfile, Notification, UserRegistration, Message, RelatedDomains, ChatMessage, ApplicationStatus } from './types';
import { cn } from './lib/utils';
import { 
  auth, 
  signInWithGoogle, 
  signInWithApple, 
  logout, 
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

const INTEREST_OPTIONS = [
  "Technology", "Education", "Healthcare", "Agriculture", "Finance", 
  "Environment", "Social Welfare", "Startup", "Women Empowerment", "Skill Development"
];

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('cached_events');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastFetch, setLastFetch] = useState<number>(() => {
    const saved = localStorage.getItem('last_fetch_time');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'hackathon' | 'scheme' | 'program'>('all');
  const [selectedOrganizer, setSelectedOrganizer] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedEligibility, setSelectedEligibility] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [fetchingSubscribers, setFetchingSubscribers] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [showConfirmReg, setShowConfirmReg] = useState<Event | null>(null);
  const [showSuccessReg, setShowSuccessReg] = useState<UserRegistration | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<UserRegistration[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [relatedDomains, setRelatedDomains] = useState<RelatedDomains | null>(null);
  const [isFetchingDeepDive, setIsFetchingDeepDive] = useState(false);
  const [smartRefinements, setSmartRefinements] = useState<string[]>([]);
  const [isSmartRankEnabled, setIsSmartRankEnabled] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('user_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const isAdmin = user?.email === 'uditt490@gmail.com';
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<'discover' | 'recommendations' | 'tracker' | 'community' | 'profile'>('discover');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [draftContent, setDraftContent] = useState<string | null>(null);
  const [assistantInput, setAssistantInput] = useState('');

  const [showSettings, setShowSettings] = useState(!profile);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'applications'>('profile');
  const DEFAULT_PROFILE: UserProfile = {
    name: '',
    email: '',
    phone: '',
    address: '',
    dob: '',
    college: '',
    skills: [],
    location: '',
    age: '',
    interests: [],
    notificationsEnabled: false
  };

  const [tempProfile, setTempProfile] = useState<UserProfile>(() => {
    if (profile) return { ...DEFAULT_PROFILE, ...profile };
    return DEFAULT_PROFILE;
  });

  const [regPermission, setRegPermission] = useState(false);
  const [showApplyAssist, setShowApplyAssist] = useState<Event | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, filterType]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Sync profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserProfile;
            setProfile(data);
            setTempProfile(data);
            localStorage.setItem('user_profile', JSON.stringify(data));
          } else if (firebaseUser.email) {
            // Pre-fill email from auth if no profile exists
            const initialProfile: UserProfile = {
              name: firebaseUser.displayName || '',
              email: firebaseUser.email,
              location: '',
              age: '',
              interests: [],
              notificationsEnabled: false
            };
            setProfile(null);
            setTempProfile(initialProfile);
          }

          // Fetch registrations
          const regsQuery = query(
            collection(db, 'registrations'),
            where('userId', '==', firebaseUser.uid),
            orderBy('registeredAt', 'desc')
          );
          const regsSnapshot = await getDocs(regsQuery);
          const regs = regsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as UserRegistration[];
          setUserRegistrations(regs);
        } catch (err) {
          console.error("Error syncing profile/registrations:", err);
        }
      } else {
        setUserRegistrations([]);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Track notified events
  const [notifiedEventIds, setNotifiedEventIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('notified_event_ids');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    // Check for API key on mount
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Please add it to your environment variables.");
      setApiKeyMissing(true);
    }
    loadInitialData();
    getUserLocation();

    const handleOnline = () => {
      setIsOnline(true);
      addToast("Back Online", "Your internet connection has been restored.", "success");
      // Try to fetch fresh data if we were using fallback
      if (isFallback) {
        loadInitialData(true);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      addToast("Network Lost", "You are currently offline. Using cached data.", "warning");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('form') && !target.closest('.suggestions-dropdown')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profile, isFallback]);

  const addToast = useCallback((title: string, message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => {
      const newToasts = [...prev, { id, title, message, type }];
      // Limit to 3 most recent toasts to avoid blocking the UI
      return newToasts.slice(-3);
    });
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const loadInitialData = async (force: boolean = false) => {
    const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
    const now = Date.now();
    
    // Skip if we have data and it's not expired, unless forced
    if (!force && events.length > 0 && (now - lastFetch < CACHE_DURATION)) {
      const minutesLeft = Math.round((CACHE_DURATION - (now - lastFetch)) / 60000);
      console.log("Using cached data to save API usage. Next update in:", minutesLeft, "minutes");
      return;
    }

    // Only show loading if we have no cached events
    if (events.length === 0) {
      setLoading(true);
    } else {
      setIsUpdating(true);
    }

    try {
      const data = await fetchEventsAndSchemes(searchQuery, profile || undefined);
      if (data && data.length > 0) {
        // Fallback detection
        const isFromFallback = data.some(e => e.id.startsWith('fb-'));
        setIsFallback(isFromFallback);

        // Notifications for new data
        if (profile?.notificationsEnabled && events.length > 0) {
          const currentIds = new Set(events.map(e => e.id));
          const newEvents = data.filter(e => !currentIds.has(e.id));
          if (newEvents.length > 0) {
            addNotification("Update Found!", `We've synced ${newEvents.length} fresh opportunities.`, "new_event");
          }
        }

        setEvents(data);
        setLastServerSearch(searchQuery);
        setLastFetch(now);
        localStorage.setItem('cached_events', JSON.stringify(data));
        localStorage.setItem('last_fetch_time', now.toString());
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      if (events.length === 0) {
        addToast("Fetch Error", "Could not load events. Check your API key.", "warning");
      }
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleSaveProfile = async () => {
    if (!tempProfile.location || !tempProfile.age || !tempProfile.name || !tempProfile.phone || !tempProfile.address || !tempProfile.dob || !tempProfile.college || (tempProfile.skills && tempProfile.skills.length === 0) || (tempProfile.interests || []).length === 0) {
      addToast("Missing Info", "Please fill in all identity fields, college, skills, and select at least one interest.", "warning");
      return;
    }

    setProfile(tempProfile);
    localStorage.setItem('user_profile', JSON.stringify(tempProfile));
    setShowSettings(false);

    // Save to Firestore if logged in
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          ...tempProfile,
          uid: user.uid,
          email: user.email,
          updatedAt: serverTimestamp()
        });
        addToast("Sync Complete", "Your full profile is now synced over the cloud.", "success");
      } catch (err) {
        console.error("Error saving profile:", err);
        addToast("Sync Error", "Could not sync profile to cloud.", "warning");
      }
    } else {
      addToast("Profile Saved", "Saved locally. Log in to sync across devices.", "success");
    }
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    // Basic frontend validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      addToast("Invalid Email", "Please enter a valid email address.", "warning");
      return;
    }
    
    setSubscribing(true);
    try {
      const email = newsletterEmail.toLowerCase();
      await setDoc(doc(db, 'newsletter', email), {
        email: email,
        subscribedAt: serverTimestamp()
      });
      
      // Send Email Notification via EmailJS (Free Tier)
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        try {
          await emailjs.send(
            serviceId,
            templateId,
            {
              to_email: email, // Dynamic recipient
              reply_to: 'uditt490@gmail.com',
              subscriber_email: email,
              timestamp: new Date().toLocaleString()
            },
            publicKey
          );
          console.log("Email notification sent successfully via EmailJS");
        } catch (emailErr) {
          console.error("Email notification failed:", emailErr);
        }
      } else {
        console.warn("EmailJS credentials missing. Check your environment variables.", {
          hasServiceId: !!serviceId,
          hasTemplateId: !!templateId,
          hasPublicKey: !!publicKey
        });
      }

      addToast("Subscribed!", "You've been added to our newsletter.", "success");
      setNewsletterEmail('');
    } catch (err) {
      console.error("Newsletter error:", err);
      addToast("Error", "Could not subscribe. Please try again.", "warning");
    } finally {
      setSubscribing(false);
    }
  };

  const fetchSubscribers = async () => {
    if (!isAdmin) return;
    setFetchingSubscribers(true);
    try {
      const q = query(collection(db, 'newsletter'), orderBy('subscribedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => doc.data());
      setSubscribers(list);
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      addToast("Error", "Could not load subscribers.", "warning");
    } finally {
      setFetchingSubscribers(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!isAdmin || subscribers.length === 0 || !broadcastMessage) return;
    if (!window.confirm(`Are you sure you want to send this broadcast to ${subscribers.length} subscribers? This uses your EmailJS daily quota.`)) return;
    
    setSendingBroadcast(true);
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      addToast("Error", "EmailJS credentials missing.", "warning");
      setSendingBroadcast(false);
      return;
    }

    let successCount = 0;
    try {
      // Loop through subscribers and send one by one
      // Note: This is a simple implementation, for large lists a backend is better
      for (const sub of subscribers) {
        try {
          await emailjs.send(
            serviceId,
            templateId,
            {
              to_email: sub.email,
              subscriber_email: sub.email,
              message: broadcastMessage,
              timestamp: new Date().toLocaleString()
            },
            publicKey
          );
          successCount++;
        } catch (err) {
          console.error(`Failed to send email to ${sub.email}:`, err);
        }
      }
      addToast("Broadcast Sent", `Successfully sent to ${successCount} subscribers.`, "success");
      setBroadcastMessage("");
    } catch (err) {
      console.error("Broadcast error:", err);
      addToast("Error", "Some emails failed to send.", "warning");
    } finally {
      setSendingBroadcast(false);
    }
  };

  useEffect(() => {
    if (isAdmin && showAdmin) {
      fetchSubscribers();
    }
  }, [isAdmin, showAdmin]);

  const toggleInterest = (interest: string) => {
    setTempProfile(prev => {
      const currentInterests = prev.interests || [];
      return {
        ...prev,
        interests: currentInterests.includes(interest)
          ? currentInterests.filter(i => i !== interest)
          : [...currentInterests, interest]
      };
    });
  };

  const toggleBookmark = async (eventId: string) => {
    if (!profile) {
      setShowSettings(true);
      addToast("Profile Required", "Please set up your profile to bookmark events.", "info");
      return;
    }

    const isBookmarked = profile.bookmarkedEventIds?.includes(eventId);
    const newBookmarks = isBookmarked
      ? (profile.bookmarkedEventIds || []).filter(id => id !== eventId)
      : [...(profile.bookmarkedEventIds || []), eventId];

    const updatedProfile = { ...profile, bookmarkedEventIds: newBookmarks };
    setProfile(updatedProfile);
    setTempProfile(updatedProfile);
    localStorage.setItem('user_profile', JSON.stringify(updatedProfile));

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          ...updatedProfile,
          uid: user.uid,
          email: user.email,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error("Error syncing bookmark:", err);
      }
    }

    addToast(
      isBookmarked ? "Bookmark Removed" : "Event Bookmarked",
      isBookmarked ? "Removed from your saved list." : "Saved to your bookmarks.",
      "success"
    );
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isProfileComplete = useMemo(() => {
    return profile && 
           profile.name && 
           profile.email && 
           profile.phone && 
           profile.dob && 
           profile.age && 
           profile.college && 
           profile.skills && 
           profile.skills.length > 0 && 
           profile.location;
  }, [profile]);

  const directRegister = async (event: Event) => {
    if (!user) {
      setShowLoginModal(true);
      addToast("Login Required", "Please sign in to use the Apply Assist system.", "info");
      return;
    }

    if (!isProfileComplete) {
      setShowSettings(true);
      addToast("Profile Incomplete", "Please complete your full profile (College, Skills, etc.) to enable Apply Assist.", "warning");
      return;
    }

    if (profile?.registeredEventIds?.includes(event.id)) {
      addToast("Already Applied", "You have already used Apply Assist for this opportunity. Redirecting...", "info");
      window.open(event.applyLink || event.link, '_blank');
      return;
    }

    if (event.isPaid) {
      // Step 3: Paid Opportunity Flow -> Confirmation Modal
      setShowApplyAssist(event);
    } else {
      // Step 2: Free Opportunity Flow -> Redirect with Quick Assist Message
      addToast("Apply Assist Ready", "Your details are prepared. Continuing to official site...", "success");
      confirmDirectRegister(event);
    }
  };

  const confirmDirectRegister = async (eventOverride?: Event) => {
    const event = eventOverride || showApplyAssist;
    if (!event || !user || !profile) return;
    
    setShowApplyAssist(null);
    setRegisteringId(event.id);

    try {
      // Create Assist Log (Backend)
      const regDoc = await addDoc(collection(db, 'registrations'), {
        userId: user.uid,
        userEmail: user.email,
        userName: profile.name || user.displayName,
        userPhone: profile.phone || '',
        userDob: profile.dob || '',
        userCollege: profile.college || '',
        userSkills: profile.skills || [],
        userLocation: profile.location,
        userAge: profile.age,
        eventId: event.id,
        eventTitle: event.title,
        registeredAt: serverTimestamp(),
        type: 'apply_assist'
      });

      // Update Local Assist State
      const newReg: UserRegistration = {
        id: regDoc.id,
        userId: user.uid,
        userEmail: user.email,
        userName: profile.name || user.displayName || undefined,
        userPhone: profile.phone,
        userDob: profile.dob,
        userCollege: profile.college,
        userSkills: profile.skills,
        userLocation: profile.location,
        userAge: profile.age,
        eventId: event.id,
        eventTitle: event.title,
        registeredAt: { toDate: () => new Date() },
        status: 'Applied'
      };
      
      const newRegistrations = [...(profile.registeredEventIds || []), event.id];
      const updatedProfile = { ...profile, registeredEventIds: newRegistrations };
      
      setProfile(updatedProfile);
      setTempProfile(updatedProfile);
      localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
      setUserRegistrations(prev => [newReg, ...prev]);

      await setDoc(doc(db, 'users', user.uid), {
        ...updatedProfile,
        uid: user.uid,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Redirect to official link after a short delay
      setTimeout(() => {
        window.open(event.applyLink || event.link, '_blank');
      }, 500);

    } catch (err) {
      console.error("Apply assist error:", err);
      addToast("Assist Failed", "Redirecting you anyway...", "warning");
      window.open(event.applyLink || event.link, '_blank');
    } finally {
      setRegisteringId(null);
    }
  };

  const addNotification = useCallback((title: string, message: string, type: Notification['type'], link?: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      timestamp: Date.now(),
      read: false,
      type,
      link
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50);
      localStorage.setItem('user_notifications', JSON.stringify(updated));
      return updated;
    });
    
    if (profile?.notificationsEnabled || type === 'system' || !profile) {
      addToast(title, message, "info");
    }
  }, [profile, addToast]);

  const markNotificationAsRead = (id: string) => {
    const updatedNotifs = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updatedNotifs);
    localStorage.setItem('user_notifications', JSON.stringify(updatedNotifs));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('user_notifications');
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (userLocation && events.length > 0) {
      const nearby = events.filter(event => {
        if (event.coordinates) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            event.coordinates.lat,
            event.coordinates.lng
          );
          return distance < 50;
        }
        return false;
      });
      setNearbyEvents(nearby);

      if (profile?.notificationsEnabled || !profile) {
        const newNearbyEvents = nearby.filter(event => !notifiedEventIds.has(event.id));
        if (newNearbyEvents.length > 0) {
          if (newNearbyEvents.length > 2) {
            addNotification(
              "Nearby Opportunities!",
              `We found ${newNearbyEvents.length} new events happening near you. View them in your local feed.`,
              "new_event"
            );
          } else {
            (newNearbyEvents || []).forEach(event => {
              addNotification(
                "Nearby Opportunity!",
                `${event.title} is happening near you.`,
                "new_event",
                event.link
              );
            });
          }
          
          const updatedIds = new Set([...notifiedEventIds, ...newNearbyEvents.map(e => e.id)]);
          setNotifiedEventIds(updatedIds);
          localStorage.setItem('notified_event_ids', JSON.stringify(Array.from(updatedIds)));
        }
      }
    }
  }, [userLocation, events, profile?.notificationsEnabled, notifiedEventIds, addNotification]);

  const organizers = useMemo(() => ['all', ...Array.from(new Set(events.map(e => e.organization)))], [events]);
  const industries = useMemo(() => ['all', ...Array.from(new Set(events.map(e => e.industry).filter(Boolean) as string[]))], [events]);
  const eligibilities = useMemo(() => ['all', ...Array.from(new Set(events.map(e => e.eligibility).filter(Boolean) as string[]))], [events]);

  const [lastServerSearch, setLastServerSearch] = useState('');

  const filteredEvents = useMemo(() => {
    const list = events.filter(event => {
      // If this list of events was JUST fetched for this search query (or similar),
      // don't apply the strict local string filter, because AI results 
      // might not contain the exact keyword but are relevant (semantic search).
      const currentQuery = searchQuery.trim().toLowerCase();
      const lastQuery = lastServerSearch.trim().toLowerCase();
      
      const isAIPerfectMatch = currentQuery !== '' && 
                             (currentQuery === lastQuery || 
                              (lastQuery !== '' && currentQuery.startsWith(lastQuery)));
      
      const title = event.title?.toLowerCase() || "";
      const org = event.organization?.toLowerCase() || "";
      const desc = event.description?.toLowerCase() || "";
      const ind = event.industry?.toLowerCase() || "";
      const elig = event.eligibility?.toLowerCase() || "";
      const queryStr = currentQuery;

      const matchesSearch = isAIPerfectMatch || 
                          title.includes(queryStr) ||
                          org.includes(queryStr) ||
                          desc.includes(queryStr) ||
                          ind.includes(queryStr) ||
                          elig.includes(queryStr);

      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesOrganizer = selectedOrganizer === 'all' || event.organization === selectedOrganizer;
      const matchesIndustry = selectedIndustry === 'all' || event.industry === selectedIndustry;
      const matchesEligibility = selectedEligibility === 'all' || event.eligibility === selectedEligibility;
      
      return matchesSearch && matchesType && matchesOrganizer && matchesIndustry && matchesEligibility;
    });

    if (isSmartRankEnabled && profile) {
      return [...list].sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        
        const textA = (a.title + " " + a.description + " " + a.industry).toLowerCase();
        const textB = (b.title + " " + b.description + " " + b.industry).toLowerCase();

        (profile.interests || []).forEach(i => {
          if (textA.includes(i.toLowerCase())) scoreA += 2;
          if (textB.includes(i.toLowerCase())) scoreB += 2;
        });
        (profile.skills || []).forEach(s => {
          if (textA.includes(s.toLowerCase())) scoreA += 3;
          if (textB.includes(s.toLowerCase())) scoreB += 3;
        });
        (profile.preferredDomains || []).forEach(d => {
          if (textA.includes(d.toLowerCase())) scoreA += 4;
          if (textB.includes(d.toLowerCase())) scoreB += 4;
        });

        return scoreB - scoreA;
      });
    }

    return list;
  }, [events, searchQuery, filterType, selectedOrganizer, selectedIndustry, selectedEligibility, lastServerSearch, isSmartRankEnabled, profile]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2 && !isUpdating && !loading) {
        setIsFetchingSuggestions(true);
        const results = await getSearchSuggestions(searchQuery);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setIsFetchingSuggestions(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAssistantChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = assistantInput.trim();
    if (!input) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setAssistantInput('');
    setAssistantLoading(true);

    const response = await getAssistantResponse(input, profile, events);
    const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: Date.now() };
    setChatMessages(prev => [...prev, assistantMsg]);
    setAssistantLoading(false);
  };

  const getRecommendedEvents = useMemo(() => {
    if (!profile) return events.slice(0, 4);
    
    // Simple relevance scoring
    return [...events].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Interest matching
      (profile?.interests || []).forEach(interest => {
        if (a.description.toLowerCase().includes(interest.toLowerCase())) scoreA += 2;
        if (b.description.toLowerCase().includes(interest.toLowerCase())) scoreB += 2;
      });

      // Domain matching
      (profile?.preferredDomains || []).forEach(domain => {
        if (a.title.toLowerCase().includes(domain.toLowerCase())) scoreA += 3;
        if (b.title.toLowerCase().includes(domain.toLowerCase())) scoreB += 3;
      });

      // Skill matching
      (profile?.skills || []).forEach(skill => {
        if (a.description.toLowerCase().includes(skill.toLowerCase())) scoreA += 4;
        if (b.description.toLowerCase().includes(skill.toLowerCase())) scoreB += 4;
      });

      // Budget matching
      if (profile.budgetPreference === 'free') {
        if (!a.isPaid) scoreA += 5;
        if (!b.isPaid) scoreB += 5;
      }

      return scoreB - scoreA;
    }).slice(0, 10);
  }, [events, profile]);

  const updateApplicationStatus = async (regId: string, status: ApplicationStatus) => {
    try {
      const regRef = doc(db, 'registrations', regId);
      await setDoc(regRef, { status }, { merge: true });
      setUserRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status } : r));
      addToast("Status Updated", `Marked as ${status}`, "success");
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const handleSearch = async (e?: React.FormEvent | string) => {
    if (e && typeof e !== 'string') e.preventDefault();
    const query = (typeof e === 'string' ? e : searchQuery).trim();
    if (!query) return;

    setSearchQuery(query); // Ensure state matches the query being searched
    setLoading(true);
    setShowSuggestions(false);
    
    // Reset advanced filters on new search to ensure results are visible
    setFilterType('all');
    setSelectedOrganizer('all');
    setSelectedIndustry('all');
    setSelectedEligibility('all');
    setVisibleCount(6);

    try {
      const results = await fetchEventsAndSchemes(query, profile || undefined);
      
      // Fallback detection in search
      const isFromFallback = results.some(e => e.id.startsWith('fb-'));
      setIsFallback(isFromFallback);
      
      if (results.length > 0 && query) {
        addNotification("Search Results", `AI found ${results.length} results for "${query}"`, "system");
      }
      
      setLastServerSearch(query); // Update this BEFORE setEvents to ensure filter re-runs correctly
      setEvents(results);
      
      // Fetch smart refinements in background
      getSmartRefinements(query, profile).then(refinements => {
        setSmartRefinements(refinements);
      });

      if (results.length === 0) {
        addToast("No Results", "Try broadening your search terms.", "info");
      }
    } catch (err) {
      console.error("Search error:", err);
      addToast("Search Error", "Check your connection and try again.", "warning");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setProfile(null);
      setUserRegistrations([]);
      addToast("Signed Out", "Come back soon!", "info");
    } catch (err) {
      addToast("Error", "Failed to sign out.", "warning");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'recommendations':
        return (
          <div className="p-8">
            <header className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Recommended for You</h2>
              <p className="text-slate-500 font-medium max-w-2xl">Based on your profile, we think you'll excel in these opportunities.</p>
            </header>

            {!profile?.onboardingComplete ? (
              <div className="p-12 text-center bg-indigo-50 rounded-[40px] border border-indigo-100 mb-10">
                <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-900 mb-2">Personalize Your Feed</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto font-medium">Complete a quick 1-minute onboarding quiz to unlock better recommendations.</p>
                <button 
                  onClick={() => setShowOnboarding(true)}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100"
                >
                  Start Onboarding
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {getRecommendedEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'tracker':
        return (
          <div className="p-8">
            <header className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">My Applications</h2>
                <p className="text-slate-500 font-medium">Track your progress and stay on top of deadlines.</p>
              </div>
              <div className="flex gap-2">
                <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-500">
                  {userRegistrations.length} Total
                </div>
              </div>
            </header>

            {userRegistrations.length > 0 ? (
              <div className="space-y-4 max-w-4xl">
                {userRegistrations.map((reg) => {
                  const event = events.find(e => e.id === reg.eventId);
                  return (
                    <div key={reg.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            reg.status === 'Selected' ? "bg-emerald-100 text-emerald-600" :
                            reg.status === 'Rejected' ? "bg-red-100 text-red-600" :
                            "bg-slate-100 text-slate-400"
                          )}>
                            {reg.status === 'Selected' ? <Trophy className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 mb-0.5">{reg.eventTitle}</h4>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                              <span>Applied {reg.registeredAt?.toDate ? new Date(reg.registeredAt.toDate()).toLocaleDateString() : 'Recently'}</span>
                              {event?.date && <span className="text-indigo-500">Due: {event.date}</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {(['Interested', 'Applied', 'Rejected', 'Selected'] as ApplicationStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => updateApplicationStatus(reg.id, status)}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                                reg.status === status 
                                  ? "bg-slate-900 text-white border-slate-900" 
                                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                              )}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Checklist section */}
                      <div className="mt-6 pt-6 border-t border-slate-50">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Application Checklist</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { item: 'Resume/CV', key: 'resume' },
                            { item: 'Pitch Deck', key: 'deck' },
                            { item: 'ID Proof', key: 'id' },
                            { item: 'GitHub/Portfolio', key: 'portfolio' }
                          ].map((check) => (
                            <div key={check.key} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                              <div className="w-4 h-4 rounded-md border-2 border-slate-200 flex items-center justify-center bg-white cursor-pointer hover:border-indigo-400 transition-colors">
                               <Check className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-600">{check.item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-900 mb-1">No applications tracked yet</h3>
                <p className="text-slate-500 text-sm font-medium mb-6">Start applying to opportunities to track them here.</p>
                <button 
                  onClick={() => setActiveTab('discover')}
                  className="bg-white px-6 py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Browse Events
                </button>
              </div>
            )}
          </div>
        );

      case 'community':
        return (
          <div className="p-8">
            <header className="mb-12">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Community Hall</h2>
              <p className="text-slate-500 font-medium">Learn from peers and share your own journey.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" /> Recent Wins
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Aditya S.', win: 'Selected for MLH Fellowship', text: 'YuvaHub helped me find the perfect hackathon to build my portfolio. After 3 months, I finally got selected!', date: '2 days ago' },
                    { name: 'Priya M.', win: 'Winner at Smart India Hackathon', text: 'The personalized feed showed me SIH just 1 week before the deadline. We won first place @ National level!', date: '1 week ago' },
                  ].map((story, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                          {story.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{story.name}</h4>
                          <p className="text-[10px] text-emerald-600 font-black uppercase">{story.win}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic">"{story.text}"</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" /> Join the Discussion
                </h3>
                <div className="p-8 bg-slate-900 rounded-[40px] text-white overflow-hidden relative group">
                  <div className="relative z-10">
                    <h4 className="text-xl font-black mb-2">Connect with 5k+ Students</h4>
                    <p className="text-slate-400 text-sm mb-6 max-w-xs">Get help with applications, find teammates, and stay updated via WhatsApp.</p>
                    <button className="bg-indigo-600 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                      Join WhatsApp Group
                    </button>
                  </div>
                  <Users className="absolute -right-10 -bottom-10 w-48 h-48 text-indigo-500/10 group-hover:rotate-12 transition-transform duration-500" />
                </div>
              </section>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="p-8 max-w-4xl">
            <header className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Account Settings</h2>
              <p className="text-slate-500 font-medium">Manage your personal data and preferences.</p>
            </header>
            
            {/* Reuse existing profile form logic but styled as a full page */}
            <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Full Name</label>
                  <input 
                    type="text" 
                    value={tempProfile.name || ''}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Email</label>
                  <input 
                    type="email" 
                    value={tempProfile.email || ''}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!!user}
                    className={cn(
                      "w-full px-5 py-4 border border-slate-200 rounded-2xl text-sm font-bold transition-all",
                      user ? "bg-slate-100 opacity-70 cursor-not-allowed" : "bg-slate-50 focus:bg-white focus:border-indigo-500"
                    )}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">College</label>
                  <input 
                    type="text" 
                    value={tempProfile.college || ''}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, college: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Contact Number</label>
                  <input 
                    type="text" 
                    value={tempProfile.phone || ''}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Date of Birth</label>
                  <input 
                    type="date" 
                    value={tempProfile.dob || ''}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, dob: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Address</label>
                  <input 
                    type="text" 
                    value={tempProfile.address || ''}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Location (City)</label>
                  <input 
                    type="text" 
                    value={tempProfile.location || ''}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Age</label>
                  <input 
                    type="number" 
                    value={tempProfile.age}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, age: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">My Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Frontend', 'Backend', 'Python', 'Design', 'Management', 'Public Speaking', 'Data Analysis', 'Problem Solving'].map(s => (
                      <button 
                        key={s}
                        onClick={() => {
                          const skills = tempProfile.skills || [];
                          setTempProfile({ ...tempProfile, skills: skills.includes(s) ? skills.filter(x => x !== s) : [...skills, s] });
                        }}
                        className={cn("px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all", tempProfile.skills?.includes(s) ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-400 border-slate-100")}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">Areas of Interest</h4>
                  <div className="flex flex-wrap gap-2">
                    {['AI/ML', 'Blockchain', 'Cybersecurity', 'Sustainable Devel.', 'Govt. Schemes', 'Internships', 'Social Impact'].map(d => (
                      <button 
                        key={d}
                        onClick={() => {
                          const domains = tempProfile.preferredDomains || [];
                          setTempProfile({ ...tempProfile, preferredDomains: domains.includes(d) ? domains.filter(x => x !== d) : [...domains, d] });
                        }}
                        className={cn("px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all", tempProfile.preferredDomains?.includes(d) ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-400 border-slate-100")}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Preferences</h3>
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 mb-0.5">Opportunity Notifications</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Get alerted about new schemes, hackathons, and deadline reminders.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setTempProfile(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }))}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                      tempProfile.notificationsEnabled ? "bg-indigo-600" : "bg-slate-200"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        tempProfile.notificationsEnabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                {user ? (
                  <button 
                    onClick={handleSignOut}
                    className="text-red-500 text-xs font-black uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-xl transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </button>
                )}
                <button 
                  onClick={handleSaveProfile}
                  disabled={isUpdating}
                  className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        );

      default: // Discover
        return (
          <div className="p-6 lg:p-10">
            {/* Existing Hero & Search */}
            <header className="mb-12">
              {apiKeyMissing && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-4 shadow-sm">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-amber-900 mb-0.5 uppercase tracking-tight">AI Offline / Limited Experience</h4>
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                      YuvaHub's smart features require an API key. We're currently showing high-quality fallback opportunities.
                      <span className="block mt-1 font-black opacity-60">Add GEMINI_API_KEY to your settings to enable full AI search and assistance.</span>
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    {lastFetch > 0 ? `Updated ${new Date(lastFetch).toLocaleTimeString()}` : 'Live Opportunities'}
                  </div>
                  <button 
                    onClick={() => loadInitialData(true)}
                    disabled={isUpdating}
                    className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
                    title="Check for New Updates"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isUpdating && "animate-spin")} />
                  </button>
                </div>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter max-w-2xl leading-[1.1] mb-8">
                The next big <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">opportunity</span> is waiting for you.
              </h2>

              <div className="max-w-2xl relative group">
                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Search className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search hackathons, scholarships, domains..."
                    className="w-full pl-16 pr-24 py-6 bg-white border border-slate-200 rounded-[32px] text-lg font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xl shadow-slate-100/50"
                    value={searchQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchQuery(val);
                      if (val === '') {
                        setLastServerSearch('');
                        setSmartRefinements([]);
                      }
                    }}
                    onFocus={() => setShowSuggestions(true)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                     <button 
                       type="submit"
                       className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                     >
                       Go
                     </button>
                  </div>
                </form>
                
                {/* AI Refinements */}
                {smartRefinements.length > 0 && !loading && (
                  <div className="flex flex-wrap gap-2 mt-4 px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-center mr-2">Refine Search:</span>
                    {smartRefinements.map((ref, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(ref);
                          handleSearch(ref);
                          setSmartRefinements([]);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold border border-indigo-100 hover:bg-indigo-100 transition-all"
                      >
                        {ref}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div 
                      className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-100 rounded-3xl shadow-2xl p-4 z-[100] suggestions-dropdown"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <div className="p-2 space-y-1">
                        {suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => { setSearchQuery(s); handleSearch(s); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-2xl text-left text-sm font-bold text-slate-600 transition-colors"
                          >
                            <Clock className="w-4 h-4 text-slate-300 shrink-0" />
                            {s}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </header>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'all', label: 'All Feeds', icon: LayoutGrid },
                { id: 'hackathon', label: 'Hackathons', icon: Sparkles },
                { id: 'scheme', label: 'Scholarships', icon: GraduationCap },
                { id: 'program', label: 'Mentorships', icon: Briefcase },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFilterType(type.id as any)}
                  className={cn(
                    "flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                    filterType === type.id 
                      ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200 scale-105" 
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <type.icon className={cn("w-4 h-4", filterType === type.id ? "text-indigo-400" : "")} />
                  {type.label}
                </button>
              ))}

              <div className="flex-1" />

              {profile && (
                <button
                  onClick={() => setIsSmartRankEnabled(!isSmartRankEnabled)}
                  className={cn(
                    "flex items-center gap-2.5 px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap",
                    isSmartRankEnabled
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100"
                      : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                  )}
                >
                  <Zap className={cn("w-4 h-4", isSmartRankEnabled ? "fill-current" : "")} />
                  Smart Match {isSmartRankEnabled ? 'On' : 'Off'}
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-10 p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Organizer</label>
                <select 
                  value={selectedOrganizer}
                  onChange={(e) => setSelectedOrganizer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                >
                  {organizers.map(o => <option key={o} value={o}>{o === 'all' ? 'All Organizations' : o}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Industry</label>
                <select 
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                >
                  {industries.map(i => <option key={i} value={i}>{i === 'all' ? 'All Industries' : i}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Eligibility</label>
                <select 
                  value={selectedEligibility}
                  onChange={(e) => setSelectedEligibility(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                >
                  {eligibilities.map(el => <option key={el} value={el}>{el === 'all' ? 'All Eligibility' : el}</option>)}
                </select>
              </div>

              <button 
                onClick={() => {
                  setSelectedOrganizer('all');
                  setSelectedIndustry('all');
                  setSelectedEligibility('all');
                  setFilterType('all');
                }}
                className="mt-6 px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Reset
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-[40px] h-[340px] animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredEvents.length === 0 ? (
                    <motion.div 
                      key="no-results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200"
                    >
                      <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-black text-slate-900 mb-1">No matches found</h3>
                      <p className="text-slate-500 text-sm font-medium mb-6 px-4">
                        {isFallback && searchQuery 
                          ? `AI Search is currently limited (API Offline). No matches found for "${searchQuery}" in our local database.`
                          : "Try adjusting your filters or search terms to find more opportunities."}
                      </p>
                      <button 
                        onClick={() => {
                          setSelectedOrganizer('all');
                          setSelectedIndustry('all');
                          setSelectedEligibility('all');
                          setFilterType('all');
                          setSearchQuery('');
                          setLastServerSearch('');
                          loadInitialData(true);
                        }}
                        className="bg-indigo-600 px-6 py-3 rounded-2xl text-xs font-black text-white uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                      >
                        {isFallback ? 'Default Opportunities' : 'Clear All Filters'}
                      </button>
                    </motion.div>
                  ) : (
                    filteredEvents
                      .slice(0, visibleCount)
                      .map((event, idx) => (
                        <motion.div
                          layout
                          key={event.id}
                          id={`event-${event.id}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4, delay: idx * 0.05 }}
                        >
                          <EventCard event={event} />
                        </motion.div>
                      ))
                  )}
                </AnimatePresence>
                
                {filteredEvents.length > visibleCount && (
                   <button 
                    onClick={() => setVisibleCount(prev => prev + 6)}
                    className="col-span-full py-8 mt-4 text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-[0.2em] flex flex-col items-center gap-3 transition-colors group"
                   >
                     <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
                     Load More Opportunities
                   </button>
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => setActiveTab('discover')}>
            <div className="bg-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">YuvaHub</h1>
              <p className="text-[10px] uppercase tracking-widest font-black text-indigo-500 mt-1">Student Platform</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'discover', label: 'Discover', icon: Globe },
              { id: 'recommendations', label: 'For You', icon: Sparkles, badge: 'New' },
              { id: 'tracker', label: 'Tracker', icon: Calendar },
              { id: 'community', label: 'Community', icon: Users },
              { id: 'profile', label: user ? 'My Profile' : 'Login / Profile', icon: User },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group",
                  activeTab === item.id 
                    ? "bg-indigo-50 text-indigo-600" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                  <span className="font-bold text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-indigo-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-slate-900 rounded-3xl p-5 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Weekly Insight</p>
              <h4 className="text-white font-bold text-sm leading-tight mb-3">AI is the most high-growth domain in Bangalore.</h4>
              <button 
                onClick={() => setIsAssistantOpen(true)}
                className="w-full bg-white text-slate-900 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors"
              >
                Ask Assistant
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 bg-indigo-500/20 w-24 h-24 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative scroll-smooth">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-6 bg-white border-b border-slate-100 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 w-8 h-8 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <h1 className="text-lg font-black tracking-tighter text-slate-900">YuvaHub</h1>
          </div>
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm"
          >
            <User className="w-5 h-5 text-slate-600" />
          </button>
        </header>

        {renderContent()}
        
        {/* Navigation Bar - Mobile */}
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-slate-200 py-2 px-3 rounded-[32px] shadow-2xl flex items-center gap-1 z-50 whitespace-nowrap">
          {[
            { id: 'discover', label: 'Home', icon: Globe },
            { id: 'recommendations', label: 'For You', icon: Sparkles },
            { id: 'tracker', label: 'Tracker', icon: Calendar },
            { id: 'profile', label: user ? 'Profile' : 'Sign In', icon: User },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "flex flex-col items-center justify-center px-5 py-2.5 rounded-2xl transition-all duration-300 gap-1",
                activeTab === item.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>

      {/* AI Assistant Sidebar/Modal */}
      <AnimatePresence>
        {isAssistantOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssistantOpen(false)}
              className="fixed inset-0 z-[200] bg-slate-900/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 z-[210] w-full max-w-md bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  <h2 className="font-black text-lg tracking-tight">YuvaHub AI</h2>
                </div>
                <button onClick={() => setIsAssistantOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {chatMessages.length === 0 && (
                  <div className="text-center py-10 opacity-50">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">Ask me anything about student opportunities!</p>
                  </div>
                )}
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-slate-900 text-white ml-auto" 
                      : "bg-white text-slate-700 border border-slate-100"
                  )}>
                    {msg.content}
                  </div>
                ))}
                {assistantLoading && (
                  <div className="bg-white border border-slate-100 p-4 rounded-2xl animate-pulse flex gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
                  </div>
                )}
              </div>

              <form onSubmit={handleAssistantChat} className="p-6 border-t border-slate-100 bg-white">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask about hackathons, internships..."
                    className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && <OnboardingQuiz onComplete={() => setShowOnboarding(false)} />}
      </AnimatePresence>

      <NotificationsPanel />
      <SuccessModal />
      <DraftViewer />
      <ToastContainer />
      <LoginModal />

      {/* Floating Toggle for Mobile AI */}
      <button 
        onClick={() => setIsAssistantOpen(true)}
        className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[200] active:scale-90 transition-transform"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    </div>
  );

  // Sub-components
  function DraftViewer() {
    return (
      <AnimatePresence>
        {draftContent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDraftContent('')} className="fixed inset-0 z-[400] bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[410] w-full max-w-2xl bg-white rounded-[40px] shadow-3xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><FileText className="w-5 h-5" /></div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Generated Draft</h3>
                </div>
                <button onClick={() => setDraftContent('')} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 flex gap-4">
                   <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                   <div>
                     <p className="text-sm font-bold text-amber-900 mb-1">Important Disclaimer</p>
                     <p className="text-xs text-amber-700 leading-relaxed font-medium">This is an AI-generated template. You MUST customize it with your specific achievements, experiences, and tone before submitting. AI content alone may be flagged by reviewers.</p>
                   </div>
                </div>
                <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-medium font-serif bg-slate-50 p-8 rounded-3xl border border-slate-100 italic">
                  {draftContent}
                </div>
              </div>
              <div className="p-8 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(draftContent);
                    addToast("Copied to Clipboard", "You can now paste it into your application.", "success");
                  }}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200"
                >
                  Copy Text
                </button>
                <button onClick={() => setDraftContent('')} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest">Close</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // Sub-components
  function EventCard({ event }: { event: Event }) {
    const isRegistered = profile?.registeredEventIds?.includes(event.id);
    const isBookmarked = profile?.bookmarkedEventIds?.includes(event.id);

    return (
      <div id={`event-${event.id}`} className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group flex flex-col h-full active:scale-[0.98]">
        <div className="p-8 pb-4 flex-1">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                event.type === 'hackathon' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                event.type === 'scheme' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                "bg-amber-50 text-amber-600 border-amber-100"
              )}>
                {event.type}
              </span>
              {!event.isPaid && (
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter">
                  Free
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={async (e) => {
                  e.stopPropagation();
                  setAssistantLoading(true);
                  const draft = await generateDraft('SOP', event.title, event.organization, profile);
                  setDraftContent(draft);
                  setAssistantLoading(false);
                }}
                className="p-2.5 rounded-xl transition-all shadow-sm border bg-slate-50 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                title="Draft SOP with AI"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleBookmark(event.id); }}
                className={cn(
                  "p-2.5 rounded-xl transition-all shadow-sm border",
                  isBookmarked ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:text-indigo-600"
                )}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">{event.organization}</p>
          <h3 className="text-xl font-black text-slate-900 leading-[1.2] mb-3 group-hover:text-indigo-600 transition-colors">
            {event.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 line-clamp-3">
            {event.description}
          </p>

          <div className="space-y-2.5 mb-6">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Ends {event.date}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              <span className="truncate">{event.location}</span>
            </div>
            {event.industry && (
              <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-500/70">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{event.industry}</span>
              </div>
            )}
            {event.eligibility && (
              <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-500/70">
                <Users className="w-3.5 h-3.5" />
                <span>{event.eligibility}</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 pb-8 pt-0 mt-auto">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => directRegister(event)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                isRegistered 
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed" 
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
              )}
              disabled={isRegistered}
            >
              <Zap className={cn("w-4 h-4", isRegistered ? "text-slate-300" : "text-indigo-400 fill-current")} />
              {isRegistered ? 'Registered' : 'Apply Fast'}
            </button>
            <a 
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-indigo-600 hover:border-indigo-100 hover:bg-slate-50 transition-all active:scale-90 shadow-sm"
              title="Official Site"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          
          <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
            <div className="flex gap-0.5 text-amber-400">
               {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
            </div>
            <button 
              onClick={async () => {
                setAssistantLoading(true);
                const draft = await generateDraft('SOP', event.title, event.organization, profile);
                setDraftContent(draft);
                setAssistantLoading(false);
              }}
              className="text-[10px] font-black text-slate-400 uppercase hover:text-indigo-600 transition-colors"
            >
              Draft SOP
            </button>
          </div>
        </div>
      </div>
    );
  }

  function OnboardingQuiz({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<Partial<UserProfile>>({
      currentClass: '',
      fieldOfStudy: '',
      preferredLanguage: 'English',
      budgetPreference: 'any',
      preferredDomains: [],
      skills: []
    });

    const handleNext = () => {
      if (step < 5) setStep(step + 1);
      else {
        const updated = { ...profile, ...data, onboardingComplete: true } as UserProfile;
        setProfile(updated);
        localStorage.setItem('user_profile', JSON.stringify(updated));
        if (user) {
          setDoc(doc(db, 'users', user.uid), updated, { merge: true });
        }
        onComplete();
      }
    };

    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
        <motion.div 
          initial={{ scale: 0.9, y: 30 }} 
          animate={{ scale: 1, y: 0 }} 
          className="bg-white w-full max-w-sm rounded-[40px] p-8 relative shadow-2xl overflow-hidden"
        >
          <div className="h-1.5 w-full bg-slate-100 rounded-full mb-8 overflow-hidden">
             <motion.div animate={{ width: `${(step / 5) * 100}%` }} className="h-full bg-indigo-600" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
              {step === 1 && (
                <div className="space-y-6 text-center">
                  <GraduationCap className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
                  <h3 className="text-xl font-black text-slate-900">What's your current grade?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['12th Standard', 'Undergrad', 'Postgrad', 'PhD'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setData({ ...data, currentClass: c })}
                        className={cn("px-4 py-3 rounded-2xl text-xs font-bold border transition-all", data.currentClass === c ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-600 border-slate-100")}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-6 text-center">
                  <Briefcase className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
                  <h3 className="text-xl font-black text-slate-900">What do you study?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['Engineering', 'Commerce', 'Arts', 'Design', 'Law', 'Medical'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setData({ ...data, fieldOfStudy: f })}
                        className={cn("px-4 py-3 rounded-2xl text-xs font-bold border transition-all", data.fieldOfStudy === f ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-600 border-slate-100")}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-6 text-center">
                  <Globe className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
                  <h3 className="text-xl font-black text-slate-900">Language & Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preferred Language</p>
                      <div className="flex gap-2 justify-center">
                         {['English', 'Hindi', 'Mixed'].map(l => (
                           <button key={l} onClick={() => setData({ ...data, preferredLanguage: l })} className={cn("px-4 py-2 rounded-xl text-[10px] font-bold border", data.preferredLanguage === l ? "bg-slate-900 text-white" : "bg-slate-50")}>{l}</button>
                         ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notifications</p>
                      <button 
                        onClick={() => setData({ ...data, notificationsEnabled: !data.notificationsEnabled })}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
                          data.notificationsEnabled ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-slate-50 border-slate-100 text-slate-500"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Bell className={cn("w-4 h-4", data.notificationsEnabled ? "fill-current" : "")} />
                          <span className="text-xs font-bold">Stay Updated</span>
                        </div>
                        <div className={cn("w-2 h-2 rounded-full", data.notificationsEnabled ? "bg-indigo-600 animate-pulse" : "bg-slate-300")} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {step === 4 && (
                <div className="space-y-6 text-center">
                  <Star className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
                  <h3 className="text-xl font-black text-slate-900">Interests & Domains</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['AI/ML', 'Blockchain', 'Cybersecurity', 'Sustainable Devel.', 'Govt. Schemes', 'Internships', 'Social Impact'].map(d => (
                      <button 
                        key={d}
                        onClick={() => {
                          const domains = data.preferredDomains || [];
                          setData({ ...data, preferredDomains: domains.includes(d) ? domains.filter(x => x !== d) : [...domains, d] });
                        }}
                        className={cn("px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all", data.preferredDomains?.includes(d) ? "bg-indigo-600 text-white" : "bg-slate-50")}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {step === 5 && (
                <div className="space-y-6 text-center">
                  <Zap className="w-12 h-12 text-indigo-600 mx-auto mb-2" />
                  <h3 className="text-xl font-black text-slate-900">Your Expertise (Skills)</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Frontend', 'Backend', 'Python', 'Design', 'Management', 'Public Speaking', 'Data Analysis', 'Problem Solving'].map(s => (
                      <button 
                        key={s}
                        onClick={() => {
                          const skills = data.skills || [];
                          setData({ ...data, skills: skills.includes(s) ? skills.filter(x => x !== s) : [...skills, s] });
                        }}
                        className={cn("px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all", data.skills?.includes(s) ? "bg-indigo-600 text-white" : "bg-slate-50")}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex gap-3">
             <button onClick={() => setStep(s => Math.max(1, s - 1))} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest">Back</button>
             <button onClick={handleNext} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100">
               {step === 5 ? 'Finish' : 'Next'}
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Extract other modals to sub-components for better organization
  function LoginModal() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    if (!showLoginModal) return null;

    const handleEmailAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
          addToast("Welcome Back!", "Successfully signed in.", "success");
        } else {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName: name });
          addToast("Account Created", "Welcome to YuvaHub!", "success");
        }
        setShowLoginModal(false);
      } catch (err: any) {
        console.error("Auth error:", err);
        addToast("Authentication Error", err.message || "Failed to authenticate.", "warning");
      } finally {
        setLoading(false);
      }
    };

    const handleGoogleLogin = async () => {
      setLoading(true);
      try {
        await signInWithGoogle();
        addToast("Welcome!", "Successfully signed in with Google.", "success");
        setShowLoginModal(false);
      } catch (err: any) {
        console.error("Google login error:", err);
        addToast("Login Failed", "Failed to sign in with Google.", "warning");
      } finally {
        setLoading(false);
      }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email) {
        addToast("Email Required", "Please enter your email to reset password.", "warning");
        return;
      }
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        addToast("Reset Sent", "Check your email for password reset instructions.", "success");
        setShowForgotPassword(false);
      } catch (err: any) {
        addToast("Error", err.message || "Failed to send reset email.", "warning");
      } finally {
        setLoading(false);
      }
    };

    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setShowLoginModal(false)} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }} 
            animate={{ scale: 1, y: 0, opacity: 1 }} 
            exit={{ scale: 0.9, y: 20, opacity: 0 }} 
            className="bg-white w-full max-w-md rounded-[40px] shadow-3xl overflow-hidden relative z-10"
          >
            <div className="p-8 sm:p-10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Sparkles className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                      {showForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Join YuvaHub')}
                    </h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                      {showForgotPassword ? 'Enter your email' : 'Empower your future'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {showForgotPassword ? (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    Back to Login
                  </button>
                </form>
              ) : (
                <>
                  <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-4 border border-slate-200 rounded-2xl mb-8 group hover:border-indigo-100 hover:bg-indigo-50 transition-all active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600">Continue with Google</span>
                  </button>

                  <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 font-black text-slate-300 tracking-widest">Or with email</span></div>
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {!isLogin && (
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            required
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold outline-none"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Password</label>
                      <div className="relative">
                        <Loader2 className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400", !loading && "hidden")} />
                        {!loading && <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
                        <input 
                          required
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button 
                        type="button" 
                        onClick={() => setShowForgotPassword(true)}
                        className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                  </form>

                  <p className="mt-8 text-center text-xs font-bold text-slate-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-indigo-600 hover:underline"
                    >
                      {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  function SuccessModal() {
    return (
      <AnimatePresence>
        {showSuccessReg && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSuccessReg(null)} className="fixed inset-0 z-[170] bg-emerald-950/20 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 100 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[180] w-full max-w-sm p-4">
              <div className="bg-white rounded-[40px] p-8 text-center shadow-3xl border border-emerald-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
                <div className="bg-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100 rotate-12">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Application Sent!</h2>
                <p className="text-slate-500 font-medium mb-8">Confirmed for <span className="text-emerald-600 font-bold">{showSuccessReg.eventTitle}</span>.</p>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-8">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Status</p>
                  <p className="font-black text-emerald-600">Applied</p>
                </div>
                <button onClick={() => setShowSuccessReg(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Done</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  function ToastContainer() {
    return (
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:top-auto sm:bottom-6 sm:right-6 z-[200] flex flex-col gap-2 max-w-[calc(100vw-2rem)] sm:max-w-md pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <motion.div 
              key={toast.id} 
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className={cn(
                "pointer-events-auto p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl border bg-white/95 backdrop-blur-md flex items-start gap-3", 
                toast.type === 'success' ? "border-emerald-100" : "border-slate-100"
              )}
            >
              <div className={cn("p-1.5 sm:p-2 rounded-lg shrink-0", toast.type === 'success' ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600")}>
                <Bell className="w-3.5 h-3.5 sm:w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">{toast.title}</h4>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5 sm:w-4 h-4 text-slate-300" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  function NotificationsPanel() {
    return (
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNotifications(false)} className="fixed inset-0 z-[150] bg-slate-900/20 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 bottom-0 z-[160] w-full max-w-md bg-white shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-lg tracking-tight">Alerts Center</h3>
                <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.map(n => (
                  <div key={n.id} onClick={() => {
                      setShowNotifications(false);
                      if (n.eventId) {
                        setActiveTab('discover');
                        setTimeout(() => document.getElementById(`event-${n.eventId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                      }
                    }} 
                    className={cn("p-4 rounded-2xl border transition-all cursor-pointer", n.read ? "bg-white border-slate-100 opacity-60" : "bg-indigo-50 border-indigo-100")}>
                    <h4 className="text-sm font-bold mb-1">{n.title}</h4>
                    <p className="text-xs text-slate-500">{n.message}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
}
