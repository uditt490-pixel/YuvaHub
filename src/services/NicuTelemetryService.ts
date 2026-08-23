/**
 * Neonatal Intensive Care & High-Frequency Oscillatory Telemetry Service Engine
 * 
 * Standards Reference:
 * - AAP Neonatal Resuscitation Program (NRP 8th Edition)
 * - SNAPPE-II (Score for Neonatal Acute Physiology with Perinatal Extension)
 * - Bhutani Hyperbilirubinemia Nomogram & Phototherapy Thresholds
 * - Near-Infrared Spectroscopy (NIRS) Cerebral Tissue Oxygen Extraction (FTOE)
 * - HL7 FHIR R4 DeviceMetric & Observation Telemetry Profiles
 */

import {
  GestationalBracket,
  BirthWeightCategory,
  NicuVentilatorMode,
  HieHypothermiaStatus,
  PrePostDuctalSpO2,
  NicuVentilatorTelemetry,
  NicuVitalSigns,
  NicuNutritionAndFluids,
  NicuAlert,
  NicuPatient,
  NicuWardMetrics
} from "../types/nicuTelemetry";

export class NicuTelemetryService {
  /**
   * Glucose Infusion Rate (GIR) Calculation
   * GIR (mg/kg/min) = (Dextrose % * Rate mL/hr) / (6 * Weight_kg)
   * Target: 4 - 8 mg/kg/min (Preterm brain metabolic preservation)
   */
  public static calculateGir(dextrosePercent: number, rateMlHr: number, weightGrams: number): number {
    const weightKg = weightGrams / 1000;
    if (weightKg <= 0) return 0;
    return Math.round(((dextrosePercent * rateMlHr) / (6 * weightKg)) * 10) / 10;
  }

  /**
   * High-Frequency Diffusive CO2 Elimination (DCO2) Index
   * DCO2 = Vt^2 * Frequency_Hz
   */
  public static calculateDco2(tidalVolumeMl: number, frequencyHz: number): number {
    return Math.round(Math.pow(tidalVolumeMl, 2) * frequencyHz * 10) / 10;
  }

  /**
   * Pre- vs Post-Ductal SpO2 Gradient (PPHN Marker)
   * Delta = Pre-Ductal (Right Arm) - Post-Ductal (Foot)
   */
  public static calculatePrePostDuctalGradient(preSpO2: number, postSpO2: number): number {
    return Math.round(preSpO2 - postSpO2);
  }

  /**
   * Fractional Tissue Oxygen Extraction (FTOE) via NIRS
   * FTOE = (SpO2 - rSO2) / SpO2
   */
  public static calculateFtoe(spO2Percent: number, rso2Percent: number): number {
    if (spO2Percent <= 0) return 0;
    return Math.round(((spO2Percent - rso2Percent) / spO2Percent) * 100) / 100;
  }

  /**
   * Day-of-Life Fluid Requirement (mL/kg/day)
   */
  public static calculateDayOfLifeFluidRequirement(dayOfLife: number, weightCategory: BirthWeightCategory): number {
    const isElbw = weightCategory === "ELBW" || weightCategory === "VLBW";
    if (dayOfLife <= 1) return isElbw ? 80 : 60;
    if (dayOfLife === 2) return isElbw ? 100 : 80;
    if (dayOfLife === 3) return isElbw ? 120 : 100;
    if (dayOfLife === 4) return isElbw ? 140 : 120;
    return 150; // Stable maintenance
  }

