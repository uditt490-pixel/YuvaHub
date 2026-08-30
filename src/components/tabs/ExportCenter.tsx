import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useSocket } from '../../context/SocketContext';
import { ErrorState } from '../ui/states';

interface ExportHistoryItem {
  _id: string;
  format: string;
  sections: string[];
  status: string;
  fileUrl?: string;
  errorMessage?: string;
  requestedAt: string;
}

export default function ExportCenter() {
  const { user } = useAppContext();
  const { socket, isConnected } = useSocket();
  const [format, setFormat] = useState('pdf');
  const [sections, setSections] = useState<string[]>(['profile', 'applications', 'bookmarks']);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ExportHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/v1/export/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch export history');
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    
    const handleExportReady = (data: any) => {
      setHistory(prev => prev.map(item => 
        item._id === data.exportId 
          ? { ...item, status: 'completed', fileUrl: data.fileUrl } 
          : item
      ));
    };

    const handleExportFailed = (data: any) => {
      setHistory(prev => prev.map(item => 
        item._id === data.exportId 
          ? { ...item, status: 'failed', errorMessage: data.error } 
          : item
      ));
    };

    socket.on('export_ready', handleExportReady);
    socket.on('export_failed', handleExportFailed);

    return () => {
      socket.off('export_ready', handleExportReady);
      socket.off('export_failed', handleExportFailed);
    };
  }, [socket]);

  const toggleSection = (section: string) => {
    setSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleRequestExport = async () => {
    if (!user) return;
    if (sections.length === 0) {
      setError("Please select at least one data section.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/v1/export/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ format, sections })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to request export');
      }
      
      await fetchHistory(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border-theme rounded-2xl p-6 shadow-xs space-y-6 mt-8">
      <div>
        <h3 className="text-lg font-serif font-bold text-text-primary">Data Export Center</h3>
        <p className="text-xs text-text-muted">Download a copy of your YuvaHub data for offline access or compliance.</p>
      </div>

      {error && <ErrorState title="Export Error" description={error} />}

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-text-secondary mb-2 block">Data Sections</label>
          <div className="flex flex-wrap gap-3">
            {['profile', 'applications', 'bookmarks'].map(sec => (
              <label key={sec} className="flex items-center gap-2 cursor-pointer bg-background p-2 px-3 border border-border-theme rounded-xl text-xs font-semibold text-text-primary">
                <input 
                  type="checkbox" 
                  className="accent-[#b56b37]"
                  checked={sections.includes(sec)} 
                  onChange={() => toggleSection(sec)} 
                />
                <span className="capitalize">{sec}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-text-secondary mb-2 block">Export Format</label>
          <div className="flex flex-wrap gap-3">
            {['pdf', 'csv', 'json'].map(fmt => (
              <label key={fmt} className="flex items-center gap-2 cursor-pointer bg-background p-2 px-3 border border-border-theme rounded-xl text-xs font-semibold text-text-primary">
                <input 
                  type="radio" 
                  name="format"
                  className="accent-[#b56b37]"
                  checked={format === fmt} 
                  onChange={() => setFormat(fmt)} 
                />
                <span className="uppercase">{fmt}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          onClick={handleRequestExport} 
          disabled={loading || sections.length === 0}
          className="bg-primary-blue hover:bg-[#603620] text-white w-full px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider flex justify-center items-center shadow-sm transition-colors cursor-pointer disabled:opacity-50 mt-4"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
          Request Export
        </button>
      </div>

      <div className="pt-6 border-t border-border-theme">
        <h4 className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">Recent Exports</h4>
        {history.length === 0 ? (
          <p className="text-xs text-text-muted">No past exports found.</p>
        ) : (
          <div className="space-y-3">
            {history.map(item => (
              <div key={item._id} className="flex items-center justify-between p-3 bg-background border border-border-theme rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-secondary text-primary-blue flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary uppercase">{item.format} Export</p>
                    <p className="text-[10px] text-text-muted">{new Date(item.requestedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.status === 'completed' && item.fileUrl ? (
                    <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-extrabold bg-primary-blue text-white px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-[#603620] transition-colors">
                      <Download className="w-3 h-3" /> Download
                    </a>
                  ) : item.status === 'failed' ? (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-1 rounded-md border border-red-200">
                      <AlertTriangle className="w-3 h-3" /> Failed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold text-primary-blue uppercase tracking-wider">
                      <Clock className="w-3 h-3 animate-spin-slow" /> Processing...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
