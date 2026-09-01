import React, { useState } from 'react';
import { SecurityEvent } from '../../types/zeroTrustSecurity';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Globe,
  Terminal,
  AlertTriangle,
  Zap,
  Server,
  User,
  Key,
  CheckCircle2
} from 'lucide-react';

interface SecurityEventDetailModalProps {
  event: SecurityEvent;
  onClose: () => void;
  onQuarantine: (event: SecurityEvent) => void;
}

export const SecurityEventDetailModal: React.FC<SecurityEventDetailModalProps> = ({
  event,
  onClose,
  onQuarantine
}) => {
  const [activeTab, setActiveTab] = useState<'ingress' | 'identity' | 'mitigation'>('ingress');

  const getSeverityBadge = (sev: SecurityEvent['threatSeverity']) => {
    switch (sev) {
      case 'CRITICAL_BREACH':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300';
      case 'HIGH':
        return 'bg-orange-500/200/20 text-orange-800 border-orange-500/30 dark:bg-orange-950 dark:text-orange-300';
      case 'MEDIUM':
        return 'bg-amber-500/200/20 text-amber-800 border-amber-500/30 dark:bg-amber-950 dark:text-amber-300';
      case 'LOW':
        return 'bg-emerald-500/200/20 text-emerald-800 border-emerald-500/30 dark:bg-emerald-950 dark:text-emerald-300';
    }
  };

  const getStatusBadge = (status: SecurityEvent['status']) => {
    switch (status) {
      case 'GRANTED':
        return 'bg-emerald-500/200 text-white';
      case 'DENIED':
        return 'bg-rose-500 text-white';
      case 'QUARANTINED':
        return 'bg-amber-500/200 text-white';
      case 'UNDER_REVIEW':
        return 'bg-blue-500/200 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-blue/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl w-full max-w-4xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-border-theme dark:border-border-theme bg-surface dark:bg-primary-blue/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-text-primary dark:text-white">
                {event.eventId}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getSeverityBadge(event.threatSeverity)}`}>
                {event.threatSeverity.replace(/_/g, ' ')}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getStatusBadge(event.status)}`}>
                {event.status}
              </span>
            </div>
            <div className="text-xs text-text-muted flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{event.location}</span> • <span className="font-mono">{event.sourceIp}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuarantine(event)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" /> Emergency Quarantine
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-secondary dark:hover:text-white hover:bg-surface-secondary dark:hover:bg-surface-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Bar */}
        <div className="px-6 py-3 bg-surface dark:bg-primary-blue border-b border-border-theme dark:border-border-theme grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
          <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/50">
            <div className="text-text-muted text-[10px] font-bold uppercase">Threat Risk Score</div>
            <div className="text-base font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
              {event.riskScore}/100
            </div>
          </div>
          <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/50">
            <div className="text-text-muted text-[10px] font-bold uppercase">Gate Protocol</div>
            <div className="text-base font-extrabold text-blue-400 dark:text-blue-400 mt-0.5">
              {event.gateProtocol.replace(/_/g, ' ')}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/50">
            <div className="text-text-muted text-[10px] font-bold uppercase">Target API Endpoint</div>
            <div className="text-xs font-mono font-bold text-text-primary dark:text-slate-200 truncate mt-1">
              {event.targetResource}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/50">
            <div className="text-text-muted text-[10px] font-bold uppercase">Timestamp</div>
            <div className="text-xs font-mono text-text-secondary dark:text-slate-300 mt-1">
              {new Date(event.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-theme dark:border-border-theme px-6 bg-surface/50 dark:bg-primary-blue/40 text-xs">
          <button
            onClick={() => setActiveTab('ingress')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ingress'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Ingress Telemetry & Anomalies ({event.anomaliesDetected.length})
          </button>
          <button
            onClick={() => setActiveTab('identity')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'identity'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Key className="w-4 h-4" /> Identity Claims & Cryptography
          </button>
          <button
            onClick={() => setActiveTab('mitigation')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mitigation'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Zap className="w-4 h-4" /> Mitigation & Audit Trail
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'ingress' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-3">
                <h4 className="text-xs font-bold uppercase text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Detected Security Anomalies
                </h4>
                <ul className="space-y-1.5 text-xs text-rose-900 dark:text-rose-200">
                  {event.anomaliesDetected.map((anom, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{anom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme">
                  <span className="text-text-muted font-bold uppercase text-[10px]">User-Agent Signature</span>
                  <div className="font-mono text-text-primary dark:text-slate-200 mt-1 break-all">
                    {event.userAgent}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme">
                  <span className="text-text-muted font-bold uppercase text-[10px]">Target Resource URI</span>
                  <div className="font-mono text-text-primary dark:text-slate-200 mt-1">
                    {event.targetResource}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'identity' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-bold uppercase text-[10px]">User Principal</span>
                  <span className="font-mono font-bold text-text-primary dark:text-white">{event.userPrincipal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-bold uppercase text-[10px]">Role / Authority</span>
                  <span className="font-bold text-blue-400 dark:text-blue-400">{event.userRole}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted font-bold uppercase text-[10px]">Cryptographic Passkey Status</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> FIDO2 Certified
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mitigation' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-2">
                <span className="text-text-muted font-bold uppercase text-[10px]">Mitigation Directive</span>
                <div className="font-bold text-text-primary dark:text-white text-sm">
                  {event.mitigationTaken || 'No active mitigation required.'}
                </div>
                {event.mitigatedBy && (
                  <div className="text-text-muted">
                    Authorized By: <span className="font-semibold text-blue-400">{event.mitigatedBy}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
