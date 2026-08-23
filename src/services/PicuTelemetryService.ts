/**
 * Pediatric Intensive Care Unit (PICU) Clinical Telemetry Engine & Decision Support Service
 * 
 * Standards Reference:
 * - PALS 2024 Pediatric Advanced Life Support Guidelines
 * - PALICC-2 Pediatric Acute Lung Injury Consensus Conference
 * - Pediatric Surviving Sepsis Campaign International Guidelines
 * - KDIGO Clinical Practice Guideline for Acute Kidney Injury (Pediatric Criteria)
 * - Holliday-Segar 4-2-1 Pediatric Fluid Resuscitation
 * - HL7 FHIR R4 Clinical Data Interchange Standard
 */

import {
  PediatricAgeBracket,
  PicuAcuityLevel,
  PicuWardPod,
  VentilatorMode,
  PediatricVitalSigns,
  VentilatorTelemetry,
  ArterialBloodGas,
  PulmonaryIndices,
  VasoactiveInotropicSupport,
  FluidAndRenalStatus,
  PediatricEarlyWarningScore,
  Pelod2Score,
  PicuAlert,
  EmergencyProtocolType,
  EmergencyEscalationRecord,
  PicuPatient,
  PicuWardOverviewMetrics,
  PediatricDrugDosingGuideline
} from "../types/picuTelemetry";

export class PicuTelemetryService {
  /**
   * Determine Pediatric Age Bracket
   */
  public static calculateAgeBracket(ageYears: number, ageMonths: number): PediatricAgeBracket {
    if (ageYears === 0 && ageMonths <= 1) return "NEONATE";
    if (ageYears === 0 && ageMonths > 1) return "INFANT";
    if (ageYears >= 1 && ageYears <= 3) return "TODDLER";
    if (ageYears >= 4 && ageYears <= 5) return "PRE_SCHOOL";
    if (ageYears >= 6 && ageYears <= 12) return "SCHOOL_AGE";
    return "ADOLESCENT";
  }

  /**
   * Mean Arterial Pressure (MAP)
   * Formula: MAP = (SBP + 2 * DBP) / 3
   */
  public static calculateMap(systolicBp: number, diastolicBp: number): number {
    return Math.round(((systolicBp + 2 * diastolicBp) / 3) * 10) / 10;
  }

  /**
   * Oxygenation Index (OI) & PALICC-2 PARDS Classification
   * Formula: OI = (FiO2 * Mean Airway Pressure * 100) / PaO2
   * Standard: PALICC-2 PARDS Definition
   */
  public static calculatePulmonaryIndices(
    fiO2: number,
    meanAirwayPressure: number,
    paO2: number,
    spO2: number,
    paCO2: number = 40,
    atmosphericPressure: number = 760,
    waterVaporPressure: number = 47,
    respiratoryQuotient: number = 0.8
  ): PulmonaryIndices {
    const validPaO2 = paO2 > 0 ? paO2 : 80;
    const validSpO2 = spO2 > 0 ? spO2 : 98;

    const oi = Math.round(((fiO2 * meanAirwayPressure * 100) / validPaO2) * 10) / 10;
    const osi = Math.round(((fiO2 * meanAirwayPressure * 100) / validSpO2) * 10) / 10;
    const pfRatio = Math.round(validPaO2 / (fiO2 > 0 ? fiO2 : 0.21));

    // Alveolar Gas Equation: PAO2 = (FiO2 * (Patm - PH2O)) - (PaCO2 / R)
    const pAO2 = fiO2 * (atmosphericPressure - waterVaporPressure) - (paCO2 / respiratoryQuotient);
    const aaGradient = Math.max(0, Math.round((pAO2 - validPaO2) * 10) / 10);

    let pardsClassification: PulmonaryIndices["pardsClassification"] = "NONE";
    if (oi >= 35) {
      pardsClassification = "ECMO_CRITERIA";
    } else if (oi >= 16) {
      pardsClassification = "SEVERE_PARDS";
    } else if (oi >= 8) {
      pardsClassification = "MODERATE_PARDS";
    } else if (oi >= 4) {
      pardsClassification = "MILD_PARDS";
    }

    return {
      oxygenationIndex: oi,
      oxygenSaturationIndex: osi,
      pardsClassification,
      alveolarArterialGradient: aaGradient,
      paO2FiO2Ratio: pfRatio
    };
  }

  /**
   * Dynamic Lung Compliance
   * Formula: Cdyn = Tidal Volume / (PIP - PEEP)
   */
  public static calculateDynamicCompliance(
    tidalVolume: number,
    pip: number,
    peep: number
  ): number {
    const deltaP = pip - peep;
    if (deltaP <= 0) return 0;
    return Math.round((tidalVolume / deltaP) * 10) / 10;
  }

  /**
   * Vasoactive Inotropic Score (VIS)
   * Formula: Dopamine + Dobutamine + (100 * Epinephrine) + (100 * Norepinephrine) + (10 * Milrinone) + (10000 * Vasopressin)
   */
  public static calculateVis(
    support: Omit<VasoactiveInotropicSupport, "vasoactiveInotropicScore" | "shockIndexPediatric" | "sipaElevated">,
    vitals: { heartRate: number; systolicBp: number; ageBracket: PediatricAgeBracket }
  ): VasoactiveInotropicSupport {
    const vis = Math.round(
      (support.dopamineMcgKgMin +
        support.dobutamineMcgKgMin +
        100 * support.epinephrineMcgKgMin +
        100 * support.norepinephrineMcgKgMin +
        10 * support.milrinoneMcgKgMin +
        10000 * support.vasopressinUnitsKgMin) * 100
    ) / 100;

    const sipa = vitals.systolicBp > 0 ? Math.round((vitals.heartRate / vitals.systolicBp) * 100) / 100 : 0;
    let sipaElevated = false;

    // Age-adjusted SIPA cutoffs
    if (vitals.ageBracket === "NEONATE" || vitals.ageBracket === "INFANT") {
      sipaElevated = sipa > 1.3;
    } else if (vitals.ageBracket === "TODDLER" || vitals.ageBracket === "PRE_SCHOOL") {
      sipaElevated = sipa > 1.2;
    } else if (vitals.ageBracket === "SCHOOL_AGE") {
      sipaElevated = sipa > 1.0;
    } else {
      sipaElevated = sipa > 0.9;
    }

    return {
      ...support,
      vasoactiveInotropicScore: vis,
      shockIndexPediatric: sipa,
      sipaElevated
    };
  }

  /**
   * Holliday-Segar 4-2-1 Pediatric Maintenance Fluid Rate
   * Formula:
   * First 10 kg: 100 mL/kg/day (4 mL/kg/hr)
   * Next 10 kg (11-20kg): 50 mL/kg/day (+2 mL/kg/hr)
   * Each kg > 20 kg: 20 mL/kg/day (+1 mL/kg/hr)
   */
  public static calculateHollidaySegarRate(weightKg: number): number {
    if (weightKg <= 0) return 0;
    if (weightKg <= 10) {
      return Math.round(weightKg * 4);
    } else if (weightKg <= 20) {
      return Math.round(40 + (weightKg - 10) * 2);
    } else {
      return Math.round(60 + (weightKg - 20) * 1);
    }
  }

  /**
   * Percentage Fluid Overload (%FO)
   * Formula: %FO = [(Cumulative Fluid Intake (L) - Cumulative Fluid Output (L)) / Admission Weight (kg)] * 100
   */
  public static calculateFluidOverload(
    cumulativeIntakeMl: number,
    cumulativeOutputMl: number,
    admissionWeightKg: number
  ): number {
    if (admissionWeightKg <= 0) return 0;
    const netBalanceMl = cumulativeIntakeMl - cumulativeOutputMl;
    const percentFo = (netBalanceMl / (admissionWeightKg * 1000)) * 100;
    return Math.round(percentFo * 10) / 10;
  }

