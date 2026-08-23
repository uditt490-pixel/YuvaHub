/**
 * Pediatric Intensive Care Unit (PICU) Telemetry & Critical Care Type Definitions
 * Standards Compliance: PALS, PALICC-2, Pediatric Surviving Sepsis, KDIGO Pediatric AKI, HL7 FHIR R4
 */

export type PediatricAgeBracket =
  | "NEONATE"       // 0 - 28 days
  | "INFANT"        // 1 - 12 months
  | "TODDLER"       // 1 - 3 years
  | "PRE_SCHOOL"    // 3 - 5 years
  | "SCHOOL_AGE"    // 6 - 12 years
  | "ADOLESCENT";   // 13 - 18 years

export type PicuAcuityLevel =
  | "STABLE"                // Green
  | "MONITORING"            // Cyan
  | "ELEVATED_RISK"         // Amber
  | "HIGH_ACUITY"           // Orange
  | "CRITICAL_INSTABILITY"  // Rose/Red
  | "CODE_PALS";            // Emergency Flashing

export type PicuWardPod =
  | "CARDIAC_PICU"
  | "GENERAL_PICU"
  | "NEURO_PICU"
  | "HIGH_FREQUENCY_VENT_POD"
  | "POST_SURGICAL_PICU"
  | "ISOLATION_PICU";

export type VentilatorMode =
  | "HFOV"                  // High-Frequency Oscillatory Ventilation
  | "PRVC"                  // Pressure-Regulated Volume Control
  | "SIMV_PC"               // Synchronized Intermittent Mandatory Ventilation (Pressure Control)
  | "SIMV_VC"               // Synchronized Intermittent Mandatory Ventilation (Volume Control)
  | "CPAP_PS"               // Continuous Positive Airway Pressure + Pressure Support
  | "NIV_NAVA"              // Non-Invasive Neurally Adjusted Ventilatory Assist
  | "HFNC"                  // High-Flow Nasal Cannula
  | "ROOM_AIR";             // No invasive/non-invasive respiratory support

export interface PediatricVitalSigns {
  heartRate: number;              // bpm
  systolicBp: number;             // mmHg
  diastolicBp: number;            // mmHg
  meanArterialPressure: number;   // mmHg (calculated: SBP + 2*DBP / 3)
  respiratoryRate: number;        // breaths/min
  spO2: number;                   // % (pulse oximetry)
  coreTemperature: number;        // °C
  etCO2?: number;                 // mmHg (End-Tidal CO2)
  centralVenousPressure?: number; // mmHg (CVP)
  intracranialPressure?: number;  // mmHg (ICP - Neuro PICU)
  cerebralPerfusionPressure?: number; // mmHg (CPP = MAP - ICP)
  capillaryRefillSeconds: number; // seconds (<2s normal, >3s prolonged)
  glasgowComaScale: number;       // 3 - 15 (Pediatric modified GCS)
}

export interface VentilatorTelemetry {
  mode: VentilatorMode;
  fiO2: number;                   // Fraction of Inspired Oxygen (0.21 - 1.0)
  peakInspiratoryPressure: number;// PIP (cmH2O)
  peep: number;                   // Positive End-Expiratory Pressure (cmH2O)
  meanAirwayPressure: number;     // Paw (cmH2O)
  tidalVolumeDelivered: number;   // mL
  tidalVolumePerKg: number;       // mL/kg (ideal target: 6 - 8 mL/kg)
  minuteVentilation: number;      // L/min
  respiratoryRateSet: number;     // breaths/min
  respiratoryRateTotal: number;   // breaths/min (machine + patient spontaneous)
  inspiratoryTime: number;        // Ti (seconds)
  ieRatio: string;                // e.g. "1:2.0"
  dynamicCompliance: number;      // Cdyn = Vt / (PIP - PEEP) (mL/cmH2O)
  // High-Frequency Oscillatory Ventilation (HFOV) specific parameters
  hfovFrequencyHz?: number;       // Hz (1 Hz = 60 breaths/min, 5-12 Hz)
  hfovDeltaPressure?: number;     // Delta P / Amplitude (cmH2O)
  hfovBiasFlowLpm?: number;       // Bias Flow (L/min)
}

