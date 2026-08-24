import React, { useState } from "react";
import { X, Activity, PlusCircle } from "lucide-react";
import { NephrologyPatient } from "../../../types/nephrologyTelemetry";

interface NephrologyAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdmitPatient: (patient: NephrologyPatient) => void;
}

export const NephrologyAdmissionModal: React.FC<NephrologyAdmissionModalProps> = ({
  isOpen,
  onClose,
  onAdmitPatient
}) => {
  const [name, setName] = useState("Jonathan Blair");
  const [mrn, setMrn] = useState("MRN-" + Math.floor(1000000 + Math.random() * 9000000));
  const [age, setAge] = useState<number>(54);
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [dryWeightKg, setDryWeightKg] = useState<number>(76.0);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(82.4);
  const [renalWardBed, setRenalWardBed] = useState("ICU-BED-09 (CRRT-STAT)");
  const [primaryEtiology, setPrimaryEtiology] = useState("Post-Cardiac Arrest Ischemic ATN with Oliguria");
  const [kdigoStage, setKdigoStage] = useState<NephrologyPatient["kdigoStage"]>("STAGE_3_FAILURE");
  const [currentModality, setCurrentModality] = useState<NephrologyPatient["currentModality"]>("CVVHDF_CONTINUOUS_HEMODIAFILTRATION");
  const [anticoagulation, setAnticoagulation] = useState<NephrologyPatient["anticoagulation"]>("REGIONAL_CITRATE_RCA");
  const [vascularAccess, setVascularAccess] = useState<NephrologyPatient["vascularAccess"]>("RIGHT_INTERNAL_JUGULAR_VAS_CATH");
  const [creatinine, setCreatinine] = useState<number>(4.25);
  const [potassium, setPotassium] = useState<number>(5.8);
  const [bicarbonate, setBicarbonate] = useState<number>(15.0);
  const [urineOutput1h, setUrineOutput1h] = useState<number>(10);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const uoNormalized = Number((urineOutput1h / dryWeightKg).toFixed(2));
    const fluidOverload = Number((((currentWeightKg - dryWeightKg) / dryWeightKg) * 100).toFixed(1));

    const newPatient: NephrologyPatient = {
      id: "NEPH-" + Math.floor(7100 + Math.random() * 899),
      mrn,
      name,
      age: Number(age),
      gender,
      dryWeightKg: Number(dryWeightKg),
      currentWeightKg: Number(currentWeightKg),
      heightCm: 174,
      bodySurfaceAreaM2: 1.92,
      renalWardBed,
      admissionDate: "Just now",
      triagePriority: "EMERGENT_STAT_DIALYSIS",
      primaryEtiology,
      attendingNephrologist: "Dr. Alistair Sterling, MD, FASN",
      leadDialysisNurse: "Jennifer Morales, BSN, CNN",
      kdigoStage,
      currentModality,
      anticoagulation,
      vascularAccess,
      vitals: {
        heartRate: 98,
        systolicBp: 112,
        diastolicBp: 68,
        meanArterialPressure: 83,
        spO2: 95,
        respiratoryRate: 20,
        coreTemperatureCelsius: 37.0
      },
      circuit: {
        bloodFlowRateQbMlMin: 200,
        effluentDoseMlKgHr: 25.0,
        dialysateFlowRateQdMlHr: 1000,
        replacementPreFilterFlowMlHr: 600,
        replacementPostFilterFlowMlHr: 300,
        ultrafiltrationRateNetMlHr: 200,
        accessPressureArterialMmHg: -100,
        returnPressureVenousMmHg: 120,
        filterInletPressureMmHg: 190,
        effluentPressureMmHg: -10,
        transmembranePressureTmpMmHg: 165,
        filterPressureDropDeltaPMmHg: 70,
        filtrationFractionPercent: 16.0,
        dialyzerMembraneModel: "Baxter Prismaflex ST150 AN69",
        filterRunTimeHours: 1.0,
        isFilterClottingRisk: false
      },
      citrate: {
        citrateSolutionType: "ACD_A",
        citrateInfusionRateMmolHr: 3.0,
        postFilterIonizedCalciumMmolL: 0.30,
        systemicIonizedCalciumMmolL: 1.16,
        calciumChlorideCompensationRateMlHr: 35.0,
        totalSerumCalciumMmolL: 2.20,
        totalToIonizedCalciumRatio: 1.90,
        isCitrateToxicitySuspected: false
      },
      electrolytes: {
        serumCreatinineMgDl: Number(creatinine),
        baselineCreatinineMgDl: 1.00,
        creatinineDeltaMultiplier: Number(creatinine),
        bloodUreaNitrogenMgDl: 78,
        bunToCreatinineRatio: 18.3,
        serumPotassiumMeqL: Number(potassium),
        serumSodiumMeqL: 136,
        serumChlorideMeqL: 100,
        serumBicarbonateHco3MeqL: Number(bicarbonate),
        serumPhosphorusMgDl: 5.8,
        serumMagnesiumMgDl: 2.2,
        serumAlbuminGDl: 3.0,
        bloodPh: 7.27,
        baseExcessDeficit: -7.5,
        serumLactateMmolL: 2.8,
        anionGapMeqL: 21.0,
        albuminCorrectedAnionGap: 23.5,
        deltaDeltaGapRatio: 1.25
      },
      urine: {
        urineOutputLast1HourMl: Number(urineOutput1h),
        urineOutputLast6HoursMl: Number(urineOutput1h) * 6,
        urineOutputLast12HoursMl: Number(urineOutput1h) * 12,
        urineOutputLast24HoursMl: Number(urineOutput1h) * 24,
        urineOutputNormalizedMlKgHr: uoNormalized,
        urineSpecificGravity: 1.014,
        urineSodiumMeqL: 52,
        urineCreatinineMgDl: 46,
        urineOsmolalityMosmKg: 320,
        fractionalExcretionOfSodiumFENa: 3.12,
        fractionalExcretionOfUreaFEUrea: 45.0,
        urinarySedimentType: "MUDDY_BROWN_GRANULAR_CASTS_ATN",
        isOliguric: uoNormalized < 0.5,
        isAnuric: uoNormalized === 0
      },
      clearance: {
        estimatedGfrCkdEpi: 14.5,
        creatinineClearanceCrCl: 16.8,
        daugirdasSinglePoolKtV: 1.40,
        ureaReductionRatioURRPercent: 66.0,
        effluentUreaNitrogenMgDl: 64,
        bloodUreaNitrogenPostDialysisMgDl: 27,
        soluteRemovalRateGramsPerDay: 38.0
      },
      fluidBalance: {
        intakeLast24HoursMl: 2800,
        outputLast24HoursMl: 4200,
        netCumulativeBalance24HoursMl: -1400,
        totalFluidOverloadPercentage: fluidOverload,
        prescribedDailyNetUltrafiltrationGoalMl: 2000,
        hourlyNetUltrafiltrationAchievedMlHr: 200
      },
      activeAlerts: [],
      dialysisEventsTimeline: [
        {
          timestamp: "Just now",
          event: "Patient admitted to Nephrology CRRT Unit. Circuit initialized.",
          modality: currentModality.split("_")[0],
          provider: "Dr. Alistair Sterling, MD"
        }
      ]
    };

    onAdmitPatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-black font-mono uppercase text-white">
                Direct Nephrology & CRRT Intake Setup
              </h2>
              <p className="text-xs text-slate-400">
                Register AKI Patient • Prescription & Vascular Line Setup • Baseline Biomarkers
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intake Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Patient Full Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Renal Bed Assignment:</label>
              <input
                type="text"
                value={renalWardBed}
                onChange={(e) => setRenalWardBed(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-bold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Age (Years):</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Gender:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Dry Weight (kg):</label>
              <input
                type="number"
                step={0.1}
                value={dryWeightKg}
                onChange={(e) => setDryWeightKg(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Current Weight (kg):</label>
              <input
                type="number"
                step={0.1}
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-rose-300 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Primary Renal Etiology / Diagnosis:</label>
            <input
              type="text"
              value={primaryEtiology}
              onChange={(e) => setPrimaryEtiology(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
            />
          </div>

          {/* Prescription Setup */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">KDIGO AKI Stage:</label>
              <select
                value={kdigoStage}
                onChange={(e) => setKdigoStage(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-rose-400 font-bold"
              >
                <option value="STAGE_3_FAILURE">Stage 3 Failure</option>
                <option value="STAGE_2_INJURY">Stage 2 Injury</option>
                <option value="STAGE_1_RISK">Stage 1 Risk</option>
                <option value="STAGE_0_NORMAL">Stage 0 Normal</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Dialytic Modality:</label>
              <select
                value={currentModality}
                onChange={(e) => setCurrentModality(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-cyan-300 font-bold"
              >
                <option value="CVVHDF_CONTINUOUS_HEMODIAFILTRATION">CVVHDF (Hemodiafiltration)</option>
                <option value="CVVH_CONTINUOUS_HEMOFILTRATION">CVVH (Hemofiltration)</option>
                <option value="SCUF_SLOW_CONTINUOUS_ULTRAFILTRATION">SCUF (Ultrafiltration)</option>
                <option value="SLED_SUSTAINED_LOW_EFFICIENCY">SLED (Low Efficiency)</option>
                <option value="PIRRT_PROLONGED_INTERMITTENT">PIRRT (Intermittent)</option>
                <option value="IHD_INTERMITTENT_HEMODIALYSIS">IHD (Standard HD)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Anticoagulation:</label>
              <select
                value={anticoagulation}
                onChange={(e) => setAnticoagulation(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-amber-300 font-bold"
              >
                <option value="REGIONAL_CITRATE_RCA">Regional Citrate (RCA)</option>
                <option value="SYSTEMIC_UNFRACTIONATED_HEPARIN">Systemic Heparin</option>
                <option value="ARGATROBAN_HIT">Argatroban (HIT)</option>
                <option value="SALINE_FLUSH_NO_ANTICOAGULATION">Saline Flush / None</option>
              </select>
            </div>
          </div>

          {/* Baseline Labs */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-mono text-xs font-black uppercase text-cyan-400">Baseline Renal Biomarkers</h4>
            <div className="grid grid-cols-4 gap-2 font-mono">
              <div>
                <label className="text-[10px] text-slate-400 block">Creatinine (mg/dL):</label>
                <input
                  type="number"
                  step={0.01}
                  value={creatinine}
                  onChange={(e) => setCreatinine(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-rose-400 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Potassium (mEq/L):</label>
                <input
                  type="number"
                  step={0.1}
                  value={potassium}
                  onChange={(e) => setPotassium(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-amber-300 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Bicarbonate (mEq/L):</label>
                <input
                  type="number"
                  step={0.1}
                  value={bicarbonate}
                  onChange={(e) => setBicarbonate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">1h Urine Output (mL):</label>
                <input
                  type="number"
                  value={urineOutput1h}
                  onChange={(e) => setUrineOutput1h(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-cyan-300 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950 border-t border-slate-800 -mx-4 -mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-wider rounded-lg shadow-lg shadow-cyan-950/80 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Admit & Prime Circuit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
