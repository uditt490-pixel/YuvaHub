import React from 'react';
import { Search, Filter, AlertCircle, Droplets, HeartPulse, Sparkles } from 'lucide-react';
import { TraumaTriageLevel, HemorrhagicShockClass, ResuscitationPhase } from '../../../types/traumaTelemetry';

interface TraumaFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTriageLevel: TraumaTriageLevel | 'ALL';
  onTriageChange: (level: TraumaTriageLevel | 'ALL') => void;
  selectedShockClass: HemorrhagicShockClass | 'ALL';
  onShockClassChange: (sc: HemorrhagicShockClass | 'ALL') => void;
  selectedPhase: ResuscitationPhase | 'ALL';
  onPhaseChange: (phase: ResuscitationPhase | 'ALL') => void;
  viewMode: 'GRID' | 'TABLE';
  onViewModeChange: (m: 'GRID' | 'TABLE') => void;
  filterCriticalOnly: boolean;
  onToggleCriticalOnly: () => void;
}

export const TraumaFilterToolbar: React.FC<TraumaFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedTriageLevel,
  onTriageChange,
  selectedShockClass,
  onShockClassChange,
  selectedPhase,
  onPhaseChange,
  viewMode,
  onViewModeChange,
  filterCriticalOnly,
  onToggleCriticalOnly
}) => {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300 shadow-md">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search patient by MRN, name, trauma bay, or mechanism..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition shadow-inner"
        />
      </div>

      {/* Filter Dropdowns & Toggles */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Triage Level Filter */}
        <select
          value={selectedTriageLevel}
          onChange={(e) => onTriageChange(e.target.value as any)}
          aria-label="Filter by Triage Level"
          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
        >
          <option value="ALL">All Triage Levels</option>
          <option value="LEVEL_1_STAT_ALPHA">Level 1 STAT Alpha</option>
          <option value="LEVEL_2_TRAUMA_BRAVO">Level 2 Trauma Bravo</option>
          <option value="LEVEL_3_URGENT_CHARLIE">Level 3 Urgent Charlie</option>
          <option value="LEVEL_4_NON_URGENT">Level 4 Non-Urgent</option>
        </select>

        {/* Shock Class Filter */}
        <select
          value={selectedShockClass}
          onChange={(e) => onShockClassChange(e.target.value as any)}
          aria-label="Filter by Hemorrhagic Shock Class"
          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="ALL">All Shock Classes</option>
          <option value="CLASS_IV_SEVERE_EXSANGUINATING">Class IV Severe Exsanguinating</option>
          <option value="CLASS_III_MODERATE_SHOCK">Class III Moderate Shock</option>
          <option value="CLASS_II_MILD_SHOCK">Class II Mild Shock</option>
          <option value="CLASS_I_COMPENSATED">Class I Compensated</option>
        </select>

        {/* Resuscitation Phase Filter */}
        <select
          value={selectedPhase}
          onChange={(e) => onPhaseChange(e.target.value as any)}
          aria-label="Filter by Resuscitation Phase"
          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="ALL">All Phases</option>
          <option value="PRIMARY_SURVEY_ATLS">Primary Survey (ATLS)</option>
          <option value="DAMAGE_CONTROL_RESUSCITATION">Damage Control Resus</option>
          <option value="ACTIVE_MTP_TRANSFUSION">Active MTP Transfusion</option>
          <option value="EMERGENT_SURGICAL_OR">Emergent Surgical OR</option>
          <option value="ANGIOGRAPHIC_EMBOLIZATION">Angiographic Embolization</option>
          <option value="POST_RESUSCITATION_ICU">Post-Resuscitation ICU</option>
          <option value="STABILIZED">Stabilized</option>
        </select>

        {/* Critical Alerts Only Toggle */}
        <button
          onClick={onToggleCriticalOnly}
          className={}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Critical SI / Lethal Triad
        </button>

        {/* View Switcher: Grid vs Table */}
        <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-0.5">
          <button
            onClick={() => onViewModeChange('GRID')}
            className={}
          >
            Beds Grid
          </button>
          <button
            onClick={() => onViewModeChange('TABLE')}
            className={}
          >
            Matrix Table
          </button>
        </div>
      </div>
    </div>
  );
};
