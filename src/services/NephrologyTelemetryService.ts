import {
  NephrologyPatient,
  NephrologyCensusOverview,
  KdigoAkiStage,
  CrrtModality,
  NephrologyAlert,
  AnticoagulationStrategy
} from "../types/nephrologyTelemetry";

export class NephrologyTelemetryService {
  private static instance: NephrologyTelemetryService;
  private patients: NephrologyPatient[] = [];
  private listeners: Array<(patients: NephrologyPatient[]) => void> = [];
  private timer: any = null;

  private constructor() {
    this.initializePatients();
    this.startStreamingSimulator();
  }

  public static getInstance(): NephrologyTelemetryService {
    if (!NephrologyTelemetryService.instance) {
      NephrologyTelemetryService.instance = new NephrologyTelemetryService();
    }
    return NephrologyTelemetryService.instance;
  }

  // =========================================================================
  // CLINICAL CALCULATION ENGINES
  // =========================================================================

  /**
   * KDIGO AKI Classification Engine (2012 Clinical Practice Guideline)
   * Staging based on Serum Creatinine kinetics and normalized hourly Urine Output.
   */
  public static calculateKdigoStage(
    currentCr: number,
    baselineCr: number,
    uoMlKgHr: number,
    uoHours: number
  ): { stage: KdigoAkiStage; rationale: string } {
    const base = baselineCr > 0 ? baselineCr : 1.0;
    const ratio = currentCr / base;
    const absDiff = currentCr - base;

    // Stage 3 Criteria
    if (ratio >= 3.0 || currentCr >= 4.0 || (uoMlKgHr < 0.3 && uoHours >= 24) || (uoMlKgHr === 0 && uoHours >= 12)) {
      return {
        stage: "STAGE_3_FAILURE",
        rationale: "Serum Creatinine multiplier >= 3.0x baseline (" + ratio.toFixed(2) + "x) or Cr >= 4.0 mg/dL or persistent anuria/oliguria < 0.3 mL/kg/hr for >= 24h."
      };
    }

    // Stage 2 Criteria
    if (ratio >= 2.0 || (uoMlKgHr < 0.5 && uoHours >= 12)) {
      return {
        stage: "STAGE_2_INJURY",
        rationale: "Serum Creatinine 2.0 - 2.9x baseline (" + ratio.toFixed(2) + "x) or Urine Output < 0.5 mL/kg/hr for >= 12h."
      };
    }

    // Stage 1 Criteria
    if (ratio >= 1.5 || absDiff >= 0.3 || (uoMlKgHr < 0.5 && uoHours >= 6)) {
      return {
        stage: "STAGE_1_RISK",
        rationale: "Serum Creatinine 1.5 - 1.9x baseline (" + ratio.toFixed(2) + "x) or absolute delta >= 0.3 mg/dL or Urine Output < 0.5 mL/kg/hr for >= 6h."
      };
    }

    return {
      stage: "STAGE_0_NORMAL",
      rationale: "Renal biomarkers and urinary output within baseline physiological limits."
    };
  }

  /**
   * CKD-EPI 2021 eGFR Equation (Refit without race)
   */
  public static calculateCkdEpiGfr(serumCr: number, age: number, isFemale: boolean): number {
    const cr = serumCr > 0 ? serumCr : 0.6;
    const kappa = isFemale ? 0.7 : 0.9;
    const alpha = isFemale ? -0.241 : -0.302;
    const genderMultiplier = isFemale ? 1.012 : 1.0;

    const minPart = Math.min(cr / kappa, 1.0);
    const maxPart = Math.max(cr / kappa, 1.0);

    const gfr = 142 * Math.pow(minPart, alpha) * Math.pow(maxPart, -1.200) * Math.pow(0.9938, age) * genderMultiplier;
    return Math.round(gfr * 10) / 10;
  }

  /**
   * Daugirdas 2nd-Generation Single-Pool Kt/V Solver for Dialysis Adequacy
   * Formula: Kt/V = -ln(R - 0.008*t) + (4 - 3.5*R) * (UF / W)
   */
  public static calculateDaugirdasKtV(
    preBun: number,
    postBun: number,
    txHours: number,
    ufLiters: number,
    postWeightKg: number
  ): number {
    if (preBun <= 0 || postBun <= 0 || postWeightKg <= 0) return 0;
    const R = postBun / preBun;
    const t = txHours > 0 ? txHours : 4.0;
    const uf = ufLiters >= 0 ? ufLiters : 0;
    const w = postWeightKg;

    const part1 = -Math.log(Math.max(0.01, R - 0.008 * t));
    const part2 = (4 - 3.5 * R) * (uf / w);
    const ktv = part1 + part2;
    return Math.round(Math.max(0, ktv) * 100) / 100;
  }

  /**
   * Urea Reduction Ratio (URR)
   * Formula: URR = ((PreBUN - PostBUN) / PreBUN) * 100%
   */
  public static calculateUreaReductionRatio(preBun: number, postBun: number): number {
    if (preBun <= 0) return 0;
    const urr = ((preBun - postBun) / preBun) * 100;
    return Math.round(Math.max(0, urr) * 10) / 10;
  }

  /**
   * Fractional Excretion of Sodium (FENa %)
   * FENa = (U_Na * P_Cr) / (P_Na * U_Cr) * 100%
   */
  public static calculateFENa(urineNa: number, serumNa: number, urineCr: number, serumCr: number): number {
    if (serumNa <= 0 || urineCr <= 0) return 0;
    const fena = ((urineNa * serumCr) / (serumNa * urineCr)) * 100;
    return Math.round(fena * 100) / 100;
  }

  /**
   * Anion Gap with Albumin Correction
   * AG = Na - (Cl + HCO3)
   * AG_corr = AG + 2.5 * (4.0 - Albumin)
   */
  public static calculateAnionGap(serumNa: number, serumCl: number, serumHco3: number, serumAlb: number): {
    standardAg: number;
    correctedAg: number;
    deltaDeltaRatio: number;
  } {
    const standardAg = serumNa - (serumCl + serumHco3);
    const alb = serumAlb > 0 ? serumAlb : 4.0;
    const correctedAg = standardAg + 2.5 * (4.0 - alb);

    const deltaAg = Math.max(0, correctedAg - 12);
    const deltaHco3 = Math.max(1, 24 - serumHco3);
    const deltaDeltaRatio = Math.round((deltaAg / deltaHco3) * 100) / 100;

    return {
      standardAg: Math.round(standardAg * 10) / 10,
      correctedAg: Math.round(correctedAg * 10) / 10,
      deltaDeltaRatio
    };
  }

  /**
   * Transmembrane Pressure (TMP) & Filter Pressure Drop (Delta P)
   * TMP = (FilterInletPressure + ReturnPressure)/2 - EffluentPressure
   * Delta P = FilterInletPressure - ReturnPressure
   */
  public static calculateCircuitPressures(
    inletP: number,
    returnP: number,
    effluentP: number
  ): { tmp: number; deltaP: number; isClottingWarning: boolean } {
    const tmp = (inletP + returnP) / 2 - effluentP;
    const deltaP = inletP - returnP;
    const isClottingWarning = tmp >= 250 || deltaP >= 180;
    return {
      tmp: Math.round(tmp),
      deltaP: Math.round(deltaP),
      isClottingWarning
    };
  }

  /**
   * Filtration Fraction (FF %) in CRRT
   * FF = (Q_rep_pre + Q_rep_post + UFR_net) / (Q_B * (1 - Hct) + Q_rep_pre) * 100%
   */
  public static calculateFiltrationFraction(
    qbMlMin: number,
    qRepPreMlHr: number,
    qRepPostMlHr: number,
    ufrNetMlHr: number,
    hematocritPercent: number
  ): number {
    const qbPlasmaMlHr = qbMlMin * 60 * (1 - (hematocritPercent || 30) / 100);
    const numerator = qRepPreMlHr + qRepPostMlHr + ufrNetMlHr;
    const denominator = qbPlasmaMlHr + qRepPreMlHr;
    if (denominator <= 0) return 0;
    const ff = (numerator / denominator) * 100;
    return Math.round(ff * 10) / 10;
  }

