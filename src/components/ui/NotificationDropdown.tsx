import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Info, Loader2, MapPin, Zap } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/apiClient';
import { EmptyState, ErrorState, SkeletonCard } from './states';

interface Notification {
  id: string;
  type?: string;
  title?: string;
  message?: string;
  time?: string;
  read?: boolean;
}

export default function NotificationDropdown({ profile }: { profile: any }) {
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(
    async (showRefreshState = false) => {
      if (showRefreshState) {
        setRefreshing(true);
      } else if (notifications.length === 0) {
        setInitialLoading(true);
      }

      setError(null);

      try {
        const data = await fetchNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setError(
          notifications.length > 0
            ? 'Could not refresh notifications. Showing previously loaded notifications.'
            : 'Unable to load notifications. Please try again.',
        );
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [notifications.length],
  );

  useEffect(() => {
    void loadNotifications();

    if (profile && profile.uid && socket) {
      socket.on(`NOTIFICATION_RECEIVED_${profile.uid}`, (newNotification: any) => {
        try {
          if (!newNotification?.id) return;

          setNotifications((current) => {
            if (current.some((n) => n.id === newNotification.id)) {
              return current;
            }
            return [newNotification, ...current];
          });
        } catch (err) {
          console.error("[NotificationDropdown] WebSocket error:", err);
        }
      });

      return () => {
        socket.off(`NOTIFICATION_RECEIVED_${profile.uid}`);
      };
    }
  }, [profile, loadNotifications, socket]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleMarkRead = async (id: string) => {
    if (markingNotificationId || markingAll) return;

    setMarkingNotificationId(id);
    setError(null);

    const previousNotifications = notifications;
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );

    try {
      await markNotificationRead(id);
    } catch {
      setNotifications(previousNotifications);
      setError('Unable to mark this notification as read. Please try again.');
    } finally {
      setMarkingNotificationId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    setError(null);

    const previousNotifications = notifications;
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );

    try {
      await markAllNotificationsRead();
    } catch {
      setNotifications(previousNotifications);
      setError('Unable to mark all notifications as read. Please try again.');
    } finally {
      setMarkingAll(false);
    }
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'match':
        return Zap;
      case 'local':
        return MapPin;
      case 'welcome':
        return Bell;
      default:
        return Info;
    }
  };

  const renderContent = () => {
    if (initialLoading) {
      return (
        <div className="p-4" role="status" aria-live="polite">
          <span className="sr-only">Loading notifications</span>
          <SkeletonCard count={3} />
        </div>
      );
    }

    if (error && notifications.length === 0) {
      return (
        <div className="p-4">
          <ErrorState
            title="Notifications unavailable"
            description={error}
            onRetry={() => void loadNotifications(true)}
            retrying={refreshing}
          />
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="p-4">
          <EmptyState
            title="You are all caught up"
            description="New updates and opportunity alerts will appear here."
            icon={<Bell className="h-6 w-6" aria-hidden="true" />}
          />
        </div>
      );
    }

    return (
      <>
        {error ? (
          <div
            role="status"
            className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900"
          >
            <div className="flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void loadNotifications(true)}
                disabled={refreshing}
                className="font-semibold underline disabled:opacity-50"
              >
                {refreshing ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          </div>
        ) : null}

        {notifications.map((notification) => {
          const Icon = getIcon(notification.type);
          const isMarkingThis = markingNotificationId === notification.id;

          return (
            <button
              type="button"
              key={notification.id}
              onClick={() => {
                if (!notification.read) {
                  void handleMarkRead(notification.id);
                }
              }}
              disabled={isMarkingThis || markingAll}
              className={`group flex w-full gap-3 border-b border-gray-50 p-4 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 ${
                !notification.read ? 'bg-blue-50/30' : ''
              }`}
              aria-label={
                notification.read
                  ? `${notification.title ?? 'Notification'}, read`
                  : `${notification.title ?? 'Notification'}, mark as read`
              }
            >
              <div className="mt-0.5 shrink-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    !notification.read
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isMarkingThis ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h4
                  className={`mb-0.5 line-clamp-1 text-sm ${
                    !notification.read
                      ? 'font-bold text-gray-900'
                      : 'font-semibold text-gray-700'
                  }`}
                >
                  {notification.title ?? 'Notification'}
                </h4>
                <p className="mb-1 line-clamp-2 text-xs text-gray-600">
                  {notification.message ?? 'You have a new update.'}
                </p>
                {notification.time ? (
                  <span className="text-[10px] font-medium text-gray-400">
                    {notification.time}
                  </span>
                ) : null}
              </div>

              {!notification.read ? (
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"
                  aria-label="Unread"
                />
              ) : null}
            </button>
          );
        })}
      </>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span
            className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500"
            aria-hidden="true"
          />
        ) : null}
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 duration-200"
        >
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {refreshing ? (
                <Loader2
                  className="h-4 w-4 animate-spin text-gray-400"
                  aria-label="Refreshing notifications"
                />
              ) : null}
              {unreadCount > 0 ? (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {unreadCount} New
                </span>
              ) : null}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">{renderContent()}</div>

          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            disabled={
              markingAll ||
              unreadCount === 0 ||
              initialLoading ||
              Boolean(markingNotificationId)
            }
            className="flex w-full items-center justify-center gap-2 border-t border-gray-100 bg-white p-3 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-white disabled:opacity-50"
          >
            {markingAll ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            ) : null}
            {markingAll ? 'Marking all as read...' : 'Mark all as read'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
