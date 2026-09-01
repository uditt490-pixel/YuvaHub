import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Bell, Check, ExternalLink, X, MessageSquare, UserPlus, Award, Info } from 'lucide-react';
import { InAppNotification } from '../../types';
import { apiFetch } from '../../lib/apiFetch';
import { useAppContext } from '../../context/AppContext';

interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  toastList: InAppNotification[];
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissToast: (id: string) => void;
  triggerMockNotification: (content: string, type?: string, link?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationToastProvider');
  }
  return context;
};

export const NotificationToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setActiveTab } = useAppContext();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [toastList, setToastList] = useState<InAppNotification[]>([]);

  // Fetch persistent notifications on mount or user change
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await apiFetch('/api/v1/notifications');
      const items = Array.isArray(res) ? res : res?.items || res?.data || [];
      const formatted: InAppNotification[] = items.map((item: any) => ({
        id: item.id || item._id,
        userId: item.userId || user.uid,
        type: item.type || 'system',
        content: item.content || item.message || item.title || 'New Notification',
        link: item.link || '/',
        isRead: Boolean(item.isRead || item.read),
        createdAt: item.createdAt || new Date().toISOString(),
      }));
      setNotifications(formatted);
    } catch (err) {
      console.warn('Fallback persistent notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  // Handle incoming real-time notification
  const handleNewNotification = useCallback((notif: InAppNotification) => {
    setNotifications((prev) => [notif, ...prev]);
    // Add to active toast list for visual slide-in
    setToastList((prev) => [notif, ...prev]);

    // Auto-dismiss toast alert after 5 seconds
    setTimeout(() => {
      setToastList((prev) => prev.filter((t) => (t.id || t._id) !== (notif.id || notif._id)));
    }, 5000);
  }, []);

  // Listen to WebSockets / Window Events for NEW_IN_APP_NOTIFICATION
  useEffect(() => {
    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail) {
        handleNewNotification(e.detail);
      }
    };

    window.addEventListener('NEW_IN_APP_NOTIFICATION' as any, handleCustomEvent);
    return () => {
      window.removeEventListener('NEW_IN_APP_NOTIFICATION' as any, handleCustomEvent);
    };
  }, [handleNewNotification]);

  const markAsRead = async (notificationId: string) => {
    // Optimistic UI state update
    setNotifications((prev) =>
      prev.map((n) => ((n.id || n._id) === notificationId ? { ...n, isRead: true, read: true } : n))
    );

    try {
      await apiFetch(`/api/v1/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    } catch (err) {
      console.warn('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
    try {
      await apiFetch('/api/v1/notifications/read-all', { method: 'POST' });
    } catch (err) {
      console.warn('Error marking all notifications as read:', err);
    }
  };

  const dismissToast = (id: string) => {
    setToastList((prev) => prev.filter((t) => (t.id || t._id) !== id));
  };

  const triggerMockNotification = (content: string, type: string = 'system', link: string = '/') => {
    const mockNotif: InAppNotification = {
      id: `notif_${Date.now()}`,
      userId: user?.uid || 'user_anon',
      type,
      content,
      link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    handleNewNotification(mockNotif);
  };

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toastList,
        markAsRead,
        markAllAsRead,
        dismissToast,
        triggerMockNotification,
      }}
    >
      {children}

      {/* Global Toast Slide-In Alert Container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toastList.map((toast) => (
          <div
            key={toast.id || toast._id}
            className="pointer-events-auto p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/50 text-white shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 animate-slide-in transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                {toast.type === 'team_invite' ? (
                  <UserPlus className="w-5 h-5" />
                ) : toast.type === 'forum_reply' ? (
                  <MessageSquare className="w-5 h-5" />
                ) : toast.type === 'mentorship_request' ? (
                  <Award className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5 text-indigo-400" />
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                  New Notification
                </span>
                <p className="text-xs font-semibold text-slate-100 leading-snug">
                  {toast.content}
                </p>
              </div>
            </div>

            <button
              onClick={() => dismissToast(toast.id || toast._id || '')}
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