export interface ArterialBloodGas {
  timestamp: string;
  ph: number;                     // 7.35 - 7.45
  paCO2: number;                  // mmHg (35 - 45)
  paO2: number;                   // mmHg (80 - 100)
  hco3: number;                   // mEq/L (22 - 26)
  baseExcess: number;             // mEq/L (-2 to +2)
  lactate: number;                // mmol/L (<2.0 normal)
  anionGap?: number;              // mEq/L
}

export interface PulmonaryIndices {
  oxygenationIndex: number;       // OI = (FiO2 * Paw * 100) / PaO2
  oxygenSaturationIndex: number;  // OSI = (FiO2 * Paw * 100) / SpO2
  pardsClassification: "NONE" | "MILD_PARDS" | "MODERATE_PARDS" | "SEVERE_PARDS" | "ECMO_CRITERIA";
  alveolarArterialGradient: number; // A-a gradient (mmHg)
  paO2FiO2Ratio: number;          // P/F Ratio (mmHg)
}

export interface VasoactiveInotropicSupport {
  dopamineMcgKgMin: number;       // mcg/kg/min
  dobutamineMcgKgMin: number;     // mcg/kg/min
  epinephrineMcgKgMin: number;    // mcg/kg/min
  norepinephrineMcgKgMin: number; // mcg/kg/min
  milrinoneMcgKgMin: number;      // mcg/kg/min
  vasopressinUnitsKgMin: number;  // Units/kg/min
  vasoactiveInotropicScore: number;// Calculated VIS
  cardiacIndexLMinM2?: number;    // L/min/m2
  shockIndexPediatric: number;    // SIPA = HR / SBP
  sipaElevated: boolean;          // True if age-specific threshold exceeded
}

export interface FluidAndRenalStatus {
  weightKg: number;
  admissionWeightKg: number;
  hourlyUrineOutputMl: number;    // mL in last hour
  urineOutputMlKgHr: number;      // mL/kg/hr (>1.0 normal infant/toddler, >0.5 child)
  cumulativeIntakeMl24h: number;  // 24-hr Total In
  cumulativeOutputMl24h: number;  // 24-hr Total Out
  fluidBalanceNet24h: number;     // Net balance (mL)
  percentFluidOverload: number;   // %FO = [(In - Out) / Admission Weight (g)] * 100 or mL/kg
  hollidaySegarMaintenanceRateMlHr: number; // Calculated 4-2-1 maintenance rate (mL/hr)
  serumCreatinineMgDl: number;
  baselineCreatinineMgDl: number;
  pediatricKdigoAkiStage: "NONE" | "STAGE_1" | "STAGE_2" | "STAGE_3" | "CRRT_ACTIVE";
}

export interface PediatricEarlyWarningScore {
  behaviorScore: number;          // 0 - 3 (Playing/Appropriate to Lethargic/Reduced response)
  cardiovascularScore: number;    // 0 - 3 (Pink/cap refill 1-2s to Grey/Cyanotic/cap refill >4s)
  respiratoryScore: number;       // 0 - 3 (Normal to Severe retractions/Tracheal tug/Grunting)
  additionalPoints: number;       // +2 if 15-min nebulizer or persistent post-op vomiting
  totalPews: number;              // 0 - 9+
  pewsRiskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL_DETERIORATION";
}

export interface Pelod2Score {
  neurologicScore: number;        // Pupillary reaction + GCS
  cardiovascularScore: number;    // Lactate + MAP
  renalScore: number;             // Creatinine
  respiratoryScore: number;       // PaO2/FiO2 or PaCO2 or invasive ventilation
  hematologicScore: number;       // WBC + Platelets
  totalPelod2: number;            // 0 - 33
  predictedMortalityPercent: number;
}