  /**
   * Bhutani Nomogram Bilirubin Phototherapy / Exchange Transfusion Threshold
   */
  public static evaluateBhutaniBilirubin(
    serumBilirubinMgDl: number,
    postnatalHours: number,
    gaWeeks: number
  ): { riskZone: "LOW" | "INTERMEDIATE" | "HIGH_PHOTOTHERAPY" | "EXCHANGE_TRANSFUSION"; thresholdMgDl: number } {
    let photoThreshold = 12.0;
    if (gaWeeks < 28) photoThreshold = 5.0;
    else if (gaWeeks < 32) photoThreshold = 7.0;
    else if (gaWeeks < 35) photoThreshold = 10.0;
    else if (postnatalHours < 24) photoThreshold = 6.0;
    else if (postnatalHours < 48) photoThreshold = 10.0;
    else if (postnatalHours < 72) photoThreshold = 13.0;

    const exchangeThreshold = photoThreshold + 5.0;

    if (serumBilirubinMgDl >= exchangeThreshold) {
      return { riskZone: "EXCHANGE_TRANSFUSION", thresholdMgDl: exchangeThreshold };
    }
    if (serumBilirubinMgDl >= photoThreshold) {
      return { riskZone: "HIGH_PHOTOTHERAPY", thresholdMgDl: photoThreshold };
    }
    if (serumBilirubinMgDl >= photoThreshold - 2.5) {
      return { riskZone: "INTERMEDIATE", thresholdMgDl: photoThreshold };
    }
    return { riskZone: "LOW", thresholdMgDl: photoThreshold };
  }

  /**
   * Rule-Based NICU Alert Generator
   */
  public static generateNicuAlerts(
    vitals: NicuVitalSigns,
    prePost: PrePostDuctalSpO2,
    ventilation: NicuVentilatorTelemetry,
    nutrition: NicuNutritionAndFluids,
    gestationalAgeWeeks: number
  ): NicuAlert[] {
    const alerts: NicuAlert[] = [];
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Severe PPHN Pre/Post Ductal Gradient
    if (prePost.gradientDeltaSpO2 > 10) {
      alerts.push({
        id: `ALT-PPHN-${Date.now()}`,
        severity: "CRITICAL",
        title: "Severe Right-to-Left Shunting (PPHN / PDA)",
        triggerMeasurement: `Pre/Post Ductal Delta: ${prePost.gradientDeltaSpO2}% (Pre: ${prePost.preDuctalRightWristSpO2}%, Post: ${prePost.postDuctalFootSpO2}%)`,
        expectedRange: "Delta SpO2 < 5%",
        clinicalMeaning: "High pulmonary vascular resistance causing deoxygenated blood to shunt through ductus arteriosus.",
        actionGuidance: "Initiate/titrate Inhaled Nitric Oxide (iNO 20 ppm); optimize sedation, lung recruitment, and targeted echo.",
        timestamp: now
      });
    }

    // 2. Neonatal Hypoglycemia
    if (vitals.glucoseMgDl < 45) {
      alerts.push({
        id: `ALT-GLU-${Date.now()}`,
        severity: "CRITICAL",
        title: "Severe Neonatal Hypoglycemia",
        triggerMeasurement: `Blood Glucose: ${vitals.glucoseMgDl} mg/dL`,
        expectedRange: "> 50 mg/dL",
        clinicalMeaning: "Impaired neurodevelopmental glucose availability; risk of neonatal seizures and encephalopathy.",
        actionGuidance: "Administer 2 mL/kg D10W IV push immediately; titrate Glucose Infusion Rate (GIR) to >= 6 mg/kg/min.",
        timestamp: now
      });
    }

    // 3. Neonatal Hypotension (MAP < Gestational Age)
    if (vitals.meanArterialPressureMmHg < gestationalAgeWeeks) {
      alerts.push({
        id: `ALT-MAP-${Date.now()}`,
        severity: "HIGH",
        title: "Neonatal Hemodynamic Hypotension",
        triggerMeasurement: `MAP: ${vitals.meanArterialPressureMmHg} mmHg (GA: ${gestationalAgeWeeks}w)`,
        expectedRange: `MAP >= ${gestationalAgeWeeks} mmHg`,
        clinicalMeaning: "Inadequate systemic organ perfusion and cerebral autoregulation impairment.",
        actionGuidance: "Assess targeted echo (TNE) for myocardial dysfunction vs hypovolemia; consider Dobutamine / Hydrocortisone.",
        timestamp: now
      });
    }

    // 4. Low Cerebral Tissue Oxygenation (NIRS rSO2)
    if (prePost.cerebralNirsRso2Percent < 55) {
      alerts.push({
        id: `ALT-NIRS-${Date.now()}`,
        severity: "WARNING",
        title: "Cerebral Tissue Desaturation (NIRS rSO2 < 55%)",
        triggerMeasurement: `Cerebral rSO2: ${prePost.cerebralNirsRso2Percent}% (FTOE: ${prePost.fractionalTissueOxygenExtraction})`,
        expectedRange: "60 - 80%",
        clinicalMeaning: "Cerebral hypoperfusion, severe anemia, or excessive cerebral metabolic oxygen consumption.",
        actionGuidance: "Check hematocrit / hemoglobin, optimize cardiac output and blood pressure.",
        timestamp: now
      });
    }

    return alerts;
  }

