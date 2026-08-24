export type PediatricAgeGroup = 
  | "EXTREME_PRETERM_UNDER_28W"
  | "VERY_PRETERM_28_32W"
  | "LATE_PRETERM_32_37W"
  | "FULL_TERM_NEONATE_0_28D"
  | "INFANT_1_12M"
  | "TODDLER_1_3Y"
  | "YOUNG_CHILD_4_7Y"
  | "CHILD_8_12Y"
  | "ADOLESCENT_13_18Y";

export type PicuUnitCareLevel = 
  | "NICU_LEVEL_IV_QUATERNARY"
  | "NICU_LEVEL_III_HIGH_RISK"
  | "PICU_CARDIAC_CICU"
  | "PICU_MEDICAL_SURGICAL"
  | "PICU_ECMO_RESUSCITATION";

export type PediatricVentilationMode = 
  | "HFOV_HIGH_FREQUENCY_OSCILLATORY"
  | "CONVENTIONAL_PRVC_PRESSURE_REGULATED"
  | "NAVA_NEURALLY_ADJUSTED"
  | "BUBBLE_CPAP_NON_INVASIVE"
  | "HIGH_FLOW_NASAL_CANNULA_HFNC"
  | "INVASIVE_PC_SIMV"
  | "SPONTANEOUS_ROOM_AIR";

export type BroselowColorCode = 
  | "PINK_PREEMIE_UNDER_3KG"
  | "GREY_3_5KG"
  | "PINK_6_7KG"
  | "RED_8_9KG"
  | "PURPLE_10_11KG"
  | "YELLOW_12_14KG"
  | "WHITE_15_18KG"
  | "BLUE_19_23KG"
  | "ORANGE_24_29KG"
  | "GREEN_30_36KG"
  | "ADULT_OVER_36KG";

export interface PediatricVitalsTelemetry {
  heartRate: number; // Age-specific normal ranges
  systolicBp: number;
  diastolicBp: number;
  meanArterialPressure: number;
  respiratoryRate: number;
  spO2PreDuctalRightHandPercent: number; // Pre-ductal SpO2
  spO2PostDuctalFootPercent: number; // Post-ductal SpO2
  prePostDuctalSpO2Delta: number; // Warning >= 5% indicates PPHN or R-to-L shunting
  endTidalCo2MmHg: number;
  coreTemperatureCelsius: number;
  peripheralSkinTemperatureCelsius: number;
  centralPeripheralTempDelta: number; // >2°C indicates poor peripheral perfusion/shock
  perfusionIndexPI: number; // 0.2 - 20.0
  capillaryRefillTimeSeconds: number; // < 2 sec normal, > 3 sec shock
}

export interface IncubatorMicroEnvironment {
  isIncubatorActive: boolean;
  incubatorMode: "SERVO_SKIN_CONTROL" | "AIR_TEMPERATURE_CONTROL" | "RADIANT_WARMER_OPEN" | "CRIB_STANDARD";
  chamberAirTemperatureCelsius: number;
  chamberHumidityPercentage: number; // Target: 60 - 85% for micro-preemies
  skinServoTemperatureTargetCelsius: number; // Target: 36.5 - 37.5°C
  heaterPowerOutputPercentage: number;
  ambientNoiseLevelDba: number; // Noise limit < 45 dBA for neuro-protection
  transcutaneousBilirubinTcBMgDl: number;
  phototherapyActive: boolean;
  phototherapyIrradianceUWCm2Nm: number;
}

export interface PalsResuscitationDosing {
  broselowColor: BroselowColorCode;
  estimatedWeightKg: number;
  epinephrineIvIoBolusMg: number; // 0.01 mg/kg (0.1 mL/kg of 0.1 mg/mL)
  epinephrineEttBolusMg: number; // 0.1 mg/kg (0.1 mL/kg of 1 mg/mL)
  amiodaroneBolusMg: number; // 5 mg/kg for refractory VF/pVT
  atropineBolusMg: number; // 0.02 mg/kg (min 0.1 mg)
  adenosineFirstDoseMg: number; // 0.1 mg/kg for SVT (max 6 mg)
  adenosineSecondDoseMg: number; // 0.2 mg/kg (max 12 mg)
  calciumGluconate10PercentMl: number; // 0.6 mL/kg (60 mg/kg)
  sodiumBicarbonateMeq: number; // 1 mEq/kg (1 mL/kg of 8.4%)
  d10WFluidBolusMl: number; // 2 - 4 mL/kg for hypoglycemia (<45 mg/dL)
  isotonicSalineBolus10MlKg: number; // 10 mL/kg for cardiogenic shock / PPHN
  isotonicSalineBolus20MlKg: number; // 20 mL/kg for septic / hypovolemic shock
  defibrillationInitialJoules: number; // 2 J/kg
  defibrillationSubsequentJoules: number; // 4 J/kg
  synchronizedCardioversionInitialJoules: number; // 0.5 - 1.0 J/kg
  ettInternalDiameterCuffedMm: number; // (Age / 4) + 3.5
  ettInternalDiameterUncuffedMm: number; // (Age / 4) + 4.0
  ettLipInsertionDepthCm: number; // (Age / 2) + 12 or 3x ETT size
}

