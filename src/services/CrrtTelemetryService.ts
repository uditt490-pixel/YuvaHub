/**
 * Critical Care Nephrology & CRRT Continuous Hemodiafiltration Service Engine
 * 
 * Standards Reference:
 * - KDIGO Clinical Practice Guideline for Acute Kidney Injury
 * - ADQI (Acute Disease Quality Initiative) Consensus on Renal Replacement Therapy
 * - CPIC & International Citrate Anticoagulation Protocols (Total Ca / iCa Lock Ratio)
 * - HL7 FHIR R4 DeviceMetric & Observation Telemetry Profiles
 */

import {
  CrrtModality,
  AnticoagulationMode,
  KdigoAkiStage,
  FilterHealthStatus,
  CircuitHydraulics,
  FluidPrescription,
  CitrateAnticoagulationTelemetry,
  RenalMetabolicBiomarkers,
  CrrtAlert,
  CrrtPatient,
  CrrtWardMetrics
} from "../types/crrtTelemetry";

export class CrrtTelemetryService {
  /**
   * Transmembrane Pressure (TMP) Calculation
   * TMP = ((P_pre + P_ret) / 2) - P_eff
   */
  public static calculateTmp(pPreMmHg: number, pRetMmHg: number, pEffMmHg: number): number {
    return Math.round(((pPreMmHg + pRetMmHg) / 2) - pEffMmHg);
  }

  /**
   * Filter Pressure Drop (Delta P) Calculation
   * Delta P = P_pre - P_ret
   */
  public static calculateFilterDrop(pPreMmHg: number, pRetMmHg: number): number {
    return Math.round(pPreMmHg - pRetMmHg);
  }

  /**
   * Filtration Fraction (FF %)
   * FF = (Q_rep_post + Q_uf) / (Q_b * (1 - Hct) * 60) * 100
   */
  public static calculateFiltrationFraction(
    qRepPostMlHr: number,
    qUfMlHr: number,
    qBloodMlMin: number,
    hematocritPercent = 0.30
  ): number {
    if (qBloodMlMin <= 0) return 0;
    const plasmaFlowMlHr = qBloodMlMin * (1 - hematocritPercent) * 60;
    const ultrafiltrateMlHr = qRepPostMlHr + qUfMlHr;
    return Math.round((ultrafiltrateMlHr / plasmaFlowMlHr) * 1000) / 10;
  }

  /**
   * Delivered Effluent Dose (mL/kg/hr)
   * Dose = (Q_rep + Q_d + Q_uf) / Weight_kg
   */
  public static calculateDeliveredEffluentDose(
    qRepMlHr: number,
    qDialysateMlHr: number,
    qNetUfMlHr: number,
    weightKg: number
  ): number {
    if (weightKg <= 0) return 0;
    const totalEffluentMlHr = qRepMlHr + qDialysateMlHr + qNetUfMlHr;
    return Math.round((totalEffluentMlHr / weightKg) * 10) / 10;
  }

  /**
   * Total to Ionized Calcium Ratio (Citrate Accumulation / Citrate Lock Index)
   * Ratio = Total Ca (mmol/L) / Systemic iCa (mmol/L)
   * Clinical threshold: > 2.5 indicates citrate accumulation / hepatic metabolic failure
   */
  public static calculateTotalToIonizedCalciumRatio(totalCaMmolL: number, systemicIcaMmolL: number): number {
    if (systemicIcaMmolL <= 0) return 0;
    return Math.round((totalCaMmolL / systemicIcaMmolL) * 100) / 100;
  }

  /**
   * Percentage Fluid Overload (%FO)
   * %FO = (Cumulative Fluid Balance Liters / ICU Admission Weight kg) * 100
   * Threshold: > 10% indicates severe pathological fluid overload
   */
  public static calculatePercentFluidOverload(cumulativeFluidBalanceLiters: number, admissionWeightKg: number): number {
    if (admissionWeightKg <= 0) return 0;
    return Math.round((cumulativeFluidBalanceLiters / admissionWeightKg) * 1000) / 10;
  }

