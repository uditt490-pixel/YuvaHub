/**
 * Emergency Trauma Resuscitation & Massive Transfusion Protocol (MTP) Types
 * Domain: EMERGENCY_MEDICINE / TRAUMA_RESUSCITATION / MTP / TEG_ROTEM / ATLS
 * MedTrack Enterprise Clinical Telemetry Engine
 */

export type TraumaTriageLevel = 
  | "LEVEL_1_STAT_ALPHA"    // Immediate life-threat, emergent operative/resuscitative intervention
  | "LEVEL_2_TRAUMA_BRAVO"   // High-risk mechanism, potential occult severe trauma
  | "LEVEL_3_URGENT_CHARLIE" // Moderate trauma, hemodynamically stable
  | "LEVEL_4_NON_URGENT";    // Minor localized injury

export type HemorrhagicShockClass = 
  | "CLASS_I_COMPENSATED"     // Blood loss <15% (<750ml), Normal vitals, Mild anxiety
  | "CLASS_II_MILD_SHOCK"     // Blood loss 15-30% (750-1500ml), Tachycardia >100, Tachypnea, Narrow PP
  | "CLASS_III_MODERATE_SHOCK"// Blood loss 30-40% (1500-2000ml), Hypotension SBP <90, HR >120, Confusion
  | "CLASS_IV_SEVERE_EXSANGUINATING"; // Blood loss >40% (>2000ml), Profound collapse, HR >140, Anuria, Lethargy

export type ResuscitationPhase =
  | "PRE_HOSPITAL_TRIAGE"
  | "PRIMARY_SURVEY_ATLS"
  | "DAMAGE_CONTROL_RESUSCITATION"
  | "ACTIVE_MTP_TRANSFUSION"
  | "EMERGENT_SURGICAL_OR"
  | "ANGIOGRAPHIC_EMBOLIZATION"
  | "POST_RESUSCITATION_ICU"
  | "STABILIZED";

export type FastQuadrantStatus = "POSITIVE_FREE_FLUID" | "NEGATIVE" | "EQUIVOCAL" | "NOT_EXAMINED";

export interface FastUltrasoundExam {
  pericardialSubxiphoid: FastQuadrantStatus;
  rightUpperQuadrantMorisons: FastQuadrantStatus;
  leftUpperQuadrantSplenorenal: FastQuadrantStatus;
  pelvicSuprapubic: FastQuadrantStatus;
  rightThoraxHemothorax: FastQuadrantStatus;
  leftThoraxHemothorax: FastQuadrantStatus;
  rightLungPneumothoraxSlide: "PRESENT_NORMAL" | "ABSENT_PNEUMOTHORAX" | "EQUIVOCAL";
  leftLungPneumothoraxSlide: "PRESENT_NORMAL" | "ABSENT_PNEUMOTHORAX" | "EQUIVOCAL";
  totalPositiveQuadrants: number;
  performedTimestamp: string;
  sonographer: string;
}

export type ReboaZone = "ZONE_1_THORACIC" | "ZONE_3_INFRARENAL" | "DEFLATED" | "NONE";

export interface ReboaTelemetry {
  status: "ACTIVE_OCCLUDED" | "PARTIAL_REBOA" | "DEFLATED" | "STANDBY_SHEATH_IN_SITU" | "NOT_INDICATED";
  zone: ReboaZone;
  sheathSizeFr: number;
  balloonInflationVolumeMl: number;
  inflationStartTime?: string;
  elapsedInflationMinutes: number;
  maxRecommendedInflationMinutes: number; // Zone 1 = 30m, Zone 3 = 60m
  distalPerfusionCheckPassed: boolean;
  proximalAorticMapMmHg: number;
}

export interface TxaProtocolStatus {
  indicated: boolean;
  bolusAdministered: boolean;
  bolusTime?: string;
  infusionRunning: boolean;
  infusionStartTime?: string;
  injuryToTxaMinutes: number;
  withinCrash2ThreeHourWindow: boolean;
  infusionRateMgPerHour: number;
  totalTxaAdministeredGrams: number;
}