export interface PediatricPewsScore {
  behaviorScore: number; // 0 - 3 (Playing/Sleeping -> Lethargic/Confused)
  cardiovascularScore: number; // 0 - 3 (Pink -> Grey/Cyanotic, CRT > 4s, Tachycardia)
  respiratoryScore: number; // 0 - 3 (Normal -> Severe retractions, Stridor, Grunting)
  extraPointsNebulizer: number; // 0 or 2
  extraPointsPersistentEmesis: number; // 0 or 2
  totalPewsScore: number; // 0 - 13
  pewsRiskCategory: "LOW_ROUTINE" | "MEDIUM_INCREASED_MONITORING" | "HIGH_RAPID_RESPONSE" | "CRITICAL_STAT_PICU_CODE";
}

export interface OxygenationIndexPalicc {
  meanAirwayPressurePawMmHg: number;
  fractionOfInspiredOxygenFiO2: number; // 0.21 - 1.0
  partialPressureOxygenPaO2: number; // mmHg from ABG
  oxygenSaturationSpO2: number; // %
  oxygenationIndexOI: number; // (Paw * FiO2 * 100) / PaO2
  oxygenSaturationIndexOSI: number; // (Paw * FiO2 * 100) / SpO2
  pardsClassification: "NO_PARDS" | "MILD_PARDS_OI_4_8" | "MODERATE_PARDS_OI_8_16" | "SEVERE_PARDS_OI_OVER_16";
  isEcmoEvaluationTriggered: boolean; // OI > 40 or refractory hypoxemia
}

export interface NeonatalMetabolicGir {
  glucoseInfusionRateMgKgMin: number; // (Rate mL/hr * Dextrose %) / (Wt kg * 6) Target: 4 - 8
  dextroseConcentrationPercent: number; // D10W, D12.5W, D15W
  totalIvFluidRateMlKgDay: number; // Target: 60 - 150 mL/kg/day
  serumGlucoseMgDl: number; // Hypoglycemia warning < 45 mg/dL
  bloodGasPh: number;
  baseDeficitMeqL: number;
  serumLactateMmolL: number;
  serumIonizedCalciumMmolL: number;
}

export interface PicuAlert {
  id: string;
  patientId: string;
  timestamp: string;
  severity: "CRITICAL_STAT" | "HIGH_WARNING" | "MODERATE_ALERT" | "INFO_PROTOCOL";
  category: "PALS_RESUSCITATION_ALERT" | "NEONATAL_HYPOGLYCEMIA" | "PPHN_DUCTAL_SHUNT" | "SEVERE_PARDS_OI" | "INCUBATOR_THERMAL_INSTABILITY" | "HIGH_PEWS_DETERIORATION";
  title: string;
  triggerMeasurement: string;
  expectedRange: string;
  clinicalRationale: string;
  suggestedAction: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedTimestamp?: string;
}

export interface PicuPatient {
  id: string;
  mrn: string;
  name: string;
  gestationalAgeWeeks: number; // e.g., 27.4 for micro-preemie, 40.0 for term
  chronologicalAgeDays: number;
  ageGroup: PediatricAgeGroup;
  gender: "MALE" | "FEMALE" | "OTHER";
  birthWeightGrams: number;
  currentWeightKg: number;
  lengthHeightCm: number;
  headCircumferenceCm: number;
  careUnit: PicuUnitCareLevel;
  bedIsoletteNumber: string;
  admissionDate: string;
  primaryDiagnosis: string;
  attendingPediatrician: string;
  leadPicuNurse: string;
  ventilationMode: PediatricVentilationMode;
  vitals: PediatricVitalsTelemetry;
  incubator: IncubatorMicroEnvironment;
  palsDosing: PalsResuscitationDosing;
  pews: PediatricPewsScore;
  oxygenation: OxygenationIndexPalicc;
  metabolic: NeonatalMetabolicGir;
  activeAlerts: PicuAlert[];
  resuscitationTimeline: Array<{
    timestamp: string;
    event: string;
    intervention: string;
    provider: string;
  }>;
}

export interface PicuCensusOverview {
  totalCensus: number;
  microPreemieCount: number; // < 28 weeks
  activeHfovVentCount: number;
  criticalPewsCount: number; // PEWS >= 6
  severePardsOiCount: number; // OI >= 16
  activeNitricOxideCount: number; // iNO for PPHN
  phototherapyActiveCount: number;
  averageIncubatorCompliancePercent: number;
}