  /**
   * Filter Health Status Evaluator
   */
  public static evaluateFilterHealth(tmp: number, deltaP: number): FilterHealthStatus {
    if (tmp > 300 || deltaP > 200) return "CLOTTED_CHANGE_NOW";
    if (tmp > 250 || deltaP > 150) return "IMMINENT_CLOTTING";
    if (tmp > 150 || deltaP > 100) return "MODERATE_FOULING";
    return "OPTIMAL";
  }

  /**
   * Rule-Based CRRT Safety Alert Generator
   */
  public static generateCrrtAlerts(
    hydraulics: CircuitHydraulics,
    citrate: CitrateAnticoagulationTelemetry,
    metabolics: RenalMetabolicBiomarkers
  ): CrrtAlert[] {
    const alerts: CrrtAlert[] = [];
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. High Transmembrane Pressure / Clotting Alert
    if (hydraulics.transmembranePressureMmHg > 250) {
      alerts.push({
        id: `ALT-TMP-${Date.now()}`,
        severity: hydraulics.transmembranePressureMmHg > 300 ? "CRITICAL" : "HIGH",
        title: "Transmembrane Pressure (TMP) Critical Elevation",
        triggerMeasurement: `TMP: ${hydraulics.transmembranePressureMmHg} mmHg`,
        expectedRange: "< 200 mmHg",
        clinicalMeaning: "Membrane pore fouling / severe microvascular fiber clotting occurring in hemofilter.",
        actionGuidance: "Increase pre-dilution replacement fluid, evaluate anticoagulation titration, or prepare replacement circuit.",
        timestamp: now
      });
    }

    // 2. High Negative Access Pressure
    if (hydraulics.accessPressureMmHg < -200) {
      alerts.push({
        id: `ALT-ACC-${Date.now()}`,
        severity: "CRITICAL",
        title: "Severe Negative Access Line Suction Pressure",
        triggerMeasurement: `P_acc: ${hydraulics.accessPressureMmHg} mmHg`,
        expectedRange: "-50 to -150 mmHg",
        clinicalMeaning: "Vascular catheter kinking, catheter wall collapse, or lumen thrombosis.",
        actionGuidance: "Reposition catheter, flush lumens under sterile technique, reduce blood flow rate (Q_b) temporarily.",
        timestamp: now
      });
    }

    // 3. Citrate Accumulation / Citrate Lock
    if (citrate.totalToIonizedCalciumRatio > 2.5) {
      alerts.push({
        id: `ALT-CIT-${Date.now()}`,
        severity: "CRITICAL",
        title: "Citrate Accumulation / Citrate Lock Detected",
        triggerMeasurement: `Total Ca / iCa Ratio: ${citrate.totalToIonizedCalciumRatio}`,
        expectedRange: "< 2.5",
        clinicalMeaning: "Hepatic failure to metabolize citrate tricarboxylic acid into bicarbonate, causing metabolic acidosis & hypocalcemia.",
        actionGuidance: "Reduce/stop ACD-A citrate infusion rate immediately; increase dialysate flow (Q_d) for enhanced citrate clearance.",
        timestamp: now
      });
    }

    // 4. Hyperkalemia Alert
    if (metabolics.potassiumMmolL > 6.0) {
      alerts.push({
        id: `ALT-K-${Date.now()}`,
        severity: metabolics.potassiumMmolL > 6.5 ? "CRITICAL" : "HIGH",
        title: "Severe Refractory Hyperkalemia",
        triggerMeasurement: `K+: ${metabolics.potassiumMmolL} mmol/L`,
        expectedRange: "3.5 - 5.0 mmol/L",
        clinicalMeaning: "Life-threatening dysrhythmia & cardiac arrest risk.",
        actionGuidance: "Verify potassium-free dialysate/replacement fluid, increase effluent dose to >= 30 mL/kg/h.",
        timestamp: now
      });
    }

    // 5. Severe Fluid Overload
    if (metabolics.percentFluidOverload > 10.0) {
      alerts.push({
        id: `ALT-FO-${Date.now()}`,
        severity: "WARNING",
        title: "Pathological Percentage Fluid Overload (>10%)",
        triggerMeasurement: `%FO: ${metabolics.percentFluidOverload}% (${metabolics.cumulativeFluidBalanceLiters.toFixed(1)} L)`,
        expectedRange: "< 5%",
        clinicalMeaning: "Severe volume overload linked to pulmonary edema, intra-abdominal hypertension, and delayed renal recovery.",
        actionGuidance: "Titrate net ultrafiltration rate (Q_uf) upwards with continuous hemodynamics & lactate monitoring.",
        timestamp: now
      });
    }

    return alerts;
  }

