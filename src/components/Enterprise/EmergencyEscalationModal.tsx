import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Zap,
  Heart,
  Flame,
  Stethoscope,
  Activity,
  CheckCircle2,
  Radio,
  Send,
  UserCheck
} from 'lucide-react';
import { ClinicalPatientRecord, EmergencyProtocolType } from '../../types/clinicalTelemetry';
import { ClinicalTelemetryService } from '../../services/ClinicalTelemetryService';

interface EmergencyEscalationModalProps {
  patient: ClinicalPatientRecord | null;
  onClose: () => void;
  onEscalationSuccess: () => void;
}

export const EmergencyEscalationModal: React.FC<EmergencyEscalationModalProps> = ({
  patient,
  onClose,
  onEscalationSuccess,
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState<EmergencyProtocolType>('RAPID_RESPONSE_TEAM');
  const [clinicianName, setClinicianName] = useState('Dr. Devika Mukherjee, MD, FCCP');
  const [rationale, setRationale] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);

  if (!patient) return null;

  const protocolOptions: {
    id: EmergencyProtocolType;
    title: string;
    description: string;
    color: string;
    icon: any;
    targetTeam: string;
  }[] = [
    {
      id: 'CODE_BLUE',
      title: 'Code Blue (Cardiac / Respiratory Arrest)',
      description: 'Acute cardiopulmonary arrest, loss of airway or lethal ventricular tachyarrhythmia.',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      icon: Heart,
      targetTeam: 'ICU Resuscitation Team & Code Blue Pager Group',
    },
    {
      id: 'SEPSIS_PROTOCOL',
      title: 'Sepsis 1-Hour Bundle Protocol',
      description: 'Refractory septic shock, severe hyperlactatemia (>4.0 mmol/L), or qSOFA >= 2 with organ failure.',
      color: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      icon: Flame,
      targetTeam: 'Sepsis Response Unit & Antimicrobial Stewardship',
    },
    {
      id: 'RAPID_RESPONSE_TEAM',
      title: 'Rapid Response Team (RRT / Medical Alert)',
      description: 'Acute physiological deterioration, sustained desaturation (SpO2 < 88%) or MAP instability.',
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      icon: Activity,
      targetTeam: 'Critical Care RRT Nurse & On-Duty Fellow',
    },
    {
      id: 'CODE_STEMI',
      title: 'Code STEMI (Acute Coronary Emergency)',
      description: 'Acute ST-elevation myocardial infarction, malignant dysrhythmia or cardiogenic pump failure.',
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      icon: Zap,
      targetTeam: 'Interventional Cardiology Cath Lab Group',
    },
    {
      id: 'CRRT_EMERGENCY',
      title: 'CRRT & Hemodialysis Emergency',
      description: 'Hyperkalemia crisis, dialyzer circuit clotting, or severe oliguric anuria KDIGO 3.',
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      icon: Stethoscope,
      targetTeam: 'Nephrology Fellow & Renal Dialysis Specialist',
    },
    {
      id: 'MASSIVE_TRANSFUSION',
      title: 'Massive Transfusion Protocol (MTP)',
      description: 'Exsanguinating hemorrhage, trauma shock index > 1.3, uncorrected coagulopathy.',
      color: 'bg-red-500/20 text-red-400 border-red-500/40',
      icon: AlertTriangle,
      targetTeam: 'Blood Bank Emergency Desk & Trauma Surgery Lead',
    },
  ];

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationale.trim()) return;

    setIsSubmitting(true);
    const result = await ClinicalTelemetryService.triggerEmergencyEscalation({
      patientId: patient.id,
      protocolType: selectedProtocol,
      triggeredBy: clinicianName,
      clinicalRationale: rationale,
    });

    setIsSubmitting(false);
    setSuccessResult(result);
    onEscalationSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Emergency Clinical Protocol Dispatch
              </h3>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-slate-200">{patient.fullName}</strong> ({patient.mrn}) • {patient.bedNumber}
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

        {successResult ? (
          <div className="p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Emergency Protocol Successfully Dispatched</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Broadcasted priority alert to the clinical emergency team. Live vital snapshot captured with digital audit signature.
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 font-mono max-w-lg mx-auto">
              <div className="text-slate-400 flex justify-between">
                <span>Escalation ID:</span>
                <span className="text-cyan-400 font-bold">{successResult.id}</span>
              </div>
              <div className="text-slate-400 flex justify-between">
                <span>Protocol:</span>
                <span className="text-rose-400 font-bold">{successResult.protocolType}</span>
              </div>
              <div className="text-slate-400 flex justify-between">
                <span>Paging Status:</span>
                <span className="text-emerald-400 font-bold">{successResult.teamPagingStatus}</span>
              </div>
              <div className="text-slate-400 flex justify-between">
                <span>Digital Audit Sig:</span>
                <span className="text-slate-300 truncate max-w-[200px]">{successResult.auditSignature}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all cursor-pointer"
              >
                Return to Command Station
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleDispatch} className="p-5 overflow-y-auto space-y-4">
            {/* Protocol Selection Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Select Emergency Protocol Tier:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {protocolOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedProtocol === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedProtocol(opt.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? `${opt.color} ring-2 ring-cyan-400/40 bg-slate-950`
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold text-slate-100">{opt.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">{opt.description}</p>
                      <div className="text-[10px] text-cyan-400/80 font-mono mt-1">
                        Target: {opt.targetTeam}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Clinician Signature */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                Authorizing Clinician Name:
              </label>
              <input
                type="text"
                required
                value={clinicianName}
                onChange={(e) => setClinicianName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Clinical Rationale */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Clinical Rationale & Resuscitation Directives:
              </label>
              <textarea
                required
                rows={3}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Document physiological triggers (e.g., refractory hypotension MAP < 60 despite vasopressors, acute desaturation, rising arterial lactate)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-slate-600"
              />
            </div>

            {/* Warning Note */}
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>
                Dispatching this protocol will notify the dedicated hospital resuscitation team and escalate patient acuity to <strong>CRITICAL</strong> in the central command matrix.
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !rationale.trim()}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Paging Emergency Teams...' : 'Broadcast Emergency Protocol'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