  /**
   * Pediatric KDIGO Acute Kidney Injury (AKI) Staging
   */
  public static evaluatePediatricKdigo(
    currentCreatinine: number,
    baselineCreatinine: number,
    urineOutputMlKgHr: number,
    onCrrt: boolean = false
  ): FluidAndRenalStatus["pediatricKdigoAkiStage"] {
    if (onCrrt) return "CRRT_ACTIVE";
    if (baselineCreatinine <= 0) return "NONE";

    const ratio = currentCreatinine / baselineCreatinine;
    const delta = currentCreatinine - baselineCreatinine;

    // Stage 3: Creatinine >= 3.0x baseline OR increase to >= 4.0 mg/dL OR anuria >= 12h
    if (ratio >= 3.0 || currentCreatinine >= 4.0 || urineOutputMlKgHr < 0.3) {
      return "STAGE_3";
    }
    // Stage 2: Creatinine 2.0 - 2.9x baseline OR urine output < 0.5 mL/kg/hr for 12h
    if (ratio >= 2.0 || urineOutputMlKgHr < 0.5) {
      return "STAGE_2";
    }
    // Stage 1: Creatinine 1.5 - 1.9x baseline OR increase >= 0.3 mg/dL OR urine output < 0.5 for 6h
    if (ratio >= 1.5 || delta >= 0.3 || urineOutputMlKgHr < 0.8) {
      return "STAGE_1";
    }

    return "NONE";
  }

  /**
   * Pediatric Early Warning Score (PEWS)
   * Domain Scores: Behavior (0-3), Cardiovascular (0-3), Respiratory (0-3) + Extra (+2)
   */
  public static calculatePews(
    behaviorScore: number,
    cardiovascularScore: number,
    respiratoryScore: number,
    additionalPoints: number = 0
  ): PediatricEarlyWarningScore {
    const totalPews = Math.min(12, behaviorScore + cardiovascularScore + respiratoryScore + additionalPoints);
    let pewsRiskLevel: PediatricEarlyWarningScore["pewsRiskLevel"] = "LOW";

    if (totalPews >= 7) {
      pewsRiskLevel = "CRITICAL_DETERIORATION";
    } else if (totalPews >= 5) {
      pewsRiskLevel = "HIGH";
    } else if (totalPews >= 3) {
      pewsRiskLevel = "MEDIUM";
    }

    return {
      behaviorScore,
      cardiovascularScore,
      respiratoryScore,
      additionalPoints,
      totalPews,
      pewsRiskLevel
    };
  }

  /**
   * PELOD-2 (Pediatric Logistic Organ Dysfunction-2) Calculator
   */
  public static calculatePelod2(
    neurologicScore: number,
    cardiovascularScore: number,
    renalScore: number,
    respiratoryScore: number,
    hematologicScore: number
  ): Pelod2Score {
    const totalPelod2 = neurologicScore + cardiovascularScore + renalScore + respiratoryScore + hematologicScore;
    const logit = -6.61 + 0.47 * totalPelod2;
    const predictedMortalityPercent = Math.round((1 / (1 + Math.exp(-logit))) * 1000) / 10;

    return {
      neurologicScore,
      cardiovascularScore,
      renalScore,
      respiratoryScore,
      hematologicScore,
      totalPelod2,
      predictedMortalityPercent
    };
  }

  /**
   * Generate Rule-Based Clinical Safety Alerts
   */
  public static generateClinicalAlerts(patient: PicuPatient): PicuAlert[] {
    const alerts: PicuAlert[] = [];
    const now = new Date().toISOString();

    // 1. Oxygenation Index & Severe PARDS Alert
    if (patient.pulmonaryIndices.oxygenationIndex >= 16) {
      alerts.push({
        id: `alert_oi_${patient.id}_${Date.now()}`,
        patientId: patient.id,
        timestamp: now,
        severity: patient.pulmonaryIndices.oxygenationIndex >= 35 ? "CRITICAL" : "HIGH",
        category: "VENTILATION",
        title: patient.pulmonaryIndices.oxygenationIndex >= 35 ? "Critical PARDS: ECMO Criteria Met" : "Severe PARDS Detected",
        triggerMeasurement: `OI = ${patient.pulmonaryIndices.oxygenationIndex} (FiO2: ${Math.round(patient.ventilator.fiO2 * 100)}%, Paw: ${patient.ventilator.meanAirwayPressure} cmH2O, PaO2: ${patient.abg.paO2} mmHg)`,
        expectedReferenceRange: "Normal OI < 4.0; Moderate PARDS 8.0 - 15.9",
        clinicalRationale: "Severe impairment in alveolar-capillary oxygen diffusion. High risk of hypoxic end-organ injury.",
        guidelineReference: "PALICC-2 2023 Pediatric ARDS Consensus Recommendations",
        suggestedAction: patient.pulmonaryIndices.oxygenationIndex >= 35
          ? "Immediate Pediatric ECMO Team Consult & Cannulation Readiness Evaluation"
          : "Consider Prone Positioning (16 hrs/day), Neuromuscular Blockade, and HFOV Transition",
        acknowledged: false
      });
    }

    // 2. High Vasoactive Inotropic Score (VIS)
    if (patient.vasoactiveSupport.vasoactiveInotropicScore >= 15) {
      alerts.push({
        id: `alert_vis_${patient.id}_${Date.now()}`,
        patientId: patient.id,
        timestamp: now,
        severity: patient.vasoactiveSupport.vasoactiveInotropicScore >= 30 ? "CRITICAL" : "HIGH",
        category: "HEMODYNAMIC",
        title: "High Vasoactive Inotropic Support Requirement",
        triggerMeasurement: `VIS = ${patient.vasoactiveSupport.vasoactiveInotropicScore} (Epi: ${patient.vasoactiveSupport.epinephrineMcgKgMin} mcg/kg/min, Norepi: ${patient.vasoactiveSupport.norepinephrineMcgKgMin} mcg/kg/min)`,
        expectedReferenceRange: "Target VIS < 10.0 for stable weaning",
        clinicalRationale: "Profound myocardial dysfunction or vasoplegia requiring high-dose multiple inotrope infusions.",
        guidelineReference: "Pediatric Surviving Sepsis & PALS Hemodynamic Support Guidelines",
        suggestedAction: "Evaluate bedside echocardiogram for ventricular filling and cardiac contractility; consider hydrocortisone for refractory vasoplegia.",
        acknowledged: false
      });
    }

    // 3. Fluid Overload Alert
    if (patient.fluidRenalStatus.percentFluidOverload >= 10.0) {
      alerts.push({
        id: `alert_fo_${patient.id}_${Date.now()}`,
        patientId: patient.id,
        timestamp: now,
        severity: patient.fluidRenalStatus.percentFluidOverload >= 15.0 ? "CRITICAL" : "WARNING",
        category: "NEPHROLOGY",
        title: "Pediatric Fluid Overload Exceeds Safe Threshold",
        triggerMeasurement: `% Fluid Overload = ${patient.fluidRenalStatus.percentFluidOverload}% (Net Balance: +${patient.fluidRenalStatus.fluidBalanceNet24h} mL)`,
        expectedReferenceRange: "%FO < 10.0% of baseline admission weight",
        clinicalRationale: "Excessive cumulative positive fluid balance is independently associated with prolonged mechanical ventilation and increased PICU morbidity.",
        guidelineReference: "Pediatric Acute Kidney Injury & Fluid Overload Consensus (KDIGO Pediatric)",
        suggestedAction: "Initiate loop diuretic infusion or nephrology consult for early Continuous Renal Replacement Therapy (CRRT).",
        acknowledged: false
      });
    }

    // 4. Critical PEWS Deterioration
    if (patient.pews.totalPews >= 5) {
      alerts.push({
        id: `alert_pews_${patient.id}_${Date.now()}`,
        patientId: patient.id,
        timestamp: now,
        severity: patient.pews.totalPews >= 7 ? "CRITICAL" : "HIGH",
        category: "SEPSIS",
        title: "PEWS Clinical Deterioration Threshold Triggered",
        triggerMeasurement: `Total PEWS = ${patient.pews.totalPews} (Resp: ${patient.pews.respiratoryScore}, CV: ${patient.pews.cardiovascularScore}, Behavior: ${patient.pews.behaviorScore})`,
        expectedReferenceRange: "PEWS 0 - 2 (Low Risk)",
        clinicalRationale: "Multi-system physiological decompensation requiring immediate bedside medical escalation.",
        guidelineReference: "PALS Pediatric Rapid Response Protocol",
        suggestedAction: "Notify Attending Pediatric Intensivist; assemble PICU Rapid Response Team at bedside within 5 minutes.",
        acknowledged: false
      });
    }

    // 5. Elevated Lactate & Sepsis Biomarker
    if (patient.abg.lactate >= 3.0) {
      alerts.push({
        id: `alert_lac_${patient.id}_${Date.now()}`,
        patientId: patient.id,
        timestamp: now,
        severity: patient.abg.lactate >= 5.0 ? "CRITICAL" : "WARNING",
        category: "SEPSIS",
        title: "Elevated Arterial Lactate / Tissue Hypoperfusion",
        triggerMeasurement: `Arterial Lactate = ${patient.abg.lactate} mmol/L (Base Excess: ${patient.abg.baseExcess} mEq/L)`,
        expectedReferenceRange: "Arterial Lactate < 2.0 mmol/L",
        clinicalRationale: "Anaerobic metabolism secondary to microvascular hypoperfusion or cellular metabolic failure.",
        guidelineReference: "Surviving Sepsis Campaign: Pediatric 1-Hour Bundle",
        suggestedAction: "Verify arterial catheter waveform, check central venous oxygen saturation (ScvO2 target >70%), assess fluid responsiveness.",
        acknowledged: false
      });
    }

    return alerts;
  }

