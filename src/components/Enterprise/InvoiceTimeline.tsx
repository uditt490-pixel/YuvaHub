import React, { useState } from 'react';
import { InvoiceRecord } from '../../types/billing';
import { FileText, Download, CheckCircle, AlertCircle, Clock, Search, Filter } from 'lucide-react';

interface InvoiceTimelineProps {
    invoices: InvoiceRecord[];
    isLoading: boolean;
    totalRecords: number;
    onPageChange: (offset: number) => void;
}

export const InvoiceTimeline: React.FC<InvoiceTimelineProps> = ({ invoices, isLoading, totalRecords, onPageChange }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        onPageChange((newPage - 1) * limit);
    };

    const getStatusBadge = (status: InvoiceRecord['status']) => {
        switch (status) {
            case 'PAID':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase"><CheckCircle className="h-3.5 w-3.5" /> Paid</span>;
            case 'OVERDUE':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase"><AlertCircle className="h-3.5 w-3.5" /> Overdue</span>;
            case 'PENDING':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase"><Clock className="h-3.5 w-3.5" /> Pending</span>;
            default:
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-text-primary border border-border-theme text-xs font-bold uppercase">{status}</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="w-full bg-surface rounded-2xl border border-border-theme p-8 shadow-sm flex items-center justify-center min-h-[400px]">
                <div className="animate-spin h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full" />
            </div>
        );
    }

    return (
        <div className="w-full bg-surface rounded-2xl border border-border-theme shadow-sm overflow-hidden flex flex-col min-h-[400px]">

            <div className="px-6 py-5 border-b border-border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/50">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-400" /> Invoice History
                </h3>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-theme rounded-lg text-sm text-text-secondary hover:bg-surface transition-colors">
                        <Filter className="h-4 w-4" /> Filter
                    </button>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input type="text" placeholder="Search invoices..." className="pl-9 pr-3 py-1.5 bg-surface border border-border-theme rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64" />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="bg-surface border-b border-border-theme text-sm font-semibold text-text-muted">
                            <th className="px-6 py-4">Invoice #</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Issued On</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                    No invoices found.
                                </td>
                            </tr>
                        ) : invoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-surface/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <span className="font-bold text-text-primary">{inv.id}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(inv.status)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-text-primary">
                                        ${inv.amountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                    {inv.status === 'PAID' && inv.paidAt && (
                                        <div className="text-[10px] text-text-muted mt-1 uppercase font-semibold">
                                            Paid {new Date(inv.paidAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-text-secondary">
                                    {new Date(inv.issuedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-text-secondary">
                                    {new Date(inv.dueDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="inline-flex flex-row items-center justify-center p-2 rounded-lg text-text-muted hover:text-indigo-400 hover:bg-indigo-500/20 transition-all opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100">
                                        <Download className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-4 border-t border-border-theme bg-surface flex items-center justify-between text-sm text-text-secondary">
                <span>Showing {invoices.length > 0 ? ((currentPage - 1) * limit) + 1 : 0} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords} Records</span>
                <div className="flex gap-2">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="px-3 py-1.5 rounded-lg border border-border-theme bg-surface hover:bg-surface disabled:opacity-50 transition-all font-medium"
                    >
                        Prev
                    </button>
                    <button
                        disabled={currentPage * limit >= totalRecords}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="px-3 py-1.5 rounded-lg border border-border-theme bg-surface hover:bg-surface disabled:opacity-50 transition-all font-medium"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};