  /**
   * Regional Citrate Anticoagulation (RCA) Toxicity Evaluator
   * Total Serum Calcium / Ionized Calcium Ratio (mmol/L)
   * Ratio >= 2.5 indicates citrate accumulation / impaired hepatic metabolism.
   */
  public static evaluateCitrateToxicity(totalCaMmol: number, ionizedCaMmol: number): {
    ratio: number;
    isToxicitySuspected: boolean;
    recommendation: string;
  } {
    const ica = ionizedCaMmol > 0 ? ionizedCaMmol : 1.0;
    const ratio = Math.round((totalCaMmol / ica) * 100) / 100;
    const isToxicitySuspected = ratio >= 2.5;

    let recommendation = "Citrate clearance normal. Maintain current ACD-A infusion rate.";
    if (isToxicitySuspected) {
      recommendation = "CRITICAL: Citrate accumulation detected (Total Ca / iCa >= 2.5). Decrease ACD-A rate by 20-30%, switch to pre-filter dilution or heparin/saline flush, and optimize hepatic perfusion.";
    } else if (ratio >= 2.2) {
      recommendation = "BORDERLINE: Monitor systemic ionized calcium every 2 hours; ensure adequate systemic CaCl2 replacement.";
    }

    return { ratio, isToxicitySuspected, recommendation };
  }

  // =========================================================================
  // STREAMING SIMULATOR & PATIENT INITIALIZATION
  // =========================================================================

