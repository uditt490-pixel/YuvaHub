/**
 * Cardiovascular Hemodynamics, Mechanical Circulatory Support (MCS), & ECMO Telemetry Service
 * Implements AHA/ACC, SCAI, and ELSO clinical guidelines, calculation engines, stochastic simulation, and FHIR export.
 */

import {
  CardioPatient,
  CardioWardMetrics,
  CardioAlert,
  InvasiveHemodynamics,
  EcmoCircuitTelemetry,
  McsMicroaxialTelemetry,
  VasoactiveInotropicSupport,
  AnticoagulationAndLabProfile,
  ScaiShockStage,
  McsDeviceType
} from "../types/cardiovascularTelemetry";

export class CardiovascularTelemetryService {
  // ==========================================
  // CLINICAL MATHEMATICAL CALCULATION ENGINES
  // ==========================================

  /**
   * Body Surface Area (BSA) via Mosteller Formula: BSA = sqrt((Height_cm * Weight_kg) / 3600)
   */
  public static calculateBSA(heightCm: number, weightKg: number): number {
    if (heightCm <= 0 || weightKg <= 0) return 1.8;
    return Number(Math.sqrt((heightCm * weightKg) / 3600).toFixed(2));
  }

  /**
   * Mean Arterial Pressure: MAP = (SBP + 2 * DBP) / 3
   */
  public static calculateMAP(sbp: number, dbp: number): number {
    return Math.round((sbp + 2 * dbp) / 3);
  }

  /**
   * Pulse Pressure: PP = SBP - DBP
   */
  public static calculatePulsePressure(sbp: number, dbp: number): number {
    return Math.max(0, sbp - dbp);
  }

  /**
   * Cardiac Index: CI = CO / BSA (L/min/m2)
   */
  public static calculateCardiacIndex(cardiacOutputLpm: number, bsaM2: number): number {
    if (bsaM2 <= 0) return 0;
    return Number((cardiacOutputLpm / bsaM2).toFixed(2));
  }

  /**
   * Stroke Volume: SV = (CO / HR) * 1000 (mL/beat)
   */
  public static calculateStrokeVolume(cardiacOutputLpm: number, heartRateBpm: number): number {
    if (heartRateBpm <= 0) return 0;
    return Number(((cardiacOutputLpm / heartRateBpm) * 1000).toFixed(1));
  }

  /**
   * Stroke Volume Index: SVI = SV / BSA (mL/beat/m2)
   */
  public static calculateSVI(strokeVolumeMl: number, bsaM2: number): number {
    if (bsaM2 <= 0) return 0;
    return Number((strokeVolumeMl / bsaM2).toFixed(1));
  }

  /**
   * Cardiac Power Output: CPO = (MAP * CO) / 451 (Watts)
   * High prognostic value in Cardiogenic Shock (CPO < 0.60 W indicates high in-hospital mortality)
   */
  public static calculateCPO(meanArterialPressureMmHg: number, cardiacOutputLpm: number): number {
    if (meanArterialPressureMmHg <= 0 || cardiacOutputLpm <= 0) return 0;
    return Number(((meanArterialPressureMmHg * cardiacOutputLpm) / 451).toFixed(2));
  }

  /**
   * Cardiac Power Index: CPI = CPO / BSA (Watts/m2)
   */
  public static calculateCPI(cpoWatts: number, bsaM2: number): number {
    if (bsaM2 <= 0) return 0;
    return Number((cpoWatts / bsaM2).toFixed(2));
  }

  /**
   * Systemic Vascular Resistance: SVR = 80 * (MAP - CVP) / CO (dynes*s/cm5)
   * Normal range: 800 - 1200 dynes*s/cm5
   */
  public static calculateSVR(mapMmHg: number, cvpMmHg: number, cardiacOutputLpm: number): number {
    if (cardiacOutputLpm <= 0) return 0;
    const netPressure = Math.max(0, mapMmHg - cvpMmHg);
    return Math.round((80 * netPressure) / cardiacOutputLpm);
  }

  /**
   * Pulmonary Vascular Resistance: PVR = (mPAP - PCWP) / CO (Wood Units)
   * Normal range: 0.5 - 2.0 Wood Units
   */
  public static calculatePVR(mPapMmHg: number, pcwpMmHg: number, cardiacOutputLpm: number): number {
    if (cardiacOutputLpm <= 0) return 0;
    const gradient = Math.max(0, mPapMmHg - pcwpMmHg);
    return Number((gradient / cardiacOutputLpm).toFixed(2));
  }

  /**
   * Pulmonary Artery Pulsatility Index: PAPi = (PAS - PAD) / CVP
   * PAPi < 0.9 - 1.0 indicates severe Right Ventricular (RV) failure
   */
  public static calculatePAPi(pasMmHg: number, padMmHg: number, cvpMmHg: number): number {
    if (cvpMmHg <= 0) return 0;
    const paPulsePressure = Math.max(0, pasMmHg - padMmHg);
    return Number((paPulsePressure / cvpMmHg).toFixed(2));
  }

  /**
   * Left Ventricular Stroke Work Index: LVSWI = 0.0136 * SVI * (MAP - PCWP) (g*m/m2)
   * Normal range: 50 - 62 g*m/m2
   */
  public static calculateLVSWI(sviMlM2: number, mapMmHg: number, pcwpMmHg: number): number {
    const netGradient = Math.max(0, mapMmHg - pcwpMmHg);
    return Number((0.0136 * sviMlM2 * netGradient).toFixed(1));
  }

  /**
   * Right Ventricular Stroke Work Index: RVSWI = 0.0136 * SVI * (mPAP - CVP) (g*m/m2)
   * Normal range: 5 - 10 g*m/m2
   */
  public static calculateRVSWI(sviMlM2: number, mPapMmHg: number, cvpMmHg: number): number {
    const netGradient = Math.max(0, mPapMmHg - cvpMmHg);
    return Number((0.0136 * sviMlM2 * netGradient).toFixed(1));
  }

  /**
   * Transpulmonary Gradient: TPG = mPAP - PCWP (mmHg)
   */
  public static calculateTranspulmonaryGradient(mPapMmHg: number, pcwpMmHg: number): number {
    return Math.max(0, mPapMmHg - pcwpMmHg);
  }

  /**
   * Diastolic Pulmonary Gradient: DPG = PAD - PCWP (mmHg)
   */
  public static calculateDiastolicPulmonaryGradient(padMmHg: number, pcwpMmHg: number): number {
    return padMmHg - pcwpMmHg;
  }

  /**
   * Shock Index: SI = HR / SBP
   * Normal: 0.5 - 0.7; Alert: > 0.9 (indicates impending shock)
   */
  public static calculateShockIndex(heartRateBpm: number, sbpMmHg: number): number {
    if (sbpMmHg <= 0) return 0;
    return Number((heartRateBpm / sbpMmHg).toFixed(2));
  }

  /**
   * Vasoactive-Inotropic Score (VIS):
   * VIS = Dopamine + Dobutamine + 100*Epinephrine + 100*Norepinephrine + 10*Milrinone + 10,000*Vasopressin
   */
  public static calculateVIS(vaso: Partial<VasoactiveInotropicSupport>): number {
    const dopa = vaso.dopamineMcgKgMin || 0;
    const dobut = vaso.dobutamineMcgKgMin || 0;
    const epi = vaso.epinephrineMcgKgMin || 0;
    const norepi = vaso.norepinephrineMcgKgMin || 0;
    const milr = vaso.milrinoneMcgKgMin || 0;
    const vasoPres = vaso.vasopressinUnitsMin || 0;

    const total = dopa + dobut + 100 * epi + 100 * norepi + 10 * milr + 10000 * vasoPres;
    return Number(total.toFixed(1));
  }

  /**
   * Transmembrane Pressure Gradient: TMP = P1 - P2 (mmHg)
   * Evaluates oxygenator resistance and membrane clotting (> 50 mmHg suggests thrombosis)
   */
  public static calculateTransmembranePressure(p1PreMmHg: number, p2PostMmHg: number): number {
    return Math.max(0, p1PreMmHg - p2PostMmHg);
  }

  /**
   * Harlequin / North-South Syndrome Delta: Lower Limb SpO2 - Right Radial SpO2
   * In peripheral VA-ECMO, when failing native lungs eject deoxygenated blood to the brain/right arm while ECMO delivers oxygenated blood to the lower body, Delta > 10% requires urgent intervention (e.g. conversion to VAV-ECMO or ventilator optimization).
   */
  public static calculateHarlequinDelta(lowerSpO2: number, rightRadialSpO2: number): number {
    return Math.max(0, lowerSpO2 - rightRadialSpO2);
  }

  // ==========================================
  // CLINICAL DECISION SUPPORT & ALERTS ENGINE
  // ==========================================

