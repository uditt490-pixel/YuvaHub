/**
 * Cardiovascular Hemodynamics, Mechanical Circulatory Support (MCS), & ECMO Telemetry Types
 * Standards Compliance: AHA/ACC Shock Guidelines, SCAI Shock Classification (A-E), ELSO (Extracorporeal Life Support Organization), HL7 FHIR R4
 */

export type ScaiShockStage =
  | "STAGE_A_AT_RISK"       // Normotensive, normal perfusion, large MI or heart failure
  | "STAGE_B_BEGINNING"     // Tachycardic, hypotensive (SBP < 90, MAP < 60), preserved perfusion
  | "STAGE_C_CLASSIC"       // Hypoperfusion requiring inotropes/MCS (Lactate > 2, CPO < 0.6W, CI < 2.2)
  | "STAGE_D_DETERIORATING" // Escalating MCS / multiple vasopressors, worsening acidosis
  | "STAGE_E_EXTREMIS";     // Cardiac arrest with CPR, severe metabolic collapse, PEA/refractory VF

export type ShockEtiology =
  | "ACUTE_MYOCARDIAL_INFARCTION"
  | "ACUTE_DECOMPENSATED_HEART_FAILURE"
  | "POST_CARDIOTOMY_SHOCK"
  | "FULMINANT_MYOCARDITIS"
  | "REFRACTORY_ARDS"
  | "MASSIVE_PULMONARY_EMBOLISM"
  | "SEPTIC_CARDIOMYOPATHY"
  | "ACUTE_VALVULAR_RUPTURE";

export type McsDeviceType =
  | "VA_ECMO"               // Veno-Arterial Extracorporeal Membrane Oxygenation
  | "VV_ECMO"               // Veno-Venous Extracorporeal Membrane Oxygenation
  | "VAV_ECMO"              // Hybrid Veno-Arterial-Venous (Dual drainage/reinjection)
  | "ECPELLA"               // Combined VA-ECMO + Impella LV Unloading
  | "IMPELLA_CP"            // Microaxial transvalvular pump (up to 4.0 L/min)
  | "IMPELLA_5_5"           // Surgical microaxial pump (up to 5.5 L/min)
  | "IMPELLA_RP"            // Right ventricular transvalvular microaxial pump
  | "IABP"                  // Intra-Aortic Balloon Counterpulsation Pump
  | "TANDEM_HEART"          // Left atrial-to-femoral artery centrifugal bypass
  | "CENTRIMAG_BIVAD"       // Centrifugal biventricular assist system
  | "HEARTMATE_3_LVAD"      // Fully magnetically levitated left ventricular assist device
  | "NONE_PHARMACOLOGIC";

export type CannulationConfiguration =
  | "PERIPHERAL_FEMORAL_FEMORAL"
  | "CENTRAL_AORTIC_RIGHT_ATRIAL"
  | "FEMORAL_INTERNAL_JUGULAR"
  | "DUAL_LUMEN_AVALON_IJ"
  | "AXILLARY_SUBCLAVIAN_GRAFT"
  | "VAV_HYBRID_CONFIGURATION"
  | "TRANSVALVULAR_LV_UNLOAD";