  /**
   * Mock NICU Patient Repository (6 Deep Neonatal Cases)
   */
  public static getMockNicuPatients(): NicuPatient[] {
    const patients: NicuPatient[] = [
      {
        id: "NICU-PT-801",
        mrn: "MRN-9018241",
        name: "Baby Boy Sharma (Twin A)",
        sex: "MALE",
        gestationalAgeWeeks: 24.2,
        postmenstrualAgeWeeks: 25.0,
        dayOfLife: 5,
        birthWeightGrams: 640,
        currentWeightGrams: 665,
        weightCategory: "ELBW",
        gestationalBracket: "EXTREMELY_PRETERM",
        bedNumber: "NICU-POD-A-01",
        admissionDiagnosis: "Extreme Prematurity, Severe RDS & Pulmonary Interstitial Emphysema",
        snappeScore: 48,
        vitals: {
          heartRateBpm: 154,
          respiratoryRateBpm: 0,
          systolicBloodPressureMmHg: 42,
          diastolicBloodPressureMmHg: 24,
          meanArterialPressureMmHg: 30, // >= 24w
          skinTemperatureCelsius: 36.8,
          coreTemperatureCelsius: 36.9,
          glucoseMgDl: 68,
          serumBilirubinMgDl: 6.2,
          apgar1Min: 3,
          apgar5Min: 6,
          apgar10Min: 8
        },
        prePostDuctal: {
          preDuctalRightWristSpO2: 92,
          postDuctalFootSpO2: 90,
          gradientDeltaSpO2: 2,
          cerebralNirsRso2Percent: 66,
          somaticNirsRso2Percent: 58,
          fractionalTissueOxygenExtraction: 0.28
        },
        ventilation: {
          mode: "HFOV",
          meanAirwayPressureCmH2O: 14.5,
          amplitudeDeltaPCmH2O: 28,
          frequencyHz: 12,
          inspiratoryTimePercent: 33,
          fractionInspiredOxygenFiO2: 0.40,
          dco2GasTransportCoefficient: 48.0,
          tidalVolumePerKgMl: 1.8,
          nitricOxidePpm: 0
        },
        nutrition: {
          glucoseInfusionRateMgKgMin: 6.5,
          totalFluidsMlKgDay: 140,
          dextroseConcentrationPercent: 12.5,
          trophicEnteralFeedMlKgDay: 10,
          urineOutputMlKgHr: 2.4
        },
        hypothermia: "NOT_INDICATED",
        phototherapyActive: true,
        alerts: [],
        vitalsHistory: {
          heartRate: [150, 152, 154, 155, 154, 153, 154, 154],
          preDuctalSpO2: [91, 92, 92, 93, 92, 91, 92, 92],
          postDuctalSpO2: [89, 90, 90, 91, 90, 89, 90, 90],
          meanPressure: [29, 30, 30, 31, 30, 29, 30, 30]
        }
      },
      {
        id: "NICU-PT-802",
        mrn: "MRN-9029103",
        name: "Baby Girl Verma",
        sex: "FEMALE",
        gestationalAgeWeeks: 39.1,
        postmenstrualAgeWeeks: 39.3,
        dayOfLife: 2,
        birthWeightGrams: 3350,
        currentWeightGrams: 3280,
        weightCategory: "NBW",
        gestationalBracket: "FULL_TERM",
        bedNumber: "NICU-POD-B-04",
        admissionDiagnosis: "Severe Hypoxic-Ischemic Encephalopathy (HIE Stage II) S/P Sentinel Event",
        snappeScore: 62,
        vitals: {
          heartRateBpm: 108, // Therapeutic hypothermia relative bradycardia
          respiratoryRateBpm: 32,
          systolicBloodPressureMmHg: 68,
          diastolicBloodPressureMmHg: 38,
          meanArterialPressureMmHg: 48,
          skinTemperatureCelsius: 33.4,
          coreTemperatureCelsius: 33.5, // Target cooling: 33.5 C
          glucoseMgDl: 74,
          serumBilirubinMgDl: 4.5,
          apgar1Min: 1,
          apgar5Min: 3,
          apgar10Min: 5
        },
        prePostDuctal: {
          preDuctalRightWristSpO2: 96,
          postDuctalFootSpO2: 95,
          gradientDeltaSpO2: 1,
          cerebralNirsRso2Percent: 74,
          somaticNirsRso2Percent: 62,
          fractionalTissueOxygenExtraction: 0.23
        },
        ventilation: {
          mode: "SIMV_PRVC",
          meanAirwayPressureCmH2O: 9.0,
          amplitudeDeltaPCmH2O: 0,
          frequencyHz: 0,
          inspiratoryTimePercent: 40,
          fractionInspiredOxygenFiO2: 0.25,
          dco2GasTransportCoefficient: 0,
          tidalVolumePerKgMl: 4.5,
          nitricOxidePpm: 0
        },
        nutrition: {
          glucoseInfusionRateMgKgMin: 4.8,
          totalFluidsMlKgDay: 60, // Fluid restricted during cooling
          dextroseConcentrationPercent: 10.0,
          trophicEnteralFeedMlKgDay: 0, // NPO during hypothermia
          urineOutputMlKgHr: 1.8
        },
        hypothermia: "COOLING_IN_PROGRESS",
        phototherapyActive: false,
        alerts: [],
        vitalsHistory: {
          heartRate: [115, 112, 110, 108, 108, 107, 108, 108],
          preDuctalSpO2: [95, 96, 96, 97, 96, 95, 96, 96],
          postDuctalSpO2: [94, 95, 95, 96, 95, 94, 95, 95],
          meanPressure: [47, 48, 48, 49, 48, 47, 48, 48]
        }
      },
      {
        id: "NICU-PT-803",
        mrn: "MRN-9038291",
        name: "Baby Boy Kapoor",
        sex: "MALE",
        gestationalAgeWeeks: 36.4,
        postmenstrualAgeWeeks: 36.8,
        dayOfLife: 3,
        birthWeightGrams: 2750,
        currentWeightGrams: 2690,
        weightCategory: "NBW",
        gestationalBracket: "MODERATE_LATE_PRETERM",
        bedNumber: "NICU-POD-A-03",
        admissionDiagnosis: "Meconium Aspiration Syndrome & Severe Refractory PPHN",
        snappeScore: 54,
        vitals: {
          heartRateBpm: 168,
          respiratoryRateBpm: 0,
          systolicBloodPressureMmHg: 52,
          diastolicBloodPressureMmHg: 28,
          meanArterialPressureMmHg: 36,
          skinTemperatureCelsius: 37.0,
          coreTemperatureCelsius: 37.1,
          glucoseMgDl: 82,
          serumBilirubinMgDl: 5.8,
          apgar1Min: 2,
          apgar5Min: 5,
          apgar10Min: 7
        },
        prePostDuctal: {
          preDuctalRightWristSpO2: 94,
          postDuctalFootSpO2: 81, // Severe gradient > 10%
          gradientDeltaSpO2: 13, // Critical PPHN trigger
          cerebralNirsRso2Percent: 58,
          somaticNirsRso2Percent: 44,
          fractionalTissueOxygenExtraction: 0.38
        },
        ventilation: {
          mode: "HFOV",
          meanAirwayPressureCmH2O: 18.0,
          amplitudeDeltaPCmH2O: 38,
          frequencyHz: 10,
          inspiratoryTimePercent: 33,
          fractionInspiredOxygenFiO2: 0.85,
          dco2GasTransportCoefficient: 62.0,
          tidalVolumePerKgMl: 2.2,
          nitricOxidePpm: 20 // Active iNO 20 ppm
        },
        nutrition: {
          glucoseInfusionRateMgKgMin: 5.5,
          totalFluidsMlKgDay: 100,
          dextroseConcentrationPercent: 10.0,
          trophicEnteralFeedMlKgDay: 0,
          urineOutputMlKgHr: 1.6
        },
        hypothermia: "NOT_INDICATED",
        phototherapyActive: false,
        alerts: [],
        vitalsHistory: {
          heartRate: [165, 166, 168, 170, 168, 167, 168, 168],
          preDuctalSpO2: [93, 94, 94, 95, 94, 93, 94, 94],
          postDuctalSpO2: [80, 81, 81, 82, 81, 80, 81, 81],
          meanPressure: [35, 36, 36, 37, 36, 35, 36, 36]
        }
      },
      {
        id: "NICU-PT-804",
        mrn: "MRN-9041029",
        name: "Baby Girl Menon",
        sex: "FEMALE",
        gestationalAgeWeeks: 28.5,
        postmenstrualAgeWeeks: 30.1,
        dayOfLife: 11,
        birthWeightGrams: 1120,
        currentWeightGrams: 1190,
        weightCategory: "VLBW",
        gestationalBracket: "VERY_PRETERM",
        bedNumber: "NICU-POD-C-02",
        admissionDiagnosis: "Prematurity, Respiratory Distress Syndrome & Suspected NEC (Bell Stage IA)",
        snappeScore: 28,
        vitals: {
          heartRateBpm: 148,
          respiratoryRateBpm: 46,
          systolicBloodPressureMmHg: 48,
          diastolicBloodPressureMmHg: 26,
          meanArterialPressureMmHg: 33,
          skinTemperatureCelsius: 36.7,
          coreTemperatureCelsius: 36.8,
          glucoseMgDl: 41, // Hypoglycemia < 45 Alert
          serumBilirubinMgDl: 8.4,
          apgar1Min: 5,
          apgar5Min: 7,
          apgar10Min: 9
        },
        prePostDuctal: {
          preDuctalRightWristSpO2: 94,
          postDuctalFootSpO2: 92,
          gradientDeltaSpO2: 2,
          cerebralNirsRso2Percent: 68,
          somaticNirsRso2Percent: 60,
          fractionalTissueOxygenExtraction: 0.27
        },
        ventilation: {
          mode: "BUBBLE_CPAP",
          meanAirwayPressureCmH2O: 6.0,
          amplitudeDeltaPCmH2O: 0,
          frequencyHz: 0,
          inspiratoryTimePercent: 0,
          fractionInspiredOxygenFiO2: 0.28,
          dco2GasTransportCoefficient: 0,
          tidalVolumePerKgMl: 4.8,
          nitricOxidePpm: 0
        },
        nutrition: {
          glucoseInfusionRateMgKgMin: 4.2,
          totalFluidsMlKgDay: 150,
          dextroseConcentrationPercent: 10.0,
          trophicEnteralFeedMlKgDay: 0, // NPO for NEC evaluation
          urineOutputMlKgHr: 2.1
        },
        hypothermia: "NOT_INDICATED",
        phototherapyActive: true,
        alerts: [],
        vitalsHistory: {
          heartRate: [145, 146, 148, 150, 148, 147, 148, 148],
          preDuctalSpO2: [93, 94, 94, 95, 94, 93, 94, 94],
          postDuctalSpO2: [91, 92, 92, 93, 92, 91, 92, 92],
          meanPressure: [32, 33, 33, 34, 33, 32, 33, 33]
        }
      },
      {
        id: "NICU-PT-805",
        mrn: "MRN-9058190",
        name: "Baby Boy Das",
        sex: "MALE",
        gestationalAgeWeeks: 31.0,
        postmenstrualAgeWeeks: 32.2,
        dayOfLife: 8,
        birthWeightGrams: 1450,
        currentWeightGrams: 1480,
        weightCategory: "VLBW",
        gestationalBracket: "VERY_PRETERM",
        bedNumber: "NICU-POD-C-05",
        admissionDiagnosis: "Hemodynamically Significant Patent Ductus Arteriosus (hsPDA)",
        snappeScore: 34,
        vitals: {
          heartRateBpm: 162,
          respiratoryRateBpm: 58,
          systolicBloodPressureMmHg: 56,
          diastolicBloodPressureMmHg: 20, // Wide pulse pressure > 30 mmHg
          meanArterialPressureMmHg: 32,
          skinTemperatureCelsius: 36.9,
          coreTemperatureCelsius: 37.0,
          glucoseMgDl: 78,
          serumBilirubinMgDl: 7.1,
          apgar1Min: 6,
          apgar5Min: 8,
          apgar10Min: 9
        },
        prePostDuctal: {
          preDuctalRightWristSpO2: 95,
          postDuctalFootSpO2: 91,
          gradientDeltaSpO2: 4,
          cerebralNirsRso2Percent: 62,
          somaticNirsRso2Percent: 48, // Low somatic NIRS (Ductal steal)
          fractionalTissueOxygenExtraction: 0.35
        },
        ventilation: {
          mode: "NAVA",
          meanAirwayPressureCmH2O: 8.5,
          amplitudeDeltaPCmH2O: 0,
          frequencyHz: 0,
          inspiratoryTimePercent: 35,
          fractionInspiredOxygenFiO2: 0.32,
          dco2GasTransportCoefficient: 0,
          tidalVolumePerKgMl: 4.2,
          nitricOxidePpm: 0
        },
        nutrition: {
          glucoseInfusionRateMgKgMin: 6.8,
          totalFluidsMlKgDay: 130,
          dextroseConcentrationPercent: 12.5,
          trophicEnteralFeedMlKgDay: 20,
          urineOutputMlKgHr: 2.8
        },
        hypothermia: "NOT_INDICATED",
        phototherapyActive: false,
        alerts: [],
        vitalsHistory: {
          heartRate: [158, 160, 162, 164, 162, 161, 162, 162],
          preDuctalSpO2: [94, 95, 95, 96, 95, 94, 95, 95],
          postDuctalSpO2: [90, 91, 91, 92, 91, 90, 91, 91],
          meanPressure: [31, 32, 32, 33, 32, 31, 32, 32]
        }
      },
      {
        id: "NICU-PT-806",
        mrn: "MRN-9069124",
        name: "Baby Girl Chawla",
        sex: "FEMALE",
        gestationalAgeWeeks: 38.2,
        postmenstrualAgeWeeks: 38.6,
        dayOfLife: 3,
        birthWeightGrams: 3100,
        currentWeightGrams: 3020,
        weightCategory: "NBW",
        gestationalBracket: "FULL_TERM",
        bedNumber: "NICU-POD-B-01",
        admissionDiagnosis: "Rh Isoimmunization & Severe Hyperbilirubinemia (Exchange Transfusion Risk)",
        snappeScore: 22,
        vitals: {
          heartRateBpm: 138,
          respiratoryRateBpm: 42,
          systolicBloodPressureMmHg: 65,
          diastolicBloodPressureMmHg: 36,
          meanArterialPressureMmHg: 46,
          skinTemperatureCelsius: 36.8,
          coreTemperatureCelsius: 36.9,
          glucoseMgDl: 88,
          serumBilirubinMgDl: 18.2, // Critical Bilirubin > 18
          apgar1Min: 7,
          apgar5Min: 9,
          apgar10Min: 9
        },
        prePostDuctal: {
          preDuctalRightWristSpO2: 98,
          postDuctalFootSpO2: 98,
          gradientDeltaSpO2: 0,
          cerebralNirsRso2Percent: 72,
          somaticNirsRso2Percent: 65,
          fractionalTissueOxygenExtraction: 0.26
        },
        ventilation: {
          mode: "ROOM_AIR",
          meanAirwayPressureCmH2O: 0,
          amplitudeDeltaPCmH2O: 0,
          frequencyHz: 0,
          inspiratoryTimePercent: 0,
          fractionInspiredOxygenFiO2: 0.21,
          dco2GasTransportCoefficient: 0,
          tidalVolumePerKgMl: 5.5,
          nitricOxidePpm: 0
        },
        nutrition: {
          glucoseInfusionRateMgKgMin: 5.2,
          totalFluidsMlKgDay: 150,
          dextroseConcentrationPercent: 10.0,
          trophicEnteralFeedMlKgDay: 80,
          urineOutputMlKgHr: 3.2
        },
        hypothermia: "NOT_INDICATED",
        phototherapyActive: true, // Intensive Triple Phototherapy
        alerts: [],
        vitalsHistory: {
          heartRate: [135, 136, 138, 140, 138, 137, 138, 138],
          preDuctalSpO2: [97, 98, 98, 99, 98, 97, 98, 98],
          postDuctalSpO2: [97, 98, 98, 99, 98, 97, 98, 98],
          meanPressure: [45, 46, 46, 47, 46, 45, 46, 46]
        }
      }
    ];

    // Compute active alerts for each patient
    return patients.map((p) => ({
      ...p,
      alerts: NicuTelemetryService.generateNicuAlerts(
        p.vitals,
        p.prePostDuctal,
        p.ventilation,
        p.nutrition,
        p.gestationalAgeWeeks
      )
    }));
  }

