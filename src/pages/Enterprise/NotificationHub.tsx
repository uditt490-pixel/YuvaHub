// ─── Enterprise Notification Hub ──────────────────────────────────────────────
// Full page container orchestrating the Notification Center: live metrics,
// notification list with filters, history timeline, channel preferences,
// templates, rules, and real-time detail modal.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Settings, Clock, FileText, Zap, Radio, Mail, MessageSquare, Smartphone,
  Globe, Hash, Monitor, CheckCircle2, XCircle, Eye, TrendingUp, TrendingDown,
  AlertTriangle, X, ChevronRight, Shield, BarChart3, Users, RefreshCw,
} from 'lucide-react';
import {
  Notification, NotificationChannel, NotificationPriority, NotificationStatus,
  NotificationCategory, NotificationMetrics, NotificationTemplate,
  ChannelPreferences, NotificationRule, NotificationGroup,
  NotificationFilterState, DeliveryAttempt,
} from '../../types/notifications';
import { NotificationService } from '../../services/NotificationService';
import { NotificationCenter } from '../../components/Enterprise/NotificationCenter';
import { NotificationPreferences } from '../../components/Enterprise/NotificationPreferences';
import { NotificationHistoryTimeline } from '../../components/Enterprise/NotificationHistoryTimeline';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNEL_ICONS: Record<NotificationChannel, React.ReactNode> = {
  EMAIL: <Mail className="h-4 w-4" />,
  SMS: <MessageSquare className="h-4 w-4" />,
  PUSH: <Smartphone className="h-4 w-4" />,
  IN_APP: <Bell className="h-4 w-4" />,
  WEBHOOK: <Globe className="h-4 w-4" />,
  SLACK: <Hash className="h-4 w-4" />,
  TEAMS: <Monitor className="h-4 w-4" />,
};

const CHANNEL_COLORS: Record<NotificationChannel, string> = {
  EMAIL: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  SMS: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  PUSH: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  IN_APP: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
  WEBHOOK: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  SLACK: 'text-pink-600 bg-pink-50 border-pink-200',
  TEAMS: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
};

const PRIORITY_DOT: Record<NotificationPriority, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-blue-500/200',
  HIGH: 'bg-amber-500/200',
  CRITICAL: 'bg-red-500/200',
  URGENT: 'bg-rose-600',
};

const PRIORITY_BADGE: Record<NotificationPriority, string> = {
  LOW: 'bg-surface-secondary text-text-secondary border-border-theme',
  MEDIUM: 'bg-blue-500/200/20 text-blue-400 border-blue-500/30',
  HIGH: 'bg-amber-500/200/20 text-amber-400 border-amber-500/30',
  CRITICAL: 'bg-red-500/200/20 text-red-400 border-red-500/30',
  URGENT: 'bg-rose-100 text-rose-700 border-rose-200',
};

