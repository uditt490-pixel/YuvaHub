import {
  PicuPatient,
  PicuCensusOverview,
  PediatricAgeGroup,
  PicuUnitCareLevel,
  PediatricVentilationMode,
  BroselowColorCode,
  PalsResuscitationDosing,
  PediatricPewsScore,
  OxygenationIndexPalicc,
  NeonatalMetabolicGir,
  PicuAlert
} from "../types/picuTelemetry";

export class PicuTelemetryService {
  private static instance: PicuTelemetryService;
  private patients: PicuPatient[] = [];
  private listeners: Array<(patients: PicuPatient[]) => void> = [];
  private timer: any = null;

  private constructor() {
    this.initializePatients();
    this.startStreamingSimulator();
  }

  public static getInstance(): PicuTelemetryService {
    if (!PicuTelemetryService.instance) {
      PicuTelemetryService.instance = new PicuTelemetryService();
    }
    return PicuTelemetryService.instance;
  }

  // =========================================================================
  // CLINICAL CALCULATION ENGINES
  // =========================================================================

  /**
   * Pediatric Advanced Life Support (PALS) Weight/Age-Stratified Dosing Calculator
   * Follows AHA / AAP 2020 Guidelines & Broselow Pediatric Tape Standards.
   */
  public static calculatePalsDosing(weightKg: number, ageYears: number): PalsResuscitationDosing {
    const w = weightKg > 0 ? weightKg : 10.0;
    const age = Math.max(0, ageYears);

    // Broselow Color Staging
    let color: BroselowColorCode = "GREY_3_5KG";
    if (w < 3.0) color = "PINK_PREEMIE_UNDER_3KG";
    else if (w <= 5.5) color = "GREY_3_5KG";
    else if (w <= 7.5) color = "PINK_6_7KG";
    else if (w <= 9.5) color = "RED_8_9KG";
    else if (w <= 11.5) color = "PURPLE_10_11KG";
    else if (w <= 14.5) color = "YELLOW_12_14KG";
    else if (w <= 18.5) color = "WHITE_15_18KG";
    else if (w <= 23.5) color = "BLUE_19_23KG";
    else if (w <= 29.5) color = "ORANGE_24_29KG";
    else if (w <= 36.0) color = "GREEN_30_36KG";
    else color = "ADULT_OVER_36KG";

    // Standard PALS Formulas
    const epiIvIo = Math.round(w * 0.01 * 1000) / 1000; // 0.01 mg/kg
    const epiEtt = Math.round(w * 0.1 * 100) / 100; // 0.1 mg/kg
    const amiodarone = Math.min(300, Math.round(w * 5.0 * 10) / 10); // 5 mg/kg
    const atropine = Math.max(0.1, Math.min(0.5, Math.round(w * 0.02 * 100) / 100)); // 0.02 mg/kg (min 0.1)
    const adenosine1 = Math.min(6.0, Math.round(w * 0.1 * 10) / 10); // 0.1 mg/kg (max 6mg)
    const adenosine2 = Math.min(12.0, Math.round(w * 0.2 * 10) / 10); // 0.2 mg/kg (max 12mg)
    const caGluconate = Math.round(w * 0.6 * 10) / 10; // 0.6 mL/kg of 10%
    const bicarb = Math.round(w * 1.0 * 10) / 10; // 1 mEq/kg
    const d10w = Math.round(w * 2.0 * 10) / 10; // 2 mL/kg
    const bolus10 = Math.round(w * 10.0);
    const bolus20 = Math.round(w * 20.0);

    const defibInit = Math.round(w * 2.0); // 2 J/kg
    const defibSub = Math.round(w * 4.0); // 4 J/kg
    const cardioversion = Math.round(w * 1.0); // 1 J/kg

    // Airway sizing formulas
    const ettCuffed = age > 0 ? Math.round(((age / 4) + 3.5) * 10) / 10 : (w < 1.0 ? 2.5 : w < 2.0 ? 3.0 : 3.5);
    const ettUncuffed = age > 0 ? Math.round(((age / 4) + 4.0) * 10) / 10 : (w < 1.0 ? 2.5 : w < 2.0 ? 3.0 : 3.5);
    const ettDepth = age > 0 ? Math.round(((age / 2) + 12) * 10) / 10 : Math.round((ettCuffed * 3) * 10) / 10;

    return {
      broselowColor: color,
      estimatedWeightKg: w,
      epinephrineIvIoBolusMg: epiIvIo,
      epinephrineEttBolusMg: epiEtt,
      amiodaroneBolusMg: amiodarone,
      atropineBolusMg: atropine,
      adenosineFirstDoseMg: adenosine1,
      adenosineSecondDoseMg: adenosine2,
      calciumGluconate10PercentMl: caGluconate,
      sodiumBicarbonateMeq: bicarb,
      d10WFluidBolusMl: d10w,
      isotonicSalineBolus10MlKg: bolus10,
      isotonicSalineBolus20MlKg: bolus20,
      defibrillationInitialJoules: defibInit,
      defibrillationSubsequentJoules: defibSub,
      synchronizedCardioversionInitialJoules: cardioversion,
      ettInternalDiameterCuffedMm: ettCuffed,
      ettInternalDiameterUncuffedMm: ettUncuffed,
      ettLipInsertionDepthCm: ettDepth
    };
  }

  /**
   * Pediatric Early Warning Score (PEWS) Multi-Dimensional Engine
   * Validated score evaluating Behavior, Cardiovascular, Respiratory, and Modifiers.
   */
  public static calculatePews(
    behavior: number,
    cardiovascular: number,
    respiratory: number,
    extraNeb: number,
    extraEmesis: number
  ): PediatricPewsScore {
    const b = Math.max(0, Math.min(3, behavior));
    const cv = Math.max(0, Math.min(3, cardiovascular));
    const r = Math.max(0, Math.min(3, respiratory));
    const neb = extraNeb || 0;
    const emesis = extraEmesis || 0;

    const total = b + cv + r + neb + emesis;

    let category: PediatricPewsScore["pewsRiskCategory"] = "LOW_ROUTINE";
    if (total >= 7) category = "CRITICAL_STAT_PICU_CODE";
    else if (total >= 5) category = "HIGH_RAPID_RESPONSE";
    else if (total >= 3) category = "MEDIUM_INCREASED_MONITORING";

    return {
      behaviorScore: b,
      cardiovascularScore: cv,
      respiratoryScore: r,
      extraPointsNebulizer: neb,
      extraPointsPersistentEmesis: emesis,
      totalPewsScore: total,
      pewsRiskCategory: category
    };
  }