  /**
   * Pediatric Resuscitation Drug Dosing Guidelines & Limits
   */
  public static getPediatricDrugDosingGuidelines(weightKg: number): Array<PediatricDrugDosingGuideline & { calculatedPatientDose: string }> {
    const drugs: PediatricDrugDosingGuideline[] = [
      {
        drugName: "Epinephrine (PALS Arrest / Bradycardia)",
        indication: "Cardiac Arrest / Severe Symptomatic Bradycardia",
        standardDoseUnit: "mg/kg IV/IO (1:10,000 concentration)",
        defaultMgKg: 0.01,
        maxSingleDoseMg: 1.0,
        highAlertWarning: "PALS 1st line resuscitation. Repeat every 3-5 minutes."
      },
      {
        drugName: "Atropine Sulfate",
        indication: "Vagally-mediated Bradycardia / Organophosphate",
        standardDoseUnit: "mg/kg IV/IO",
        defaultMgKg: 0.02,
        maxSingleDoseMg: 0.5,
        highAlertWarning: "Minimum dose 0.1 mg to prevent paradoxical bradycardia."
      },
      {
        drugName: "Milrinone (Inotrope / Lusitrope)",
        indication: "Low Cardiac Output Syndrome / Post-Op Cardiac",
        standardDoseUnit: "mcg/kg/min continuous infusion",
        defaultMgKg: 0,
        infusionRateUnit: "mcg/kg/min",
        defaultMcgKgMin: 0.5,
        highAlertWarning: "Titrate 0.25 - 0.75 mcg/kg/min. Monitor for systemic hypotension."
      },
      {
        drugName: "Norepinephrine (Vasopressor)",
        indication: "Septic Shock / Refractory Vasoplegia",
        standardDoseUnit: "mcg/kg/min continuous infusion",
        defaultMgKg: 0,
        infusionRateUnit: "mcg/kg/min",
        defaultMcgKgMin: 0.1,
        highAlertWarning: "Centrally administered preferred. Titrate to age-adjusted MAP."
      },
      {
        drugName: "Fentanyl (Analgesia / Sedation)",
        indication: "Analgesia for mechanically ventilated patients",
        standardDoseUnit: "mcg/kg IV slow push",
        defaultMgKg: 0.001,
        maxSingleDoseMg: 0.1,
        highAlertWarning: "Rapid push can induce chest wall rigidity."
      },
      {
        drugName: "Midazolam (Anxiolysis / Sedation)",
        indication: "Sedation for invasive procedures / ventilator synchrony",
        standardDoseUnit: "mg/kg IV",
        defaultMgKg: 0.1,
        maxSingleDoseMg: 5.0,
        highAlertWarning: "Watch for respiratory depression and synergistic hypotensive effect."
      },
      {
        drugName: "Rocuronium (Neuromuscular Blockade)",
        indication: "Rapid Sequence Intubation / Ventilator Asynchrony",
        standardDoseUnit: "mg/kg IV",
        defaultMgKg: 1.0,
        maxSingleDoseMg: 100,
        highAlertWarning: "Paralytic only. Must ensure continuous deep sedation beforehand."
      },
      {
        drugName: "Defibrillation Energy (PALS Initial)",
        indication: "Ventricular Fibrillation / Pulseless VT",
        standardDoseUnit: "Joules/kg",
        defaultMgKg: 2,
        maxSingleDoseMg: 200,
        highAlertWarning: "Subsequent shocks 4 J/kg (Max 10 J/kg or adult max 200 J)."
      }
    ];

    return drugs.map((drug) => {
      if (drug.infusionRateUnit) {
        return {
          ...drug,
          calculatedPatientDose: `${drug.defaultMcgKgMin} mcg/kg/min (${Math.round((drug.defaultMcgKgMin || 0) * weightKg * 60) / 100} mg/hr)`
        };
      }
      if (drug.standardDoseUnit.includes("Joules")) {
        const joules = Math.min(drug.maxSingleDoseMg || 200, Math.round(drug.defaultMgKg * weightKg));
        return {
          ...drug,
          calculatedPatientDose: `${joules} Joules (${drug.defaultMgKg} J/kg)`
        };
      }
      const rawDose = drug.defaultMgKg * weightKg;
      const finalDose = drug.maxSingleDoseMg ? Math.min(drug.maxSingleDoseMg, rawDose) : rawDose;
      const formatted = drug.defaultMgKg < 0.01 ? `${Math.round(finalDose * 1000)} mcg` : `${Math.round(finalDose * 100) / 100} mg`;
      return {
        ...drug,
        calculatedPatientDose: `${formatted} (${drug.defaultMgKg} mg/kg)`
      };
    });
  }