  public static evaluateCardioAlerts(patient: CardioPatient): CardioAlert[] {
    const alerts: CardioAlert[] = [];
    const now = new Date().toISOString();

    // 1. Oxygenator Thrombosis / High TMP Alert
    if (patient.ecmoTelemetry && patient.ecmoTelemetry.transmembranePressureGradientMmHg >= 50) {
      alerts.push({
        id: `alt-tmp-${patient.id}`,
        severity: "CRITICAL",
        title: "High Transmembrane Pressure (Oxygenator Thrombosis Risk)",
        triggerMeasurement: `TMP ΔP: ${patient.ecmoTelemetry.transmembranePressureGradientMmHg} mmHg`,
        expectedRange: "< 45 mmHg",
        clinicalMeaning: "Severe clot burden inside hollow-fiber membrane oxygenator causing high flow resistance.",
        actionGuidance: "Inspect membrane with fiberoptic light; check pre/post blood gases; prepare backup ECMO console and prime circuit for emergent exchange.",
        timestamp: now
      });
    }

    // 2. Venous Drainage Insufficiency / Cannula Chatter
    if (patient.ecmoTelemetry && patient.ecmoTelemetry.venousDrainagePressureP3MmHg <= -95) {
      alerts.push({
        id: `alt-p3-${patient.id}`,
        severity: "WARNING",
        title: "Excessive Negative Venous Drainage Pressure (Cannula Chatter)",
        triggerMeasurement: `P3 Pressure: ${patient.ecmoTelemetry.venousDrainagePressureP3MmHg} mmHg`,
        expectedRange: "-30 to -80 mmHg",
        clinicalMeaning: "Venous drainage cannula suction against vessel wall due to hypovolemia or malposition.",
        actionGuidance: "Administer 250-500 mL crystalloid or albumin bolus; decrease RPM temporarily; check ultrasound IVC collapse and cannula position.",
        timestamp: now
      });
    }

    // 3. Harlequin / North-South Syndrome (Differential Hypoxemia in Peripheral VA-ECMO)
    if (
      patient.mcsDevice === "VA_ECMO" &&
      patient.ecmoTelemetry &&
      patient.ecmoTelemetry.harlequinDeltaSpO2Percent >= 10 &&
      patient.ecmoTelemetry.rightRadialNativeSpO2Percent < 90
    ) {
      alerts.push({
        id: `alt-harlequin-${patient.id}`,
        severity: "CRITICAL",
        title: "Harlequin / North-South Syndrome (Upper Body Hypoxemia)",
        triggerMeasurement: `Rt Radial SpO2: ${patient.ecmoTelemetry.rightRadialNativeSpO2Percent}%, Lower SpO2: ${patient.ecmoTelemetry.lowerExtremityEcmoSpO2Percent}% (Δ ${patient.ecmoTelemetry.harlequinDeltaSpO2Percent}%)`,
        expectedRange: "Δ SpO2 < 5%, Rt Radial > 92%",
        clinicalMeaning: "Deoxygenated native cardiac output perfusing coronary arteries and brain while retrograde ECMO perfuses lower body.",
        actionGuidance: "Increase mechanical ventilator FiO2/PEEP; convert to VAV-ECMO configuration (arterial return to right internal jugular); or unload LV.",
        timestamp: now
      });
    }

    // 4. Left Ventricular Distension & Aortic Valve Non-Opening (VA-ECMO Afterload Mismatch)
    if (
      patient.mcsDevice === "VA_ECMO" &&
      patient.hemodynamics.pulsePressureMmHg < 10 &&
      patient.hemodynamics.pulmonaryCapillaryWedgePressureMmHg >= 20
    ) {
      alerts.push({
        id: `alt-lv-distension-${patient.id}`,
        severity: "CRITICAL",
        title: "LV Distension & Aortic Valve Non-Opening (Stasis Risk)",
        triggerMeasurement: `Pulse Pressure: ${patient.hemodynamics.pulsePressureMmHg} mmHg, PCWP: ${patient.hemodynamics.pulmonaryCapillaryWedgePressureMmHg} mmHg`,
        expectedRange: "Pulse Pressure > 15 mmHg, PCWP < 18 mmHg",
        clinicalMeaning: "VA-ECMO retrograde afterload exceeds LV systolic generation, causing closed aortic valve, intracardiac stasis/clot, and pulmonary edema.",
        actionGuidance: "Initiate mechanical LV unloading immediately (insert Impella for ECPELLA or perform atrial septostomy/LV apex vent); titrate low-dose inotropes (dobutamine/milrinone).",
        timestamp: now
      });
    }

    // 5. Critical Cardiogenic Shock Hypoperfusion (CPO < 0.60 W)
    if (patient.hemodynamics.cardiacPowerOutputWatts > 0 && patient.hemodynamics.cardiacPowerOutputWatts < 0.60) {
      alerts.push({
        id: `alt-cpo-${patient.id}`,
        severity: "CRITICAL",
        title: "Critical Low Cardiac Power Output (CPO < 0.60 W)",
        triggerMeasurement: `CPO: ${patient.hemodynamics.cardiacPowerOutputWatts} W (CPI: ${patient.hemodynamics.cardiacPowerIndexWattsM2} W/m2)`,
        expectedRange: "CPO >= 0.60 W (Target >= 0.80 W)",
        clinicalMeaning: "Severe pump failure and inadequate systemic hydraulic work. Strongly correlates with in-hospital cardiogenic shock mortality.",
        actionGuidance: "Review SCAI stage progression; escalate mechanical circulatory support (increase Impella P-level or VA-ECMO flow); optimize filling pressures.",
        timestamp: now
      });
    }

    // 6. Right Ventricular Failure / Low PAPi
    if (
      patient.hemodynamics.pulmonaryArteryPulsatilityIndex > 0 &&
      patient.hemodynamics.pulmonaryArteryPulsatilityIndex < 0.90 &&
      patient.hemodynamics.centralVenousPressureMmHg >= 14
    ) {
      alerts.push({
        id: `alt-papi-${patient.id}`,
        severity: "CRITICAL",
        title: "Right Ventricular Failure Pattern (PAPi < 0.90)",
        triggerMeasurement: `PAPi: ${patient.hemodynamics.pulmonaryArteryPulsatilityIndex}, CVP: ${patient.hemodynamics.centralVenousPressureMmHg} mmHg`,
        expectedRange: "PAPi > 1.0, CVP < 10 mmHg",
        clinicalMeaning: "Impaired RV contractility with disproportionately elevated right atrial filling pressure.",
        actionGuidance: "Reduce RV afterload (inhaled epoprostenol / nitric oxide); optimize volume; consider RV mechanical support (Impella RP or ProtekDuo).",
        timestamp: now
      });
    }

    // 7. Free Plasma Hemoglobin / Intravascular Hemolysis Alert
    if (patient.anticoagulationLabs.freePlasmaHemoglobinMgDl >= 50) {
      alerts.push({
        id: `alt-fhb-${patient.id}`,
        severity: "WARNING",
        title: "Marked Hemolysis & Shear Stress Elevation",
        triggerMeasurement: `Free Plasma Hb: ${patient.anticoagulationLabs.freePlasmaHemoglobinMgDl} mg/dL`,
        expectedRange: "< 10 mg/dL",
        clinicalMeaning: "Mechanical red cell destruction from high pump shear, cannula malposition, thrombosis, or Impella suction.",
        actionGuidance: "Assess Impella optical placement signal; decrease pump RPM; check for circuit clots and inspect urine for dark hemoglobinuria; maintain renal hydration.",
        timestamp: now
      });
    }

    // 8. Critical Acidemia / Hyperlactatemia
    if (patient.anticoagulationLabs.lactateMmolL >= 4.0 || patient.anticoagulationLabs.arterialPh < 7.20) {
      alerts.push({
        id: `alt-lactate-${patient.id}`,
        severity: "CRITICAL",
        title: "Severe Metabolic Acidosis & Tissue Hypoperfusion",
        triggerMeasurement: `Lactate: ${patient.anticoagulationLabs.lactateMmolL} mmol/L, pH: ${patient.anticoagulationLabs.arterialPh}`,
        expectedRange: "Lactate < 2.0 mmol/L, pH 7.35 - 7.45",
        clinicalMeaning: "Ongoing systemic anaerobic metabolism and end-organ malperfusion.",
        actionGuidance: "Target SvO2 > 70%; check distal limb perfusion; assess coronary and mesenteric flows; evaluate vasoactive titration.",
        timestamp: now
      });
    }

    return alerts;
  }

  // ==========================================
  // STOCHASTIC SIMULATION TELEMETRY ENGINE
  // ==========================================