  /**
   * Mock CRRT Nephrology Patient Repository (6 Deep Critical Care Cases)
   */
  public static getMockCrrtPatients(): CrrtPatient[] {
    const patients: CrrtPatient[] = [
      {
        id: "CRRT-PT-701",
        mrn: "MRN-1904821",
        name: "Harish Vardhan",
        ageYears: 64,
        gender: "MALE",
        weightKg: 84.0,
        heightCm: 175,
        admissionDiagnosis: "Septic Shock with Multi-Organ Failure & AKI Stage 3",
        kdigoStage: "STAGE_3",
        modality: "CVVHDF",
        anticoagulation: "REGIONAL_CITRATE",
        vascularAccessLocation: "Right Internal Jugular 13.5 Fr Mahurkar",
        hydraulics: {
          accessPressureMmHg: -110,
          filterPrePressureMmHg: 185,
          returnPressureMmHg: 95,
          effluentPressureMmHg: 15,
          transmembranePressureMmHg: 125,
          filterPressureDropMmHg: 90,
          filtrationFractionPercent: 18.5,
          bloodFlowRateMlMin: 180,
          filterLifeHours: 28.5,
          healthStatus: "OPTIMAL"
        },
        prescription: {
          preFilterReplacementMlHr: 1000,
          postFilterReplacementMlHr: 400,
          dialysateFlowMlHr: 800,
          netUltrafiltrationMlHr: 150,
          totalEffluentFlowMlHr: 2350,
          deliveredDoseMlKgHr: 28.0,
          prescribedDoseMlKgHr: 25.0
        },
        citrateTelemetry: {
          citrateInfusionRateMmolHr: 24.0,
          calciumChlorideCompensationMlHr: 8.5,
          postFilterIonizedCalciumMmolL: 0.28,
          systemicIonizedCalciumMmolL: 1.18,
          totalCalciumMmolL: 2.45,
          totalToIonizedCalciumRatio: 2.08,
          citrateToxicityRisk: "NONE"
        },
        metabolics: {
          serumCreatinineMgDl: 4.8,
          serumUreaNitrogenBUNMgDl: 82,
          potassiumMmolL: 4.4,
          bicarbonateMmolL: 21,
          sodiumMmolL: 138,
          ionizedCalciumMmolL: 1.18,
          phosphorusMgDl: 5.2,
          magnesiumMgDl: 2.1,
          arterialPh: 7.34,
          urineOutputMlKgHr: 0.12,
          cumulativeFluidBalanceLiters: 6.8,
          percentFluidOverload: 8.1
        },
        alerts: [],
        pressureHistory: {
          tmp: [100, 105, 110, 115, 118, 120, 122, 125],
          deltaP: [75, 78, 80, 82, 85, 88, 90, 90],
          access: [-100, -102, -105, -108, -110, -110, -112, -110]
        }
      },
      {
        id: "CRRT-PT-702",
        mrn: "MRN-2850193",
        name: "Ananya Deshpande",
        ageYears: 71,
        gender: "FEMALE",
        weightKg: 68.0,
        heightCm: 158,
        admissionDiagnosis: "Acute Decompensated Heart Failure (Cardiorenal Syndrome Type 1)",
        kdigoStage: "STAGE_3",
        modality: "SCUF",
        anticoagulation: "SYSTEMIC_HEPARIN",
        vascularAccessLocation: "Right Femoral 14 Fr Duo-Flow",
        hydraulics: {
          accessPressureMmHg: -135,
          filterPrePressureMmHg: 210,
          returnPressureMmHg: 110,
          effluentPressureMmHg: -25,
          transmembranePressureMmHg: 185,
          filterPressureDropMmHg: 100,
          filtrationFractionPercent: 22.1,
          bloodFlowRateMlMin: 150,
          filterLifeHours: 42.0,
          healthStatus: "MODERATE_FOULING"
        },
        prescription: {
          preFilterReplacementMlHr: 0,
          postFilterReplacementMlHr: 0,
          dialysateFlowMlHr: 0,
          netUltrafiltrationMlHr: 250,
          totalEffluentFlowMlHr: 250,
          deliveredDoseMlKgHr: 3.7,
          prescribedDoseMlKgHr: 3.7
        },
        citrateTelemetry: {
          citrateInfusionRateMmolHr: 0,
          calciumChlorideCompensationMlHr: 0,
          postFilterIonizedCalciumMmolL: 1.15,
          systemicIonizedCalciumMmolL: 1.15,
          totalCalciumMmolL: 2.20,
          totalToIonizedCalciumRatio: 1.91,
          citrateToxicityRisk: "NONE"
        },
        metabolics: {
          serumCreatinineMgDl: 3.6,
          serumUreaNitrogenBUNMgDl: 64,
          potassiumMmolL: 4.8,
          bicarbonateMmolL: 23,
          sodiumMmolL: 132,
          ionizedCalciumMmolL: 1.15,
          phosphorusMgDl: 4.6,
          magnesiumMgDl: 2.0,
          arterialPh: 7.38,
          urineOutputMlKgHr: 0.18,
          cumulativeFluidBalanceLiters: 9.4,
          percentFluidOverload: 13.8 // > 10% Alert
        },
        alerts: [],
        pressureHistory: {
          tmp: [140, 148, 155, 162, 170, 175, 180, 185],
          deltaP: [80, 84, 88, 92, 95, 98, 100, 100],
          access: [-115, -120, -122, -125, -128, -130, -132, -135]
        }
      },
      {
        id: "CRRT-PT-703",
        mrn: "MRN-3918402",
        name: "Devendra Rathore",
        ageYears: 56,
        gender: "MALE",
        weightKg: 92.0,
        heightCm: 180,
        admissionDiagnosis: "Acute Tumor Lysis Syndrome & Severe Hyperkalemia",
        kdigoStage: "STAGE_3",
        modality: "CVVH",
        anticoagulation: "REGIONAL_CITRATE",
        vascularAccessLocation: "Right Internal Jugular 14 Fr",
        hydraulics: {
          accessPressureMmHg: -125,
          filterPrePressureMmHg: 245,
          returnPressureMmHg: 115,
          effluentPressureMmHg: 20,
          transmembranePressureMmHg: 160,
          filterPressureDropMmHg: 130,
          filtrationFractionPercent: 21.0,
          bloodFlowRateMlMin: 220,
          filterLifeHours: 14.0,
          healthStatus: "MODERATE_FOULING"
        },
        prescription: {
          preFilterReplacementMlHr: 1800,
          postFilterReplacementMlHr: 800,
          dialysateFlowMlHr: 0,
          netUltrafiltrationMlHr: 100,
          totalEffluentFlowMlHr: 2700,
          deliveredDoseMlKgHr: 29.3,
          prescribedDoseMlKgHr: 30.0
        },
        citrateTelemetry: {
          citrateInfusionRateMmolHr: 30.0,
          calciumChlorideCompensationMlHr: 10.5,
          postFilterIonizedCalciumMmolL: 0.31,
          systemicIonizedCalciumMmolL: 1.14,
          totalCalciumMmolL: 2.30,
          totalToIonizedCalciumRatio: 2.01,
          citrateToxicityRisk: "NONE"
        },
        metabolics: {
          serumCreatinineMgDl: 5.2,
          serumUreaNitrogenBUNMgDl: 96,
          potassiumMmolL: 6.4, // Hyperkalemia > 6.0
          bicarbonateMmolL: 16,
          sodiumMmolL: 139,
          ionizedCalciumMmolL: 1.14,
          phosphorusMgDl: 8.8,
          magnesiumMgDl: 2.7,
          arterialPh: 7.26,
          urineOutputMlKgHr: 0.05,
          cumulativeFluidBalanceLiters: 4.2,
          percentFluidOverload: 4.5
        },
        alerts: [],
        pressureHistory: {
          tmp: [130, 135, 140, 145, 150, 155, 158, 160],
          deltaP: [100, 105, 110, 115, 120, 125, 128, 130],
          access: [-110, -112, -115, -118, -120, -122, -124, -125]
        }
      },
      {
        id: "CRRT-PT-704",
        mrn: "MRN-4920184",
        name: "Lakshmi Narayanan",
        ageYears: 67,
        gender: "FEMALE",
        weightKg: 61.0,
        heightCm: 155,
        admissionDiagnosis: "Post-Hepatectomy Liver Failure & Citrate Accumulation Risk",
        kdigoStage: "STAGE_3",
        modality: "CVVHD",
        anticoagulation: "REGIONAL_CITRATE",
        vascularAccessLocation: "Right Internal Jugular 13.5 Fr",
        hydraulics: {
          accessPressureMmHg: -95,
          filterPrePressureMmHg: 160,
          returnPressureMmHg: 80,
          effluentPressureMmHg: 10,
          transmembranePressureMmHg: 110,
          filterPressureDropMmHg: 80,
          filtrationFractionPercent: 12.0,
          bloodFlowRateMlMin: 160,
          filterLifeHours: 36.0,
          healthStatus: "OPTIMAL"
        },
        prescription: {
          preFilterReplacementMlHr: 0,
          postFilterReplacementMlHr: 0,
          dialysateFlowMlHr: 1600,
          netUltrafiltrationMlHr: 80,
          totalEffluentFlowMlHr: 1680,
          deliveredDoseMlKgHr: 27.5,
          prescribedDoseMlKgHr: 25.0
        },
        citrateTelemetry: {
          citrateInfusionRateMmolHr: 18.0,
          calciumChlorideCompensationMlHr: 9.0,
          postFilterIonizedCalciumMmolL: 0.34,
          systemicIonizedCalciumMmolL: 0.98, // Low systemic iCa
          totalCalciumMmolL: 2.75,
          totalToIonizedCalciumRatio: 2.81, // > 2.5 CITRATE LOCK
          citrateToxicityRisk: "SEVERE_CITRATE_LOCK"
        },
        metabolics: {
          serumCreatinineMgDl: 3.2,
          serumUreaNitrogenBUNMgDl: 54,
          potassiumMmolL: 4.1,
          bicarbonateMmolL: 17,
          sodiumMmolL: 142,
          ionizedCalciumMmolL: 0.98,
          phosphorusMgDl: 4.2,
          magnesiumMgDl: 1.8,
          arterialPh: 7.29,
          urineOutputMlKgHr: 0.25,
          cumulativeFluidBalanceLiters: 3.5,
          percentFluidOverload: 5.7
        },
        alerts: [],
        pressureHistory: {
          tmp: [90, 92, 95, 98, 102, 105, 108, 110],
          deltaP: [65, 68, 70, 72, 75, 76, 78, 80],
          access: [-85, -88, -90, -92, -94, -95, -95, -95]
        }
      },
      {
        id: "CRRT-PT-705",
        mrn: "MRN-5819024",
        name: "Siddharth Kaushik",
        ageYears: 42,
        gender: "MALE",
        weightKg: 88.0,
        heightCm: 182,
        admissionDiagnosis: "Polytrauma, Crush Injury & Severe Rhabdomyolysis",
        kdigoStage: "STAGE_3",
        modality: "CVVHDF",
        anticoagulation: "NO_ANTICOAGULATION",
        vascularAccessLocation: "Right Internal Jugular 14 Fr",
        hydraulics: {
          accessPressureMmHg: -140,
          filterPrePressureMmHg: 290,
          returnPressureMmHg: 120,
          effluentPressureMmHg: -30,
          transmembranePressureMmHg: 235, // High TMP
          filterPressureDropMmHg: 170, // High Delta P
          filtrationFractionPercent: 24.5,
          bloodFlowRateMlMin: 200,
          filterLifeHours: 58.0,
          healthStatus: "IMMINENT_CLOTTING"
        },
        prescription: {
          preFilterReplacementMlHr: 1500,
          postFilterReplacementMlHr: 500,
          dialysateFlowMlHr: 1000,
          netUltrafiltrationMlHr: 100,
          totalEffluentFlowMlHr: 3100,
          deliveredDoseMlKgHr: 35.2,
          prescribedDoseMlKgHr: 35.0
        },
        citrateTelemetry: {
          citrateInfusionRateMmolHr: 0,
          calciumChlorideCompensationMlHr: 0,
          postFilterIonizedCalciumMmolL: 1.20,
          systemicIonizedCalciumMmolL: 1.20,
          totalCalciumMmolL: 2.15,
          totalToIonizedCalciumRatio: 1.79,
          citrateToxicityRisk: "NONE"
        },
        metabolics: {
          serumCreatinineMgDl: 6.8,
          serumUreaNitrogenBUNMgDl: 110,
          potassiumMmolL: 5.6,
          bicarbonateMmolL: 18,
          sodiumMmolL: 137,
          ionizedCalciumMmolL: 1.20,
          phosphorusMgDl: 7.4,
          magnesiumMgDl: 2.6,
          arterialPh: 7.31,
          urineOutputMlKgHr: 0.02,
          cumulativeFluidBalanceLiters: 5.2,
          percentFluidOverload: 5.9
        },
        alerts: [],
        pressureHistory: {
          tmp: [160, 175, 190, 205, 215, 222, 230, 235],
          deltaP: [110, 120, 135, 145, 155, 160, 165, 170],
          access: [-120, -125, -128, -132, -135, -138, -140, -140]
        }
      },
      {
        id: "CRRT-PT-706",
        mrn: "MRN-6910293",
        name: "Geeta Sen",
        ageYears: 60,
        gender: "FEMALE",
        weightKg: 72.0,
        heightCm: 162,
        admissionDiagnosis: "Severe Thermal Burn (45% TBSA) & AKI Stage 3",
        kdigoStage: "STAGE_3",
        modality: "SLED",
        anticoagulation: "SYSTEMIC_HEPARIN",
        vascularAccessLocation: "Right Internal Jugular 13.5 Fr",
        hydraulics: {
          accessPressureMmHg: -105,
          filterPrePressureMmHg: 175,
          returnPressureMmHg: 85,
          effluentPressureMmHg: 10,
          transmembranePressureMmHg: 120,
          filterPressureDropMmHg: 90,
          filtrationFractionPercent: 16.0,
          bloodFlowRateMlMin: 180,
          filterLifeHours: 18.0,
          healthStatus: "OPTIMAL"
        },
        prescription: {
          preFilterReplacementMlHr: 500,
          postFilterReplacementMlHr: 500,
          dialysateFlowMlHr: 1200,
          netUltrafiltrationMlHr: 150,
          totalEffluentFlowMlHr: 2350,
          deliveredDoseMlKgHr: 32.6,
          prescribedDoseMlKgHr: 30.0
        },
        citrateTelemetry: {
          citrateInfusionRateMmolHr: 0,
          calciumChlorideCompensationMlHr: 0,
          postFilterIonizedCalciumMmolL: 1.18,
          systemicIonizedCalciumMmolL: 1.18,
          totalCalciumMmolL: 2.25,
          totalToIonizedCalciumRatio: 1.90,
          citrateToxicityRisk: "NONE"
        },
        metabolics: {
          serumCreatinineMgDl: 4.1,
          serumUreaNitrogenBUNMgDl: 78,
          potassiumMmolL: 4.6,
          bicarbonateMmolL: 22,
          sodiumMmolL: 140,
          ionizedCalciumMmolL: 1.18,
          phosphorusMgDl: 4.9,
          magnesiumMgDl: 2.2,
          arterialPh: 7.36,
          urineOutputMlKgHr: 0.15,
          cumulativeFluidBalanceLiters: 8.2,
          percentFluidOverload: 11.4 // > 10% Alert
        },
        alerts: [],
        pressureHistory: {
          tmp: [95, 100, 105, 108, 112, 115, 118, 120],
          deltaP: [70, 74, 78, 80, 82, 85, 88, 90],
          access: [-90, -92, -95, -98, -100, -102, -105, -105]
        }
      }
    ];

    // Compute active alerts for each patient
    return patients.map((p) => ({
      ...p,
      alerts: CrrtTelemetryService.generateCrrtAlerts(p.hydraulics, p.citrateTelemetry, p.metabolics)
    }));
  }