  /**
   * Mock PICU Patient Repository
   */
  public static getMockPicuPatients(): PicuPatient[] {
    const patients: PicuPatient[] = [
      {
        id: "PICU-PT-101",
        mrn: "MRN-8849201",
        name: "Maya Sharma",
        ageYears: 3,
        ageMonths: 8,
        ageBracket: "TODDLER",
        gender: "FEMALE",
        weightKg: 14.5,
        admissionWeightKg: 13.8,
        heightCm: 96,
        bedNumber: "Bed 01 - Pod A (High-Frequency)",
        wardPod: "HIGH_FREQUENCY_VENT_POD",
        primaryDiagnosis: "Severe Pediatric ARDS (RSV Bronchiolitis Pneumonia)",
        secondaryDiagnoses: ["Acute Respiratory Failure", "Secondary Sepsis"],
        admissionDate: "2026-08-21T04:30:00Z",
        acuityLevel: "CRITICAL_INSTABILITY",
        codeStatus: "FULL_CODE_PALS",
        attendingPhysician: "Dr. Arvind Varma, MD (PICU)",
        primaryNurse: "Staff Nurse Priya K., RN",
        vitals: {
          heartRate: 148,
          systolicBp: 84,
          diastolicBp: 46,
          meanArterialPressure: 58.7,
          respiratoryRate: 42,
          spO2: 89,
          coreTemperature: 38.6,
          etCO2: 52,
          centralVenousPressure: 11,
          capillaryRefillSeconds: 3.5,
          glasgowComaScale: 11
        },
        ventilator: {
          mode: "HFOV",
          fiO2: 0.85,
          peakInspiratoryPressure: 32,
          peep: 14,
          meanAirwayPressure: 22,
          tidalVolumeDelivered: 95,
          tidalVolumePerKg: 6.5,
          minuteVentilation: 4.8,
          respiratoryRateSet: 30,
          respiratoryRateTotal: 42,
          inspiratoryTime: 0.7,
          ieRatio: "1:2.0",
          dynamicCompliance: 5.3,
          hfovFrequencyHz: 8,
          hfovDeltaPressure: 44,
          hfovBiasFlowLpm: 20
        },
        abg: {
          timestamp: "2026-08-23T14:45:00Z",
          ph: 7.24,
          paCO2: 58,
          paO2: 58,
          hco3: 24.2,
          baseExcess: -3.5,
          lactate: 3.8,
          anionGap: 14
        },
        pulmonaryIndices: {
          oxygenationIndex: 32.2,
          oxygenSaturationIndex: 21.0,
          pardsClassification: "SEVERE_PARDS",
          alveolarArterialGradient: 482,
          paO2FiO2Ratio: 68
        },
        vasoactiveSupport: {
          dopamineMcgKgMin: 0,
          dobutamineMcgKgMin: 0,
          epinephrineMcgKgMin: 0.12,
          norepinephrineMcgKgMin: 0.08,
          milrinoneMcgKgMin: 0.35,
          vasopressinUnitsKgMin: 0,
          vasoactiveInotropicScore: 23.5,
          cardiacIndexLMinM2: 2.8,
          shockIndexPediatric: 1.76,
          sipaElevated: true
        },
        fluidRenalStatus: {
          weightKg: 14.5,
          admissionWeightKg: 13.8,
          hourlyUrineOutputMl: 8,
          urineOutputMlKgHr: 0.55,
          cumulativeIntakeMl24h: 1850,
          cumulativeOutputMl24h: 1150,
          fluidBalanceNet24h: 700,
          percentFluidOverload: 5.1,
          hollidaySegarMaintenanceRateMlHr: 49,
          serumCreatinineMgDl: 0.72,
          baselineCreatinineMgDl: 0.35,
          pediatricKdigoAkiStage: "STAGE_2"
        },
        pews: {
          behaviorScore: 2,
          cardiovascularScore: 2,
          respiratoryScore: 3,
          additionalPoints: 2,
          totalPews: 9,
          pewsRiskLevel: "CRITICAL_DETERIORATION"
        },
        pelod2: {
          neurologicScore: 1,
          cardiovascularScore: 3,
          renalScore: 1,
          respiratoryScore: 4,
          hematologicScore: 1,
          totalPelod2: 10,
          predictedMortalityPercent: 12.8
        },
        activeAlerts: [],
        telemetrySparklines: {
          heartRateHistory: [142, 144, 146, 145, 149, 152, 150, 148, 147, 148, 149, 151, 148, 146, 148, 150, 153, 149, 148, 147, 148, 149, 150, 148, 147, 149, 150, 148, 147, 148],
          meanArterialPressureHistory: [55, 56, 54, 57, 58, 60, 59, 58, 57, 59, 58, 57, 56, 58, 59, 60, 58, 57, 58, 59, 58, 57, 59, 58, 59, 58, 57, 58, 59, 58],
          spO2History: [92, 91, 90, 89, 88, 90, 89, 91, 90, 89, 88, 89, 90, 89, 88, 87, 89, 90, 89, 88, 89, 90, 89, 88, 89, 90, 89, 88, 89, 89],
          respRateHistory: [38, 40, 41, 42, 44, 42, 40, 42, 43, 41, 42, 43, 44, 42, 41, 42, 43, 42, 40, 41, 42, 43, 42, 41, 42, 43, 42, 41, 42, 42],
          etCO2History: [48, 49, 50, 52, 53, 52, 51, 52, 53, 52, 51, 52, 53, 52, 51, 52, 53, 52, 51, 52, 53, 52, 51, 52, 53, 52, 51, 52, 53, 52]
        },
        emergencyProtocols: [
          {
            id: "PROTO-PARDS-001",
            patientId: "PICU-PT-101",
            protocol: "PARDS_PRONING_ECMO_ACTIVATION",
            initiatedAt: "2026-08-23T12:00:00Z",
            initiatedBy: "Dr. Arvind Varma, MD",
            status: "BEDSIDE_ACTIVE",
            targetResponseMinutes: 15,
            assignedTeamMembers: ["Pediatric ECMO Lead", "PICU Fellow", "Respiratory Specialist", "Charge RN"],
            clinicalNotes: "Patient in prone cycle 14/16 hrs. HFOV amplitude 44, OI 32.2. ECMO cannulation circuit primed on standby."
          }
        ]
      },
      {
        id: "PICU-PT-102",
        mrn: "MRN-9102432",
        name: "Aarav Patel",
        ageYears: 0,
        ageMonths: 4,
        ageBracket: "INFANT",
        gender: "MALE",
        weightKg: 5.2,
        admissionWeightKg: 4.8,
        heightCm: 59,
        bedNumber: "Bed 02 - Cardiac PICU",
        wardPod: "CARDIAC_PICU",
        primaryDiagnosis: "Post-Op Norwood Procedure (Hypoplastic Left Heart Syndrome)",
        secondaryDiagnoses: ["Low Cardiac Output Syndrome", "Chylothorax", "Prone to Vasoplegia"],
        admissionDate: "2026-08-22T18:00:00Z",
        acuityLevel: "HIGH_ACUITY",
        codeStatus: "FULL_CODE_PALS",
        attendingPhysician: "Dr. Meenakshi Sundaram, MD (Pediatric Cardiac)",
        primaryNurse: "Staff Nurse Rahul V., RN",
        vitals: {
          heartRate: 162,
          systolicBp: 72,
          diastolicBp: 38,
          meanArterialPressure: 49.3,
          respiratoryRate: 36,
          spO2: 82,
          coreTemperature: 36.9,
          etCO2: 38,
          centralVenousPressure: 14,
          capillaryRefillSeconds: 3.0,
          glasgowComaScale: 10
        },
        ventilator: {
          mode: "PRVC",
          fiO2: 0.35,
          peakInspiratoryPressure: 22,
          peep: 6,
          meanAirwayPressure: 11,
          tidalVolumeDelivered: 36,
          tidalVolumePerKg: 6.9,
          minuteVentilation: 1.3,
          respiratoryRateSet: 36,
          respiratoryRateTotal: 36,
          inspiratoryTime: 0.5,
          ieRatio: "1:2.3",
          dynamicCompliance: 2.25
        },
        abg: {
          timestamp: "2026-08-23T15:10:00Z",
          ph: 7.32,
          paCO2: 42,
          paO2: 46,
          hco3: 21.5,
          baseExcess: -3.8,
          lactate: 4.2,
          anionGap: 13
        },
        pulmonaryIndices: {
          oxygenationIndex: 8.4,
          oxygenSaturationIndex: 4.7,
          pardsClassification: "MILD_PARDS",
          alveolarArterialGradient: 145,
          paO2FiO2Ratio: 131
        },
        vasoactiveSupport: {
          dopamineMcgKgMin: 5.0,
          dobutamineMcgKgMin: 0,
          epinephrineMcgKgMin: 0.05,
          norepinephrineMcgKgMin: 0,
          milrinoneMcgKgMin: 0.5,
          vasopressinUnitsKgMin: 0.0003,
          vasoactiveInotropicScore: 18.0,
          cardiacIndexLMinM2: 2.1,
          shockIndexPediatric: 2.25,
          sipaElevated: true
        },
        fluidRenalStatus: {
          weightKg: 5.2,
          admissionWeightKg: 4.8,
          hourlyUrineOutputMl: 4.5,
          urineOutputMlKgHr: 0.86,
          cumulativeIntakeMl24h: 460,
          cumulativeOutputMl24h: 380,
          fluidBalanceNet24h: 80,
          percentFluidOverload: 1.7,
          hollidaySegarMaintenanceRateMlHr: 21,
          serumCreatinineMgDl: 0.45,
          baselineCreatinineMgDl: 0.3,
          pediatricKdigoAkiStage: "STAGE_1"
        },
        pews: {
          behaviorScore: 2,
          cardiovascularScore: 2,
          respiratoryScore: 1,
          additionalPoints: 0,
          totalPews: 5,
          pewsRiskLevel: "HIGH"
        },
        pelod2: {
          neurologicScore: 1,
          cardiovascularScore: 3,
          renalScore: 1,
          respiratoryScore: 1,
          hematologicScore: 0,
          totalPelod2: 6,
          predictedMortalityPercent: 4.8
        },
        activeAlerts: [],
        telemetrySparklines: {
          heartRateHistory: [158, 160, 162, 164, 161, 159, 163, 162, 165, 164, 162, 160, 161, 163, 162, 164, 161, 160, 162, 163, 162, 161, 160, 162, 163, 164, 162, 161, 162, 162],
          meanArterialPressureHistory: [48, 49, 50, 48, 47, 49, 50, 51, 49, 48, 50, 49, 51, 50, 49, 48, 50, 49, 48, 50, 49, 50, 51, 49, 48, 50, 49, 48, 49, 49],
          spO2History: [83, 84, 82, 81, 83, 82, 84, 83, 82, 81, 83, 82, 84, 83, 82, 81, 83, 82, 84, 83, 82, 81, 83, 82, 84, 83, 82, 81, 82, 82],
          respRateHistory: [34, 35, 36, 35, 36, 37, 36, 35, 36, 35, 36, 37, 36, 35, 36, 35, 36, 37, 36, 35, 36, 35, 36, 37, 36, 35, 36, 35, 36, 36],
          etCO2History: [36, 37, 38, 37, 38, 39, 38, 37, 38, 37, 38, 39, 38, 37, 38, 37, 38, 39, 38, 37, 38, 37, 38, 39, 38, 37, 38, 37, 38, 38]
        },
        emergencyProtocols: []
      },
      {
        id: "PICU-PT-103",
        mrn: "MRN-7730192",
        name: "Rohan Deshmukh",
        ageYears: 9,
        ageMonths: 2,
        ageBracket: "SCHOOL_AGE",
        gender: "MALE",
        weightKg: 32.0,
        admissionWeightKg: 28.5,
        heightCm: 134,
        bedNumber: "Bed 03 - Pod B (General PICU)",
        wardPod: "GENERAL_PICU",
        primaryDiagnosis: "Urosepsis with Refractory Septic Shock & Multi-Organ Failure",
        secondaryDiagnoses: ["Acute Kidney Injury KDIGO Stage 3", "Severe Fluid Overload", "DIC"],
        admissionDate: "2026-08-20T11:20:00Z",
        acuityLevel: "CRITICAL_INSTABILITY",
        codeStatus: "FULL_CODE_PALS",
        attendingPhysician: "Dr. Rajesh Kulkarni, MD",
        primaryNurse: "Staff Nurse Anjali S., RN",
        vitals: {
          heartRate: 154,
          systolicBp: 78,
          diastolicBp: 36,
          meanArterialPressure: 50.0,
          respiratoryRate: 32,
          spO2: 93,
          coreTemperature: 39.4,
          etCO2: 32,
          centralVenousPressure: 16,
          capillaryRefillSeconds: 4.5,
          glasgowComaScale: 9
        },
        ventilator: {
          mode: "SIMV_PC",
          fiO2: 0.65,
          peakInspiratoryPressure: 28,
          peep: 10,
          meanAirwayPressure: 16,
          tidalVolumeDelivered: 220,
          tidalVolumePerKg: 6.8,
          minuteVentilation: 7.0,
          respiratoryRateSet: 26,
          respiratoryRateTotal: 32,
          inspiratoryTime: 0.85,
          ieRatio: "1:1.8",
          dynamicCompliance: 12.2
        },
        abg: {
          timestamp: "2026-08-23T15:20:00Z",
          ph: 7.18,
          paCO2: 32,
          paO2: 74,
          hco3: 12.0,
          baseExcess: -14.2,
          lactate: 5.6,
          anionGap: 21
        },
        pulmonaryIndices: {
          oxygenationIndex: 14.1,
          oxygenSaturationIndex: 11.2,
          pardsClassification: "MODERATE_PARDS",
          alveolarArterialGradient: 342,
          paO2FiO2Ratio: 114
        },
        vasoactiveSupport: {
          dopamineMcgKgMin: 0,
          dobutamineMcgKgMin: 0,
          epinephrineMcgKgMin: 0.18,
          norepinephrineMcgKgMin: 0.22,
          milrinoneMcgKgMin: 0,
          vasopressinUnitsKgMin: 0.0005,
          vasoactiveInotropicScore: 45.0,
          cardiacIndexLMinM2: 2.2,
          shockIndexPediatric: 1.97,
          sipaElevated: true
        },
        fluidRenalStatus: {
          weightKg: 32.0,
          admissionWeightKg: 28.5,
          hourlyUrineOutputMl: 6,
          urineOutputMlKgHr: 0.19,
          cumulativeIntakeMl24h: 4200,
          cumulativeOutputMl24h: 700,
          fluidBalanceNet24h: 3500,
          percentFluidOverload: 12.3,
          hollidaySegarMaintenanceRateMlHr: 72,
          serumCreatinineMgDl: 2.85,
          baselineCreatinineMgDl: 0.55,
          pediatricKdigoAkiStage: "STAGE_3"
        },
        pews: {
          behaviorScore: 3,
          cardiovascularScore: 3,
          respiratoryScore: 2,
          additionalPoints: 0,
          totalPews: 8,
          pewsRiskLevel: "CRITICAL_DETERIORATION"
        },
        pelod2: {
          neurologicScore: 3,
          cardiovascularScore: 4,
          renalScore: 4,
          respiratoryScore: 3,
          hematologicScore: 2,
          totalPelod2: 16,
          predictedMortalityPercent: 34.6
        },
        activeAlerts: [],
        telemetrySparklines: {
          heartRateHistory: [148, 150, 152, 155, 153, 156, 154, 158, 157, 155, 153, 156, 155, 154, 157, 156, 155, 154, 156, 155, 153, 155, 154, 156, 155, 154, 153, 155, 154, 154],
          meanArterialPressureHistory: [46, 47, 49, 48, 50, 52, 51, 49, 50, 51, 48, 50, 51, 49, 50, 52, 51, 50, 49, 50, 51, 49, 50, 52, 51, 50, 49, 50, 51, 50],
          spO2History: [94, 93, 92, 94, 93, 92, 91, 93, 94, 93, 92, 94, 93, 92, 93, 94, 93, 92, 94, 93, 92, 94, 93, 92, 93, 94, 93, 92, 94, 93],
          respRateHistory: [30, 31, 32, 33, 32, 31, 32, 33, 32, 31, 32, 33, 32, 31, 32, 33, 32, 31, 32, 33, 32, 31, 32, 33, 32, 31, 32, 33, 32, 32],
          etCO2History: [30, 31, 32, 33, 32, 31, 32, 33, 32, 31, 32, 33, 32, 31, 32, 33, 32, 31, 32, 33, 32, 31, 32, 33, 32, 31, 32, 33, 32, 32]
        },
        emergencyProtocols: [
          {
            id: "PROTO-CRRT-002",
            patientId: "PICU-PT-103",
            protocol: "CRRT_EMERGENCY_INITIATION",
            initiatedAt: "2026-08-23T14:15:00Z",
            initiatedBy: "Dr. Rajesh Kulkarni, MD",
            status: "TEAM_DISPATCHED",
            targetResponseMinutes: 30,
            assignedTeamMembers: ["Pediatric Nephrologist", "Dialysis RN", "PICU Registrar"],
            clinicalNotes: "Emergency Continuous Veno-Venous Hemodiafiltration (CVVHDF) catheter placed. Target fluid removal 50 mL/hr."
          }
        ]
      },
      {
        id: "PICU-PT-104",
        mrn: "MRN-6649102",
        name: "Ananya Iyer",
        ageYears: 7,
        ageMonths: 6,
        ageBracket: "SCHOOL_AGE",
        gender: "FEMALE",
        weightKg: 22.0,
        admissionWeightKg: 22.0,
        heightCm: 122,
        bedNumber: "Bed 04 - Pod C (Isolation)",
        wardPod: "ISOLATION_PICU",
        primaryDiagnosis: "Status Asthmaticus with Refractory Bronchospasm & Air Trapping",
        secondaryDiagnoses: ["Type II Respiratory Failure", "Lactic Acidosis"],
        admissionDate: "2026-08-23T06:45:00Z",
        acuityLevel: "ELEVATED_RISK",
        codeStatus: "FULL_CODE_PALS",
        attendingPhysician: "Dr. Arvind Varma, MD",
        primaryNurse: "Staff Nurse Divya N., RN",
        vitals: {
          heartRate: 136,
          systolicBp: 104,
          diastolicBp: 62,
          meanArterialPressure: 76.0,
          respiratoryRate: 38,
          spO2: 95,
          coreTemperature: 37.4,
          etCO2: 48,
          centralVenousPressure: 8,
          capillaryRefillSeconds: 2.0,
          glasgowComaScale: 14
        },
        ventilator: {
          mode: "HFNC",
          fiO2: 0.40,
          peakInspiratoryPressure: 0,
          peep: 0,
          meanAirwayPressure: 6,
          tidalVolumeDelivered: 0,
          tidalVolumePerKg: 0,
          minuteVentilation: 0,
          respiratoryRateSet: 0,
          respiratoryRateTotal: 38,
          inspiratoryTime: 0,
          ieRatio: "1:3.5",
          dynamicCompliance: 0
        },
        abg: {
          timestamp: "2026-08-23T14:30:00Z",
          ph: 7.31,
          paCO2: 49,
          paO2: 82,
          hco3: 24.0,
          baseExcess: -1.2,
          lactate: 2.4,
          anionGap: 11
        },
        pulmonaryIndices: {
          oxygenationIndex: 2.9,
          oxygenSaturationIndex: 2.5,
          pardsClassification: "NONE",
          alveolarArterialGradient: 142,
          paO2FiO2Ratio: 205
        },
        vasoactiveSupport: {
          dopamineMcgKgMin: 0,
          dobutamineMcgKgMin: 0,
          epinephrineMcgKgMin: 0,
          norepinephrineMcgKgMin: 0,
          milrinoneMcgKgMin: 0,
          vasopressinUnitsKgMin: 0,
          vasoactiveInotropicScore: 0,
          shockIndexPediatric: 1.31,
          sipaElevated: true
        },
        fluidRenalStatus: {
          weightKg: 22.0,
          admissionWeightKg: 22.0,
          hourlyUrineOutputMl: 30,
          urineOutputMlKgHr: 1.36,
          cumulativeIntakeMl24h: 1200,
          cumulativeOutputMl24h: 950,
          fluidBalanceNet24h: 250,
          percentFluidOverload: 1.1,
          hollidaySegarMaintenanceRateMlHr: 62,
          serumCreatinineMgDl: 0.42,
          baselineCreatinineMgDl: 0.40,
          pediatricKdigoAkiStage: "NONE"
        },
        pews: {
          behaviorScore: 1,
          cardiovascularScore: 1,
          respiratoryScore: 3,
          additionalPoints: 2,
          totalPews: 7,
          pewsRiskLevel: "CRITICAL_DETERIORATION"
        },
        pelod2: {
          neurologicScore: 0,
          cardiovascularScore: 0,
          renalScore: 0,
          respiratoryScore: 1,
          hematologicScore: 0,
          totalPelod2: 1,
          predictedMortalityPercent: 0.8
        },
        activeAlerts: [],
        telemetrySparklines: {
          heartRateHistory: [130, 132, 134, 135, 138, 136, 134, 136, 137, 135, 136, 138, 137, 135, 136, 138, 137, 135, 136, 138, 137, 135, 136, 138, 137, 135, 136, 138, 137, 136],
          meanArterialPressureHistory: [74, 75, 76, 75, 76, 77, 76, 75, 76, 77, 76, 75, 76, 77, 76, 75, 76, 77, 76, 75, 76, 77, 76, 75, 76, 77, 76, 75, 76, 76],
          spO2History: [94, 95, 96, 95, 94, 95, 96, 95, 94, 95, 96, 95, 94, 95, 96, 95, 94, 95, 96, 95, 94, 95, 96, 95, 94, 95, 96, 95, 95, 95],
          respRateHistory: [40, 39, 38, 39, 40, 38, 37, 38, 39, 38, 37, 38, 39, 38, 37, 38, 39, 38, 37, 38, 39, 38, 37, 38, 39, 38, 37, 38, 38, 38],
          etCO2History: [46, 47, 48, 49, 48, 47, 48, 49, 48, 47, 48, 49, 48, 47, 48, 49, 48, 47, 48, 49, 48, 47, 48, 49, 48, 47, 48, 49, 48, 48]
        },
        emergencyProtocols: [
          {
            id: "PROTO-ASTHMA-003",
            patientId: "PICU-PT-104",
            protocol: "STATUS_ASTHMATICUS_ESCALATION",
            initiatedAt: "2026-08-23T08:00:00Z",
            initiatedBy: "Dr. Arvind Varma, MD",
            status: "BEDSIDE_ACTIVE",
            targetResponseMinutes: 10,
            assignedTeamMembers: ["Respiratory Therapist", "PICU Staff RN", "Pediatric Intensivist"],
            clinicalNotes: "Continuous Albuterol 15 mg/hr + IV Magnesium 50 mg/kg completed. HFNC at 30 L/min. Heliox mix on standby."
          }
        ]
      },
      {
        id: "PICU-PT-105",
        mrn: "MRN-5529108",
        name: "Kabir Sengupta",
        ageYears: 14,
        ageMonths: 1,
        ageBracket: "ADOLESCENT",
        gender: "MALE",
        weightKg: 54.0,
        admissionWeightKg: 54.0,
        heightCm: 168,
        bedNumber: "Bed 05 - Neuro PICU",
        wardPod: "NEURO_PICU",
        primaryDiagnosis: "Severe Traumatic Brain Injury (TBI) with Intracranial Hypertension",
        secondaryDiagnoses: ["Basilar Skull Fracture", "Cerebral Contusion", "SIADH Risk"],
        admissionDate: "2026-08-22T23:15:00Z",
        acuityLevel: "HIGH_ACUITY",
        codeStatus: "FULL_CODE_PALS",
        attendingPhysician: "Dr. Radhika Nair, MD (Pediatric Neurocritical Care)",
        primaryNurse: "Staff Nurse Kiran B., RN",
        vitals: {
          heartRate: 72,
          systolicBp: 132,
          diastolicBp: 78,
          meanArterialPressure: 96.0,
          respiratoryRate: 18,
          spO2: 99,
          coreTemperature: 36.4,
          etCO2: 35,
          centralVenousPressure: 8,
          intracranialPressure: 19,
          cerebralPerfusionPressure: 77.0,
          capillaryRefillSeconds: 1.5,
          glasgowComaScale: 6
        },
        ventilator: {
          mode: "PRVC",
          fiO2: 0.40,
          peakInspiratoryPressure: 20,
          peep: 5,
          meanAirwayPressure: 10,
          tidalVolumeDelivered: 380,
          tidalVolumePerKg: 7.0,
          minuteVentilation: 6.8,
          respiratoryRateSet: 18,
          respiratoryRateTotal: 18,
          inspiratoryTime: 0.9,
          ieRatio: "1:2.3",
          dynamicCompliance: 25.3
        },
        abg: {
          timestamp: "2026-08-23T15:00:00Z",
          ph: 7.42,
          paCO2: 36,
          paO2: 112,
          hco3: 23.5,
          baseExcess: 0.2,
          lactate: 1.3,
          anionGap: 10
        },
        pulmonaryIndices: {
          oxygenationIndex: 3.6,
          oxygenSaturationIndex: 4.0,
          pardsClassification: "NONE",
          alveolarArterialGradient: 122,
          paO2FiO2Ratio: 280
        },
        vasoactiveSupport: {
          dopamineMcgKgMin: 0,
          dobutamineMcgKgMin: 0,
          epinephrineMcgKgMin: 0,
          norepinephrineMcgKgMin: 0.04,
          milrinoneMcgKgMin: 0,
          vasopressinUnitsKgMin: 0,
          vasoactiveInotropicScore: 4.0,
          shockIndexPediatric: 0.55,
          sipaElevated: false
        },
        fluidRenalStatus: {
          weightKg: 54.0,
          admissionWeightKg: 54.0,
          hourlyUrineOutputMl: 70,
          urineOutputMlKgHr: 1.30,
          cumulativeIntakeMl24h: 2100,
          cumulativeOutputMl24h: 1950,
          fluidBalanceNet24h: 150,
          percentFluidOverload: 0.3,
          hollidaySegarMaintenanceRateMlHr: 94,
          serumCreatinineMgDl: 0.70,
          baselineCreatinineMgDl: 0.68,
          pediatricKdigoAkiStage: "NONE"
        },
        pews: {
          behaviorScore: 3,
          cardiovascularScore: 0,
          respiratoryScore: 0,
          additionalPoints: 0,
          totalPews: 3,
          pewsRiskLevel: "MEDIUM"
        },
        pelod2: {
          neurologicScore: 4,
          cardiovascularScore: 0,
          renalScore: 0,
          respiratoryScore: 1,
          hematologicScore: 0,
          totalPelod2: 5,
          predictedMortalityPercent: 3.2
        },
        activeAlerts: [],
        telemetrySparklines: {
          heartRateHistory: [70, 72, 71, 73, 72, 70, 71, 74, 72, 71, 73, 72, 70, 71, 74, 72, 71, 73, 72, 70, 71, 74, 72, 71, 73, 72, 70, 71, 72, 72],
          meanArterialPressureHistory: [94, 95, 96, 97, 95, 96, 98, 96, 95, 97, 96, 95, 96, 98, 96, 95, 97, 96, 95, 96, 98, 96, 95, 97, 96, 95, 96, 98, 96, 96],
          spO2History: [99, 99, 100, 99, 99, 100, 99, 99, 100, 99, 99, 100, 99, 99, 100, 99, 99, 100, 99, 99, 100, 99, 99, 100, 99, 99, 100, 99, 99, 99],
          respRateHistory: [18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18],
          etCO2History: [35, 36, 35, 36, 35, 36, 35, 36, 35, 36, 35, 36, 35, 36, 35, 36, 35, 36, 35, 36, 35, 36, 35, 36, 35, 36, 35, 36, 35, 35]
        },
        emergencyProtocols: []
      },
      {
        id: "PICU-PT-106",
        mrn: "MRN-4419823",
        name: "Diya Chatterjee",
        ageYears: 11,
        ageMonths: 4,
        ageBracket: "SCHOOL_AGE",
        gender: "FEMALE",
        weightKg: 38.0,
        admissionWeightKg: 36.5,
        heightCm: 142,
        bedNumber: "Bed 06 - Pod B (General PICU)",
        wardPod: "GENERAL_PICU",
        primaryDiagnosis: "Severe Diabetic Ketoacidosis (DKA) with Cerebral Edema Risk",
        secondaryDiagnoses: ["Electrolyte Depletion", "Prerenal Azotemia"],
        admissionDate: "2026-08-23T03:00:00Z",
        acuityLevel: "MONITORING",
        codeStatus: "FULL_CODE_PALS",
        attendingPhysician: "Dr. Rajesh Kulkarni, MD",
        primaryNurse: "Staff Nurse Priya K., RN",
        vitals: {
          heartRate: 108,
          systolicBp: 112,
          diastolicBp: 68,
          meanArterialPressure: 82.7,
          respiratoryRate: 24,
          spO2: 98,
          coreTemperature: 37.1,
          etCO2: 28,
          centralVenousPressure: 6,
          capillaryRefillSeconds: 2.0,
          glasgowComaScale: 13
        },
        ventilator: {
          mode: "ROOM_AIR",
          fiO2: 0.21,
          peakInspiratoryPressure: 0,
          peep: 0,
          meanAirwayPressure: 0,
          tidalVolumeDelivered: 0,
          tidalVolumePerKg: 0,
          minuteVentilation: 0,
          respiratoryRateSet: 0,
          respiratoryRateTotal: 24,
          inspiratoryTime: 0,
          ieRatio: "1:2.0",
          dynamicCompliance: 0
        },
        abg: {
          timestamp: "2026-08-23T14:00:00Z",
          ph: 7.26,
          paCO2: 27,
          paO2: 98,
          hco3: 13.5,
          baseExcess: -11.0,
          lactate: 1.8,
          anionGap: 19
        },
        pulmonaryIndices: {
          oxygenationIndex: 0,
          oxygenSaturationIndex: 0,
          pardsClassification: "NONE",
          alveolarArterialGradient: 32,
          paO2FiO2Ratio: 466
        },
        vasoactiveSupport: {
          dopamineMcgKgMin: 0,
          dobutamineMcgKgMin: 0,
          epinephrineMcgKgMin: 0,
          norepinephrineMcgKgMin: 0,
          milrinoneMcgKgMin: 0,
          vasopressinUnitsKgMin: 0,
          vasoactiveInotropicScore: 0,
          shockIndexPediatric: 0.96,
          sipaElevated: false
        },
        fluidRenalStatus: {
          weightKg: 38.0,
          admissionWeightKg: 36.5,
          hourlyUrineOutputMl: 65,
          urineOutputMlKgHr: 1.71,
          cumulativeIntakeMl24h: 2400,
          cumulativeOutputMl24h: 1800,
          fluidBalanceNet24h: 600,
          percentFluidOverload: 1.6,
          hollidaySegarMaintenanceRateMlHr: 78,
          serumCreatinineMgDl: 0.95,
          baselineCreatinineMgDl: 0.60,
          pediatricKdigoAkiStage: "STAGE_1"
        },
        pews: {
          behaviorScore: 1,
          cardiovascularScore: 0,
          respiratoryScore: 1,
          additionalPoints: 0,
          totalPews: 2,
          pewsRiskLevel: "LOW"
        },
        pelod2: {
          neurologicScore: 1,
          cardiovascularScore: 0,
          renalScore: 1,
          respiratoryScore: 0,
          hematologicScore: 0,
          totalPelod2: 2,
          predictedMortalityPercent: 1.2
        },
        activeAlerts: [],
        telemetrySparklines: {
          heartRateHistory: [115, 114, 112, 110, 108, 109, 107, 108, 110, 109, 108, 107, 109, 108, 107, 108, 110, 109, 108, 107, 109, 108, 107, 108, 110, 109, 108, 107, 108, 108],
          meanArterialPressureHistory: [80, 81, 82, 83, 82, 81, 83, 82, 81, 83, 82, 81, 83, 82, 81, 83, 82, 81, 83, 82, 81, 83, 82, 81, 83, 82, 81, 83, 82, 82],
          spO2History: [98, 98, 99, 98, 98, 99, 98, 98, 99, 98, 98, 99, 98, 98, 99, 98, 98, 99, 98, 98, 99, 98, 98, 99, 98, 98, 99, 98, 98, 98],
          respRateHistory: [26, 25, 24, 25, 24, 25, 24, 25, 24, 25, 24, 25, 24, 25, 24, 25, 24, 25, 24, 25, 24, 25, 24, 25, 24, 25, 24, 25, 24, 24],
          etCO2History: [26, 27, 28, 27, 28, 29, 28, 27, 28, 27, 28, 29, 28, 27, 28, 27, 28, 29, 28, 27, 28, 27, 28, 29, 28, 27, 28, 27, 28, 28]
        },
        emergencyProtocols: [
          {
            id: "PROTO-DKA-004",
            patientId: "PICU-PT-106",
            protocol: "PEDIATRIC_DKA_PROTOCOL",
            initiatedAt: "2026-08-23T04:00:00Z",
            initiatedBy: "Dr. Rajesh Kulkarni, MD",
            status: "BEDSIDE_ACTIVE",
            targetResponseMinutes: 15,
            assignedTeamMembers: ["Pediatric Endocrinologist", "Bedside PICU RN"],
            clinicalNotes: "Two-Bag system active: Bag 1 (0.9% NaCl with 20 mEq KCl), Bag 2 (D10W with 0.9% NaCl and 20 mEq KCl). Regular Insulin at 0.05 units/kg/hr. Neurological checks q1h."
          }
        ]
      }
    ];

    return patients.map((p) => ({
      ...p,
      activeAlerts: PicuTelemetryService.generateClinicalAlerts(p)
    }));
  }

