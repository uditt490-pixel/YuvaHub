export type KdigoAkiStage = 
  | "STAGE_0_NORMAL"
  | "STAGE_1_RISK"
  | "STAGE_2_INJURY"
  | "STAGE_3_FAILURE";

export type CrrtModality = 
  | "CVVHDF_CONTINUOUS_HEMODIAFILTRATION"
  | "CVVHD_CONTINUOUS_HEMODIALYSIS"
  | "CVVH_CONTINUOUS_HEMOFILTRATION"
  | "SCUF_SLOW_CONTINUOUS_ULTRAFILTRATION"
  | "PIRRT_PROLONGED_INTERMITTENT"
  | "SLED_SUSTAINED_LOW_EFFICIENCY"
  | "IHD_INTERMITTENT_HEMODIALYSIS"
  | "CONSERVATIVE_MEDICAL";

export type NephrologyTriagePriority = 
  | "EMERGENT_STAT_DIALYSIS"
  | "HIGH_CRITICAL_AKI"
  | "MODERATE_MONITORING"
  | "STABLE_MAINTENANCE";

export type AnticoagulationStrategy = 
  | "REGIONAL_CITRATE_RCA"
  | "SYSTEMIC_UNFRACTIONATED_HEPARIN"
  | "ARGATROBAN_HIT"
  | "PROSTACYCLIN_EPOPROSTENOL"
  | "SALINE_FLUSH_NO_ANTICOAGULATION";

export type DialysisVascularAccess = 
  | "RIGHT_INTERNAL_JUGULAR_VAS_CATH"
  | "LEFT_INTERNAL_JUGULAR_VAS_CATH"
  | "FEMORAL_VAS_CATH"
  | "SUBCLAVIAN_PERMCATH"
  | "RADIO_CEPHALIC_AV_FISTULA"
  | "BRACHIO_CEPHALIC_AV_GRAFT";

export interface CrrtCircuitTelemetry {
  bloodFlowRateQbMlMin: number; // typically 150 - 250 mL/min
  effluentDoseMlKgHr: number; // target 20 - 25 mL/kg/hr
  dialysateFlowRateQdMlHr: number; // 500 - 2000 mL/hr
  replacementPreFilterFlowMlHr: number;
  replacementPostFilterFlowMlHr: number;
  ultrafiltrationRateNetMlHr: number; // e.g. 100 - 300 mL/hr
  accessPressureArterialMmHg: number; // -50 to -150 mmHg (Warning < -200)
  returnPressureVenousMmHg: number; // 50 to 150 mmHg (Warning > +250)
  filterInletPressureMmHg: number; // 100 to 250 mmHg
  effluentPressureMmHg: number; // -50 to +50 mmHg
  transmembranePressureTmpMmHg: number; // < 250 mmHg (Clot alarm > 250-300)
  filterPressureDropDeltaPMmHg: number; // < 150 mmHg (Clot alarm > 200)
  filtrationFractionPercent: number; // target < 20-25%
  dialyzerMembraneModel: string; // e.g., "Prismaflex ST150 AN69 Surface Treated"
  filterRunTimeHours: number;
  isFilterClottingRisk: boolean;
}

export interface CitrateRcaProtocol {
  citrateSolutionType: "ACD_A" | "SODIUM_CITRATE_4_PERCENT" | "CITRATE_REGIONAL_SOLUTION";
  citrateInfusionRateMmolHr: number;
  postFilterIonizedCalciumMmolL: number; // Target: 0.25 - 0.35 mmol/L
  systemicIonizedCalciumMmolL: number; // Target: 1.10 - 1.30 mmol/L
  calciumChlorideCompensationRateMlHr: number; // e.g., 20 - 60 mL/hr of 10% CaCl2
  totalSerumCalciumMmolL: number; // e.g., 2.20 mmol/L
  totalToIonizedCalciumRatio: number; // Warning: > 2.5 indicates Citrate Accumulation / Toxicity
  isCitrateToxicitySuspected: boolean;
}

export interface RenalElectrolytePanel {
  serumCreatinineMgDl: number;
  baselineCreatinineMgDl: number;
  creatinineDeltaMultiplier: number; // current / baseline
  bloodUreaNitrogenMgDl: number;
  bunToCreatinineRatio: number;
  serumPotassiumMeqL: number; // Warning > 5.5 (Hyperkalemia), > 6.5 (STAT EKG Dialysis)
  serumSodiumMeqL: number;
  serumChlorideMeqL: number;
  serumBicarbonateHco3MeqL: number; // Warning < 15 (Severe Metabolic Acidosis)
  serumPhosphorusMgDl: number;
  serumMagnesiumMgDl: number;
  serumAlbuminGDl: number;
  bloodPh: number; // Arterial blood pH (Normal: 7.35-7.45)
  baseExcessDeficit: number;
  serumLactateMmolL: number;
  anionGapMeqL: number; // Na - (Cl + HCO3)
  albuminCorrectedAnionGap: number;
  deltaDeltaGapRatio: number; // (AG - 12) / (24 - HCO3)
}