export interface BloodProductUnitLedger {
  prbcUnitsTransfused: number;
  ffpUnitsTransfused: number;
  plateletPheresisUnitsTransfused: number;
  cryoprecipitatePoolsTransfused: number;
  wholeBloodUnitsTransfused: number;
  cellSaverVolumeMl: number;
  calciumChlorideGramsAdministered: number;
  calciumDeficitUnitsPending: number; // 1g CaCl2 per 4 units pRBC recommended
  prbcToFfpRatio: number;             // Target 1.0 - 1.5
  prbcToPlateletRatio: number;        // Target 1.0 - 2.0
  isBalancedMtpRatio: boolean;        // True if 1:1:1 adherence +- 20%
  rapidInfuserFlowRateMlMin: number;
  bloodWarmerTempCelsius: number;
  activeCoolerNumber: number;
  totalCoolersRequested: number;
}

export interface TegRotemTelemetry {
  modality: "TEG_6S" | "ROTEM_DELTA" | "ROTEM_SIGMA" | "STANDARD_LABS";
  reactionTimeMinutes_R: number;       // Normal 5 - 10 min (TEG) / CT 100-240s (ROTEM)
  clotKineticsMinutes_K: number;       // Normal 1 - 3 min / CFT 70-150s
  alphaAngleDegrees: number;           // Normal 53 - 72 deg (Fibrinogen kinetic angle)
  maximumAmplitudeMm_MA: number;       // Normal 50 - 70 mm (Platelet & Fibrin strength)
  clotLysisPercentage30Min_LY30: number; // Normal 0 - 3% (>3% denotes Hyperfibrinolysis)
  estimatedFibrinogenContribution: number; // mg/dL
  functionalFibrinogenMA: number;      // Normal >15 mm
  coagulopathyInterpretation: string;
  recommendedIntervention: "NONE_NORMAL" | "ADMINISTER_FFP_PCC" | "ADMINISTER_CRYOPRECIPITATE" | "ADMINISTER_PLATELETS" | "ADMINISTER_TXA_HYPERFIBRINOLYSIS" | "COMBINED_COAGULOPATHY";
  sampleTimestamp: string;
}

export interface GcsScoreDetail {
  eyeResponse: number;    // 1-4
  verbalResponse: number; // 1-5
  motorResponse: number;  // 1-6
  totalGcs: number;       // 3-15
  pupilReactivity: "BILATERAL_REACTIVE" | "UNILATERAL_SLUGGISH" | "UNILATERAL_FIXED_DILATED" | "BILATERAL_FIXED_DILATED";
  motorDeficitSide?: "RIGHT_HEMIPARESIS" | "LEFT_HEMIPARESIS" | "SYMMETRIC" | "DECEREBRATE" | "DECORTICATE";
}

export interface AbbreviatedInjuryScale {
  headNeck: number;      // 0-6
  face: number;          // 0-6
  chest: number;         // 0-6
  abdomenPelvis: number; // 0-6
  extremitiesPelvicGirdle: number; // 0-6
  externalBurns: number; // 0-6
  injurySeverityScore_ISS: number; // Sum of top 3 AIS squared (0-75)
  issMortalityCategory: "MILD_UNDER_9" | "MODERATE_9_TO_15" | "SEVERE_16_TO_24" | "CRITICAL_25_TO_49" | "MAXIMAL_LETHAL_50_PLUS";
}

export interface TraumaScores {
  shockIndex: number;                  // HR / SBP (Normal: 0.5-0.7, >0.9 indicates shock, >1.3 critical)
  ageAdjustedShockIndex: number;       // Age * Shock Index (>50 high mortality)
  reverseShockIndexTimesGcs: number;   // (SBP / HR) * GCS (Normal >15, <10 critical instability)
  abcScore: number;                    // 0-4 (Penetrating + SBP<=90 + HR>=120 + FAST+). >=2 triggers MTP
  revisedTraumaScore_RTS: number;      // 0 - 7.8408 (0.9368 GCS + 0.7326 SBP + 0.2908 RR)
  tashScore: number;                   // Trauma Associated Severe Hemorrhage score
  lethalTriadIndex: {
    hypothermiaPresent: boolean;       // Temp < 35.0 deg C
    acidosisPresent: boolean;           // pH < 7.20 or Base Deficit > 6.0 mEq/L
    coagulopathyPresent: boolean;       // INR > 1.5, Plt < 100k, or abnormal TEG
    triadCount: number;                // 0 - 3
    mortalityRiskPercent: number;      // 0 = 10%, 1 = 25%, 2 = 50%, 3 = 85%+
  };
}

