import React, { useState } from "react";
import {
  X,
  Heart,
  Activity,
  Zap,
  RotateCcw,
  Sliders,
  CheckCircle2,
  UserPlus,
  ShieldCheck,
  Droplets,
  Layers
} from "lucide-react";
import {
  CardioPatient,
  ScaiShockStage,
  ShockEtiology,
  McsDeviceType,
  CannulationConfiguration
} from "../../../types/cardiovascularTelemetry";
import { CardiovascularTelemetryService } from "../../../services/CardiovascularTelemetryService";

interface CardioAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdmit: (newPatient: CardioPatient) => void;
}

export const CardioAdmissionModal: React.FC<CardioAdmissionModalProps> = ({
  isOpen,
  onClose,
  onAdmit
}) => {
  const [name, setName] = useState("");
  const [mrn, setMrn] = useState(`MRN-CTICU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [bedNumber, setBedNumber] = useState("CTICU-09");
  const [age, setAge] = useState(58);
  const [sex, setSex] = useState<"MALE" | "FEMALE">("MALE");
  const [weightKg, setWeightKg] = useState(78);
  const [heightCm, setHeightCm] = useState(175);
  const [diagnosis, setDiagnosis] = useState("Acute Anterior Wall STEMI with Cardiogenic Shock Post-PCI");
  const [shockEtiology, setShockEtiology] = useState<ShockEtiology>("ACUTE_MYOCARDIAL_INFARCTION");
  const [scaiStage, setScaiStage] = useState<ScaiShockStage>("STAGE_C_CLASSIC");
  const [mcsDevice, setMcsDevice] = useState<McsDeviceType>("ECPELLA");
  const [cannulation, setCannulation] = useState<CannulationConfiguration>("PERIPHERAL_FEMORAL_FEMORAL");
  const [attending, setAttending] = useState("Dr. Alistair Sterling, MD, FACC");
  const [perfusionist, setPerfusionist] = useState("Sarah Jenkins, CCP");

  // Vitals & Invasives
  const [hr, setHr] = useState(102);
  const [sbp, setSbp] = useState(90);
  const [dbp, setDbp] = useState(60);
  const [cvp, setCvp] = useState(14);
  const [pas, setPas] = useState(38);
  const [pad, setPad] = useState(20);
  const [pcwp, setPcwp] = useState(18);
  const [co, setCo] = useState(4.5);

  // ECMO
  const [ecmoFlow, setEcmoFlow] = useState(3.5);
  const [ecmoRpm, setEcmoRpm] = useState(3800);
  const [sweepGas, setSweepGas] = useState(4.0);

  if (!isOpen) return null;

  const bsa = CardiovascularTelemetryService.calculateBSA(heightCm, weightKg);
  const map = CardiovascularTelemetryService.calculateMAP(sbp, dbp);
  const pp = CardiovascularTelemetryService.calculatePulsePressure(sbp, dbp);
  const ci = CardiovascularTelemetryService.calculateCardiacIndex(co, bsa);
  const sv = CardiovascularTelemetryService.calculateStrokeVolume(co, hr);
  const svi = CardiovascularTelemetryService.calculateSVI(sv, bsa);
  const cpo = CardiovascularTelemetryService.calculateCPO(map, co);
  const cpi = CardiovascularTelemetryService.calculateCPI(cpo, bsa);
  const svr = CardiovascularTelemetryService.calculateSVR(map, cvp, co);
  const pvr = CardiovascularTelemetryService.calculatePVR(Math.round((pas + 2 * pad) / 3), pcwp, co);
  const papi = CardiovascularTelemetryService.calculatePAPi(pas, pad, cvp);
  const lvswi = CardiovascularTelemetryService.calculateLVSWI(svi, map, pcwp);
  const rvswi = CardiovascularTelemetryService.calculateRVSWI(svi, Math.round((pas + 2 * pad) / 3), cvp);
  const si = CardiovascularTelemetryService.calculateShockIndex(hr, sbp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPatient: CardioPatient = {
      id: `cardio-patient-${Date.now()}`,
      mrn,
      name,
      age: Number(age),
      sex,
      bedNumber,
      bodySurfaceAreaM2: bsa,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      primaryDiagnosis: diagnosis,
      shockEtiology,
      scaiStage,
      mcsDevice,
      cannulation,
      hoursOnSupport: 1,
      dayInIcu: 1,
      attendingCardiologist: attending,
      primaryPerfusionist: perfusionist,
      hemodynamics: {
        heartRateBpm: Number(hr),
        rhythmStatus: "SINUS",
        systolicBloodPressureMmHg: Number(sbp),
        diastolicBloodPressureMmHg: Number(dbp),
        meanArterialPressureMmHg: map,
        pulsePressureMmHg: pp,
        centralVenousPressureMmHg: Number(cvp),
        pulmonaryArterySystolicMmHg: Number(pas),
        pulmonaryArteryDiastolicMmHg: Number(pad),
        pulmonaryArteryMeanMmHg: Math.round((pas + 2 * pad) / 3),
        pulmonaryCapillaryWedgePressureMmHg: Number(pcwp),
        cardiacOutputLpm: Number(co),
        cardiacIndexLpmM2: ci,
        strokeVolumeMl: sv,
        strokeVolumeIndexMlM2: svi,
        systemicVascularResistanceDynes: svr,
        pulmonaryVascularResistanceWoodUnits: pvr,
        cardiacPowerOutputWatts: cpo,
        cardiacPowerIndexWattsM2: cpi,
        pulmonaryArteryPulsatilityIndex: papi,
        leftVentricularStrokeWorkIndex: lvswi,
        rightVentricularStrokeWorkIndex: rvswi,
        transpulmonaryGradientMmHg: Math.max(0, Math.round((pas + 2 * pad) / 3) - pcwp),
        diastolicPulmonaryGradientMmHg: pad - pcwp,
        shockIndex: si,
        modifiedShockIndex: Number((hr / (map || 1)).toFixed(2))
      },
      ecmoTelemetry: {
        pumpSpeedRpm: Number(ecmoRpm),
        bloodFlowLpm: Number(ecmoFlow),
        sweepGasFlowLpm: Number(sweepGas),
        sweepGasFiO2Percent: 100,
        preMembranePressureP1MmHg: 200,
        postMembranePressureP2MmHg: 168,
        transmembranePressureGradientMmHg: 32,
        venousDrainagePressureP3MmHg: -50,
        arterialBloodTemperatureCelsius: 36.8,
        venousOxygenSaturationSvO2Percent: 70,
        postOxygenatorPO2MmHg: 360,
        postOxygenatorPCO2MmHg: 38,
        rightRadialNativeSpO2Percent: 96,
        lowerExtremityEcmoSpO2Percent: 99,
        harlequinDeltaSpO2Percent: 3,
        distalPerfusionCatheterFlowMlMin: 150
      },
      microaxialTelemetry: {
        impellaPLevel: "P-8",
        impellaFlowLpm: 3.2,
        motorCurrentMilliamps: 710,
        purgePressureMmHg: 420,
        purgeFlowRateMlHr: 12.0,
        opticalPlacementSignalStatus: "CORRECT_AORTIC_VALVE",
        iabpAugmentationRatio: "STANDBY",
        iabpAugmentedDiastolicMmHg: 0
      },
      vasoactiveSupport: {
        epinephrineMcgKgMin: 0.04,
        norepinephrineMcgKgMin: 0.06,
        vasopressinUnitsMin: 0.03,
        dobutamineMcgKgMin: 2.5,
        milrinoneMcgKgMin: 0.0,
        dopamineMcgKgMin: 0.0,
        angiotensinIINgKgMin: 0.0,
        vasoactiveInotropicScore: 312.5
      },
      anticoagulationLabs: {
        activatedClottingTimeSeconds: 195,
        antiXaActivityIuMl: 0.44,
        unfractionatedHeparinUnitsHr: 1100,
        bivalirudinMgKgHr: 0,
        fibrinogenMgDl: 250,
        freePlasmaHemoglobinMgDl: 16,
        lactateMmolL: 2.6,
        arterialPh: 7.36,
        arterialBaseExcessMeqL: -2.8,
        serumCreatinineMgDl: 1.3,
        plateletCountKUl: 180
      },
      alerts: [],
      lastUpdated: new Date().toISOString()
    };

    newPatient.alerts = CardiovascularTelemetryService.evaluateCardioAlerts(newPatient);
    onAdmit(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                CTICU / CCU Clinical Patient Admission
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Initiate Invasive Lines, Baseline Hemodynamics & MCS Circuit Configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Section 1: Demographics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4" /> 1. Patient Demographics & Bed Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel Bennett"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">MRN</label>
                <input
                  type="text"
                  value={mrn}
                  onChange={(e) => setMrn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Bed Number</label>
                <input
                  type="text"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as "MALE" | "FEMALE")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Calculated BSA: <strong className="text-cyan-300">{bsa} m²</strong> (Mosteller formula)
            </div>
          </div>

          {/* Section 2: Clinical Etiology & SCAI Stage */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4" /> 2. Diagnosis, Shock Classification & MCS Device
            </h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Primary Clinical Diagnosis</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Shock Etiology</label>
                <select
                  value={shockEtiology}
                  onChange={(e) => setShockEtiology(e.target.value as ShockEtiology)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="ACUTE_MYOCARDIAL_INFARCTION">Acute Myocardial Infarction</option>
                  <option value="ACUTE_DECOMPENSATED_HEART_FAILURE">Decompensated Heart Failure</option>
                  <option value="POST_CARDIOTOMY_SHOCK">Post-Cardiotomy Shock</option>
                  <option value="FULMINANT_MYOCARDITIS">Fulminant Myocarditis</option>
                  <option value="REFRACTORY_ARDS">Refractory ARDS</option>
                  <option value="MASSIVE_PULMONARY_EMBOLISM">Massive Pulmonary Embolism</option>
                  <option value="SEPTIC_CARDIOMYOPATHY">Septic Cardiomyopathy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">SCAI Shock Stage</label>
                <select
                  value={scaiStage}
                  onChange={(e) => setScaiStage(e.target.value as ScaiShockStage)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="STAGE_A_AT_RISK">Stage A (At Risk)</option>
                  <option value="STAGE_B_BEGINNING">Stage B (Beginning Shock)</option>
                  <option value="STAGE_C_CLASSIC">Stage C (Classic Shock)</option>
                  <option value="STAGE_D_DETERIORATING">Stage D (Deteriorating)</option>
                  <option value="STAGE_E_EXTREMIS">Stage E (Extremis / Arrest)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">MCS Support Device</label>
                <select
                  value={mcsDevice}
                  onChange={(e) => setMcsDevice(e.target.value as McsDeviceType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                >
                  <option value="ECPELLA">ECPELLA (VA-ECMO + Impella)</option>
                  <option value="VA_ECMO">VA-ECMO (Circulatory Support)</option>
                  <option value="VV_ECMO">VV-ECMO (Respiratory Support)</option>
                  <option value="IMPELLA_CP">Impella CP (Microaxial)</option>
                  <option value="IMPELLA_5_5">Impella 5.5 (Surgical)</option>
                  <option value="IMPELLA_RP">Impella RP (Right Heart)</option>
                  <option value="IABP">IABP Counterpulsation</option>
                  <option value="HEARTMATE_3_LVAD">HeartMate 3 LVAD</option>
                  <option value="NONE_PHARMACOLOGIC">Pharmacologic Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Baseline Hemodynamics */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" /> 3. Baseline Invasive Pressures & Thermodilution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">SBP (mmHg)</label>
                <input
                  type="number"
                  value={sbp}
                  onChange={(e) => setSbp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">DBP (mmHg)</label>
                <input
                  type="number"
                  value={dbp}
                  onChange={(e) => setDbp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">CVP (mmHg)</label>
                <input
                  type="number"
                  value={cvp}
                  onChange={(e) => setCvp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div>
                <label className="block text-xs text-slate-400 mb-1">PAS (mmHg)</label>
                <input
                  type="number"
                  value={pas}
                  onChange={(e) => setPas(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">PAD (mmHg)</label>
                <input
                  type="number"
                  value={pad}
                  onChange={(e) => setPad(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">PCWP / Wedge (mmHg)</label>
                <input
                  type="number"
                  value={pcwp}
                  onChange={(e) => setPcwp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Cardiac Output (L/min)</label>
                <input
                  type="number"
                  step="0.1"
                  value={co}
                  onChange={(e) => setCo(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Computed Derived Hemodynamics Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-400">MAP:</span> <strong className="text-cyan-300">{map} mmHg</strong>
              </div>
              <div>
                <span className="text-slate-400">CI:</span> <strong className="text-cyan-300">{ci} L/min/m²</strong>
              </div>
              <div>
                <span className="text-slate-400">CPO:</span> <strong className={cpo < 0.6 ? "text-red-400 font-black" : "text-emerald-400"}>{cpo} Watts</strong>
              </div>
              <div>
                <span className="text-slate-400">PAPi:</span> <strong className={papi < 0.9 ? "text-amber-400 font-bold" : "text-slate-200"}>{papi}</strong>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete Admission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
