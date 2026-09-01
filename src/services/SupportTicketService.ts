import { SupportTicket, IncidentMetrics, TicketMessage } from '../types/incidents';

export class SupportTicketService {
    private static mockMetrics: IncidentMetrics = {
        openTickets: 142,
        averageResolutionTimeHours: 4.2,
        slaComplianceRate: 94.8,
        csatScore: 4.8
    };

    public static async getMetrics(): Promise<IncidentMetrics> {
        await new Promise(r => setTimeout(r, 600));
        return this.mockMetrics;
    }

    public static async getTickets(filterStatus: string = 'ALL', limit: number = 20): Promise<SupportTicket[]> {
        await new Promise(r => setTimeout(r, 850));

        const allTickets: SupportTicket[] = Array.from({ length: 60 }).map((_, i) => {
            const isCritical = i % 15 === 0;
            const isClosed = i % 3 !== 0;

            const created = new Date(Date.now() - Math.random() * 86400000 * 10);

            const messages: TicketMessage[] = [
                {
                    id: `msg_${i}_1`,
                    senderName: 'Jane Customer',
                    senderRole: 'CUSTOMER',
                    body: `I am experiencing an issue with the enterprise login portal giving me an SSO error code ${1000 + i}.`,
                    createdAt: created.toISOString()
                }
            ];

            if (!isClosed) {
                messages.push({
                    id: `msg_${i}_2`,
                    senderName: 'System Bot',
                    senderRole: 'SYSTEM',
                    body: 'Your ticket has been escalated to Tier 2 Technical Support.',
                    createdAt: new Date(created.getTime() + 600000).toISOString()
                });
            }

            return {
                id: `TKT-${10420 + i}`,
                title: isCritical ? 'Complete Outage in EU-CENTRAL' : `Issue regarding SSO Configuration #${1000 + i}`,
                category: isCritical ? 'SECURITY' : 'TECHNICAL',
                priority: isCritical ? 'CRITICAL' : (i % 2 === 0 ? 'MEDIUM' : 'LOW'),
                status: isClosed ? 'RESOLVED' : (i % 5 === 0 ? 'NEW' : 'OPEN'),
                requesterName: 'Jane Customer',
                requesterEmail: 'jane@enterprise.co',
                assignedAgent: isClosed ? 'Mark Support' : undefined,
                createdAt: created.toISOString(),
                updatedAt: new Date(created.getTime() + Math.random() * 86400000).toISOString(),
                slaBreached: isCritical && !isClosed, // Simulating SLA breach dynamically
                messages
            };
        });

        // Sort by latest created
        allTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (filterStatus !== 'ALL') {
            return allTickets.filter(t => t.status === filterStatus).slice(0, limit);
        }

        return allTickets.slice(0, limit);
    }

    public static async addReply(ticketId: string, replyBody: string, isInternal: boolean): Promise<TicketMessage> {
        await new Promise(r => setTimeout(r, 500));
        return {
            id: `repl_${Date.now()}`,
            senderName: 'Current Agent',
            senderRole: 'SUPPORT_AGENT',
            body: replyBody,
            createdAt: new Date().toISOString(),
            isInternalNote: isInternal
        };
    }
}
