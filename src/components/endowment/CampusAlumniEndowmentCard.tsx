import React from 'react';
import { Award, GraduationCap, DollarSign, Users, Sparkles, CheckCircle2 } from 'lucide-react';

interface CardProps {
  fund: {
    _id: string;
    fundName: string;
    campusName: string;
    donorName: string;
    donorAlumniBatchYear: number;
    fundCategory: string;
    targetAmountUsd: number;
    currentAmountRaisedUsd: number;
    totalDonorsCount: number;
    grantStatus: string;
    matchingGrantEnabled: boolean;
    matchingRatio: number;
    description: string;
  };
  onDonateClick: (fundId: string) => void;
}

export const CampusAlumniEndowmentCard: React.FC<CardProps> = ({ fund, onDonateClick }) => {
  const percentRaised = Math.min(
    Math.round((fund.currentAmountRaisedUsd / fund.targetAmountUsd) * 100),
    100
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            Class of '{fund.donorAlumniBatchYear} • {fund.donorName}
          </span>
          <span
            className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
              fund.grantStatus === 'FULLY_FUNDED'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
            }`}
          >
            {fund.grantStatus}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">{fund.fundName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{fund.campusName} • Category: {fund.fundCategory}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-amber-400 block tracking-tight">
              ${fund.currentAmountRaisedUsd.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Target: ${fund.targetAmountUsd.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-950 rounded-full h-2.5 mb-4 border border-slate-800 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-yellow-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${percentRaised}%` }}
          />
        </div>

        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">{fund.description}</p>

        <div className="bg-slate-950/40 rounded-2xl p-3.5 mb-5 space-y-2 text-xs border border-slate-800/40">
          <div className="flex justify-between">
            <span className="text-slate-400">Alumni Donors:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              {fund.totalDonorsCount} Alumni Backers
            </span>
          </div>
          {fund.matchingGrantEnabled && (
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Alumni Matching Grant:</span>
              <span>{fund.matchingRatio}x Multiplier Active</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onDonateClick(fund._id)}
        disabled={fund.grantStatus === 'FULLY_FUNDED'}
        className={`w-full font-extrabold text-sm py-3 px-4 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
          fund.grantStatus === 'FULLY_FUNDED'
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20'
        }`}
      >
        <DollarSign className="w-4 h-4" />
        {fund.grantStatus === 'FULLY_FUNDED' ? 'Grant Fully Funded' : 'Contribute Alumni Micro-Grant'}
      </button>
    </div>
  );
};