  public static simulateCardioTelemetryTick(patients: CardioPatient[]): CardioPatient[] {
    return patients.map((p) => {
      // 1. Stochastic vital fluctuations
      const hrJitter = Math.floor((Math.random() - 0.5) * 4);
      const sbpJitter = Math.floor((Math.random() - 0.5) * 3);
      const dbpJitter = Math.floor((Math.random() - 0.5) * 2);

      const newHR = Math.max(40, Math.min(180, p.hemodynamics.heartRateBpm + hrJitter));
      const newSBP = Math.max(50, Math.min(220, p.hemodynamics.systolicBloodPressureMmHg + sbpJitter));
      const newDBP = Math.max(30, Math.min(130, p.hemodynamics.diastolicBloodPressureMmHg + dbpJitter));
      const newMAP = CardiovascularTelemetryService.calculateMAP(newSBP, newDBP);
      const newPP = CardiovascularTelemetryService.calculatePulsePressure(newSBP, newDBP);

      const coJitter = Number(((Math.random() - 0.5) * 0.08).toFixed(2));
      const newCO = Number(Math.max(1.0, Math.min(9.0, p.hemodynamics.cardiacOutputLpm + coJitter)).toFixed(2));
      const newCI = CardiovascularTelemetryService.calculateCardiacIndex(newCO, p.bodySurfaceAreaM2);
      const newSV = CardiovascularTelemetryService.calculateStrokeVolume(newCO, newHR);
      const newSVI = CardiovascularTelemetryService.calculateSVI(newSV, p.bodySurfaceAreaM2);
      const newCPO = CardiovascularTelemetryService.calculateCPO(newMAP, newCO);
      const newCPI = CardiovascularTelemetryService.calculateCPI(newCPO, p.bodySurfaceAreaM2);
      const newSVR = CardiovascularTelemetryService.calculateSVR(newMAP, p.hemodynamics.centralVenousPressureMmHg, newCO);
      const newPVR = CardiovascularTelemetryService.calculatePVR(p.hemodynamics.pulmonaryArteryMeanMmHg, p.hemodynamics.pulmonaryCapillaryWedgePressureMmHg, newCO);
      const newPAPi = CardiovascularTelemetryService.calculatePAPi(p.hemodynamics.pulmonaryArterySystolicMmHg, p.hemodynamics.pulmonaryArteryDiastolicMmHg, p.hemodynamics.centralVenousPressureMmHg);
      const newLVSWI = CardiovascularTelemetryService.calculateLVSWI(newSVI, newMAP, p.hemodynamics.pulmonaryCapillaryWedgePressureMmHg);
      const newRVSWI = CardiovascularTelemetryService.calculateRVSWI(newSVI, p.hemodynamics.pulmonaryArteryMeanMmHg, p.hemodynamics.centralVenousPressureMmHg);
      const newSI = CardiovascularTelemetryService.calculateShockIndex(newHR, newSBP);
      const newMSI = Number((newHR / (newMAP || 1)).toFixed(2));

      // 2. ECMO circuit drift
      let newEcmo = { ...p.ecmoTelemetry };
      if (p.mcsDevice.includes("ECMO")) {
        const flowJitter = Number(((Math.random() - 0.5) * 0.04).toFixed(2));
        const p1Jitter = Math.floor((Math.random() - 0.5) * 3);
        const p2Jitter = Math.floor((Math.random() - 0.5) * 2);
        const p3Jitter = Math.floor((Math.random() - 0.5) * 2);

        const bloodFlow = Number(Math.max(1.5, Math.min(6.5, newEcmo.bloodFlowLpm + flowJitter)).toFixed(2));
        const p1 = Math.max(100, Math.min(320, newEcmo.preMembranePressureP1MmHg + p1Jitter));
        const p2 = Math.max(80, Math.min(260, newEcmo.postMembranePressureP2MmHg + p2Jitter));
        const p3 = Math.max(-140, Math.min(-15, newEcmo.venousDrainagePressureP3MmHg + p3Jitter));
        const tmp = CardiovascularTelemetryService.calculateTransmembranePressure(p1, p2);

        const radialJitter = Math.floor((Math.random() - 0.5) * 2);
        const rightRadialSpO2 = Math.max(70, Math.min(100, newEcmo.rightRadialNativeSpO2Percent + radialJitter));
        const lowerSpO2 = newEcmo.lowerExtremityEcmoSpO2Percent;
        const harlequinDelta = CardiovascularTelemetryService.calculateHarlequinDelta(lowerSpO2, rightRadialSpO2);

        newEcmo = {
          ...newEcmo,
          bloodFlowLpm: bloodFlow,
          preMembranePressureP1MmHg: p1,
          postMembranePressureP2MmHg: p2,
          venousDrainagePressureP3MmHg: p3,
          transmembranePressureGradientMmHg: tmp,
          rightRadialNativeSpO2Percent: rightRadialSpO2,
          harlequinDeltaSpO2Percent: harlequinDelta
        };
      }

      // 3. Microaxial telemetry drift
      let newMicroaxial = { ...p.microaxialTelemetry };
      if (p.mcsDevice.includes("IMPELLA") || p.mcsDevice === "ECPELLA") {
        const impellaFlowJitter = Number(((Math.random() - 0.5) * 0.05).toFixed(2));
        const motorCurrentJitter = Math.floor((Math.random() - 0.5) * 10);
        newMicroaxial = {
          ...newMicroaxial,
          impellaFlowLpm: Number(Math.max(1.0, Math.min(5.5, newMicroaxial.impellaFlowLpm + impellaFlowJitter)).toFixed(2)),
          motorCurrentMilliamps: Math.max(400, Math.min(1200, newMicroaxial.motorCurrentMilliamps + motorCurrentJitter))
        };
      }

      const updatedPatient: CardioPatient = {
        ...p,
        hemodynamics: {
          ...p.hemodynamics,
          heartRateBpm: newHR,
          systolicBloodPressureMmHg: newSBP,
          diastolicBloodPressureMmHg: newDBP,
          meanArterialPressureMmHg: newMAP,
          pulsePressureMmHg: newPP,
          cardiacOutputLpm: newCO,
          cardiacIndexLpmM2: newCI,
          strokeVolumeMl: newSV,
          strokeVolumeIndexMlM2: newSVI,
          cardiacPowerOutputWatts: newCPO,
          cardiacPowerIndexWattsM2: newCPI,
          systemicVascularResistanceDynes: newSVR,
          pulmonaryVascularResistanceWoodUnits: newPVR,
          pulmonaryArteryPulsatilityIndex: newPAPi,
          leftVentricularStrokeWorkIndex: newLVSWI,
          rightVentricularStrokeWorkIndex: newRVSWI,
          shockIndex: newSI,
          modifiedShockIndex: newMSI
        },
        ecmoTelemetry: newEcmo,
        microaxialTelemetry: newMicroaxial,
        lastUpdated: new Date().toISOString()
      };

      updatedPatient.alerts = CardiovascularTelemetryService.evaluateCardioAlerts(updatedPatient);
      return updatedPatient;
    });
  }

  // ==========================================
  // WARD METRICS AGGREGATION
  // ==========================================

  public static calculateWardMetrics(patients: CardioPatient[]): CardioWardMetrics {
    const totalOccupiedBeds = patients.length;
    const totalAvailableBeds = 16;

    let activeVaEcmoCount = 0;
    let activeVvEcmoCount = 0;
    let activeEcpellaCount = 0;
    let activeImpellaCount = 0;
    let activeIabpCount = 0;

    const scaiDistribution = {
      stageA: 0,
      stageB: 0,
      stageC: 0,
      stageD: 0,
      stageE: 0
    };

    let criticalCpoCount = 0;
    let highTransmembranePressureCount = 0;
    let harlequinSyndromeAlertCount = 0;
    let highVisScoreCount = 0;

    let sumCI = 0;
    let sumLactate = 0;

    patients.forEach((pt) => {
      if (pt.mcsDevice === "VA_ECMO") activeVaEcmoCount++;
      if (pt.mcsDevice === "VV_ECMO" || pt.mcsDevice === "VAV_ECMO") activeVvEcmoCount++;
      if (pt.mcsDevice === "ECPELLA") activeEcpellaCount++;
      if (pt.mcsDevice === "IMPELLA_CP" || pt.mcsDevice === "IMPELLA_5_5" || pt.mcsDevice === "IMPELLA_RP") activeImpellaCount++;
      if (pt.mcsDevice === "IABP") activeIabpCount++;

      switch (pt.scaiStage) {
        case "STAGE_A_AT_RISK": scaiDistribution.stageA++; break;
        case "STAGE_B_BEGINNING": scaiDistribution.stageB++; break;
        case "STAGE_C_CLASSIC": scaiDistribution.stageC++; break;
        case "STAGE_D_DETERIORATING": scaiDistribution.stageD++; break;
        case "STAGE_E_EXTREMIS": scaiDistribution.stageE++; break;
      }

      if (pt.hemodynamics.cardiacPowerOutputWatts > 0 && pt.hemodynamics.cardiacPowerOutputWatts < 0.60) {
        criticalCpoCount++;
      }
      if (pt.ecmoTelemetry && pt.ecmoTelemetry.transmembranePressureGradientMmHg >= 50) {
        highTransmembranePressureCount++;
      }
      if (pt.ecmoTelemetry && pt.ecmoTelemetry.harlequinDeltaSpO2Percent >= 10) {
        harlequinSyndromeAlertCount++;
      }
      if (pt.vasoactiveSupport && pt.vasoactiveSupport.vasoactiveInotropicScore >= 30) {
        highVisScoreCount++;
      }

      sumCI += pt.hemodynamics.cardiacIndexLpmM2 || 0;
      sumLactate += pt.anticoagulationLabs.lactateMmolL || 0;
    });

    return {
      totalOccupiedBeds,
      totalAvailableBeds,
      activeVaEcmoCount,
      activeVvEcmoCount,
      activeEcpellaCount,
      activeImpellaCount,
      activeIabpCount,
      scaiStageDistribution: scaiDistribution,
      criticalCpoCount,
      highTransmembranePressureCount,
      harlequinSyndromeAlertCount,
      highVisScoreCount,
      averageCardiacIndex: totalOccupiedBeds > 0 ? Number((sumCI / totalOccupiedBeds).toFixed(2)) : 0,
      averageLactate: totalOccupiedBeds > 0 ? Number((sumLactate / totalOccupiedBeds).toFixed(1)) : 0
    };
  }

