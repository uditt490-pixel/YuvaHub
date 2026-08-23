import React, { useState } from "react";
import {
  X,
  Pill,
  Calculator,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ShieldAlert,
  Search,
  Scale
} from "lucide-react";
import { PicuTelemetryService } from "../../../services/PicuTelemetryService";

interface PicuDrugDosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeightKg?: number;
}

export const PicuDrugDosingModal: React.FC<PicuDrugDosingModalProps> = ({
  isOpen,
  onClose,
  initialWeightKg = 14.5
}) => {
  const [weightKg, setWeightKg] = useState(initialWeightKg);
  const [searchFilter, setSearchFilter] = useState("");

  if (!isOpen) return null;

  const drugGuidelines = PicuTelemetryService.getPediatricDrugDosingGuidelines(weightKg);
  const filteredDrugs = drugGuidelines.filter(
    (d) =>
      d.drugName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.indication.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-500/20 border border-violet-500/40 rounded-2xl text-violet-400">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                PALS Pediatric Resuscitation & High-Alert Drug Calculator
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Weight-Based Emergency Resuscitation, Sedation & Defibrillation Dosing Protocols
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Weight Adjuster & Search Bar */}
        <div className="bg-slate-950/70 p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-cyan-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block">Patient Weight (kg):</label>
              <div className="flex items-center gap-2 mt-0.5">
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="150"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1)}
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-black text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-xs text-slate-400 font-bold">kg</span>
              </div>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search emergency drugs or indications..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Drugs Table */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-900">
          <div className="grid grid-cols-1 gap-3">
            {filteredDrugs.map((drug, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 hover:border-violet-500/40 rounded-2xl p-4 transition-all shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{drug.drugName}</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 font-mono text-[10px] rounded font-bold">
                      {drug.standardDoseUnit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Indication: </span>
                    {drug.indication}
                  </p>
                  {drug.highAlertWarning && (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{drug.highAlertWarning}</span>
                    </div>
                  )}
                </div>

                {/* Calculated Patient Dose Callout */}
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-3 text-right min-w-[200px] shrink-0">
                  <span className="text-[10px] font-bold uppercase text-violet-400 block">Calculated Bedside Dose:</span>
                  <p className="text-base font-black text-violet-200 mt-0.5 font-mono">
                    {drug.calculatedPatientDose}
                  </p>
                  {drug.maxSingleDoseMg && (
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Max Single Dose: {drug.maxSingleDoseMg} mg
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Warning */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Always independently double-check high-alert pediatric infusions with a second licensed clinician.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
