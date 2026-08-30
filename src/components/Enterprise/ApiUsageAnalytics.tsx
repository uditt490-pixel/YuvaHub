// ─── API Usage Analytics Component ────────────────────────────────────────────
// API usage analytics with trend cards, status code distribution, latency
// histogram, top endpoints, top consumers, error breakdown, and region breakdown.

import React from 'react';
import {
  Activity, TrendingUp, TrendingDown, Clock, Zap, Globe, Users, AlertTriangle,
  BarChart3, Target, Server, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { ApiUsageMetrics, ApiEndpointUsage, ApiConsumerUsage, ApiErrorBreakdown } from '../../types/apiGateway';

interface ApiUsageAnalyticsProps {
  metrics: ApiUsageMetrics | null;
  isLoading: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function TrendBadge({ value, label }: { value: number; label: string }) {
  const isPositive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${isPositive ? 'text-red-400' : 'text-emerald-400'}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isPositive ? '+' : ''}{value}%
      <span className="text-text-muted font-medium ml-0.5">{label}</span>
    </span>
  );
}

function MiniBarChart({ data, maxValue }: { data: Array<{ label: string; value: number; color?: string }>; maxValue: number }) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-px h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div
            className={`w-full rounded-t-sm transition-all duration-500 ${d.color || 'bg-indigo-400'}`}
            style={{ height: `${Math.max((d.value / max) * 100, 2)}%`, minHeight: '2px' }}
          />
        </div>
      ))}
    </div>
  );
}