  /**
   * Pediatric Acute Respiratory Distress Syndrome (PARDS) & PALICC Oxygenation Index
   * Formula: OI = (Mean Airway Pressure Paw * FiO2 * 100) / PaO2
   * Formula: OSI = (Mean Airway Pressure Paw * FiO2 * 100) / SpO2
   */
  public static calculateOxygenationIndex(
    pawMmHg: number,
    fiO2: number,
    paO2: number,
    spO2: number
  ): OxygenationIndexPalicc {
    const paw = Math.max(1, pawMmHg);
    const f = Math.max(0.21, Math.min(1.0, fiO2));
    const pa = paO2 > 0 ? paO2 : 75;
    const sat = spO2 > 0 ? spO2 : 95;

    const oi = Math.round(((paw * f * 100) / pa) * 10) / 10;
    const osi = Math.round(((paw * f * 100) / sat) * 10) / 10;

    let pards: OxygenationIndexPalicc["pardsClassification"] = "NO_PARDS";
    if (oi >= 16.0) pards = "SEVERE_PARDS_OI_OVER_16";
    else if (oi >= 8.0) pards = "MODERATE_PARDS_OI_8_16";
    else if (oi >= 4.0) pards = "MILD_PARDS_OI_4_8";

    const isEcmo = oi >= 40.0;

    return {
      meanAirwayPressurePawMmHg: paw,
      fractionOfInspiredOxygenFiO2: f,
      partialPressureOxygenPaO2: pa,
      oxygenSaturationSpO2: sat,
      oxygenationIndexOI: oi,
      oxygenSaturationIndexOSI: osi,
      pardsClassification: pards,
      isEcmoEvaluationTriggered: isEcmo
    };
  }

  /**
   * Neonatal Glucose Infusion Rate (GIR) Engine
   * Formula: GIR (mg/kg/min) = (IV Rate mL/hr * Dextrose Concentration %) / (Weight kg * 6)
   */
  public static calculateGir(ivRateMlHr: number, dextrosePct: number, weightKg: number): number {
    const rate = Math.max(0, ivRateMlHr);
    const dex = Math.max(0, dextrosePct);
    const w = weightKg > 0 ? weightKg : 1.0;
    const gir = (rate * dex) / (w * 6);
    return Math.round(gir * 10) / 10;
  }

  /**
   * Pre-Ductal (Right Hand) vs Post-Ductal (Foot) SpO2 Gradient Evaluator
   * Gradient >= 5% indicates right-to-left ductal shunting (PPHN / Critical Congenital Heart Disease).
   */
  public static evaluateDuctalGradient(preDuctalSpO2: number, postDuctalSpO2: number): {
    delta: number;
    isPphnSuspected: boolean;
    recommendation: string;
  } {
    const delta = Math.round(Math.max(0, preDuctalSpO2 - postDuctalSpO2));
    const isPphn = delta >= 5;

    let recommendation = "Pre/Post ductal gradient within physiological limits (no significant ductal shunting).";
    if (isPphn) {
      recommendation = "CRITICAL: Pre/Post ductal SpO2 delta >= 5% detected. High suspicion for Persistent Pulmonary Hypertension of the Neonate (PPHN) or Ductal-Dependent Cardiac Anomaly. Order STAT Echocardiogram and prepare Inhaled Nitric Oxide (iNO 20 ppm).";
    }

    return { delta, isPphnSuspected: isPphn, recommendation };
  }

  // =========================================================================
  // STREAMING SIMULATOR & PATIENT INITIALIZATION
  // =========================================================================

