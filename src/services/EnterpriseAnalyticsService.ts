import { AnalyticsMetric, AuditLogEntry, FilterState, PaginationParams } from '../types/enterpriseAnalytics';

/**
 * EnterpriseAnalyticsService responsible for managing data retrieval,
 * mock generation (for demonstration of high-throughput dashboards),
 * and complex multidimensional filtering.
 */
export class EnterpriseAnalyticsService {
    private static MOCK_USERS = [
        { id: 'u1', name: 'Alice Enterprise', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
        { id: 'u2', name: 'Bob Systems', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
        { id: 'u3', name: 'Charlie Ops', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
        { id: 'u4', name: 'Diana Security', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d' },
    ];

    private static MOCK_ACTIONS: AuditLogEntry['action'][] = ['CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN', 'SYSTEM_ALERT'];
    private static MOCK_RESOURCES: AuditLogEntry['resourceType'][] = ['Report', 'User', 'Settings', 'Integration', 'Security'];

    /**
     * Generates a deterministic-looking but randomized set of analytics metrics.
     */
    public static async getMetrics(filters: FilterState): Promise<AnalyticsMetric[]> {
        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Base metrics to generate
        const baseMetrics = [
            { id: 'm1', label: 'Active Enterprise Users', category: 'engagement' as const, baseVal: 14500, range: 2000 },
            { id: 'm2', label: 'Monthly Recurring Revenue', category: 'revenue' as const, baseVal: 450000, range: 50000 },
            { id: 'm3', label: 'System Uptime (%)', category: 'system' as const, baseVal: 99.9, range: 0.05 },
            { id: 'm4', label: 'Security Threats Blocked', category: 'system' as const, baseVal: 843, range: 300 },
            { id: 'm5', label: 'API Requests / Min', category: 'engagement' as const, baseVal: 12050, range: 5000 },
            { id: 'm6', label: 'User Retention (%)', category: 'retention' as const, baseVal: 94.2, range: 2.1 },
        ];

        // Filter by categories if specified
        const filteredBase = filters.categories.length > 0
            ? baseMetrics.filter(m => filters.categories.includes(m.category))
            : baseMetrics;

        return filteredBase.map(m => {
            const modifier = (Math.random() - 0.5) * m.range;
            const currentValue = m.baseVal + modifier;
            const previousValue = m.baseVal;
            const percentageChange = ((currentValue - previousValue) / previousValue) * 100;

            return {
                id: m.id,
                category: m.category,
                label: m.label,
                value: Number(currentValue.toFixed(m.category === 'revenue' || currentValue > 100 ? 0 : 2)),
                previousValue: Number(previousValue.toFixed(m.category === 'revenue' || previousValue > 100 ? 0 : 2)),
                trend: percentageChange > 0.5 ? 'up' : percentageChange < -0.5 ? 'down' : 'neutral',
                percentageChange: Number(Math.abs(percentageChange).toFixed(2)),
                lastUpdated: new Date().toISOString(),
            };
        });
    }

    /**
     * Generates a large dataset of audit logs and filters them based on complex criteria.
     */
    public static async getAuditLogs(
        filters: FilterState,
        pagination: PaginationParams = { page: 1, limit: 50 }
    ): Promise<{ data: AuditLogEntry[]; total: number }> {
        // Generate a pool of 500 mock logs for testing complex filtering 
        const allLogs = Array.from({ length: 500 }).map((_, i) => this.generateRawLog(i));

        // Simulate latency
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Apply Filters
        let filteredLogs = allLogs;

        // 1. Search Query (matches description, user name, or ID)
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filteredLogs = filteredLogs.filter(log =>
                log.description.toLowerCase().includes(query) ||
                log.userName.toLowerCase().includes(query) ||
                log.id.toLowerCase().includes(query)
            );
        }

        // 2. Action Types
        if (filters.actionTypes.length > 0) {
            filteredLogs = filteredLogs.filter(log => filters.actionTypes.includes(log.action));
        }

        // 3. Status Filter
        if (filters.statusFilter !== 'ALL') {
            filteredLogs = filteredLogs.filter(log => log.status === filters.statusFilter);
        }

        // 4. Date Range
        const now = new Date();
        const cutoffDate = new Date();
        switch (filters.dateRange) {
            case 'today': cutoffDate.setDate(now.getDate() - 1); break;
            case 'week': cutoffDate.setDate(now.getDate() - 7); break;
            case 'month': cutoffDate.setMonth(now.getMonth() - 1); break;
            case 'quarter': cutoffDate.setMonth(now.getMonth() - 3); break;
            case 'year': cutoffDate.setFullYear(now.getFullYear() - 1); break;
            default: cutoffDate.setFullYear(2000); // effectively all
        }

        if (filters.dateRange !== 'all') {
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= cutoffDate);
        }

        // Sort by timestamp descending
        filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Paginate
        const startIndex = (pagination.page - 1) * pagination.limit;
        const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pagination.limit);

        return {
            data: paginatedLogs,
            total: filteredLogs.length,
        };
    }

    private static generateRawLog(index: number): AuditLogEntry {
        const user = this.MOCK_USERS[Math.floor(Math.random() * this.MOCK_USERS.length)];
        const action = this.MOCK_ACTIONS[Math.floor(Math.random() * this.MOCK_ACTIONS.length)];
        const resource = this.MOCK_RESOURCES[Math.floor(Math.random() * this.MOCK_RESOURCES.length)];

        // Status distribution: mostly success, some warnings, few errors
        const statusRand = Math.random();
        const status: AuditLogEntry['status'] = statusRand > 0.95 ? 'ERROR' : statusRand > 0.85 ? 'WARNING' : 'SUCCESS';

        // Spread timestamps over the last 90 days deterministically
        const daysAgo = Math.floor(Math.random() * 90);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

        return {
            id: `adt_${index.toString().padStart(6, '0')}_${date.getTime().toString().slice(-4)}`,
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            action,
            resourceType: resource,
            resourceId: `res_${Math.floor(Math.random() * 10000)}`,
            description: `User ${user.name} executed ${action} on ${resource} entity.`,
            timestamp: date.toISOString(),
            status,
            ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            metadata: { browser: 'Chrome Enterprise', location: 'Internal Network' }
        };
    }

    public static async executeExport(config: ExportConfig): Promise<Blob> {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const sampleData = `Export generated with format ${config.format} and full metadata ${config.includeMetadata}.`;
        return new Blob([sampleData], { type: 'text/plain' });
    }
}
