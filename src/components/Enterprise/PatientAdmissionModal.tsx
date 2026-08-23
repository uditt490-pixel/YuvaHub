import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Activity,
  Heart,
  Stethoscope,
  Cpu,
  Flame,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { ClinicalDomain, TelemetryVitals, BioAiBiomarkers } from '../../types/clinicalTelemetry';
import { ClinicalTelemetryService } from '../../services/ClinicalTelemetryService';

interface PatientAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdmitted: () => void;
}

export const PatientAdmissionModal: React.FC<PatientAdmissionModalProps> = ({
  isOpen,
  onClose,
  onPatientAdmitted,
}) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(55);
  const [sex, setSex] = useState<'M' | 'F' | 'OTHER'>('M');
  const [ward, setWard] = useState('Medical Intensive Care Unit (MICU)');
  const [bedNumber, setBedNumber] = useState('Bed 07');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [domain, setDomain] = useState<ClinicalDomain>('ICU_TELEMETRY');
  const [attendingPhysician, setAttendingPhysician] = useState('Dr. Devika Mukherjee, MD, FCCP');

  // Baseline Vitals
  const [heartRate, setHeartRate] = useState<number>(85);
  const [sbp, setSbp] = useState<number>(120);
  const [dbp, setDbp] = useState<number>(75);
  const [spO2, setSpO2] = useState<number>(98);
  const [rr, setRr] = useState<number>(16);
  const [temp, setTemp] = useState<number>(37.0);
  const [lactate, setLactate] = useState<number>(1.2);
  const [creatinine, setCreatinine] = useState<number>(1.0);
  const [urineOutput, setUrineOutput] = useState<number>(1.1);

  // Bio-AI Biomarkers
  const [pct, setPct] = useState<number>(0.2);
  const [aiRisk, setAiRisk] = useState<number>(0.25);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !primaryDiagnosis.trim()) return;

    setIsSubmitting(true);

    const vitals: TelemetryVitals = {
      heartRateBpm: Number(heartRate),
      systolicBpMmHg: Number(sbp),
      diastolicBpMmHg: Number(dbp),
      meanArterialPressureMmHg: ClinicalTelemetryService.calculateMAP(Number(sbp), Number(dbp)),
      spO2Percent: Number(spO2),
      respiratoryRateMin: Number(rr),
      temperatureCelsius: Number(temp),
      etCO2MmHg: 38,
      lactateMmolL: Number(lactate),
      cardiacOutputLMin: 5.2,
      cardiacIndexLMinM2: 2.8,
      creatinineMgDl: Number(creatinine),
      urineOutputMlKgHr: Number(urineOutput),
      cvpMmHg: 8,
      fiO2Percent: 21,
      peepCmH2O: 0,
      gcsScore: 15,
    };

    const biomarkers: BioAiBiomarkers = {
      troponinINgMl: 0.02,
      procalcitoninNgMl: Number(pct),
      dDimerMcgMl: 0.6,
      crpMgL: 12,
      bnpPgMl: 65,
      sepsisBiomarkerIndex: 20,
      genomicMutationBurdenMutsMb: 1.2,
      aiDeteriorationRiskScore: Number(aiRisk),
      predictiveShockHorizonMinutes: 180,
      immunoOncologyResponseProb: 0.1,
    };

    await ClinicalTelemetryService.admitPatient({
      fullName,
      age: Number(age),
      sex,
      ward,
      bedNumber,
      primaryDiagnosis,
      domain,
      attendingPhysician,
      vitals,
      biomarkers,
    });

    setIsSubmitting(false);
    onPatientAdmitted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Admit Patient to Real-Time Telemetry Node
              </h3>
              <p className="text-xs text-slate-400">
                Enroll patient into continuous multiparameter waveform and Bio-AI analytics tracking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Demographics & Admission Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Patient Demographics & Ward Allocation</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sumanth Narang"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Biological Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="M">Male (M)</option>
                  <option value="F">Female (F)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Clinical Domain</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="ICU_TELEMETRY">MICU / SICU Critical Care</option>
                  <option value="CARDIOVASCULAR">Cardiovascular & CCU</option>
                  <option value="NEPHROLOGY_CRRT">Nephrology & CRRT Unit</option>
                  <option value="PRECISION_ONCOLOGY">Precision Oncology</option>
                  <option value="EMERGENCY_MEDICINE">Trauma Emergency</option>
                  <option value="BIO_AI_DIAGNOSTICS">Bio-AI Predictive Diagnostics</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Ward / Unit</label>
                <input
                  type="text"
                  required
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Bed Number</label>
                <input
                  type="text"
                  required
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Primary Clinical Diagnosis</label>
              <input
                type="text"
                required
                placeholder="e.g. Acute Decompensated Heart Failure with Preserved Ejection Fraction"
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Attending Physician</label>
              <input
                type="text"
                required
                value={attendingPhysician}
                onChange={(e) => setAttendingPhysician(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Baseline Telemetry Vitals */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Baseline Multiparameter Telemetry Vitals</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  required
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  required
                  value={sbp}
                  onChange={(e) => setSbp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  required
                  value={dbp}
                  onChange={(e) => setDbp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  required
                  min={50}
                  max={100}
                  value={spO2}
                  onChange={(e) => setSpO2(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Respiratory Rate (/min)</label>
                <input
                  type="number"
                  required
                  value={rr}
                  onChange={(e) => setRr(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Core Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Serum Lactate (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={lactate}
                  onChange={(e) => setLactate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Creatinine (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={creatinine}
                  onChange={(e) => setCreatinine(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Admitting Patient...' : 'Enroll into Live Telemetry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
