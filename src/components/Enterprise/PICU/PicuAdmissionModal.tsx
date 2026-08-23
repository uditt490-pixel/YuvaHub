import React, { useState } from "react";
import {
  X,
  UserPlus,
  Heart,
  Wind,
  Droplets,
  ShieldCheck,
  Activity,
  CheckCircle2
} from "lucide-react";
import { PicuPatient, PicuWardPod, VentilatorMode, PicuAcuityLevel } from "../../../types/picuTelemetry";
import { PicuTelemetryService } from "../../../services/PicuTelemetryService";

interface PicuAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdmitPatient: (patient: PicuPatient) => void;
}

export const PicuAdmissionModal: React.FC<PicuAdmissionModalProps> = ({
  isOpen,
  onClose,
  onAdmitPatient
}) => {
  const [name, setName] = useState("");
  const [ageYears, setAgeYears] = useState(4);
  const [ageMonths, setAgeMonths] = useState(6);
  const [gender, setGender] = useState<"MALE" | "FEMALE">("FEMALE");
  const [weightKg, setWeightKg] = useState(16.5);
  const [bedNumber, setBedNumber] = useState("Bed 07 - General Pod");
  const [wardPod, setWardPod] = useState<PicuWardPod>("GENERAL_PICU");
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("Severe Community-Acquired Pneumonia with Impending Respiratory Failure");
  const [acuityLevel, setAcuityLevel] = useState<PicuAcuityLevel>("HIGH_ACUITY");
  const [attendingPhysician, setAttendingPhysician] = useState("Dr. Arvind Varma, MD");
  const [ventilatorMode, setVentilatorMode] = useState<VentilatorMode>("PRVC");

  // Vitals
  const [heartRate, setHeartRate] = useState(135);
  const [systolicBp, setSystolicBp] = useState(90);
  const [diastolicBp, setDiastolicBp] = useState(50);
  const [respiratoryRate, setRespiratoryRate] = useState(34);
  const [spO2, setSpO2] = useState(92);
  const [fiO2, setFiO2] = useState(0.50);
  const [peep, setPeep] = useState(8);
  const [paw, setPaw] = useState(14);

  if (!isOpen) return null;

  const ageBracket = PicuTelemetryService.calculateAgeBracket(ageYears, ageMonths);
  const calculatedMap = PicuTelemetryService.calculateMap(systolicBp, diastolicBp);
  const calculatedHollidaySegar = PicuTelemetryService.calculateHollidaySegarRate(weightKg);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const patientId = `PICU-PT-${Date.now().toString().slice(-4)}`;
    const mrn = `MRN-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const pulmonary = PicuTelemetryService.calculatePulmonaryIndices(fiO2, paw, 75, spO2);
    const compliance = PicuTelemetryService.calculateDynamicCompliance(weightKg * 7, 24, peep);
    const vis = PicuTelemetryService.calculateVis(
      {
        dopamineMcgKgMin: 0,
        dobutamineMcgKgMin: 0,
        epinephrineMcgKgMin: 0.05,
        norepinephrineMcgKgMin: 0,
        milrinoneMcgKgMin: 0,
        vasopressinUnitsKgMin: 0
      },
      { heartRate, systolicBp, ageBracket }
    );
    const pews = PicuTelemetryService.calculatePews(1, 1, 2, 0);
    const pelod2 = PicuTelemetryService.calculatePelod2(1, 1, 0, 2, 0);

    const newPatient: PicuPatient = {
      id: patientId,
      mrn,
      name,
      ageYears,
      ageMonths,
      ageBracket,
      gender,
      weightKg,
      admissionWeightKg: weightKg,
      heightCm: Math.round(weightKg * 3.5 + 40),
      bedNumber,
      wardPod,
      primaryDiagnosis,
      secondaryDiagnoses: ["Acute Respiratory Distress"],
      admissionDate: new Date().toISOString(),
      acuityLevel,
      codeStatus: "FULL_CODE_PALS",
      attendingPhysician,
      primaryNurse: "Assigned Staff RN",
      vitals: {
        heartRate,
        systolicBp,
        diastolicBp,
        meanArterialPressure: calculatedMap,
        respiratoryRate,
        spO2,
        coreTemperature: 38.2,
        etCO2: 42,
        centralVenousPressure: 8,
        capillaryRefillSeconds: 2.5,
        glasgowComaScale: 13
      },
      ventilator: {
        mode: ventilatorMode,
        fiO2,
        peakInspiratoryPressure: 24,
        peep,
        meanAirwayPressure: paw,
        tidalVolumeDelivered: Math.round(weightKg * 7),
        tidalVolumePerKg: 7.0,
        minuteVentilation: Math.round((weightKg * 7 * respiratoryRate) / 100) / 10,
        respiratoryRateSet: respiratoryRate,
        respiratoryRateTotal: respiratoryRate,
        inspiratoryTime: 0.7,
        ieRatio: "1:2.0",
        dynamicCompliance: compliance
      },
      abg: {
        timestamp: new Date().toISOString(),
        ph: 7.30,
        paCO2: 46,
        paO2: 75,
        hco3: 22.0,
        baseExcess: -2.8,
        lactate: 2.2,
        anionGap: 12
      },
      pulmonaryIndices: pulmonary,
      vasoactiveSupport: vis,
      fluidRenalStatus: {
        weightKg,
        admissionWeightKg: weightKg,
        hourlyUrineOutputMl: Math.round(weightKg * 1.2),
        urineOutputMlKgHr: 1.2,
        cumulativeIntakeMl24h: 300,
        cumulativeOutputMl24h: 200,
        fluidBalanceNet24h: 100,
        percentFluidOverload: 0.6,
        hollidaySegarMaintenanceRateMlHr: calculatedHollidaySegar,
        serumCreatinineMgDl: 0.45,
        baselineCreatinineMgDl: 0.45,
        pediatricKdigoAkiStage: "NONE"
      },
      pews,
      pelod2,
      activeAlerts: [],
      telemetrySparklines: {
        heartRateHistory: Array(30).fill(heartRate),
        meanArterialPressureHistory: Array(30).fill(calculatedMap),
        spO2History: Array(30).fill(spO2),
        respRateHistory: Array(30).fill(respiratoryRate),
        etCO2History: Array(30).fill(42)
      },
      emergencyProtocols: []
    };

    newPatient.activeAlerts = PicuTelemetryService.generateClinicalAlerts(newPatient);

    onAdmitPatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-2xl text-cyan-400">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Pediatric ICU Patient Admission & Telemetry Intake
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                PALS / PALICC-2 Compliant Intake with Automatic 4-2-1 Fluid Calculation
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
          {/* Demographics Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
              1. Demographics & Bed Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400 font-semibold">Patient Full Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samarth Gupta"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Gender:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Age (Years):</label>
                <input
                  type="number"
                  min={0}
                  max={18}
                  value={ageYears}
                  onChange={(e) => setAgeYears(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Age (Months):</label>
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Weight (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  min={1}
                  max={120}
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 10)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Assigned Bed:</label>
                <input
                  type="text"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Ward Pod:</label>
                <select
                  value={wardPod}
                  onChange={(e) => setWardPod(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="GENERAL_PICU">General Medical / Sepsis Pod</option>
                  <option value="HIGH_FREQUENCY_VENT_POD">High-Frequency Vent Pod (HFOV)</option>
                  <option value="CARDIAC_PICU">Cardiac PICU</option>
                  <option value="NEURO_PICU">Neuro PICU</option>
                  <option value="ISOLATION_PICU">Isolation Pod</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Initial Acuity Level:</label>
                <select
                  value={acuityLevel}
                  onChange={(e) => setAcuityLevel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="HIGH_ACUITY">High Acuity</option>
                  <option value="CRITICAL_INSTABILITY">Critical Instability</option>
                  <option value="ELEVATED_RISK">Elevated Risk</option>
                  <option value="MONITORING">Monitoring</option>
                  <option value="STABLE">Stable</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Primary Admission Diagnosis:</label>
              <input
                type="text"
                required
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Auto-Calculated Clinical Defaults */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px]">Age Bracket:</span>
              <p className="text-sm font-bold text-cyan-400 mt-0.5">{ageBracket}</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px]">4-2-1 Maintenance:</span>
              <p className="text-sm font-bold text-indigo-400 mt-0.5">{calculatedHollidaySegar} mL/hr</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px]">MAP (Estimated):</span>
              <p className="text-sm font-bold text-white mt-0.5">{calculatedMap} mmHg</p>
            </div>
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px]">Target Vt (6-8 mL/kg):</span>
              <p className="text-sm font-bold text-sky-400 mt-0.5">{Math.round(weightKg * 6)} - {Math.round(weightKg * 8)} mL</p>
            </div>
          </div>

          {/* Initial Vitals & Ventilator */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 border-b border-slate-800 pb-2">
              2. Initial Baseline Vitals & Ventilator Parameters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Heart Rate (bpm):</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(parseInt(e.target.value) || 120)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">BP (SBP / DBP):</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(parseInt(e.target.value) || 90)}
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                  <input
                    type="number"
                    value={diastolicBp}
                    onChange={(e) => setDiastolicBp(parseInt(e.target.value) || 50)}
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">SpO₂ (%):</label>
                <input
                  type="number"
                  value={spO2}
                  onChange={(e) => setSpO2(parseInt(e.target.value) || 95)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Vent Mode:</label>
                <select
                  value={ventilatorMode}
                  onChange={(e) => setVentilatorMode(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                >
                  <option value="PRVC">PRVC</option>
                  <option value="HFOV">HFOV</option>
                  <option value="SIMV_PC">SIMV-PC</option>
                  <option value="HFNC">HFNC</option>
                  <option value="ROOM_AIR">Room Air</option>
                </select>
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
              <UserPlus className="w-4 h-4" />
              Complete PICU Admission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