  /**
   * Simulate a live telemetry tick with realistic stochastic physiological drifts
   */
  public static simulateTelemetryTick(patients: PicuPatient[]): PicuPatient[] {
    return patients.map((patient) => {
      const hrDelta = Math.floor((Math.random() - 0.48) * 3);
      const mapDelta = Math.floor((Math.random() - 0.48) * 2);
      const spo2Delta = Math.floor((Math.random() - 0.49) * 1.5);
      const rrDelta = Math.floor((Math.random() - 0.48) * 2);
      const etco2Delta = Math.floor((Math.random() - 0.48) * 1.5);

      const newHr = Math.max(50, Math.min(220, patient.vitals.heartRate + hrDelta));
      const newMap = Math.max(30, Math.min(120, patient.vitals.meanArterialPressure + mapDelta));
      const newSpo2 = Math.max(70, Math.min(100, patient.vitals.spO2 + spo2Delta));
      const newRr = Math.max(10, Math.min(70, patient.vitals.respiratoryRate + rrDelta));
      const newEtco2 = patient.vitals.etCO2 ? Math.max(15, Math.min(80, patient.vitals.etCO2 + etco2Delta)) : undefined;

      const updatedVitals: PediatricVitalSigns = {
        ...patient.vitals,
        heartRate: newHr,
        meanArterialPressure: newMap,
        spO2: newSpo2,
        respiratoryRate: newRr,
        etCO2: newEtco2
      };

      const sparklines = {
        heartRateHistory: [...patient.telemetrySparklines.heartRateHistory.slice(1), newHr],
        meanArterialPressureHistory: [...patient.telemetrySparklines.meanArterialPressureHistory.slice(1), newMap],
        spO2History: [...patient.telemetrySparklines.spO2History.slice(1), newSpo2],
        respRateHistory: [...patient.telemetrySparklines.respRateHistory.slice(1), newRr],
        etCO2History: newEtco2 ? [...patient.telemetrySparklines.etCO2History.slice(1), newEtco2] : patient.telemetrySparklines.etCO2History
      };

      const updatedPatient: PicuPatient = {
        ...patient,
        vitals: updatedVitals,
        telemetrySparklines: sparklines
      };

      updatedPatient.activeAlerts = PicuTelemetryService.generateClinicalAlerts(updatedPatient);

      return updatedPatient;
    });
  }