  private initializePatients(): void {
    this.patients = [
      {
        id: "PICU-301",
        mrn: "MRN-1092831",
        name: "Baby Boy Liam",
        gestationalAgeWeeks: 26.2,
        chronologicalAgeDays: 4,
        ageGroup: "EXTREME_PRETERM_UNDER_28W",
        gender: "MALE",
        birthWeightGrams: 820,
        currentWeightKg: 0.84,
        lengthHeightCm: 32.5,
        headCircumferenceCm: 23.0,
        careUnit: "NICU_LEVEL_IV_QUATERNARY",
        bedIsoletteNumber: "NICU-ISOLETTE-01 (STAT HFOV)",
        admissionDate: "2026-08-21 02:15",
        primaryDiagnosis: "Extreme Prematurity (26w) with Severe Respiratory Distress Syndrome (RDS) & PPHN",
        attendingPediatrician: "Dr. Genevieve Sterling, MD, FAAP",
        leadPicuNurse: "Rachel Adams, BSN, RNC-NIC",
        ventilationMode: "HFOV_HIGH_FREQUENCY_OSCILLATORY",
        vitals: {
          heartRate: 162,
          systolicBp: 48,
          diastolicBp: 26,
          meanArterialPressure: 33,
          respiratoryRate: 45,
          spO2PreDuctalRightHandPercent: 92,
          spO2PostDuctalFootPercent: 83,
          prePostDuctalSpO2Delta: 9,
          endTidalCo2MmHg: 42,
          coreTemperatureCelsius: 36.8,
          peripheralSkinTemperatureCelsius: 35.6,
          centralPeripheralTempDelta: 1.2,
          perfusionIndexPI: 1.1,
          capillaryRefillTimeSeconds: 2.2
        },
        incubator: {
          isIncubatorActive: true,
          incubatorMode: "SERVO_SKIN_CONTROL",
          chamberAirTemperatureCelsius: 35.2,
          chamberHumidityPercentage: 80,
          skinServoTemperatureTargetCelsius: 36.8,
          heaterPowerOutputPercentage: 42,
          ambientNoiseLevelDba: 38,
          transcutaneousBilirubinTcBMgDl: 7.4,
          phototherapyActive: true,
          phototherapyIrradianceUWCm2Nm: 35
        },
        palsDosing: PicuTelemetryService.calculatePalsDosing(0.84, 0),
        pews: PicuTelemetryService.calculatePews(2, 2, 2, 0, 0),
        oxygenation: PicuTelemetryService.calculateOxygenationIndex(14.0, 0.60, 52, 92),
        metabolic: {
          glucoseInfusionRateMgKgMin: 6.2,
          dextroseConcentrationPercent: 12.5,
          totalIvFluidRateMlKgDay: 130,
          serumGlucoseMgDl: 72,
          bloodGasPh: 7.31,
          baseDeficitMeqL: -4.5,
          serumLactateMmolL: 2.4,
          serumIonizedCalciumMmolL: 1.15
        },
        activeAlerts: [
          {
            id: "ALT-301-1",
            patientId: "PICU-301",
            timestamp: "12 min ago",
            severity: "HIGH_WARNING",
            category: "PPHN_DUCTAL_SHUNT",
            title: "Significant Pre/Post Ductal SpO2 Gradient (9% Delta)",
            triggerMeasurement: "Pre-Ductal 92% (Rt Hand) vs Post-Ductal 83% (Foot)",
            expectedRange: "Pre/Post Delta < 5%",
            clinicalRationale: "Suprasystemic pulmonary vascular resistance causing right-to-left ductal shunting.",
            suggestedAction: "Titrate Inhaled Nitric Oxide (iNO) to 20 ppm; confirm ductal patency with bedside ECHO.",
            acknowledged: false
          }
        ],
        resuscitationTimeline: [
          {
            timestamp: "2026-08-21 03:00",
            event: "Surfactant (Curosurf 200 mg/kg) administered via ETT.",
            intervention: "Intratracheal Surfactant",
            provider: "Dr. Genevieve Sterling, MD"
          },
          {
            timestamp: "2026-08-22 10:00",
            event: "Transitioned to HFOV for refractory hypercapnia.",
            intervention: "HFOV 12 Hz / Amplitude 28",
            provider: "Rachel Adams, BSN"
          }
        ]
      },
      {
        id: "PICU-302",
        mrn: "MRN-2291048",
        name: "Sophia Rodriguez",
        ageGroup: "YOUNG_CHILD_4_7Y",
        gestationalAgeWeeks: 39.5,
        chronologicalAgeDays: 1460, // 4 years
        gender: "FEMALE",
        birthWeightGrams: 3400,
        currentWeightKg: 16.5,
        lengthHeightCm: 104.0,
        headCircumferenceCm: 50.5,
        careUnit: "PICU_MEDICAL_SURGICAL",
        bedIsoletteNumber: "PICU-BED-04 (STAT RESUS)",
        admissionDate: "2026-08-24 16:30",
        primaryDiagnosis: "Meningococcal Septic Shock with Purpura Fulminans & Severe Hypotension",
        attendingPediatrician: "Dr. Tariq Al-Mansoor, MD, FAAP",
        leadPicuNurse: "Michael Chang, BSN, CPN",
        ventilationMode: "CONVENTIONAL_PRVC_PRESSURE_REGULATED",
        vitals: {
          heartRate: 168,
          systolicBp: 72,
          diastolicBp: 38,
          meanArterialPressure: 49,
          respiratoryRate: 34,
          spO2PreDuctalRightHandPercent: 94,
          spO2PostDuctalFootPercent: 93,
          prePostDuctalSpO2Delta: 1,
          endTidalCo2MmHg: 28,
          coreTemperatureCelsius: 39.4,
          peripheralSkinTemperatureCelsius: 34.2,
          centralPeripheralTempDelta: 5.2,
          perfusionIndexPI: 0.6,
          capillaryRefillTimeSeconds: 4.5
        },
        incubator: {
          isIncubatorActive: false,
          incubatorMode: "CRIB_STANDARD",
          chamberAirTemperatureCelsius: 22.0,
          chamberHumidityPercentage: 45,
          skinServoTemperatureTargetCelsius: 37.0,
          heaterPowerOutputPercentage: 0,
          ambientNoiseLevelDba: 42,
          transcutaneousBilirubinTcBMgDl: 0.8,
          phototherapyActive: false,
          phototherapyIrradianceUWCm2Nm: 0
        },
        palsDosing: PicuTelemetryService.calculatePalsDosing(16.5, 4),
        pews: PicuTelemetryService.calculatePews(3, 3, 2, 0, 0),
        oxygenation: PicuTelemetryService.calculateOxygenationIndex(12.0, 0.50, 78, 94),
        metabolic: {
          glucoseInfusionRateMgKgMin: 4.5,
          dextroseConcentrationPercent: 10.0,
          totalIvFluidRateMlKgDay: 80,
          serumGlucoseMgDl: 58,
          bloodGasPh: 7.18,
          baseDeficitMeqL: -11.2,
          serumLactateMmolL: 5.8,
          serumIonizedCalciumMmolL: 0.98
        },
        activeAlerts: [
          {
            id: "ALT-302-1",
            patientId: "PICU-302",
            timestamp: "5 min ago",
            severity: "CRITICAL_STAT",
            category: "HIGH_PEWS_DETERIORATION",
            title: "CRITICAL PEWS 8 / DECOMPENSATED SEPTIC SHOCK",
            triggerMeasurement: "PEWS 8/13 • MAP 49 mmHg (Ref: 60-80) • Lactate 5.8 mmol/L",
            expectedRange: "PEWS < 3 • MAP > 60 mmHg",
            clinicalRationale: "Severe peripheral vasoconstriction, warm-to-cold shock transition, and capillary refill > 4 sec.",
            suggestedAction: "STAT 20 mL/kg Isotonic Saline Bolus (330 mL) + Epinephrine/Norepinephrine Infusion via CVC + IV Ceftriaxone/Vancomycin.",
            acknowledged: false
          }
        ],
        resuscitationTimeline: [
          {
            timestamp: "2026-08-24 16:45",
            event: "First 20 mL/kg Saline bolus infused over 15 min.",
            intervention: "330 mL 0.9% Normal Saline",
            provider: "Michael Chang, BSN"
          }
        ]
      },
      {
        id: "PICU-303",
        mrn: "MRN-3382910",
        name: "Lucas Tremblay",
        ageGroup: "INFANT_1_12M",
        gestationalAgeWeeks: 38.0,
        chronologicalAgeDays: 240, // 8 months
        gender: "MALE",
        birthWeightGrams: 3100,
        currentWeightKg: 8.2,
        lengthHeightCm: 71.0,
        headCircumferenceCm: 44.2,
        careUnit: "PICU_MEDICAL_SURGICAL",
        bedIsoletteNumber: "PICU-BED-02",
        admissionDate: "2026-08-23 08:40",
        primaryDiagnosis: "Severe RSV Bronchiolitis with Pediatric ARDS (PARDS) on Mechanical Ventilation",
        attendingPediatrician: "Dr. Genevieve Sterling, MD, FAAP",
        leadPicuNurse: "Rachel Adams, BSN, RNC-NIC",
        ventilationMode: "CONVENTIONAL_PRVC_PRESSURE_REGULATED",
        vitals: {
          heartRate: 142,
          systolicBp: 86,
          diastolicBp: 48,
          meanArterialPressure: 61,
          respiratoryRate: 42,
          spO2PreDuctalRightHandPercent: 89,
          spO2PostDuctalFootPercent: 89,
          prePostDuctalSpO2Delta: 0,
          endTidalCo2MmHg: 56,
          coreTemperatureCelsius: 38.6,
          peripheralSkinTemperatureCelsius: 37.0,
          centralPeripheralTempDelta: 1.6,
          perfusionIndexPI: 2.4,
          capillaryRefillTimeSeconds: 2.0
        },
        incubator: {
          isIncubatorActive: false,
          incubatorMode: "CRIB_STANDARD",
          chamberAirTemperatureCelsius: 23.0,
          chamberHumidityPercentage: 50,
          skinServoTemperatureTargetCelsius: 37.0,
          heaterPowerOutputPercentage: 0,
          ambientNoiseLevelDba: 40,
          transcutaneousBilirubinTcBMgDl: 0.5,
          phototherapyActive: false,
          phototherapyIrradianceUWCm2Nm: 0
        },
        palsDosing: PicuTelemetryService.calculatePalsDosing(8.2, 0.66),
        pews: PicuTelemetryService.calculatePews(1, 1, 3, 2, 0),
        oxygenation: PicuTelemetryService.calculateOxygenationIndex(16.0, 0.70, 58, 89),
        metabolic: {
          glucoseInfusionRateMgKgMin: 5.0,
          dextroseConcentrationPercent: 10.0,
          totalIvFluidRateMlKgDay: 90,
          serumGlucoseMgDl: 88,
          bloodGasPh: 7.24,
          baseDeficitMeqL: -5.0,
          serumLactateMmolL: 2.1,
          serumIonizedCalciumMmolL: 1.18
        },
        activeAlerts: [
          {
            id: "ALT-303-1",
            patientId: "PICU-303",
            timestamp: "20 min ago",
            severity: "HIGH_WARNING",
            category: "SEVERE_PARDS_OI",
            title: "Severe PARDS by PALICC Criteria (OI 19.3)",
            triggerMeasurement: "Oxygenation Index 19.3 (Severe > 16) • FiO2 0.70 • Paw 16 mmHg",
            expectedRange: "OI < 4 (No PARDS)",
            clinicalRationale: "Extensive small airway plugging and alveolar collapse from RSV viral pneumonitis.",
            suggestedAction: "Optimize PEEP to 10-12 cmH2O; evaluate prone positioning or transition to HFOV.",
            acknowledged: true,
            acknowledgedBy: "Dr. Genevieve Sterling, MD",
            acknowledgedTimestamp: "15 min ago"
          }
        ],
        resuscitationTimeline: [
          {
            timestamp: "2026-08-23 10:00",
            event: "Endotracheal intubation (4.0 cuffed ETT at 11cm).",
            intervention: "ETT 4.0 Cuffed",
            provider: "Dr. Genevieve Sterling, MD"
          }
        ]
      },
      {
        id: "PICU-304",
        mrn: "MRN-4491028",
        name: "Noah Sterling",
        ageGroup: "FULL_TERM_NEONATE_0_28D",
        gestationalAgeWeeks: 39.0,
        chronologicalAgeDays: 3,
        gender: "MALE",
        birthWeightGrams: 3450,
        currentWeightKg: 3.4,
        lengthHeightCm: 50.0,
        headCircumferenceCm: 35.0,
        careUnit: "PICU_CARDIAC_CICU",
        bedIsoletteNumber: "CICU-BED-01 (POST-OP NORWOOD)",
        admissionDate: "2026-08-22 14:10",
        primaryDiagnosis: "Hypoplastic Left Heart Syndrome (HLHS) s/p Norwood Sano Palliation",
        attendingPediatrician: "Dr. Tariq Al-Mansoor, MD, FAAP",
        leadPicuNurse: "Michael Chang, BSN, CPN",
        ventilationMode: "CONVENTIONAL_PRVC_PRESSURE_REGULATED",
        vitals: {
          heartRate: 148,
          systolicBp: 64,
          diastolicBp: 36,
          meanArterialPressure: 45,
          respiratoryRate: 32,
          spO2PreDuctalRightHandPercent: 79,
          spO2PostDuctalFootPercent: 78,
          prePostDuctalSpO2Delta: 1,
          endTidalCo2MmHg: 38,
          coreTemperatureCelsius: 36.6,
          peripheralSkinTemperatureCelsius: 35.4,
          centralPeripheralTempDelta: 1.2,
          perfusionIndexPI: 1.8,
          capillaryRefillTimeSeconds: 2.2
        },
        incubator: {
          isIncubatorActive: true,
          incubatorMode: "RADIANT_WARMER_OPEN",
          chamberAirTemperatureCelsius: 24.0,
          chamberHumidityPercentage: 55,
          skinServoTemperatureTargetCelsius: 36.6,
          heaterPowerOutputPercentage: 28,
          ambientNoiseLevelDba: 44,
          transcutaneousBilirubinTcBMgDl: 5.2,
          phototherapyActive: false,
          phototherapyIrradianceUWCm2Nm: 0
        },
        palsDosing: PicuTelemetryService.calculatePalsDosing(3.4, 0),
        pews: PicuTelemetryService.calculatePews(1, 2, 1, 0, 0),
        oxygenation: PicuTelemetryService.calculateOxygenationIndex(10.0, 0.21, 42, 79),
        metabolic: {
          glucoseInfusionRateMgKgMin: 5.8,
          dextroseConcentrationPercent: 10.0,
          totalIvFluidRateMlKgDay: 100,
          serumGlucoseMgDl: 84,
          bloodGasPh: 7.36,
          baseDeficitMeqL: -2.8,
          serumLactateMmolL: 2.3,
          serumIonizedCalciumMmolL: 1.22
        },
        activeAlerts: [],
        resuscitationTimeline: [
          {
            timestamp: "2026-08-22 16:00",
            event: "Admitted from CVOR with open sternum and chest dressing.",
            intervention: "Milrinone 0.5 mcg/kg/min",
            provider: "Dr. Tariq Al-Mansoor, MD"
          }
        ]
      },
      {
        id: "PICU-305",
        mrn: "MRN-5510294",
        name: "Ava Patel",
        ageGroup: "CHILD_8_12Y",
        gestationalAgeWeeks: 40.0,
        chronologicalAgeDays: 4015, // 11 years
        gender: "FEMALE",
        birthWeightGrams: 3200,
        currentWeightKg: 34.0,
        lengthHeightCm: 142.0,
        headCircumferenceCm: 53.0,
        careUnit: "PICU_MEDICAL_SURGICAL",
        bedIsoletteNumber: "PICU-BED-07",
        admissionDate: "2026-08-24 11:20",
        primaryDiagnosis: "Impending Respiratory Failure 2/2 Severe Refractory Status Asthmaticus",
        attendingPediatrician: "Dr. Genevieve Sterling, MD, FAAP",
        leadPicuNurse: "Rachel Adams, BSN, RNC-NIC",
        ventilationMode: "HIGH_FLOW_NASAL_CANNULA_HFNC",
        vitals: {
          heartRate: 138,
          systolicBp: 118,
          diastolicBp: 68,
          meanArterialPressure: 85,
          respiratoryRate: 36,
          spO2PreDuctalRightHandPercent: 91,
          spO2PostDuctalFootPercent: 91,
          prePostDuctalSpO2Delta: 0,
          endTidalCo2MmHg: 48,
          coreTemperatureCelsius: 37.2,
          peripheralSkinTemperatureCelsius: 36.4,
          centralPeripheralTempDelta: 0.8,
          perfusionIndexPI: 3.2,
          capillaryRefillTimeSeconds: 1.8
        },
        incubator: {
          isIncubatorActive: false,
          incubatorMode: "CRIB_STANDARD",
          chamberAirTemperatureCelsius: 22.0,
          chamberHumidityPercentage: 45,
          skinServoTemperatureTargetCelsius: 37.0,
          heaterPowerOutputPercentage: 0,
          ambientNoiseLevelDba: 36,
          transcutaneousBilirubinTcBMgDl: 0.4,
          phototherapyActive: false,
          phototherapyIrradianceUWCm2Nm: 0
        },
        palsDosing: PicuTelemetryService.calculatePalsDosing(34.0, 11),
        pews: PicuTelemetryService.calculatePews(1, 1, 3, 2, 0),
        oxygenation: PicuTelemetryService.calculateOxygenationIndex(8.0, 0.40, 64, 91),
        metabolic: {
          glucoseInfusionRateMgKgMin: 3.0,
          dextroseConcentrationPercent: 5.0,
          totalIvFluidRateMlKgDay: 60,
          serumGlucoseMgDl: 110,
          bloodGasPh: 7.32,
          baseDeficitMeqL: -3.5,
          serumLactateMmolL: 2.6,
          serumIonizedCalciumMmolL: 1.16
        },
        activeAlerts: [
          {
            id: "ALT-305-1",
            patientId: "PICU-305",
            timestamp: "30 min ago",
            severity: "MODERATE_ALERT",
            category: "PALS_RESUSCITATION_ALERT",
            title: "Severe Bronchospasm & Rising EtCO2 (48 mmHg)",
            triggerMeasurement: "Respiratory Rate 36 bpm • EtCO2 48 mmHg on HFNC 35 L/min",
            expectedRange: "RR 14-22 • EtCO2 35-45 mmHg",
            clinicalRationale: "Air trapping, dynamic hyperinflation, and muscle fatigue in near-fatal asthma.",
            suggestedAction: "Administer IV Magnesium Sulfate (50 mg/kg over 30 min) + IV Terbutaline or Aminophylline load.",
            acknowledged: true,
            acknowledgedBy: "Dr. Genevieve Sterling, MD",
            acknowledgedTimestamp: "25 min ago"
          }
        ],
        resuscitationTimeline: [
          {
            timestamp: "2026-08-24 11:30",
            event: "Continuous Albuterol (20 mg/hr) nebulization initiated.",
            intervention: "Continuous Albuterol",
            provider: "Rachel Adams, BSN"
          }
        ]
      },
      {
        id: "PICU-306",
        mrn: "MRN-6104821",
        name: "Baby Girl Chloe",
        ageGroup: "LATE_PRETERM_32_37W",
        gestationalAgeWeeks: 31.4,
        chronologicalAgeDays: 6,
        gender: "FEMALE",
        birthWeightGrams: 1450,
        currentWeightKg: 1.48,
        lengthHeightCm: 39.0,
        headCircumferenceCm: 28.0,
        careUnit: "NICU_LEVEL_III_HIGH_RISK",
        bedIsoletteNumber: "NICU-ISOLETTE-05",
        admissionDate: "2026-08-20 18:00",
        primaryDiagnosis: "Preterm Neonate with Severe Isoimmune Hyperbilirubinemia (TcB 16.2 mg/dL)",
        attendingPediatrician: "Dr. Tariq Al-Mansoor, MD, FAAP",
        leadPicuNurse: "Rachel Adams, BSN, RNC-NIC",
        ventilationMode: "BUBBLE_CPAP_NON_INVASIVE",
        vitals: {
          heartRate: 154,
          systolicBp: 56,
          diastolicBp: 32,
          meanArterialPressure: 40,
          respiratoryRate: 48,
          spO2PreDuctalRightHandPercent: 96,
          spO2PostDuctalFootPercent: 95,
          prePostDuctalSpO2Delta: 1,
          endTidalCo2MmHg: 36,
          coreTemperatureCelsius: 37.0,
          peripheralSkinTemperatureCelsius: 36.6,
          centralPeripheralTempDelta: 0.4,
          perfusionIndexPI: 1.9,
          capillaryRefillTimeSeconds: 1.8
        },
        incubator: {
          isIncubatorActive: true,
          incubatorMode: "SERVO_SKIN_CONTROL",
          chamberAirTemperatureCelsius: 32.8,
          chamberHumidityPercentage: 65,
          skinServoTemperatureTargetCelsius: 37.0,
          heaterPowerOutputPercentage: 35,
          ambientNoiseLevelDba: 35,
          transcutaneousBilirubinTcBMgDl: 16.2,
          phototherapyActive: true,
          phototherapyIrradianceUWCm2Nm: 45
        },
        palsDosing: PicuTelemetryService.calculatePalsDosing(1.48, 0),
        pews: PicuTelemetryService.calculatePews(1, 0, 1, 0, 0),
        oxygenation: PicuTelemetryService.calculateOxygenationIndex(6.0, 0.25, 82, 96),
        metabolic: {
          glucoseInfusionRateMgKgMin: 6.8,
          dextroseConcentrationPercent: 10.0,
          totalIvFluidRateMlKgDay: 140,
          serumGlucoseMgDl: 78,
          bloodGasPh: 7.38,
          baseDeficitMeqL: -1.2,
          serumLactateMmolL: 1.5,
          serumIonizedCalciumMmolL: 1.20
        },
        activeAlerts: [
          {
            id: "ALT-306-1",
            patientId: "PICU-306",
            timestamp: "45 min ago",
            severity: "HIGH_WARNING",
            category: "INCUBATOR_THERMAL_INSTABILITY",
            title: "Critical Bilirubin at Exchange Transfusion Threshold (16.2 mg/dL)",
            triggerMeasurement: "TcB 16.2 mg/dL on Bhutani Nomogram at 144 Hours of Life",
            expectedRange: "TcB < 12.0 mg/dL",
            clinicalRationale: "High neurotoxicity risk (Kernicterus) requiring maximum quadruple surface phototherapy.",
            suggestedAction: "Intensive 360-degree LED phototherapy + STAT Total Serum Bilirubin; prepare double-volume exchange pack.",
            acknowledged: true,
            acknowledgedBy: "Dr. Tariq Al-Mansoor, MD",
            acknowledgedTimestamp: "40 min ago"
          }
        ],
        resuscitationTimeline: [
          {
            timestamp: "2026-08-20 19:00",
            event: "Quadruple phototherapy commenced with eye protection shields.",
            intervention: "Intensive Phototherapy",
            provider: "Rachel Adams, BSN"
          }
        ]
      },
      {
        id: "PICU-307",
        mrn: "MRN-7819203",
        name: "Elijah Vance",
        ageGroup: "TODDLER_1_3Y",
        gestationalAgeWeeks: 39.0,
        chronologicalAgeDays: 730, // 2 years
        gender: "MALE",
        birthWeightGrams: 3300,
        currentWeightKg: 12.0,
        lengthHeightCm: 86.0,
        headCircumferenceCm: 48.0,
        careUnit: "PICU_CARDIAC_CICU",
        bedIsoletteNumber: "CICU-BED-03 (SVT-STAT)",
        admissionDate: "2026-08-24 14:00",
        primaryDiagnosis: "Paroxysmal Supraventricular Tachycardia (SVT) with Narrow Complex Tachycardia (HR 245 bpm)",
        attendingPediatrician: "Dr. Tariq Al-Mansoor, MD, FAAP",
        leadPicuNurse: "Michael Chang, BSN, CPN",
        ventilationMode: "SPONTANEOUS_ROOM_AIR",
        vitals: {
          heartRate: 245,
          systolicBp: 82,
          diastolicBp: 44,
          meanArterialPressure: 57,
          respiratoryRate: 40,
          spO2PreDuctalRightHandPercent: 97,
          spO2PostDuctalFootPercent: 97,
          prePostDuctalSpO2Delta: 0,
          endTidalCo2MmHg: 35,
          coreTemperatureCelsius: 37.1,
          peripheralSkinTemperatureCelsius: 36.2,
          centralPeripheralTempDelta: 0.9,
          perfusionIndexPI: 2.1,
          capillaryRefillTimeSeconds: 2.4
        },
        incubator: {
          isIncubatorActive: false,
          incubatorMode: "CRIB_STANDARD",
          chamberAirTemperatureCelsius: 22.0,
          chamberHumidityPercentage: 45,
          skinServoTemperatureTargetCelsius: 37.0,
          heaterPowerOutputPercentage: 0,
          ambientNoiseLevelDba: 38,
          transcutaneousBilirubinTcBMgDl: 0.6,
          phototherapyActive: false,
          phototherapyIrradianceUWCm2Nm: 0
        },
        palsDosing: PicuTelemetryService.calculatePalsDosing(12.0, 2),
        pews: PicuTelemetryService.calculatePews(2, 2, 1, 0, 0),
        oxygenation: PicuTelemetryService.calculateOxygenationIndex(5.0, 0.21, 95, 97),
        metabolic: {
          glucoseInfusionRateMgKgMin: 4.0,
          dextroseConcentrationPercent: 5.0,
          totalIvFluidRateMlKgDay: 70,
          serumGlucoseMgDl: 94,
          bloodGasPh: 7.37,
          baseDeficitMeqL: -2.0,
          serumLactateMmolL: 2.2,
          serumIonizedCalciumMmolL: 1.24
        },
        activeAlerts: [
          {
            id: "ALT-307-1",
            patientId: "PICU-307",
            timestamp: "8 min ago",
            severity: "CRITICAL_STAT",
            category: "PALS_RESUSCITATION_ALERT",
            title: "CRITICAL PEDIATRIC SVT (Heart Rate 245 bpm)",
            triggerMeasurement: "Heart Rate 245 bpm with Absent P-waves & Narrow QRS",
            expectedRange: "80 - 130 bpm",
            clinicalRationale: "Reentrant atrioventricular tachycardia with reduced diastolic ventricular filling time.",
            suggestedAction: "STAT Ice to Face vagal maneuver for 15 sec; if refractory, Adenosine 0.1 mg/kg (1.2 mg) Rapid IV Push with 5mL flush.",
            acknowledged: false
          }
        ],
        resuscitationTimeline: [
          {
            timestamp: "2026-08-24 14:15",
            event: "Vagal maneuver attempted with crushed ice bag.",
            intervention: "Ice Bag Vagal Maneuver",
            provider: "Michael Chang, BSN"
          }
        ]
      },
      {
        id: "PICU-308",
        mrn: "MRN-8819204",
        name: "Emma Watson",
        ageGroup: "ADOLESCENT_13_18Y",
        gestationalAgeWeeks: 40.0,
        chronologicalAgeDays: 5110, // 14 years
        gender: "FEMALE",
        birthWeightGrams: 3500,
        currentWeightKg: 48.0,
        lengthHeightCm: 162.0,
        headCircumferenceCm: 55.0,
        careUnit: "PICU_ECMO_RESUSCITATION",
        bedIsoletteNumber: "PICU-BED-01 (NEURO-TRAUMA)",
        admissionDate: "2026-08-24 09:30",
        primaryDiagnosis: "Severe Traumatic Brain Injury (TBI) with Refractory Intracranial Hypertension (ICP 24 mmHg)",
        attendingPediatrician: "Dr. Genevieve Sterling, MD, FAAP",
        leadPicuNurse: "Rachel Adams, BSN, RNC-NIC",
        ventilationMode: "CONVENTIONAL_PRVC_PRESSURE_REGULATED",
        vitals: {
          heartRate: 64,
          systolicBp: 138,
          diastolicBp: 74,
          meanArterialPressure: 95,
          respiratoryRate: 16,
          spO2PreDuctalRightHandPercent: 99,
          spO2PostDuctalFootPercent: 99,
          prePostDuctalSpO2Delta: 0,
          endTidalCo2MmHg: 34,
          coreTemperatureCelsius: 36.0,
          peripheralSkinTemperatureCelsius: 35.8,
          centralPeripheralTempDelta: 0.2,
          perfusionIndexPI: 3.5,
          capillaryRefillTimeSeconds: 1.5
        },
        incubator: {
          isIncubatorActive: false,
          incubatorMode: "CRIB_STANDARD",
          chamberAirTemperatureCelsius: 21.0,
          chamberHumidityPercentage: 40,
          skinServoTemperatureTargetCelsius: 36.0,
          heaterPowerOutputPercentage: 0,
          ambientNoiseLevelDba: 32,
          transcutaneousBilirubinTcBMgDl: 0.3,
          phototherapyActive: false,
          phototherapyIrradianceUWCm2Nm: 0
        },
        palsDosing: PicuTelemetryService.calculatePalsDosing(48.0, 14),
        pews: PicuTelemetryService.calculatePews(3, 1, 0, 0, 0),
        oxygenation: PicuTelemetryService.calculateOxygenationIndex(10.0, 0.35, 110, 99),
        metabolic: {
          glucoseInfusionRateMgKgMin: 2.5,
          dextroseConcentrationPercent: 5.0,
          totalIvFluidRateMlKgDay: 50,
          serumGlucoseMgDl: 124,
          bloodGasPh: 7.42,
          baseDeficitMeqL: 0.5,
          serumLactateMmolL: 1.4,
          serumIonizedCalciumMmolL: 1.20
        },
        activeAlerts: [
          {
            id: "ALT-308-1",
            patientId: "PICU-308",
            timestamp: "18 min ago",
            severity: "HIGH_WARNING",
            category: "PALS_RESUSCITATION_ALERT",
            title: "Elevated Intracranial Pressure (ICP 24 mmHg)",
            triggerMeasurement: "ICP 24 mmHg • CPP 71 mmHg • Mild Bradycardia",
            expectedRange: "ICP < 20 mmHg",
            clinicalRationale: "Cerebral edema following blunt neuro-trauma; Cushing response risk.",
            suggestedAction: "Administer 3% Hypertonic Saline Bolus (5 mL/kg over 20 min) + maintain head of bed elevated at 30 degrees.",
            acknowledged: true,
            acknowledgedBy: "Dr. Genevieve Sterling, MD",
            acknowledgedTimestamp: "12 min ago"
          }
        ],
        resuscitationTimeline: [
          {
            timestamp: "2026-08-24 10:00",
            event: "Camino Intracranial Pressure bolt monitor placed.",
            intervention: "ICP Monitor Placement",
            provider: "Dr. Genevieve Sterling, MD"
          }
        ]
      }
    ];
  }

