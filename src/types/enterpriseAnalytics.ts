export interface AnalyticsMetric {
  id: string;
  category: 'engagement' | 'revenue' | 'retention' | 'system';
  label: string;
  value: number;
  previousValue: number;
  trend: 'up' | 'down' | 'neutral';
  percentageChange: number;
  lastUpdated: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'SYSTEM_ALERT';
  resourceType: 'Report' | 'User' | 'Settings' | 'Integration' | 'Security';
  resourceId?: string;
  description: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export interface FilterState {
  dateRange: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';
  searchQuery: string;
  actionTypes: AuditLogEntry['action'][];
  statusFilter: AuditLogEntry['status'] | 'ALL';
  categories: AnalyticsMetric['category'][];
}

export interface DashboardContextState {
  metrics: AnalyticsMetric[];
  auditLogs: AuditLogEntry[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  totalLogs: number;
  currentPage: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ExportConfig {
  format: 'csv' | 'pdf' | 'json';
  includeMetadata: boolean;
  dateRange: FilterState['dateRange'];
}

export type ModalState = 'NONE' | 'EXPORT' | 'FILTER' | 'DETAILS';

export interface ActionModalProps {
  isOpen: boolean;
  type: ModalState;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}
