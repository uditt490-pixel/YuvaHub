import React, { useState } from 'react';
import { SecurityEvent, QuarantinePayload } from '../../types/zeroTrustSecurity';
import { X, Lock, ShieldAlert, AlertTriangle, Check } from 'lucide-react';

interface EmergencyLockdownModalProps {
  event: SecurityEvent;
  onClose: () => void;
  onConfirm: (payload: QuarantinePayload) => Promise<void>;
}

export const EmergencyLockdownModal: React.FC<EmergencyLockdownModalProps> = ({
  event,
  onClose,
  onConfirm
}) => {
  const [duration, setDuration] = useState<number>(72);
  const [reason, setReason] = useState(
    'Critical anomaly detected: impossible travel pattern and unauthorized bulk student roster export attempt.'
  );
  const [authorizedBy, setAuthorizedBy] = useState('ciso-lead@enterprise.ac.in');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsProcessing(true);
    await onConfirm({
      eventId: event.id,
      userPrincipal: event.userPrincipal,
      sourceIp: event.sourceIp,
      quarantineDurationHours: Number(duration),
      reason: reason.trim(),
      authorizedBy: authorizedBy.trim()
    });
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-blue/80 backdrop-blur-sm">
      <div className="bg-surface dark:bg-primary-blue border border-rose-500 dark:border-rose-600/50 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-gradient-to-r from-rose-600 to-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <div>
              <h3 className="text-base font-extrabold">🚨 Code Red: Emergency Quarantine Protocol</h3>
              <p className="text-xs text-rose-100">Immediate ingress boundary isolation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 dark:text-rose-200">
              Quarantining IP <span className="font-mono font-bold">{event.sourceIp}</span> and revoking active sessions for <span className="font-bold">{event.userPrincipal}</span>.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted mb-1.5">
              Quarantine Duration:
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-border-theme dark:border-border-theme bg-surface dark:bg-surface-secondary text-xs font-bold text-text-primary dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
            >
              <option value="24">24 Hours (Standard Quarantine)</option>
              <option value="72">72 Hours (High Severity Isolation)</option>
              <option value="168">7 Days (Full Breach Lockdown)</option>
              <option value="720">30 Days (Permanent Blocklist)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted mb-1.5">
              Forensic Justification & SOC-2 Audit Note:
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-border-theme dark:border-border-theme bg-surface dark:bg-surface-secondary text-xs text-text-primary dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted mb-1.5">
              Authorizing Security Officer Email:
            </label>
            <input
              type="email"
              value={authorizedBy}
              onChange={(e) => setAuthorizedBy(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-border-theme dark:border-border-theme bg-surface dark:bg-surface-secondary text-xs text-text-primary dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-border-theme dark:border-border-theme flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary dark:text-slate-300 hover:bg-surface-secondary dark:hover:bg-surface-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              {isProcessing ? 'Enforcing...' : 'Enforce Quarantine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
