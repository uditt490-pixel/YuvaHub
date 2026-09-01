// ─── Enterprise Audit Log Center ──────────────────────────────────────────────
// Full page container that orchestrates the Audit Log feature: live metrics,
// multi-criteria filtering, grouped timeline view, real-time streaming indicator,
// compliance mapping, and CSV export.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Filter, Download, RefreshCw, Radio, Shield, Clock,
  ChevronDown, ChevronUp, X, AlertTriangle, CheckCircle2, Eye,
  Activity, TrendingUp, Zap, Server, BarChart3,
} from 'lucide-react';
import {
  AuditLogEntry, AuditMetrics, AuditTimelineGroup, AuditLogFilters,
  AuditCategory, AuditSeverity, AuditAction, AuditResourceType,
  TimeRange, ComplianceMapping,
} from '../../types/auditLog';
import { AuditLogService } from '../../services/AuditLogService';
import { AuditLogMetrics } from '../../components/Enterprise/AuditLogMetrics';
import { AuditLogTimeline } from '../../components/Enterprise/AuditLogTimeline';
import { AuditLogDetailModal } from '../../components/Enterprise/AuditLogDetailModal';

const TIME_RANGES: Array<{ value: TimeRange; label: string }> = [
  { value: '1H', label: '1 Hour' },
  { value: '6H', label: '6 Hours' },
  { value: '24H', label: '24 Hours' },
  { value: '7D', label: '7 Days' },
  { value: '30D', label: '30 Days' },
  { value: '90D', label: '90 Days' },
];

const ALL_CATEGORIES: AuditCategory[] = [
  'AUTHENTICATION', 'AUTHORIZATION', 'DATA_MODIFICATION', 'DATA_EXPORT',
  'USER_MANAGEMENT', 'SYSTEM_CONFIG', 'BILLING', 'SECURITY', 'API_ACCESS', 'INTEGRATION',
];

const ALL_SEVERITIES: AuditSeverity[] = ['INFO', 'WARNING', 'CRITICAL', 'EMERGENCY'];

const ALL_RESOURCE_TYPES: AuditResourceType[] = [
  'USER', 'TEAM', 'ROLE', 'PERMISSION', 'API_KEY', 'BILLING_ACCOUNT',
  'SUBSCRIPTION', 'FEATURE_FLAG', 'INTEGRATION', 'DATASET', 'FILE',
  'WEBHOOK', 'ENVIRONMENT', 'SESSION', 'NOTIFICATION', 'TEMPLATE', 'POLICY',
];

const SEVERITY_DOT_COLORS: Record<AuditSeverity, string> = {
  INFO: 'bg-emerald-500/200',
  WARNING: 'bg-amber-500/200',
  CRITICAL: 'bg-red-500/200',
  EMERGENCY: 'bg-rose-600',
};

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