  private initializePatients(): void {
    this.patients = [
      {
        id: "NEPH-7101",
        mrn: "MRN-8492019",
        name: "Ethan Vance",
        age: 58,
        gender: "MALE",
        dryWeightKg: 82.0,
        currentWeightKg: 87.5,
        heightCm: 178,
        bodySurfaceAreaM2: 2.01,
        renalWardBed: "ICU-BED-04 (CRRT-STAT)",
        admissionDate: "2026-08-22 06:30",
        triagePriority: "EMERGENT_STAT_DIALYSIS",
        primaryEtiology: "Severe Septic Shock with Oliguric Acute Tubular Necrosis (ATN)",
        attendingNephrologist: "Dr. Alistair Sterling, MD, FASN",
        leadDialysisNurse: "Jennifer Morales, BSN, CNN",
        kdigoStage: "STAGE_3_FAILURE",
        currentModality: "CVVHDF_CONTINUOUS_HEMODIAFILTRATION",
        anticoagulation: "REGIONAL_CITRATE_RCA",
        vascularAccess: "RIGHT_INTERNAL_JUGULAR_VAS_CATH",
        vitals: {
          heartRate: 104,
          systolicBp: 108,
          diastolicBp: 62,
          meanArterialPressure: 77,
          spO2: 95,
          respiratoryRate: 20,
          coreTemperatureCelsius: 37.1
        },
        circuit: {
          bloodFlowRateQbMlMin: 200,
          effluentDoseMlKgHr: 28.5,
          dialysateFlowRateQdMlHr: 1200,
          replacementPreFilterFlowMlHr: 600,
          replacementPostFilterFlowMlHr: 400,
          ultrafiltrationRateNetMlHr: 200,
          accessPressureArterialMmHg: -110,
          returnPressureVenousMmHg: 135,
          filterInletPressureMmHg: 210,
          effluentPressureMmHg: -15,
          transmembranePressureTmpMmHg: 275,
          filterPressureDropDeltaPMmHg: 75,
          filtrationFractionPercent: 18.2,
          dialyzerMembraneModel: "Baxter Prismaflex ST150 AN69 Surface Treated",
          filterRunTimeHours: 58.4,
          isFilterClottingRisk: true
        },
        citrate: {
          citrateSolutionType: "ACD_A",
          citrateInfusionRateMmolHr: 3.2,
          postFilterIonizedCalciumMmolL: 0.31,
          systemicIonizedCalciumMmolL: 1.18,
          calciumChlorideCompensationRateMlHr: 38.0,
          totalSerumCalciumMmolL: 2.24,
          totalToIonizedCalciumRatio: 1.90,
          isCitrateToxicitySuspected: false
        },
        electrolytes: {
          serumCreatinineMgDl: 4.82,
          baselineCreatinineMgDl: 1.10,
          creatinineDeltaMultiplier: 4.38,
          bloodUreaNitrogenMgDl: 88,
          bunToCreatinineRatio: 18.3,
          serumPotassiumMeqL: 5.6,
          serumSodiumMeqL: 137,
          serumChlorideMeqL: 102,
          serumBicarbonateHco3MeqL: 16.5,
          serumPhosphorusMgDl: 6.2,
          serumMagnesiumMgDl: 2.3,
          serumAlbuminGDl: 2.8,
          bloodPh: 7.28,
          baseExcessDeficit: -7.2,
          serumLactateMmolL: 3.4,
          anionGapMeqL: 18.5,
          albuminCorrectedAnionGap: 21.5,
          deltaDeltaGapRatio: 1.27
        },
        urine: {
          urineOutputLast1HourMl: 12,
          urineOutputLast6HoursMl: 65,
          urineOutputLast12HoursMl: 110,
          urineOutputLast24HoursMl: 220,
          urineOutputNormalizedMlKgHr: 0.15,
          urineSpecificGravity: 1.012,
          urineSodiumMeqL: 58,
          urineCreatinineMgDl: 42,
          urineOsmolalityMosmKg: 310,
          fractionalExcretionOfSodiumFENa: 3.42,
          fractionalExcretionOfUreaFEUrea: 48.0,
          urinarySedimentType: "MUDDY_BROWN_GRANULAR_CASTS_ATN",
          isOliguric: true,
          isAnuric: false
        },
        clearance: {
          estimatedGfrCkdEpi: 12.4,
          creatinineClearanceCrCl: 14.8,
          daugirdasSinglePoolKtV: 1.48,
          ureaReductionRatioURRPercent: 68.2,
          effluentUreaNitrogenMgDl: 74,
          bloodUreaNitrogenPostDialysisMgDl: 28,
          soluteRemovalRateGramsPerDay: 42.5
        },
        fluidBalance: {
          intakeLast24HoursMl: 3400,
          outputLast24HoursMl: 5200,
          netCumulativeBalance24HoursMl: -1800,
          totalFluidOverloadPercentage: 6.7,
          prescribedDailyNetUltrafiltrationGoalMl: 2400,
          hourlyNetUltrafiltrationAchievedMlHr: 200
        },
        activeAlerts: [
          {
            id: "ALT-7101-1",
            patientId: "NEPH-7101",
            timestamp: "10 min ago",
            severity: "HIGH_WARNING",
            category: "CIRCUIT_CLOTTING_TMP",
            title: "Elevated Transmembrane Pressure (TMP 275 mmHg)",
            triggerMeasurement: "TMP 275 mmHg (Limit: 250 mmHg)",
            expectedRange: "< 250 mmHg",
            clinicalRationale: "Microvascular fiber fouling and protein deposition on ST150 AN69 membrane.",
            suggestedAction: "Evaluate filter replacement within 2 hours; check pre-filter citrate infusion rate.",
            acknowledged: false
          },
          {
            id: "ALT-7101-2",
            patientId: "NEPH-7101",
            timestamp: "25 min ago",
            severity: "MODERATE_ALERT",
            category: "METABOLIC_ACIDOSIS",
            title: "Persistent High Anion Gap Metabolic Acidosis",
            triggerMeasurement: "pH 7.28 • Bicarb 16.5 mEq/L • Corrected AG 21.5",
            expectedRange: "pH 7.35-7.45 • Bicarb 22-26 mEq/L",
            clinicalRationale: "Uremic toxin accumulation and systemic septic lactic acid load.",
            suggestedAction: "Increase dialysate bicarbonate concentration or step up effluent flow to 30 mL/kg/hr.",
            acknowledged: true,
            acknowledgedBy: "Dr. Alistair Sterling, MD",
            acknowledgedTimestamp: "20 min ago"
          }
        ],
        dialysisEventsTimeline: [
          {
            timestamp: "2026-08-24 08:00",
            event: "CRRT Circuit primed and initiated on CVVHDF mode.",
            modality: "CVVHDF",
            provider: "Jennifer Morales, BSN"
          },
          {
            timestamp: "2026-08-24 14:30",
            event: "Citrate ACD-A titrated for post-filter iCa target 0.30 mmol/L.",
            modality: "CVVHDF",
            provider: "Dr. Alistair Sterling, MD"
          }
        ]
      },
      {
        id: "NEPH-7102",
        mrn: "MRN-6104829",
        name: "Evelyn Cross",
        age: 72,
        gender: "FEMALE",
        dryWeightKg: 64.0,
        currentWeightKg: 71.2,
        heightCm: 162,
        bodySurfaceAreaM2: 1.68,
        renalWardBed: "CCU-BED-08 (SCUF)",
        admissionDate: "2026-08-23 11:15",
        triagePriority: "HIGH_CRITICAL_AKI",
        primaryEtiology: "Cardiorenal Syndrome Type 1 with Severe Refractory Volume Overload",
        attendingNephrologist: "Dr. Clara Hensley, MD",
        leadDialysisNurse: "David Miller, RN, CNN",
        kdigoStage: "STAGE_2_INJURY",
        currentModality: "SCUF_SLOW_CONTINUOUS_ULTRAFILTRATION",
        anticoagulation: "SYSTEMIC_UNFRACTIONATED_HEPARIN",
        vascularAccess: "FEMORAL_VAS_CATH",
        vitals: {
          heartRate: 88,
          systolicBp: 134,
          diastolicBp: 78,
          meanArterialPressure: 96,
          spO2: 92,
          respiratoryRate: 24,
          coreTemperatureCelsius: 36.6
        },
        circuit: {
          bloodFlowRateQbMlMin: 150,
          effluentDoseMlKgHr: 0,
          dialysateFlowRateQdMlHr: 0,
          replacementPreFilterFlowMlHr: 0,
          replacementPostFilterFlowMlHr: 0,
          ultrafiltrationRateNetMlHr: 250,
          accessPressureArterialMmHg: -80,
          returnPressureVenousMmHg: 95,
          filterInletPressureMmHg: 160,
          effluentPressureMmHg: -20,
          transmembranePressureTmpMmHg: 145,
          filterPressureDropDeltaPMmHg: 65,
          filtrationFractionPercent: 12.5,
          dialyzerMembraneModel: "Fresenius Ultraflux AV400S Polysulfone",
          filterRunTimeHours: 18.2,
          isFilterClottingRisk: false
        },
        citrate: {
          citrateSolutionType: "SODIUM_CITRATE_4_PERCENT",
          citrateInfusionRateMmolHr: 0,
          postFilterIonizedCalciumMmolL: 1.15,
          systemicIonizedCalciumMmolL: 1.15,
          calciumChlorideCompensationRateMlHr: 0,
          totalSerumCalciumMmolL: 2.30,
          totalToIonizedCalciumRatio: 2.00,
          isCitrateToxicitySuspected: false
        },
        electrolytes: {
          serumCreatinineMgDl: 2.85,
          baselineCreatinineMgDl: 1.30,
          creatinineDeltaMultiplier: 2.19,
          bloodUreaNitrogenMgDl: 64,
          bunToCreatinineRatio: 22.4,
          serumPotassiumMeqL: 4.8,
          serumSodiumMeqL: 132,
          serumChlorideMeqL: 94,
          serumBicarbonateHco3MeqL: 21.0,
          serumPhosphorusMgDl: 4.6,
          serumMagnesiumMgDl: 2.1,
          serumAlbuminGDl: 3.1,
          bloodPh: 7.34,
          baseExcessDeficit: -3.5,
          serumLactateMmolL: 1.8,
          anionGapMeqL: 17.0,
          albuminCorrectedAnionGap: 19.2,
          deltaDeltaGapRatio: 1.10
        },
        urine: {
          urineOutputLast1HourMl: 20,
          urineOutputLast6HoursMl: 130,
          urineOutputLast12HoursMl: 260,
          urineOutputLast24HoursMl: 550,
          urineOutputNormalizedMlKgHr: 0.36,
          urineSpecificGravity: 1.020,
          urineSodiumMeqL: 14,
          urineCreatinineMgDl: 110,
          urineOsmolalityMosmKg: 520,
          fractionalExcretionOfSodiumFENa: 0.58,
          fractionalExcretionOfUreaFEUrea: 28.5,
          urinarySedimentType: "HYALINE_CASTS_PRERENAL",
          isOliguric: true,
          isAnuric: false
        },
        clearance: {
          estimatedGfrCkdEpi: 18.2,
          creatinineClearanceCrCl: 22.1,
          daugirdasSinglePoolKtV: 0.45,
          ureaReductionRatioURRPercent: 28.0,
          effluentUreaNitrogenMgDl: 0,
          bloodUreaNitrogenPostDialysisMgDl: 58,
          soluteRemovalRateGramsPerDay: 12.0
        },
        fluidBalance: {
          intakeLast24HoursMl: 1800,
          outputLast24HoursMl: 4600,
          netCumulativeBalance24HoursMl: -2800,
          totalFluidOverloadPercentage: 11.2,
          prescribedDailyNetUltrafiltrationGoalMl: 3000,
          hourlyNetUltrafiltrationAchievedMlHr: 250
        },
        activeAlerts: [
          {
            id: "ALT-7102-1",
            patientId: "NEPH-7102",
            timestamp: "45 min ago",
            severity: "HIGH_WARNING",
            category: "FLUID_OVERLOAD_PULMONARY_EDEMA",
            title: "Severe Fluid Overload (+11.2% Body Weight Delta)",
            triggerMeasurement: "+7.2 kg Volume Expansion above Dry Weight",
            expectedRange: "< 5.0% Overload",
            clinicalRationale: "Refractory Cardiorenal Syndrome leading to bilateral alveolar pulmonary congestion.",
            suggestedAction: "Continue SCUF at 250 mL/hr net UF; evaluate transition to CVVH if solute clearance declines.",
            acknowledged: false
          }
        ],
        dialysisEventsTimeline: [
          {
            timestamp: "2026-08-23 12:00",
            event: "SCUF initiated via 13.5Fr Femoral catheter for decongestion.",
            modality: "SCUF",
            provider: "David Miller, RN"
          }
        ]
      },
      {
        id: "NEPH-7103",
        mrn: "MRN-9021488",
        name: "Marcus Chen",
        age: 33,
        gender: "MALE",
        dryWeightKg: 88.0,
        currentWeightKg: 92.4,
        heightCm: 182,
        bodySurfaceAreaM2: 2.11,
        renalWardBed: "ICU-BED-02 (EMERGENT-HD)",
        admissionDate: "2026-08-24 04:15",
        triagePriority: "EMERGENT_STAT_DIALYSIS",
        primaryEtiology: "Severe Traumatic Rhabdomyolysis with Life-Threatening Hyperkalemia",
        attendingNephrologist: "Dr. Alistair Sterling, MD, FASN",
        leadDialysisNurse: "Sarah Jenkins, BSN, CNN",
        kdigoStage: "STAGE_3_FAILURE",
        currentModality: "IHD_INTERMITTENT_HEMODIALYSIS",
        anticoagulation: "SALINE_FLUSH_NO_ANTICOAGULATION",
        vascularAccess: "RIGHT_INTERNAL_JUGULAR_VAS_CATH",
        vitals: {
          heartRate: 118,
          systolicBp: 92,
          diastolicBp: 54,
          meanArterialPressure: 66,
          spO2: 97,
          respiratoryRate: 26,
          coreTemperatureCelsius: 38.2
        },
        circuit: {
          bloodFlowRateQbMlMin: 350,
          effluentDoseMlKgHr: 0,
          dialysateFlowRateQdMlHr: 500 * 60,
          replacementPreFilterFlowMlHr: 0,
          replacementPostFilterFlowMlHr: 0,
          ultrafiltrationRateNetMlHr: 500,
          accessPressureArterialMmHg: -140,
          returnPressureVenousMmHg: 160,
          filterInletPressureMmHg: 220,
          effluentPressureMmHg: 0,
          transmembranePressureTmpMmHg: 110,
          filterPressureDropDeltaPMmHg: 60,
          filtrationFractionPercent: 8.5,
          dialyzerMembraneModel: "Fresenius Optiflux F180NR High-Flux Polysulfone",
          filterRunTimeHours: 2.5,
          isFilterClottingRisk: false
        },
        citrate: {
          citrateSolutionType: "ACD_A",
          citrateInfusionRateMmolHr: 0,
          postFilterIonizedCalciumMmolL: 1.22,
          systemicIonizedCalciumMmolL: 1.22,
          calciumChlorideCompensationRateMlHr: 0,
          totalSerumCalciumMmolL: 1.85,
          totalToIonizedCalciumRatio: 1.52,
          isCitrateToxicitySuspected: false
        },
        electrolytes: {
          serumCreatinineMgDl: 6.40,
          baselineCreatinineMgDl: 0.95,
          creatinineDeltaMultiplier: 6.74,
          bloodUreaNitrogenMgDl: 112,
          bunToCreatinineRatio: 17.5,
          serumPotassiumMeqL: 6.85,
          serumSodiumMeqL: 134,
          serumChlorideMeqL: 98,
          serumBicarbonateHco3MeqL: 12.0,
          serumPhosphorusMgDl: 8.9,
          serumMagnesiumMgDl: 3.1,
          serumAlbuminGDl: 3.4,
          bloodPh: 7.15,
          baseExcessDeficit: -12.4,
          serumLactateMmolL: 4.8,
          anionGapMeqL: 24.0,
          albuminCorrectedAnionGap: 25.5,
          deltaDeltaGapRatio: 1.12
        },
        urine: {
          urineOutputLast1HourMl: 5,
          urineOutputLast6HoursMl: 25,
          urineOutputLast12HoursMl: 40,
          urineOutputLast24HoursMl: 80,
          urineOutputNormalizedMlKgHr: 0.04,
          urineSpecificGravity: 1.015,
          urineSodiumMeqL: 74,
          urineCreatinineMgDl: 30,
          urineOsmolalityMosmKg: 290,
          fractionalExcretionOfSodiumFENa: 4.12,
          fractionalExcretionOfUreaFEUrea: 52.0,
          urinarySedimentType: "MUDDY_BROWN_GRANULAR_CASTS_ATN",
          isOliguric: true,
          isAnuric: false
        },
        clearance: {
          estimatedGfrCkdEpi: 8.5,
          creatinineClearanceCrCl: 10.2,
          daugirdasSinglePoolKtV: 1.62,
          ureaReductionRatioURRPercent: 72.4,
          effluentUreaNitrogenMgDl: 95,
          bloodUreaNitrogenPostDialysisMgDl: 31,
          soluteRemovalRateGramsPerDay: 58.0
        },
        fluidBalance: {
          intakeLast24HoursMl: 4800,
          outputLast24HoursMl: 2200,
          netCumulativeBalance24HoursMl: 2600,
          totalFluidOverloadPercentage: 5.0,
          prescribedDailyNetUltrafiltrationGoalMl: 1500,
          hourlyNetUltrafiltrationAchievedMlHr: 500
        },
        activeAlerts: [
          {
            id: "ALT-7103-1",
            patientId: "NEPH-7103",
            timestamp: "5 min ago",
            severity: "CRITICAL_STAT",
            category: "HYPERKALEMIA_ECG_RISK",
            title: "CRITICAL HYPERKALEMIA (Serum K+ 6.85 mEq/L)",
            triggerMeasurement: "Potassium 6.85 mEq/L with Peaked T-Waves on Telemetry",
            expectedRange: "3.5 - 5.0 mEq/L",
            clinicalRationale: "Massive intracellular potassium release from muscle necrosis and anuric renal failure.",
            suggestedAction: "STAT IV Calcium Gluconate (2g), Insulin (10U) + D50W (50mL), and emergency high-flux hemodialysis with 1K dialysate.",
            acknowledged: false
          }
        ],
        dialysisEventsTimeline: [
          {
            timestamp: "2026-08-24 05:00",
            event: "Emergency Hemodialysis initiated for refractory hyperkalemia.",
            modality: "IHD",
            provider: "Dr. Alistair Sterling, MD"
          }
        ]
      },
      {
        id: "NEPH-7104",
        mrn: "MRN-5510293",
        name: "Victoria Sterling",
        age: 66,
        gender: "FEMALE",
        dryWeightKg: 70.0,
        currentWeightKg: 73.8,
        heightCm: 168,
        bodySurfaceAreaM2: 1.80,
        renalWardBed: "CTICU-BED-06 (SLED)",
        admissionDate: "2026-08-23 18:40",
        triagePriority: "HIGH_CRITICAL_AKI",
        primaryEtiology: "Post-Cardiopulmonary Bypass Vasoplegic AKI & Ischemic Tubular Damage",
        attendingNephrologist: "Dr. Clara Hensley, MD",
        leadDialysisNurse: "Jennifer Morales, BSN, CNN",
        kdigoStage: "STAGE_2_INJURY",
        currentModality: "SLED_SUSTAINED_LOW_EFFICIENCY",
        anticoagulation: "REGIONAL_CITRATE_RCA",
        vascularAccess: "RIGHT_INTERNAL_JUGULAR_VAS_CATH",
        vitals: {
          heartRate: 92,
          systolicBp: 102,
          diastolicBp: 58,
          meanArterialPressure: 72,
          spO2: 96,
          respiratoryRate: 18,
          coreTemperatureCelsius: 36.8
        },
        circuit: {
          bloodFlowRateQbMlMin: 220,
          effluentDoseMlKgHr: 22.0,
          dialysateFlowRateQdMlHr: 1800,
          replacementPreFilterFlowMlHr: 400,
          replacementPostFilterFlowMlHr: 200,
          ultrafiltrationRateNetMlHr: 150,
          accessPressureArterialMmHg: -95,
          returnPressureVenousMmHg: 110,
          filterInletPressureMmHg: 175,
          effluentPressureMmHg: -10,
          transmembranePressureTmpMmHg: 180,
          filterPressureDropDeltaPMmHg: 65,
          filtrationFractionPercent: 14.8,
          dialyzerMembraneModel: "Baxter Prismaflex M150 AN69",
          filterRunTimeHours: 32.0,
          isFilterClottingRisk: false
        },
        citrate: {
          citrateSolutionType: "ACD_A",
          citrateInfusionRateMmolHr: 2.8,
          postFilterIonizedCalciumMmolL: 0.29,
          systemicIonizedCalciumMmolL: 1.14,
          calciumChlorideCompensationRateMlHr: 32.0,
          totalSerumCalciumMmolL: 2.20,
          totalToIonizedCalciumRatio: 1.93,
          isCitrateToxicitySuspected: false
        },
        electrolytes: {
          serumCreatinineMgDl: 3.12,
          baselineCreatinineMgDl: 1.20,
          creatinineDeltaMultiplier: 2.60,
          bloodUreaNitrogenMgDl: 72,
          bunToCreatinineRatio: 23.0,
          serumPotassiumMeqL: 5.1,
          serumSodiumMeqL: 139,
          serumChlorideMeqL: 104,
          serumBicarbonateHco3MeqL: 18.2,
          serumPhosphorusMgDl: 5.4,
          serumMagnesiumMgDl: 2.2,
          serumAlbuminGDl: 3.0,
          bloodPh: 7.31,
          baseExcessDeficit: -5.4,
          serumLactateMmolL: 2.2,
          anionGapMeqL: 16.8,
          albuminCorrectedAnionGap: 19.3,
          deltaDeltaGapRatio: 1.25
        },
        urine: {
          urineOutputLast1HourMl: 28,
          urineOutputLast6HoursMl: 160,
          urineOutputLast12HoursMl: 310,
          urineOutputLast24HoursMl: 620,
          urineOutputNormalizedMlKgHr: 0.38,
          urineSpecificGravity: 1.014,
          urineSodiumMeqL: 48,
          urineCreatinineMgDl: 55,
          urineOsmolalityMosmKg: 340,
          fractionalExcretionOfSodiumFENa: 2.15,
          fractionalExcretionOfUreaFEUrea: 42.0,
          urinarySedimentType: "MUDDY_BROWN_GRANULAR_CASTS_ATN",
          isOliguric: true,
          isAnuric: false
        },
        clearance: {
          estimatedGfrCkdEpi: 16.4,
          creatinineClearanceCrCl: 19.5,
          daugirdasSinglePoolKtV: 1.24,
          ureaReductionRatioURRPercent: 62.0,
          effluentUreaNitrogenMgDl: 58,
          bloodUreaNitrogenPostDialysisMgDl: 36,
          soluteRemovalRateGramsPerDay: 32.0
        },
        fluidBalance: {
          intakeLast24HoursMl: 2600,
          outputLast24HoursMl: 3800,
          netCumulativeBalance24HoursMl: -1200,
          totalFluidOverloadPercentage: 5.4,
          prescribedDailyNetUltrafiltrationGoalMl: 1800,
          hourlyNetUltrafiltrationAchievedMlHr: 150
        },
        activeAlerts: [],
        dialysisEventsTimeline: [
          {
            timestamp: "2026-08-23 20:00",
            event: "SLED 8-hour session initiated with regional citrate.",
            modality: "SLED",
            provider: "Jennifer Morales, BSN"
          }
        ]
      },
      {
        id: "NEPH-7105",
        mrn: "MRN-4491028",
        name: "Dr. Arthur Pendelton",
        age: 69,
        gender: "MALE",
        dryWeightKg: 78.0,
        currentWeightKg: 80.2,
        heightCm: 175,
        bodySurfaceAreaM2: 1.94,
        renalWardBed: "RENAL-STEPDOWN-BED-01",
        admissionDate: "2026-08-21 14:20",
        triagePriority: "MODERATE_MONITORING",
        primaryEtiology: "Multiple Myeloma Kappa Light Chain Cast Nephropathy",
        attendingNephrologist: "Dr. Alistair Sterling, MD, FASN",
        leadDialysisNurse: "David Miller, RN, CNN",
        kdigoStage: "STAGE_3_FAILURE",
        currentModality: "PIRRT_PROLONGED_INTERMITTENT",
        anticoagulation: "SYSTEMIC_UNFRACTIONATED_HEPARIN",
        vascularAccess: "RADIO_CEPHALIC_AV_FISTULA",
        vitals: {
          heartRate: 76,
          systolicBp: 122,
          diastolicBp: 70,
          meanArterialPressure: 87,
          spO2: 98,
          respiratoryRate: 16,
          coreTemperatureCelsius: 36.7
        },
        circuit: {
          bloodFlowRateQbMlMin: 250,
          effluentDoseMlKgHr: 24.0,
          dialysateFlowRateQdMlHr: 1500,
          replacementPreFilterFlowMlHr: 500,
          replacementPostFilterFlowMlHr: 250,
          ultrafiltrationRateNetMlHr: 100,
          accessPressureArterialMmHg: -90,
          returnPressureVenousMmHg: 105,
          filterInletPressureMmHg: 165,
          effluentPressureMmHg: -5,
          transmembranePressureTmpMmHg: 130,
          filterPressureDropDeltaPMmHg: 60,
          filtrationFractionPercent: 12.0,
          dialyzerMembraneModel: "Theralite High Cut-Off HCO1100 Membrane",
          filterRunTimeHours: 12.4,
          isFilterClottingRisk: false
        },
        citrate: {
          citrateSolutionType: "ACD_A",
          citrateInfusionRateMmolHr: 0,
          postFilterIonizedCalciumMmolL: 1.20,
          systemicIonizedCalciumMmolL: 1.20,
          calciumChlorideCompensationRateMlHr: 0,
          totalSerumCalciumMmolL: 2.45,
          totalToIonizedCalciumRatio: 2.04,
          isCitrateToxicitySuspected: false
        },
        electrolytes: {
          serumCreatinineMgDl: 4.10,
          baselineCreatinineMgDl: 1.00,
          creatinineDeltaMultiplier: 4.10,
          bloodUreaNitrogenMgDl: 68,
          bunToCreatinineRatio: 16.5,
          serumPotassiumMeqL: 4.6,
          serumSodiumMeqL: 136,
          serumChlorideMeqL: 100,
          serumBicarbonateHco3MeqL: 20.4,
          serumPhosphorusMgDl: 4.8,
          serumMagnesiumMgDl: 2.0,
          serumAlbuminGDl: 3.2,
          bloodPh: 7.36,
          baseExcessDeficit: -3.2,
          serumLactateMmolL: 1.4,
          anionGapMeqL: 15.6,
          albuminCorrectedAnionGap: 17.6,
          deltaDeltaGapRatio: 1.15
        },
        urine: {
          urineOutputLast1HourMl: 45,
          urineOutputLast6HoursMl: 280,
          urineOutputLast12HoursMl: 580,
          urineOutputLast24HoursMl: 1200,
          urineOutputNormalizedMlKgHr: 0.64,
          urineSpecificGravity: 1.010,
          urineSodiumMeqL: 62,
          urineCreatinineMgDl: 48,
          urineOsmolalityMosmKg: 280,
          fractionalExcretionOfSodiumFENa: 2.84,
          fractionalExcretionOfUreaFEUrea: 44.0,
          urinarySedimentType: "MUDDY_BROWN_GRANULAR_CASTS_ATN",
          isOliguric: false,
          isAnuric: false
        },
        clearance: {
          estimatedGfrCkdEpi: 14.2,
          creatinineClearanceCrCl: 17.0,
          daugirdasSinglePoolKtV: 1.35,
          ureaReductionRatioURRPercent: 65.4,
          effluentUreaNitrogenMgDl: 52,
          bloodUreaNitrogenPostDialysisMgDl: 26,
          soluteRemovalRateGramsPerDay: 36.0
        },
        fluidBalance: {
          intakeLast24HoursMl: 2200,
          outputLast24HoursMl: 2600,
          netCumulativeBalance24HoursMl: -400,
          totalFluidOverloadPercentage: 2.8,
          prescribedDailyNetUltrafiltrationGoalMl: 500,
          hourlyNetUltrafiltrationAchievedMlHr: 100
        },
        activeAlerts: [],
        dialysisEventsTimeline: [
          {
            timestamp: "2026-08-22 09:00",
            event: "PIRRT 10-hour session initiated with Theralite HCO membrane.",
            modality: "PIRRT",
            provider: "David Miller, RN"
          }
        ]
      },
      {
        id: "NEPH-7106",
        mrn: "MRN-3391820",
        name: "Gabriel O'Connor",
        age: 52,
        gender: "MALE",
        dryWeightKg: 85.0,
        currentWeightKg: 96.5,
        heightCm: 176,
        bodySurfaceAreaM2: 2.04,
        renalWardBed: "ICU-BED-07 (MARS/CVVH)",
        admissionDate: "2026-08-23 02:10",
        triagePriority: "HIGH_CRITICAL_AKI",
        primaryEtiology: "Decompensated Hepatorenal Syndrome Type 1 (HRS-AKI) with Refractory Ascites",
        attendingNephrologist: "Dr. Clara Hensley, MD",
        leadDialysisNurse: "Sarah Jenkins, BSN, CNN",
        kdigoStage: "STAGE_3_FAILURE",
        currentModality: "CVVH_CONTINUOUS_HEMOFILTRATION",
        anticoagulation: "ARGATROBAN_HIT",
        vascularAccess: "RIGHT_INTERNAL_JUGULAR_VAS_CATH",
        vitals: {
          heartRate: 98,
          systolicBp: 88,
          diastolicBp: 48,
          meanArterialPressure: 61,
          spO2: 94,
          respiratoryRate: 22,
          coreTemperatureCelsius: 36.4
        },
        circuit: {
          bloodFlowRateQbMlMin: 180,
          effluentDoseMlKgHr: 26.0,
          dialysateFlowRateQdMlHr: 0,
          replacementPreFilterFlowMlHr: 1400,
          replacementPostFilterFlowMlHr: 600,
          ultrafiltrationRateNetMlHr: 150,
          accessPressureArterialMmHg: -105,
          returnPressureVenousMmHg: 120,
          filterInletPressureMmHg: 185,
          effluentPressureMmHg: -12,
          transmembranePressureTmpMmHg: 155,
          filterPressureDropDeltaPMmHg: 65,
          filtrationFractionPercent: 16.5,
          dialyzerMembraneModel: "Baxter Prismaflex HF20",
          filterRunTimeHours: 24.5,
          isFilterClottingRisk: false
        },
        citrate: {
          citrateSolutionType: "ACD_A",
          citrateInfusionRateMmolHr: 0,
          postFilterIonizedCalciumMmolL: 1.12,
          systemicIonizedCalciumMmolL: 1.12,
          calciumChlorideCompensationRateMlHr: 0,
          totalSerumCalciumMmolL: 2.10,
          totalToIonizedCalciumRatio: 1.88,
          isCitrateToxicitySuspected: false
        },
        electrolytes: {
          serumCreatinineMgDl: 3.75,
          baselineCreatinineMgDl: 0.85,
          creatinineDeltaMultiplier: 4.41,
          bloodUreaNitrogenMgDl: 76,
          bunToCreatinineRatio: 20.3,
          serumPotassiumMeqL: 5.3,
          serumSodiumMeqL: 126,
          serumChlorideMeqL: 90,
          serumBicarbonateHco3MeqL: 17.0,
          serumPhosphorusMgDl: 5.8,
          serumMagnesiumMgDl: 1.8,
          serumAlbuminGDl: 2.2,
          bloodPh: 7.29,
          baseExcessDeficit: -6.8,
          serumLactateMmolL: 3.1,
          anionGapMeqL: 19.0,
          albuminCorrectedAnionGap: 23.5,
          deltaDeltaGapRatio: 1.35
        },
        urine: {
          urineOutputLast1HourMl: 8,
          urineOutputLast6HoursMl: 42,
          urineOutputLast12HoursMl: 85,
          urineOutputLast24HoursMl: 160,
          urineOutputNormalizedMlKgHr: 0.08,
          urineSpecificGravity: 1.025,
          urineSodiumMeqL: 8,
          urineCreatinineMgDl: 140,
          urineOsmolalityMosmKg: 580,
          fractionalExcretionOfSodiumFENa: 0.28,
          fractionalExcretionOfUreaFEUrea: 22.0,
          urinarySedimentType: "HYALINE_CASTS_PRERENAL",
          isOliguric: true,
          isAnuric: false
        },
        clearance: {
          estimatedGfrCkdEpi: 15.1,
          creatinineClearanceCrCl: 18.2,
          daugirdasSinglePoolKtV: 1.38,
          ureaReductionRatioURRPercent: 64.0,
          effluentUreaNitrogenMgDl: 62,
          bloodUreaNitrogenPostDialysisMgDl: 30,
          soluteRemovalRateGramsPerDay: 38.0
        },
        fluidBalance: {
          intakeLast24HoursMl: 2800,
          outputLast24HoursMl: 4200,
          netCumulativeBalance24HoursMl: -1400,
          totalFluidOverloadPercentage: 13.5,
          prescribedDailyNetUltrafiltrationGoalMl: 2000,
          hourlyNetUltrafiltrationAchievedMlHr: 150
        },
        activeAlerts: [
          {
            id: "ALT-7106-1",
            patientId: "NEPH-7106",
            timestamp: "35 min ago",
            severity: "HIGH_WARNING",
            category: "METABOLIC_ACIDOSIS",
            title: "Severe Hyponatremic Acidosis (Na 126 mEq/L, pH 7.29)",
            triggerMeasurement: "Serum Na 126 mEq/L • Corrected AG 23.5",
            expectedRange: "Na 135-145 mEq/L • pH 7.35-7.45",
            clinicalRationale: "Hepatorenal syndrome with severe hypervolemic hyponatremia and impaired lactate clearance.",
            suggestedAction: "Adjust replacement fluid sodium concentration to avoid rapid osmotic demyelination; maintain MAP > 65 with norepinephrine.",
            acknowledged: true,
            acknowledgedBy: "Dr. Clara Hensley, MD",
            acknowledgedTimestamp: "30 min ago"
          }
        ],
        dialysisEventsTimeline: [
          {
            timestamp: "2026-08-23 04:00",
            event: "CVVH initiated with pre-dilution for HRS-AKI.",
            modality: "CVVH",
            provider: "Sarah Jenkins, BSN"
          }
        ]
      },
      {
        id: "NEPH-7107",
        mrn: "MRN-2281903",
        name: "Maya Lin",
        age: 26,
        gender: "FEMALE",
        dryWeightKg: 54.0,
        currentWeightKg: 58.2,
        heightCm: 160,
        bodySurfaceAreaM2: 1.55,
        renalWardBed: "RENAL-WARD-BED-12",
        admissionDate: "2026-08-22 16:30",
        triagePriority: "HIGH_CRITICAL_AKI",
        primaryEtiology: "Lupus Nephritis Class IV (Diffuse Proliferative GN) Flare with Crescent Formation",
        attendingNephrologist: "Dr. Alistair Sterling, MD, FASN",
        leadDialysisNurse: "Jennifer Morales, BSN, CNN",
        kdigoStage: "STAGE_3_FAILURE",
        currentModality: "PIRRT_PROLONGED_INTERMITTENT",
        anticoagulation: "SYSTEMIC_UNFRACTIONATED_HEPARIN",
        vascularAccess: "RIGHT_INTERNAL_JUGULAR_VAS_CATH",
        vitals: {
          heartRate: 84,
          systolicBp: 148,
          diastolicBp: 92,
          meanArterialPressure: 110,
          spO2: 99,
          respiratoryRate: 18,
          coreTemperatureCelsius: 37.4
        },
        circuit: {
          bloodFlowRateQbMlMin: 220,
          effluentDoseMlKgHr: 25.0,
          dialysateFlowRateQdMlHr: 1400,
          replacementPreFilterFlowMlHr: 400,
          replacementPostFilterFlowMlHr: 200,
          ultrafiltrationRateNetMlHr: 120,
          accessPressureArterialMmHg: -85,
          returnPressureVenousMmHg: 98,
          filterInletPressureMmHg: 155,
          effluentPressureMmHg: -8,
          transmembranePressureTmpMmHg: 125,
          filterPressureDropDeltaPMmHg: 57,
          filtrationFractionPercent: 11.2,
          dialyzerMembraneModel: "Fresenius Optiflux F160NR",
          filterRunTimeHours: 8.0,
          isFilterClottingRisk: false
        },
        citrate: {
          citrateSolutionType: "ACD_A",
          citrateInfusionRateMmolHr: 0,
          postFilterIonizedCalciumMmolL: 1.18,
          systemicIonizedCalciumMmolL: 1.18,
          calciumChlorideCompensationRateMlHr: 0,
          totalSerumCalciumMmolL: 2.15,
          totalToIonizedCalciumRatio: 1.82,
          isCitrateToxicitySuspected: false
        },
        electrolytes: {
          serumCreatinineMgDl: 4.60,
          baselineCreatinineMgDl: 0.70,
          creatinineDeltaMultiplier: 6.57,
          bloodUreaNitrogenMgDl: 82,
          bunToCreatinineRatio: 17.8,
          serumPotassiumMeqL: 5.2,
          serumSodiumMeqL: 138,
          serumChlorideMeqL: 102,
          serumBicarbonateHco3MeqL: 19.0,
          serumPhosphorusMgDl: 6.0,
          serumMagnesiumMgDl: 2.1,
          serumAlbuminGDl: 2.5,
          bloodPh: 7.33,
          baseExcessDeficit: -4.8,
          serumLactateMmolL: 1.6,
          anionGapMeqL: 17.0,
          albuminCorrectedAnionGap: 20.75,
          deltaDeltaGapRatio: 1.22
        },
        urine: {
          urineOutputLast1HourMl: 22,
          urineOutputLast6HoursMl: 120,
          urineOutputLast12HoursMl: 240,
          urineOutputLast24HoursMl: 520,
          urineOutputNormalizedMlKgHr: 0.40,
          urineSpecificGravity: 1.018,
          urineSodiumMeqL: 38,
          urineCreatinineMgDl: 85,
          urineOsmolalityMosmKg: 420,
          fractionalExcretionOfSodiumFENa: 1.48,
          fractionalExcretionOfUreaFEUrea: 38.0,
          urinarySedimentType: "RBC_CASTS_GLOMERULONEPHRITIS",
          isOliguric: true,
          isAnuric: false
        },
        clearance: {
          estimatedGfrCkdEpi: 12.8,
          creatinineClearanceCrCl: 15.2,
          daugirdasSinglePoolKtV: 1.42,
          ureaReductionRatioURRPercent: 66.8,
          effluentUreaNitrogenMgDl: 68,
          bloodUreaNitrogenPostDialysisMgDl: 29,
          soluteRemovalRateGramsPerDay: 35.0
        },
        fluidBalance: {
          intakeLast24HoursMl: 1900,
          outputLast24HoursMl: 2700,
          netCumulativeBalance24HoursMl: -800,
          totalFluidOverloadPercentage: 7.7,
          prescribedDailyNetUltrafiltrationGoalMl: 1200,
          hourlyNetUltrafiltrationAchievedMlHr: 120
        },
        activeAlerts: [
          {
            id: "ALT-7107-1",
            patientId: "NEPH-7107",
            timestamp: "1 hour ago",
            severity: "MODERATE_ALERT",
            category: "UREMIC_ENCEPHALOPATHY",
            title: "Dysmorphic RBC Casts & Active Nephritic Sediment",
            triggerMeasurement: ">20 Dysmorphic RBCs/HPF with Acanthocytes & RBC Casts",
            expectedRange: "0-2 RBCs/HPF, No Cellular Casts",
            clinicalRationale: "Severe glomerular crescentic proliferation requiring intensive immunosuppression and dialytic support.",
            suggestedAction: "Administer Pulse Methylprednisolone (1g IV) + IV Cyclophosphamide; continue daily PIRRT.",
            acknowledged: true,
            acknowledgedBy: "Dr. Alistair Sterling, MD",
            acknowledgedTimestamp: "50 min ago"
          }
        ],
        dialysisEventsTimeline: [
          {
            timestamp: "2026-08-22 18:00",
            event: "PIRRT initiated for rapidly progressive glomerulonephritis.",
            modality: "PIRRT",
            provider: "Jennifer Morales, BSN"
          }
        ]
      },
      {
        id: "NEPH-7108",
        mrn: "MRN-1109482",
        name: "Samuel Jackson",
        age: 61,
        gender: "MALE",
        dryWeightKg: 80.0,
        currentWeightKg: 85.8,
        heightCm: 172,
        bodySurfaceAreaM2: 1.95,
        renalWardBed: "HD-BAY-03 (OUTPATIENT-ACUTE)",
        admissionDate: "2026-08-24 07:00",
        triagePriority: "HIGH_CRITICAL_AKI",
        primaryEtiology: "End-Stage Renal Disease (ESRD on HD) with Missed Sessions & Acute Flash Pulmonary Edema",
        attendingNephrologist: "Dr. Clara Hensley, MD",
        leadDialysisNurse: "David Miller, RN, CNN",
        kdigoStage: "STAGE_3_FAILURE",
        currentModality: "IHD_INTERMITTENT_HEMODIALYSIS",
        anticoagulation: "SYSTEMIC_UNFRACTIONATED_HEPARIN",
        vascularAccess: "BRACHIO_CEPHALIC_AV_GRAFT",
        vitals: {
          heartRate: 102,
          systolicBp: 178,
          diastolicBp: 102,
          meanArterialPressure: 127,
          spO2: 90,
          respiratoryRate: 28,
          coreTemperatureCelsius: 36.9
        },
        circuit: {
          bloodFlowRateQbMlMin: 400,
          effluentDoseMlKgHr: 0,
          dialysateFlowRateQdMlHr: 600 * 60,
          replacementPreFilterFlowMlHr: 0,
          replacementPostFilterFlowMlHr: 0,
          ultrafiltrationRateNetMlHr: 900,
          accessPressureArterialMmHg: -160,
          returnPressureVenousMmHg: 180,
          filterInletPressureMmHg: 240,
          effluentPressureMmHg: 0,
          transmembranePressureTmpMmHg: 135,
          filterPressureDropDeltaPMmHg: 60,
          filtrationFractionPercent: 7.2,
          dialyzerMembraneModel: "Fresenius Optiflux F200NR",
          filterRunTimeHours: 1.5,
          isFilterClottingRisk: false
        },
        citrate: {
          citrateSolutionType: "ACD_A",
          citrateInfusionRateMmolHr: 0,
          postFilterIonizedCalciumMmolL: 1.25,
          systemicIonizedCalciumMmolL: 1.25,
          calciumChlorideCompensationRateMlHr: 0,
          totalSerumCalciumMmolL: 2.35,
          totalToIonizedCalciumRatio: 1.88,
          isCitrateToxicitySuspected: false
        },
        electrolytes: {
          serumCreatinineMgDl: 9.80,
          baselineCreatinineMgDl: 8.50,
          creatinineDeltaMultiplier: 1.15,
          bloodUreaNitrogenMgDl: 98,
          bunToCreatinineRatio: 10.0,
          serumPotassiumMeqL: 6.2,
          serumSodiumMeqL: 139,
          serumChlorideMeqL: 101,
          serumBicarbonateHco3MeqL: 15.5,
          serumPhosphorusMgDl: 7.4,
          serumMagnesiumMgDl: 2.6,
          serumAlbuminGDl: 3.8,
          bloodPh: 7.26,
          baseExcessDeficit: -8.5,
          serumLactateMmolL: 1.5,
          anionGapMeqL: 22.5,
          albuminCorrectedAnionGap: 23.0,
          deltaDeltaGapRatio: 1.25
        },
        urine: {
          urineOutputLast1HourMl: 0,
          urineOutputLast6HoursMl: 0,
          urineOutputLast12HoursMl: 0,
          urineOutputLast24HoursMl: 0,
          urineOutputNormalizedMlKgHr: 0.00,
          urineSpecificGravity: 1.010,
          urineSodiumMeqL: 0,
          urineCreatinineMgDl: 0,
          urineOsmolalityMosmKg: 0,
          fractionalExcretionOfSodiumFENa: 0,
          fractionalExcretionOfUreaFEUrea: 0,
          urinarySedimentType: "NORMAL_BLAND",
          isOliguric: true,
          isAnuric: true
        },
        clearance: {
          estimatedGfrCkdEpi: 4.2,
          creatinineClearanceCrCl: 5.0,
          daugirdasSinglePoolKtV: 1.72,
          ureaReductionRatioURRPercent: 74.5,
          effluentUreaNitrogenMgDl: 82,
          bloodUreaNitrogenPostDialysisMgDl: 25,
          soluteRemovalRateGramsPerDay: 62.0
        },
        fluidBalance: {
          intakeLast24HoursMl: 1500,
          outputLast24HoursMl: 3600,
          netCumulativeBalance24HoursMl: -2100,
          totalFluidOverloadPercentage: 7.25,
          prescribedDailyNetUltrafiltrationGoalMl: 3500,
          hourlyNetUltrafiltrationAchievedMlHr: 900
        },
        activeAlerts: [
          {
            id: "ALT-7108-1",
            patientId: "NEPH-7108",
            timestamp: "15 min ago",
            severity: "HIGH_WARNING",
            category: "HYPERKALEMIA_ECG_RISK",
            title: "Severe Hyperkalemia & Acute Flash Pulmonary Edema",
            triggerMeasurement: "Potassium 6.2 mEq/L • SpO2 90% on Room Air",
            expectedRange: "3.5 - 5.0 mEq/L • SpO2 > 94%",
            clinicalRationale: "Missed 2 consecutive outpatient hemodialysis sessions leading to volume overload and hyperkalemia.",
            suggestedAction: "High-Flux IHD with 3.5L isolated UF + 2K dialysate bath; high-flow oxygen via BiPAP.",
            acknowledged: false
          }
        ],
        dialysisEventsTimeline: [
          {
            timestamp: "2026-08-24 07:30",
            event: "Intermittent Hemodialysis initiated with 900 mL/hr UF rate.",
            modality: "IHD",
            provider: "David Miller, RN"
          }
        ]
      }
    ];
  }