  /**
   * Calculate Ward Overview Aggregate Metrics
   */
  public static calculateWardOverview(patients: PicuPatient[]): PicuWardOverviewMetrics {
    const totalBeds = 12;
    const occupiedBeds = patients.length;
    const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

    const criticalCount = patients.filter((p) => p.acuityLevel === "CRITICAL_INSTABILITY" || p.acuityLevel === "CODE_PALS").length;
    const highAcuityCount = patients.filter((p) => p.acuityLevel === "HIGH_ACUITY").length;
    const ventCount = patients.filter((p) => p.ventilator.mode !== "ROOM_AIR").length;
    const hfovCount = patients.filter((p) => p.ventilator.mode === "HFOV").length;
    const highVisCount = patients.filter((p) => p.vasoactiveSupport.vasoactiveInotropicScore >= 15).length;
    const fluidOverloadCount = patients.filter((p) => p.fluidRenalStatus.percentFluidOverload >= 10.0).length;
    const palsCount = patients.filter((p) => p.emergencyProtocols.some((pr) => pr.status === "ACTIVE" || pr.status === "BEDSIDE_ACTIVE")).length;

    const totalPews = patients.reduce((acc, p) => acc + p.pews.totalPews, 0);
    const avgPews = occupiedBeds > 0 ? Math.round((totalPews / occupiedBeds) * 10) / 10 : 0;

    return {
      totalBeds,
      occupiedBeds,
      occupancyRatePercent: occupancyRate,
      criticalPatientsCount: criticalCount,
      highAcuityPatientsCount: highAcuityCount,
      activeVentilatorsCount: ventCount,
      hfovActiveCount: hfovCount,
      highVisScoreCount: highVisCount,
      fluidOverloadHighCount: fluidOverloadCount,
      palsActiveEmergenciesCount: palsCount,
      averagePewsScore: avgPews,
      lastTelemetrySyncTimestamp: new Date().toISOString()
    };
  }