const STATUS_CONFIG: Record<NotificationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Pending', color: 'text-text-muted bg-surface border-border-theme', icon: <Clock className="h-3.5 w-3.5" /> },
  SENT: { label: 'Sent', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30', icon: <ChevronRight className="h-3.5 w-3.5" /> },
  DELIVERED: { label: 'Delivered', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  READ: { label: 'Read', color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30', icon: <Eye className="h-3.5 w-3.5" /> },
  FAILED: { label: 'Failed', color: 'text-red-400 bg-red-500/20 border-red-500/30', icon: <XCircle className="h-3.5 w-3.5" /> },
  EXPIRED: { label: 'Expired', color: 'text-text-muted bg-surface border-border-theme', icon: <Clock className="h-3.5 w-3.5" /> },
  CANCELLED: { label: 'Cancelled', color: 'text-text-muted bg-surface border-border-theme', icon: <XCircle className="h-3.5 w-3.5" /> },
};

const DEFAULT_FILTERS: NotificationFilterState = {
  searchQuery: '',
  categories: [],
  priorities: [],
  channels: [],
  statuses: [],
  dateRange: '7D',
  showUnreadOnly: false,
  sortBy: 'newest',
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

const NotificationDetailModal: React.FC<{
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, isOpen, onClose, onMarkAsRead }) => {
  if (!isOpen || !notification) return null;

  const sevBadge = PRIORITY_BADGE[notification.priority];
  const statusConf = STATUS_CONFIG[notification.status];

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start p-4 pt-16 bg-primary-blue/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-surface rounded-3xl shadow-2xl max-w-2xl w-full border border-border-theme overflow-hidden mb-16">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-theme flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${statusConf.color} border`}>
              {statusConf.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Notification Detail</h3>
              <p className="text-xs text-text-muted font-mono">{notification.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-border-theme text-text-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Priority Banner */}
        <div className="px-6 py-3 border-b border-border-theme bg-surface/30">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${sevBadge}`}>
                {notification.priority}
              </span>
              <span className="text-xs font-bold text-text-muted uppercase">{notification.category.replace(/_/g, ' ')}</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusConf.color}`}>
              {statusConf.icon} {statusConf.label}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[55vh] overflow-y-auto">
          {/* Title & Body */}
          <div>
            <h2 className="text-xl font-black text-text-primary mb-2">{notification.title}</h2>
            <p className="text-sm text-text-secondary leading-relaxed">{notification.body}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-xl p-3 border border-border-theme">
              <span className="text-[10px] font-bold text-text-muted uppercase">Recipient</span>
              <p className="text-sm font-bold text-text-primary mt-0.5">{notification.recipientName}</p>
              <p className="text-xs text-text-muted">{notification.recipientEmail}</p>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-border-theme">
              <span className="text-[10px] font-bold text-text-muted uppercase">Created</span>
              <p className="text-sm font-bold text-text-primary mt-0.5">{new Date(notification.createdAt).toLocaleString()}</p>
              <p className="text-xs text-text-muted">{new Date(notification.createdAt).toISOString()}</p>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-border-theme">
              <span className="text-[10px] font-bold text-text-muted uppercase">Template</span>
              <p className="text-sm font-bold text-text-primary mt-0.5">{notification.templateName}</p>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-border-theme">
              <span className="text-[10px] font-bold text-text-muted uppercase">Channels</span>
              <div className="flex gap-1 mt-1">
                {notification.channels.map(ch => (
                  <span key={ch} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${CHANNEL_COLORS[ch]}`}>
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery Log */}
          {notification.deliveryAttempts.length > 0 && (
            <div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 block">Delivery Log</span>
              <div className="space-y-2">
                {notification.deliveryAttempts.map(attempt => (
                  <div key={attempt.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
                    attempt.status === 'DELIVERED' ? 'bg-emerald-500/20 border-emerald-100' :
                    attempt.status === 'BOUNCED' ? 'bg-red-500/20 border-red-100' :
                    'bg-surface border-border-theme'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      attempt.status === 'DELIVERED' ? 'bg-emerald-500/200' :
                      attempt.status === 'BOUNCED' ? 'bg-red-500/200' : 'bg-amber-500/200'
                    }`} />
                    <span className="text-xs font-bold text-text-primary w-16">{attempt.channel}</span>
                    <span className={`text-xs font-bold ${
                      attempt.status === 'DELIVERED' ? 'text-emerald-400' :
                      attempt.status === 'BOUNCED' ? 'text-red-400' : 'text-amber-400'
                    }`}>{attempt.status}</span>
                    <span className="text-[10px] text-text-muted ml-auto">{new Date(attempt.attemptedAt).toLocaleTimeString()}</span>
                    {attempt.errorMessage && <span className="text-[10px] text-red-500">{attempt.errorMessage}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {notification.tags.length > 0 && (
            <div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 block">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {notification.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-surface-secondary text-text-secondary rounded-lg text-[11px] font-bold">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 block">Metadata</span>
            <div className="bg-primary-blue rounded-xl p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">{JSON.stringify(notification.metadata, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-theme bg-surface/50 flex items-center justify-between">
          {notification.status !== 'READ' && (
            <button
              onClick={() => { onMarkAsRead(notification.id); onClose(); }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 rounded-xl transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> Mark as Read
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-white bg-primary-blue hover:bg-indigo-700 rounded-xl transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Metrics Bar ──────────────────────────────────────────────────────────────

const MetricsBar: React.FC<{ metrics: NotificationMetrics | null; isLoading: boolean }> = ({ metrics, isLoading }) => {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border border-border-theme p-4 animate-pulse">
            <div className="h-3 w-20 bg-surface-secondary rounded mb-2" />
            <div className="h-7 w-16 bg-surface-secondary rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Sent</span>
        <p className="text-2xl font-black text-text-primary mt-1">{metrics.totalSent.toLocaleString()}</p>
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp className="h-3 w-3 text-emerald-500" />
          <span className="text-[11px] font-bold text-emerald-400">{metrics.deliveryRate}% delivered</span>
        </div>
      </div>
      <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Read Rate</span>
        <p className="text-2xl font-black text-text-primary mt-1">{metrics.readRate}%</p>
        <span className="text-[11px] text-text-muted">{metrics.totalRead.toLocaleString()} read</span>
      </div>
      <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Failed</span>
        <p className="text-2xl font-black text-red-400 mt-1">{metrics.totalFailed}</p>
        <span className="text-[11px] text-text-muted">{metrics.avgDeliveryTimeMs}ms avg delivery</span>
      </div>
      <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Avg Read Time</span>
        <p className="text-2xl font-black text-text-primary mt-1">{metrics.avgReadTimeMinutes}m</p>
        <span className="text-[11px] text-text-muted">time to open</span>
      </div>
    </div>
  );
};

// ─── Templates Panel ──────────────────────────────────────────────────────────

const TemplatesPanel: React.FC<{ templates: NotificationTemplate[]; isLoading: boolean }> = ({ templates, isLoading }) => {
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-surface-secondary rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-3">
      {templates.map(tpl => (
        <div key={tpl.id} className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-text-primary">{tpl.name}</h4>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${tpl.isActive ? 'bg-emerald-500/200/20 text-emerald-400' : 'bg-surface-secondary text-text-muted'}`}>
              {tpl.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-xs text-text-muted mb-2">{tpl.description}</p>
          <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span>{tpl.usageCount.toLocaleString()} uses</span>
            <span>v{tpl.version}</span>
            <span>{tpl.channels.length} channels</span>
            {tpl.variables.length > 0 && <span>{tpl.variables.length} variables</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Rules Panel ──────────────────────────────────────────────────────────────

const RulesPanel: React.FC<{ rules: NotificationRule[]; isLoading: boolean }> = ({ rules, isLoading }) => {
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-surface-secondary rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-3">
      {rules.map(rule => (
        <div key={rule.id} className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-text-primary">{rule.name}</h4>
            <span className={`w-2 h-2 rounded-full ${rule.isActive ? 'bg-emerald-500/200' : 'bg-slate-300'}`} />
          </div>
          <p className="text-xs text-text-muted mb-2">{rule.description}</p>
          <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span>{rule.triggerCount} triggers</span>
            <span>{rule.cooldownMinutes}m cooldown</span>
            {rule.lastTriggeredAt && <span>Last: {new Date(rule.lastTriggeredAt).toLocaleTimeString()}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

type PageView = 'notifications' | 'preferences' | 'history' | 'templates' | 'rules';

export const NotificationHub: React.FC = () => {
  const [activeView, setActiveView] = useState<PageView>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [metrics, setMetrics] = useState<NotificationMetrics | null>(null);
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [preferences, setPreferences] = useState<ChannelPreferences[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [filters, setFilters] = useState<NotificationFilterState>(DEFAULT_FILTERS);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingRules, setIsLoadingRules] = useState(true);

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamCount, setStreamCount] = useState(0);

  // ─── Data Loading ───────────────────────────────────────────────────────

  const loadNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    const data = await NotificationService.getNotifications(filters);
    setNotifications(data);
    setIsLoadingNotifications(false);
  }, [filters]);

  const loadMetrics = useCallback(async () => {
    setIsLoadingMetrics(true);
    const data = await NotificationService.getMetrics();
    setMetrics(data);
    setIsLoadingMetrics(false);
  }, []);

  const loadGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    const data = await NotificationService.getGroupedNotifications(filters);
    setGroups(data);
    setIsLoadingGroups(false);
  }, [filters]);

  useEffect(() => { loadMetrics(); }, [loadMetrics]);

  useEffect(() => {
    const debounce = setTimeout(() => { loadNotifications(); loadGroups(); }, 300);
    return () => clearTimeout(debounce);
  }, [loadNotifications, loadGroups]);

  useEffect(() => {
    const loadSideData = async () => {
      setIsLoadingPreferences(true);
      setIsLoadingTemplates(true);
      setIsLoadingRules(true);
      const [prefs, tpls, rls] = await Promise.all([
        NotificationService.getChannelPreferences(),
        NotificationService.getTemplates(),
        NotificationService.getRules(),
      ]);
      setPreferences(prefs);
      setTemplates(tpls);
      setRules(rls);
      setIsLoadingPreferences(false);
      setIsLoadingTemplates(false);
      setIsLoadingRules(false);
    };
    if (activeView === 'preferences') loadSideData();
    if (activeView === 'templates') loadSideData();
    if (activeView === 'rules') loadSideData();
  }, [activeView]);

  // ─── Actions ────────────────────────────────────────────────────────────

  const handleMarkAsRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' as NotificationStatus, readAt: new Date().toISOString() } : n));
  };

  const handleMarkAllAsRead = async () => {
    await NotificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => n.status !== 'READ' ? { ...n, status: 'READ' as NotificationStatus, readAt: new Date().toISOString() } : n));
  };

  const handlePreferenceUpdate = async (channel: NotificationChannel, updates: Partial<ChannelPreferences>) => {
    setPreferences(prev => prev.map(p => p.channel === channel ? { ...p, ...updates } : p));
  };

  const unreadCount = notifications.filter(n => n.status !== 'READ').length;

  // ─── View Tabs ──────────────────────────────────────────────────────────

  const VIEW_TABS: Array<{ id: PageView; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" />, badge: unreadCount > 0 ? String(unreadCount) : undefined },
    { id: 'preferences', label: 'Preferences', icon: <Settings className="h-4 w-4" /> },
    { id: 'history', label: 'History', icon: <Clock className="h-4 w-4" /> },
    { id: 'templates', label: 'Templates', icon: <FileText className="h-4 w-4" /> },
    { id: 'rules', label: 'Rules', icon: <Zap className="h-4 w-4" /> },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 font-sans">
      <div className="max-w-[1500px] mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-surface p-6 rounded-3xl border border-border-theme shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-surface-secondary text-text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border border-border-theme">
                <Bell className="h-4 w-4" /> Communication Hub
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Notification Center</h1>
            <p className="text-sm text-text-muted mt-2 max-w-xl">
              Multi-channel notification management with preferences, delivery tracking, templates, and automation rules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { loadMetrics(); loadNotifications(); loadGroups(); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm font-bold text-text-secondary hover:bg-surface transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </header>

        {/* Metrics */}
        <MetricsBar metrics={metrics} isLoading={isLoadingMetrics} />

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-surface p-1.5 rounded-xl border border-border-theme shadow-sm overflow-x-auto">
          {VIEW_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeView === tab.id ? 'bg-primary-blue text-white shadow-md' : 'text-text-muted hover:text-text-primary hover:bg-surface'
              }`}
            >
              {tab.icon} {tab.label}
              {tab.badge && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                  activeView === tab.id ? 'bg-surface/20 text-white' : 'bg-indigo-500/200/20 text-indigo-400'
                }`}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeView === 'notifications' && (
          <NotificationCenter
            notifications={notifications}
            isLoading={isLoadingNotifications}
            unreadCount={unreadCount}
            filters={filters}
            onFilterChange={(updates) => setFilters(prev => ({ ...prev, ...updates }))}
            onSelectNotification={setSelectedNotification}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        )}

        {activeView === 'preferences' && (
          <div className="max-w-3xl">
            <NotificationPreferences preferences={preferences} onUpdate={handlePreferenceUpdate} />
          </div>
        )}

        {activeView === 'history' && (
          <NotificationHistoryTimeline
            groups={groups}
            isLoading={isLoadingGroups}
            onSelectNotification={setSelectedNotification}
            onMarkAsRead={handleMarkAsRead}
          />
        )}

        {activeView === 'templates' && (
          <div className="max-w-3xl">
            <TemplatesPanel templates={templates} isLoading={isLoadingTemplates} />
          </div>
        )}

        {activeView === 'rules' && (
          <div className="max-w-3xl">
            <RulesPanel rules={rules} isLoading={isLoadingRules} />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={selectedNotification !== null}
        onClose={() => setSelectedNotification(null)}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};

export default NotificationHub;