  /**
   * Simulate stochastic vital signs, SpO2 & HFOV oscillation drift
   */
  public static simulateNicuTelemetryTick(patients: NicuPatient[]): NicuPatient[] {
    return patients.map((patient) => {
      // Simulate micro-fluctuations in heart rate (+- 2 bpm) and SpO2
      const hrDelta = Math.floor((Math.random() - 0.5) * 4);
      const newHr = Math.max(90, Math.min(200, patient.vitals.heartRateBpm + hrDelta));
      const preSpO2Delta = Math.floor((Math.random() - 0.5) * 2);
      const newPreSpO2 = Math.max(82, Math.min(100, patient.prePostDuctal.preDuctalRightWristSpO2 + preSpO2Delta));
      const newPostSpO2 = Math.max(75, Math.min(newPreSpO2, patient.prePostDuctal.postDuctalFootSpO2 + Math.floor((Math.random() - 0.5) * 2)));

      const deltaSpO2 = newPreSpO2 - newPostSpO2;
      const ftoe = NicuTelemetryService.calculateFtoe(newPreSpO2, patient.prePostDuctal.cerebralNirsRso2Percent);

      const hrHistory = [...patient.vitalsHistory.heartRate.slice(1), newHr];
      const preHistory = [...patient.vitalsHistory.preDuctalSpO2.slice(1), newPreSpO2];
      const postHistory = [...patient.vitalsHistory.postDuctalSpO2.slice(1), newPostSpO2];
      const mapHistory = [...patient.vitalsHistory.meanPressure.slice(1), patient.vitals.meanArterialPressureMmHg];

      const updatedPrePost: PrePostDuctalSpO2 = {
        ...patient.prePostDuctal,
        preDuctalRightWristSpO2: newPreSpO2,
        postDuctalFootSpO2: newPostSpO2,
        gradientDeltaSpO2: deltaSpO2,
        fractionalTissueOxygenExtraction: ftoe
      };

      const updatedVitals: NicuVitalSigns = {
        ...patient.vitals,
        heartRateBpm: newHr
      };

      const alerts = NicuTelemetryService.generateNicuAlerts(
        updatedVitals,
        updatedPrePost,
        patient.ventilation,
        patient.nutrition,
        patient.gestationalAgeWeeks
      );

      return {
        ...patient,
        vitals: updatedVitals,
        prePostDuctal: updatedPrePost,
        alerts,
        vitalsHistory: {
          heartRate: hrHistory,
          preDuctalSpO2: preHistory,
          postDuctalSpO2: postHistory,
          meanPressure: mapHistory
        }
      };
    });
  }

