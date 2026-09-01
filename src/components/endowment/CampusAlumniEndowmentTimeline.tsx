import React from 'react';
import { Award, GraduationCap, DollarSign, Activity } from 'lucide-react';

interface TimelineProps {
  funds: any[];
}

export const CampusAlumniEndowmentTimeline: React.FC<TimelineProps> = ({ funds }) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            Alumni Endowment & Grant Disbursal Audit Ledger
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of alumni donations, corporate matching grants, and student disbursements.
          </p>
        </div>
        <span className="bg-slate-800 text-slate-300 font-semibold text-xs px-3 py-1 rounded-full border border-slate-700">
          {funds.length} Active Endowments
        </span>
      </div>

      {funds.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
          <Activity className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-sm font-medium">No endowment funds registered yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {funds.map((fund) => (
            <div
              key={fund._id}
              className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-slate-700"
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-1">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-base">{fund.fundName}</span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase bg-amber-500/10 text-amber-300 border-amber-500/30">
                      {fund.grantStatus}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Campus: {fund.campusName}</span>
                    <span>•</span>
                    <span>Donor: {fund.donorName} ('{fund.donorAlumniBatchYear})</span>
                    <span>•</span>
                    <span>Backers: {fund.totalDonorsCount}</span>
                  </div>
                </div>
              </div>

              <div className="text-right self-end sm:self-center w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                <div className="text-lg font-black text-amber-400">
                  Raised: ${fund.currentAmountRaisedUsd.toLocaleString()}
                </div>
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Target: ${fund.targetAmountUsd.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