export interface TraumaArterialBloodGas {
  ph: number;
  pao2: number;
  paco2: number;
  baseExcessDeficit: number; // mEq/L
  lactateMmolL: number;
  lactateClearance2HrPercent?: number;
  ionizedCalciumMmolL: number;
  hemoglobinGdl: number;
  hematocritPercent: number;
  plateletCountK: number;
  inr: number;
  fibrinogenMgDl: number;
  glucoseMgDl: number;
  potassiumMeqL: number;
  timestamp: string;
}

export interface TraumaVitalTelemetry {
  heartRate: number;
  systolicBp: number;
  diastolicBp: number;
  meanArterialPressure: number;
  pulsePressure: number;
  spO2: number;
  respiratoryRate: number;
  endTidalCo2: number;
  coreTemperatureCelsius: number;
  temperatureProbeSite: "ESOPHAGEAL" | "BLADDER" | "TYMPANIC" | "RECTAL";
  invasiveArterialLineSite?: "RIGHT_RADIAL" | "LEFT_RADIAL" | "RIGHT_FEMORAL" | "LEFT_FEMORAL" | "BRACHIAL";
  centralVenousPressureMmHg?: number;
  isShockIndexElevated: boolean;
}

export interface TraumaAlert {
  id: string;
  patientId: string;
  severity: "CRITICAL_STAT" | "HIGH_WARNING" | "MODERATE_ALERT" | "CLINICAL_ADVISORY" | "NORMAL_STABLE";
  code: string;
  title: string;
  triggerMeasurement: string;
  expectedRange: string;
  clinicalRationale: string;
  suggestedAction: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
}

export interface TraumaPatient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  traumaBayNumber: string;
  admissionTime: string;
  triageLevel: TraumaTriageLevel;
  injuryMechanism: string;
  mechanismCategory: "MOTOR_VEHICLE_COLLISION" | "PENETRATING_BALLISTIC" | "PENETRATING_STAB" | "FALL_FROM_HEIGHT" | "BLAST_EXPLOSION" | "CRUSH_INDUSTRIAL" | "PEDESTRIAN_STRUCK" | "ASSAULT_BLUNT";
  primarySurgeon: string;
  leadTraumaNurse: string;
  currentPhase: ResuscitationPhase;
  shockClass: HemorrhagicShockClass;
  vitals: TraumaVitalTelemetry;
  gcs: GcsScoreDetail;
  abg: TraumaArterialBloodGas;
  fastExam: FastUltrasoundExam;
  reboa: ReboaTelemetry;
  txaStatus: TxaProtocolStatus;
  bloodLedger: BloodProductUnitLedger;
  tegRotem: TegRotemTelemetry;
  aisIss: AbbreviatedInjuryScale;
  scores: TraumaScores;
  allergies: string[];
  intubationStatus: "ETT_VENTILATED" | "CRICOTHYROIDOTOMY" | "SUPRAGLOTTIC_AIRWAY" | "NATURAL_SPONTANEOUS" | "HIGH_FLOW_NASAL_CANNULA";
  ventilatorSettings?: {
    mode: string;
    fio2: number;
    peep: number;
    tidalVolumeMl: number;
    peakPressureCmH2O: number;
  };
  vascularAccess: {
    cordisIntroducerSites: string[];
    peripheralIvGauges: string[];
    intraosseousNeedleSites: string[];
    arterialLineSites: string[];
  };
  activeAlerts: TraumaAlert[];
  resuscitationEventsTimeline: Array<{
    timestamp: string;
    phase: string;
    event: string;
    provider: string;
  }>;
}

export interface TraumaCensusOverview {
  totalBaysActive: number;
  level1AlphaActive: number;
  activeMtpCoolersInTransit: number;
  activeReboaDeployments: number;
  lethalTriadHighRiskCount: number;
  availableDamageControlOrs: number;
  availableAngioSuites: number;
  bloodBankUniversalUnitsO_Neg: number;
  bloodBankUniversalUnitsAB_Ffp: number;
}
