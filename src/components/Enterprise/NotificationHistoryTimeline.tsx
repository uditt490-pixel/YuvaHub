// ─── Notification History Timeline ────────────────────────────────────────────
// Renders a vertical timeline of notification history grouped by date with
// priority badges, channel icons, delivery status, and expandable detail.

import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, Bell, Mail, MessageSquare, Smartphone,
  Globe, Hash, Monitor, CheckCircle2, XCircle, Clock, Eye, AlertTriangle,
  Pin, ExternalLink, Filter,
} from 'lucide-react';
import {
  Notification, NotificationChannel, NotificationPriority, NotificationStatus,
  NotificationGroup,
} from '../../types/notifications';

interface NotificationHistoryTimelineProps {
  groups: NotificationGroup[];
  isLoading: boolean;
  onSelectNotification: (notification: Notification) => void;
  onMarkAsRead: (notificationId: string) => void;
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

const PRIORITY_CONFIG: Record<NotificationPriority, { dot: string; badge: string; glow: string }> = {
  LOW: { dot: 'bg-slate-400', badge: 'bg-surface-secondary text-text-secondary border-border-theme', glow: '' },
  MEDIUM: { dot: 'bg-blue-500/200', badge: 'bg-blue-500/200/20 text-blue-400 border-blue-500/30', glow: '' },
  HIGH: { dot: 'bg-amber-500/200', badge: 'bg-amber-500/200/20 text-amber-400 border-amber-500/30', glow: 'shadow-amber-200' },
  CRITICAL: { dot: 'bg-red-500/200', badge: 'bg-red-500/200/20 text-red-400 border-red-500/30', glow: 'shadow-red-200' },
  URGENT: { dot: 'bg-rose-600', badge: 'bg-rose-100 text-rose-700 border-rose-200', glow: 'shadow-rose-200' },
};

const STATUS_ICONS: Record<NotificationStatus, { icon: React.ReactNode; color: string; label: string }> = {
  PENDING: { icon: <Clock className="h-3.5 w-3.5" />, color: 'text-text-muted', label: 'Pending' },
  SENT: { icon: <Clock className="h-3.5 w-3.5" />, color: 'text-blue-500', label: 'Sent' },
  DELIVERED: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'text-emerald-500', label: 'Delivered' },
  READ: { icon: <Eye className="h-3.5 w-3.5" />, color: 'text-indigo-500', label: 'Read' },
  FAILED: { icon: <XCircle className="h-3.5 w-3.5" />, color: 'text-red-500', label: 'Failed' },
  EXPIRED: { icon: <Clock className="h-3.5 w-3.5" />, color: 'text-text-muted', label: 'Expired' },
  CANCELLED: { icon: <XCircle className="h-3.5 w-3.5" />, color: 'text-text-muted', label: 'Cancelled' },
};

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Single Notification Item ─────────────────────────────────────────────────

