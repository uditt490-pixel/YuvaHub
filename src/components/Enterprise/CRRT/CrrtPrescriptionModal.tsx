import React, { useState } from "react";
import {
  X,
  Droplets,
  Plus,
  Calculator,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { CrrtPatient, CrrtModality, AnticoagulationMode, KdigoAkiStage } from "../../../types/crrtTelemetry";
import { CrrtTelemetryService } from "../../../services/CrrtTelemetryService";

interface CrrtPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrescribe: (patient: CrrtPatient) => void;
}

export const CrrtPrescriptionModal: React.FC<CrrtPrescriptionModalProps> = ({
  isOpen,
  onClose,
  onPrescribe
}) => {
  const [name, setName] = useState("");
  const [ageYears, setAgeYears] = useState(62);
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [weightKg, setWeightKg] = useState(78.0);
  const [heightCm, setHeightCm] = useState(172);
  const [admissionDiagnosis, setAdmissionDiagnosis] = useState("Septic Shock with AKI Stage 3 & Anuria");
  const [kdigoStage, setKdigoStage] = useState<KdigoAkiStage>("STAGE_3");
  const [modality, setModality] = useState<CrrtModality>("CVVHDF");
  const [anticoagulation, setAnticoagulation] = useState<AnticoagulationMode>("REGIONAL_CITRATE");
  const [vascularAccessLocation, setVascularAccessLocation] = useState("Right Internal Jugular 13.5 Fr Mahurkar");

  // Hydraulic & Fluid Prescription settings
  const [bloodFlowRateMlMin, setBloodFlowRateMlMin] = useState(180);
  const [preFilterReplacementMlHr, setPreFilterReplacementMlHr] = useState(1000);
  const [postFilterReplacementMlHr, setPostFilterReplacementMlHr] = useState(400);
  const [dialysateFlowMlHr, setDialysateFlowMlHr] = useState(800);
  const [netUltrafiltrationMlHr, setNetUltrafiltrationMlHr] = useState(150);

  if (!isOpen) return null;

  const totalEffluent = preFilterReplacementMlHr + postFilterReplacementMlHr + dialysateFlowMlHr + netUltrafiltrationMlHr;
  const deliveredDose = CrrtTelemetryService.calculateDeliveredEffluentDose(
    preFilterReplacementMlHr + postFilterReplacementMlHr,
    dialysateFlowMlHr,
    netUltrafiltrationMlHr,
    weightKg
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const patientId = `CRRT-PT-${Date.now().toString().slice(-4)}`;
    const mrn = `MRN-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const pPre = 175;
    const pRet = 90;
    const pEff = 15;
    const tmp = CrrtTelemetryService.calculateTmp(pPre, pRet, pEff);
    const deltaP = CrrtTelemetryService.calculateFilterDrop(pPre, pRet);
    const ff = CrrtTelemetryService.calculateFiltrationFraction(postFilterReplacementMlHr, netUltrafiltrationMlHr, bloodFlowRateMlMin);

    const newPatient: CrrtPatient = {
      id: patientId,
      mrn,
      name,
      ageYears,
      gender,
      weightKg,
      heightCm,
      admissionDiagnosis,
      kdigoStage,
      modality,
      anticoagulation,
      vascularAccessLocation,
      hydraulics: {
        accessPressureMmHg: -105,
        filterPrePressureMmHg: pPre,
        returnPressureMmHg: pRet,
        effluentPressureMmHg: pEff,
        transmembranePressureMmHg: tmp,
        filterPressureDropMmHg: deltaP,
        filtrationFractionPercent: ff,
        bloodFlowRateMlMin,
        filterLifeHours: 0.5,
        healthStatus: "OPTIMAL"
      },
      prescription: {
        preFilterReplacementMlHr,
        postFilterReplacementMlHr,
        dialysateFlowMlHr,
        netUltrafiltrationMlHr,
        totalEffluentFlowMlHr: totalEffluent,
        deliveredDoseMlKgHr: deliveredDose,
        prescribedDoseMlKgHr: 25.0
      },
      citrateTelemetry: {
        citrateInfusionRateMmolHr: anticoagulation === "REGIONAL_CITRATE" ? 22.0 : 0,
        calciumChlorideCompensationMlHr: anticoagulation === "REGIONAL_CITRATE" ? 8.0 : 0,
        postFilterIonizedCalciumMmolL: 0.28,
        systemicIonizedCalciumMmolL: 1.18,
        totalCalciumMmolL: 2.40,
        totalToIonizedCalciumRatio: 2.03,
        citrateToxicityRisk: "NONE"
      },
      metabolics: {
        serumCreatinineMgDl: 4.5,
        serumUreaNitrogenBUNMgDl: 78,
        potassiumMmolL: 4.8,
        bicarbonateMmolL: 20,
        sodiumMmolL: 138,
        ionizedCalciumMmolL: 1.18,
        phosphorusMgDl: 5.0,
        magnesiumMgDl: 2.1,
        arterialPh: 7.33,
        urineOutputMlKgHr: 0.08,
        cumulativeFluidBalanceLiters: 4.5,
        percentFluidOverload: 5.8
      },
      alerts: [],
      pressureHistory: {
        tmp: Array(8).fill(tmp),
        deltaP: Array(8).fill(deltaP),
        access: Array(8).fill(-105)
      }
    };

    onPrescribe(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-2xl text-cyan-400">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                New CRRT Hemodiafiltration Prescription
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                KDIGO AKI Guidelines (Target Delivered Effluent Dose: 20–25 mL/kg/h)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900 text-xs">
          {/* 1. Demographics */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
              1. Patient Demographics & Vascular Access
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400 font-semibold">Patient Full Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Suresh Raina"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Gender:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Age (Years):</label>
                <input
                  type="number"
                  min={18}
                  max={100}
                  value={ageYears}
                  onChange={(e) => setAgeYears(parseInt(e.target.value) || 60)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Weight (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 75)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Access Location:</label>
                <input
                  type="text"
                  value={vascularAccessLocation}
                  onChange={(e) => setVascularAccessLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Modality & Anticoagulation */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2">
              2. CRRT Modality & Anticoagulation Mode
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Modality:</label>
                <select
                  value={modality}
                  onChange={(e) => setModality(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="CVVHDF">CVVHDF (Hemodiafiltration - Convection + Diffusion)</option>
                  <option value="CVVH">CVVH (Pure Convection)</option>
                  <option value="CVVHD">CVVHD (Pure Diffusion)</option>
                  <option value="SCUF">SCUF (Slow Continuous Ultrafiltration)</option>
                  <option value="SLED">SLED (Sustained Low-Efficiency Diafiltration)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Anticoagulation:</label>
                <select
                  value={anticoagulation}
                  onChange={(e) => setAnticoagulation(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="REGIONAL_CITRATE">Regional Citrate (RCA with Calcium)</option>
                  <option value="SYSTEMIC_HEPARIN">Systemic Heparin Infusion</option>
                  <option value="NO_ANTICOAGULATION">No Anticoagulation (Saline Flushes)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Fluid Prescription Flow Rates */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
              3. Fluid Prescription & Effluent Flow Rates
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Blood Flow Q_b (mL/min):</label>
                <input
                  type="number"
                  value={bloodFlowRateMlMin}
                  onChange={(e) => setBloodFlowRateMlMin(parseInt(e.target.value) || 150)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Pre-Filter Q_rep (mL/h):</label>
                <input
                  type="number"
                  value={preFilterReplacementMlHr}
                  onChange={(e) => setPreFilterReplacementMlHr(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Post-Filter Q_rep (mL/h):</label>
                <input
                  type="number"
                  value={postFilterReplacementMlHr}
                  onChange={(e) => setPostFilterReplacementMlHr(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Dialysate Q_d (mL/h):</label>
                <input
                  type="number"
                  value={dialysateFlowMlHr}
                  onChange={(e) => setDialysateFlowMlHr(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Net UF Goal (mL/h):</label>
                <input
                  type="number"
                  value={netUltrafiltrationMlHr}
                  onChange={(e) => setNetUltrafiltrationMlHr(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <label className="text-slate-500 uppercase text-[9px] font-bold block">Delivered Dose:</label>
                <span className="text-base font-black text-emerald-400">{deliveredDose} mL/kg/h</span>
              </div>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Start CRRT Therapy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