export interface InvasiveHemodynamics {
  heartRateBpm: number;
  rhythmStatus: "SINUS" | "ATRIAL_FIB_RVR" | "JUNCTIONAL" | "PACED_AV" | "VENTRICULAR_TACHYCARDIA" | "BIGEMINY";
  systolicBloodPressureMmHg: number;
  diastolicBloodPressureMmHg: number;
  meanArterialPressureMmHg: number;      // MAP = (SBP + 2*DBP)/3
  pulsePressureMmHg: number;             // PP = SBP - DBP (Flat PP < 10 mmHg indicates closed aortic valve in VA-ECMO)
  centralVenousPressureMmHg: number;     // CVP / RA pressure (Normal: 2 - 8 mmHg)
  pulmonaryArterySystolicMmHg: number;   // PAS (Normal: 15 - 30 mmHg)
  pulmonaryArteryDiastolicMmHg: number;  // PAD (Normal: 4 - 12 mmHg)
  pulmonaryArteryMeanMmHg: number;       // mPAP (Normal: 9 - 18 mmHg)
  pulmonaryCapillaryWedgePressureMmHg: number; // PCWP / Wedge (Elevated > 18 in LV failure, > 22 risk of pulmonary edema)
  cardiacOutputLpm: number;              // Continuous thermodilution / Fick CO
  cardiacIndexLpmM2: number;             // CI = CO / BSA (Normal: 2.5 - 4.0 L/min/m2)
  strokeVolumeMl: number;                // SV = CO / HR * 1000
  strokeVolumeIndexMlM2: number;         // SVI = SV / BSA
  systemicVascularResistanceDynes: number; // SVR = 80 * (MAP - CVP) / CO (Normal: 800 - 1200)
  pulmonaryVascularResistanceWoodUnits: number; // PVR = (mPAP - PCWP) / CO (Normal: 0.5 - 2.0 WU)
  cardiacPowerOutputWatts: number;       // CPO = (MAP * CO) / 451 (Critical < 0.60 W)
  cardiacPowerIndexWattsM2: number;      // CPI = CPO / BSA (Critical < 0.32 W/m2)
  pulmonaryArteryPulsatilityIndex: number; // PAPi = (PAS - PAD) / CVP (RV failure if < 1.0)
  leftVentricularStrokeWorkIndex: number; // LVSWI = 0.0136 * SVI * (MAP - PCWP)
  rightVentricularStrokeWorkIndex: number; // RVSWI = 0.0136 * SVI * (mPAP - CVP)
  transpulmonaryGradientMmHg: number;    // TPG = mPAP - PCWP
  diastolicPulmonaryGradientMmHg: number;// DPG = PAD - PCWP
  shockIndex: number;                    // SI = HR / SBP (Normal < 0.7, > 0.9 alert)
  modifiedShockIndex: number;            // MSI = HR / MAP
}

export interface EcmoCircuitTelemetry {
  pumpSpeedRpm: number;                  // e.g. 2800 - 4500 RPM
  bloodFlowLpm: number;                  // e.g. 3.2 - 5.0 L/min
  sweepGasFlowLpm: number;               // Sweep gas (O2/Air mix) flow (e.g. 2.0 - 8.0 L/min)
  sweepGasFiO2Percent: number;           // Sweep fraction of oxygen (21 - 100%)
  preMembranePressureP1MmHg: number;     // Inlet pressure to oxygenator (e.g. 150 - 240 mmHg)
  postMembranePressureP2MmHg: number;    // Outlet pressure from oxygenator (e.g. 120 - 190 mmHg)
  transmembranePressureGradientMmHg: number; // TMP = P1 - P2 (Normal: 20 - 45 mmHg; Clotting alert > 50 mmHg)
  venousDrainagePressureP3MmHg: number;  // Drainage line negative pressure (Normal: -30 to -80 mmHg; Chatter alert < -100 mmHg)
  arterialBloodTemperatureCelsius: number; // Heat exchanger water bath (36.0 - 37.5 C)
  venousOxygenSaturationSvO2Percent: number; // Circuit venous return SvO2 (Normal: 65 - 75%)
  postOxygenatorPO2MmHg: number;         // Post-membrane pO2 (Expected: 250 - 450 mmHg at 100% FiO2)
  postOxygenatorPCO2MmHg: number;        // Post-membrane pCO2 (Expected: 35 - 42 mmHg)
  rightRadialNativeSpO2Percent: number;  // Native heart ejection SpO2 (Right arm / Harlequin surveillance)
  lowerExtremityEcmoSpO2Percent: number; // Retrograde femoral ECMO SpO2 (Lower limb)
  harlequinDeltaSpO2Percent: number;     // Delta = Lower - Upper (Alert if > 10% indicates Harlequin / North-South Syndrome)
  distalPerfusionCatheterFlowMlMin: number; // Antegrade leg perfusion sheath flow (e.g. 120 - 250 mL/min)
}

export interface McsMicroaxialTelemetry {
  impellaPLevel: string;                 // e.g. "P-8", "P-9", "AUTO"
  impellaFlowLpm: number;                // e.g. 3.4 L/min
  motorCurrentMilliamps: number;         // e.g. 650 - 900 mA (Spikes indicate clot or suction)
  purgePressureMmHg: number;             // Purge barrier pressure (e.g. 300 - 600 mmHg)
  purgeFlowRateMlHr: number;             // Purge dextrose/heparin flow (e.g. 6 - 20 mL/hr)
  opticalPlacementSignalStatus: "CORRECT_AORTIC_VALVE" | "VENTRICULAR_DISPLACEMENT" | "AORTIC_DISPLACEMENT" | "SUCTION_DETECTED";
  iabpAugmentationRatio: string;         // e.g. "1:1", "1:2", "STANDBY"
  iabpAugmentedDiastolicMmHg: number;    // Peak augmented diastolic pressure
}

