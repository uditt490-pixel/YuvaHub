// ─── Enterprise Notification Center Types ─────────────────────────────────────
// Full type definitions for the multi-channel notification system with
// preferences, templates, delivery tracking, and history.

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'WEBHOOK' | 'SLACK' | 'TEAMS';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'URGENT';

export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'EXPIRED' | 'CANCELLED';

export type NotificationCategory =
  | 'SECURITY_ALERT'
  | 'BILLING_UPDATE'
  | 'SYSTEM_STATUS'
  | 'USER_ACTION'
  | 'COMPLIANCE'
  | 'DEPLOYMENT'
  | 'ACCESS_CHANGE'
  | 'DATA_EXPORT'
  | 'INCIDENT'
  | 'MAINTENANCE'
  | 'FEATURE_RELEASE'
  | 'TEAM_UPDATE';

export type DigestFrequency = 'REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'NEVER';

export type TemplateVariableType = 'string' | 'number' | 'boolean' | 'date' | 'url' | 'email';

export type DeliveryAttemptStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'BOUNCED' | 'REFUSED' | 'TIMEOUT';

// ─── Core Notification ────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  body: string;
  shortBody: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: NotificationStatus;
  channels: NotificationChannel[];
  templateId: string;
  templateName: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  expiresAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  metadata: Record<string, string | number | boolean>;
  tags: string[];
  groupKey?: string;
  isGrouped: boolean;
  deliveryAttempts: DeliveryAttempt[];
  readBy: string[];
  pinned: boolean;
  snoozedUntil?: string;
}

// ─── Delivery Tracking ────────────────────────────────────────────────────────

export interface DeliveryAttempt {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: DeliveryAttemptStatus;
  attemptedAt: string;
  completedAt?: string;
  errorMessage?: string;
  retryCount: number;
  providerMessageId?: string;
  metadata: Record<string, string>;
}

export interface ChannelDeliveryStats {
  channel: NotificationChannel;
  sent: number;
  delivered: number;
  failed: number;
  read: number;
  avgDeliveryTimeMs: number;
  bounceRate: number;
}

// ─── Notification Template ────────────────────────────────────────────────────

export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  category: NotificationCategory;
  defaultPriority: NotificationPriority;
  channels: NotificationChannel[];
  subject?: string;
  titleTemplate: string;
  bodyTemplate: string;
  shortTemplate: string;
  variables: TemplateVariable[];
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  lastUsedAt?: string;
}

export interface TemplateVariable {
  name: string;
  type: TemplateVariableType;
  required: boolean;
  defaultValue?: string;
  description: string;
}

// ─── Channel Preferences ──────────────────────────────────────────────────────

export interface ChannelPreferences {
  channel: NotificationChannel;
  enabled: boolean;
  categories: CategoryPreference[];
  digestFrequency: DigestFrequency;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursTimezone: string;
  webhookUrl?: string;
  webhookSecret?: string;
  emailAddress?: string;
  phoneNumber?: string;
  slackChannel?: string;
  teamsChannel?: string;
  lastConfiguredAt?: string;
}

export interface CategoryPreference {
  category: NotificationCategory;
  enabled: boolean;
  minPriority: NotificationPriority;
}

// ─── Notification Rules ───────────────────────────────────────────────────────

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  triggerCategory: NotificationCategory;
  triggerPriority: NotificationPriority;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  isActive: boolean;
  cooldownMinutes: number;
  lastTriggeredAt?: string;
  triggerCount: number;
  createdAt: string;
  createdBy: string;
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value: string | number | boolean | string[];
}

export interface NotificationAction {
  type: 'SEND_EMAIL' | 'SEND_SMS' | 'SEND_PUSH' | 'POST_WEBHOOK' | 'ESCALATE' | 'GROUP' | 'SNOOZE';
  target?: string;
  delay?: number;
  templateId?: string;
}

// ─── Notification Group ───────────────────────────────────────────────────────

export interface NotificationGroup {
  groupKey: string;
  category: NotificationCategory;
  title: string;
  count: number;
  latestNotification: Notification;
  oldestAt: string;
  latestAt: string;
  unreadCount: number;
  notifications: Notification[];
}

// ─── Metrics & Analytics ──────────────────────────────────────────────────────

export interface NotificationMetrics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  avgDeliveryTimeMs: number;
  avgReadTimeMinutes: number;
  channelBreakdown: ChannelDeliveryStats[];
  categoryBreakdown: Array<{ category: NotificationCategory; count: number; percentage: number }>;
  hourlyTrend: Array<{ hour: number; sent: number; delivered: number; failed: number }>;
  dailyTrend: Array<{ date: string; sent: number; read: number }>;
  topRecipients: Array<{ name: string; email: string; received: number; readRate: number }>;
  priorityBreakdown: Array<{ priority: NotificationPriority; count: number }>;
}

// ─── Notification Center State ────────────────────────────────────────────────

export interface NotificationCenterState {
  notifications: Notification[];
  groups: NotificationGroup[];
  unreadCount: number;
  totalCount: number;
  selectedNotification: Notification | null;
  activeFilter: NotificationFilterState;
  viewMode: 'list' | 'grouped' | 'timeline';
  showRead: boolean;
}

export interface NotificationFilterState {
  searchQuery: string;
  categories: NotificationCategory[];
  priorities: NotificationPriority[];
  channels: NotificationChannel[];
  statuses: NotificationStatus[];
  dateRange: '1H' | '6H' | '24H' | '7D' | '30D';
  showUnreadOnly: boolean;
  sortBy: 'newest' | 'oldest' | 'priority' | 'unread';
}