  private startStreamingSimulator(): void {
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.patients = this.patients.map((p) => {
        // Stochastic pediatric vitals drift
        const hrDrift = Math.floor(Math.random() * 5) - 2;
        const sbpDrift = Math.floor(Math.random() * 3) - 1;
        const spo2Drift = (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0);

        const newHr = Math.max(50, Math.min(260, p.vitals.heartRate + hrDrift));
        const newSbp = Math.max(35, Math.min(180, p.vitals.systolicBp + sbpDrift));
        const newPreSpO2 = Math.max(70, Math.min(100, p.vitals.spO2PreDuctalRightHandPercent + spo2Drift));
        const newPostSpO2 = Math.max(65, Math.min(100, p.vitals.spO2PostDuctalFootPercent + spo2Drift));
        const newDelta = Math.max(0, newPreSpO2 - newPostSpO2);

        return {
          ...p,
          vitals: {
            ...p.vitals,
            heartRate: newHr,
            systolicBp: newSbp,
            spO2PreDuctalRightHandPercent: newPreSpO2,
            spO2PostDuctalFootPercent: newPostSpO2,
            prePostDuctalSpO2Delta: newDelta
          }
        };
      });

      this.notifyListeners();
    }, 1300);
  }

  public subscribe(listener: (patients: PicuPatient[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.patients);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.patients]));
  }

  public getPatients(): PicuPatient[] {
    return [...this.patients];
  }

  public getPatientById(id: string): PicuPatient | undefined {
    return this.patients.find((p) => p.id === id);
  }

  public getCensusOverview(): PicuCensusOverview {
    const microPreemies = this.patients.filter((p) => p.ageGroup === "EXTREME_PRETERM_UNDER_28W").length;
    const hfov = this.patients.filter((p) => p.ventilationMode === "HFOV_HIGH_FREQUENCY_OSCILLATORY").length;
    const critPews = this.patients.filter((p) => p.pews.totalPewsScore >= 6).length;
    const severePards = this.patients.filter((p) => p.oxygenation.oxygenationIndexOI >= 16).length;
    const pphnNitric = this.patients.filter((p) => p.vitals.prePostDuctalSpO2Delta >= 5).length;
    const phototherapy = this.patients.filter((p) => p.incubator.phototherapyActive).length;

    return {
      totalCensus: this.patients.length,
      microPreemieCount: microPreemies,
      activeHfovVentCount: hfov,
      criticalPewsCount: critPews,
      severePardsOiCount: severePards,
      activeNitricOxideCount: pphnNitric,
      phototherapyActiveCount: phototherapy,
      averageIncubatorCompliancePercent: 96
    };
  }

  public acknowledgeAlert(patientId: string, alertId: string, clinicianName: string): void {
    this.patients = this.patients.map((p) => {
      if (p.id !== patientId) return p;
      return {
        ...p,
        activeAlerts: p.activeAlerts.map((a) => {
          if (a.id !== alertId) return a;
          return {
            ...a,
            acknowledged: true,
            acknowledgedBy: clinicianName,
            acknowledgedTimestamp: "Just now"
          };
        })
      };
    });
    this.notifyListeners();
  }

  public dispatchEmergencyProtocol(
    patientId: string,
    protocolType: "PALS_CODE_BLUE_STAT" | "NEONATAL_D10W_BOLUS" | "INHALED_NITRIC_OXIDE_PPHN" | "HFOV_TRANSITION_RESCUE" | "ADENOSINE_SVT_RAPID_PUSH",
    notes: string
  ): void {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    this.patients = this.patients.map((p) => {
      if (p.id !== patientId) return p;
      const newTimeline = [
        {
          timestamp,
          event: "PALS STAT PROTOCOL: " + protocolType.replace(/_/g, " ") + " (" + notes + ")",
          intervention: protocolType,
          provider: "Pediatric Critical Care Response Team"
        },
        ...p.resuscitationTimeline
      ];
      return {
        ...p,
        resuscitationTimeline: newTimeline
      };
    });
    this.notifyListeners();
  }

  public updatePatient(updatedPatient: PicuPatient): void {
    this.patients = this.patients.map((p) => (p.id === updatedPatient.id ? updatedPatient : p));
    this.notifyListeners();
  }

  // =========================================================================
  // EXPORT UTILITIES (HL7 FHIR R4 & CSV)
  // =========================================================================

  public exportFhirBundle(patientId: string): any {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;

    return {
      resourceType: "Bundle",
      id: "picu-fhir-" + patient.id,
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: "urn:uuid:patient-" + patient.id,
          resource: {
            resourceType: "Patient",
            id: patient.id,
            identifier: [{ system: "http://hospital.medtrack.org/mrn", value: patient.mrn }],
            name: [{ text: patient.name }],
            gender: patient.gender.toLowerCase(),
            birthDate: (2026 - (patient.chronologicalAgeDays / 365)) + "-01-01"
          }
        },
        {
          fullUrl: "urn:uuid:observation-pews-" + patient.id,
          resource: {
            resourceType: "Observation",
            status: "final",
            code: { text: "Pediatric Early Warning Score PEWS" },
            valueInteger: patient.pews.totalPewsScore,
            effectiveDateTime: new Date().toISOString()
          }
        },
        {
          fullUrl: "urn:uuid:observation-oi-" + patient.id,
          resource: {
            resourceType: "Observation",
            status: "final",
            code: { text: "PALICC Oxygenation Index" },
            valueQuantity: {
              value: patient.oxygenation.oxygenationIndexOI,
              unit: "OI"
            }
          }
        }
      ]
    };
  }

  public exportCsvSummary(patientId: string): string {
    const patient = this.getPatientById(patientId);
    if (!patient) return "";

    const headers = [
      "Patient ID",
      "MRN",
      "Name",
      "Gestational Age (w)",
      "Age Group",
      "Weight (kg)",
      "Broselow Color",
      "Care Unit",
      "Vent Mode",
      "Heart Rate (bpm)",
      "Systolic BP (mmHg)",
      "MAP (mmHg)",
      "Pre-Ductal SpO2 %",
      "Post-Ductal SpO2 %",
      "Pre/Post Delta %",
      "PEWS Total",
      "Oxygenation Index (OI)",
      "PARDS Class",
      "GIR (mg/kg/min)",
      "Incubator Temp (C)",
      "Incubator Humidity %"
    ].join(",");

    const values = [
      patient.id,
      patient.mrn,
      "\"" + patient.name + "\"",
      patient.gestationalAgeWeeks,
      patient.ageGroup,
      patient.currentWeightKg,
      patient.palsDosing.broselowColor,
      patient.careUnit,
      patient.ventilationMode,
      patient.vitals.heartRate,
      patient.vitals.systolicBp,
      patient.vitals.meanArterialPressure,
      patient.vitals.spO2PreDuctalRightHandPercent,
      patient.vitals.spO2PostDuctalFootPercent,
      patient.vitals.prePostDuctalSpO2Delta,
      patient.pews.totalPewsScore,
      patient.oxygenation.oxygenationIndexOI,
      patient.oxygenation.pardsClassification,
      patient.metabolic.glucoseInfusionRateMgKgMin,
      patient.incubator.chamberAirTemperatureCelsius,
      patient.incubator.chamberHumidityPercentage
    ].join(",");

    return headers + "\n" + values;
  }
}