  /**
   * Simulate a stochastic hydraulic & metabolic telemetry tick
   */
  public static simulateCrrtTelemetryTick(patients: CrrtPatient[]): CrrtPatient[] {
    return patients.map((patient) => {
      // Simulate small pressure drift (+- 2 mmHg)
      const pPreDrift = Math.floor((Math.random() - 0.45) * 4);
      const newPPre = Math.max(120, patient.hydraulics.filterPrePressureMmHg + pPreDrift);
      const newPRet = Math.max(60, patient.hydraulics.returnPressureMmHg + Math.floor((Math.random() - 0.5) * 2));
      const newPEff = patient.hydraulics.effluentPressureMmHg + Math.floor((Math.random() - 0.5) * 2);

      const newTmp = CrrtTelemetryService.calculateTmp(newPPre, newPRet, newPEff);
      const newDeltaP = CrrtTelemetryService.calculateFilterDrop(newPPre, newPRet);
      const health = CrrtTelemetryService.evaluateFilterHealth(newTmp, newDeltaP);

      // Accumulate pressure history (keep last 12 points)
      const tmpHistory = [...patient.pressureHistory.tmp.slice(1), newTmp];
      const deltaPHistory = [...patient.pressureHistory.deltaP.slice(1), newDeltaP];
      const accessHistory = [...patient.pressureHistory.access.slice(1), patient.hydraulics.accessPressureMmHg];

      const updatedHydraulics: CircuitHydraulics = {
        ...patient.hydraulics,
        filterPrePressureMmHg: newPPre,
        returnPressureMmHg: newPRet,
        effluentPressureMmHg: newPEff,
        transmembranePressureMmHg: newTmp,
        filterPressureDropMmHg: newDeltaP,
        healthStatus: health
      };

      const alerts = CrrtTelemetryService.generateCrrtAlerts(
        updatedHydraulics,
        patient.citrateTelemetry,
        patient.metabolics
      );

      return {
        ...patient,
        hydraulics: updatedHydraulics,
        alerts,
        pressureHistory: {
          tmp: tmpHistory,
          deltaP: deltaPHistory,
          access: accessHistory
        }
      };
    });
  }