  private startStreamingSimulator(): void {
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      this.patients = this.patients.map((p) => {
        // Stochastic physiological and circuit drift
        const hrDrift = Math.floor(Math.random() * 5) - 2;
        const mapDrift = Math.floor(Math.random() * 5) - 2;
        const tmpDrift = (Math.random() * 3 - 1);
        const kDrift = (Math.random() * 0.06 - 0.03);

        const newHr = Math.max(50, Math.min(160, p.vitals.heartRate + hrDrift));
        const newMap = Math.max(50, Math.min(140, p.vitals.meanArterialPressure + mapDrift));
        const newTmp = Math.round(Math.max(50, Math.min(380, p.circuit.transmembranePressureTmpMmHg + tmpDrift)));
        const newPotassium = Math.round(Math.max(2.8, Math.min(8.5, p.electrolytes.serumPotassiumMeqL + kDrift)) * 100) / 100;

        const isClotting = newTmp >= 250 || p.circuit.filterPressureDropDeltaPMmHg >= 180;

        return {
          ...p,
          vitals: {
            ...p.vitals,
            heartRate: newHr,
            meanArterialPressure: newMap
          },
          circuit: {
            ...p.circuit,
            transmembranePressureTmpMmHg: newTmp,
            isFilterClottingRisk: isClotting,
            filterRunTimeHours: Math.round((p.circuit.filterRunTimeHours + 0.01) * 100) / 100
          },
          electrolytes: {
            ...p.electrolytes,
            serumPotassiumMeqL: newPotassium
          }
        };
      });

      this.notifyListeners();
    }, 1400);
  }

  public subscribe(listener: (patients: NephrologyPatient[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.patients);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.patients]));
  }

  public getPatients(): NephrologyPatient[] {
    return [...this.patients];
  }

  public getPatientById(id: string): NephrologyPatient | undefined {
    return this.patients.find((p) => p.id === id);
  }

  public getCensusOverview(): NephrologyCensusOverview {
    const kdigo3 = this.patients.filter((p) => p.kdigoStage === "STAGE_3_FAILURE").length;
    const crrtActive = this.patients.filter((p) => p.currentModality.startsWith("CVVH") || p.currentModality === "SCUF").length;
    const ihdActive = this.patients.filter((p) => p.currentModality === "IHD_INTERMITTENT_HEMODIALYSIS" || p.currentModality === "PIRRT_PROLONGED_INTERMITTENT").length;
    const hyperk = this.patients.filter((p) => p.electrolytes.serumPotassiumMeqL >= 6.0).length;
    const citrateTox = this.patients.filter((p) => p.citrate.totalToIonizedCalciumRatio >= 2.5).length;
    const tmpAlarms = this.patients.filter((p) => p.circuit.transmembranePressureTmpMmHg >= 250).length;
    const totalFluidRemovedLiters = Math.round(
      this.patients.reduce((acc, p) => acc + (p.fluidBalance.outputLast24HoursMl - p.fluidBalance.intakeLast24HoursMl), 0) / 1000 * 10
    ) / 10;

    return {
      totalRenalCensus: this.patients.length,
      kdigoStage3Count: kdigo3,
      activeCrrtCircuitsCount: crrtActive,
      activeIhdSessionsCount: ihdActive,
      criticalHyperkalemiaCount: hyperk,
      citrateToxicityWarningCount: citrateTox,
      filterClottingTmpAlarmsCount: tmpAlarms,
      cumulativeFluidRemovedLiters: Math.max(0, totalFluidRemovedLiters)
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
    protocolType: "STAT_EMERGENCY_HEMODIALYSIS" | "HYPERKALEMIA_COCKTAIL_STAT" | "CITRATE_TITRATION_ADJUST" | "DIALYZER_CIRCUIT_EXCHANGE" | "FLUID_OVERLOAD_DECONGESTION",
    notes: string
  ): void {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    this.patients = this.patients.map((p) => {
      if (p.id !== patientId) return p;
      const newTimeline = [
        {
          timestamp,
          event: "STAT PROTOCOL DISPATCHED: " + protocolType.replace(/_/g, " ") + " (" + notes + ")",
          modality: p.currentModality,
          provider: "Attending Nephrology Response Team"
        },
        ...p.dialysisEventsTimeline
      ];
      return {
        ...p,
        dialysisEventsTimeline: newTimeline
      };
    });
    this.notifyListeners();
  }

  public updatePatient(updatedPatient: NephrologyPatient): void {
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
      id: "nephrology-fhir-" + patient.id,
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
            birthDate: (2026 - patient.age) + "-01-01"
          }
        },
        {
          fullUrl: "urn:uuid:observation-kdigo-" + patient.id,
          resource: {
            resourceType: "Observation",
            status: "final",
            code: { text: "KDIGO AKI Classification Stage" },
            valueString: patient.kdigoStage,
            effectiveDateTime: new Date().toISOString()
          }
        },
        {
          fullUrl: "urn:uuid:observation-crrt-tmp-" + patient.id,
          resource: {
            resourceType: "Observation",
            status: "final",
            code: { text: "CRRT Transmembrane Pressure" },
            valueQuantity: {
              value: patient.circuit.transmembranePressureTmpMmHg,
              unit: "mmHg",
              system: "http://unitsofmeasure.org",
              code: "mm[Hg]"
            }
          }
        },
        {
          fullUrl: "urn:uuid:observation-potassium-" + patient.id,
          resource: {
            resourceType: "Observation",
            status: "final",
            code: { text: "Serum Potassium" },
            valueQuantity: {
              value: patient.electrolytes.serumPotassiumMeqL,
              unit: "mEq/L"
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
      "Age",
      "Gender",
      "KDIGO Stage",
      "Modality",
      "Anticoagulation",
      "Serum Creatinine (mg/dL)",
      "Baseline Creatinine (mg/dL)",
      "BUN (mg/dL)",
      "Serum Potassium (mEq/L)",
      "Blood pH",
      "Corrected Anion Gap",
      "Urine Output (mL/kg/hr)",
      "FENa (%)",
      "TMP (mmHg)",
      "Delta P (mmHg)",
      "Blood Flow Qb (mL/min)",
      "Effluent Dose (mL/kg/hr)",
      "Total to iCa Ratio",
      "Citrate Toxicity Risk",
      "24h Net Balance (mL)",
      "Fluid Overload %"
    ].join(",");

    const values = [
      patient.id,
      patient.mrn,
      "\"" + patient.name + "\"",
      patient.age,
      patient.gender,
      patient.kdigoStage,
      patient.currentModality,
      patient.anticoagulation,
      patient.electrolytes.serumCreatinineMgDl,
      patient.electrolytes.baselineCreatinineMgDl,
      patient.electrolytes.bloodUreaNitrogenMgDl,
      patient.electrolytes.serumPotassiumMeqL,
      patient.electrolytes.bloodPh,
      patient.electrolytes.albuminCorrectedAnionGap,
      patient.urine.urineOutputNormalizedMlKgHr,
      patient.urine.fractionalExcretionOfSodiumFENa,
      patient.circuit.transmembranePressureTmpMmHg,
      patient.circuit.filterPressureDropDeltaPMmHg,
      patient.circuit.bloodFlowRateQbMlMin,
      patient.circuit.effluentDoseMlKgHr,
      patient.citrate.totalToIonizedCalciumRatio,
      patient.citrate.isCitrateToxicitySuspected ? "YES" : "NO",
      patient.fluidBalance.netCumulativeBalance24HoursMl,
      patient.fluidBalance.totalFluidOverloadPercentage
    ].join(",");

    return headers + "\n" + values;
  }
}