  /**
   * Calculate Unit / Ward Metrics
   */
  public static calculateWardMetrics(patients: NicuPatient[]): NicuWardMetrics {
    const total = patients.length;
    const elbwVlbw = patients.filter((p) => p.weightCategory === "ELBW" || p.weightCategory === "VLBW").length;
    const hfov = patients.filter((p) => p.ventilation.mode === "HFOV" || p.ventilation.mode === "HFJV").length;
    const hypothermia = patients.filter((p) => p.hypothermia === "COOLING_IN_PROGRESS").length;
    const pphn = patients.filter((p) => p.prePostDuctal.gradientDeltaSpO2 > 10).length;
    const phototherapy = patients.filter((p) => p.phototherapyActive).length;

    const totalSnappe = patients.reduce((acc, p) => acc + p.snappeScore, 0);
    const meanSnappe = total > 0 ? Math.round(totalSnappe / total) : 0;

    return {
      totalNicuCensus: total,
      elbwVlbwCount: elbwVlbw,
      hfovActiveCount: hfov,
      therapeuticHypothermiaCount: hypothermia,
      prePostDuctalGradientCount: pphn,
      phototherapyActiveCount: phototherapy,
      meanSnappeScore: meanSnappe,
      lastTelemetrySyncTimestamp: new Date().toISOString()
    };
  }