  /**
   * Calculate Unit / Ward Metrics
   */
  public static calculateWardMetrics(patients: CrrtPatient[]): CrrtWardMetrics {
    const total = patients.length;
    const cvvhdf = patients.filter((p) => p.modality === "CVVHDF").length;
    const cvvh = patients.filter((p) => p.modality === "CVVH").length;
    const scuf = patients.filter((p) => p.modality === "SCUF").length;

    const totalDose = patients.reduce((acc, p) => acc + p.prescription.deliveredDoseMlKgHr, 0);
    const meanDose = total > 0 ? Math.round((totalDose / total) * 10) / 10 : 0;

    const clottingRisk = patients.filter((p) => p.hydraulics.healthStatus === "IMMINENT_CLOTTING" || p.hydraulics.healthStatus === "CLOTTED_CHANGE_NOW").length;
    const citrateWarn = patients.filter((p) => p.citrateTelemetry.citrateToxicityRisk !== "NONE").length;
    const fluidOverload = patients.filter((p) => p.metabolics.percentFluidOverload > 10.0).length;
    const hyperK = patients.filter((p) => p.metabolics.potassiumMmolL > 6.0).length;

    return {
      totalCrrtActive: total,
      cvvhdfCount: cvvhdf,
      cvvhCount: cvvh,
      scufCount: scuf,
      meanDeliveredDoseMlKgHr: meanDose,
      filterClottingRiskCount: clottingRisk,
      citrateToxicityWarningCount: citrateWarn,
      severeFluidOverloadCount: fluidOverload,
      hyperkalemiaCount: hyperK,
      lastTelemetrySyncTimestamp: new Date().toISOString()
    };
  }

