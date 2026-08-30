import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { ScraperStatusGrid } from '../components/admin/ScraperStatusGrid';
import { ScraperTimeSeriesChart } from '../components/admin/ScraperTimeSeriesChart';
import { Activity, Settings, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export interface ScraperConfig {
  source: string;
  minSuccessRate: number;
  maxStalenessHours: number;
  isPaused: boolean;
}

export interface ScraperHealth {
  name: string;
  source: string;
  status: 'healthy' | 'failing' | 'paused';
  lastSuccessfulScrape: string | null;
  failureCount: number;
  successRate: number;
  responseTimeMs: number;
  opportunitiesCollected: number;
  lastError: string | null;
  config?: ScraperConfig;
}

export const ScraperHealthDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<{ summary: any; sources: ScraperHealth[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAppContext();
  const { socket, isConnected } = useSocket();

  const fetchHealth = async () => {
    setRefreshing(true);
    try {
      const token = await user?.getIdToken?.() || localStorage.getItem('token');
      const res = await fetch('/api/v1/admin/scrapers/health', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHealthData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch scraper health:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    
    // Listen for real-time updates from ScraperAlertService
    socket.on('SCRAPER_METRICS_UPDATE', (metrics: any) => {
      setHealthData(prev => {
        if (!prev) return prev;
        
        const updatedSources = prev.sources.map(source => {
          if (source.source === metrics.source || source.source === metrics.id || source.name === metrics.name) {
            // Update source in place
            return {
              ...source,
              status: metrics.determinedStatus || source.status,
              lastSuccessfulScrape: metrics.lastRun || source.lastSuccessfulScrape,
              failureCount: metrics.failures || 0,
              successRate: metrics.successRuns ? (metrics.successRuns / ((metrics.successRuns || 1) + (metrics.failures || 0))) * 100 : source.successRate,
              responseTimeMs: metrics.duration_sec ? Math.round(metrics.duration_sec * 1000) : source.responseTimeMs,
              opportunitiesCollected: (source.opportunitiesCollected || 0) + (metrics.inserted || 0),
              lastError: metrics.error || null,
            };
          }
          return source;
        });
        
        return { ...prev, sources: updatedSources };
      });
    });

    socket.on('SCRAPER_CONFIG_UPDATE', (config: ScraperConfig) => {
       setHealthData(prev => {
          if (!prev) return prev;
          const updatedSources = prev.sources.map(source => {
             if (source.source === config.source) {
                return { ...source, config };
             }
             return source;
          });
          return { ...prev, sources: updatedSources };
       });
    });

    return () => {
      socket.off('SCRAPER_METRICS_UPDATE');
      socket.off('SCRAPER_CONFIG_UPDATE');
    };
  }, [socket]);

  const handleTriggerScraper = async (sourceId: string) => {
     try {
       const token = await user?.getIdToken?.() || localStorage.getItem('token');
       await fetch(`/api/v1/admin/scrapers/trigger/${sourceId}`, {
         method: 'POST',
         headers: { 'Authorization': `Bearer ${token}` }
       });
     } catch (err) {
       console.error("Failed to trigger scraper", err);
     }
  };

  const handleUpdateConfig = async (sourceId: string, updates: Partial<ScraperConfig>) => {
     try {
       const token = await user?.getIdToken?.() || localStorage.getItem('token');
       await fetch(`/api/v1/admin/scrapers/configs/${sourceId}`, {
         method: 'PATCH',
         headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(updates)
       });
       // Optimistic update
       setHealthData(prev => {
          if (!prev) return prev;
          const updatedSources = prev.sources.map(s => {
             if (s.source === sourceId && s.config) {
                return { ...s, config: { ...s.config, ...updates } };
             }
             return s;
          });
          return { ...prev, sources: updatedSources };
       });
     } catch (err) {
       console.error("Failed to update config", err);
     }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Activity className="animate-spin w-8 h-8 text-blue-600" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Scraper Observability
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time health monitoring across 100+ sources</p>
        </div>
        <div className="flex items-center gap-4">
          {!isConnected && (
            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-xs font-medium">
              <AlertTriangle className="w-3 h-3" /> Reconnecting...
            </span>
          )}
          <button 
            onClick={fetchHealth} 
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {healthData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div className="bg-surface dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 mb-1">Total Sources</div>
              <div className="text-2xl font-bold">{healthData.summary.totalSources}</div>
           </div>
           <div className="bg-surface dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-900/50">
              <div className="text-sm text-green-600 mb-1">Healthy</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{healthData.summary.healthySources}</div>
           </div>
           <div className="bg-surface dark:bg-gray-800 rounded-xl p-4 border border-red-200 dark:border-red-900/50">
              <div className="text-sm text-red-600 mb-1">Failing</div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{healthData.summary.failingSources}</div>
           </div>
           <div className="bg-surface dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 mb-1">Avg Response</div>
              <div className="text-2xl font-bold">{healthData.summary.avgResponseTimeMs}ms</div>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
           <ScraperStatusGrid 
             sources={healthData?.sources || []} 
             onTrigger={handleTriggerScraper}
             onUpdateConfig={handleUpdateConfig}
           />
        </div>
        <div className="space-y-6">
           <ScraperTimeSeriesChart sources={healthData?.sources || []} />
        </div>
      </div>
    </div>
  );
};
