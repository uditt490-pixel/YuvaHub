/**
 * Neonatal Intensive Care Unit (NICU) Telemetry & High-Frequency Ventilation Types
 * Standards Compliance: AAP Neonatal Guidelines, NRP 8th Edition, SNAPPE-II, Bhutani Nomogram, HL7 FHIR R4
 */

export type GestationalBracket =
  | "EXTREMELY_PRETERM"    // < 28 weeks
  | "VERY_PRETERM"         // 28 - 31 weeks
  | "MODERATE_LATE_PRETERM"// 32 - 36 weeks
  | "FULL_TERM"            // >= 37 weeks
  | "POST_TERM";           // >= 42 weeks

export type BirthWeightCategory =
  | "ELBW"                 // Extremely Low Birth Weight (< 1000g)
  | "VLBW"                 // Very Low Birth Weight (1000 - 1499g)
  | "LBW"                  // Low Birth Weight (1500 - 2499g)
  | "NBW";                 // Normal Birth Weight (>= 2500g)

export type NicuVentilatorMode =
  | "HFOV"                 // High-Frequency Oscillatory Ventilation
  | "HFJV"                 // High-Frequency Jet Ventilation
  | "SIMV_PRVC"            // Synchronized Intermittent Mandatory with PRVC
  | "NAVA"                 // Neurally Adjusted Ventilatory Assist
  | "BUBBLE_CPAP"          // Bubble Continuous Positive Airway Pressure
  | "HFNC"                 // High-Flow Nasal Cannula
  | "ROOM_AIR";

export type HieHypothermiaStatus =
  | "NOT_INDICATED"
  | "COOLING_IN_PROGRESS"   // Target Core Temp: 33.5 C (33.0 - 34.0 C)
  | "REWARMING_PHASE"       // 0.5 C every 2 hours
  | "NORMOTHERMIA_SURVEILLANCE";

export interface PrePostDuctalSpO2 {
  preDuctalRightWristSpO2: number;  // Pre-ductal (Right arm / pre-PDA)
  postDuctalFootSpO2: number;       // Post-ductal (Lower limb / post-PDA)
  gradientDeltaSpO2: number;        // Delta SpO2 = Pre - Post (Alert if > 10% indicates PPHN / R->L Shunt)
  cerebralNirsRso2Percent: number;  // Brain Tissue Oxygenation (Normal: 60 - 80%)
  somaticNirsRso2Percent: number;   // Renal/Somatic Oxygenation (Normal: 50 - 70%)
  fractionalTissueOxygenExtraction: number; // FTOE = (SpO2 - rSO2) / SpO2
}

export interface NicuVentilatorTelemetry {
  mode: NicuVentilatorMode;
  meanAirwayPressureCmH2O: number;   // mPaw (HFOV: 8 - 25 cmH2O)
  amplitudeDeltaPCmH2O: number;       // Delta P power / chest wiggle (HFOV: 15 - 50 cmH2O)
  frequencyHz: number;                // HFOV Frequency (8 - 15 Hz; 1 Hz = 60 breaths/min)
  inspiratoryTimePercent: number;     // e.g. 33% (1:2 ratio)
  fractionInspiredOxygenFiO2: number; // 0.21 - 1.00
  dco2GasTransportCoefficient: number;// DCO2 = Vt^2 * f (Alveolar CO2 elimination index)
  tidalVolumePerKgMl: number;        // e.g. 1.5 - 2.5 mL/kg for HFOV
  nitricOxidePpm: number;             // Inhaled Nitric Oxide (iNO: 0 - 20 ppm)
}

export interface NicuVitalSigns {
  heartRateBpm: number;              // Normal neonate: 120 - 160 bpm
  respiratoryRateBpm: number;        // Normal: 30 - 60 bpm
  systolicBloodPressureMmHg: number;
  diastolicBloodPressureMmHg: number;
  meanArterialPressureMmHg: number;  // Minimum MAP >= Gestational Age rule
  skinTemperatureCelsius: number;    // Normal: 36.5 - 37.5 C
  coreTemperatureCelsius: number;    // Cooling target: 33.5 C
  glucoseMgDl: number;               // Hypoglycemia alert if < 45 mg/dL
  serumBilirubinMgDl: number;        // Transcutaneous / Serum Total Bilirubin
  apgar1Min: number;
  apgar5Min: number;
  apgar10Min: number;
}

export interface NicuNutritionAndFluids {
  glucoseInfusionRateMgKgMin: number; // GIR = (Dextrose % * Rate mL/hr) / (6 * Wt kg) (Target: 4 - 8)
  totalFluidsMlKgDay: number;         // Day-of-Life adjusted fluid goal (e.g. 80 - 150 mL/kg/day)
  dextroseConcentrationPercent: number; // e.g. D10W, D12.5W, D15W
  trophicEnteralFeedMlKgDay: number; // Maternal Breast Milk / Donor Milk
  urineOutputMlKgHr: number;          // Normal: 1.5 - 3.0 mL/kg/hr
}

export interface NicuAlert {
  id: string;
  severity: "INFO" | "MONITOR" | "WARNING" | "CRITICAL";
  title: string;
  triggerMeasurement: string;
  expectedRange: string;
  clinicalMeaning: string;
  actionGuidance: string;
  timestamp: string;
}

export interface NicuPatient {
  id: string;
  mrn: string;
  name: string;
  sex: "MALE" | "FEMALE";
  gestationalAgeWeeks: number;        // e.g. 24.5 weeks
  postmenstrualAgeWeeks: number;      // PMA = GA + Chronological age
  dayOfLife: number;                  // DOL 1, 2, 3...
  birthWeightGrams: number;           // e.g. 680g
  currentWeightGrams: number;         // e.g. 710g
  weightCategory: BirthWeightCategory;
  gestationalBracket: GestationalBracket;
  bedNumber: string;                  // e.g. "NICU-POD-A-01"
  admissionDiagnosis: string;
  snappeScore: number;                // SNAPPE-II (0 - 162)
  vitals: NicuVitalSigns;
  prePostDuctal: PrePostDuctalSpO2;
  ventilation: NicuVentilatorTelemetry;
  nutrition: NicuNutritionAndFluids;
  hypothermia: HieHypothermiaStatus;
  phototherapyActive: boolean;
  alerts: NicuAlert[];
  vitalsHistory: {
    heartRate: number[];
    preDuctalSpO2: number[];
    postDuctalSpO2: number[];
    meanPressure: number[];
  };
}

export interface NicuWardMetrics {
  totalNicuCensus: number;
  elbwVlbwCount: number;             // < 1500g
  hfovActiveCount: number;           // High-frequency oscillators
  therapeuticHypothermiaCount: number;// Active HIE cooling
  prePostDuctalGradientCount: number;// Delta SpO2 > 10% (PPHN)
  phototherapyActiveCount: number;
  meanSnappeScore: number;
  lastTelemetrySyncTimestamp: string;
}
