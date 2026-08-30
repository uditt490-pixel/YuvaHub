import React, { useState } from 'react';
import { Framework, ReportConfiguration } from '../../types/compliance';
import { ComplianceService } from '../../services/ComplianceService';
import { FileText, X, Check, Calendar, DownloadCloud, Mail } from 'lucide-react';

interface AuditReportGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    availableFrameworks: Framework[];
}

export const AuditReportGenerator: React.FC<AuditReportGeneratorProps> = ({ isOpen, onClose, availableFrameworks }) => {
    const [config, setConfig] = useState<ReportConfiguration>({
        reportName: 'Q3 Enterprise Compliance Audit',
        frameworks: ['SOC2', 'GDPR'],
        dateFrom: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        includeRemediated: true,
        format: 'PDF',
        recipients: []
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [success, setSuccess] = useState(false);
    const [emailInput, setEmailInput] = useState('');

    if (!isOpen) return null;

    const handleToggleFramework = (fw: Framework) => {
        setConfig(prev => ({
            ...prev,
            frameworks: prev.frameworks.includes(fw)
                ? prev.frameworks.filter(f => f !== fw)
                : [...prev.frameworks, fw]
        }));
    };

    const handleAddRecipient = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && emailInput.includes('@')) {
            e.preventDefault();
            if (!config.recipients.includes(emailInput)) {
                setConfig(prev => ({ ...prev, recipients: [...prev.recipients, emailInput] }));
            }
            setEmailInput('');
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await ComplianceService.generateReport(config);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2500);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-primary-blue/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-surface rounded-3xl shadow-2xl max-w-xl w-full border border-border-theme overflow-hidden">
                <div className="px-6 py-4 border-b border-border-theme flex items-center justify-between bg-surface/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/200/20 text-indigo-400 rounded-lg">
                            <FileText className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary">Generate Audit Report</h3>
                    </div>
                    <button onClick={onClose} disabled={isGenerating} className="p-2 rounded-full hover:bg-border-theme text-text-muted transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {success ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/200/20 text-emerald-500 flex items-center justify-center mb-4">
                            <Check className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">Report Dispatched!</h3>
                        <p className="text-text-muted mt-2">The compliance report is being generated and will be sent to the configured recipients shortly.</p>
                    </div>
                ) : (
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Report Title</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={config.reportName}
                                onChange={e => setConfig({ ...config, reportName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Frameworks Included</label>
                            <div className="flex flex-wrap gap-2">
                                {availableFrameworks.map(fw => (
                                    <button
                                        key={fw}
                                        onClick={() => handleToggleFramework(fw)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${config.frameworks.includes(fw)
                                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                : 'bg-surface border-border-theme text-text-secondary hover:border-border-theme'
                                            }`}
                                    >
                                        {fw}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-1.5">Date Range Start</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                                    <input type="date" className="w-full pl-9 pr-3 py-2.5 bg-surface border border-border-theme rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={config.dateFrom} onChange={e => setConfig({ ...config, dateFrom: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-primary mb-1.5">Date Range End</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                                    <input type="date" className="w-full pl-9 pr-3 py-2.5 bg-surface border border-border-theme rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value={config.dateTo} onChange={e => setConfig({ ...config, dateTo: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-1.5">Recipients (Press Enter)</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                                <input
                                    type="email"
                                    placeholder="auditor@company.com"
                                    className="w-full pl-9 pr-3 py-2.5 bg-surface border border-border-theme rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={emailInput}
                                    onChange={e => setEmailInput(e.target.value)}
                                    onKeyDown={handleAddRecipient}
                                />
                            </div>
                            {config.recipients.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {config.recipients.map(email => (
                                        <span key={email} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-100 text-xs font-medium">
                                            {email}
                                            <button className="text-indigo-400 hover:text-indigo-400" onClick={() => setConfig({ ...config, recipients: config.recipients.filter(r => r !== email) })}>
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-border-theme flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-border-theme text-indigo-400 focus:ring-indigo-500 w-4 h-4" checked={config.includeRemediated} onChange={e => setConfig({ ...config, includeRemediated: e.target.checked })} />
                                <span className="text-sm text-text-secondary font-medium">Include closed/remediated items</span>
                            </label>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold rounded-xl text-text-secondary hover:bg-surface-secondary transition-colors">Cancel</button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || config.frameworks.length === 0}
                                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md"
                                >
                                    {isGenerating ? (
                                        <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                                    ) : (
                                        <DownloadCloud className="h-4 w-4" />
                                    )}
                                    {isGenerating ? 'Compiling...' : 'Run Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