  /**
   * Export Patient Telemetry as HL7 FHIR R4 Bundle (JSON)
   */
  public static exportPatientToFhirR4(patient: PicuPatient): object {
    return {
      resourceType: "Bundle",
      id: `picu-fhir-${patient.id}-${Date.now()}`,
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: `urn:uuid:patient-${patient.id}`,
          resource: {
            resourceType: "Patient",
            id: patient.id,
            identifier: [
              { system: "urn:oid:medtrack:picu:mrn", value: patient.mrn }
            ],
            name: [{ use: "official", text: patient.name }],
            gender: patient.gender.toLowerCase(),
            extension: [
              { url: "http://hl7.org/fhir/StructureDefinition/patient-age-bracket", valueString: patient.ageBracket },
              { url: "http://hl7.org/fhir/StructureDefinition/patient-weight-kg", valueDecimal: patient.weightKg }
            ]
          }
        },
        {
          fullUrl: `urn:uuid:observation-vitals-${patient.id}`,
          resource: {
            resourceType: "Observation",
            status: "final",
            category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs" }] }],
            subject: { reference: `Patient/${patient.id}` },
            effectiveDateTime: new Date().toISOString(),
            component: [
              { code: { text: "Heart rate" }, valueQuantity: { value: patient.vitals.heartRate, unit: "beats/minute" } },
              { code: { text: "Systolic Blood Pressure" }, valueQuantity: { value: patient.vitals.systolicBp, unit: "mmHg" } },
              { code: { text: "Diastolic Blood Pressure" }, valueQuantity: { value: patient.vitals.diastolicBp, unit: "mmHg" } },
              { code: { text: "Mean Arterial Pressure" }, valueQuantity: { value: patient.vitals.meanArterialPressure, unit: "mmHg" } },
              { code: { text: "Oxygen Saturation SpO2" }, valueQuantity: { value: patient.vitals.spO2, unit: "%" } },
              { code: { text: "Respiratory rate" }, valueQuantity: { value: patient.vitals.respiratoryRate, unit: "breaths/minute" } }
            ]
          }
        },
        {
          fullUrl: `urn:uuid:observation-pulmonary-${patient.id}`,
          resource: {
            resourceType: "Observation",
            status: "final",
            subject: { reference: `Patient/${patient.id}` },
            code: { text: "Oxygenation Index & Ventilator Mechanics" },
            component: [
              { code: { text: "Ventilator Mode" }, valueString: patient.ventilator.mode },
              { code: { text: "Oxygenation Index (OI)" }, valueQuantity: { value: patient.pulmonaryIndices.oxygenationIndex, unit: "index" } },
              { code: { text: "PALICC-2 PARDS Severity" }, valueString: patient.pulmonaryIndices.pardsClassification },
              { code: { text: "Vasoactive Inotropic Score (VIS)" }, valueQuantity: { value: patient.vasoactiveSupport.vasoactiveInotropicScore, unit: "score" } },
              { code: { text: "PEWS Score" }, valueQuantity: { value: patient.pews.totalPews, unit: "score" } },
              { code: { text: "PELOD-2 Score" }, valueQuantity: { value: patient.pelod2.totalPelod2, unit: "score" } }
            ]
          }
        }
      ]
    };
  }

  /**
   * Export Patient Telemetry Record to CSV for bedside records
   */
  public static exportPatientTelemetryCsv(patient: PicuPatient): string {
    const headers = [
      "Patient ID",
      "MRN",
      "Name",
      "Age Bracket",
      "Weight (kg)",
      "Bed",
      "Acuity",
      "Heart Rate (bpm)",
      "Blood Pressure (mmHg)",
      "MAP (mmHg)",
      "SpO2 (%)",
      "RR (br/min)",
      "Ventilator Mode",
      "FiO2 (%)",
      "Paw (cmH2O)",
      "Oxygenation Index",
      "PARDS Class",
      "VIS Score",
      "PEWS",
      "PELOD-2",
      "Fluid Net (mL)",
      "% Fluid Overload",
      "KDIGO AKI",
      "Active Alerts Count"
    ].join(",");

    const row = [
      `"${patient.id}"`,
      `"${patient.mrn}"`,
      `"${patient.name}"`,
      `"${patient.ageBracket}"`,
      patient.weightKg,
      `"${patient.bedNumber}"`,
      `"${patient.acuityLevel}"`,
      patient.vitals.heartRate,
      `"${patient.vitals.systolicBp}/${patient.vitals.diastolicBp}"`,
      patient.vitals.meanArterialPressure,
      patient.vitals.spO2,
      patient.vitals.respiratoryRate,
      `"${patient.ventilator.mode}"`,
      Math.round(patient.ventilator.fiO2 * 100),
      patient.ventilator.meanAirwayPressure,
      patient.pulmonaryIndices.oxygenationIndex,
      `"${patient.pulmonaryIndices.pardsClassification}"`,
      patient.vasoactiveSupport.vasoactiveInotropicScore,
      patient.pews.totalPews,
      patient.pelod2.totalPelod2,
      patient.fluidRenalStatus.fluidBalanceNet24h,
      patient.fluidRenalStatus.percentFluidOverload,
      `"${patient.fluidRenalStatus.pediatricKdigoAkiStage}"`,
      patient.activeAlerts.length
    ].join(",");

    return `${headers}
${row}`;
  }
}