  // ==========================================
  // MOCK PATIENT DATASET (8 REAL CLINICAL CASES)
  // ==========================================

  public static getMockCardioPatients(): CardioPatient[] {
    const raw: CardioPatient[] = [
      {
        id: "cardio-bed-01",
        mrn: "MRN-CTICU-9401",
        name: "Arthur Vance",
        age: 61,
        sex: "MALE",
        bedNumber: "CTICU-01",
        bodySurfaceAreaM2: 2.05,
        weightKg: 86,
        heightCm: 178,
        primaryDiagnosis: "Acute Anterior STEMI with Post-Infarction Cardiogenic Shock (ECPELLA Unloaded)",
        shockEtiology: "ACUTE_MYOCARDIAL_INFARCTION",
        scaiStage: "STAGE_D_DETERIORATING",
        mcsDevice: "ECPELLA",
        cannulation: "PERIPHERAL_FEMORAL_FEMORAL",
        hoursOnSupport: 38,
        dayInIcu: 2,
        attendingCardiologist: "Dr. Alistair Sterling, MD, FACC",
        primaryPerfusionist: "Sarah Jenkins, CCP",
        hemodynamics: {
          heartRateBpm: 104,
          rhythmStatus: "SINUS",
          systolicBloodPressureMmHg: 92,
          diastolicBloodPressureMmHg: 68,
          meanArterialPressureMmHg: 76,
          pulsePressureMmHg: 24,
          centralVenousPressureMmHg: 12,
          pulmonaryArterySystolicMmHg: 38,
          pulmonaryArteryDiastolicMmHg: 20,
          pulmonaryArteryMeanMmHg: 26,
          pulmonaryCapillaryWedgePressureMmHg: 16,
          cardiacOutputLpm: 4.8,
          cardiacIndexLpmM2: 2.34,
          strokeVolumeMl: 46.1,
          strokeVolumeIndexMlM2: 22.5,
          systemicVascularResistanceDynes: 1067,
          pulmonaryVascularResistanceWoodUnits: 2.08,
          cardiacPowerOutputWatts: 0.81,
          cardiacPowerIndexWattsM2: 0.40,
          pulmonaryArteryPulsatilityIndex: 1.50,
          leftVentricularStrokeWorkIndex: 18.4,
          rightVentricularStrokeWorkIndex: 4.3,
          transpulmonaryGradientMmHg: 10,
          diastolicPulmonaryGradientMmHg: 4,
          shockIndex: 1.13,
          modifiedShockIndex: 1.37
        },
        ecmoTelemetry: {
          pumpSpeedRpm: 3850,
          bloodFlowLpm: 3.6,
          sweepGasFlowLpm: 4.0,
          sweepGasFiO2Percent: 100,
          preMembranePressureP1MmHg: 210,
          postMembranePressureP2MmHg: 175,
          transmembranePressureGradientMmHg: 35,
          venousDrainagePressureP3MmHg: -55,
          arterialBloodTemperatureCelsius: 36.8,
          venousOxygenSaturationSvO2Percent: 68,
          postOxygenatorPO2MmHg: 380,
          postOxygenatorPCO2MmHg: 38,
          rightRadialNativeSpO2Percent: 96,
          lowerExtremityEcmoSpO2Percent: 99,
          harlequinDeltaSpO2Percent: 3,
          distalPerfusionCatheterFlowMlMin: 180
        },
        microaxialTelemetry: {
          impellaPLevel: "P-7",
          impellaFlowLpm: 3.1,
          motorCurrentMilliamps: 720,
          purgePressureMmHg: 440,
          purgeFlowRateMlHr: 12.5,
          opticalPlacementSignalStatus: "CORRECT_AORTIC_VALVE",
          iabpAugmentationRatio: "STANDBY",
          iabpAugmentedDiastolicMmHg: 0
        },
        vasoactiveSupport: {
          epinephrineMcgKgMin: 0.04,
          norepinephrineMcgKgMin: 0.08,
          vasopressinUnitsMin: 0.03,
          dobutamineMcgKgMin: 2.5,
          milrinoneMcgKgMin: 0.0,
          dopamineMcgKgMin: 0.0,
          angiotensinIINgKgMin: 0.0,
          vasoactiveInotropicScore: 314.5
        },
        anticoagulationLabs: {
          activatedClottingTimeSeconds: 198,
          antiXaActivityIuMl: 0.45,
          unfractionatedHeparinUnitsHr: 1100,
          bivalirudinMgKgHr: 0,
          fibrinogenMgDl: 240,
          freePlasmaHemoglobinMgDl: 18,
          lactateMmolL: 2.8,
          arterialPh: 7.34,
          arterialBaseExcessMeqL: -3.2,
          serumCreatinineMgDl: 1.4,
          plateletCountKUl: 165
        },
        alerts: [],
        lastUpdated: new Date().toISOString()
      },
      {
        id: "cardio-bed-02",
        mrn: "MRN-CTICU-9402",
        name: "Eleanor Crawford",
        age: 49,
        sex: "FEMALE",
        bedNumber: "CTICU-02",
        bodySurfaceAreaM2: 1.72,
        weightKg: 64,
        heightCm: 162,
        primaryDiagnosis: "Severe ARDS Secondary to Viral Pneumonia on VV-ECMO with High Transmembrane Pressure",
        shockEtiology: "REFRACTORY_ARDS",
        scaiStage: "STAGE_C_CLASSIC",
        mcsDevice: "VV_ECMO",
        cannulation: "DUAL_LUMEN_AVALON_IJ",
        hoursOnSupport: 112,
        dayInIcu: 5,
        attendingCardiologist: "Dr. Fiona Vance, MD, FCCP",
        primaryPerfusionist: "David Chen, CCP",
        hemodynamics: {
          heartRateBpm: 92,
          rhythmStatus: "SINUS",
          systolicBloodPressureMmHg: 118,
          diastolicBloodPressureMmHg: 72,
          meanArterialPressureMmHg: 87,
          pulsePressureMmHg: 46,
          centralVenousPressureMmHg: 10,
          pulmonaryArterySystolicMmHg: 32,
          pulmonaryArteryDiastolicMmHg: 14,
          pulmonaryArteryMeanMmHg: 20,
          pulmonaryCapillaryWedgePressureMmHg: 12,
          cardiacOutputLpm: 5.4,
          cardiacIndexLpmM2: 3.14,
          strokeVolumeMl: 58.7,
          strokeVolumeIndexMlM2: 34.1,
          systemicVascularResistanceDynes: 1140,
          pulmonaryVascularResistanceWoodUnits: 1.48,
          cardiacPowerOutputWatts: 1.04,
          cardiacPowerIndexWattsM2: 0.60,
          pulmonaryArteryPulsatilityIndex: 1.80,
          leftVentricularStrokeWorkIndex: 34.8,
          rightVentricularStrokeWorkIndex: 4.6,
          transpulmonaryGradientMmHg: 8,
          diastolicPulmonaryGradientMmHg: 2,
          shockIndex: 0.78,
          modifiedShockIndex: 1.06
        },
        ecmoTelemetry: {
          pumpSpeedRpm: 4200,
          bloodFlowLpm: 4.5,
          sweepGasFlowLpm: 6.5,
          sweepGasFiO2Percent: 100,
          preMembranePressureP1MmHg: 275,
          postMembranePressureP2MmHg: 218,
          transmembranePressureGradientMmHg: 57, // CLOTTING ALERT
          venousDrainagePressureP3MmHg: -62,
          arterialBloodTemperatureCelsius: 37.0,
          venousOxygenSaturationSvO2Percent: 74,
          postOxygenatorPO2MmHg: 290,
          postOxygenatorPCO2MmHg: 42,
          rightRadialNativeSpO2Percent: 94,
          lowerExtremityEcmoSpO2Percent: 94,
          harlequinDeltaSpO2Percent: 0,
          distalPerfusionCatheterFlowMlMin: 0
        },
        microaxialTelemetry: {
          impellaPLevel: "NONE",
          impellaFlowLpm: 0,
          motorCurrentMilliamps: 0,
          purgePressureMmHg: 0,
          purgeFlowRateMlHr: 0,
          opticalPlacementSignalStatus: "CORRECT_AORTIC_VALVE",
          iabpAugmentationRatio: "STANDBY",
          iabpAugmentedDiastolicMmHg: 0
        },
        vasoactiveSupport: {
          epinephrineMcgKgMin: 0,
          norepinephrineMcgKgMin: 0.03,
          vasopressinUnitsMin: 0,
          dobutamineMcgKgMin: 0,
          milrinoneMcgKgMin: 0,
          dopamineMcgKgMin: 0,
          angiotensinIINgKgMin: 0,
          vasoactiveInotropicScore: 3.0
        },
        anticoagulationLabs: {
          activatedClottingTimeSeconds: 185,
          antiXaActivityIuMl: 0.38,
          unfractionatedHeparinUnitsHr: 1350,
          bivalirudinMgKgHr: 0,
          fibrinogenMgDl: 380,
          freePlasmaHemoglobinMgDl: 34,
          lactateMmolL: 1.6,
          arterialPh: 7.39,
          arterialBaseExcessMeqL: 0.4,
          serumCreatinineMgDl: 0.9,
          plateletCountKUl: 142
        },
        alerts: [],
        lastUpdated: new Date().toISOString()
      },
      {
        id: "cardio-bed-03",
        mrn: "MRN-CTICU-9403",
        name: "Marcus Thorne",
        age: 68,
        sex: "MALE",
        bedNumber: "CTICU-03",
        bodySurfaceAreaM2: 2.18,
        weightKg: 95,
        heightCm: 183,
        primaryDiagnosis: "Post-Cardiotomy Shock with Harlequin Syndrome (North-South Differential Hypoxemia)",
        shockEtiology: "POST_CARDIOTOMY_SHOCK",
        scaiStage: "STAGE_D_DETERIORATING",
        mcsDevice: "VA_ECMO",
        cannulation: "PERIPHERAL_FEMORAL_FEMORAL",
        hoursOnSupport: 22,
        dayInIcu: 1,
        attendingCardiologist: "Dr. Alistair Sterling, MD, FACC",
        primaryPerfusionist: "Sarah Jenkins, CCP",
        hemodynamics: {
          heartRateBpm: 112,
          rhythmStatus: "ATRIAL_FIB_RVR",
          systolicBloodPressureMmHg: 88,
          diastolicBloodPressureMmHg: 58,
          meanArterialPressureMmHg: 68,
          pulsePressureMmHg: 30,
          centralVenousPressureMmHg: 15,
          pulmonaryArterySystolicMmHg: 44,
          pulmonaryArteryDiastolicMmHg: 24,
          pulmonaryArteryMeanMmHg: 31,
          pulmonaryCapillaryWedgePressureMmHg: 22,
          cardiacOutputLpm: 3.9,
          cardiacIndexLpmM2: 1.79,
          strokeVolumeMl: 34.8,
          strokeVolumeIndexMlM2: 16.0,
          systemicVascularResistanceDynes: 1087,
          pulmonaryVascularResistanceWoodUnits: 2.31,
          cardiacPowerOutputWatts: 0.59, // CRITICAL CPO
          cardiacPowerIndexWattsM2: 0.27,
          pulmonaryArteryPulsatilityIndex: 1.33,
          leftVentricularStrokeWorkIndex: 10.0,
          rightVentricularStrokeWorkIndex: 3.5,
          transpulmonaryGradientMmHg: 9,
          diastolicPulmonaryGradientMmHg: 2,
          shockIndex: 1.27,
          modifiedShockIndex: 1.65
        },
        ecmoTelemetry: {
          pumpSpeedRpm: 4100,
          bloodFlowLpm: 4.1,
          sweepGasFlowLpm: 4.5,
          sweepGasFiO2Percent: 100,
          preMembranePressureP1MmHg: 230,
          postMembranePressureP2MmHg: 195,
          transmembranePressureGradientMmHg: 35,
          venousDrainagePressureP3MmHg: -68,
          arterialBloodTemperatureCelsius: 36.6,
          venousOxygenSaturationSvO2Percent: 62,
          postOxygenatorPO2MmHg: 340,
          postOxygenatorPCO2MmHg: 39,
          rightRadialNativeSpO2Percent: 82, // HARLEQUIN UPPER HYPOXEMIA
          lowerExtremityEcmoSpO2Percent: 99,
          harlequinDeltaSpO2Percent: 17, // DELTA 17% ALERT
          distalPerfusionCatheterFlowMlMin: 160
        },
        microaxialTelemetry: {
          impellaPLevel: "NONE",
          impellaFlowLpm: 0,
          motorCurrentMilliamps: 0,
          purgePressureMmHg: 0,
          purgeFlowRateMlHr: 0,
          opticalPlacementSignalStatus: "CORRECT_AORTIC_VALVE",
          iabpAugmentationRatio: "STANDBY",
          iabpAugmentedDiastolicMmHg: 0
        },
        vasoactiveSupport: {
          epinephrineMcgKgMin: 0.08,
          norepinephrineMcgKgMin: 0.14,
          vasopressinUnitsMin: 0.04,
          dobutamineMcgKgMin: 5.0,
          milrinoneMcgKgMin: 0.25,
          dopamineMcgKgMin: 0,
          angiotensinIINgKgMin: 0,
          vasoactiveInotropicScore: 429.5
        },
        anticoagulationLabs: {
          activatedClottingTimeSeconds: 210,
          antiXaActivityIuMl: 0.52,
          unfractionatedHeparinUnitsHr: 1200,
          bivalirudinMgKgHr: 0,
          fibrinogenMgDl: 190,
          freePlasmaHemoglobinMgDl: 22,
          lactateMmolL: 4.9, // HYPERLACTATEMIA
          arterialPh: 7.26,
          arterialBaseExcessMeqL: -6.8,
          serumCreatinineMgDl: 2.1,
          plateletCountKUl: 110
        },
        alerts: [],
        lastUpdated: new Date().toISOString()
      },
      {
        id: "cardio-bed-04",
        mrn: "MRN-CTICU-9404",
        name: "Clara Mendoza",
        age: 54,
        sex: "FEMALE",
        bedNumber: "CTICU-04",
        bodySurfaceAreaM2: 1.65,
        weightKg: 58,
        heightCm: 158,
        primaryDiagnosis: "Fulminant Giant Cell Myocarditis on Impella 5.5 Support with Optical Signal Displacement",
        shockEtiology: "FULMINANT_MYOCARDITIS",
        scaiStage: "STAGE_C_CLASSIC",
        mcsDevice: "IMPELLA_5_5",
        cannulation: "AXILLARY_SUBCLAVIAN_GRAFT",
        hoursOnSupport: 72,
        dayInIcu: 3,
        attendingCardiologist: "Dr. Gregory Hayes, MD, FACC",
        primaryPerfusionist: "Elena Rostova, CCP",
        hemodynamics: {
          heartRateBpm: 88,
          rhythmStatus: "SINUS",
          systolicBloodPressureMmHg: 104,
          diastolicBloodPressureMmHg: 70,
          meanArterialPressureMmHg: 81,
          pulsePressureMmHg: 34,
          centralVenousPressureMmHg: 9,
          pulmonaryArterySystolicMmHg: 28,
          pulmonaryArteryDiastolicMmHg: 12,
          pulmonaryArteryMeanMmHg: 17,
          pulmonaryCapillaryWedgePressureMmHg: 13,
          cardiacOutputLpm: 4.6,
          cardiacIndexLpmM2: 2.79,
          strokeVolumeMl: 52.3,
          strokeVolumeIndexMlM2: 31.7,
          systemicVascularResistanceDynes: 1252,
          pulmonaryVascularResistanceWoodUnits: 0.87,
          cardiacPowerOutputWatts: 0.83,
          cardiacPowerIndexWattsM2: 0.50,
          pulmonaryArteryPulsatilityIndex: 1.78,
          leftVentricularStrokeWorkIndex: 29.3,
          rightVentricularStrokeWorkIndex: 3.5,
          transpulmonaryGradientMmHg: 4,
          diastolicPulmonaryGradientMmHg: -1,
          shockIndex: 0.85,
          modifiedShockIndex: 1.09
        },
        ecmoTelemetry: {
          pumpSpeedRpm: 0,
          bloodFlowLpm: 0,
          sweepGasFlowLpm: 0,
          sweepGasFiO2Percent: 21,
          preMembranePressureP1MmHg: 0,
          postMembranePressureP2MmHg: 0,
          transmembranePressureGradientMmHg: 0,
          venousDrainagePressureP3MmHg: 0,
          arterialBloodTemperatureCelsius: 37.1,
          venousOxygenSaturationSvO2Percent: 71,
          postOxygenatorPO2MmHg: 0,
          postOxygenatorPCO2MmHg: 0,
          rightRadialNativeSpO2Percent: 98,
          lowerExtremityEcmoSpO2Percent: 98,
          harlequinDeltaSpO2Percent: 0,
          distalPerfusionCatheterFlowMlMin: 0
        },
        microaxialTelemetry: {
          impellaPLevel: "P-8",
          impellaFlowLpm: 4.2,
          motorCurrentMilliamps: 890,
          purgePressureMmHg: 520,
          purgeFlowRateMlHr: 16.0,
          opticalPlacementSignalStatus: "VENTRICULAR_DISPLACEMENT", // DISPLACEMENT ALERT
          iabpAugmentationRatio: "STANDBY",
          iabpAugmentedDiastolicMmHg: 0
        },
        vasoactiveSupport: {
          epinephrineMcgKgMin: 0.02,
          norepinephrineMcgKgMin: 0.04,
          vasopressinUnitsMin: 0,
          dobutamineMcgKgMin: 0,
          milrinoneMcgKgMin: 0.375,
          dopamineMcgKgMin: 0,
          angiotensinIINgKgMin: 0,
          vasoactiveInotropicScore: 9.75
        },
        anticoagulationLabs: {
          activatedClottingTimeSeconds: 192,
          antiXaActivityIuMl: 0.42,
          unfractionatedHeparinUnitsHr: 950,
          bivalirudinMgKgHr: 0,
          fibrinogenMgDl: 290,
          freePlasmaHemoglobinMgDl: 54, // HEMOLYSIS ALERT
          lactateMmolL: 1.9,
          arterialPh: 7.41,
          arterialBaseExcessMeqL: 1.1,
          serumCreatinineMgDl: 1.1,
          plateletCountKUl: 178
        },
        alerts: [],
        lastUpdated: new Date().toISOString()
      },
      {
        id: "cardio-bed-05",
        mrn: "MRN-CTICU-9405",
        name: "Robert MacIntyre",
        age: 72,
        sex: "MALE",
        bedNumber: "CTICU-05",
        bodySurfaceAreaM2: 1.92,
        weightKg: 78,
        heightCm: 173,
        primaryDiagnosis: "Massive Acute Right Ventricular Infarction with Severe RV Failure on Impella RP",
        shockEtiology: "ACUTE_MYOCARDIAL_INFARCTION",
        scaiStage: "STAGE_C_CLASSIC",
        mcsDevice: "IMPELLA_RP",
        cannulation: "FEMORAL_INTERNAL_JUGULAR",
        hoursOnSupport: 44,
        dayInIcu: 2,
        attendingCardiologist: "Dr. Gregory Hayes, MD, FACC",
        primaryPerfusionist: "David Chen, CCP",
        hemodynamics: {
          heartRateBpm: 98,
          rhythmStatus: "SINUS",
          systolicBloodPressureMmHg: 96,
          diastolicBloodPressureMmHg: 62,
          meanArterialPressureMmHg: 73,
          pulsePressureMmHg: 34,
          centralVenousPressureMmHg: 18, // HIGH CVP
          pulmonaryArterySystolicMmHg: 30,
          pulmonaryArteryDiastolicMmHg: 16,
          pulmonaryArteryMeanMmHg: 21,
          pulmonaryCapillaryWedgePressureMmHg: 14,
          cardiacOutputLpm: 4.1,
          cardiacIndexLpmM2: 2.14,
          strokeVolumeMl: 41.8,
          strokeVolumeIndexMlM2: 21.8,
          systemicVascularResistanceDynes: 1073,
          pulmonaryVascularResistanceWoodUnits: 1.71,
          cardiacPowerOutputWatts: 0.66,
          cardiacPowerIndexWattsM2: 0.34,
          pulmonaryArteryPulsatilityIndex: 0.78, // LOW PAPI RV FAILURE
          leftVentricularStrokeWorkIndex: 17.5,
          rightVentricularStrokeWorkIndex: 0.9, // SEVERE LOW RVSWI
          transpulmonaryGradientMmHg: 7,
          diastolicPulmonaryGradientMmHg: 2,
          shockIndex: 1.02,
          modifiedShockIndex: 1.34
        },
        ecmoTelemetry: {
          pumpSpeedRpm: 0,
          bloodFlowLpm: 0,
          sweepGasFlowLpm: 0,
          sweepGasFiO2Percent: 21,
          preMembranePressureP1MmHg: 0,
          postMembranePressureP2MmHg: 0,
          transmembranePressureGradientMmHg: 0,
          venousDrainagePressureP3MmHg: 0,
          arterialBloodTemperatureCelsius: 36.9,
          venousOxygenSaturationSvO2Percent: 64,
          postOxygenatorPO2MmHg: 0,
          postOxygenatorPCO2MmHg: 0,
          rightRadialNativeSpO2Percent: 96,
          lowerExtremityEcmoSpO2Percent: 96,
          harlequinDeltaSpO2Percent: 0,
          distalPerfusionCatheterFlowMlMin: 0
        },
        microaxialTelemetry: {
          impellaPLevel: "P-7",
          impellaFlowLpm: 3.5,
          motorCurrentMilliamps: 680,
          purgePressureMmHg: 460,
          purgeFlowRateMlHr: 14.0,
          opticalPlacementSignalStatus: "CORRECT_AORTIC_VALVE",
          iabpAugmentationRatio: "STANDBY",
          iabpAugmentedDiastolicMmHg: 0
        },
        vasoactiveSupport: {
          epinephrineMcgKgMin: 0.03,
          norepinephrineMcgKgMin: 0.06,
          vasopressinUnitsMin: 0.02,
          dobutamineMcgKgMin: 3.0,
          milrinoneMcgKgMin: 0.25,
          dopamineMcgKgMin: 0,
          angiotensinIINgKgMin: 0,
          vasoactiveInotropicScore: 214.5
        },
        anticoagulationLabs: {
          activatedClottingTimeSeconds: 190,
          antiXaActivityIuMl: 0.40,
          unfractionatedHeparinUnitsHr: 1050,
          bivalirudinMgKgHr: 0,
          fibrinogenMgDl: 230,
          freePlasmaHemoglobinMgDl: 28,
          lactateMmolL: 3.1,
          arterialPh: 7.32,
          arterialBaseExcessMeqL: -4.0,
          serumCreatinineMgDl: 1.8,
          plateletCountKUl: 155
        },
        alerts: [],
        lastUpdated: new Date().toISOString()
      },
      {
        id: "cardio-bed-06",
        mrn: "MRN-CTICU-9406",
        name: "Vivian O'Connor",
        age: 63,
        sex: "FEMALE",
        bedNumber: "CTICU-06",
        bodySurfaceAreaM2: 1.80,
        weightKg: 70,
        heightCm: 168,
        primaryDiagnosis: "Ischemic Cardiomyopathy with Acute Decompensation on IABP Counterpulsation",
        shockEtiology: "ACUTE_DECOMPENSATED_HEART_FAILURE",
        scaiStage: "STAGE_B_BEGINNING",
        mcsDevice: "IABP",
        cannulation: "PERIPHERAL_FEMORAL_FEMORAL",
        hoursOnSupport: 18,
        dayInIcu: 1,
        attendingCardiologist: "Dr. Alistair Sterling, MD, FACC",
        primaryPerfusionist: "Elena Rostova, CCP",
        hemodynamics: {
          heartRateBpm: 84,
          rhythmStatus: "SINUS",
          systolicBloodPressureMmHg: 108,
          diastolicBloodPressureMmHg: 66,
          meanArterialPressureMmHg: 80,
          pulsePressureMmHg: 42,
          centralVenousPressureMmHg: 8,
          pulmonaryArterySystolicMmHg: 26,
          pulmonaryArteryDiastolicMmHg: 10,
          pulmonaryArteryMeanMmHg: 15,
          pulmonaryCapillaryWedgePressureMmHg: 11,
          cardiacOutputLpm: 5.0,
          cardiacIndexLpmM2: 2.78,
          strokeVolumeMl: 59.5,
          strokeVolumeIndexMlM2: 33.1,
          systemicVascularResistanceDynes: 1152,
          pulmonaryVascularResistanceWoodUnits: 0.80,
          cardiacPowerOutputWatts: 0.89,
          cardiacPowerIndexWattsM2: 0.49,
          pulmonaryArteryPulsatilityIndex: 2.00,
          leftVentricularStrokeWorkIndex: 31.0,
          rightVentricularStrokeWorkIndex: 3.2,
          transpulmonaryGradientMmHg: 4,
          diastolicPulmonaryGradientMmHg: -1,
          shockIndex: 0.78,
          modifiedShockIndex: 1.05
        },
        ecmoTelemetry: {
          pumpSpeedRpm: 0,
          bloodFlowLpm: 0,
          sweepGasFlowLpm: 0,
          sweepGasFiO2Percent: 21,
          preMembranePressureP1MmHg: 0,
          postMembranePressureP2MmHg: 0,
          transmembranePressureGradientMmHg: 0,
          venousDrainagePressureP3MmHg: 0,
          arterialBloodTemperatureCelsius: 37.0,
          venousOxygenSaturationSvO2Percent: 72,
          postOxygenatorPO2MmHg: 0,
          postOxygenatorPCO2MmHg: 0,
          rightRadialNativeSpO2Percent: 99,
          lowerExtremityEcmoSpO2Percent: 99,
          harlequinDeltaSpO2Percent: 0,
          distalPerfusionCatheterFlowMlMin: 0
        },
        microaxialTelemetry: {
          impellaPLevel: "NONE",
          impellaFlowLpm: 0,
          motorCurrentMilliamps: 0,
          purgePressureMmHg: 0,
          purgeFlowRateMlHr: 0,
          opticalPlacementSignalStatus: "CORRECT_AORTIC_VALVE",
          iabpAugmentationRatio: "1:1",
          iabpAugmentedDiastolicMmHg: 122
        },
        vasoactiveSupport: {
          epinephrineMcgKgMin: 0,
          norepinephrineMcgKgMin: 0.02,
          vasopressinUnitsMin: 0,
          dobutamineMcgKgMin: 2.5,
          milrinoneMcgKgMin: 0,
          dopamineMcgKgMin: 0,
          angiotensinIINgKgMin: 0,
          vasoactiveInotropicScore: 4.5
        },
        anticoagulationLabs: {
          activatedClottingTimeSeconds: 170,
          antiXaActivityIuMl: 0.32,
          unfractionatedHeparinUnitsHr: 800,
          bivalirudinMgKgHr: 0,
          fibrinogenMgDl: 260,
          freePlasmaHemoglobinMgDl: 8,
          lactateMmolL: 1.4,
          arterialPh: 7.42,
          arterialBaseExcessMeqL: 1.8,
          serumCreatinineMgDl: 1.0,
          plateletCountKUl: 210
        },
        alerts: [],
        lastUpdated: new Date().toISOString()
      },
      {
        id: "cardio-bed-07",
        mrn: "MRN-CTICU-9407",
        name: "Desmond Vance",
        age: 58,
        sex: "MALE",
        bedNumber: "CTICU-07",
        bodySurfaceAreaM2: 2.10,
        weightKg: 90,
        heightCm: 180,
        primaryDiagnosis: "Refractory Out-of-Hospital Cardiac Arrest with E-CPR Cannulation (VA-ECMO)",
        shockEtiology: "ACUTE_MYOCARDIAL_INFARCTION",
        scaiStage: "STAGE_E_EXTREMIS",
        mcsDevice: "VA_ECMO",
        cannulation: "PERIPHERAL_FEMORAL_FEMORAL",
        hoursOnSupport: 6,
        dayInIcu: 1,
        attendingCardiologist: "Dr. Fiona Vance, MD, FCCP",
        primaryPerfusionist: "David Chen, CCP",
        hemodynamics: {
          heartRateBpm: 125,
          rhythmStatus: "PACED_AV",
          systolicBloodPressureMmHg: 76,
          diastolicBloodPressureMmHg: 52,
          meanArterialPressureMmHg: 60,
          pulsePressureMmHg: 8, // CLOSED AORTIC VALVE
          centralVenousPressureMmHg: 16,
          pulmonaryArterySystolicMmHg: 42,
          pulmonaryArteryDiastolicMmHg: 26,
          pulmonaryArteryMeanMmHg: 31,
          pulmonaryCapillaryWedgePressureMmHg: 24, // HIGH WEDGE
          cardiacOutputLpm: 3.4,
          cardiacIndexLpmM2: 1.62,
          strokeVolumeMl: 27.2,
          strokeVolumeIndexMlM2: 13.0,
          systemicVascularResistanceDynes: 1035,
          pulmonaryVascularResistanceWoodUnits: 2.06,
          cardiacPowerOutputWatts: 0.45, // CRITICAL CPO
          cardiacPowerIndexWattsM2: 0.21,
          pulmonaryArteryPulsatilityIndex: 1.00,
          leftVentricularStrokeWorkIndex: 6.4,
          rightVentricularStrokeWorkIndex: 2.7,
          transpulmonaryGradientMmHg: 7,
          diastolicPulmonaryGradientMmHg: 2,
          shockIndex: 1.64,
          modifiedShockIndex: 2.08
        },
        ecmoTelemetry: {
          pumpSpeedRpm: 4400,
          bloodFlowLpm: 4.8,
          sweepGasFlowLpm: 5.5,
          sweepGasFiO2Percent: 100,
          preMembranePressureP1MmHg: 245,
          postMembranePressureP2MmHg: 205,
          transmembranePressureGradientMmHg: 40,
          venousDrainagePressureP3MmHg: -72,
          arterialBloodTemperatureCelsius: 34.0, // TARGET TEMPERATURE MANAGEMENT 34C
          venousOxygenSaturationSvO2Percent: 59,
          postOxygenatorPO2MmHg: 410,
          postOxygenatorPCO2MmHg: 36,
          rightRadialNativeSpO2Percent: 88,
          lowerExtremityEcmoSpO2Percent: 100,
          harlequinDeltaSpO2Percent: 12,
          distalPerfusionCatheterFlowMlMin: 140
        },
        microaxialTelemetry: {
          impellaPLevel: "NONE",
          impellaFlowLpm: 0,
          motorCurrentMilliamps: 0,
          purgePressureMmHg: 0,
          purgeFlowRateMlHr: 0,
          opticalPlacementSignalStatus: "CORRECT_AORTIC_VALVE",
          iabpAugmentationRatio: "STANDBY",
          iabpAugmentedDiastolicMmHg: 0
        },
        vasoactiveSupport: {
          epinephrineMcgKgMin: 0.12,
          norepinephrineMcgKgMin: 0.20,
          vasopressinUnitsMin: 0.04,
          dobutamineMcgKgMin: 5.0,
          milrinoneMcgKgMin: 0,
          dopamineMcgKgMin: 0,
          angiotensinIINgKgMin: 0,
          vasoactiveInotropicScore: 437.0
        },
        anticoagulationLabs: {
          activatedClottingTimeSeconds: 225,
          antiXaActivityIuMl: 0.58,
          unfractionatedHeparinUnitsHr: 1400,
          bivalirudinMgKgHr: 0,
          fibrinogenMgDl: 160,
          freePlasmaHemoglobinMgDl: 38,
          lactateMmolL: 7.8, // SEVERE SHOCK COLLAPSE
          arterialPh: 7.15,
          arterialBaseExcessMeqL: -11.4,
          serumCreatinineMgDl: 2.6,
          plateletCountKUl: 98
        },
        alerts: [],
        lastUpdated: new Date().toISOString()
      },
      {
        id: "cardio-bed-08",
        mrn: "MRN-CTICU-9408",
        name: "Lydia Montgomery",
        age: 41,
        sex: "FEMALE",
        bedNumber: "CTICU-08",
        bodySurfaceAreaM2: 1.84,
        weightKg: 72,
        heightCm: 170,
        primaryDiagnosis: "Post-Partum Cardiomyopathy on HeartMate 3 LVAD (Bridge to Decision)",
        shockEtiology: "ACUTE_DECOMPENSATED_HEART_FAILURE",
        scaiStage: "STAGE_B_BEGINNING",
        mcsDevice: "HEARTMATE_3_LVAD",
        cannulation: "CENTRAL_AORTIC_RIGHT_ATRIAL",
        hoursOnSupport: 240,
        dayInIcu: 10,
        attendingCardiologist: "Dr. Gregory Hayes, MD, FACC",
        primaryPerfusionist: "Sarah Jenkins, CCP",
        hemodynamics: {
          heartRateBpm: 78,
          rhythmStatus: "SINUS",
          systolicBloodPressureMmHg: 102,
          diastolicBloodPressureMmHg: 76,
          meanArterialPressureMmHg: 85,
          pulsePressureMmHg: 26,
          centralVenousPressureMmHg: 7,
          pulmonaryArterySystolicMmHg: 24,
          pulmonaryArteryDiastolicMmHg: 10,
          pulmonaryArteryMeanMmHg: 15,
          pulmonaryCapillaryWedgePressureMmHg: 10,
          cardiacOutputLpm: 5.2,
          cardiacIndexLpmM2: 2.83,
          strokeVolumeMl: 66.7,
          strokeVolumeIndexMlM2: 36.2,
          systemicVascularResistanceDynes: 1200,
          pulmonaryVascularResistanceWoodUnits: 0.96,
          cardiacPowerOutputWatts: 0.98,
          cardiacPowerIndexWattsM2: 0.53,
          pulmonaryArteryPulsatilityIndex: 2.00,
          leftVentricularStrokeWorkIndex: 36.9,
          rightVentricularStrokeWorkIndex: 3.9,
          transpulmonaryGradientMmHg: 5,
          diastolicPulmonaryGradientMmHg: 0,
          shockIndex: 0.76,
          modifiedShockIndex: 0.92
        },
        ecmoTelemetry: {
          pumpSpeedRpm: 0,
          bloodFlowLpm: 0,
          sweepGasFlowLpm: 0,
          sweepGasFiO2Percent: 21,
          preMembranePressureP1MmHg: 0,
          postMembranePressureP2MmHg: 0,
          transmembranePressureGradientMmHg: 0,
          venousDrainagePressureP3MmHg: 0,
          arterialBloodTemperatureCelsius: 37.0,
          venousOxygenSaturationSvO2Percent: 73,
          postOxygenatorPO2MmHg: 0,
          postOxygenatorPCO2MmHg: 0,
          rightRadialNativeSpO2Percent: 99,
          lowerExtremityEcmoSpO2Percent: 99,
          harlequinDeltaSpO2Percent: 0,
          distalPerfusionCatheterFlowMlMin: 0
        },
        microaxialTelemetry: {
          impellaPLevel: "NONE",
          impellaFlowLpm: 5.1, // LVAD FLOW
          motorCurrentMilliamps: 520,
          purgePressureMmHg: 0,
          purgeFlowRateMlHr: 0,
          opticalPlacementSignalStatus: "CORRECT_AORTIC_VALVE",
          iabpAugmentationRatio: "STANDBY",
          iabpAugmentedDiastolicMmHg: 0
        },
        vasoactiveSupport: {
          epinephrineMcgKgMin: 0,
          norepinephrineMcgKgMin: 0,
          vasopressinUnitsMin: 0,
          dobutamineMcgKgMin: 0,
          milrinoneMcgKgMin: 0.125,
          dopamineMcgKgMin: 0,
          angiotensinIINgKgMin: 0,
          vasoactiveInotropicScore: 1.25
        },
        anticoagulationLabs: {
          activatedClottingTimeSeconds: 165,
          antiXaActivityIuMl: 0.35,
          unfractionatedHeparinUnitsHr: 750,
          bivalirudinMgKgHr: 0,
          fibrinogenMgDl: 280,
          freePlasmaHemoglobinMgDl: 6,
          lactateMmolL: 1.1,
          arterialPh: 7.44,
          arterialBaseExcessMeqL: 2.2,
          serumCreatinineMgDl: 0.8,
          plateletCountKUl: 240
        },
        alerts: [],
        lastUpdated: new Date().toISOString()
      }
    ];

    // Evaluate alerts for all mock patients initially
    return raw.map((pt) => ({
      ...pt,
      alerts: CardiovascularTelemetryService.evaluateCardioAlerts(pt)
    }));
  }