  /**
   * Export Patient CRRT Record to HL7 FHIR R4 Bundle
   */
  public static exportPatientToFhirR4Crrt(patient: CrrtPatient): object {
    return {
      resourceType: "Bundle",
      id: `crrt-fhir-${patient.id}-${Date.now()}`,
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: `urn:uuid:patient-${patient.id}`,
          resource: {
            resourceType: "Patient",
            id: patient.id,
            identifier: [{ system: "urn:oid:medtrack:crrt:mrn", value: patient.mrn }],
            name: [{ use: "official", text: patient.name }],
            gender: patient.gender.toLowerCase()
          }
        },
        {
          fullUrl: `urn:uuid:devicetric-crrt-${patient.id}`,
          resource: {
            resourceType: "DeviceMetric",
            id: `metric-crrt-${patient.id}`,
            type: { text: "Continuous Renal Replacement Therapy Hemodiafiltration Monitor" },
            unit: { text: "mmHg" },
            measurementFrequency: { value: 1.2, unit: "s" },
            operationalStatus: "on",
            extension: [
              { url: "http://hl7.org/fhir/StructureDefinition/tmp-pressure", valueDecimal: patient.hydraulics.transmembranePressureMmHg },
              { url: "http://hl7.org/fhir/StructureDefinition/effluent-dose", valueDecimal: patient.prescription.deliveredDoseMlKgHr },
              { url: "http://hl7.org/fhir/StructureDefinition/total-ca-ica-ratio", valueDecimal: patient.citrateTelemetry.totalToIonizedCalciumRatio }
            ]
          }
        }
      ]
    };
  }

  /**
   * Export Patient CRRT Telemetry to CSV
   */
  public static exportPatientCrrtCsv(patient: CrrtPatient): string {
    const headers = [
      "Patient ID",
      "MRN",
      "Name",
      "Diagnosis",
      "KDIGO Stage",
      "Modality",
      "Anticoagulation",
      "Blood Flow Q_b (mL/min)",
      "TMP (mmHg)",
      "Delta P (mmHg)",
      "Filtration Fraction (%)",
      "Delivered Dose (mL/kg/h)",
      "Net UF (mL/h)",
      "Citrate Ratio (Total/iCa)",
      "Potassium (mmol/L)",
      "Fluid Overload (%)"
    ].join(",");

    const row = [
      `"${patient.id}"`,
      `"${patient.mrn}"`,
      `"${patient.name}"`,
      `"${patient.admissionDiagnosis}"`,
      `"${patient.kdigoStage}"`,
      `"${patient.modality}"`,
      `"${patient.anticoagulation}"`,
      patient.hydraulics.bloodFlowRateMlMin,
      patient.hydraulics.transmembranePressureMmHg,
      patient.hydraulics.filterPressureDropMmHg,
      patient.hydraulics.filtrationFractionPercent,
      patient.prescription.deliveredDoseMlKgHr,
      patient.prescription.netUltrafiltrationMlHr,
      patient.citrateTelemetry.totalToIonizedCalciumRatio,
      patient.metabolics.potassiumMmolL,
      patient.metabolics.percentFluidOverload
    ].join(",");

    return `${headers}
${row}`;
  }
}
