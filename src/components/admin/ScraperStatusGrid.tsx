import React, { useState } from 'react';
import { ScraperHealth, ScraperConfig } from '../../pages/ScraperHealthDashboard';
import { Play, Pause, Settings, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  sources: ScraperHealth[];
  onTrigger: (sourceId: string) => void;
  onUpdateConfig: (sourceId: string, updates: Partial<ScraperConfig>) => void;
}

export const ScraperStatusGrid: React.FC<Props> = ({ sources, onTrigger, onUpdateConfig }) => {
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<{ minSuccessRate: number; maxStalenessHours: number }>({ minSuccessRate: 80, maxStalenessHours: 24 });

  const handleEditOpen = (source: ScraperHealth) => {
    setEditingConfig(source.source);
    if (source.config) {
      setConfigForm({ minSuccessRate: source.config.minSuccessRate, maxStalenessHours: source.config.maxStalenessHours });
    }
  };

  const handleSaveConfig = (sourceId: string) => {
    onUpdateConfig(sourceId, configForm);
    setEditingConfig(null);
  };

  return (
    <div className="bg-surface dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <h2 className="font-semibold text-gray-900 dark:text-white">Active Scrapers</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sources.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No scraper telemetry found.</div>
        ) : (
          sources.map(source => (
            <div key={source.source} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    source.status === 'healthy' ? 'bg-green-500' :
                    source.status === 'paused' ? 'bg-gray-400' :
                    'bg-red-500 animate-pulse'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{source.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {source.lastSuccessfulScrape ? new Date(source.lastSuccessfulScrape).toLocaleString() : 'Never'}
                      </span>
                      <span>â€¢</span>
                      <span>{source.successRate}% Success</span>
                      <span>â€¢</span>
                      <span>{source.responseTimeMs}ms</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onTrigger(source.source)}
                    title="Manually Trigger Scraper"
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onUpdateConfig(source.source, { isPaused: !source.config?.isPaused })}
                    title={source.config?.isPaused ? "Resume Scraper" : "Pause Alerts"}
                    className={`p-2 rounded-lg transition-colors ${
                      source.config?.isPaused 
                        ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' 
                        : 'text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                    }`}
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => editingConfig === source.source ? setEditingConfig(null) : handleEditOpen(source)}
                    title="Configure Thresholds"
                    className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Error Warning */}
              {source.status === 'failing' && source.lastError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="font-mono text-xs overflow-x-auto">{source.lastError}</p>
                </div>
              )}

              {/* Config Form */}
              {editingConfig === source.source && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium mb-3">Alert Thresholds</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Min Success Rate (%)</label>
                      <input 
                        type="number" 
                        value={configForm.minSuccessRate}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, minSuccessRate: Number(e.target.value) }))}
                        className="w-full bg-surface dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max Staleness (Hours)</label>
                      <input 
                        type="number" 
                        value={configForm.maxStalenessHours}
                        onChange={(e) => setConfigForm(prev => ({ ...prev, maxStalenessHours: Number(e.target.value) }))}
                        className="w-full bg-surface dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingConfig(null)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleSaveConfig(source.source)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
                    >
                      Save Rules
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
