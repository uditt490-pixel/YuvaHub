// ─── Enterprise Notification Center Service ───────────────────────────────────
// Generates realistic mock data for the Notification Center feature.
// Includes notifications, templates, delivery tracking, metrics, and preferences.

import {
  Notification, NotificationCategory, NotificationPriority, NotificationStatus,
  NotificationChannel, NotificationMetrics, ChannelDeliveryStats,
  NotificationTemplate, TemplateVariable, ChannelPreferences,
  NotificationRule, NotificationGroup, DeliveryAttempt, DeliveryAttemptStatus,
  DigestFrequency, CategoryPreference, NotificationFilterState,
} from '../types/notifications';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNELS: NotificationChannel[] = ['EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WEBHOOK', 'SLACK', 'TEAMS'];
const CATEGORIES: NotificationCategory[] = [
  'SECURITY_ALERT', 'BILLING_UPDATE', 'SYSTEM_STATUS', 'USER_ACTION', 'COMPLIANCE',
  'DEPLOYMENT', 'ACCESS_CHANGE', 'DATA_EXPORT', 'INCIDENT', 'MAINTENANCE',
  'FEATURE_RELEASE', 'TEAM_UPDATE',
];
const PRIORITIES: NotificationPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT'];
const STATUSES: NotificationStatus[] = ['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'EXPIRED', 'CANCELLED'];

const RECIPIENTS = [
  { id: 'usr_001', name: 'Priya Sharma', email: 'priya@yuvaHub.io' },
  { id: 'usr_002', name: 'Rohan Gupta', email: 'rohan@yuvaHub.io' },
  { id: 'usr_003', name: 'Aisha Patel', email: 'aisha@yuvaHub.io' },
  { id: 'usr_004', name: 'Vikram Singh', email: 'vikram@yuvaHub.io' },
  { id: 'usr_005', name: 'Meera Iyer', email: 'meera@yuvaHub.io' },
  { id: 'usr_006', name: 'Arjun Reddy', email: 'arjun@yuvaHub.io' },
  { id: 'usr_007', name: 'Neha Kapoor', email: 'neha@yuvaHub.io' },
  { id: 'usr_008', name: 'System Bot', email: 'system@yuvaHub.io' },
];

const NOTIFICATION_TEMPLATES: Record<NotificationCategory, { titles: string[]; bodies: string[] }> = {
  SECURITY_ALERT: {
    titles: ['Suspicious login detected', 'Unauthorized access attempt', 'Security breach detected', 'MFA anomaly flagged'],
    bodies: [
      'A login attempt was detected from an unrecognized device in Frankfurt, Germany. If this was not you, please secure your account immediately.',
      'Multiple failed authentication attempts detected for your account. The IP address has been temporarily blocked.',
      'A potential data exfiltration event was detected in your organization. Please review the security dashboard immediately.',
      'Your multi-factor authentication method was changed from a verified device. Please confirm this action.',
    ],
  },
  BILLING_UPDATE: {
    titles: ['Payment processed successfully', 'Invoice available for download', 'Subscription renewal reminder', 'Payment method expiring'],
    bodies: [
      'Your monthly payment of $2,499.00 has been processed successfully. Invoice #INV-2024-0847 is now available.',
      'Your annual subscription to YuvaHub Enterprise is due for renewal on September 15, 2024. Current plan: $29,988/year.',
      'Your payment method ending in 4242 will expire next month. Please update your billing information to avoid service interruption.',
      'A credit of $150.00 has been applied to your account for the partial month refund.',
    ],
  },
  SYSTEM_STATUS: {
    titles: ['System maintenance scheduled', 'Service degraded performance', 'All systems operational', 'Database failover complete'],
    bodies: [
      'Scheduled maintenance window: September 20, 2024, 02:00-04:00 UTC. Expect 15-20 minutes of downtime during database migration.',
      'API response times are elevated in the US-EAST region. Our engineering team has been notified and is investigating.',
      'All systems have returned to normal operation following the earlier incident. Mean time to recovery was 12 minutes.',
      'Automatic database failover to the standby replica completed successfully. All services are operational.',
    ],
  },
  USER_ACTION: {
    titles: ['New team member joined', 'Profile updated successfully', 'Account settings changed', 'Export completed'],
    bodies: [
      'Ravi Kumar has joined your organization as a Platform Engineer. They have been assigned the default developer role.',
      'Your profile information has been updated. Changes include new skills, bio, and profile image.',
      'Your notification preferences have been updated. Changes will take effect immediately.',
      'Your data export (2,450 records) is ready for download. The file will be available for 72 hours.',
    ],
  },
  COMPLIANCE: {
    titles: ['Compliance audit passed', 'Policy violation detected', 'Data retention reminder', 'GDPR request received'],
    bodies: [
      'Your SOC 2 Type II compliance audit has been completed. All controls are operating effectively.',
      'A data access policy violation was detected for user sneha@enterprise.co. Immediate review required.',
      '12,000 records are scheduled for auto-deletion under your 90-day data retention policy. Review before September 30.',
      'A GDPR data subject access request has been received from jane@customer.co. Response required within 30 days.',
    ],
  },
  DEPLOYMENT: {
    titles: ['Deployment successful', 'Rollback initiated', 'Canary release started', 'Build pipeline failed'],
    bodies: [
      'Version 4.2.1 has been successfully deployed to production. All health checks passed. Deployment took 3m 42s.',
      'Automatic rollback to version 4.1.9 initiated due to error rate exceeding 2% threshold. Investigating root cause.',
      'Canary deployment of v4.3.0-rc.1 to 5% of production traffic has begun. Monitoring for anomalies.',
      'The CI/CD pipeline for commit abc1234 failed during the integration test stage. 3 test failures detected.',
    ],
  },
  ACCESS_CHANGE: {
    titles: ['Role updated', 'Permission granted', 'API key rotated', 'Account locked'],
    bodies: [
      'Your role has been updated from Developer to Senior Developer. New permissions are now active.',
      'You have been granted admin access to the billing module. This access expires in 30 days.',
      'Your production API key has been automatically rotated. Update your integrations with the new key.',
      'Your account has been locked after 5 consecutive failed login attempts. Contact support to unlock.',
    ],
  },
  DATA_EXPORT: {
    titles: ['Export ready', 'Export failed', 'Scheduled export completed', 'Large export warning'],
    bodies: [
      'Your Q3 analytics export (45,230 records, 12.4 MB) is ready for download. Available for 7 days.',
      'Export job #EXP-8847 failed due to a timeout. The dataset exceeds the 50,000 record limit. Try with filters.',
      'Your weekly scheduled export to Google Sheets completed successfully. 8,920 records updated.',
      'Your export request contains 150,000 records and may take up to 15 minutes. You will be notified when ready.',
    ],
  },
  INCIDENT: {
    titles: ['Incident detected', 'Incident resolved', 'Post-mortem available', 'SLA breach warning'],
    bodies: [
      'Critical incident INC-2024-0847: Authentication service outage affecting US-EAST region. Severity: P1.',
      'Incident INC-2024-0847 has been resolved. Total downtime: 23 minutes. Root cause: Database connection pool exhaustion.',
      'Post-mortem for incident INC-2024-0842 is now available. 5 action items identified for prevention.',
      'SLA breach imminent for ticket TKT-10421. Current response time: 4h 12m. Required: 4h. Priority: HIGH.',
    ],
  },
  MAINTENANCE: {
    titles: ['Maintenance window starting', 'Maintenance completed', 'Maintenance extended', 'Pre-maintenance checklist'],
    bodies: [
      'Scheduled maintenance is starting now. Expected duration: 30 minutes. Some services may be temporarily unavailable.',
      'Scheduled maintenance completed successfully. All services are fully operational. No data loss occurred.',
      'Maintenance window has been extended by 15 minutes due to additional database optimization tasks.',
      'Please review the pre-maintenance checklist and ensure all critical processes are paused before 02:00 UTC.',
    ],
  },
  FEATURE_RELEASE: {
    titles: ['New feature available', 'Feature flag enabled', 'Beta program invitation', 'Feature deprecated'],
    bodies: [
      'Enterprise Audit Log & Activity Timeline is now available in your dashboard. Check out the new compliance features.',
      'The AI Matching feature flag has been enabled for your organization. Users can now access AI-powered opportunity matching.',
      'You have been invited to beta test the Advanced Analytics Dashboard. Click to enable early access.',
      'The legacy Export API v1 will be deprecated on October 1, 2024. Please migrate to v2 API.',
    ],
  },
  TEAM_UPDATE: {
    titles: ['Team member offline', 'New team created', 'Sprint retrospective ready', 'Team milestone reached'],
    bodies: [
      'Rohan Gupta has been offline for 2 hours. Their assigned tickets may need reassignment.',
      'The "Platform Migration" team has been created with 8 members. You have been added as a reviewer.',
      'Sprint 24 retrospective is ready for review. 12 items completed, 3 carried over. Team velocity: 47 points.',
      'Congratulations! Your team has completed 100 opportunities this quarter — a new internal record.',
    ],
  },
};

const TITLES_MAP: Record<string, string[]> = {
  security: ['Priya Sharma', 'Aisha Patel'],
  billing: ['Vikram Singh'],
  system: ['System Bot', 'Meera Iyer'],
  deployment: ['Meera Iyer', 'Arjun Reddy'],
  incident: ['Arjun Reddy', 'System Bot'],
  compliance: ['Aisha Patel'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function pickChannels(): NotificationChannel[] {
  const count = randInt(1, 4);
  const shuffled = [...CHANNELS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateDeliveryAttempts(
  notificationId: string,
  channels: NotificationChannel[],
  finalStatus: NotificationStatus
): DeliveryAttempt[] {
  const attempts: DeliveryAttempt[] = [];
  const createdTime = Date.now() - randInt(0, 86400000 * 7);

  channels.forEach((channel, idx) => {
    const baseTime = createdTime + idx * randInt(100, 3000);
    const statuses: DeliveryAttemptStatus[] = finalStatus === 'FAILED'
      ? ['QUEUED', 'SENT', 'BOUNCED']
      : ['QUEUED', 'SENT', 'DELIVERED'];

    statuses.forEach((status, attemptIdx) => {
      attempts.push({
        id: generateId('del'),
        notificationId,
        channel,
        status,
        attemptedAt: new Date(baseTime + attemptIdx * randInt(500, 5000)).toISOString(),
        completedAt: new Date(baseTime + attemptIdx * randInt(500, 5000) + randInt(100, 2000)).toISOString(),
        errorMessage: status === 'BOUNCED' ? 'Mailbox full' : undefined,
        retryCount: attemptIdx,
        providerMessageId: status !== 'QUEUED' ? `msg_${Math.random().toString(36).slice(2, 14)}` : undefined,
        metadata: { region: pick(['US-EAST', 'EU-WEST', 'AP-SOUTH']), provider: pick(['SendGrid', 'Twilio', 'Firebase']) },
      });
    });
  });

  return attempts;
}

// ─── Mock Data Generators ─────────────────────────────────────────────────────

function generateMockNotification(index: number): Notification {
  const category = pick(CATEGORIES);
  const priority = pick(PRIORITIES);
  const channels = pickChannels();
  const recipient = pick(RECIPIENTS);
  const templates = NOTIFICATION_TEMPLATES[category];
  const title = pick(templates.titles);
  const body = pick(templates.bodies);
  const isUrgent = priority === 'URGENT' || priority === 'CRITICAL';

  const createdMs = Date.now() - Math.random() * 86400000 * 14;
  const status: NotificationStatus = (() => {
    if (isUrgent && Math.random() > 0.3) return pick(['DELIVERED', 'READ']);
    if (Math.random() > 0.8) return 'FAILED';
    if (Math.random() > 0.5) return 'READ';
    if (Math.random() > 0.3) return 'DELIVERED';
    if (Math.random() > 0.1) return 'SENT';
    return 'PENDING';
  })();

  const sentAt = status !== 'PENDING' ? new Date(createdMs + randInt(100, 3000)).toISOString() : undefined;
  const deliveredAt = ['DELIVERED', 'READ'].includes(status) ? new Date(createdMs + randInt(1000, 10000)).toISOString() : undefined;
  const readAt = status === 'READ' ? new Date(createdMs + randInt(10000, 86400000)).toISOString() : undefined;

  const tags = [category.toLowerCase()];
  if (isUrgent) tags.push('urgent');
  if (channels.includes('SLACK')) tags.push('slack-notified');

  return {
    id: generateId('ntf'),
    title,
    body,
    shortBody: body.substring(0, 80) + '...',
    category,
    priority,
    status,
    channels,
    templateId: `tpl_${category.toLowerCase()}`,
    templateName: `${category.replace(/_/g, ' ')} Template`,
    senderId: 'system',
    senderName: 'YuvaHub Platform',
    recipientId: recipient.id,
    recipientName: recipient.name,
    recipientEmail: recipient.email,
    createdAt: new Date(createdMs).toISOString(),
    sentAt,
    deliveredAt,
    readAt,
    expiresAt: new Date(createdMs + 30 * 86400000).toISOString(),
    actionUrl: Math.random() > 0.5 ? '/dashboard' : undefined,
    actionLabel: Math.random() > 0.5 ? 'View Details' : undefined,
    imageUrl: undefined,
    metadata: {
      source: pick(['api', 'webhook', 'scheduler', 'manual']),
      region: pick(['US-EAST', 'EU-WEST', 'AP-SOUTH']),
      traceId: `tr_${Math.random().toString(36).slice(2, 14)}`,
    },
    tags,
    groupKey: `${category}_${recipient.id}`,
    isGrouped: Math.random() > 0.7,
    deliveryAttempts: [],
    readBy: status === 'READ' ? [recipient.id] : [],
    pinned: Math.random() > 0.9,
    snoozedUntil: undefined,
  };
}

function generateMockNotifications(count: number = 150): Notification[] {
  const notifications: Notification[] = [];
  for (let i = 0; i < count; i++) {
    const n = generateMockNotification(i);
    n.deliveryAttempts = generateDeliveryAttempts(n.id, n.channels, n.status);
    notifications.push(n);
  }
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return notifications;
}

function generateMockTemplates(): NotificationTemplate[] {
  const templates: NotificationTemplate[] = [];
  const tplCategories: NotificationCategory[] = ['SECURITY_ALERT', 'BILLING_UPDATE', 'SYSTEM_STATUS', 'DEPLOYMENT', 'INCIDENT', 'COMPLIANCE'];

  tplCategories.forEach((cat, i) => {
    const t = NOTIFICATION_TEMPLATES[cat];
    templates.push({
      id: `tpl_${cat.toLowerCase()}`,
      name: `${cat.replace(/_/g, ' ')} Template`,
      description: `Automated notification template for ${cat.replace(/_/g, ' ').toLowerCase()} events`,
      category: cat,
      defaultPriority: cat === 'INCIDENT' || cat === 'SECURITY_ALERT' ? 'CRITICAL' : 'MEDIUM',
      channels: ['EMAIL', 'IN_APP', 'PUSH'],
      subject: t.titles[0],
      titleTemplate: `{{${cat.toLowerCase()}_title}}`,
      bodyTemplate: t.bodies[0],
      shortTemplate: `{{${cat.toLowerCase()}_short}}`,
      variables: [
        { name: 'actor_name', type: 'string', required: true, description: 'Name of the user who triggered the event' },
        { name: 'timestamp', type: 'date', required: true, description: 'Event timestamp in ISO format' },
        { name: 'action_url', type: 'url', required: false, description: 'Deep link to the related resource' },
      ],
      isActive: true,
      version: randInt(1, 5),
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 90).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      usageCount: randInt(50, 5000),
      lastUsedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    });
  });

  return templates;
}

function generateChannelPreferences(): ChannelPreferences[] {
  return CHANNELS.map(ch => ({
    channel: ch,
    enabled: ch !== 'TEAMS' && ch !== 'WEBHOOK',
    categories: CATEGORIES.map(cat => ({
      category: cat,
      enabled: Math.random() > 0.3,
      minPriority: pick(['LOW', 'MEDIUM', 'HIGH'] as const),
    })),
    digestFrequency: pick(['REALTIME', 'HOURLY', 'DAILY', 'WEEKLY'] as const),
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    quietHoursTimezone: 'Asia/Kolkata',
    webhookUrl: ch === 'WEBHOOK' ? 'https://hooks.yuvaHub.io/notifications' : undefined,
    emailAddress: ch === 'EMAIL' ? 'admin@yuvaHub.io' : undefined,
    phoneNumber: ch === 'SMS' ? '+91-98765-43210' : undefined,
    slackChannel: ch === 'SLACK' ? '#enterprise-alerts' : undefined,
    lastConfiguredAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
  }));
}

function generateMockRules(): NotificationRule[] {
  const rules: NotificationRule[] = [
    {
      id: 'rule_001', name: 'Critical Security Escalation',
      description: 'Immediately notify all admins for critical security alerts via email and SMS',
      triggerCategory: 'SECURITY_ALERT', triggerPriority: 'CRITICAL',
      conditions: [{ field: 'category', operator: 'equals', value: 'SECURITY_ALERT' }, { field: 'priority', operator: 'in', value: ['CRITICAL', 'URGENT'] }],
      actions: [{ type: 'SEND_EMAIL', target: 'admin@yuvaHub.io' }, { type: 'SEND_SMS', target: '+91-98765-43210' }, { type: 'ESCALATE', delay: 300 }],
      isActive: true, cooldownMinutes: 5, lastTriggeredAt: new Date(Date.now() - 3600000).toISOString(), triggerCount: 47,
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(), createdBy: 'Priya Sharma',
    },
    {
      id: 'rule_002', name: 'Incident Slack Notification',
      description: 'Post all incident notifications to the #incidents Slack channel',
      triggerCategory: 'INCIDENT', triggerPriority: 'HIGH',
      conditions: [{ field: 'category', operator: 'equals', value: 'INCIDENT' }],
      actions: [{ type: 'POST_WEBHOOK', target: 'https://hooks.slack.com/services/T00/B00/xxx' }],
      isActive: true, cooldownMinutes: 1, lastTriggeredAt: new Date(Date.now() - 7200000).toISOString(), triggerCount: 128,
      createdAt: new Date(Date.now() - 86400000 * 45).toISOString(), createdBy: 'Meera Iyer',
    },
    {
      id: 'rule_003', name: 'Billing Digest Grouping',
      description: 'Group billing notifications and send a daily digest',
      triggerCategory: 'BILLING_UPDATE', triggerPriority: 'LOW',
      conditions: [{ field: 'category', operator: 'equals', value: 'BILLING_UPDATE' }],
      actions: [{ type: 'GROUP' }, { type: 'SEND_EMAIL', delay: 86400 }],
      isActive: true, cooldownMinutes: 1440, triggerCount: 34,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), createdBy: 'Vikram Singh',
    },
  ];
  return rules;
}

// ─── Service Class ────────────────────────────────────────────────────────────

export class NotificationService {
  private static cachedNotifications: Notification[] | null = null;
  private static cachedTemplates: NotificationTemplate[] | null = null;

  static async getNotifications(filters?: Partial<NotificationFilterState>): Promise<Notification[]> {
    await new Promise(r => setTimeout(r, 600));
    if (!this.cachedNotifications) this.cachedNotifications = generateMockNotifications(150);
    let result = [...this.cachedNotifications];

    if (filters) {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        result = result.filter(n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || n.recipientName.toLowerCase().includes(q));
      }
      if (filters.categories && filters.categories.length > 0) {
        result = result.filter(n => filters.categories!.includes(n.category));
      }
      if (filters.priorities && filters.priorities.length > 0) {
        result = result.filter(n => filters.priorities!.includes(n.priority));
      }
      if (filters.channels && filters.channels.length > 0) {
        result = result.filter(n => n.channels.some(c => filters.channels!.includes(c)));
      }
      if (filters.statuses && filters.statuses.length > 0) {
        result = result.filter(n => filters.statuses!.includes(n.status));
      }
      if (filters.showUnreadOnly) {
        result = result.filter(n => n.status !== 'READ');
      }
      if (filters.dateRange) {
        const rangeMs: Record<string, number> = { '1H': 3600000, '6H': 21600000, '24H': 86400000, '7D': 604800000, '30D': 2592000000 };
        const cutoff = Date.now() - (rangeMs[filters.dateRange] || 86400000);
        result = result.filter(n => new Date(n.createdAt).getTime() >= cutoff);
      }
      const sortMode = filters.sortBy || 'newest';
      if (sortMode === 'newest') result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      else if (sortMode === 'oldest') result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      else if (sortMode === 'priority') {
        const pOrder: Record<string, number> = { URGENT: 0, CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
        result.sort((a, b) => (pOrder[a.priority] || 5) - (pOrder[b.priority] || 5));
      } else if (sortMode === 'unread') {
        result.sort((a, b) => (a.status === 'READ' ? 1 : 0) - (b.status === 'READ' ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }
    return result;
  }

  static async getGroupedNotifications(filters?: Partial<NotificationFilterState>): Promise<NotificationGroup[]> {
    const notifications = await this.getNotifications(filters);
    const groupMap = new Map<string, NotificationGroup>();

    notifications.forEach(n => {
      const key = n.groupKey || n.id;
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          groupKey: key,
          category: n.category,
          title: n.title,
          count: 0,
          latestNotification: n,
          oldestAt: n.createdAt,
          latestAt: n.createdAt,
          unreadCount: 0,
          notifications: [],
        });
      }
      const g = groupMap.get(key)!;
      g.count++;
      g.notifications.push(n);
      g.unreadCount += n.status !== 'READ' ? 1 : 0;
      if (new Date(n.createdAt).getTime() < new Date(g.oldestAt).getTime()) g.oldestAt = n.createdAt;
      if (new Date(n.createdAt).getTime() > new Date(g.latestAt).getTime()) g.latestAt = n.createdAt;
    });

    return Array.from(groupMap.values()).sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime());
  }

  static async getMetrics(): Promise<NotificationMetrics> {
    await new Promise(r => setTimeout(r, 500));
    const notifications = this.cachedNotifications || generateMockNotifications(150);

    const totalSent = notifications.filter(n => n.status !== 'PENDING' && n.status !== 'CANCELLED').length;
    const totalDelivered = notifications.filter(n => ['DELIVERED', 'READ'].includes(n.status)).length;
    const totalRead = notifications.filter(n => n.status === 'READ').length;
    const totalFailed = notifications.filter(n => n.status === 'FAILED').length;

    const channelBreakdown: ChannelDeliveryStats[] = CHANNELS.map(ch => {
      const chNotifs = notifications.filter(n => n.channels.includes(ch));
      return {
        channel: ch,
        sent: chNotifs.filter(n => n.sentAt).length,
        delivered: chNotifs.filter(n => ['DELIVERED', 'READ'].includes(n.status)).length,
        failed: chNotifs.filter(n => n.status === 'FAILED').length,
        read: chNotifs.filter(n => n.status === 'READ').length,
        avgDeliveryTimeMs: randInt(200, 3000),
        bounceRate: Math.round(Math.random() * 5 * 10) / 10,
      };
    });

    const categoryCounts: Record<string, number> = {};
    notifications.forEach(n => { categoryCounts[n.category] = (categoryCounts[n.category] || 0) + 1; });
    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category: category as NotificationCategory, count, percentage: Math.round((count / notifications.length) * 100) }))
      .sort((a, b) => b.count - a.count);

    const hourlyTrend = Array.from({ length: 24 }, (_, hour) => {
      const hourNotifs = notifications.filter(n => new Date(n.createdAt).getHours() === hour);
      return {
        hour,
        sent: hourNotifs.filter(n => n.sentAt).length,
        delivered: hourNotifs.filter(n => ['DELIVERED', 'READ'].includes(n.status)).length,
        failed: hourNotifs.filter(n => n.status === 'FAILED').length,
      };
    });

    const dailyTrend = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(Date.now() - (13 - i) * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const dayNotifs = notifications.filter(n => n.createdAt.startsWith(dateStr));
      return {
        date: dateStr,
        sent: dayNotifs.length,
        read: dayNotifs.filter(n => n.status === 'READ').length,
      };
    });

    const recipientCounts: Record<string, { name: string; email: string; count: number; readCount: number }> = {};
    notifications.forEach(n => {
      if (!recipientCounts[n.recipientId]) recipientCounts[n.recipientId] = { name: n.recipientName, email: n.recipientEmail, count: 0, readCount: 0 };
      recipientCounts[n.recipientId].count++;
      if (n.status === 'READ') recipientCounts[n.recipientId].readCount++;
    });
    const topRecipients = Object.values(recipientCounts)
      .map(r => ({ name: r.name, email: r.email, received: r.count, readRate: r.count > 0 ? Math.round((r.readCount / r.count) * 100) : 0 }))
      .sort((a, b) => b.received - a.received)
      .slice(0, 5);

    const priorityCounts: Record<string, number> = {};
    notifications.forEach(n => { priorityCounts[n.priority] = (priorityCounts[n.priority] || 0) + 1; });
    const priorityBreakdown = PRIORITIES.map(p => ({ priority: p, count: priorityCounts[p] || 0 }));

    return {
      totalSent,
      totalDelivered,
      totalRead,
      totalFailed,
      deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0,
      readRate: totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0,
      avgDeliveryTimeMs: randInt(200, 2000),
      avgReadTimeMinutes: randInt(5, 120),
      channelBreakdown,
      categoryBreakdown,
      hourlyTrend,
      dailyTrend,
      topRecipients,
      priorityBreakdown,
    };
  }

  static async getTemplates(): Promise<NotificationTemplate[]> {
    await new Promise(r => setTimeout(r, 400));
    if (!this.cachedTemplates) this.cachedTemplates = generateMockTemplates();
    return this.cachedTemplates;
  }

  static async getChannelPreferences(): Promise<ChannelPreferences[]> {
    await new Promise(r => setTimeout(r, 400));
    return generateChannelPreferences();
  }

  static async getRules(): Promise<NotificationRule[]> {
    await new Promise(r => setTimeout(r, 350));
    return generateMockRules();
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await new Promise(r => setTimeout(r, 200));
    if (this.cachedNotifications) {
      this.cachedNotifications = this.cachedNotifications.map(n =>
        n.id === notificationId ? { ...n, status: 'READ' as NotificationStatus, readAt: new Date().toISOString() } : n
      );
    }
  }

  static async markAllAsRead(): Promise<void> {
    await new Promise(r => setTimeout(r, 400));
    if (this.cachedNotifications) {
      this.cachedNotifications = this.cachedNotifications.map(n =>
        n.status !== 'READ' ? { ...n, status: 'READ' as NotificationStatus, readAt: new Date().toISOString() } : n
      );
    }
  }

  static async togglePin(notificationId: string): Promise<void> {
    await new Promise(r => setTimeout(r, 200));
    if (this.cachedNotifications) {
      this.cachedNotifications = this.cachedNotifications.map(n =>
        n.id === notificationId ? { ...n, pinned: !n.pinned } : n
      );
    }
  }
}
