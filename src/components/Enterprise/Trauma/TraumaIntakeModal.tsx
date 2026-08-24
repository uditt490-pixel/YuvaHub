import React, { useState } from "react";
import { X, Flame, ShieldAlert, PlusCircle, CheckCircle2 } from "lucide-react";
import { TraumaPatient } from "../../../types/traumaTelemetry";

interface TraumaIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdmitPatient: (patient: TraumaPatient) => void;
}

export const TraumaIntakeModal: React.FC<TraumaIntakeModalProps> = ({
  isOpen,
  onClose,
  onAdmitPatient
}) => {
  const [name, setName] = useState("Jackson Reed");
  const [mrn, setMrn] = useState("MRN-" + Math.floor(1000000 + Math.random() * 9000000));
  const [age, setAge] = useState<number>(29);
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [traumaBayNumber, setTraumaBayNumber] = useState("TB-01 (STAT RESUS)");
  const [triageLevel, setTriageLevel] = useState<TraumaPatient["triageLevel"]>("LEVEL_1_STAT_ALPHA");
  const [injuryMechanism, setInjuryMechanism] = useState("High-Velocity Motorcycle Collision into Guardrail (50 mph)");
  const [mechanismCategory, setMechanismCategory] = useState<TraumaPatient["mechanismCategory"]>("MOTOR_VEHICLE_COLLISION");
  const [primarySurgeon, setPrimarySurgeon] = useState("Dr. Elena Rostova, MD");
  const [hr, setHr] = useState<number>(134);
  const [sbp, setSbp] = useState<number>(78);
  const [dbp, setDbp] = useState<number>(46);
  const [gcsTotal, setGcsTotal] = useState<number>(9);
  const [fastPositive, setFastPositive] = useState<boolean>(true);
  const [reboaIndicated, setReboaIndicated] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const si = Number((hr / (sbp || 1)).toFixed(2));
    const rsig = Number(((sbp / (hr || 1)) * gcsTotal).toFixed(2));

    const newPatient: TraumaPatient = {
      id: "TRM-" + Math.floor(9000 + Math.random() * 999),
      mrn,
      name,
      age: Number(age),
      gender,
      traumaBayNumber,
      admissionTime: "Just now",
      triageLevel,
      injuryMechanism,
      mechanismCategory,
      primarySurgeon,
      leadTraumaNurse: "Sarah Jenkins, BSN, TCRN",
      currentPhase: "PRIMARY_SURVEY_ATLS",
      shockClass: sbp < 90 ? "CLASS_IV_SEVERE_EXSANGUINATING" : "CLASS_II_MILD_SHOCK",
      vitals: {
        heartRate: Number(hr),
        systolicBp: Number(sbp),
        diastolicBp: Number(dbp),
        meanArterialPressure: Math.round((Number(sbp) + 2 * Number(dbp)) / 3),
        pulsePressure: Number(sbp) - Number(dbp),
        spO2: 92,
        respiratoryRate: 26,
        endTidalCo2: 26,
        coreTemperatureCelsius: 34.6,
        temperatureProbeSite: "ESOPHAGEAL",
        invasiveArterialLineSite: "RIGHT_RADIAL",
        isShockIndexElevated: si > 0.9
      },
      gcs: {
        eyeResponse: 2,
        verbalResponse: 3,
        motorResponse: 4,
        totalGcs: Number(gcsTotal),
        pupilReactivity: "BILATERAL_REACTIVE",
        motorDeficitSide: "SYMMETRIC"
      },
      abg: {
        ph: 7.18,
        pao2: 88,
        paco2: 32,
        baseExcessDeficit: -9.5,
        lactateMmolL: 6.8,
        ionizedCalciumMmolL: 1.02,
        hemoglobinGdl: 7.4,
        hematocritPercent: 23,
        plateletCountK: 98,
        inr: 1.65,
        fibrinogenMgDl: 130,
        glucoseMgDl: 180,
        potassiumMeqL: 4.9,
        timestamp: "Just now"
      },
      fastExam: {
        pericardialSubxiphoid: "NEGATIVE",
        rightUpperQuadrantMorisons: fastPositive ? "POSITIVE_FREE_FLUID" : "NEGATIVE",
        leftUpperQuadrantSplenorenal: fastPositive ? "POSITIVE_FREE_FLUID" : "NEGATIVE",
        pelvicSuprapubic: fastPositive ? "POSITIVE_FREE_FLUID" : "NEGATIVE",
        rightThoraxHemothorax: "NEGATIVE",
        leftThoraxHemothorax: "NEGATIVE",
        rightLungPneumothoraxSlide: "PRESENT_NORMAL",
        leftLungPneumothoraxSlide: "PRESENT_NORMAL",
        totalPositiveQuadrants: fastPositive ? 3 : 0,
        performedTimestamp: "Just now",
        sonographer: primarySurgeon
      },
      reboa: {
        status: reboaIndicated ? "ACTIVE_OCCLUDED" : "NOT_INDICATED",
        zone: "ZONE_3_INFRARENAL",
        sheathSizeFr: 7,
        balloonInflationVolumeMl: 2.5,
        inflationStartTime: new Date().toISOString(),
        elapsedInflationMinutes: 1,
        maxRecommendedInflationMinutes: 60,
        distalPerfusionCheckPassed: true,
        proximalAorticMapMmHg: 75
      },
      txaStatus: {
        indicated: true,
        bolusAdministered: true,
        bolusTime: "Just now",
        infusionRunning: true,
        infusionStartTime: "Just now",
        injuryToTxaMinutes: 25,
        withinCrash2ThreeHourWindow: true,
        infusionRateMgPerHour: 125,
        totalTxaAdministeredGrams: 2.0
      },
      bloodLedger: {
        prbcUnitsTransfused: 4,
        ffpUnitsTransfused: 4,
        plateletPheresisUnitsTransfused: 1,
        cryoprecipitatePoolsTransfused: 1,
        wholeBloodUnitsTransfused: 0,
        cellSaverVolumeMl: 300,
        calciumChlorideGramsAdministered: 1.0,
        calciumDeficitUnitsPending: 0,
        prbcToFfpRatio: 1.0,
        prbcToPlateletRatio: 4.0,
        isBalancedMtpRatio: true,
        rapidInfuserFlowRateMlMin: 300,
        bloodWarmerTempCelsius: 41.5,
        activeCoolerNumber: 1,
        totalCoolersRequested: 2
      },
      tegRotem: {
        modality: "TEG_6S",
        reactionTimeMinutes_R: 11.2,
        clotKineticsMinutes_K: 3.8,
        alphaAngleDegrees: 48.0,
        maximumAmplitudeMm_MA: 44.0,
        clotLysisPercentage30Min_LY30: 5.4,
        estimatedFibrinogenContribution: 120,
        functionalFibrinogenMA: 12.0,
        coagulopathyInterpretation: "Trauma-Induced Coagulopathy with Hyperfibrinolysis (LY30 > 3%)",
        recommendedIntervention: "ADMINISTER_TXA_HYPERFIBRINOLYSIS",
        sampleTimestamp: "Just now"
      },
      aisIss: {
        headNeck: 2,
        face: 1,
        chest: 3,
        abdomenPelvis: 5,
        extremitiesPelvicGirdle: 4,
        externalBurns: 0,
        injurySeverityScore_ISS: 50,
        issMortalityCategory: "MAXIMAL_LETHAL_50_PLUS"
      },
      scores: {
        shockIndex: si,
        ageAdjustedShockIndex: Number((Number(age) * si).toFixed(1)),
        reverseShockIndexTimesGcs: rsig,
        abcScore: fastPositive ? 3 : 1,
        revisedTraumaScore_RTS: 5.820,
        tashScore: 18,
        lethalTriadIndex: {
          hypothermiaPresent: true,
          acidosisPresent: true,
          coagulopathyPresent: true,
          triadCount: 3,
          mortalityRiskPercent: 88
        }
      },
      allergies: ["NKDA"],
      intubationStatus: "ETT_VENTILATED",
      vascularAccess: {
        cordisIntroducerSites: ["Right Internal Jugular 8.5Fr"],
        peripheralIvGauges: ["Left Forearm 14G"],
        intraosseousNeedleSites: [],
        arterialLineSites: ["Right Radial 20G"]
      },
      activeAlerts: [],
      resuscitationEventsTimeline: [
        {
          timestamp: "Just now",
          phase: "PRIMARY_SURVEY_ATLS",
          event: "Trauma bay intake registered. MTP round 1 primed.",
          provider: primarySurgeon
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
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center">
              <Flame className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-black font-mono uppercase text-white">
                Direct Trauma Bay Intake & Resuscitation Setup
              </h2>
              <p className="text-xs text-slate-400">
                Register Level 1/2 Trauma Arrival • Primary Survey Baseline • MTP Activation
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
              <label className="font-bold text-slate-300 block mb-1">Trauma Bay / Bed Assignment:</label>
              <select
                value={traumaBayNumber}
                onChange={(e) => setTraumaBayNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-bold"
              >
                <option value="TB-01 (STAT RESUS)">TB-01 (STAT RESUS)</option>
                <option value="TB-02 (EMERGENT OR STAT)">TB-02 (EMERGENT OR STAT)</option>
                <option value="TB-03 (NEURO-TRAUMA)">TB-03 (NEURO-TRAUMA)</option>
                <option value="TB-04 (BLAST RESUS)">TB-04 (BLAST RESUS)</option>
                <option value="TB-05 (PEDS TRAUMA)">TB-05 (PEDS TRAUMA)</option>
                <option value="TB-06 (GERIATRIC TRAUMA)">TB-06 (GERIATRIC TRAUMA)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
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
              <label className="font-bold text-slate-300 block mb-1">Triage Level:</label>
              <select
                value={triageLevel}
                onChange={(e) => setTriageLevel(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-rose-400 font-bold"
              >
                <option value="LEVEL_1_STAT_ALPHA">Level 1 STAT Alpha</option>
                <option value="LEVEL_2_TRAUMA_BRAVO">Level 2 Trauma Bravo</option>
                <option value="LEVEL_3_URGENT_CHARLIE">Level 3 Urgent Charlie</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Mechanism of Injury & Scene Notes:</label>
            <input
              type="text"
              value={injuryMechanism}
              onChange={(e) => setInjuryMechanism(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100"
            />
          </div>

          {/* Initial Pre-hospital Vitals */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-mono text-xs font-black uppercase text-cyan-400">Baseline Triage Vitals & Scores</h4>
            <div className="grid grid-cols-4 gap-2 font-mono">
              <div>
                <label className="text-[10px] text-slate-400 block">HR (bpm):</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-rose-400 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Systolic BP:</label>
                <input
                  type="number"
                  value={sbp}
                  onChange={(e) => setSbp(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-rose-400 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Diastolic BP:</label>
                <input
                  type="number"
                  value={dbp}
                  onChange={(e) => setDbp(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Initial GCS (3-15):</label>
                <input
                  type="number"
                  min={3}
                  max={15}
                  value={gcsTotal}
                  onChange={(e) => setGcsTotal(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-amber-400 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fastPositive}
                  onChange={(e) => setFastPositive(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-0"
                />
                <span className="font-bold text-rose-300">Positive eFAST Ultrasound (Free Fluid in Abdomen/Pelvis)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reboaIndicated}
                  onChange={(e) => setReboaIndicated(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-0"
                />
                <span className="font-bold text-violet-300">REBOA Zone 3 Occlusion Indicated</span>
              </label>
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-wider rounded-lg shadow-lg shadow-rose-950/80 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Admit & Launch Resuscitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
