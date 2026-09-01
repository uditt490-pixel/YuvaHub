import React from 'react';
import { Cpu, ShieldCheck, DollarSign, Building2, FileCheck } from 'lucide-react';

interface CardProps {
  patent: {
    _id: string;
    patentTitle: string;
    campusName: string;
    leadInventorName: string;
    patentApplicationNumber: string;
    technologyDomain: string;
    patentStatus: string;
    licensingFeeUsd: number;
    royaltySharePercent: number;
    commercialPartnerAssigned?: string;
    abstractDescription: string;
  };
  onLicenseClick: (patentId: string) => void;
}

export const CampusResearchPatentCard: React.FC<CardProps> = ({ patent, onLicenseClick }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            {patent.technologyDomain}
          </span>
          <span
            className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
              patent.patentStatus === 'LICENSED'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
          >
            {patent.patentStatus}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">{patent.patentTitle}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              App #: {patent.patentApplicationNumber} • {patent.campusName}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-cyan-400 block tracking-tight">
              ${patent.licensingFeeUsd.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Licensing Fee</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">{patent.abstractDescription}</p>

        <div className="bg-slate-950/40 rounded-2xl p-3.5 mb-5 space-y-2 text-xs border border-slate-800/40">
          <div className="flex justify-between">
            <span className="text-slate-400">Lead Inventor:</span>
            <span className="font-bold text-white">{patent.leadInventorName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Royalty Share:</span>
            <span className="font-bold text-cyan-400">{patent.royaltySharePercent}% Commercial Royalty</span>
          </div>
          {patent.commercialPartnerAssigned && (
            <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800/60">
              <span>Licensed Partner:</span>
              <span>{patent.commercialPartnerAssigned}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onLicenseClick(patent._id)}
        disabled={patent.patentStatus === 'LICENSED'}
        className={`w-full font-extrabold text-sm py-3 px-4 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
          patent.patentStatus === 'LICENSED'
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
        }`}
      >
        <FileCheck className="w-4 h-4" />
        {patent.patentStatus === 'LICENSED' ? 'Commercialization License Active' : 'Acquire Commercial License'}
      </button>
    </div>
  );
};
