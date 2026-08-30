import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';

interface Issue {
    type: 'accessibility' | 'seo';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
    resolved: boolean;
}

interface AuditReportModalProps {
    contentId: string;
    contentType: string;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * AuditReportModal displays accessibility and SEO scores, lists issues,
 * and provides one-click resolution actions for content creators.
 */
export const AuditReportModal: React.FC<AuditReportModalProps> = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            // Mock fetch
            setTimeout(() => {
                setReport({
                    accessibilityScore: 75,
                    seoScore: 60,
                    status: 'completed',
                    issues: [
                        { type: 'accessibility', severity: 'high', description: 'Image missing alt text', suggestion: 'Add descriptive alt text', resolved: false },
                        { type: 'seo', severity: 'medium', description: 'Title tag too short', suggestion: 'Expand title to 50-60 characters', resolved: false },
                    ]
                });
                setLoading(false);
            }, 800);
        }
    }, [isOpen]);

    const handleResolve = (index: number) => {
        const newIssues = [...report.issues];
        newIssues[index].resolved = true;
        setReport({ ...report, issues: newIssues, accessibilityScore: report.accessibilityScore + 5 });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Content Audit Report</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Analyzing content...</div>
                    ) : report.status === 'completed' ? (
                        <div className="space-y-6">
                            {/* Scores */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Accessibility</p>
                                    <p className={`text-3xl font-bold ${report.accessibilityScore >= 80 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                        {report.accessibilityScore}/100
                                    </p>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 text-center">
                                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">SEO</p>
                                    <p className={`text-3xl font-bold ${report.seoScore >= 80 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                        {report.seoScore}/100
                                    </p>
                                </div>
                            </div>

                            {/* Issues List */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Identified Issues</h3>
                                <div className="space-y-3">
                                    {report.issues.map((issue: Issue, idx: number) => (
                                        <div key={idx} className={`p-4 rounded-lg border flex items-start justify-between ${issue.resolved ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-75' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'}`}>
                                            <div className="flex-1">
                                                <div className="flex items-center mb-1">
                                                    {issue.severity === 'high' && <AlertCircle className="w-4 h-4 text-red-500 mr-2" />}
                                                    {issue.severity === 'medium' && <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />}
                                                    {issue.severity === 'low' && <AlertCircle className="w-4 h-4 text-blue-500 mr-2" />}
                                                    <span className="font-medium text-gray-900 dark:text-white capitalize">{issue.type} ({issue.severity})</span>
                                                    {issue.resolved && <CheckCircle className="w-4 h-4 text-green-500 ml-2" />}
                                                </div>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{issue.description}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 italic">Suggestion: {issue.suggestion}</p>
                                            </div>
                                            {!issue.resolved && (
                                                <button
                                                    onClick={() => handleResolve(idx)}
                                                    className="ml-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors whitespace-nowrap"
                                                >
                                                    Apply Fix
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-red-500">Audit failed. Please try again.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
