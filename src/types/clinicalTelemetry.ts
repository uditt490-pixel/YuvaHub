export type ClinicalAcuityLevel = 'STABLE' | 'MONITOR' | 'WARNING' | 'HIGH' | 'CRITICAL';

export type ClinicalDomain =
  | 'ICU_TELEMETRY'
  | 'BIO_AI_DIAGNOSTICS'
  | 'CARDIOVASCULAR'
  | 'NEPHROLOGY_CRRT'
  | 'PRECISION_ONCOLOGY'
  | 'EMERGENCY_MEDICINE';

export type AlertSeverity = 'INFO' | 'MONITOR' | 'WARNING' | 'HIGH' | 'CRITICAL';

export type EmergencyProtocolType =
  | 'CODE_BLUE'
  | 'SEPSIS_PROTOCOL'
  | 'RAPID_RESPONSE_TEAM'
  | 'CODE_STEMI'
  | 'CRRT_EMERGENCY'
  | 'MASSIVE_TRANSFUSION';

export interface TelemetryVitals {
  heartRateBpm: number;
  systolicBpMmHg: number;
  diastolicBpMmHg: number;
  meanArterialPressureMmHg: number;
  spO2Percent: number;
  respiratoryRateMin: number;
  temperatureCelsius: number;
  etCO2MmHg: number;
  lactateMmolL: number;
  cardiacOutputLMin: number;
  cardiacIndexLMinM2: number;
  creatinineMgDl: number;
  urineOutputMlKgHr: number;
  cvpMmHg: number;
  icpMmHg?: number;
  cppMmHg?: number;
  fiO2Percent: number;
  peepCmH2O: number;
  gcsScore: number;
}

export interface BioAiBiomarkers {
  troponinINgMl: number;
  procalcitoninNgMl: number;
  dDimerMcgMl: number;
  crpMgL: number;
  bnpPgMl: number;
  sepsisBiomarkerIndex: number;
  genomicMutationBurdenMutsMb: number;
  aiDeteriorationRiskScore: number;
  predictiveShockHorizonMinutes: number;
  immunoOncologyResponseProb: number;
}

export interface ClinicalAlert {
  id: string;
  patientId: string;
  timestamp: string;
  severity: AlertSeverity;
  metric: string;
  value: string;
  expectedRange: string;
  description: string;
  suggestedEscalation: string;
  protocolAction?: EmergencyProtocolType;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface ClinicalCalculationResult {
  meanArterialPressure: number;
  cardiacPowerOutput: number;
  shockIndex: number;
  modifiedShockIndex: number;
  qSofaScore: number;
  qSofaHighRisk: boolean;
  news2Score: number;
  news2RiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  kdigoAkiStage: 0 | 1 | 2 | 3;
  kdigoInterpretation: string;
  pao2Fio2Ratio: number;
}

export interface EmergencyProtocolEscalation {
  id: string;
  patientId: string;
  protocolType: EmergencyProtocolType;
  triggeredBy: string;
  timestamp: string;
  clinicalRationale: string;
  teamPagingStatus: 'PENDING' | 'DISPATCHED' | 'ACKNOWLEDGED' | 'EN_ROUTE' | 'ON_SCENE';
  vitalSnapshot: TelemetryVitals;
  auditSignature: string;
}

export interface TelemetryTrendPoint {
  timestamp: string;
  heartRate: number;
  map: number;
  spO2: number;
  lactate: number;
  aiRiskScore: number;
}

export interface ClinicalPatientRecord {
  id: string;
  mrn: string;
  fullName: string;
  age: number;
  sex: 'M' | 'F' | 'OTHER';
  ward: string;
  bedNumber: string;
  primaryDiagnosis: string;
  domain: ClinicalDomain;
  acuityLevel: ClinicalAcuityLevel;
  attendingPhysician: string;
  admissionDate: string;
  vitals: TelemetryVitals;
  biomarkers: BioAiBiomarkers;
  calculations: ClinicalCalculationResult;
  alerts: ClinicalAlert[];
  trendHistory: TelemetryTrendPoint[];
  activeEscalations: EmergencyProtocolEscalation[];
  isTelemetryLive: boolean;
  lastUpdated: string;
}

export interface TelemetrySummaryMetrics {
  totalMonitored: number;
  criticalCount: number;
  warningCount: number;
  stableCount: number;
  sepsisRiskCount: number;
  activeEscalationsCount: number;
  avgAiRiskScore: number;
  telemetryUptimePercent: number;
}

export interface ClinicalFilterQuery {
  search?: string;
  domain?: ClinicalDomain | 'ALL';
  acuityLevel?: ClinicalAcuityLevel | 'ALL';
  ward?: string;
  alertsOnly?: boolean;
}
