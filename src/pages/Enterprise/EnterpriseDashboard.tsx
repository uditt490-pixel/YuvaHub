import React, { useState, useEffect, useCallback } from 'react';
import {
    FilterState, AnalyticsMetric, AuditLogEntry, DashboardContextState, ModalState
} from '../../types/enterpriseAnalytics';
import { EnterpriseAnalyticsService } from '../../services/EnterpriseAnalyticsService';
import { ActivityTimeline } from '../../components/Enterprise/ActivityTimeline';
import { AnalyticsCard } from '../../components/Enterprise/AnalyticsCard';
import {
    Search, Filter, Download, Calendar,
    ChevronDown, X, ShieldAlert
} from 'lucide-react';

export const EnterpriseDashboard: React.FC = () => {
    const [state, setState] = useState<DashboardContextState>({
        metrics: [],
        auditLogs: [],
        filters: {
            dateRange: 'month',
            searchQuery: '',
            actionTypes: [],
            statusFilter: 'ALL',
            categories: []
        },
        isLoading: true,
        error: null,
        totalLogs: 0,
        currentPage: 1,
        totalPages: 1
    });

    const [modalState, setModalState] = useState<ModalState>('NONE');
    const [isExporting, setIsExporting] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    // Debounced load
    const loadData = useCallback(async () => {
        setState(s => ({ ...s, isLoading: true, error: null }));
        try {
            const [metrics, logsData] = await Promise.all([
                EnterpriseAnalyticsService.getMetrics(state.filters),
                EnterpriseAnalyticsService.getAuditLogs(state.filters, { page: state.currentPage, limit: 15 })
            ]);

            setState(s => ({
                ...s,
                metrics,
                auditLogs: logsData.data,
                totalLogs: logsData.total,
                totalPages: Math.ceil(logsData.total / 15),
                isLoading: false
            }));
        } catch (error) {
            setState(s => ({ ...s, isLoading: false, error: 'Failed to load enterprise data.' }));
        }
    }, [state.filters, state.currentPage]);

    // Initial load and filter change load
    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 300);
        return () => clearTimeout(timer);
    }, [loadData]);

    // Handle Search 
    useEffect(() => {
        const timer = setTimeout(() => {
            setState(s => ({
                ...s,
                currentPage: 1,
                filters: { ...s.filters, searchQuery: searchInput }
            }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleExport = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsExporting(true);
        try {
            const blob = await EnterpriseAnalyticsService.executeExport({
                format: 'csv',
                includeMetadata: true,
                dateRange: state.filters.dateRange
            });
            // Simulate download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `enterprise_audit_${new Date().toISOString()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            setModalState('NONE');
        } catch (err) {
            console.error(err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 rounded-full">
                                Enterprise
                            </span>
                            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded-full flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3" /> System Healthy
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Analytics & Audit Log
                        </h1>
                        <p className="text-slate-500 mt-1">Real-time system telemetry and compliance tracking.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setModalState('FILTER')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm shadow-sm"
                        >
                            <Filter className="h-4 w-4" />
                            Advanced Filters
                        </button>
                        <button
                            onClick={() => setModalState('EXPORT')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 border border-transparent text-white rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all font-medium text-sm shadow-sm"
                        >
                            <Download className="h-4 w-4" />
                            Export Report
                        </button>
                    </div>
                </header>

                {/* Dashboard Metrics Grid */}
                <section>
                    {state.error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                            {state.error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {state.isLoading && !state.metrics.length ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <AnalyticsCard key={`loading-${i}`} isLoading={true} delayIndex={i} metric={{} as any} />
                            ))
                        ) : (
                            state.metrics.map(metric => (
                                <AnalyticsCard key={metric.id} metric={metric} isLoading={false} />
                            ))
                        )}
                    </div>
                </section>

                {/* Complex Search and Timeline Section */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
                    {/* Internal Toolbar */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search audit logs by ID, user, or action..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <select
                                    className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    value={state.filters.statusFilter}
                                    onChange={(e) => setState(s => ({ ...s, filters: { ...s.filters, statusFilter: e.target.value as any } }))}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="SUCCESS">Success Only</option>
                                    <option value="WARNING">Warnings</option>
                                    <option value="ERROR">Errors</option>
                                </select>
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <ActivityTimeline logs={state.auditLogs} isLoading={state.isLoading} />

                        {/* Pagination Controls */}
                        {!state.isLoading && state.totalLogs > 0 && (
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                                <span>Showing {((state.currentPage - 1) * 15) + 1} to {Math.min(state.currentPage * 15, state.totalLogs)} of {state.totalLogs} entries</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={state.currentPage === 1}
                                        onClick={() => setState(s => ({ ...s, currentPage: s.currentPage - 1 }))}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="font-medium px-2">Page {state.currentPage} of {state.totalPages}</span>
                                    <button
                                        disabled={state.currentPage === state.totalPages}
                                        onClick={() => setState(s => ({ ...s, currentPage: s.currentPage + 1 }))}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

            </div>

            {/* Export Action Modal */}
            {modalState === 'EXPORT' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800">Export Audit Report</h3>
                            <button onClick={() => setModalState('NONE')} className="p-1 rounded-md text-slate-400 hover:bg-slate-100 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleExport} className="p-6">
                            <p className="text-sm text-slate-600 mb-6">
                                Compile a detailed compliance report containing telemetry and access logs based on your current filters.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Format</label>
                                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                                        <option value="csv">CSV Spreadsheet</option>
                                        <option value="pdf">PDF Document</option>
                                        <option value="json">JSON Data</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="metadata" defaultChecked className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                                    <label htmlFor="metadata" className="text-sm text-slate-700">Include execution metadata & IP addresses</label>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalState('NONE')}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isExporting}
                                    className="inline-flex flex-row items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isExporting && <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>}
                                    {isExporting ? 'Compiling...' : 'Generate Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnterpriseDashboard;