  // ==========================================
  // HL7 FHIR R4 & CSV EXPORTERS
  // ==========================================

  public static exportToFhirR4Bundle(patient: CardioPatient): object {
    return {
      resourceType: "Bundle",
      id: `bundle-cardio-hemodynamics-${patient.id}-${Date.now()}`,
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: `urn:uuid:patient-${patient.id}`,
          resource: {
            resourceType: "Patient",
            id: patient.id,
            identifier: [
              {
                system: "urn:oid:medtrack:cardio:mrn",
                value: patient.mrn
              }
            ],
            name: [{ text: patient.name }],
            gender: patient.sex.toLowerCase(),
            extension: [
              { url: "http://hl7.org/fhir/StructureDefinition/body-weight", valueQuantity: { value: patient.weightKg, unit: "kg" } },
              { url: "http://hl7.org/fhir/StructureDefinition/body-height", valueQuantity: { value: patient.heightCm, unit: "cm" } },
              { url: "http://hl7.org/fhir/StructureDefinition/body-surface-area", valueQuantity: { value: patient.bodySurfaceAreaM2, unit: "m2" } }
            ]
          }
        },
        {
          fullUrl: `urn:uuid:device-${patient.id}`,
          resource: {
            resourceType: "Device",
            id: `device-mcs-${patient.id}`,
            type: {
              coding: [
                {
                  system: "http://snomed.info/sct",
                  code: "233169004",
                  display: patient.mcsDevice
                }
              ]
            },
            status: "active",
            patient: { reference: `urn:uuid:patient-${patient.id}` }
          }
        },
        {
          fullUrl: `urn:uuid:observation-cpo-${patient.id}`,
          resource: {
            resourceType: "Observation",
            id: `obs-cpo-${patient.id}`,
            status: "final",
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "96580-6",
                  display: "Cardiac Power Output"
                }
              ]
            },
            subject: { reference: `urn:uuid:patient-${patient.id}` },
            valueQuantity: {
              value: patient.hemodynamics.cardiacPowerOutputWatts,
              unit: "W",
              system: "http://unitsofmeasure.org",
              code: "W"
            }
          }
        },
        {
          fullUrl: `urn:uuid:observation-map-${patient.id}`,
          resource: {
            resourceType: "Observation",
            id: `obs-map-${patient.id}`,
            status: "final",
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "8478-0",
                  display: "Mean Arterial Pressure"
                }
              ]
            },
            subject: { reference: `urn:uuid:patient-${patient.id}` },
            valueQuantity: {
              value: patient.hemodynamics.meanArterialPressureMmHg,
              unit: "mmHg",
              system: "http://unitsofmeasure.org",
              code: "mm[Hg]"
            }
          }
        },
        {
          fullUrl: `urn:uuid:observation-ci-${patient.id}`,
          resource: {
            resourceType: "Observation",
            id: `obs-ci-${patient.id}`,
            status: "final",
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "60838-0",
                  display: "Cardiac Index by Thermodilution"
                }
              ]
            },
            subject: { reference: `urn:uuid:patient-${patient.id}` },
            valueQuantity: {
              value: patient.hemodynamics.cardiacIndexLpmM2,
              unit: "L/min/m2",
              system: "http://unitsofmeasure.org",
              code: "L/(min.m2)"
            }
          }
        },
        {
          fullUrl: `urn:uuid:observation-lactate-${patient.id}`,
          resource: {
            resourceType: "Observation",
            id: `obs-lactate-${patient.id}`,
            status: "final",
            code: {
              coding: [
                {
                  system: "http://loinc.org",
                  code: "2524-7",
                  display: "Lactate [Moles/volume] in Blood"
                }
              ]
            },
            subject: { reference: `urn:uuid:patient-${patient.id}` },
            valueQuantity: {
              value: patient.anticoagulationLabs.lactateMmolL,
              unit: "mmol/L",
              system: "http://unitsofmeasure.org",
              code: "mmol/L"
            }
          }
        }
      ]
    };
  }

  public static exportToCsv(patient: CardioPatient): string {
    const headers = [
      "Patient ID",
      "MRN",
      "Name",
      "Bed",
      "Age",
      "Sex",
      "Diagnosis",
      "Shock Etiology",
      "SCAI Stage",
      "MCS Device",
      "HR (bpm)",
      "SBP (mmHg)",
      "DBP (mmHg)",
      "MAP (mmHg)",
      "CVP (mmHg)",
      "mPAP (mmHg)",
      "PCWP (mmHg)",
      "CO (L/min)",
      "CI (L/min/m2)",
      "CPO (Watts)",
      "SVR (dynes)",
      "PVR (Wood Units)",
      "PAPi",
      "ECMO Flow (L/min)",
      "ECMO RPM",
      "TMP (mmHg)",
      "P3 Pressure (mmHg)",
      "Harlequin Delta (%)",
      "VIS Score",
      "Lactate (mmol/L)",
      "ACT (sec)",
      "Free Plasma Hb (mg/dL)"
    ];

    const row = [
      patient.id,
      patient.mrn,
      `"${patient.name}"`,
      patient.bedNumber,
      patient.age,
      patient.sex,
      `"${patient.primaryDiagnosis}"`,
      patient.shockEtiology,
      patient.scaiStage,
      patient.mcsDevice,
      patient.hemodynamics.heartRateBpm,
      patient.hemodynamics.systolicBloodPressureMmHg,
      patient.hemodynamics.diastolicBloodPressureMmHg,
      patient.hemodynamics.meanArterialPressureMmHg,
      patient.hemodynamics.centralVenousPressureMmHg,
      patient.hemodynamics.pulmonaryArteryMeanMmHg,
      patient.hemodynamics.pulmonaryCapillaryWedgePressureMmHg,
      patient.hemodynamics.cardiacOutputLpm,
      patient.hemodynamics.cardiacIndexLpmM2,
      patient.hemodynamics.cardiacPowerOutputWatts,
      patient.hemodynamics.systemicVascularResistanceDynes,
      patient.hemodynamics.pulmonaryVascularResistanceWoodUnits,
      patient.hemodynamics.pulmonaryArteryPulsatilityIndex,
      patient.ecmoTelemetry?.bloodFlowLpm || 0,
      patient.ecmoTelemetry?.pumpSpeedRpm || 0,
      patient.ecmoTelemetry?.transmembranePressureGradientMmHg || 0,
      patient.ecmoTelemetry?.venousDrainagePressureP3MmHg || 0,
      patient.ecmoTelemetry?.harlequinDeltaSpO2Percent || 0,
      patient.vasoactiveSupport?.vasoactiveInotropicScore || 0,
      patient.anticoagulationLabs.lactateMmolL,
      patient.anticoagulationLabs.activatedClottingTimeSeconds,
      patient.anticoagulationLabs.freePlasmaHemoglobinMgDl
    ];

    return `${headers.join(",")}\n${row.join(",")}`;
  }
}