export interface UrineBiomarkersOutput {
  urineOutputLast1HourMl: number;
  urineOutputLast6HoursMl: number;
  urineOutputLast12HoursMl: number;
  urineOutputLast24HoursMl: number;
  urineOutputNormalizedMlKgHr: number; // KDIGO staging: <0.5 for 6h = S1; <0.5 for 12h = S2; <0.3 for 24h/anuria = S3
  urineSpecificGravity: number;
  urineSodiumMeqL: number;
  urineCreatinineMgDl: number;
  urineOsmolalityMosmKg: number;
  fractionalExcretionOfSodiumFENa: number; // <1% Prerenal, >2% ATN
  fractionalExcretionOfUreaFEUrea: number; // <35% Prerenal with diuretics
  urinarySedimentType: "MUDDY_BROWN_GRANULAR_CASTS_ATN" | "HYALINE_CASTS_PRERENAL" | "RBC_CASTS_GLOMERULONEPHRITIS" | "WBC_CASTS_AINT" | "NORMAL_BLAND";
  isOliguric: boolean;
  isAnuric: boolean;
}

export interface SoluteClearanceMetrics {
  estimatedGfrCkdEpi: number; // mL/min/1.73m2
  creatinineClearanceCrCl: number; // Cockcroft-Gault mL/min
  daugirdasSinglePoolKtV: number; // Target > 1.2 per session (IHD) or > 1.4
  ureaReductionRatioURRPercent: number; // Target > 65%
  effluentUreaNitrogenMgDl: number;
  bloodUreaNitrogenPostDialysisMgDl: number;
  soluteRemovalRateGramsPerDay: number;
}

export interface FluidBalanceLedger {
  intakeLast24HoursMl: number;
  outputLast24HoursMl: number; // Urine + Drain + Blood loss
  netCumulativeBalance24HoursMl: number; // Positive = Fluid overload
  totalFluidOverloadPercentage: number; // (Cumulative Net Balance / Baseline Weight) * 100
  prescribedDailyNetUltrafiltrationGoalMl: number;
  hourlyNetUltrafiltrationAchievedMlHr: number;
}

export interface NephrologyAlert {
  id: string;
  patientId: string;
  timestamp: string;
  severity: "CRITICAL_STAT" | "HIGH_WARNING" | "MODERATE_ALERT" | "INFO_PROTOCOL";
  category: "HYPERKALEMIA_ECG_RISK" | "METABOLIC_ACIDOSIS" | "CIRCUIT_CLOTTING_TMP" | "CITRATE_TOXICITY" | "FLUID_OVERLOAD_PULMONARY_EDEMA" | "UREMIC_ENCEPHALOPATHY";
  title: string;
  triggerMeasurement: string;
  expectedRange: string;
  clinicalRationale: string;
  suggestedAction: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedTimestamp?: string;
}

export interface NephrologyPatient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  dryWeightKg: number;
  currentWeightKg: number;
  heightCm: number;
  bodySurfaceAreaM2: number;
  renalWardBed: string;
  admissionDate: string;
  triagePriority: NephrologyTriagePriority;
  primaryEtiology: string; // e.g., "Septic Shock ATN", "Cardiorenal Syndrome Type 1", "Rhabdomyolysis"
  attendingNephrologist: string;
  leadDialysisNurse: string;
  kdigoStage: KdigoAkiStage;
  currentModality: CrrtModality;
  anticoagulation: AnticoagulationStrategy;
  vascularAccess: DialysisVascularAccess;
  vitals: {
    heartRate: number;
    systolicBp: number;
    diastolicBp: number;
    meanArterialPressure: number;
    spO2: number;
    respiratoryRate: number;
    coreTemperatureCelsius: number;
  };
  circuit: CrrtCircuitTelemetry;
  citrate: CitrateRcaProtocol;
  electrolytes: RenalElectrolytePanel;
  urine: UrineBiomarkersOutput;
  clearance: SoluteClearanceMetrics;
  fluidBalance: FluidBalanceLedger;
  activeAlerts: NephrologyAlert[];
  dialysisEventsTimeline: Array<{
    timestamp: string;
    event: string;
    modality: string;
    provider: string;
  }>;
}

export interface NephrologyCensusOverview {
  totalRenalCensus: number;
  kdigoStage3Count: number;
  activeCrrtCircuitsCount: number;
  activeIhdSessionsCount: number;
  criticalHyperkalemiaCount: number; // K+ > 6.0
  citrateToxicityWarningCount: number; // Total Ca / iCa > 2.5
  filterClottingTmpAlarmsCount: number; // TMP > 250
  cumulativeFluidRemovedLiters: number;
}