export interface VasoactiveInotropicSupport {
  epinephrineMcgKgMin: number;           // mcg/kg/min
  norepinephrineMcgKgMin: number;        // mcg/kg/min
  vasopressinUnitsMin: number;           // units/min (e.g. 0.04)
  dobutamineMcgKgMin: number;            // mcg/kg/min
  milrinoneMcgKgMin: number;             // mcg/kg/min
  dopamineMcgKgMin: number;              // mcg/kg/min
  angiotensinIINgKgMin: number;          // ng/kg/min
  vasoactiveInotropicScore: number;      // VIS Formula: Dopamine + Dobutamine + 100*Epi + 100*Norepi + 10*Milrinone + 10000*Vaso
}

export interface AnticoagulationAndLabProfile {
  activatedClottingTimeSeconds: number;  // ACT (Target: 180 - 220 sec on ECMO)
  antiXaActivityIuMl: number;            // Unfractionated Heparin Anti-Xa (Target: 0.3 - 0.7 IU/mL)
  unfractionatedHeparinUnitsHr: number;  // e.g. 1200 units/hr
  bivalirudinMgKgHr: number;             // e.g. 0.15 mg/kg/hr (Direct Thrombin Inhibitor)
  fibrinogenMgDl: number;                // Normal: 200 - 400 mg/dL (Critical < 150 mg/dL)
  freePlasmaHemoglobinMgDl: number;      // fHb (Normal < 10 mg/dL; Hemolysis alert > 50 mg/dL)
  lactateMmolL: number;                  // Serum Lactate (Normal < 2.0; Hypoperfusion > 4.0)
  arterialPh: number;                    // Blood gas pH
  arterialBaseExcessMeqL: number;        // Base Excess
  serumCreatinineMgDl: number;           // Renal perfusion marker
  plateletCountKUl: number;              // Platelets (Heparin-Induced Thrombocytopenia surveillance)
}

export interface CardioAlert {
  id: string;
  severity: "INFO" | "MONITOR" | "WARNING" | "CRITICAL";
  title: string;
  triggerMeasurement: string;
  expectedRange: string;
  clinicalMeaning: string;
  actionGuidance: string;
  timestamp: string;
}

export interface CardioPatient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  sex: "MALE" | "FEMALE";
  bedNumber: string;
  bodySurfaceAreaM2: number;            // BSA (Mosteller: sqrt(ht*wt/3600))
  weightKg: number;
  heightCm: number;
  primaryDiagnosis: string;
  shockEtiology: ShockEtiology;
  scaiStage: ScaiShockStage;
  mcsDevice: McsDeviceType;
  cannulation: CannulationConfiguration;
  hoursOnSupport: number;
  dayInIcu: number;
  attendingCardiologist: string;
  primaryPerfusionist: string;
  hemodynamics: InvasiveHemodynamics;
  ecmoTelemetry: EcmoCircuitTelemetry;
  microaxialTelemetry: McsMicroaxialTelemetry;
  vasoactiveSupport: VasoactiveInotropicSupport;
  anticoagulationLabs: AnticoagulationAndLabProfile;
  alerts: CardioAlert[];
  lastUpdated: string;
}

export interface CardioWardMetrics {
  totalOccupiedBeds: number;
  totalAvailableBeds: number;
  activeVaEcmoCount: number;
  activeVvEcmoCount: number;
  activeEcpellaCount: number;
  activeImpellaCount: number;
  activeIabpCount: number;
  scaiStageDistribution: {
    stageA: number;
    stageB: number;
    stageC: number;
    stageD: number;
    stageE: number;
  };
  criticalCpoCount: number;             // Patients with CPO < 0.60 W
  highTransmembranePressureCount: number;// Patients with TMP > 50 mmHg
  harlequinSyndromeAlertCount: number;  // Patients with Delta SpO2 > 10%
  highVisScoreCount: number;             // Patients with VIS > 30
  averageCardiacIndex: number;
  averageLactate: number;
}