  /**
   * Export Patient NICU Record to HL7 FHIR R4 Bundle
   */
  public static exportPatientToFhirR4Nicu(patient: NicuPatient): object {
    return {
      resourceType: "Bundle",
      id: `nicu-fhir-${patient.id}-${Date.now()}`,
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: `urn:uuid:patient-${patient.id}`,
          resource: {
            resourceType: "Patient",
            id: patient.id,
            identifier: [{ system: "urn:oid:medtrack:nicu:mrn", value: patient.mrn }],
            name: [{ use: "official", text: patient.name }],
            gender: patient.sex.toLowerCase()
          }
        },
        {
          fullUrl: `urn:uuid:observation-nicu-vitals-${patient.id}`,
          resource: {
            resourceType: "Observation",
            id: `vitals-nicu-${patient.id}`,
            status: "final",
            code: { text: "NICU High-Frequency Ventilator & Pre/Post Ductal SpO2 Monitoring Profile" },
            subject: { reference: `Patient/${patient.id}` },
            extension: [
              { url: "http://hl7.org/fhir/StructureDefinition/gestational-age", valueDecimal: patient.gestationalAgeWeeks },
              { url: "http://hl7.org/fhir/StructureDefinition/pre-post-ductal-gradient", valueDecimal: patient.prePostDuctal.gradientDeltaSpO2 },
              { url: "http://hl7.org/fhir/StructureDefinition/gir-glucose-infusion-rate", valueDecimal: patient.nutrition.glucoseInfusionRateMgKgMin }
            ]
          }
        }
      ]
    };
  }

  /**
   * Export Patient NICU Telemetry to CSV
   */
  public static exportPatientNicuCsv(patient: NicuPatient): string {
    const headers = [
      "Patient ID",
      "MRN",
      "Name",
      "Gestational Age (wks)",
      "PMA (wks)",
      "Day of Life",
      "Birth Wt (g)",
      "Current Wt (g)",
      "Ventilator Mode",
      "mPaw (cmH2O)",
      "Amplitude (cmH2O)",
      "Pre-Ductal SpO2 (%)",
      "Post-Ductal SpO2 (%)",
      "Delta SpO2 (%)",
      "Cerebral NIRS (%)",
      "GIR (mg/kg/min)",
      "Total Fluids (mL/kg/d)",
      "SNAPPE-II"
    ].join(",");

    const row = [
      `"${patient.id}"`,
      `"${patient.mrn}"`,
      `"${patient.name}"`,
      patient.gestationalAgeWeeks,
      patient.postmenstrualAgeWeeks,
      patient.dayOfLife,
      patient.birthWeightGrams,
      patient.currentWeightGrams,
      `"${patient.ventilation.mode}"`,
      patient.ventilation.meanAirwayPressureCmH2O,
      patient.ventilation.amplitudeDeltaPCmH2O,
      patient.prePostDuctal.preDuctalRightWristSpO2,
      patient.prePostDuctal.postDuctalFootSpO2,
      patient.prePostDuctal.gradientDeltaSpO2,
      patient.prePostDuctal.cerebralNirsRso2Percent,
      patient.nutrition.glucoseInfusionRateMgKgMin,
      patient.nutrition.totalFluidsMlKgDay,
      patient.snappeScore
    ].join(",");

    return `${headers}
${row}`;
  }
}
