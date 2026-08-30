import React, { useState, useEffect } from 'react';
import { SupportTicket, IncidentMetrics } from '../../types/incidents';
import { SupportTicketService } from '../../services/SupportTicketService';
import { SlaMetrics } from '../../components/Enterprise/SlaMetrics';
import { TicketDetailModal } from '../../components/Enterprise/TicketDetailModal';
import { LifeBuoy, Search, Filter, AlertTriangle, ArrowUpRight } from 'lucide-react';

export const IncidentBoard: React.FC = () => {
    const [metrics, setMetrics] = useState<IncidentMetrics | null>(null);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

    useEffect(() => {
        const fetchCore = async () => {
            const data = await SupportTicketService.getMetrics();
            setMetrics(data);
        };
        fetchCore();
    }, []);

    useEffect(() => {
        const fetchTickets = async () => {
            setIsLoading(true);
            const data = await SupportTicketService.getTickets(statusFilter);
            let filtered = data;
            if (searchQuery) {
                filtered = filtered.filter(t =>
                    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.id.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            setTickets(filtered);
            setIsLoading(false);
        };

        const debounce = setTimeout(fetchTickets, 300);
        return () => clearTimeout(debounce);
    }, [statusFilter, searchQuery]);

    const handleTicketUpdate = (updated: SupportTicket) => {
        setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
        setSelectedTicket(updated);
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'CRITICAL': return 'bg-red-500/200/20 text-red-400 border-red-500/30';
            case 'HIGH': return 'bg-orange-500/200/20 text-orange-400 border-orange-500/30';
            case 'MEDIUM': return 'bg-amber-500/200/20 text-amber-400 border-amber-500/30';
            case 'LOW': return 'bg-blue-500/200/20 text-blue-400 border-blue-500/30';
            default: return 'bg-surface-secondary text-text-primary border-border-theme';
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'RESOLVED': return 'bg-emerald-500/200/20 text-emerald-400 border-emerald-500/30';
            case 'CLOSED': return 'bg-surface-secondary text-text-secondary border-border-theme';
            case 'NEW': return 'bg-indigo-500/200/20 text-indigo-400 border-indigo-500/30';
            default: return 'bg-amber-500/200/20 text-amber-400 border-amber-500/30';
        }
    };

    return (
        <div className="min-h-screen bg-surface/50 p-6 lg:p-10 font-sans">
            <div className="max-w-[1400px] mx-auto space-y-8">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-500/200/20 text-indigo-800 text-xs font-black uppercase tracking-widest mb-3 border border-indigo-500/30">
                            <LifeBuoy className="h-3.5 w-3.5" /> Support Central
                        </div>
                        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Incident Management Board</h1>
                        <p className="text-sm text-text-muted mt-2 max-w-xl">Respond to customer issues, manage SLA priorities, and track platform health.</p>
                    </div>

                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg">
                        Create Manual Ticket
                    </button>
                </header>

                <SlaMetrics metrics={metrics} />

                <div className="bg-surface rounded-2xl border border-border-theme shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                    <div className="p-4 border-b border-border-theme bg-surface/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search ticket ID or subject..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm font-medium bg-surface border border-border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Filter className="h-4 w-4 text-text-muted" />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium bg-surface border border-border-theme rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                            >
                                <option value="ALL">All Tickets</option>
                                <option value="NEW">New</option>
                                <option value="OPEN">Open</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        {isLoading ? (
                            <div className="p-12 flex justify-center">
                                <div className="animate-spin h-8 w-8 border-4 border-border-theme border-t-indigo-600 rounded-full" />
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="p-24 text-center">
                                <h3 className="text-lg font-bold text-text-primary">No tickets found</h3>
                                <p className="text-text-muted mt-2">Adjust your search or filter settings to find tickets.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-surface border-b border-border-theme">
                                    <tr className="text-xs font-bold text-text-muted uppercase tracking-wide">
                                        <th className="px-6 py-4">Ticket</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Priority</th>
                                        <th className="px-6 py-4">Requester</th>
                                        <th className="px-6 py-4">Updated</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {tickets.map(ticket => (
                                        <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} className="hover:bg-surface cursor-pointer group transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-text-primary group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                                                        {ticket.title}
                                                        {ticket.slaBreached && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                                    </span>
                                                    <span className="text-xs text-text-muted mt-0.5">{ticket.id} • {ticket.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-text-primary">{ticket.requesterName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-text-muted">{new Date(ticket.updatedAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 rounded-lg text-text-muted hover:text-indigo-400 hover:bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-all">
                                                    <ArrowUpRight className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>

            <TicketDetailModal
                ticket={selectedTicket}
                isOpen={selectedTicket !== null}
                onClose={() => setSelectedTicket(null)}
                onTicketUpdated={handleTicketUpdate}
            />
        </div>
    );
};

export default IncidentBoard;
