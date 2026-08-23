/**
 * Critical Care Nephrology & Continuous Renal Replacement Therapy (CRRT) Type Definitions
 * Standards Compliance: KDIGO AKI Guidelines, ADQI (Acute Disease Quality Initiative), HL7 FHIR R4 DeviceMetric
 */

export type CrrtModality =
  | "CVVHDF"   // Continuous Veno-Venous Hemodiafiltration (Convection + Diffusion)
  | "CVVH"     // Continuous Veno-Venous Hemofiltration (Pure Convection)
  | "CVVHD"    // Continuous Veno-Venous Hemodialysis (Pure Diffusion)
  | "SCUF"     // Slow Continuous Ultrafiltration (Pure Fluid Removal)
  | "SLED";    // Sustained Low-Efficiency Diafiltration

export type AnticoagulationMode =
  | "REGIONAL_CITRATE"   // RCA with Calcium Compensation
  | "SYSTEMIC_HEPARIN"   // Unfractionated Heparin infusion
  | "PROSTACYCLIN"       // Epoprostenol
  | "NO_ANTICOAGULATION"; // Saline Flushes only (High Bleeding Risk)

export type KdigoAkiStage =
  | "STAGE_1"   // 1.5 - 1.9x baseline Cr or UO < 0.5 mL/kg/h for 6-12h
  | "STAGE_2"   // 2.0 - 2.9x baseline Cr or UO < 0.5 mL/kg/h for >= 12h
  | "STAGE_3";  // 3.0x baseline Cr, Cr >= 4.0 mg/dL, anuria >= 12h, or RRT initiated

export type FilterHealthStatus =
  | "OPTIMAL"            // TMP < 150 mmHg, Drop < 100 mmHg
  | "MODERATE_FOULING"   // TMP 150 - 250 mmHg
  | "IMMINENT_CLOTTING"  // TMP > 250 mmHg or Drop > 150 mmHg
  | "CLOTTED_CHANGE_NOW"; // TMP > 300 mmHg

export interface CircuitHydraulics {
  accessPressureMmHg: number;      // P_acc (-50 to -150 mmHg normal; alert if < -200)
  filterPrePressureMmHg: number;   // P_pre (+100 to +250 mmHg)
  returnPressureMmHg: number;      // P_ret (+50 to +150 mmHg; alert if > +200)
  effluentPressureMmHg: number;    // P_eff (-50 to +100 mmHg)
  transmembranePressureMmHg: number; // TMP = ((P_pre + P_ret)/2) - P_eff
  filterPressureDropMmHg: number;  // Delta P = P_pre - P_ret
  filtrationFractionPercent: number; // FF % = (Q_rep + Q_uf) / (Q_b * (1 - Hct) * 60) * 100
  bloodFlowRateMlMin: number;      // Q_b (100 - 300 mL/min)
  filterLifeHours: number;         // Current filter run time (0 - 72h)
  healthStatus: FilterHealthStatus;
}

export interface FluidPrescription {
  preFilterReplacementMlHr: number;  // Q_rep_pre
  postFilterReplacementMlHr: number; // Q_rep_post
  dialysateFlowMlHr: number;         // Q_d
  netUltrafiltrationMlHr: number;    // Net Fluid Removal Rate (e.g. 100 - 250 mL/hr)
  totalEffluentFlowMlHr: number;     // Q_eff = Q_rep + Q_d + Q_uf
  deliveredDoseMlKgHr: number;       // Q_eff / Weight_kg (KDIGO Target: 20 - 25 mL/kg/h)
  prescribedDoseMlKgHr: number;
}

export interface CitrateAnticoagulationTelemetry {
  citrateInfusionRateMmolHr: number; // ACD-A Infusion Rate (mL/hr)
  calciumChlorideCompensationMlHr: number; // 10% CaCl2 infusion (mL/hr)
  postFilterIonizedCalciumMmolL: number;   // iCa_post (Target: 0.25 - 0.35 mmol/L)
  systemicIonizedCalciumMmolL: number;     // iCa_sys (Target: 1.10 - 1.30 mmol/L)
  totalCalciumMmolL: number;               // Total Serum Calcium
  totalToIonizedCalciumRatio: number;      // Total Ca / iCa_sys (Alert if > 2.5: Citrate Accumulation)
  citrateToxicityRisk: "NONE" | "MONITOR_ACCUMULATION" | "SEVERE_CITRATE_LOCK";
}

export interface RenalMetabolicBiomarkers {
  serumCreatinineMgDl: number;
  serumUreaNitrogenBUNMgDl: number;
  potassiumMmolL: number;                  // Hyperkalemia alert if > 6.0 mmol/L
  bicarbonateMmolL: number;                // Metabolic acidosis indicator
  sodiumMmolL: number;
  ionizedCalciumMmolL: number;
  phosphorusMgDl: number;
  magnesiumMgDl: number;
  arterialPh: number;
  urineOutputMlKgHr: number;
  cumulativeFluidBalanceLiters: number;
  percentFluidOverload: number;            // (Cumulative Fluid / ICU Admission Wt) * 100 (Alert if > 10%)
}

export interface CrrtAlert {
  id: string;
  severity: "INFO" | "MONITOR" | "WARNING" | "CRITICAL";
  title: string;
  triggerMeasurement: string;
  expectedRange: string;
  clinicalMeaning: string;
  actionGuidance: string;
  timestamp: string;
}

export interface CrrtPatient {
  id: string;
  mrn: string;
  name: string;
  ageYears: number;
  gender: "MALE" | "FEMALE";
  weightKg: number;
  heightCm: number;
  admissionDiagnosis: string;
  kdigoStage: KdigoAkiStage;
  modality: CrrtModality;
  anticoagulation: AnticoagulationMode;
  vascularAccessLocation: string; // e.g. "Right Internal Jugular 13.5 Fr", "Right Femoral 14 Fr"
  hydraulics: CircuitHydraulics;
  prescription: FluidPrescription;
  citrateTelemetry: CitrateAnticoagulationTelemetry;
  metabolics: RenalMetabolicBiomarkers;
  alerts: CrrtAlert[];
  pressureHistory: {
    tmp: number[];
    deltaP: number[];
    access: number[];
  };
}

export interface CrrtWardMetrics {
  totalCrrtActive: number;
  cvvhdfCount: number;
  cvvhCount: number;
  scufCount: number;
  meanDeliveredDoseMlKgHr: number;
  filterClottingRiskCount: number;
  citrateToxicityWarningCount: number;
  severeFluidOverloadCount: number; // > 10%
  hyperkalemiaCount: number;        // K+ > 6.0
  lastTelemetrySyncTimestamp: string;
}
