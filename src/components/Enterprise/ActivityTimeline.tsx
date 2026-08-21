import React from 'react';
import { AuditLogEntry } from '../../types/enterpriseAnalytics';
import {
    Activity, FileText, Settings, User, Shield, LogIn, ExternalLink,
    CheckCircle2, AlertCircle, XCircle
} from 'lucide-react';

interface ActivityTimelineProps {
    logs: AuditLogEntry[];
    isLoading: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ logs, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-full h-96 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-sm border border-slate-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!logs.length) {
        return (
            <div className="w-full p-8 flex flex-col items-center justify-center rounded-xl bg-slate-50/50 backdrop-blur-sm border border-slate-100">
                <Activity className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-700">No activities found</h3>
                <p className="text-sm text-slate-500 text-center max-w-sm mt-2">
                    Adjust your filters or search query to find previous audit logs.
                </p>
            </div>
        );
    }

    const getActionIcon = (action: AuditLogEntry['action']) => {
        switch (action) {
            case 'CREATE': return <FileText className="h-5 w-5 text-emerald-500" />;
            case 'READ': return <ExternalLink className="h-5 w-5 text-blue-500" />;
            case 'UPDATE': return <Settings className="h-5 w-5 text-amber-500" />;
            case 'DELETE': return <XCircle className="h-5 w-5 text-red-500" />;
            case 'EXPORT': return <FileText className="h-5 w-5 text-purple-500" />;
            case 'LOGIN': return <LogIn className="h-5 w-5 text-blue-400" />;
            case 'SYSTEM_ALERT': return <AlertCircle className="h-5 w-5 text-orange-500" />;
            default: return <Activity className="h-5 w-5 text-slate-500" />;
        }
    };

    const getResourceIcon = (resource: AuditLogEntry['resourceType']) => {
        switch (resource) {
            case 'User': return <User className="h-4 w-4" />;
            case 'Security': return <Shield className="h-4 w-4" />;
            case 'Settings': return <Settings className="h-4 w-4" />;
            case 'Integration': return <ExternalLink className="h-4 w-4" />;
            case 'Report': return <FileText className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const getStatusIndicator = (status: AuditLogEntry['status']) => {
        switch (status) {
            case 'SUCCESS': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'WARNING': return <AlertCircle className="h-4 w-4 text-amber-500" />;
            case 'ERROR': return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    return (
        <div className="w-full bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-white/50">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600" />
                    Enterprise Audit Logs
                </h2>
            </div>

            <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                    {logs.map((log, index) => (
                        <div key={log.id} className="relative pl-8 group">
                            <div className="absolute -left-[21px] p-2 bg-white rounded-full border-2 border-slate-100 group-hover:border-indigo-200 transition-colors">
                                {getActionIcon(log.action)}
                            </div>

                            <div className="bg-white/80 hover:bg-white rounded-xl p-4 shadow-sm border border-slate-100/50 transition-all hover:shadow-md group-hover:-translate-y-0.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        {log.userAvatar ? (
                                            <img src={log.userAvatar} alt={log.userName} className="h-10 w-10 rounded-full border border-slate-200" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold border border-indigo-100">
                                                {log.userName.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{log.userName}</p>
                                            <p className="text-xs text-slate-500">{log.id} • {log.ipAddress}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                                        {getResourceIcon(log.resourceType)}
                                        {log.resourceType}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-start justify-between gap-4">
                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                        {log.description}
                                    </p>
                                    <div className="mt-1 flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded text-xs font-semibold">
                                        {getStatusIndicator(log.status)}
                                        <span className={
                                            log.status === 'ERROR' ? 'text-red-700' :
                                                log.status === 'WARNING' ? 'text-amber-700' : 'text-emerald-700'
                                        }>{log.status}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                    {log.metadata && (
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                            {log.metadata.browser as string}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
