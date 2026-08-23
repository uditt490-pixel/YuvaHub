import React, { useState } from "react";
import {
  X,
  Baby,
  Plus,
  Scale,
  Activity,
  Heart,
  Thermometer,
  ShieldCheck
} from "lucide-react";
import { NicuPatient, GestationalBracket, BirthWeightCategory, NicuVentilatorMode, HieHypothermiaStatus } from "../../../types/nicuTelemetry";
import { NicuTelemetryService } from "../../../services/NicuTelemetryService";

interface NicuAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdmit: (patient: NicuPatient) => void;
}

export const NicuAdmissionModal: React.FC<NicuAdmissionModalProps> = ({
  isOpen,
  onClose,
  onAdmit
}) => {
  const [name, setName] = useState("");
  const [sex, setSex] = useState<"MALE" | "FEMALE">("MALE");
  const [gestationalAgeWeeks, setGestationalAgeWeeks] = useState(28.0);
  const [birthWeightGrams, setBirthWeightGrams] = useState(1100);
  const [currentWeightGrams, setCurrentWeightGrams] = useState(1100);
  const [dayOfLife, setDayOfLife] = useState(1);
  const [bedNumber, setBedNumber] = useState("NICU-POD-A-04");
  const [admissionDiagnosis, setAdmissionDiagnosis] = useState("Prematurity (28w), Respiratory Distress Syndrome");
  const [mode, setMode] = useState<NicuVentilatorMode>("HFOV");
  const [meanAirwayPressureCmH2O, setMeanAirwayPressureCmH2O] = useState(12.0);
  const [amplitudeDeltaPCmH2O, setAmplitudeDeltaPCmH2O] = useState(24);
  const [frequencyHz, setFrequencyHz] = useState(12);
  const [fiO2, setFiO2] = useState(0.35);
  const [dextrosePercent, setDextrosePercent] = useState(10.0);
  const [fluidRateMlHr, setFluidRateMlHr] = useState(4.0);
  const [apgar1Min, setApgar1Min] = useState(4);
  const [apgar5Min, setApgar5Min] = useState(7);
  const [apgar10Min, setApgar10Min] = useState(8);
  const [phototherapyActive, setPhototherapyActive] = useState(false);

  if (!isOpen) return null;

  let weightCategory: BirthWeightCategory = "NBW";
  if (birthWeightGrams < 1000) weightCategory = "ELBW";
  else if (birthWeightGrams < 1500) weightCategory = "VLBW";
  else if (birthWeightGrams < 2500) weightCategory = "LBW";

  let gestationalBracket: GestationalBracket = "FULL_TERM";
  if (gestationalAgeWeeks < 28) gestationalBracket = "EXTREMELY_PRETERM";
  else if (gestationalAgeWeeks < 32) gestationalBracket = "VERY_PRETERM";
  else if (gestationalAgeWeeks < 37) gestationalBracket = "MODERATE_LATE_PRETERM";

  const gir = NicuTelemetryService.calculateGir(dextrosePercent, fluidRateMlHr, currentWeightGrams);
  const totalFluids = Math.round(((fluidRateMlHr * 24) / (currentWeightGrams / 1000)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const patientId = `NICU-PT-${Date.now().toString().slice(-4)}`;
    const mrn = `MRN-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newPatient: NicuPatient = {
      id: patientId,
      mrn,
      name,
      sex,
      gestationalAgeWeeks,
      postmenstrualAgeWeeks: Math.round((gestationalAgeWeeks + dayOfLife / 7) * 10) / 10,
      dayOfLife,
      birthWeightGrams,
      currentWeightGrams,
      weightCategory,
      gestationalBracket,
      bedNumber,
      admissionDiagnosis,
      snappeScore: 32,
      vitals: {
        heartRateBpm: 145,
        respiratoryRateBpm: mode === "HFOV" ? 0 : 44,
        systolicBloodPressureMmHg: 46,
        diastolicBloodPressureMmHg: 24,
        meanArterialPressureMmHg: 32,
        skinTemperatureCelsius: 36.8,
        coreTemperatureCelsius: 36.9,
        glucoseMgDl: 65,
        serumBilirubinMgDl: 4.8,
        apgar1Min,
        apgar5Min,
        apgar10Min
      },
      prePostDuctal: {
        preDuctalRightWristSpO2: 94,
        postDuctalFootSpO2: 92,
        gradientDeltaSpO2: 2,
        cerebralNirsRso2Percent: 68,
        somaticNirsRso2Percent: 60,
        fractionalTissueOxygenExtraction: 0.27
      },
      ventilation: {
        mode,
        meanAirwayPressureCmH2O,
        amplitudeDeltaPCmH2O: mode === "HFOV" ? amplitudeDeltaPCmH2O : 0,
        frequencyHz: mode === "HFOV" ? frequencyHz : 0,
        inspiratoryTimePercent: 33,
        fractionInspiredOxygenFiO2: fiO2,
        dco2GasTransportCoefficient: mode === "HFOV" ? 42.0 : 0,
        tidalVolumePerKgMl: mode === "HFOV" ? 1.8 : 4.5,
        nitricOxidePpm: 0
      },
      nutrition: {
        glucoseInfusionRateMgKgMin: gir,
        totalFluidsMlKgDay: totalFluids,
        dextroseConcentrationPercent: dextrosePercent,
        trophicEnteralFeedMlKgDay: 0,
        urineOutputMlKgHr: 2.2
      },
      hypothermia: "NOT_INDICATED",
      phototherapyActive,
      alerts: [],
      vitalsHistory: {
        heartRate: Array(8).fill(145),
        preDuctalSpO2: Array(8).fill(94),
        postDuctalSpO2: Array(8).fill(92),
        meanPressure: Array(8).fill(32)
      }
    };

    onAdmit(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-500/20 border border-pink-500/40 rounded-2xl text-pink-400">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                New Neonate Admission Intake
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                AAP Neonatal Resuscitation & High-Frequency Telemetry Setup
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-pink-400 border-b border-slate-800 pb-2">
              1. Demographics & Gestational Age
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400 font-semibold">Neonate Full Name / Identifier:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Baby Girl Singhania"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Sex:</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Gestational Age (Weeks):</label>
                <input
                  type="number"
                  step="0.1"
                  min={22}
                  max={43}
                  value={gestationalAgeWeeks}
                  onChange={(e) => setGestationalAgeWeeks(parseFloat(e.target.value) || 28)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Birth Weight (Grams):</label>
                <input
                  type="number"
                  value={birthWeightGrams}
                  onChange={(e) => {
                    const wt = parseInt(e.target.value) || 1000;
                    setBirthWeightGrams(wt);
                    setCurrentWeightGrams(wt);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Day of Life (DOL):</label>
                <input
                  type="number"
                  min={1}
                  value={dayOfLife}
                  onChange={(e) => setDayOfLife(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Ventilation Setup */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
              2. Respiratory Support & High-Frequency Ventilation
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-400">Ventilator Mode:</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                >
                  <option value="HFOV">HFOV (High-Frequency Oscillatory)</option>
                  <option value="HFJV">HFJV (High-Frequency Jet)</option>
                  <option value="SIMV_PRVC">SIMV-PRVC (Conventional)</option>
                  <option value="NAVA">NAVA (Neurally Adjusted)</option>
                  <option value="BUBBLE_CPAP">Bubble CPAP</option>
                  <option value="ROOM_AIR">Room Air</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">mPaw (cmH2O):</label>
                <input
                  type="number"
                  step="0.5"
                  value={meanAirwayPressureCmH2O}
                  onChange={(e) => setMeanAirwayPressureCmH2O(parseFloat(e.target.value) || 10)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">FiO2 (%):</label>
                <input
                  type="number"
                  step="0.05"
                  min={0.21}
                  max={1.0}
                  value={fiO2}
                  onChange={(e) => setFiO2(parseFloat(e.target.value) || 0.21)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* 3. Nutrition & Fluid Baseline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-2">
              3. Intravenous Fluids & Glucose Infusion Rate (GIR)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Dextrose Concentration (%):</label>
                <input
                  type="number"
                  step="0.5"
                  value={dextrosePercent}
                  onChange={(e) => setDextrosePercent(parseFloat(e.target.value) || 10)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Infusion Rate (mL/hr):</label>
                <input
                  type="number"
                  step="0.1"
                  value={fluidRateMlHr}
                  onChange={(e) => setFluidRateMlHr(parseFloat(e.target.value) || 3)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <label className="text-slate-500 uppercase text-[9px] font-bold block">Calculated GIR:</label>
                <span className="text-base font-black text-amber-300">{gir} mg/kg/min</span>
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
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black rounded-xl shadow-lg shadow-pink-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Admit Neonate to NICU
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