const NotificationItem: React.FC<{
  notification: Notification;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onMarkAsRead: () => void;
}> = ({ notification, isExpanded, onToggle, onSelect, onMarkAsRead }) => {
  const sev = PRIORITY_CONFIG[notification.priority];
  const statusConfig = STATUS_ICONS[notification.status];
  const isUnread = notification.status !== 'READ';

  return (
    <div className={`relative pl-8 pb-1 group`}>
      {/* Timeline line */}
      <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border-theme group-hover:bg-indigo-300 transition-colors" />

      {/* Timeline dot */}
      <div className={`absolute left-0 top-4 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 ${sev.dot} ${isUnread ? `ring-2 ring-offset-1 ${sev.glow}` : ''}`}>
        <div className="w-2 h-2 bg-surface rounded-full" />
      </div>

      {/* Card */}
      <div
        className={`ml-4 rounded-xl border transition-all cursor-pointer ${
          isExpanded ? 'border-indigo-300 shadow-md ring-1 ring-indigo-100' :
          isUnread ? 'border-indigo-500/30 bg-indigo-500/20/20 hover:bg-indigo-500/20/40 hover:shadow-sm' :
          'border-border-theme hover:border-border-theme hover:shadow-sm bg-surface'
        }`}
      >
        {/* Main row */}
        <div className="flex items-center gap-3 p-3.5" onClick={onToggle}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {notification.pinned && <Pin className="h-3 w-3 text-amber-500" />}
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${sev.badge}`}>
                {notification.priority}
              </span>
              <span className="text-[10px] font-bold text-text-muted uppercase">{notification.category.replace(/_/g, ' ')}</span>
            </div>
            <p className={`text-sm font-bold truncate ${isUnread ? 'text-text-primary' : 'text-text-primary'}`}>
              {isUnread && <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500/200 mr-1.5 -mb-0.5" />}
              {notification.title}
            </p>
            <p className="text-xs text-text-muted truncate mt-0.5">{notification.shortBody}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className={`flex items-center gap-1 text-[11px] font-medium ${statusConfig.color}`}>
                {statusConfig.icon} {statusConfig.label}
              </span>
              <span className="text-[11px] text-text-muted">·</span>
              <span className="text-[11px] text-text-muted">{formatTimeAgo(notification.createdAt)}</span>
              <div className="flex items-center gap-0.5 ml-auto">
                {notification.channels.map(ch => (
                  <span key={ch} className="p-1 rounded bg-surface-secondary text-text-muted" title={ch}>
                    {CHANNEL_ICONS[ch]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <ChevronDown className={`h-4 w-4 text-text-muted transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>

        {/* Expanded Detail */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-1 border-t border-border-theme space-y-3 animate-in slide-in-from-top-1 duration-200">
            <p className="text-sm text-text-secondary leading-relaxed">{notification.body}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="bg-surface rounded-lg p-2.5">
                <span className="text-[10px] font-bold text-text-muted uppercase">Recipient</span>
                <p className="text-xs font-bold text-text-primary mt-0.5">{notification.recipientName}</p>
              </div>
              <div className="bg-surface rounded-lg p-2.5">
                <span className="text-[10px] font-bold text-text-muted uppercase">Template</span>
                <p className="text-xs font-bold text-text-primary mt-0.5">{notification.templateName}</p>
              </div>
              <div className="bg-surface rounded-lg p-2.5">
                <span className="text-[10px] font-bold text-text-muted uppercase">Channels</span>
                <div className="flex gap-1 mt-0.5">
                  {notification.channels.map(ch => (
                    <span key={ch} className="px-1.5 py-0.5 bg-surface-secondary text-text-secondary rounded text-[10px] font-bold">{ch}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery Attempts */}
            {notification.deliveryAttempts.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-text-muted uppercase mb-1.5 block">Delivery Log</span>
                <div className="space-y-1">
                  {notification.deliveryAttempts.slice(0, 5).map(attempt => (
                    <div key={attempt.id} className="flex items-center gap-2 text-[11px]">
                      <span className={`w-1.5 h-1.5 rounded-full ${attempt.status === 'DELIVERED' ? 'bg-emerald-500/200' : attempt.status === 'BOUNCED' ? 'bg-red-500/200' : 'bg-amber-500/200'}`} />
                      <span className="text-text-muted">{attempt.channel}</span>
                      <span className={`font-bold ${attempt.status === 'DELIVERED' ? 'text-emerald-400' : attempt.status === 'BOUNCED' ? 'text-red-400' : 'text-amber-400'}`}>
                        {attempt.status}
                      </span>
                      <span className="text-text-muted ml-auto">{new Date(attempt.attemptedAt).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border-theme">
              {isUnread && (
                <button
                  onClick={(e) => { e.stopPropagation(); onMarkAsRead(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"
                >
                  <Eye className="h-3 w-3" /> Mark as Read
                </button>
              )}
              {notification.actionUrl && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-text-secondary hover:bg-surface-secondary rounded-lg transition-colors"
                >
                  <ExternalLink className="h-3 w-3" /> {notification.actionLabel || 'View'}
                </button>
              )}
              <span className="text-[10px] text-text-muted font-mono ml-auto">{notification.id}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Timeline Component ──────────────────────────────────────────────────

export const NotificationHistoryTimeline: React.FC<NotificationHistoryTimelineProps> = ({
  groups, isLoading, onSelectNotification, onMarkAsRead,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="pl-8 relative">
            <div className="absolute left-0 top-4 w-6 h-6 rounded-full bg-border-theme animate-pulse" />
            <div className="ml-4 bg-surface rounded-xl border border-border-theme p-4 animate-pulse">
              <div className="flex gap-2 mb-2"><div className="h-5 w-16 bg-surface-secondary rounded" /><div className="h-5 w-20 bg-surface-secondary rounded" /></div>
              <div className="h-4 w-3/4 bg-surface-secondary rounded mb-2" />
              <div className="h-3 w-1/2 bg-surface-secondary rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border-theme border-dashed p-16 text-center">
        <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-text-primary">No Notifications Found</h3>
        <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">
          No notifications match your current filters. Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(group => {
        const unreadCount = group.notifications.filter(n => n.status !== 'READ').length;

        return (
          <div key={group.groupKey}>
            {/* Group Header */}
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wide">{group.category.replace(/_/g, ' ')}</h3>
              <div className="flex-1 h-px bg-border-theme" />
              <span className="text-xs font-bold text-text-muted">{group.count} notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-indigo-500/200/20 text-indigo-400 rounded-full text-[10px] font-black border border-indigo-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {/* Entries */}
            <div className="space-y-3 ml-1">
              {group.notifications.slice(0, 5).map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  isExpanded={expandedIds.has(notification.id)}
                  onToggle={() => toggleExpand(notification.id)}
                  onSelect={() => onSelectNotification(notification)}
                  onMarkAsRead={() => onMarkAsRead(notification.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationHistoryTimeline;