export const ApiUsageAnalytics: React.FC<ApiUsageAnalyticsProps> = ({ metrics, isLoading }) => {
  if (isLoading || !metrics) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border-theme p-4 animate-pulse">
              <div className="h-3 w-20 bg-surface-secondary rounded mb-2" />
              <div className="h-7 w-24 bg-surface-secondary rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500/200 rounded-l-xl" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Requests</span>
          <p className="text-2xl font-black text-text-primary mt-1">{formatNumber(metrics.totalRequests)}</p>
          <TrendBadge value={metrics.requestsTrend} label="vs last period" />
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500/200 rounded-l-xl" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Bandwidth</span>
          <p className="text-2xl font-black text-text-primary mt-1">{formatBytes(metrics.totalBandwidthBytes)}</p>
          <TrendBadge value={metrics.bandwidthTrend} label="vs last period" />
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-amber-500/200 rounded-l-xl" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Avg Latency</span>
          <p className="text-2xl font-black text-text-primary mt-1">{metrics.avgLatencyMs}ms</p>
          <span className={`text-[11px] font-bold ${metrics.latencyTrend < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {metrics.latencyTrend < 0 ? <TrendingDown className="h-3 w-3 inline" /> : <TrendingUp className="h-3 w-3 inline" />}
            {metrics.latencyTrend > 0 ? '+' : ''}{metrics.latencyTrend}% latency
          </span>
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-red-500/200 rounded-l-xl" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Error Rate</span>
          <p className="text-2xl font-black text-red-400 mt-1">{metrics.errorRate}%</p>
          <span className="text-[11px] text-text-muted font-bold">{metrics.failedRequests.toLocaleString()} failures</span>
        </div>
      </div>

      {/* Latency Distribution & Status Codes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Distribution */}
        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Latency Distribution</h4>
          <div className="space-y-2.5">
            {metrics.latencyDistribution.map(bucket => {
              const pct = bucket.percentage;
              return (
                <div key={bucket.range} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-text-secondary w-20 shrink-0">{bucket.range}</span>
                  <div className="flex-1 h-3 bg-surface-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        pct > 30 ? 'bg-indigo-500/200' : pct > 10 ? 'bg-indigo-400' : 'bg-indigo-300'
                      }`}
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-text-primary w-16 text-right">{formatNumber(bucket.count)}</span>
                  <span className="text-[10px] font-bold text-text-muted w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border-theme text-[11px] text-text-muted">
            <span>P95: <strong className="text-text-primary">{metrics.p95LatencyMs}ms</strong></span>
            <span>P99: <strong className="text-text-primary">{metrics.p99LatencyMs}ms</strong></span>
          </div>
        </div>

        {/* Status Code Distribution */}
        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Status Code Distribution</h4>
          <div className="space-y-3">
            {metrics.statusCodes.map(sc => (
              <div key={sc.code} className="flex items-center gap-3">
                <span className="text-sm font-black text-text-primary w-10">{sc.code}</span>
                <div className="flex-1 h-6 bg-surface-secondary rounded-lg overflow-hidden">
                  <div
                    className={`h-full rounded-lg transition-all duration-700 ${sc.color}`}
                    style={{ width: `${Math.max(sc.percentage, 0.5)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-text-primary w-24 text-right">{formatNumber(sc.count)}</span>
                <span className="text-[10px] font-bold text-text-muted w-10 text-right">{sc.percentage}%</span>
              </div>
            ))}
          </div>

          {/* Error Breakdown */}
          <div className="mt-6 pt-4 border-t border-border-theme">
            <h5 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Error Breakdown</h5>
            <div className="space-y-2">
              {metrics.errorBreakdown.map(err => (
                <div key={err.statusCode} className="flex items-center justify-between px-3 py-2 bg-red-500/20 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-red-400">{err.statusCode}</span>
                    <span className="text-[11px] text-red-400">{err.percentage}%</span>
                  </div>
                  <span className="text-xs font-bold text-red-400">{formatNumber(err.count)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Pattern */}
      <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest">Hourly Traffic Pattern</h4>
          <span className="text-[10px] text-text-muted font-bold">UTC Time</span>
        </div>
        <MiniBarChart
          data={metrics.hourlyPattern.map(h => ({
            label: `${h.hour}`,
            value: h.avgRequests,
            color: h.errorRate > 2 ? 'bg-red-400' : h.avgRequests > 1000 ? 'bg-indigo-500/200' : 'bg-indigo-300',
          }))}
          maxValue={Math.max(...metrics.hourlyPattern.map(h => h.avgRequests))}
        />
        <div className="flex justify-between mt-2 text-[10px] font-bold text-text-muted">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </div>

      {/* Top Endpoints & Consumers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Top Endpoints</h4>
          <div className="space-y-3">
            {metrics.topEndpoints.map((ep, i) => (
              <div key={ep.endpointId} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors group">
                <span className="text-xs font-black text-text-muted w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                      ep.method === 'GET' ? 'bg-emerald-500/200/20 text-emerald-400' :
                      ep.method === 'POST' ? 'bg-blue-500/200/20 text-blue-400' :
                      ep.method === 'PUT' ? 'bg-amber-500/200/20 text-amber-400' :
                      'bg-red-500/200/20 text-red-400'
                    }`}>{ep.method}</span>
                    <span className="text-xs font-mono font-bold text-text-primary truncate">{ep.path}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted">
                    <span>{formatNumber(ep.requests)} reqs</span>
                    <span>{ep.avgLatency}ms avg</span>
                    <span className={ep.errorRate > 2 ? 'text-red-500' : ''}>{ep.errorRate}% errors</span>
                    {ep.trend > 10 && <TrendingUp className="h-3 w-3 text-red-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Top Consumers</h4>
          <div className="space-y-3">
            {metrics.topConsumers.map((consumer, i) => (
              <div key={consumer.keyId} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {consumer.keyName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary truncate">{consumer.keyName}</p>
                  <p className="text-[10px] text-text-muted">{consumer.ownerName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-text-primary">{formatNumber(consumer.requests)}</p>
                  <p className={`text-[10px] font-bold ${consumer.errorRate > 2 ? 'text-red-500' : 'text-text-muted'}`}>
                    {consumer.errorRate}% err
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Region Breakdown */}
      <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
        <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Requests by Region</h4>
        <div className="space-y-3">
          {metrics.regionBreakdown.map(region => (
            <div key={region.region} className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-surface-secondary text-text-secondary">
                <Globe className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-text-primary">{region.region}</span>
                  <span className="text-xs font-bold text-text-muted">{formatNumber(region.requests)} ({region.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-surface-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-700" style={{ width: `${region.percentage}%` }} />
                </div>
              </div>
              <span className="text-xs font-bold text-text-muted">{region.avgLatency}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiUsageAnalytics;
