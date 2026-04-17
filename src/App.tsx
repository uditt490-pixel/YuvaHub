/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, Component, ReactNode, ErrorInfo } from 'react';
import { 
  Search, MapPin, Bell, ExternalLink, Filter, Info, 
  Briefcase, GraduationCap, X, Check, User, Sparkles, 
  BellOff, Settings, ChevronRight, Sliders, Globe, 
  Calendar, ArrowRight, LayoutGrid, List, AlertTriangle, RefreshCw,
  Bookmark, BookmarkCheck, Trash2, Wifi, WifiOff, Clock, Mail, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchEventsAndSchemes, getSearchSuggestions, getTopicDeepDive } from './services/geminiService';
import { Event, UserLocation, UserProfile, Notification, UserRegistration, Message, TopicDeepDive } from './types';
import { cn } from './lib/utils';
import { auth, signInWithGoogle, signInWithApple, logout, db } from './lib/firebase';
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
  const [topicDeepDive, setTopicDeepDive] = useState<TopicDeepDive | null>(null);
  const [isFetchingDeepDive, setIsFetchingDeepDive] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('user_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  
  const isAdmin = user?.email === 'uditt490@gmail.com';
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [showSettings, setShowSettings] = useState(!profile);
  const [tempProfile, setTempProfile] = useState<UserProfile>(() => profile || {
    location: '',
    age: '',
    interests: [],
    notificationsEnabled: false
  });

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
    setToasts(prev => [...prev, { id, title, message, type }]);
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
        // Check if data is from fallback (ids start with fb-)
        const isFromFallback = data.some(e => e.id.startsWith('fb-'));
        setIsFallback(isFromFallback);

        // Check for new events to notify
        if (profile?.notificationsEnabled && events.length > 0) {
          const currentIds = new Set(events.map(e => e.id));
          const newEvents = data.filter(e => !currentIds.has(e.id));
          
          if (newEvents.length > 0) {
            addNotification(
              "New Opportunities!",
              `We found ${newEvents.length} new events matching your interests.`,
              "new_event"
            );
          }
        }

        setEvents(data);
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
    if (!tempProfile.location || !tempProfile.age || tempProfile.interests.length === 0) {
      addToast("Missing Info", "Please fill in all fields and select at least one interest.", "warning");
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
        addToast("Sync Complete", "Your profile is now synced to the cloud.", "success");
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
    setTempProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
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

  const directRegister = async (event: Event) => {
    if (!user) {
      setShowLoginModal(true);
      addToast("Login Required", "Please sign in to register directly for events.", "info");
      return;
    }

    if (!profile || !profile.location || !profile.age) {
      setShowSettings(true);
      addToast("Profile Incomplete", "Please complete your location and age to enable direct registration.", "warning");
      return;
    }

    if (profile.registeredEventIds?.includes(event.id)) {
      addToast("Already Registered", "You have already registered for this opportunity.", "info");
      return;
    }

    setShowConfirmReg(event);
  };

  const confirmDirectRegister = async () => {
    if (!showConfirmReg || !user || !profile) return;
    
    const event = showConfirmReg;
    setShowConfirmReg(null);
    setRegisteringId(event.id);
    
    try {
      // 1. Create registration record in Firestore
      const regDoc = await addDoc(collection(db, 'registrations'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        userLocation: profile.location,
        userAge: profile.age,
        eventId: event.id,
        eventTitle: event.title,
        registeredAt: serverTimestamp()
      });

      // Update local registrations list
      const newReg: UserRegistration = {
        id: regDoc.id,
        userId: user.uid,
        userEmail: user.email,
        userLocation: profile.location,
        userAge: profile.age,
        eventId: event.id,
        eventTitle: event.title,
        registeredAt: { toDate: () => new Date() } // Local mock timestamp
      };
      setUserRegistrations(prev => [newReg, ...prev]);

      // 2. Update user profile with registered event ID
      const newRegistrations = [...(profile.registeredEventIds || []), event.id];
      const updatedProfile = { ...profile, registeredEventIds: newRegistrations };
      
      setProfile(updatedProfile);
      setTempProfile(updatedProfile);
      localStorage.setItem('user_profile', JSON.stringify(updatedProfile));

      await setDoc(doc(db, 'users', user.uid), {
        ...updatedProfile,
        uid: user.uid,
        email: user.email,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 3. Send Confirmation Email (Async, non-blocking)
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      const applicationId = regDoc.id.substring(0, 8).toUpperCase();
      
      // In-App Message Generation
      const officialMessage: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender: "EventHub Official",
        subject: `Registration Confirmed: ${event.title}`,
        content: `Dear ${user.displayName || 'User'},\n\nWe are pleased to confirm that your application for ${event.title} has been successfully received.\n\nApplication Details:\n- Registration ID: #${applicationId}\n- Opportunity: ${event.title}\n- Organization: ${event.organization}\n- Date: ${new Date().toLocaleDateString()}\n\nWhat happens next?\nThe organizer will review your profile details (Location: ${profile.location}, Age: ${profile.age}) and reach out to you directly at this email address if you are shortlisted.\n\nYou can always view your submission status in your EventHub account under 'My Applications'.\n\nBest regards,\nThe EventHub Team`,
        timestamp: new Date().toISOString(),
        read: false
      };

      // Add to profile state
      const profileWithMail = {
        ...updatedProfile,
        messages: [officialMessage, ...(updatedProfile.messages || [])]
      };
      setProfile(profileWithMail);
      setTempProfile(profileWithMail);

      // Persistence to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        messages: profileWithMail.messages
      }, { merge: true });

      if (serviceId && templateId && publicKey) {
        emailjs.send(
          serviceId,
          templateId,
          {
            to_name: user.displayName || 'User',
            to_email: user.email,
            event_title: event.title,
            application_id: applicationId,
            registration_date: new Date().toLocaleDateString(),
            app_url: import.meta.env.VITE_APP_URL || window.location.origin
          },
          publicKey
        ).then(() => {
          console.log("Confirmation email sent successfully!");
        }).catch((error) => {
          console.error("Failed to send confirmation email:", error);
        });
      }

      setShowSuccessReg(newReg);
      addToast("Registration Successful!", `You have successfully registered for ${event.title}.`, "success");
      addNotification("Registration Confirmed", `You're all set for ${event.title}! Application ID: ${regDoc.id.substring(0, 8)}`, "system");

    } catch (err) {
      console.error("Registration error:", err);
      addToast("Registration Failed", "Something went wrong. Please try again later.", "warning");
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
          newNearbyEvents.forEach(event => {
            addNotification(
              "Nearby Opportunity!",
              `${event.title} is happening near you.`,
              "new_event",
              event.link
            );
          });
          
          const updatedIds = new Set([...notifiedEventIds, ...newNearbyEvents.map(e => e.id)]);
          setNotifiedEventIds(updatedIds);
          localStorage.setItem('notified_event_ids', JSON.stringify(Array.from(updatedIds)));
        }
      }
    }
  }, [userLocation, events, profile?.notificationsEnabled, notifiedEventIds, addNotification]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || event.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [events, searchQuery, filterType]);

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

  const handleSearch = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const query = typeof e === 'string' ? e : searchQuery;
    setShowSuggestions(false);
    setLoading(true);
    setTopicDeepDive(null);
    setIsFetchingDeepDive(true);
    
    try {
      // Parallel fetch for speed
      const [data, deepDive] = await Promise.all([
        fetchEventsAndSchemes(query, profile || undefined),
        getTopicDeepDive(query)
      ]);

      if (data && data.length > 0) {
        setEvents(data);
        const now = Date.now();
        setLastFetch(now);
        localStorage.setItem('cached_events', JSON.stringify(data));
        localStorage.setItem('last_fetch_time', now.toString());
      }
      
      setTopicDeepDive(deepDive);
    } catch (err) {
      console.error("Search error:", err);
      addToast("Search Failed", "Could not fetch results. Please try again.", "warning");
    } finally {
      setLoading(false);
      setIsFetchingDeepDive(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-[calc(100vw-3rem)] sm:max-w-md w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-4 backdrop-blur-md",
                toast.type === 'success' ? "bg-emerald-50/95 border-emerald-100" : 
                toast.type === 'warning' ? "bg-amber-50/95 border-amber-100" : 
                "bg-white/95 border-slate-200"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl",
                toast.type === 'success' ? "bg-emerald-100 text-emerald-600" : 
                toast.type === 'warning' ? "bg-amber-100 text-amber-600" : 
                "bg-indigo-100 text-indigo-600"
              )}>
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setShowNotifications(true)}>
                <h4 className="font-bold text-sm text-slate-900 truncate">{toast.title}</h4>
                <p className="text-xs mt-0.5 text-slate-600 line-clamp-2">{toast.message}</p>
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[160] w-full max-w-md p-4"
            >
              <div className="bg-white rounded-[40px] p-8 sm:p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>

                <div className="text-center mb-10">
                  <div className="bg-indigo-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
                  <p className="text-slate-500 font-medium">Sign in to sync your profile and bookmarks across all your devices.</p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => { signInWithGoogle(); setShowLoginModal(false); }}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm w-full"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                  <button 
                    onClick={() => { signInWithApple(); setShowLoginModal(false); }}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-2xl font-bold hover:bg-slate-900 transition-all active:scale-95 shadow-sm w-full"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05 1.61-3.22 1.61-1.14 0-1.54-.69-2.88-.69-1.36 0-1.81.67-2.88.67-1.11 0-2.11-.64-3.13-1.64C2.88 18.2 1.5 14.99 1.5 12.02c0-3.1 2.02-4.73 3.96-4.73 1.03 0 1.89.4 2.51.4.6 0 1.34-.44 2.56-.44 1.18 0 2.18.54 2.88 1.56-2.52 1.51-2.11 4.8 0 5.75-.64 1.54-1.49 3.08-2.36 3.72zM12.03 7.25c-.02-2.23 1.84-4.04 4.07-4.06.02 2.23-1.84 4.04-4.07 4.06z"/>
                    </svg>
                    <span>Continue with Apple</span>
                  </button>
                </div>

                <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 text-left items-start">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight mb-1">Secure Sign-in</p>
                    <p className="text-[10px] font-medium text-slate-500 leading-normal">
                      On the next screen, you'll see a Google identity address starting with <span className="font-bold text-slate-700">gen-lang-client...</span>. This is our secure technical ID used for AI identity verification. It's safe to continue!
                    </p>
                  </div>
                </div>

                <p className="mt-8 text-center text-xs text-slate-400 font-medium">
                  By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmReg && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmReg(null)}
              className="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[160] w-full max-w-md p-4"
            >
              <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-slate-100 overflow-hidden">
                <div className="text-center mb-8">
                  <div className="bg-amber-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-amber-600" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Confirm Registration</h2>
                  <p className="text-slate-500 font-medium text-sm px-4">
                    You're about to apply for <span className="font-bold text-indigo-600">{showConfirmReg.title}</span>. the following details will be shared with the organizer:
                  </p>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 mb-8 space-y-4 border border-slate-100">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Full Name</span>
                    <span className="text-slate-900 font-black">{user?.displayName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Email Address</span>
                    <span className="text-slate-900 font-black">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Location</span>
                    <span className="text-slate-900 font-black">{profile?.location}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={confirmDirectRegister}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                  >
                    Confirm & Apply Now
                  </button>
                  <button 
                    onClick={() => setShowConfirmReg(null)}
                    className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-all active:scale-95"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessReg && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessReg(null)}
              className="fixed inset-0 z-[170] bg-emerald-950/20 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[180] w-full max-w-sm p-4"
            >
              <div className="bg-white rounded-[40px] p-8 text-center shadow-3xl border border-emerald-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500" />
                
                <div className="bg-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100 rotate-12">
                  <Check className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Application Sent!</h2>
                <p className="text-slate-500 font-medium mb-8">
                  Your registration for <span className="text-emerald-600 font-bold">{showSuccessReg.eventTitle}</span> has been confirmed.
                </p>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-8">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Application ID</p>
                  <code className="text-xl font-black text-emerald-700 leading-none">
                    #{showSuccessReg.id.substring(0, 8).toUpperCase()}
                  </code>
                </div>

                <p className="text-xs text-slate-400 font-medium mb-8">
                  A record of this application has been added to your profile. You can view all your registrations in the Preferences panel.
                </p>

                <button 
                  onClick={() => setShowSuccessReg(null)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Got it! <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications Slide-over */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[110] w-full sm:max-w-md bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 p-2 rounded-xl">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                </div>
                <div className="flex items-center gap-2">
                  {notifications.some(n => !n.read) && (
                    <button 
                      onClick={() => {
                        const updated = notifications.map(n => ({ ...n, read: true }));
                        setNotifications(updated);
                        localStorage.setItem('user_notifications', JSON.stringify(updated));
                      }}
                      className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline px-2"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearNotifications}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.link) window.open(notif.link, '_blank');
                      }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer group",
                        notif.read ? "bg-white border-slate-100 opacity-60" : "bg-indigo-50/50 border-indigo-100 shadow-sm hover:border-indigo-300"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{notif.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-2">{notif.message}</p>
                      {notif.link && (
                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 group-hover:underline">
                          View Details <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BellOff className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No notifications yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bookmarks Slide-over */}
      <AnimatePresence>
        {showBookmarks && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookmarks(false)}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[110] w-full sm:max-w-md bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 p-2 rounded-xl">
                    <Bookmark className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Saved Events</h2>
                </div>
                <button 
                  onClick={() => setShowBookmarks(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {profile?.bookmarkedEventIds && profile.bookmarkedEventIds.length > 0 ? (
                  events.filter(e => profile.bookmarkedEventIds?.includes(e.id)).map((event) => (
                    <div key={event.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 group hover:border-indigo-300 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{event.title}</h4>
                        <button 
                          onClick={() => toggleBookmark(event.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{event.organization}</p>
                      <a 
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
                      >
                        Apply <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bookmark className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">No saved events yet.</p>
                    <button 
                      onClick={() => setShowBookmarks(false)}
                      className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline"
                    >
                      Browse Opportunities
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin Slide-over Panel */}
      <AnimatePresence>
        {showAdmin && isAdmin && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdmin(false)}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[110] w-full sm:max-w-xl bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 p-2 rounded-xl">
                    <LayoutGrid className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Subscribers</h2>
                </div>
                <button 
                  onClick={() => setShowAdmin(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Broadcast Section */}
                <div className="bg-indigo-50/50 p-5 rounded-[24px] border border-indigo-100">
                  <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5" /> Broadcast Newsletter
                  </h4>
                  <textarea 
                    placeholder="Type your newsletter update here..."
                    className="w-full h-32 p-4 bg-white border border-indigo-200 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none mb-3"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                  />
                  <button 
                    onClick={handleSendBroadcast}
                    disabled={sendingBroadcast || !broadcastMessage || subscribers.length === 0}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                  >
                    {sendingBroadcast ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4" /> Send to {subscribers.length} Fans
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 font-bold mt-3 text-center uppercase tracking-wider">
                    Be careful: Each recipient uses 1 EmailJS daily quota.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Subscriber List</h4>
                  {fetchingSubscribers ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                  ) : subscribers.length > 0 ? (
                    <div className="space-y-3">
                      {subscribers.map((sub, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-indigo-300 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-indigo-600 font-black text-xs">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{sub.email}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {sub.subscribedAt?.toDate ? sub.subscribedAt.toDate().toLocaleString() : 'Just now'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-slate-500 font-medium">No subscribers yet.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button 
                  onClick={fetchSubscribers}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh List
                </button>
                <button 
                  onClick={() => {
                    const csv = "Email,Date\n" + subscribers.map(s => `${s.email},${s.subscribedAt?.toDate ? s.subscribedAt.toDate().toISOString() : ''}`).join("\n");
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download', 'subscribers.csv');
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Export CSV
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Slide-over Panel */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => profile && setShowSettings(false)}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[110] w-full sm:max-w-md bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 p-2 rounded-xl">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Preferences</h2>
                </div>
                {profile && (
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <section>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Identity & Location</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Location</label>
                      <div className="relative group">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                          type="text" 
                          placeholder="e.g. Mumbai, Maharashtra"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                          value={tempProfile.location}
                          onChange={(e) => setTempProfile(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Age</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 21"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
                        value={tempProfile.age}
                        onChange={(e) => setTempProfile(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : '' }))}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border",
                          tempProfile.interests.includes(interest)
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                            : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                        )}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notifications</h3>
                    <button 
                      onClick={() => addNotification("Test Notification", "This is a test to verify your notification system is working!", "system")}
                      className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                    >
                      Send Test
                    </button>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-xl transition-colors",
                        tempProfile.notificationsEnabled ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"
                      )}>
                        {tempProfile.notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Nearby Alerts</p>
                        <p className="text-xs text-slate-500">Events within 50km</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTempProfile(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }))}
                      className={cn(
                        "w-11 h-6 rounded-full relative transition-all duration-300",
                        tempProfile.notificationsEnabled ? "bg-indigo-600" : "bg-slate-300"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                        tempProfile.notificationsEnabled ? "left-6" : "left-1"
                      )} />
                    </button>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">My Applications</h3>
                  {userRegistrations.length > 0 ? (
                    <div className="space-y-3">
                      {userRegistrations.map((reg) => (
                        <div key={reg.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all group">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                                {reg.eventTitle}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {reg.registeredAt?.toDate ? new Date(reg.registeredAt.toDate()).toLocaleDateString() : 'Just now'}
                              </p>
                            </div>
                            <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shrink-0 flex items-center gap-1 border border-emerald-100/50">
                              <Check className="w-3 h-3" /> Confirmed
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-500 mb-1">No applications yet</p>
                      <p className="text-[10px] text-slate-400 font-medium">Your Fast Registrations will appear here</p>
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Official Correspondence</h3>
                  {tempProfile.messages && tempProfile.messages.length > 0 ? (
                    <div className="space-y-3">
                      {tempProfile.messages.map((msg) => (
                        <div key={msg.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                          <button 
                            onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}
                            className="w-full p-4 flex items-start text-left hover:bg-slate-50 transition-colors"
                          >
                            <div className="bg-indigo-50 p-2 rounded-xl mr-3">
                              <Mail className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-0.5">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{msg.sender}</span>
                                <span className="text-[10px] text-slate-400 font-bold">{new Date(msg.timestamp).toLocaleDateString()}</span>
                              </div>
                              <h4 className="font-bold text-slate-900 text-sm truncate">{msg.subject}</h4>
                            </div>
                            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform ml-2 shrink-0", selectedMessage?.id === msg.id && "rotate-180")} />
                          </button>
                          
                          <AnimatePresence>
                            {selectedMessage?.id === msg.id && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-slate-50 border-t border-slate-100"
                              >
                                <div className="p-4 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                  {msg.content}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <Mail className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-500 mb-1">In-App Inbox Empty</p>
                      <p className="text-[10px] text-slate-400 font-medium">Important notices will appear here</p>
                    </div>
                  )}
                </section>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <button 
                  onClick={handleSaveProfile}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 uppercase">Opportunity Hub</h1>
                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase -mt-1">Empowering Careers</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {!isOnline ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
                  <WifiOff className="w-4 h-4" />
                  <span className="hidden sm:inline">No Internet</span>
                </div>
              ) : apiKeyMissing || isFallback ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold border border-amber-100">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="hidden sm:inline">Offline Mode (Fallback Data)</span>
                </div>
              ) : null}
              
              {isAuthLoading ? (
                <div className="w-24 h-9 bg-slate-100 animate-pulse rounded-xl" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col items-end mr-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged in as</p>
                    <p className="text-xs font-black text-slate-900 truncate max-w-[120px]">{user.displayName || user.email}</p>
                  </div>
                  <button 
                    onClick={() => logout()}
                    className="p-2.5 hover:bg-red-50 rounded-xl transition-colors text-red-500 active:scale-95 border border-transparent hover:border-red-100"
                    title="Logout"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}

              {isAdmin && (
                <button 
                  onClick={() => setShowAdmin(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-amber-100 rounded-xl text-xs sm:text-sm font-bold text-amber-700 hover:bg-amber-200 transition-all active:scale-95"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden md:inline">Admin</span>
                </button>
              )}

              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 active:scale-95 border border-transparent hover:border-slate-200 relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black text-white">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>

              <button 
                onClick={() => setShowBookmarks(true)}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 active:scale-95 border border-transparent hover:border-slate-200"
                title="Bookmarks"
              >
                <Bookmark className="w-5 h-5" />
              </button>

              {profile && (
                <button 
                  onClick={() => {
                    setTempProfile(profile);
                    setShowSettings(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                >
                  <Sliders className="w-4 h-4" />
                  <span className="hidden md:inline">Preferences</span>
                </button>
              )}
              <button 
                onClick={getUserLocation}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 active:scale-95 border border-transparent hover:border-slate-200"
                title="Refresh Location"
              >
                <MapPin className={cn("w-5 h-5", userLocation ? "text-indigo-600" : "text-slate-400")} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="mb-10 sm:mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Curated for you
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight mb-4 sm:mb-6"
          >
            Your Next Big <span className="text-indigo-600">Break.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Discover corporate hackathons, government schemes, and educational programs tailored to your unique profile.
          </motion.p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Explore Opportunities</h3>
              {isFallback && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold border border-amber-100">
                  <AlertTriangle className="w-3 h-3" />
                  FEATURED
                </span>
              )}
              <button 
                onClick={() => loadInitialData(true)}
                disabled={isUpdating || loading}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full text-[10px] font-bold transition-all disabled:opacity-50"
                title="Refresh from AI"
              >
                <RefreshCw className={cn("w-3 h-3", (isUpdating || loading) && "animate-spin")} />
                REFRESH
              </button>
              {lastFetch > 0 && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
                  Last updated: {new Date(lastFetch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            {isUpdating && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                UPDATING
              </div>
            )}
          </div>
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search hackathons, schemes, programs, or companies..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm text-sm sm:text-base"
                value={searchQuery}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-2">
                      <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 italic">
                        Related searches
                      </p>
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            handleSearch(suggestion);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-indigo-50 rounded-xl transition-colors flex items-center gap-3 group/item border border-transparent hover:border-indigo-100"
                        >
                          <Search className="w-4 h-4 text-slate-400 group-hover/item:text-indigo-500 transition-colors" />
                          <span className="text-sm font-bold text-slate-700 group-hover/item:text-indigo-700">{suggestion}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 ml-auto opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                {(['all', 'hackathon', 'scheme', 'program'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={cn(
                      "px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all",
                      filterType === type 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-slate-100 text-indigo-600" : "text-slate-400")}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-slate-100 text-indigo-600" : "text-slate-400")}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Powered Topic Insights */}
        <AnimatePresence mode="wait">
          {(isFetchingDeepDive || topicDeepDive) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-12"
            >
              <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl shadow-indigo-100/50 overflow-hidden relative">
                {/* Header Gradient */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <div className="p-8 sm:p-12">
                  <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content */}
                    <div className="flex-[3]">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">AI Topic Deep Dive</p>
                          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {isFetchingDeepDive ? (
                              <span className="flex items-center gap-3">
                                Analyzing {searchQuery || 'Topic'}...
                                <RefreshCw className="w-5 h-5 animate-spin text-slate-300" />
                              </span>
                            ) : (
                              topicDeepDive?.topic
                            )}
                          </h2>
                        </div>
                      </div>

                      {isFetchingDeepDive ? (
                        <div className="space-y-4">
                          <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse"></div>
                          <div className="h-4 bg-slate-100 rounded-full w-5/6 animate-pulse"></div>
                          <div className="h-4 bg-slate-100 rounded-full w-4/6 animate-pulse"></div>
                        </div>
                      ) : (
                        <>
                          <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10 border-l-4 border-indigo-500 pl-6 py-2">
                            {topicDeepDive?.summary}
                          </p>

                          <div className="grid sm:grid-cols-2 gap-8 mb-10">
                            <div>
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <List className="w-3.5 h-3.5" /> Trending Opportunities
                              </h4>
                              <div className="space-y-3">
                                {topicDeepDive?.trendingOpportunities.map((opp, idx) => (
                                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
                                    <p className="font-bold text-slate-800 text-sm mb-1">{opp.title}</p>
                                    <p className="text-xs text-slate-500 leading-tight">{opp.desc}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" /> Core Skills to Master
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {topicDeepDive?.keySkills.map((skill, idx) => (
                                  <span key={idx} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-tighter border border-indigo-100 shadow-sm">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                              
                              <div className="mt-8 p-6 bg-slate-900 rounded-[32px] text-white overflow-hidden relative group">
                                <Globe className="absolute -right-6 -bottom-6 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform duration-700" />
                                <h5 className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Market Outlook</h5>
                                <p className="text-sm font-bold leading-relaxed relative z-10">{topicDeepDive?.marketOutlook}</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Sidebar / Tags */}
                    <div className="flex-1 lg:border-l lg:border-slate-100 lg:pl-12">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Related Domains</h4>
                      <div className="space-y-2">
                        {isFetchingDeepDive ? (
                          [1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-slate-50 rounded-xl animate-pulse"></div>)
                        ) : (
                          topicDeepDive?.relatedTags.map((tag, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSearchQuery(tag);
                                handleSearch(tag);
                              }}
                              className="w-full text-left px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all flex items-center justify-between group"
                            >
                              {tag}
                              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))
                        )}
                      </div>
                      
                      <div className="mt-12 p-6 rounded-[32px] border-2 border-dashed border-slate-200 text-center">
                        <Info className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-normal">
                          AI-generated insights based on current ecosystem trends.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nearby Alert */}
        <AnimatePresence>
          {nearbyEvents.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-10"
            >
              <div className="bg-indigo-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="text-xl sm:text-2xl font-black mb-2">Local Opportunities Detected!</h3>
                    <p className="text-indigo-100 font-medium mb-6">
                      We found {nearbyEvents.length} events within 50km of your current location. Don't miss out on what's happening in your backyard.
                    </p>
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setFilterType('all');
                        window.scrollTo({ top: 800, behavior: 'smooth' });
                      }}
                      className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                      View Local Events
                    </button>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Event Content */}
        {apiKeyMissing ? (
          <div className="text-center py-24 bg-white rounded-[40px] border border-red-100 shadow-xl shadow-red-50/50">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">API Key Required</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
              To fetch real opportunities, you need to set your Gemini API Key in your environment variables. 
              If you are using <b>Vercel</b>, add <code className="bg-slate-100 px-1 rounded">GEMINI_API_KEY</code> in your project settings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all"
              >
                Get Free API Key
              </a>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all"
              >
                I've set the key, reload
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-slate-200 animate-pulse">
                <div className="h-4 bg-slate-100 rounded-full w-24 mb-6"></div>
                <div className="h-8 bg-slate-100 rounded-xl w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-50 rounded-full w-1/2 mb-8"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-50 rounded-full w-full"></div>
                  <div className="h-3 bg-slate-50 rounded-full w-full"></div>
                  <div className="h-3 bg-slate-50 rounded-full w-2/3"></div>
                </div>
                <div className="mt-10 h-14 bg-slate-100 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {filteredEvents.slice(0, visibleCount).map((event) => (
              <motion.div
                layout
                key={event.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "group bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 flex flex-col relative overflow-hidden",
                  viewMode === 'list' && "md:flex-row md:items-center md:gap-8"
                )}
              >
                <div className={cn("flex flex-col flex-1", viewMode === 'list' && "md:flex-[2]")}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                      event.type === 'hackathon' ? "bg-amber-100 text-amber-700" : 
                      event.type === 'scheme' ? "bg-emerald-100 text-emerald-700" :
                      "bg-indigo-100 text-indigo-700"
                    )}>
                      {event.type}
                    </span>
                    {event.price && (
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        event.price.toLowerCase() === 'free' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                      )}>
                        {event.price}
                      </span>
                    )}
                    {event.coordinates && userLocation && calculateDistance(userLocation.lat, userLocation.lng, event.coordinates.lat, event.coordinates.lng) < 50 && (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                        <MapPin className="w-3 h-3" /> Nearby
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => toggleBookmark(event.id)}
                    className={cn(
                      "absolute top-6 right-6 sm:top-8 sm:right-8 p-2 rounded-xl transition-all active:scale-90 z-20",
                      profile?.bookmarkedEventIds?.includes(event.id)
                        ? "bg-amber-100 text-amber-600 shadow-sm"
                        : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    {profile?.bookmarkedEventIds?.includes(event.id) ? (
                      <BookmarkCheck className="w-5 h-5" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors leading-tight pr-10">
                    {event.title}
                  </h3>
                  <p className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-wide">
                    {event.type === 'program' ? <GraduationCap className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />} {event.organization}
                  </p>

                  <p className="text-slate-500 text-sm sm:text-base mb-8 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className={cn(
                  "space-y-4 pt-6 border-t border-slate-100",
                  viewMode === 'list' && "md:border-t-0 md:pt-0 md:border-l md:pl-8 md:space-y-3 md:flex-1"
                )}>
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-slate-600">
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-slate-600">
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span>{event.date}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => directRegister(event)}
                      disabled={registeringId === event.id || profile?.registeredEventIds?.includes(event.id)}
                      className={cn(
                        "flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                        profile?.registeredEventIds?.includes(event.id)
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default"
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                      )}
                    >
                      {registeringId === event.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : profile?.registeredEventIds?.includes(event.id) ? (
                        <>
                          <Check className="w-4 h-4" />
                          Registered
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-indigo-200" />
                          Fast Register
                        </>
                      )}
                    </button>

                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98]",
                        viewMode === 'list' && "md:mt-0"
                      )}
                    >
                      Official Link <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredEvents.length > visibleCount && (
          <div className="mt-12 text-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="px-10 py-5 bg-white border-2 border-slate-200 rounded-[28px] text-slate-900 font-black text-sm uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-[0.98] shadow-sm flex items-center gap-3 mx-auto group"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Load More Opportunities
            </button>
            <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing {visibleCount} of {filteredEvents.length} results
            </p>
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-300">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No matches found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your search or preferences.</p>
            <button 
              onClick={() => { setSearchQuery(''); setFilterType('all'); }}
              className="mt-8 text-indigo-600 font-black text-sm uppercase tracking-widest hover:text-indigo-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-slate-900 p-2 rounded-xl">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900 uppercase">EventHub</span>
              </div>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                Empowering your career journey by bringing the best hackathons, government schemes, and educational programs directly to you.
              </p>
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">Join our newsletter</h4>
                    <p className="text-slate-500 text-sm font-medium">Get weekly updates on new opportunities near you.</p>
                  </div>
                  <form onSubmit={handleNewsletterSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      required
                      className="px-6 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm min-w-[260px]"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                    <button 
                      type="submit"
                      disabled={subscribing}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                      {subscribing ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-100 gap-8">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              © 2026 EventHub. Empowering careers through opportunities.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors text-[10px] font-bold uppercase tracking-widest">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors text-[10px] font-bold uppercase tracking-widest">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
