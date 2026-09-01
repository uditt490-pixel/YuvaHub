// ─── Enterprise Notification Center ───────────────────────────────────────────
// Main notification list panel with search, filters, bulk actions,
// real-time streaming toggle, and notification detail view.

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Bell, Search, Filter, CheckCheck, Pin, X, Mail, MessageSquare, Smartphone,
  Globe, Hash, Monitor, ChevronDown, Eye, EyeOff, Archive, Trash2, Volume2,
  VolumeX, AlertTriangle, Clock, Radio, RefreshCw, Download,
} from 'lucide-react';
import {
  Notification, NotificationChannel, NotificationPriority, NotificationStatus,
  NotificationCategory, NotificationFilterState,
} from '../../types/notifications';
import { NotificationService } from '../../services/NotificationService';

interface NotificationCenterProps {
  notifications: Notification[];
  isLoading: boolean;
  unreadCount: number;
  filters: NotificationFilterState;
  onFilterChange: (updates: Partial<NotificationFilterState>) => void;
  onSelectNotification: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const CHANNEL_ICONS: Record<NotificationChannel, React.ReactNode> = {
  EMAIL: <Mail className="h-3 w-3" />,
  SMS: <MessageSquare className="h-3 w-3" />,
  PUSH: <Smartphone className="h-3 w-3" />,
  IN_APP: <Bell className="h-3 w-3" />,
  WEBHOOK: <Globe className="h-3 w-3" />,
  SLACK: <Hash className="h-3 w-3" />,
  TEAMS: <Monitor className="h-3 w-3" />,
};

const PRIORITY_DOT: Record<NotificationPriority, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-blue-500/200',
  HIGH: 'bg-amber-500/200',
  CRITICAL: 'bg-red-500/200',
  URGENT: 'bg-rose-600',
};

const STATUS_LABELS: Record<NotificationStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'text-text-muted' },
  SENT: { label: 'Sent', color: 'text-blue-500' },
  DELIVERED: { label: 'Delivered', color: 'text-emerald-500' },
  READ: { label: 'Read', color: 'text-indigo-500' },
  FAILED: { label: 'Failed', color: 'text-red-500' },
  EXPIRED: { label: 'Expired', color: 'text-text-muted' },
  CANCELLED: { label: 'Cancelled', color: 'text-text-muted' },
};

const DATE_RANGES = [
  { value: '1H' as const, label: '1H' },
  { value: '6H' as const, label: '6H' },
  { value: '24H' as const, label: '24H' },
  { value: '7D' as const, label: '7D' },
  { value: '30D' as const, label: '30D' },
];

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications, isLoading, unreadCount, filters, onFilterChange,
  onSelectNotification, onMarkAsRead, onMarkAllAsRead,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border-theme shadow-sm overflow-hidden flex flex-col h-[800px]">
      {/* Header */}
      <div className="p-4 border-b border-border-theme bg-surface/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-indigo-500/200/20 text-indigo-400 rounded-full text-[10px] font-black border border-indigo-500/30">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Read All
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-lg transition-colors ${showFilters ? 'bg-indigo-500/200/20 text-indigo-400' : 'text-text-muted hover:bg-surface-secondary'}`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={filters.searchQuery}
            onChange={e => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border-theme rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Inline Filters */}
        {showFilters && (
          <div className="space-y-2.5 animate-in slide-in-from-top-1 duration-200">
            {/* Unread Toggle */}
            <button
              onClick={() => onFilterChange({ showUnreadOnly: !filters.showUnreadOnly })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                filters.showUnreadOnly ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-surface border-border-theme text-text-secondary'
              }`}
            >
              {filters.showUnreadOnly ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {filters.showUnreadOnly ? 'Show Unread Only' : 'Show All'}
            </button>

            {/* Date Range */}
            <div className="flex gap-1">
              {DATE_RANGES.map(dr => (
                <button
                  key={dr.value}
                  onClick={() => onFilterChange({ dateRange: dr.value })}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    filters.dateRange === dr.value ? 'bg-primary-blue text-white' : 'bg-surface-secondary text-text-muted hover:bg-border-theme'
                  }`}
                >
                  {dr.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex gap-1 flex-wrap">
              {(['newest', 'oldest', 'priority', 'unread'] as const).map(sort => (
                <button
                  key={sort}
                  onClick={() => onFilterChange({ sortBy: sort })}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${
                    filters.sortBy === sort ? 'bg-indigo-500/200/20 text-indigo-400 border border-indigo-500/30' : 'bg-surface text-text-muted border border-transparent hover:bg-surface-secondary'
                  }`}
                >
                  {sort}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="px-4 py-2 bg-indigo-500/20 border-b border-indigo-100 flex items-center gap-3">
          <span className="text-xs font-bold text-indigo-400">{selectedIds.size} selected</span>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs font-bold text-indigo-500 hover:text-indigo-400">Clear</button>
        </div>
      )}

      {/* Notification List */}
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-surface-secondary" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-surface-secondary rounded" />
                  <div className="h-3 w-1/2 bg-surface-secondary rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-text-secondary">No notifications</p>
            <p className="text-xs text-text-muted mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map(notification => {
              const isUnread = notification.status !== 'READ';
              const isSelected = selectedIds.has(notification.id);

              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 cursor-pointer transition-all hover:bg-surface/50 ${
                    isUnread ? 'bg-indigo-500/20/10' : ''
                  } ${isSelected ? 'bg-indigo-500/20/30' : ''}`}
                  onClick={() => onSelectNotification(notification)}
                >
                  {/* Priority Dot */}
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${PRIORITY_DOT[notification.priority]}`} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {notification.pinned && <Pin className="h-3 w-3 text-amber-500" />}
                      <span className={`text-xs font-bold truncate ${isUnread ? 'text-text-primary' : 'text-text-primary'}`}>
                        {notification.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate">{notification.shortBody}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-bold ${STATUS_LABELS[notification.status].color}`}>
                        {STATUS_LABELS[notification.status].label}
                      </span>
                      <span className="text-[10px] text-text-muted">·</span>
                      <span className="text-[10px] text-text-muted">{formatTimeAgo(notification.createdAt)}</span>
                      <div className="flex items-center gap-0.5 ml-auto">
                        {notification.channels.slice(0, 3).map(ch => (
                          <span key={ch} className="p-0.5 rounded bg-surface-secondary text-text-muted" title={ch}>
                            {CHANNEL_ICONS[ch]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
