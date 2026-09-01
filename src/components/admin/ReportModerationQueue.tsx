import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

interface Report {
  _id: string;
  opportunityId: string;
  reporterUid: string;
  reason: string;
  evidence?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export function ReportModerationQueue() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async (pageNumber: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Assuming admin token is here
      const res = await fetch(`/api/v1/admin/reports/opportunities?page=${pageNumber}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setReports(data.items || []);
      setTotalPages(Math.ceil((data.total || 0) / 10));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(page);
  }, [page]);

  const handleUpdateStatus = async (reportId: string, newStatus: 'resolved' | 'dismissed') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/admin/reports/opportunities/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update report');
      
      // Update local state
      setReports(reports.map(r => r._id === reportId ? { ...r, status: newStatus } : r));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && reports.length === 0) {
    return <div className="p-8 text-center text-gray-500">Loading reports queue...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 border border-red-200">
        <AlertTriangle className="w-5 h-5" />
        <p>Failed to load queue: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="text-amber-500" /> Moderation Queue
        </h2>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-surface dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">The moderation queue is clear!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report._id} className="bg-surface dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    {report.reason}
                  </span>
                  <span className={`text-xs font-semibold flex items-center gap-1 ${
                    report.status === 'pending' ? 'text-amber-600' :
                    report.status === 'resolved' ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {report.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                    {report.status === 'resolved' && <CheckCircle className="w-3.5 h-3.5" />}
                    {report.status === 'dismissed' && <XCircle className="w-3.5 h-3.5" />}
                    {report.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Opportunity ID:</span> 
                  <a href={`/opportunities/${report.opportunityId}`} target="_blank" rel="noreferrer" className="ml-1 text-primary-blue hover:underline inline-flex items-center gap-1">
                    {report.opportunityId} <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                
                {report.evidence && (
                  <div className="mt-2 bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-bold block mb-1">Evidence / Context:</span>
                    {report.evidence}
                  </div>
                )}
              </div>

              {report.status === 'pending' && (
                <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => handleUpdateStatus(report._id, 'resolved')}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Resolve (Remove)
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(report._id, 'dismissed')}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Dismiss (Keep)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-surface hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-surface hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