const FilterPanel: React.FC<{
  filters: AuditLogFilters;
  onChange: (updates: Partial<AuditLogFilters>) => void;
  onReset: () => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ filters, onChange, onReset, isOpen, onToggle }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['time', 'severity', 'category'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const toggleArrayFilter = <T extends string>(
    current: T[],
    value: T,
    key: keyof AuditLogFilters
  ) => {
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ [key]: updated });
  };

  const activeFilterCount = [
    ...filters.categories,
    ...filters.severities,
    ...filters.resourceTypes,
    ...(filters.minRiskScore > 0 ? ['risk'] : []),
    ...(filters.actorSearch ? ['actor'] : []),
  ].length;

  return (
    <>
      {/* Toggle button (mobile) */}
      <button
        onClick={onToggle}
        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-surface border border-border-theme rounded-xl text-sm font-bold text-text-primary hover:bg-surface transition-colors"
      >
        <Filter className="h-4 w-4" /> Filters
        {activeFilterCount > 0 && (
          <span className="px-1.5 py-0.5 bg-indigo-500/200/20 text-indigo-400 rounded-full text-[10px] font-black">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Panel */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="bg-surface rounded-2xl border border-border-theme shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border-theme bg-surface/50 flex items-center justify-between">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">Filters</h3>
            <button
              onClick={onReset}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-400 transition-colors"
            >
              Reset All
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">

            {/* Time Range */}
            <div>
              <button
                onClick={() => toggleSection('time')}
                className="flex items-center justify-between w-full text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
              >
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Time Range
                </span>
                {expandedSections.has('time') ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {expandedSections.has('time') && (
                <div className="grid grid-cols-3 gap-1.5">
                  {TIME_RANGES.map(tr => (
                    <button
                      key={tr.value}
                      onClick={() => onChange({ timeRange: tr.value })}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                        filters.timeRange === tr.value
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-surface border-border-theme text-text-secondary hover:border-border-theme'
                      }`}
                    >
                      {tr.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Severity */}
            <div>
              <button
                onClick={() => toggleSection('severity')}
                className="flex items-center justify-between w-full text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
              >
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Severity
                </span>
                {expandedSections.has('severity') ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {expandedSections.has('severity') && (
                <div className="space-y-1.5">
                  {ALL_SEVERITIES.map(sev => (
                    <label
                      key={sev}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        filters.severities.includes(sev) ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-surface border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.severities.includes(sev)}
                        onChange={() => toggleArrayFilter(filters.severities, sev, 'severities')}
                        className="rounded border-border-theme text-indigo-400 focus:ring-indigo-500"
                      />
                      <span className={`w-2.5 h-2.5 rounded-full ${SEVERITY_DOT_COLORS[sev]}`} />
                      <span className="text-xs font-bold text-text-primary">{sev}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <button
                onClick={() => toggleSection('category')}
                className="flex items-center justify-between w-full text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
              >
                <span className="flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5" /> Category
                </span>
                {expandedSections.has('category') ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {expandedSections.has('category') && (
                <div className="space-y-1.5">
                  {ALL_CATEGORIES.map(cat => (
                    <label
                      key={cat}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                        filters.categories.includes(cat) ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-surface border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(cat)}
                        onChange={() => toggleArrayFilter(filters.categories, cat, 'categories')}
                        className="rounded border-border-theme text-indigo-400 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-text-primary">{cat.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Resource Type */}
            <div>
              <button
                onClick={() => toggleSection('resource')}
                className="flex items-center justify-between w-full text-xs font-bold text-text-secondary uppercase tracking-wider mb-2"
              >
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" /> Resource Type
                </span>
                {expandedSections.has('resource') ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {expandedSections.has('resource') && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {ALL_RESOURCE_TYPES.map(rt => (
                    <label
                      key={rt}
                      className={`flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        filters.resourceTypes.includes(rt) ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-surface border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.resourceTypes.includes(rt)}
                        onChange={() => toggleArrayFilter(filters.resourceTypes, rt, 'resourceTypes')}
                        className="rounded border-border-theme text-indigo-400 focus:ring-indigo-500"
                      />
                      <span className="text-[11px] font-bold text-text-primary">{rt.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Risk Score */}
            <div>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Min Risk Score
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.minRiskScore}
                  onChange={e => onChange({ minRiskScore: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-border-theme rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-xs font-bold text-text-primary w-10 text-right">{filters.minRiskScore}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Compliance Panel ─────────────────────────────────────────────────────────

const CompliancePanel: React.FC<{
  mappings: ComplianceMapping[];
  isLoading: boolean;
}> = ({ mappings, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-surface rounded-2xl border border-border-theme p-6 shadow-sm">
        <div className="h-4 w-40 bg-surface-secondary rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    COMPLIANT: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: <CheckCircle2 className="h-4 w-4" /> },
    NON_COMPLIANT: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: <AlertTriangle className="h-4 w-4" /> },
    PARTIAL: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', icon: <AlertTriangle className="h-4 w-4" /> },
    NOT_APPLICABLE: { bg: 'bg-surface', text: 'text-text-muted', border: 'border-border-theme', icon: <Eye className="h-4 w-4" /> },
  };

  return (
    <div className="bg-surface rounded-2xl border border-border-theme shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border-theme bg-surface/50">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-400" />
          <h3 className="text-xs font-black text-text-primary uppercase tracking-widest">Compliance Mapping</h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {mappings.map((m, i) => {
          const config = statusConfig[m.status];
          return (
            <div key={i} className={`p-4 rounded-xl border ${config.border} ${config.bg} transition-all hover:shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {config.icon}
                  <span className="text-sm font-bold text-text-primary">{m.framework} — {m.controlId}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${config.bg} ${config.text} border ${config.border}`}>
                  {m.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs font-bold text-text-primary">{m.controlName}</p>
              <p className="text-[11px] text-text-secondary mt-1">{m.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: AuditLogFilters = {
  searchQuery: '',
  categories: [],
  severities: [],
  actions: [],
  resourceTypes: [],
  timeRange: '30D',
  customDateFrom: '',
  customDateTo: '',
  actorSearch: '',
  resourceSearch: '',
  minRiskScore: 0,
  maxRiskScore: 100,
  sortBy: 'timestamp',
  sortDirection: 'DESC',
};

export const AuditLogCenter: React.FC = () => {
  const [metrics, setMetrics] = useState<AuditMetrics | null>(null);
  const [timelineGroups, setTimelineGroups] = useState<AuditTimelineGroup[]>([]);
  const [complianceMappings, setComplianceMappings] = useState<ComplianceMapping[]>([]);
  const [filters, setFilters] = useState<AuditLogFilters>(DEFAULT_FILTERS);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(true);
  const [isLoadingCompliance, setIsLoadingCompliance] = useState(true);

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamCount, setStreamCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<'timeline' | 'compliance'>('timeline');
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Data Loading ───────────────────────────────────────────────────────

  const loadMetrics = useCallback(async () => {
    setIsLoadingMetrics(true);
    const data = await AuditLogService.getMetrics();
    setMetrics(data);
    setIsLoadingMetrics(false);
  }, []);

  const loadTimeline = useCallback(async () => {
    setIsLoadingTimeline(true);
    const groups = await AuditLogService.getTimelineGroups({
      searchQuery: filters.searchQuery,
      categories: filters.categories,
      severities: filters.severities,
      resourceTypes: filters.resourceTypes,
      timeRange: filters.timeRange,
      customDateFrom: filters.customDateFrom,
      customDateTo: filters.customDateTo,
      actorSearch: filters.actorSearch,
      minRiskScore: filters.minRiskScore,
      maxRiskScore: filters.maxRiskScore,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
    });
    setTimelineGroups(groups);
    setIsLoadingTimeline(false);
  }, [filters]);

  const loadCompliance = useCallback(async () => {
    setIsLoadingCompliance(true);
    const data = await AuditLogService.getComplianceMappings();
    setComplianceMappings(data);
    setIsLoadingCompliance(false);
  }, []);

  useEffect(() => {
    loadMetrics();
    loadCompliance();
  }, [loadMetrics, loadCompliance]);

  useEffect(() => {
    const debounce = setTimeout(loadTimeline, 300);
    return () => clearTimeout(debounce);
  }, [loadTimeline]);

  // ─── Real-time Streaming ────────────────────────────────────────────────

  const toggleStreaming = useCallback(() => {
    if (isStreaming) {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      setIsStreaming(false);
    } else {
      setIsStreaming(true);
      streamIntervalRef.current = setInterval(async () => {
        const event = await AuditLogService.streamEvent();
        if (event.entry) {
          setStreamCount(prev => prev + 1);
          // Prepend to timeline if today's group exists, or create it
          const today = new Date().toISOString().split('T')[0];
          setTimelineGroups(prev => {
            const existing = prev.find(g => g.date === today);
            if (existing) {
              return prev.map(g =>
                g.date === today
                  ? { ...g, entries: [event.entry!, ...g.entries], totalEvents: g.totalEvents + 1 }
                  : g
              );
            }
            return [
              {
                date: today,
                label: 'Today',
                entries: [event.entry!],
                totalEvents: 1,
                criticalCount: event.entry!.severity === 'CRITICAL' || event.entry!.severity === 'EMERGENCY' ? 1 : 0,
              },
              ...prev,
            ];
          });
        }
      }, 5000);
    }
  }, [isStreaming]);

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  // ─── Filter Handlers ────────────────────────────────────────────────────

  const updateFilters = (updates: Partial<AuditLogFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // ─── Export ─────────────────────────────────────────────────────────────

  const handleExportCSV = async () => {
    const entries = await AuditLogService.getEntries(filters);
    const headers = ['ID', 'Timestamp', 'Category', 'Severity', 'Action', 'Resource', 'Description', 'Actor', 'Actor Email', 'IP', 'Region', 'Risk Score'];
    const rows = entries.map(e => [
      e.id, e.timestamp, e.category, e.severity, e.action,
      `${e.resourceType}:${e.resourceName}`, `"${e.description}"`,
      e.actorName, e.actorEmail, e.actorIp, e.region, String(e.riskScore),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 font-sans">
      <div className="max-w-[1500px] mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-surface p-6 rounded-3xl border border-border-theme shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-surface-secondary text-text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border border-border-theme">
                <Shield className="h-4 w-4" /> Enterprise Security
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Audit Log & Activity Timeline</h1>
            <p className="text-sm text-text-muted mt-2 max-w-xl">
              Centralized audit trail with real-time streaming, multi-criteria filtering, compliance mapping, and CSV export.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Streaming Toggle */}
            <button
              onClick={toggleStreaming}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                isStreaming
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-sm'
                  : 'bg-surface border-border-theme text-text-secondary hover:border-border-theme'
              }`}
            >
              <Radio className={`h-4 w-4 ${isStreaming ? 'animate-pulse text-emerald-500' : ''}`} />
              {isStreaming ? 'Streaming' : 'Stream Live'}
              {isStreaming && streamCount > 0 && (
                <span className="px-1.5 py-0.5 bg-emerald-500/200/20 text-emerald-400 rounded-full text-[10px] font-black">
                  {streamCount}
                </span>
              )}
            </button>

            {/* Refresh */}
            <button
              onClick={() => { loadMetrics(); loadTimeline(); loadCompliance(); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm font-bold text-text-secondary hover:bg-surface transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>

            {/* Export */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-blue text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </header>

        {/* Metrics */}
        <AuditLogMetrics metrics={metrics} isLoading={isLoadingMetrics} />

        {/* View Tabs */}
        <div className="flex items-center gap-2 bg-surface p-1.5 rounded-xl border border-border-theme shadow-sm w-fit">
          <button
            onClick={() => setActiveView('timeline')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeView === 'timeline' ? 'bg-primary-blue text-white shadow-md' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Clock className="h-4 w-4" /> Activity Timeline
          </button>
          <button
            onClick={() => setActiveView('compliance')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeView === 'compliance' ? 'bg-primary-blue text-white shadow-md' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Shield className="h-4 w-4" /> Compliance
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Filter Panel */}
          <div className="lg:col-span-3">
            <FilterPanel
              filters={filters}
              onChange={updateFilters}
              onReset={resetFilters}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />
          </div>

          {/* Timeline / Compliance */}
          <div className="lg:col-span-9">
            {activeView === 'timeline' ? (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search audit events by description, actor, resource, or ID..."
                    value={filters.searchQuery}
                    onChange={e => updateFilters({ searchQuery: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-surface border border-border-theme rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                  />
                  {filters.searchQuery && (
                    <button
                      onClick={() => updateFilters({ searchQuery: '' })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-secondary text-text-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Active Filters Display */}
                {(filters.categories.length > 0 || filters.severities.length > 0 || filters.resourceTypes.length > 0 || filters.minRiskScore > 0) && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-text-muted">Active:</span>
                    {filters.severities.map(s => (
                      <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-100 rounded-lg text-[11px] font-bold">
                        {s}
                        <button onClick={() => updateFilters({ severities: filters.severities.filter(x => x !== s) })}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {filters.categories.map(c => (
                      <span key={c} className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 text-purple-400 border border-purple-100 rounded-lg text-[11px] font-bold">
                        {c.replace(/_/g, ' ')}
                        <button onClick={() => updateFilters({ categories: filters.categories.filter(x => x !== c) })}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {filters.resourceTypes.map(r => (
                      <span key={r} className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-500/20 text-teal-400 border border-teal-100 rounded-lg text-[11px] font-bold">
                        {r.replace(/_/g, ' ')}
                        <button onClick={() => updateFilters({ resourceTypes: filters.resourceTypes.filter(x => x !== r) })}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {filters.minRiskScore > 0 && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-400 border border-red-100 rounded-lg text-[11px] font-bold">
                        Risk ≥ {filters.minRiskScore}
                        <button onClick={() => updateFilters({ minRiskScore: 0 })}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}

                {/* Timeline */}
                <AuditLogTimeline
                  groups={timelineGroups}
                  isLoading={isLoadingTimeline}
                  onSelectEntry={setSelectedEntry}
                />
              </div>
            ) : (
              <CompliancePanel mappings={complianceMappings} isLoading={isLoadingCompliance} />
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AuditLogDetailModal
        entry={selectedEntry}
        isOpen={selectedEntry !== null}
        onClose={() => setSelectedEntry(null)}
      />
    </div>
  );
};

export default AuditLogCenter;
