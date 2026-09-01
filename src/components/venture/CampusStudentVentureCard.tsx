import React from 'react';
import { Rocket, DollarSign, Users, ExternalLink, TrendingUp } from 'lucide-react';

interface CardProps {
  venture: {
    _id: string;
    startupName: string;
    campusName: string;
    studentFounderName: string;
    sectorDomain: string;
    fundingStage: string;
    targetInvestmentUsd: number;
    committedInvestmentUsd: number;
    investorCount: number;
    investmentStatus: string;
    pitchDeckUrl: string;
    executiveSummary: string;
  };
  onInvestClick: (ventureId: string) => void;
}

export const CampusStudentVentureCard: React.FC<CardProps> = ({ venture, onInvestClick }) => {
  const percentFunded = Math.min(
    Math.round((venture.committedInvestmentUsd / venture.targetInvestmentUsd) * 100),
    100
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
            {venture.sectorDomain} • {venture.fundingStage}
          </span>
          <span
            className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
              venture.investmentStatus === 'FULLY_COMMITTED'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
            }`}
          >
            {venture.investmentStatus}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">{venture.startupName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Founder: {venture.studentFounderName} • {venture.campusName}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400 block tracking-tight">
              ${venture.committedInvestmentUsd.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Target: ${venture.targetInvestmentUsd.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-950 rounded-full h-2.5 mb-4 border border-slate-800 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${percentFunded}%` }}
          />
        </div>

        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">{venture.executiveSummary}</p>

        <div className="bg-slate-950/40 rounded-2xl p-3.5 mb-5 space-y-2 text-xs border border-slate-800/40">
          <div className="flex justify-between">
            <span className="text-slate-400">Backers & Angel Angels:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              {venture.investorCount} Backers
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onInvestClick(venture._id)}
        disabled={venture.investmentStatus === 'FULLY_COMMITTED'}
        className={`w-full font-extrabold text-sm py-3 px-4 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
          venture.investmentStatus === 'FULLY_COMMITTED'
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20'
        }`}
      >
        <DollarSign className="w-4 h-4" />
        {venture.investmentStatus === 'FULLY_COMMITTED' ? 'Investment Target Met' : 'Commit Venture Investment'}
      </button>
    </div>
  );
};
