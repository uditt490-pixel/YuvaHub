import React, { useState, useEffect } from 'react';
import { ComplianceFramework, SecurityVulnerability, ComplianceOverview, Framework } from '../../types/compliance';
import { ComplianceService } from '../../services/ComplianceService';
import { RegulationMetrics } from '../../components/Enterprise/RegulationMetrics';
import { AuditReportGenerator } from '../../components/Enterprise/AuditReportGenerator';
import { ShieldCheck, AlertOctagon, Terminal, Activity, FileCheck2, Filter, AlertTriangle } from 'lucide-react';

export const ComplianceDashboard: React.FC = () => {
    const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
    const [overview, setOverview] = useState<ComplianceOverview | null>(null);
    const [vulns, setVulns] = useState<SecurityVulnerability[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<Framework | 'ALL'>('ALL');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [fws, ovw] = await Promise.all([
                ComplianceService.getFrameworks(),
                ComplianceService.getOverview()
            ]);
            setFrameworks(fws);
            setOverview(ovw);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchVulns = async () => {
            const v = await ComplianceService.getVulnerabilities(activeFilter === 'ALL' ? undefined : activeFilter);
            setVulns(v);
        };
        fetchVulns();
    }, [activeFilter]);

    const getSeverityBadge = (sev: SecurityVulnerability['severity']) => {
        switch (sev) {
            case 'CRITICAL': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/200/20 text-red-400 border border-red-500/30">CRITICAL</span>;
            case 'HIGH': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/200/20 text-orange-400 border border-orange-500/30">HIGH</span>;
            case 'MEDIUM': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/200/20 text-amber-400 border border-amber-500/30">MED</span>;
            case 'LOW': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/200/20 text-blue-400 border border-blue-500/30">LOW</span>;
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-indigo-900 text-indigo-100 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5" /> GRC Hub
                            </span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight">Compliance & Reporting</h1>
                        <p className="text-text-muted mt-2 max-w-2xl text-sm">Monitor continuous compliance postures, manage vulnerability remediation, and generate automated auditor reports.</p>
                    </div>
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all"
                    >
                        <FileCheck2 className="h-4 w-4" /> Generate Audit Report
                    </button>
                </header>

                {/* Global Overview Section */}
                {overview && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-surface rounded-2xl border border-border-theme shadow-sm">
                        <div>
                            <div className="text-sm font-semibold text-text-muted">Avg Compliance Score</div>
                            <div className="text-3xl font-black text-text-primary mt-1">{overview.averageScore}%</div>
                        </div>
                        <div className="border-l border-border-theme justify-self-center px-4 w-full">
                            <div className="text-sm font-semibold text-text-muted">Tracked Frameworks</div>
                            <div className="text-3xl font-black text-indigo-400 mt-1">{overview.activeFrameworks}</div>
                        </div>
                        <div className="border-l border-border-theme justify-self-center px-4 w-full">
                            <div className="text-sm font-semibold text-text-muted">Critical Open Issues</div>
                            <div className="text-3xl font-black text-red-400 mt-1 flex items-center gap-2">
                                {overview.openCriticalIssues}
                                {overview.openCriticalIssues > 0 && <AlertTriangle className="h-5 w-5" />}
                            </div>
                        </div>
                        <div className="border-l border-border-theme justify-self-center px-4 w-full">
                            <div className="text-sm font-semibold text-text-muted">Days to External Audit</div>
                            <div className="text-3xl font-black text-amber-400 mt-1">{overview.daysUntilNextAudit}</div>
                        </div>
                    </div>
                )}

                {/* Dynamic Regulation Metrics */}
                <div>
                    <h2 className="text-lg font-bold text-text-primary mb-4 px-1">Continuous Framework Posture</h2>
                    <RegulationMetrics frameworks={frameworks} isLoading={isLoading} />
                </div>

                {/* Vulnerability Tracking Board */}
                <div className="bg-surface rounded-2xl border border-border-theme shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-border-theme bg-surface/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                            <AlertOctagon className="h-5 w-5 text-red-500" />
                            Active System Vulnerabilities
                        </h3>

                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-text-muted" />
                            <select
                                className="text-sm px-3 py-1.5 border border-border-theme rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                                value={activeFilter}
                                onChange={(e) => setActiveFilter(e.target.value as any)}
                            >
                                <option value="ALL">All Frameworks (Impacted)</option>
                                {frameworks.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {vulns.length === 0 ? (
                            <div className="p-12 text-center text-text-muted flex flex-col items-center">
                                <ShieldCheck className="h-10 w-10 text-emerald-400 mb-3" />
                                <h4 className="font-semibold text-text-primary text-lg border-b-0">System Secure</h4>
                                <p className="text-sm max-w-sm mt-1">No outstanding vulnerabilities affect the selected compliance frameworks.</p>
                            </div>
                        ) : vulns.map(v => (
                            <div key={v.id} className="p-6 hover:bg-surface transition-colors flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-3">
                                        {getSeverityBadge(v.severity)}
                                        <h4 className="font-bold text-text-primary">{v.title}</h4>
                                    </div>
                                    <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">{v.description}</p>
                                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-2">
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                                            <Terminal className="h-3.5 w-3.5" /> {v.resourceId}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                                            <Activity className="h-3.5 w-3.5" /> Detected: {new Date(v.detectedAt).toLocaleDateString()}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <div className="flex gap-1.5">
                                            {v.frameworksAffected.map(f => (
                                                <span key={f} className="px-2 py-0.5 rounded-full bg-surface-secondary text-text-secondary text-[10px] font-bold border border-border-theme">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center lg:flex-col lg:items-end justify-between gap-3 min-w-[150px]">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${v.status === 'OPEN' ? 'bg-red-500/20 text-red-400 border-red-500/30' : v.status === 'IN_REVIEW' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                                        {v.status.replace('_', ' ')}
                                    </span>
                                    {v.assignedTo && <span className="text-xs text-text-muted font-medium whitespace-nowrap">Assigned: <span className="text-text-primary">{v.assignedTo}</span></span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <AuditReportGenerator
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                availableFrameworks={frameworks.map(f => f.name)}
            />
        </div>
    );
};

export default ComplianceDashboard;
