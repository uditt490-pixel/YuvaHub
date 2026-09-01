import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, RotateCcw, AlertTriangle, Archive, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ErrorState } from '../ui/states';

export default function AdminExpiryDashboard() {
  const { user } = useAppContext();
  const [stats, setStats] = useState({ active: 0, expired: 0, archived: 0 });
  const [expiredList, setExpiredList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await user?.getIdToken();
      
      const [statsRes, expiredRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/expiry/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/expiry/expired`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!statsRes.ok || !expiredRes.ok) {
        throw new Error("Failed to fetch data. Ensure you have admin privileges.");
      }

      const statsData = await statsRes.json();
      const expiredData = await expiredRes.json();

      setStats(statsData);
      setExpiredList(expiredData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async (id: string) => {
    const newDeadline = prompt("Enter new deadline (YYYY-MM-DD):");
    if (!newDeadline) return;

    try {
      const token = await user?.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/expiry/${id}/reactivate`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newDeadline: new Date(newDeadline).toISOString() })
      });

      if (!res.ok) throw new Error("Failed to reactivate");
      
      fetchData();
    } catch (err) {
      alert("Error reactivating opportunity");
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this opportunity manually?")) return;

    try {
      const token = await user?.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/expiry/${id}/archive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to archive");
      
      fetchData();
    } catch (err) {
      alert("Error archiving opportunity");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-12 font-sans px-4 md:px-0">
      <header className="pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-theme pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-text-primary">
            Lifecycle Management Dashboard
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Monitor and manage expired opportunities
          </p>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 bg-surface border border-border-theme px-3.5 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {error ? (
        <ErrorState description={error} onRetry={fetchData} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Active</p>
                  <p className="text-[10px] text-emerald-600">Currently visible</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-3xl font-serif font-bold text-emerald-900 mt-4">{stats.active}</h3>
            </div>

            <div className="border border-amber-200 bg-amber-50 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Expired</p>
                  <p className="text-[10px] text-amber-600">Awaiting archiving</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-3xl font-serif font-bold text-amber-900 mt-4">{stats.expired}</h3>
            </div>

            <div className="border border-border-theme bg-background rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Archived</p>
                  <p className="text-[10px] text-text-muted">Moved to cold storage</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#e8ded1] flex items-center justify-center text-text-secondary">
                  <Archive className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-3xl font-serif font-bold text-text-primary mt-4">{stats.archived}</h3>
            </div>
          </div>

          <div className="bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-border-theme bg-background flex justify-between items-center">
              <h3 className="font-serif font-bold text-text-primary">Recently Expired Opportunities</h3>
            </div>
            {loading ? (
              <div className="p-12 flex justify-center"><RefreshCw className="w-6 h-6 animate-spin text-primary-blue" /></div>
            ) : expiredList.length === 0 ? (
              <div className="p-12 text-center text-text-muted text-sm">No expired opportunities found.</div>
            ) : (
              <div className="divide-y divide-[#e8ded1]">
                {expiredList.map((opp) => (
                  <div key={opp.id} className="p-4 sm:p-6 hover:bg-background transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-text-primary mb-1">{opp.title}</h4>
                      <p className="text-xs text-text-secondary mb-2">{opp.organization || opp.org}</p>
                      <div className="flex items-center gap-3 text-[10px] text-text-muted">
                        <span>Expired: {new Date(opp.deadline).toLocaleDateString()}</span>
                        <span>ID: {opp.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleReactivate(opp.id)}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reactivate
                      </button>
                      <button 
                        onClick={() => handleArchive(opp.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