export interface PicuAlert {
  id: string;
  patientId: string;
  timestamp: string;
  severity: "INFO" | "MONITOR" | "WARNING" | "HIGH" | "CRITICAL";
  category: "HEMODYNAMIC" | "VENTILATION" | "NEPHROLOGY" | "NEUROLOGICAL" | "SEPSIS" | "MEDICATION_SAFETY";
  title: string;
  triggerMeasurement: string;
  expectedReferenceRange: string;
  clinicalRationale: string;
  guidelineReference: string;     // e.g. "PALS 2024 / PALICC-2 Guidelines"
  suggestedAction: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export type EmergencyProtocolType =
  | "PEDIATRIC_CODE_BLUE"
  | "PEDIATRIC_SEPTIC_SHOCK_BUNDLE"
  | "STATUS_ASTHMATICUS_ESCALATION"
  | "PARDS_PRONING_ECMO_ACTIVATION"
  | "PEDIATRIC_DKA_PROTOCOL"
  | "CRRT_EMERGENCY_INITIATION"
  | "DIFFICULT_AIRWAY_RSI_KIT";

export interface EmergencyEscalationRecord {
  id: string;
  patientId: string;
  protocol: EmergencyProtocolType;
  initiatedAt: string;
  initiatedBy: string;
  status: "ACTIVE" | "TEAM_DISPATCHED" | "BEDSIDE_ACTIVE" | "RESOLVED" | "STANDBY";
  targetResponseMinutes: number;
  assignedTeamMembers: string[];
  clinicalNotes: string;
}

export interface PicuPatient {
  id: string;
  mrn: string;
  name: string;
  ageYears: number;
  ageMonths: number;
  ageBracket: PediatricAgeBracket;
  gender: "MALE" | "FEMALE";
  weightKg: number;
  admissionWeightKg: number;
  heightCm: number;
  bedNumber: string;
  wardPod: PicuWardPod;
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  admissionDate: string;
  acuityLevel: PicuAcuityLevel;
  codeStatus: "FULL_CODE_PALS" | "DNR_DNI" | "LIMITED_INTERVENTION";
  attendingPhysician: string;
  primaryNurse: string;
  vitals: PediatricVitalSigns;
  ventilator: VentilatorTelemetry;
  abg: ArterialBloodGas;
  pulmonaryIndices: PulmonaryIndices;
  vasoactiveSupport: VasoactiveInotropicSupport;
  fluidRenalStatus: FluidAndRenalStatus;
  pews: PediatricEarlyWarningScore;
  pelod2: Pelod2Score;
  activeAlerts: PicuAlert[];
  telemetrySparklines: {
    heartRateHistory: number[];       // 30 data points
    meanArterialPressureHistory: number[];
    spO2History: number[];
    respRateHistory: number[];
    etCO2History: number[];
  };
  emergencyProtocols: EmergencyEscalationRecord[];
}

export interface PicuWardOverviewMetrics {
  totalBeds: number;
  occupiedBeds: number;
  occupancyRatePercent: number;
  criticalPatientsCount: number;
  highAcuityPatientsCount: number;
  activeVentilatorsCount: number;
  hfovActiveCount: number;
  highVisScoreCount: number;          // VIS > 15
  fluidOverloadHighCount: number;     // %FO > 10%
  palsActiveEmergenciesCount: number;
  averagePewsScore: number;
  lastTelemetrySyncTimestamp: string;
}

export interface PediatricDrugDosingGuideline {
  drugName: string;
  indication: string;
  standardDoseUnit: string;
  defaultMgKg: number;
  maxSingleDoseMg?: number;
  infusionRateUnit?: string;
  defaultMcgKgMin?: number;
  highAlertWarning?: string;
  concentrationMgMl?: number;
}
