import React, { useState } from 'react';
import { X, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'opportunity' | 'post' | 'team' | 'user';
  contentId: string;
  contentTitle?: string;
}

export function ReportModal({ isOpen, onClose, contentType, contentId, contentTitle }: ReportModalProps) {
  const { user } = useAppContext();
  const [reason, setReason] = useState('Spam');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = await user.getIdToken?.() || localStorage.getItem('token');
      const res = await fetch('/api/v1/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contentType,
          contentId,
          reason,
          description
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to submit report');
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setDescription('');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#231f20]/50 backdrop-blur-xs p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-xl p-6 max-w-md w-full shadow-xl space-y-4 animate-scale-up text-text-primary dark:text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-border-theme dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-base">Report Content</h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-text-primary dark:text-white">Report Submitted</h4>
            <p className="text-xs text-text-secondary dark:text-slate-400">Our moderation team will review this shortly. Thank you for helping keep YuvaHub safe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {contentTitle && (
              <p className="text-xs text-text-secondary dark:text-slate-400">
                Reporting: <strong className="text-text-primary dark:text-slate-200">{contentTitle}</strong>
              </p>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary dark:text-slate-200">Reason for reporting</label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-text-primary dark:text-white outline-none font-medium"
              >
                <option value="Spam">Spam</option>
                <option value="Scam">Scam / Fraudulent</option>
                <option value="Inappropriate">Inappropriate Content</option>
                <option value="Harassment">Harassment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary dark:text-slate-200">Additional Details (Optional)</label>
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more context..."
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none font-medium resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Submit Report</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
