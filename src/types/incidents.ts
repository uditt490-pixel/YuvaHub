export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'NEW' | 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'TECHNICAL' | 'BILLING' | 'ONBOARDING' | 'SECURITY' | 'BUG';

export interface SlaPolicy {
    firstResponseMinutes: number;
    resolutionHours: number;
}

export interface TicketMessage {
    id: string;
    senderName: string;
    senderRole: 'CUSTOMER' | 'SUPPORT_AGENT' | 'SYSTEM';
    body: string;
    createdAt: string;
    isInternalNote?: boolean;
}

export interface SupportTicket {
    id: string;
    title: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    requesterName: string;
    requesterEmail: string;
    assignedAgent?: string;
    createdAt: string;
    updatedAt: string;
    slaBreached: boolean;
    messages: TicketMessage[];
}

export interface IncidentMetrics {
    openTickets: number;
    averageResolutionTimeHours: number;
    slaComplianceRate: number;
    csatScore: number;
}
