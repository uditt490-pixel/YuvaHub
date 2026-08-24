/**
 * Emergency Trauma Resuscitation & Massive Transfusion Protocol (MTP) Clinical Engine
 * Domain: EMERGENCY_MEDICINE / TRAUMA_RESUSCITATION / MTP / TEG_ROTEM / ATLS
 * MedTrack Enterprise Clinical Telemetry Engine
 */

import {
  TraumaPatient,
  TraumaCensusOverview,
  TraumaScores,
  BloodProductUnitLedger,
  TegRotemTelemetry,
  TraumaAlert,
  FastUltrasoundExam,
  AbbreviatedInjuryScale
} from '../types/traumaTelemetry';

export class TraumaTelemetryService {
  private static instance: TraumaTelemetryService;
  private patients: TraumaPatient[] = [];
  private listeners: Array<(patients: TraumaPatient[]) => void> = [];
  private timer: any = null;

  private constructor() {
    this.patients = this.getInitialPatients();
    this.startTelemetryStream();
  }

  public static getInstance(): TraumaTelemetryService {
    if (!TraumaTelemetryService.instance) {
      TraumaTelemetryService.instance = new TraumaTelemetryService();
    }
    return TraumaTelemetryService.instance;
  }

  // ==========================================
  // CLINICAL CALCULATION ENGINES
  // ==========================================

  /**
   * Shock Index (SI) = Heart Rate / Systolic BP
   * Normal: 0.5 - 0.7
   * Occult Shock: > 0.9
   * Severe/Critical: >= 1.3 (associated with high mortality and MTP requirement)
   */
  public static calculateShockIndex(hr: number, sbp: number): number {
    if (sbp <= 0) return 9.99;
    return Number((hr / sbp).toFixed(2));
  }

  /**
   * Age-Adjusted Shock Index (Age * SI)
   * Threshold > 50 denotes high mortality in geriatric and adult trauma.
   */
  public static calculateAgeAdjustedShockIndex(age: number, hr: number, sbp: number): number {
    const si = this.calculateShockIndex(hr, sbp);
    return Number((age * si).toFixed(1));
  }

  /**
   * Reverse Shock Index multiplied by GCS (rSIG) = (SBP / HR) * GCS
   * Normal: > 15
   * Moderate Risk: 10 - 14
   * Severe Instability: < 10 (high sensitivity for immediate operative intervention & mortality)
   */
  public static calculateReverseShockIndexGcs(sbp: number, hr: number, gcs: number): number {
    if (hr <= 0) return 0;
    const val = (sbp / hr) * gcs;
    return Number(val.toFixed(2));
  }

  /**
   * Assessment of Blood Consumption (ABC) Score (0 to 4)
   * 1 point each for:
   * 1. Penetrating trauma mechanism
   * 2. Emergency Dept SBP <= 90 mmHg
   * 3. Emergency Dept HR >= 120 bpm
   * 4. Positive FAST ultrasound
   * Score >= 2 strongly indicates need for Massive Transfusion Protocol (MTP).
   */
  public static calculateAbcScore(
    isPenetrating: boolean,
    sbp: number,
    hr: number,
    isFastPositive: boolean
  ): number {
    let score = 0;
    if (isPenetrating) score += 1;
    if (sbp <= 90) score += 1;
    if (hr >= 120) score += 1;
    if (isFastPositive) score += 1;
    return score;
  }

  /**
   * Revised Trauma Score (RTS) for Triage and Physiological Assessment
   * RTS = 0.9368 * GCS_code + 0.7326 * SBP_code + 0.2908 * RR_code
   * Coded values 0 to 4 based on standard ATLS stratification.
   */
  public static calculateRevisedTraumaScore(gcs: number, sbp: number, rr: number): number {
    let gcsCode = 4;
    if (gcs <= 3) gcsCode = 0;
    else if (gcs <= 5) gcsCode = 1;
    else if (gcs <= 8) gcsCode = 2;
    else if (gcs <= 12) gcsCode = 3;

    let sbpCode = 4;
    if (sbp <= 0) sbpCode = 0;
    else if (sbp <= 49) sbpCode = 1;
    else if (sbp <= 75) sbpCode = 2;
    else if (sbp <= 89) sbpCode = 3;

    let rrCode = 4;
    if (rr <= 0) rrCode = 0;
    else if (rr <= 5) rrCode = 1;
    else if (rr <= 9) rrCode = 2;
    else if (rr >= 30) rrCode = 3;
    else if (rr >= 10 && rr <= 29) rrCode = 4;

    const rts = 0.9368 * gcsCode + 0.7326 * sbpCode + 0.2908 * rrCode;
    return Number(rts.toFixed(3));
  }

  /**
   * Injury Severity Score (ISS) = Sum of squares of highest AIS scores in 3 different body regions
   * Maximum score 75 (or 75 automatically if any single region is 6 - unsurvivable).
   */
  public static calculateIss(ais: Omit<AbbreviatedInjuryScale, 'injurySeverityScore_ISS' | 'issMortalityCategory'>): {
    score: number;
    category: AbbreviatedInjuryScale['issMortalityCategory'];
  } {
    const scores = [
      ais.headNeck,
      ais.face,
      ais.chest,
      ais.abdomenPelvis,
      ais.extremitiesPelvicGirdle,
      ais.externalBurns
    ];

    if (scores.some((s) => s === 6)) {
      return { score: 75, category: 'MAXIMAL_LETHAL_50_PLUS' };
    }

    const sorted = [...scores].sort((a, b) => b - a);
    const top3 = sorted.slice(0, 3);
    const iss = top3.reduce((sum, val) => sum + val * val, 0);

    let category: AbbreviatedInjuryScale['issMortalityCategory'] = 'MILD_UNDER_9';
    if (iss >= 50) category = 'MAXIMAL_LETHAL_50_PLUS';
    else if (iss >= 25) category = 'CRITICAL_25_TO_49';
    else if (iss >= 16) category = 'SEVERE_16_TO_24';
    else if (iss >= 9) category = 'MODERATE_9_TO_15';

    return { score: iss, category };
  }

  /**
   * Trauma Associated Severe Hemorrhage (TASH) Score Calculation
   */
  public static calculateTashScore(
    sbp: number,
    hb: number,
    fastPositive: boolean,
    clinPelvicFracture: boolean,
    clinFemurFracture: boolean,
    hr: number,
    baseDeficit: number
  ): number {
    let tash = 0;
    if (sbp < 100) tash += 4;
    else if (sbp < 120) tash += 1;

    if (hb < 7) tash += 8;
    else if (hb < 9) tash += 6;
    else if (hb < 10) tash += 4;
    else if (hb < 11) tash += 3;

    if (fastPositive) tash += 3;
    if (clinPelvicFracture) tash += 6;
    if (clinFemurFracture) tash += 3;
    if (hr > 120) tash += 2;

    if (baseDeficit > 10) tash += 4;
    else if (baseDeficit > 6) tash += 3;
    else if (baseDeficit > 2) tash += 1;

    return tash;
  }

  /**
   * Lethal Triad Risk Evaluator
   * Hypothermia (< 35.0 C) + Acidosis (pH < 7.20 or BD > 6.0) + Coagulopathy (INR > 1.5, Plt < 100k)
   */
  public static calculateLethalTriad(
    tempCelsius: number,
    ph: number,
    baseDeficit: number,
    inr: number,
    plateletsK: number
  ) {
    const hypothermiaPresent = tempCelsius < 35.0;
    const acidosisPresent = ph < 7.20 || baseDeficit > 6.0;
    const coagulopathyPresent = inr > 1.5 || plateletsK < 100;

    let triadCount = 0;
    if (hypothermiaPresent) triadCount++;
    if (acidosisPresent) triadCount++;
    if (coagulopathyPresent) triadCount++;

    let mortalityRiskPercent = 10;
    if (triadCount === 1) mortalityRiskPercent = 25;
    else if (triadCount === 2) mortalityRiskPercent = 52;
    else if (triadCount === 3) mortalityRiskPercent = 88;

    return {
      hypothermiaPresent,
      acidosisPresent,
      coagulopathyPresent,
      triadCount,
      mortalityRiskPercent
    };
  }

  /**
   * MTP Balanced Blood Product Ratio & Citrate Toxicity Evaluator
   */
  public static calculateMtpMetrics(
    prbc: number,
    ffp: number,
    plt: number,
    caAdministeredGrams: number
  ): {
    prbcToFfpRatio: number;
    prbcToPltRatio: number;
    isBalanced: boolean;
    calciumDeficitPending: number;
    interpretation: string;
  } {
    const ffpAdj = ffp > 0 ? ffp : 1;
    const pltAdj = plt > 0 ? plt : 1;

    const prbcToFfpRatio = Number((prbc / ffpAdj).toFixed(2));
    const prbcToPltRatio = Number((prbc / pltAdj).toFixed(2));

    const isBalanced =
      prbc === 0 ||
      (prbcToFfpRatio >= 0.8 && prbcToFfpRatio <= 1.5 && prbcToPltRatio >= 0.8 && prbcToPltRatio <= 2.0);

    const expectedCaGrams = Math.floor(prbc / 4);
    const calciumDeficitPending = Math.max(0, expectedCaGrams - caAdministeredGrams);

    let interpretation = 'Balanced 1:1:1 Resuscitation';
    if (!isBalanced && prbc > 4) {
      if (prbcToFfpRatio > 1.8) interpretation = 'CRITICAL: FFP Deficit - Risk of Dilutional Coagulopathy';
      else if (prbcToPltRatio > 2.5) interpretation = 'CRITICAL: Platelet Deficit - Risk of Microvascular Bleeding';
    }

    return {
      prbcToFfpRatio,
      prbcToPltRatio,
      isBalanced,
      calciumDeficitPending,
      interpretation
    };
  }

  /**
   * TEG / ROTEM Viscoelastic Coagulopathy Interpretation
   */
  public static interpretTegRotem(
    rTime: number,
    kTime: number,
    alphaAngle: number,
    ma: number,
    ly30: number
  ): {
    interpretation: string;
    intervention: TegRotemTelemetry['recommendedIntervention'];
  } {
    if (ly30 > 3.0) {
      return {
        interpretation: 'Primary Hyperfibrinolysis Detected (LY30 > 3%). Clot breakdown accelerated.',
        intervention: 'ADMINISTER_TXA_HYPERFIBRINOLYSIS'
      };
    }

    if (rTime > 10.0 && ma < 50.0) {
      return {
        interpretation: 'Combined Coagulopathy: Clotting Factor Depletion + Severe Thrombocytopenia/Platelet Dysfunction.',
        intervention: 'COMBINED_COAGULOPATHY'
      };
    }

    if (rTime > 10.0) {
      return {
        interpretation: 'Prolonged R-Time (>10 min): Enzymatic Clotting Factor Deficiency.',
        intervention: 'ADMINISTER_FFP_PCC'
      };
    }

    if (alphaAngle < 53.0 || kTime > 3.0) {
      return {
        interpretation: 'Decreased Alpha Angle (<53 deg) / Prolonged K-Time: Fibrinogen Deficiency or Impaired Crosslinking.',
        intervention: 'ADMINISTER_CRYOPRECIPITATE'
      };
    }

    if (ma < 50.0) {
      return {
        interpretation: 'Low Maximum Amplitude (MA < 50 mm): Platelet Hypofunction or Severe Thrombocytopenia.',
        intervention: 'ADMINISTER_PLATELETS'
      };
    }

    return {
      interpretation: 'Viscoelastic profile within target physiological hemostatic limits.',
      intervention: 'NONE_NORMAL'
    };
  }

  // ==========================================
  // REAL-TIME PHYSIOLOGICAL STREAM & PATIENT CENSUS
  // ==========================================

  public getPatients(): TraumaPatient[] {
    return [...this.patients];
  }

  public getPatientById(id: string): TraumaPatient | undefined {
    return this.patients.find((p) => p.id === id);
  }

  public getCensusOverview(): TraumaCensusOverview {
    const totalBaysActive = this.patients.length;
    const level1AlphaActive = this.patients.filter((p) => p.triageLevel === 'LEVEL_1_STAT_ALPHA').length;
    const activeMtpCoolersInTransit = this.patients.reduce((sum, p) => sum + (p.bloodLedger.totalCoolersRequested - p.bloodLedger.activeCoolerNumber + 1), 0);
    const activeReboaDeployments = this.patients.filter((p) => p.reboa.status === 'ACTIVE_OCCLUDED' || p.reboa.status === 'PARTIAL_REBOA').length;
    const lethalTriadHighRiskCount = this.patients.filter((p) => p.scores.lethalTriadIndex.triadCount >= 2).length;

    return {
      totalBaysActive,
      level1AlphaActive,
      activeMtpCoolersInTransit: Math.max(0, activeMtpCoolersInTransit),
      activeReboaDeployments,
      lethalTriadHighRiskCount,
      availableDamageControlOrs: 2,
      availableAngioSuites: 1,
      bloodBankUniversalUnitsO_Neg: 24,
      bloodBankUniversalUnitsAB_Ffp: 18
    };
  }

  public subscribe(listener: (patients: TraumaPatient[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.patients]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public updatePatient(updated: TraumaPatient): void {
    this.patients = this.patients.map((p) => (p.id === updated.id ? updated : p));
    this.notifyListeners();
  }

  public acknowledgeAlert(patientId: string, alertId: string, clinicianName: string): void {
    const patient = this.getPatientById(patientId);
    if (!patient) return;

    patient.activeAlerts = patient.activeAlerts.map((a) =>
      a.id === alertId
        ? { ...a, acknowledged: true, acknowledgedBy: clinicianName }
        : a
    );
    this.updatePatient(patient);
  }

  public dispatchEmergencyProtocol(
    patientId: string,
    protocolType: 'CODE_TRAUMA_ALPHA' | 'MTP_ROUND_DISPATCH' | 'EMERGENT_OR_STAT' | 'REBOA_DEPLOY' | 'REBOA_DEFLATE' | 'TXA_BOLUS_ORDER' | 'TEG_GUIDED_CRYO',
    clinicianNotes: string
  ): { success: boolean; message: string; timestamp: string } {
    const patient = this.getPatientById(patientId);
    if (!patient) return { success: false, message: 'Patient not found', timestamp: new Date().toISOString() };

    const ts = new Date().toISOString();
    let eventName = '';

    switch (protocolType) {
      case 'CODE_TRAUMA_ALPHA':
        patient.triageLevel = 'LEVEL_1_STAT_ALPHA';
        patient.currentPhase = 'DAMAGE_CONTROL_RESUSCITATION';
        eventName = 'CODE TRAUMA ALPHA DECLARED: Multidisciplinary Trauma Team, OR, Blood Bank, and IR alerted.';
        break;
      case 'MTP_ROUND_DISPATCH':
        patient.bloodLedger.totalCoolersRequested += 1;
        patient.bloodLedger.activeCoolerNumber = patient.bloodLedger.totalCoolersRequested;
        patient.currentPhase = 'ACTIVE_MTP_TRANSFUSION';
        eventName = 'STAT MTP Cooler #' + patient.bloodLedger.totalCoolersRequested + ' Released (6 pRBC, 6 FFP, 1 Plt Pheresis, 1 Cryo Pool).';
        break;
      case 'EMERGENT_OR_STAT':
        patient.currentPhase = 'EMERGENT_SURGICAL_OR';
        eventName = 'STAT Damage Control Laparotomy / Thoracotomy OR Reserved. Patient transport initiated.';
        break;
      case 'REBOA_DEPLOY':
        patient.reboa.status = 'ACTIVE_OCCLUDED';
        patient.reboa.inflationStartTime = ts;
        patient.reboa.elapsedInflationMinutes = 1;
        eventName = 'REBOA Balloon Deployed & Occluded in ' + patient.reboa.zone + '. Strict Ischemia Timer Active.';
        break;
      case 'REBOA_DEFLATE':
        patient.reboa.status = 'DEFLATED';
        eventName = 'REBOA Balloon Deflated in controlled fashion. Proximal/Distal hemodynamics stable.';
        break;
      case 'TXA_BOLUS_ORDER':
        patient.txaStatus.bolusAdministered = true;
        patient.txaStatus.bolusTime = ts;
        patient.txaStatus.infusionRunning = true;
        patient.txaStatus.infusionStartTime = ts;
        patient.txaStatus.totalTxaAdministeredGrams = 2.0;
        eventName = 'CRASH-2 Protocol Initiated: 1g IV TXA Bolus administered over 10m; 1g/8h infusion running.';
        break;
      case 'TEG_GUIDED_CRYO':
        patient.bloodLedger.cryoprecipitatePoolsTransfused += 2;
        eventName = 'TEG-Guided Targeted Cryoprecipitate (2 Pools / 10 Units) Infused for Fibrinogen deficit.';
        break;
    }

    patient.resuscitationEventsTimeline.unshift({
      timestamp: ts,
      phase: patient.currentPhase,
      event: eventName + ' (Note: ' + clinicianNotes + ')',
      provider: 'Dr. Trauma Lead MD'
    });

    this.updatePatient(patient);
    return { success: true, message: eventName, timestamp: ts };
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => l([...this.patients]));
  }

  private startTelemetryStream(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.tickTelemetry();
    }, 1400);
  }

  private tickTelemetry(): void {
    const updated = this.patients.map((patient) => {
      const hrDelta = (Math.random() - 0.48) * 2;
      const sbpDelta = (Math.random() - 0.5) * 3;
      const dbpDelta = (Math.random() - 0.5) * 2;
      const rrDelta = (Math.random() - 0.5) * 1;
      const tempDelta = (Math.random() - 0.45) * 0.05;

      const newHr = Math.max(45, Math.min(185, Math.round(patient.vitals.heartRate + hrDelta)));
      const newSbp = Math.max(50, Math.min(220, Math.round(patient.vitals.systolicBp + sbpDelta)));
      const newDbp = Math.max(25, Math.min(130, Math.round(patient.vitals.diastolicBp + dbpDelta)));
      const newMap = Math.round((newSbp + 2 * newDbp) / 3);
      const newRr = Math.max(8, Math.min(45, Math.round(patient.vitals.respiratoryRate + rrDelta)));
      const newTemp = Number(Math.max(32.0, Math.min(39.5, patient.vitals.coreTemperatureCelsius + tempDelta)).toFixed(1));

      const si = TraumaTelemetryService.calculateShockIndex(newHr, newSbp);
      const ageSi = TraumaTelemetryService.calculateAgeAdjustedShockIndex(patient.age, newHr, newSbp);
      const rsig = TraumaTelemetryService.calculateReverseShockIndexGcs(newSbp, newHr, patient.gcs.totalGcs);
      const rts = TraumaTelemetryService.calculateRevisedTraumaScore(patient.gcs.totalGcs, newSbp, newRr);
      const lethalTriad = TraumaTelemetryService.calculateLethalTriad(
        newTemp,
        patient.abg.ph,
        Math.abs(patient.abg.baseExcessDeficit),
        patient.abg.inr,
        patient.abg.plateletCountK
      );

      let reboaObj = { ...patient.reboa };
      if (reboaObj.status === 'ACTIVE_OCCLUDED' || reboaObj.status === 'PARTIAL_REBOA') {
        reboaObj.elapsedInflationMinutes = (reboaObj.elapsedInflationMinutes || 0) + 0.1;
      }

      const alerts = [...patient.activeAlerts];

      if (si >= 1.2 && !alerts.some((a) => a.code === 'ALM-SI-CRIT' && !a.acknowledged)) {
        alerts.unshift({
          id: 'alert-' + Date.now() + '-si',
          patientId: patient.id,
          severity: 'CRITICAL_STAT',
          code: 'ALM-SI-CRIT',
          title: 'Critical Shock Index (SI >= 1.2)',
          triggerMeasurement: 'SI: ' + si + ' (HR ' + newHr + ' / SBP ' + newSbp + ')',
          expectedRange: '0.5 - 0.7',
          clinicalRationale: 'Severe hemorrhagic shock with impending cardiovascular collapse. High probability of occult exsanguination.',
          suggestedAction: 'Activate Massive Transfusion Protocol (MTP), verify vascular access, and expedite damage control surgical control.',
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }

      if (lethalTriad.triadCount >= 2 && !alerts.some((a) => a.code === 'ALM-LETHAL-TRIAD' && !a.acknowledged)) {
        alerts.unshift({
          id: 'alert-' + Date.now() + '-lt',
          patientId: patient.id,
          severity: 'CRITICAL_STAT',
          code: 'ALM-LETHAL-TRIAD',
          title: 'Trauma Lethal Triad Active (>= 2 Components)',
          triggerMeasurement: 'Count: ' + lethalTriad.triadCount + '/3 (Temp ' + newTemp + 'C, pH ' + patient.abg.ph + ', INR ' + patient.abg.inr + ')',
          expectedRange: '0 / 3 Triad Features',
          clinicalRationale: 'Synergistic hypothermia, metabolic acidosis, and coagulopathy drastically impair enzyme-dependent clotting cascades.',
          suggestedAction: 'Deploy fluid warmers/Baer Hugger, administer Calcium Chloride & FFP/Cryo, and avoid aggressive crystalloids.',
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }

      if (reboaObj.status === 'ACTIVE_OCCLUDED' && reboaObj.elapsedInflationMinutes >= reboaObj.maxRecommendedInflationMinutes && !alerts.some((a) => a.code === 'ALM-REBOA-TIME' && !a.acknowledged)) {
        alerts.unshift({
          id: 'alert-' + Date.now() + '-reboa',
          patientId: patient.id,
          severity: 'CRITICAL_STAT',
          code: 'ALM-REBOA-TIME',
          title: 'REBOA Maximum Safe Occlusion Time Exceeded',
          triggerMeasurement: 'Inflation: ' + reboaObj.elapsedInflationMinutes.toFixed(0) + ' min (Max: ' + reboaObj.maxRecommendedInflationMinutes + ' min)',
          expectedRange: '< ' + reboaObj.maxRecommendedInflationMinutes + ' min',
          clinicalRationale: 'Prolonged balloon occlusion causes irreversible distal ischemia, visceral infarction, and severe reperfusion syndrome.',
          suggestedAction: 'Initiate partial REBOA deflation in coordination with trauma surgeon or expedite surgical vascular control.',
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }

      return {
        ...patient,
        vitals: {
          ...patient.vitals,
          heartRate: newHr,
          systolicBp: newSbp,
          diastolicBp: newDbp,
          meanArterialPressure: newMap,
          pulsePressure: newSbp - newDbp,
          respiratoryRate: newRr,
          coreTemperatureCelsius: newTemp,
          isShockIndexElevated: si > 0.9
        },
        reboa: reboaObj,
        scores: {
          ...patient.scores,
          shockIndex: si,
          ageAdjustedShockIndex: ageSi,
          reverseShockIndexTimesGcs: rsig,
          revisedTraumaScore_RTS: rts,
          lethalTriadIndex: lethalTriad
        },
        activeAlerts: alerts.slice(0, 10)
      };
    });

    this.patients = updated;
    this.notifyListeners();
  }

  private getInitialPatients(): TraumaPatient[] {
    return [
      {
        id: 'TRM-9401',
        mrn: 'MRN-7839120',
        name: 'Marcus Vance',
        age: 34,
        gender: 'MALE',
        traumaBayNumber: 'TB-01 (STAT RESUS)',
        admissionTime: '12 mins ago',
        triageLevel: 'LEVEL_1_STAT_ALPHA',
        injuryMechanism: 'High-Speed MVC Rollover with Ejection (65 mph, Unrestrained)',
        mechanismCategory: 'MOTOR_VEHICLE_COLLISION',
        primarySurgeon: 'Dr. Elena Rostova, MD (Trauma Attending)',
        leadTraumaNurse: 'Sarah Jenkins, BSN, TCRN',
        currentPhase: 'DAMAGE_CONTROL_RESUSCITATION',
        shockClass: 'CLASS_IV_SEVERE_EXSANGUINATING',
        vitals: {
          heartRate: 138,
          systolicBp: 74,
          diastolicBp: 42,
          meanArterialPressure: 53,
          pulsePressure: 32,
          spO2: 91,
          respiratoryRate: 28,
          endTidalCo2: 24,
          coreTemperatureCelsius: 34.2,
          temperatureProbeSite: 'ESOPHAGEAL',
          invasiveArterialLineSite: 'RIGHT_RADIAL',
          centralVenousPressureMmHg: 4,
          isShockIndexElevated: true
        },
        gcs: {
          eyeResponse: 2,
          verbalResponse: 2,
          motorResponse: 4,
          totalGcs: 8,
          pupilReactivity: 'BILATERAL_REACTIVE',
          motorDeficitSide: 'SYMMETRIC'
        },
        abg: {
          ph: 7.14,
          pao2: 82,
          paco2: 31,
          baseExcessDeficit: -11.2,
          lactateMmolL: 7.8,
          lactateClearance2HrPercent: 12,
          ionizedCalciumMmolL: 0.94,
          hemoglobinGdl: 6.8,
          hematocritPercent: 21,
          plateletCountK: 84,
          inr: 1.85,
          fibrinogenMgDl: 110,
          glucoseMgDl: 198,
          potassiumMeqL: 5.1,
          timestamp: '5 mins ago'
        },
        fastExam: {
          pericardialSubxiphoid: 'NEGATIVE',
          rightUpperQuadrantMorisons: 'POSITIVE_FREE_FLUID',
          leftUpperQuadrantSplenorenal: 'POSITIVE_FREE_FLUID',
          pelvicSuprapubic: 'POSITIVE_FREE_FLUID',
          rightThoraxHemothorax: 'NEGATIVE',
          leftThoraxHemothorax: 'NEGATIVE',
          rightLungPneumothoraxSlide: 'PRESENT_NORMAL',
          leftLungPneumothoraxSlide: 'PRESENT_NORMAL',
          totalPositiveQuadrants: 3,
          performedTimestamp: '8 mins ago',
          sonographer: 'Dr. Rostova'
        },
        reboa: {
          status: 'ACTIVE_OCCLUDED',
          zone: 'ZONE_3_INFRARENAL',
          sheathSizeFr: 7,
          balloonInflationVolumeMl: 2.5,
          inflationStartTime: new Date(Date.now() - 14 * 60000).toISOString(),
          elapsedInflationMinutes: 14,
          maxRecommendedInflationMinutes: 60,
          distalPerfusionCheckPassed: true,
          proximalAorticMapMmHg: 72
        },
        txaStatus: {
          indicated: true,
          bolusAdministered: true,
          bolusTime: '10 mins ago',
          infusionRunning: true,
          infusionStartTime: '8 mins ago',
          injuryToTxaMinutes: 38,
          withinCrash2ThreeHourWindow: true,
          infusionRateMgPerHour: 125,
          totalTxaAdministeredGrams: 2.0
        },
        bloodLedger: {
          prbcUnitsTransfused: 8,
          ffpUnitsTransfused: 6,
          plateletPheresisUnitsTransfused: 1,
          cryoprecipitatePoolsTransfused: 1,
          wholeBloodUnitsTransfused: 2,
          cellSaverVolumeMl: 450,
          calciumChlorideGramsAdministered: 1.0,
          calciumDeficitUnitsPending: 1.0,
          prbcToFfpRatio: 1.33,
          prbcToPlateletRatio: 8.0,
          isBalancedMtpRatio: false,
          rapidInfuserFlowRateMlMin: 350,
          bloodWarmerTempCelsius: 41.5,
          activeCoolerNumber: 2,
          totalCoolersRequested: 3
        },
        tegRotem: {
          modality: 'TEG_6S',
          reactionTimeMinutes_R: 12.4,
          clotKineticsMinutes_K: 4.2,
          alphaAngleDegrees: 46.0,
          maximumAmplitudeMm_MA: 41.5,
          clotLysisPercentage30Min_LY30: 8.2,
          estimatedFibrinogenContribution: 105,
          functionalFibrinogenMA: 11.2,
          coagulopathyInterpretation: 'Severe Trauma-Induced Coagulopathy: Hyperfibrinolysis + Factor Deficit + Platelet Dysfunction',
          recommendedIntervention: 'ADMINISTER_TXA_HYPERFIBRINOLYSIS',
          sampleTimestamp: '6 mins ago'
        },
        aisIss: {
          headNeck: 2,
          face: 1,
          chest: 3,
          abdomenPelvis: 5,
          extremitiesPelvicGirdle: 4,
          externalBurns: 1,
          injurySeverityScore_ISS: 50,
          issMortalityCategory: 'MAXIMAL_LETHAL_50_PLUS'
        },
        scores: {
          shockIndex: 1.86,
          ageAdjustedShockIndex: 63.2,
          reverseShockIndexTimesGcs: 4.29,
          abcScore: 3,
          revisedTraumaScore_RTS: 5.681,
          tashScore: 19,
          lethalTriadIndex: {
            hypothermiaPresent: true,
            acidosisPresent: true,
            coagulopathyPresent: true,
            triadCount: 3,
            mortalityRiskPercent: 88
          }
        },
        allergies: ['Penicillin (Anaphylaxis)', 'Sulfa'],
        intubationStatus: 'ETT_VENTILATED',
        ventilatorSettings: {
          mode: 'PRVC',
          fio2: 1.0,
          peep: 8,
          tidalVolumeMl: 460,
          peakPressureCmH2O: 28
        },
        vascularAccess: {
          cordisIntroducerSites: ['Right Internal Jugular 8.5Fr'],
          peripheralIvGauges: ['Left Antecubital 14G'],
          intraosseousNeedleSites: ['Left Proximal Tibia'],
          arterialLineSites: ['Right Radial 20G']
        },
        activeAlerts: [
          {
            id: 'alt-9401-1',
            patientId: 'TRM-9401',
            severity: 'CRITICAL_STAT',
            code: 'ALM-LETHAL-TRIAD',
            title: 'Trauma Lethal Triad Present (3/3 Criteria)',
            triggerMeasurement: 'Temp 34.2C, pH 7.14, INR 1.85 / Plt 84k',
            expectedRange: 'Temp >36C, pH >7.35, INR <1.2',
            clinicalRationale: 'Profound physiological exhaustion with high mortality risk. Coagulation factor enzymes severely inhibited.',
            suggestedAction: 'Aggressive core rewarming, 1g Calcium Chloride, STAT FFP/Cryo, and rapid surgical hemorrhage control.',
            timestamp: '4 mins ago',
            acknowledged: false
          }
        ],
        resuscitationEventsTimeline: [
          {
            timestamp: '12 mins ago',
            phase: 'PRE_HOSPITAL_TRIAGE',
            event: 'Arrival via Flight for Life. Severe crush mechanism, pelvic binder placed pre-hospital.',
            provider: 'Flight Medic Davis'
          },
          {
            timestamp: '10 mins ago',
            phase: 'PRIMARY_SURVEY_ATLS',
            event: 'ATLS Primary Survey completed: Intubation confirmed, eFAST (+) in 3 quadrants, MTP Round 1 activated.',
            provider: 'Dr. Rostova'
          }
        ]
      },
      {
        id: 'TRM-9402',
        mrn: 'MRN-6192841',
        name: 'Devon Taylor',
        age: 27,
        gender: 'MALE',
        traumaBayNumber: 'TB-02 (EMERGENT OR STAT)',
        admissionTime: '18 mins ago',
        triageLevel: 'LEVEL_1_STAT_ALPHA',
        injuryMechanism: 'Penetrating Ballistic GSW to Left Anterior Chest (4th Intercostal Space)',
        mechanismCategory: 'PENETRATING_BALLISTIC',
        primarySurgeon: 'Dr. Arthur Vance, MD (Thoracic Trauma)',
        leadTraumaNurse: 'Michael Chang, BSN, CEN',
        currentPhase: 'EMERGENT_SURGICAL_OR',
        shockClass: 'CLASS_III_MODERATE_SHOCK',
        vitals: {
          heartRate: 126,
          systolicBp: 88,
          diastolicBp: 56,
          meanArterialPressure: 67,
          pulsePressure: 32,
          spO2: 94,
          respiratoryRate: 24,
          endTidalCo2: 29,
          coreTemperatureCelsius: 35.8,
          temperatureProbeSite: 'ESOPHAGEAL',
          invasiveArterialLineSite: 'LEFT_RADIAL',
          centralVenousPressureMmHg: 16,
          isShockIndexElevated: true
        },
        gcs: {
          eyeResponse: 3,
          verbalResponse: 4,
          motorResponse: 6,
          totalGcs: 13,
          pupilReactivity: 'BILATERAL_REACTIVE',
          motorDeficitSide: 'SYMMETRIC'
        },
        abg: {
          ph: 7.26,
          pao2: 98,
          paco2: 38,
          baseExcessDeficit: -6.4,
          lactateMmolL: 4.8,
          lactateClearance2HrPercent: 22,
          ionizedCalciumMmolL: 1.12,
          hemoglobinGdl: 8.9,
          hematocritPercent: 27,
          plateletCountK: 162,
          inr: 1.32,
          fibrinogenMgDl: 185,
          glucoseMgDl: 145,
          potassiumMeqL: 4.2,
          timestamp: '10 mins ago'
        },
        fastExam: {
          pericardialSubxiphoid: 'POSITIVE_FREE_FLUID',
          rightUpperQuadrantMorisons: 'NEGATIVE',
          leftUpperQuadrantSplenorenal: 'NEGATIVE',
          pelvicSuprapubic: 'NEGATIVE',
          rightThoraxHemothorax: 'NEGATIVE',
          leftThoraxHemothorax: 'POSITIVE_FREE_FLUID',
          rightLungPneumothoraxSlide: 'PRESENT_NORMAL',
          leftLungPneumothoraxSlide: 'ABSENT_PNEUMOTHORAX',
          totalPositiveQuadrants: 2,
          performedTimestamp: '15 mins ago',
          sonographer: 'Dr. Vance'
        },
        reboa: {
          status: 'NOT_INDICATED',
          zone: 'NONE',
          sheathSizeFr: 0,
          balloonInflationVolumeMl: 0,
          elapsedInflationMinutes: 0,
          maxRecommendedInflationMinutes: 30,
          distalPerfusionCheckPassed: true,
          proximalAorticMapMmHg: 67
        },
        txaStatus: {
          indicated: true,
          bolusAdministered: true,
          bolusTime: '12 mins ago',
          infusionRunning: true,
          infusionStartTime: '10 mins ago',
          injuryToTxaMinutes: 24,
          withinCrash2ThreeHourWindow: true,
          infusionRateMgPerHour: 125,
          totalTxaAdministeredGrams: 2.0
        },
        bloodLedger: {
          prbcUnitsTransfused: 4,
          ffpUnitsTransfused: 4,
          plateletPheresisUnitsTransfused: 1,
          cryoprecipitatePoolsTransfused: 0,
          wholeBloodUnitsTransfused: 0,
          cellSaverVolumeMl: 800,
          calciumChlorideGramsAdministered: 1.0,
          calciumDeficitUnitsPending: 0,
          prbcToFfpRatio: 1.0,
          prbcToPlateletRatio: 4.0,
          isBalancedMtpRatio: true,
          rapidInfuserFlowRateMlMin: 200,
          bloodWarmerTempCelsius: 41.0,
          activeCoolerNumber: 1,
          totalCoolersRequested: 2
        },
        tegRotem: {
          modality: 'ROTEM_DELTA',
          reactionTimeMinutes_R: 7.2,
          clotKineticsMinutes_K: 2.1,
          alphaAngleDegrees: 62.0,
          maximumAmplitudeMm_MA: 58.0,
          clotLysisPercentage30Min_LY30: 1.2,
          estimatedFibrinogenContribution: 190,
          functionalFibrinogenMA: 18.5,
          coagulopathyInterpretation: 'Preserved hemostatic profile on ROTEM. Minor factor dilution.',
          recommendedIntervention: 'NONE_NORMAL',
          sampleTimestamp: '8 mins ago'
        },
        aisIss: {
          headNeck: 0,
          face: 0,
          chest: 5,
          abdomenPelvis: 0,
          extremitiesPelvicGirdle: 1,
          externalBurns: 0,
          injurySeverityScore_ISS: 26,
          issMortalityCategory: 'CRITICAL_25_TO_49'
        },
        scores: {
          shockIndex: 1.43,
          ageAdjustedShockIndex: 38.6,
          reverseShockIndexTimesGcs: 9.07,
          abcScore: 4,
          revisedTraumaScore_RTS: 6.902,
          tashScore: 11,
          lethalTriadIndex: {
            hypothermiaPresent: false,
            acidosisPresent: false,
            coagulopathyPresent: false,
            triadCount: 0,
            mortalityRiskPercent: 10
          }
        },
        allergies: ['No Known Drug Allergies (NKDA)'],
        intubationStatus: 'ETT_VENTILATED',
        ventilatorSettings: {
          mode: 'Volume Control',
          fio2: 0.8,
          peep: 5,
          tidalVolumeMl: 480,
          peakPressureCmH2O: 24
        },
        vascularAccess: {
          cordisIntroducerSites: ['Right Subclavian 8.5Fr'],
          peripheralIvGauges: ['Right Forearm 16G', 'Left Forearm 16G'],
          intraosseousNeedleSites: [],
          arterialLineSites: ['Left Radial 20G']
        },
        activeAlerts: [
          {
            id: 'alt-9402-1',
            patientId: 'TRM-9402',
            severity: 'CRITICAL_STAT',
            code: 'ALM-CARDIAC-TAMP',
            title: 'Pericardial Fluid & Elevated CVP (GSW Box Cardiac Injury)',
            triggerMeasurement: 'Subxiphoid FAST (+), CVP 16 mmHg, SBP 88',
            expectedRange: 'Subxiphoid FAST (-), CVP 4-10',
            clinicalRationale: 'Beck Triad indicative of acute cardiac tamponade from penetrating ventricular laceration.',
            suggestedAction: 'Immediate emergent sternotomy / anterolateral thoracotomy in OR Suite 4.',
            timestamp: '12 mins ago',
            acknowledged: true,
            acknowledgedBy: 'Dr. Vance'
          }
        ],
        resuscitationEventsTimeline: [
          {
            timestamp: '18 mins ago',
            phase: 'PRE_HOSPITAL_TRIAGE',
            event: 'EMS arrival with GSW to left chest. Occlusive seal placed.',
            provider: 'EMS Unit 4'
          }
        ]
      },
      {
        id: 'TRM-9403',
        mrn: 'MRN-5582910',
        name: 'Chloe Abernathy',
        age: 19,
        gender: 'FEMALE',
        traumaBayNumber: 'TB-03 (NEURO-TRAUMA)',
        admissionTime: '35 mins ago',
        triageLevel: 'LEVEL_1_STAT_ALPHA',
        injuryMechanism: 'Fall from 3rd Story Balcony (Approx 30 feet, Concrete Landing)',
        mechanismCategory: 'FALL_FROM_HEIGHT',
        primarySurgeon: 'Dr. Maya Lin, MD, PhD (Neurotrauma)',
        leadTraumaNurse: 'Jessica Thorne, RN, CCRN',
        currentPhase: 'PRIMARY_SURVEY_ATLS',
        shockClass: 'CLASS_II_MILD_SHOCK',
        vitals: {
          heartRate: 58,
          systolicBp: 172,
          diastolicBp: 94,
          meanArterialPressure: 120,
          pulsePressure: 78,
          spO2: 98,
          respiratoryRate: 14,
          endTidalCo2: 33,
          coreTemperatureCelsius: 36.4,
          temperatureProbeSite: 'TYMPANIC',
          invasiveArterialLineSite: 'RIGHT_RADIAL',
          isShockIndexElevated: false
        },
        gcs: {
          eyeResponse: 1,
          verbalResponse: 2,
          motorResponse: 3,
          totalGcs: 6,
          pupilReactivity: 'UNILATERAL_FIXED_DILATED',
          motorDeficitSide: 'DECORTICATE'
        },
        abg: {
          ph: 7.38,
          pao2: 122,
          paco2: 34,
          baseExcessDeficit: -2.1,
          lactateMmolL: 2.1,
          ionizedCalciumMmolL: 1.22,
          hemoglobinGdl: 12.4,
          hematocritPercent: 37,
          plateletCountK: 240,
          inr: 1.05,
          fibrinogenMgDl: 280,
          glucoseMgDl: 168,
          potassiumMeqL: 3.9,
          timestamp: '20 mins ago'
        },
        fastExam: {
          pericardialSubxiphoid: 'NEGATIVE',
          rightUpperQuadrantMorisons: 'NEGATIVE',
          leftUpperQuadrantSplenorenal: 'NEGATIVE',
          pelvicSuprapubic: 'NEGATIVE',
          rightThoraxHemothorax: 'NEGATIVE',
          leftThoraxHemothorax: 'NEGATIVE',
          rightLungPneumothoraxSlide: 'PRESENT_NORMAL',
          leftLungPneumothoraxSlide: 'PRESENT_NORMAL',
          totalPositiveQuadrants: 0,
          performedTimestamp: '28 mins ago',
          sonographer: 'Dr. Lin'
        },
        reboa: {
          status: 'NOT_INDICATED',
          zone: 'NONE',
          sheathSizeFr: 0,
          balloonInflationVolumeMl: 0,
          elapsedInflationMinutes: 0,
          maxRecommendedInflationMinutes: 30,
          distalPerfusionCheckPassed: true,
          proximalAorticMapMmHg: 120
        },
        txaStatus: {
          indicated: true,
          bolusAdministered: true,
          bolusTime: '25 mins ago',
          infusionRunning: true,
          infusionStartTime: '20 mins ago',
          injuryToTxaMinutes: 45,
          withinCrash2ThreeHourWindow: true,
          infusionRateMgPerHour: 125,
          totalTxaAdministeredGrams: 2.0
        },
        bloodLedger: {
          prbcUnitsTransfused: 0,
          ffpUnitsTransfused: 0,
          plateletPheresisUnitsTransfused: 0,
          cryoprecipitatePoolsTransfused: 0,
          wholeBloodUnitsTransfused: 0,
          cellSaverVolumeMl: 0,
          calciumChlorideGramsAdministered: 0,
          calciumDeficitUnitsPending: 0,
          prbcToFfpRatio: 1.0,
          prbcToPlateletRatio: 1.0,
          isBalancedMtpRatio: true,
          rapidInfuserFlowRateMlMin: 0,
          bloodWarmerTempCelsius: 37.0,
          activeCoolerNumber: 0,
          totalCoolersRequested: 0
        },
        tegRotem: {
          modality: 'TEG_6S',
          reactionTimeMinutes_R: 6.8,
          clotKineticsMinutes_K: 1.8,
          alphaAngleDegrees: 66.0,
          maximumAmplitudeMm_MA: 64.0,
          clotLysisPercentage30Min_LY30: 0.8,
          estimatedFibrinogenContribution: 275,
          functionalFibrinogenMA: 21.0,
          coagulopathyInterpretation: 'Normal viscoelastic profile. Hypercoagulable response to severe CNS injury.',
          recommendedIntervention: 'NONE_NORMAL',
          sampleTimestamp: '18 mins ago'
        },
        aisIss: {
          headNeck: 5,
          face: 2,
          chest: 1,
          abdomenPelvis: 0,
          extremitiesPelvicGirdle: 3,
          externalBurns: 0,
          injurySeverityScore_ISS: 35,
          issMortalityCategory: 'CRITICAL_25_TO_49'
        },
        scores: {
          shockIndex: 0.34,
          ageAdjustedShockIndex: 6.5,
          reverseShockIndexTimesGcs: 17.79,
          abcScore: 0,
          revisedTraumaScore_RTS: 5.967,
          tashScore: 3,
          lethalTriadIndex: {
            hypothermiaPresent: false,
            acidosisPresent: false,
            coagulopathyPresent: false,
            triadCount: 0,
            mortalityRiskPercent: 10
          }
        },
        allergies: ['NKDA'],
        intubationStatus: 'ETT_VENTILATED',
        ventilatorSettings: {
          mode: 'SIMV/VC',
          fio2: 0.5,
          peep: 5,
          tidalVolumeMl: 420,
          peakPressureCmH2O: 20
        },
        vascularAccess: {
          cordisIntroducerSites: [],
          peripheralIvGauges: ['Right Antecubital 18G', 'Left Antecubital 18G'],
          intraosseousNeedleSites: [],
          arterialLineSites: ['Right Radial 20G']
        },
        activeAlerts: [
          {
            id: 'alt-9403-1',
            patientId: 'TRM-9403',
            severity: 'CRITICAL_STAT',
            code: 'ALM-CUSHING-HERNIATION',
            title: 'Cushing Triad & Unilateral Fixed Pupil (Imminent Herniation)',
            triggerMeasurement: 'Bradycardia (HR 58), HTN (172/94), Right Pupil 6mm Fixed',
            expectedRange: 'HR 60-100, SBP 100-140, Pupils Bilateral 3mm Reactive',
            clinicalRationale: 'Massive acute epidural hematoma with uncal herniation and brainstem compression.',
            suggestedAction: 'Hypertonic saline 3% 250ml bolus, elevate head of bed 30 deg, hyperventilate to PaCO2 30-35, STAT Emergent Craniotomy.',
            timestamp: '15 mins ago',
            acknowledged: true,
            acknowledgedBy: 'Dr. Lin'
          }
        ],
        resuscitationEventsTimeline: [
          {
            timestamp: '35 mins ago',
            phase: 'PRE_HOSPITAL_TRIAGE',
            event: 'Ground fall from balcony. Rapid RSI intubation performed on scene for GCS 6.',
            provider: 'Medic 12'
          }
        ]
      },
      {
        id: 'TRM-9404',
        mrn: 'MRN-3301984',
        name: 'Sergeant Gabriel Price',
        age: 38,
        gender: 'MALE',
        traumaBayNumber: 'TB-04 (BLAST RESUS)',
        admissionTime: '8 mins ago',
        triageLevel: 'LEVEL_1_STAT_ALPHA',
        injuryMechanism: 'Industrial Tank Explosion & Blast Wave with Bilateral Lower Extremity Traumatic Amputations',
        mechanismCategory: 'BLAST_EXPLOSION',
        primarySurgeon: 'Dr. Samuel Bennett, MD (Damage Control Surgery)',
        leadTraumaNurse: 'Ashley Morales, RN, TCRN',
        currentPhase: 'ACTIVE_MTP_TRANSFUSION',
        shockClass: 'CLASS_IV_SEVERE_EXSANGUINATING',
        vitals: {
          heartRate: 144,
          systolicBp: 68,
          diastolicBp: 36,
          meanArterialPressure: 47,
          pulsePressure: 32,
          spO2: 88,
          respiratoryRate: 32,
          endTidalCo2: 21,
          coreTemperatureCelsius: 33.6,
          temperatureProbeSite: 'ESOPHAGEAL',
          invasiveArterialLineSite: 'RIGHT_FEMORAL',
          centralVenousPressureMmHg: 2,
          isShockIndexElevated: true
        },
        gcs: {
          eyeResponse: 1,
          verbalResponse: 1,
          motorResponse: 3,
          totalGcs: 5,
          pupilReactivity: 'BILATERAL_REACTIVE',
          motorDeficitSide: 'DECEREBRATE'
        },
        abg: {
          ph: 7.08,
          pao2: 74,
          paco2: 36,
          baseExcessDeficit: -14.8,
          lactateMmolL: 9.6,
          lactateClearance2HrPercent: 5,
          ionizedCalciumMmolL: 0.88,
          hemoglobinGdl: 5.9,
          hematocritPercent: 18,
          plateletCountK: 58,
          inr: 2.34,
          fibrinogenMgDl: 85,
          glucoseMgDl: 210,
          potassiumMeqL: 5.6,
          timestamp: '3 mins ago'
        },
        fastExam: {
          pericardialSubxiphoid: 'NEGATIVE',
          rightUpperQuadrantMorisons: 'POSITIVE_FREE_FLUID',
          leftUpperQuadrantSplenorenal: 'NEGATIVE',
          pelvicSuprapubic: 'NEGATIVE',
          rightThoraxHemothorax: 'POSITIVE_FREE_FLUID',
          leftThoraxHemothorax: 'POSITIVE_FREE_FLUID',
          rightLungPneumothoraxSlide: 'ABSENT_PNEUMOTHORAX',
          leftLungPneumothoraxSlide: 'ABSENT_PNEUMOTHORAX',
          totalPositiveQuadrants: 3,
          performedTimestamp: '6 mins ago',
          sonographer: 'Dr. Bennett'
        },
        reboa: {
          status: 'ACTIVE_OCCLUDED',
          zone: 'ZONE_1_THORACIC',
          sheathSizeFr: 7,
          balloonInflationVolumeMl: 8.0,
          inflationStartTime: new Date(Date.now() - 6 * 60000).toISOString(),
          elapsedInflationMinutes: 6,
          maxRecommendedInflationMinutes: 30,
          distalPerfusionCheckPassed: false,
          proximalAorticMapMmHg: 70
        },
        txaStatus: {
          indicated: true,
          bolusAdministered: true,
          bolusTime: '5 mins ago',
          infusionRunning: true,
          infusionStartTime: '3 mins ago',
          injuryToTxaMinutes: 18,
          withinCrash2ThreeHourWindow: true,
          infusionRateMgPerHour: 125,
          totalTxaAdministeredGrams: 2.0
        },
        bloodLedger: {
          prbcUnitsTransfused: 12,
          ffpUnitsTransfused: 10,
          plateletPheresisUnitsTransfused: 2,
          cryoprecipitatePoolsTransfused: 2,
          wholeBloodUnitsTransfused: 4,
          cellSaverVolumeMl: 650,
          calciumChlorideGramsAdministered: 2.0,
          calciumDeficitUnitsPending: 1.0,
          prbcToFfpRatio: 1.2,
          prbcToPlateletRatio: 6.0,
          isBalancedMtpRatio: true,
          rapidInfuserFlowRateMlMin: 500,
          bloodWarmerTempCelsius: 41.8,
          activeCoolerNumber: 3,
          totalCoolersRequested: 4
        },
        tegRotem: {
          modality: 'TEG_6S',
          reactionTimeMinutes_R: 16.8,
          clotKineticsMinutes_K: 6.4,
          alphaAngleDegrees: 38.0,
          maximumAmplitudeMm_MA: 32.0,
          clotLysisPercentage30Min_LY30: 16.5,
          estimatedFibrinogenContribution: 80,
          functionalFibrinogenMA: 8.0,
          coagulopathyInterpretation: 'Catastrophic Trauma Coagulopathy with Fulminant Hyperfibrinolysis (LY30 16.5%) and Severe Fibrinogen Depletion.',
          recommendedIntervention: 'COMBINED_COAGULOPATHY',
          sampleTimestamp: '4 mins ago'
        },
        aisIss: {
          headNeck: 2,
          face: 2,
          chest: 4,
          abdomenPelvis: 3,
          extremitiesPelvicGirdle: 5,
          externalBurns: 3,
          injurySeverityScore_ISS: 50,
          issMortalityCategory: 'MAXIMAL_LETHAL_50_PLUS'
        },
        scores: {
          shockIndex: 2.12,
          ageAdjustedShockIndex: 80.5,
          reverseShockIndexTimesGcs: 2.36,
          abcScore: 3,
          revisedTraumaScore_RTS: 4.887,
          tashScore: 24,
          lethalTriadIndex: {
            hypothermiaPresent: true,
            acidosisPresent: true,
            coagulopathyPresent: true,
            triadCount: 3,
            mortalityRiskPercent: 88
          }
        },
        allergies: ['NKDA'],
        intubationStatus: 'ETT_VENTILATED',
        ventilatorSettings: {
          mode: 'Pressure Control',
          fio2: 1.0,
          peep: 10,
          tidalVolumeMl: 440,
          peakPressureCmH2O: 32
        },
        vascularAccess: {
          cordisIntroducerSites: ['Left Internal Jugular 8.5Fr', 'Right Femoral 8.5Fr'],
          peripheralIvGauges: [],
          intraosseousNeedleSites: ['Right Proximal Humerus IO', 'Left Proximal Humerus IO'],
          arterialLineSites: ['Right Femoral 20G']
        },
        activeAlerts: [
          {
            id: 'alt-9404-1',
            patientId: 'TRM-9404',
            severity: 'CRITICAL_STAT',
            code: 'ALM-FULMINANT-COAG',
            title: 'Fulminant Hyperfibrinolysis (LY30 16.5%) & Profound Acidosis (pH 7.08)',
            triggerMeasurement: 'LY30: 16.5%, Base Deficit -14.8 mEq/L, Lactate 9.6',
            expectedRange: 'LY30 < 3.0%, BD > -2.0, Lactate < 2.0',
            clinicalRationale: 'Exsanguinating coagulopathic hemorrhage from multiple blast amputations and blast lung.',
            suggestedAction: 'Administer second 1g TXA bolus, STAT 2 pools Cryoprecipitate, 2g Calcium Chloride, and keep Belmont rapid infuser primed.',
            timestamp: '3 mins ago',
            acknowledged: false
          }
        ],
        resuscitationEventsTimeline: [
          {
            timestamp: '8 mins ago',
            phase: 'PRE_HOSPITAL_TRIAGE',
            event: 'Arrival with CAT tourniquets on both distal thighs. PEA arrest averted with immediate CPR and blood push.',
            provider: 'Dr. Bennett'
          }
        ]
      },
      {
        id: 'TRM-9405',
        mrn: 'MRN-1829031',
        name: 'Lucas Ramirez',
        age: 8,
        gender: 'MALE',
        traumaBayNumber: 'TB-05 (PEDS TRAUMA)',
        admissionTime: '24 mins ago',
        triageLevel: 'LEVEL_2_TRAUMA_BRAVO',
        injuryMechanism: 'Pedestrian Struck by SUV at 25 mph (Thigh Impact & Ground Throw)',
        mechanismCategory: 'PEDESTRIAN_STRUCK',
        primarySurgeon: 'Dr. Hannah Cooper, MD (Pediatric Surgery)',
        leadTraumaNurse: 'Amanda Bell, RN, CPN',
        currentPhase: 'DAMAGE_CONTROL_RESUSCITATION',
        shockClass: 'CLASS_II_MILD_SHOCK',
        vitals: {
          heartRate: 132,
          systolicBp: 92,
          diastolicBp: 58,
          meanArterialPressure: 69,
          pulsePressure: 34,
          spO2: 97,
          respiratoryRate: 26,
          endTidalCo2: 34,
          coreTemperatureCelsius: 36.8,
          temperatureProbeSite: 'RECTAL',
          isShockIndexElevated: true
        },
        gcs: {
          eyeResponse: 4,
          verbalResponse: 4,
          motorResponse: 6,
          totalGcs: 14,
          pupilReactivity: 'BILATERAL_REACTIVE',
          motorDeficitSide: 'SYMMETRIC'
        },
        abg: {
          ph: 7.32,
          pao2: 104,
          paco2: 35,
          baseExcessDeficit: -4.8,
          lactateMmolL: 3.2,
          ionizedCalciumMmolL: 1.18,
          hemoglobinGdl: 10.1,
          hematocritPercent: 31,
          plateletCountK: 215,
          inr: 1.20,
          fibrinogenMgDl: 220,
          glucoseMgDl: 130,
          potassiumMeqL: 4.1,
          timestamp: '12 mins ago'
        },
        fastExam: {
          pericardialSubxiphoid: 'NEGATIVE',
          rightUpperQuadrantMorisons: 'POSITIVE_FREE_FLUID',
          leftUpperQuadrantSplenorenal: 'NEGATIVE',
          pelvicSuprapubic: 'NEGATIVE',
          rightThoraxHemothorax: 'NEGATIVE',
          leftThoraxHemothorax: 'NEGATIVE',
          rightLungPneumothoraxSlide: 'PRESENT_NORMAL',
          leftLungPneumothoraxSlide: 'PRESENT_NORMAL',
          totalPositiveQuadrants: 1,
          performedTimestamp: '20 mins ago',
          sonographer: 'Dr. Cooper'
        },
        reboa: {
          status: 'NOT_INDICATED',
          zone: 'NONE',
          sheathSizeFr: 0,
          balloonInflationVolumeMl: 0,
          elapsedInflationMinutes: 0,
          maxRecommendedInflationMinutes: 30,
          distalPerfusionCheckPassed: true,
          proximalAorticMapMmHg: 69
        },
        txaStatus: {
          indicated: true,
          bolusAdministered: true,
          bolusTime: '18 mins ago',
          infusionRunning: true,
          infusionStartTime: '15 mins ago',
          injuryToTxaMinutes: 30,
          withinCrash2ThreeHourWindow: true,
          infusionRateMgPerHour: 30,
          totalTxaAdministeredGrams: 0.5
        },
        bloodLedger: {
          prbcUnitsTransfused: 1,
          ffpUnitsTransfused: 1,
          plateletPheresisUnitsTransfused: 0,
          cryoprecipitatePoolsTransfused: 0,
          wholeBloodUnitsTransfused: 0,
          cellSaverVolumeMl: 0,
          calciumChlorideGramsAdministered: 0.2,
          calciumDeficitUnitsPending: 0,
          prbcToFfpRatio: 1.0,
          prbcToPlateletRatio: 1.0,
          isBalancedMtpRatio: true,
          rapidInfuserFlowRateMlMin: 60,
          bloodWarmerTempCelsius: 39.5,
          activeCoolerNumber: 1,
          totalCoolersRequested: 1
        },
        tegRotem: {
          modality: 'ROTEM_DELTA',
          reactionTimeMinutes_R: 6.4,
          clotKineticsMinutes_K: 1.9,
          alphaAngleDegrees: 65.0,
          maximumAmplitudeMm_MA: 60.0,
          clotLysisPercentage30Min_LY30: 0.9,
          estimatedFibrinogenContribution: 220,
          functionalFibrinogenMA: 19.0,
          coagulopathyInterpretation: 'Pediatric ROTEM within age-stratified reference targets.',
          recommendedIntervention: 'NONE_NORMAL',
          sampleTimestamp: '10 mins ago'
        },
        aisIss: {
          headNeck: 1,
          face: 1,
          chest: 0,
          abdomenPelvis: 4,
          extremitiesPelvicGirdle: 3,
          externalBurns: 0,
          injurySeverityScore_ISS: 26,
          issMortalityCategory: 'CRITICAL_25_TO_49'
        },
        scores: {
          shockIndex: 1.43,
          ageAdjustedShockIndex: 11.4,
          reverseShockIndexTimesGcs: 9.76,
          abcScore: 1,
          revisedTraumaScore_RTS: 7.550,
          tashScore: 6,
          lethalTriadIndex: {
            hypothermiaPresent: false,
            acidosisPresent: false,
            coagulopathyPresent: false,
            triadCount: 0,
            mortalityRiskPercent: 10
          }
        },
        allergies: ['Amoxicillin (Rash)'],
        intubationStatus: 'NATURAL_SPONTANEOUS',
        vascularAccess: {
          cordisIntroducerSites: [],
          peripheralIvGauges: ['Right Hand 22G', 'Left Antecubital 20G'],
          intraosseousNeedleSites: [],
          arterialLineSites: []
        },
        activeAlerts: [],
        resuscitationEventsTimeline: [
          {
            timestamp: '24 mins ago',
            phase: 'PRE_HOSPITAL_TRIAGE',
            event: 'Pediatric trauma activation. Patient conscious with right femoral deformity and right upper quadrant tenderness.',
            provider: 'Amanda Bell, RN'
          }
        ]
      },
      {
        id: 'TRM-9406',
        mrn: 'MRN-8492019',
        name: 'Evelyn Montgomery',
        age: 74,
        gender: 'FEMALE',
        traumaBayNumber: 'TB-06 (GERIATRIC TRAUMA)',
        admissionTime: '40 mins ago',
        triageLevel: 'LEVEL_2_TRAUMA_BRAVO',
        injuryMechanism: 'Ground Level Fall with Direct Head Strike on Apixaban (Eliquis)',
        mechanismCategory: 'FALL_FROM_HEIGHT',
        primarySurgeon: 'Dr. Nathan Cross, MD (Geriatric Trauma)',
        leadTraumaNurse: 'David Miller, RN',
        currentPhase: 'POST_RESUSCITATION_ICU',
        shockClass: 'CLASS_I_COMPENSATED',
        vitals: {
          heartRate: 76,
          systolicBp: 148,
          diastolicBp: 82,
          meanArterialPressure: 104,
          pulsePressure: 66,
          spO2: 99,
          respiratoryRate: 16,
          endTidalCo2: 36,
          coreTemperatureCelsius: 36.2,
          temperatureProbeSite: 'TYMPANIC',
          isShockIndexElevated: false
        },
        gcs: {
          eyeResponse: 4,
          verbalResponse: 4,
          motorResponse: 6,
          totalGcs: 14,
          pupilReactivity: 'BILATERAL_REACTIVE',
          motorDeficitSide: 'SYMMETRIC'
        },
        abg: {
          ph: 7.41,
          pao2: 92,
          paco2: 39,
          baseExcessDeficit: -1.2,
          lactateMmolL: 1.6,
          ionizedCalciumMmolL: 1.24,
          hemoglobinGdl: 11.8,
          hematocritPercent: 35,
          plateletCountK: 190,
          inr: 1.18,
          fibrinogenMgDl: 310,
          glucoseMgDl: 155,
          potassiumMeqL: 4.4,
          timestamp: '25 mins ago'
        },
        fastExam: {
          pericardialSubxiphoid: 'NEGATIVE',
          rightUpperQuadrantMorisons: 'NEGATIVE',
          leftUpperQuadrantSplenorenal: 'NEGATIVE',
          pelvicSuprapubic: 'NEGATIVE',
          rightThoraxHemothorax: 'NEGATIVE',
          leftThoraxHemothorax: 'NEGATIVE',
          rightLungPneumothoraxSlide: 'PRESENT_NORMAL',
          leftLungPneumothoraxSlide: 'PRESENT_NORMAL',
          totalPositiveQuadrants: 0,
          performedTimestamp: '35 mins ago',
          sonographer: 'Dr. Cross'
        },
        reboa: {
          status: 'NOT_INDICATED',
          zone: 'NONE',
          sheathSizeFr: 0,
          balloonInflationVolumeMl: 0,
          elapsedInflationMinutes: 0,
          maxRecommendedInflationMinutes: 30,
          distalPerfusionCheckPassed: true,
          proximalAorticMapMmHg: 104
        },
        txaStatus: {
          indicated: false,
          bolusAdministered: false,
          infusionRunning: false,
          injuryToTxaMinutes: 0,
          withinCrash2ThreeHourWindow: true,
          infusionRateMgPerHour: 0,
          totalTxaAdministeredGrams: 0
        },
        bloodLedger: {
          prbcUnitsTransfused: 0,
          ffpUnitsTransfused: 0,
          plateletPheresisUnitsTransfused: 0,
          cryoprecipitatePoolsTransfused: 0,
          wholeBloodUnitsTransfused: 0,
          cellSaverVolumeMl: 0,
          calciumChlorideGramsAdministered: 0,
          calciumDeficitUnitsPending: 0,
          prbcToFfpRatio: 1.0,
          prbcToPlateletRatio: 1.0,
          isBalancedMtpRatio: true,
          rapidInfuserFlowRateMlMin: 0,
          bloodWarmerTempCelsius: 37.0,
          activeCoolerNumber: 0,
          totalCoolersRequested: 0
        },
        tegRotem: {
          modality: 'ROTEM_DELTA',
          reactionTimeMinutes_R: 7.8,
          clotKineticsMinutes_K: 2.2,
          alphaAngleDegrees: 61.0,
          maximumAmplitudeMm_MA: 57.0,
          clotLysisPercentage30Min_LY30: 0.7,
          estimatedFibrinogenContribution: 300,
          functionalFibrinogenMA: 22.0,
          coagulopathyInterpretation: 'Anti-Xa DOAC effect reversed with Andexanet Alfa infusion.',
          recommendedIntervention: 'NONE_NORMAL',
          sampleTimestamp: '20 mins ago'
        },
        aisIss: {
          headNeck: 4,
          face: 1,
          chest: 0,
          abdomenPelvis: 0,
          extremitiesPelvicGirdle: 2,
          externalBurns: 0,
          injurySeverityScore_ISS: 21,
          issMortalityCategory: 'SEVERE_16_TO_24'
        },
        scores: {
          shockIndex: 0.51,
          ageAdjustedShockIndex: 37.7,
          reverseShockIndexTimesGcs: 27.26,
          abcScore: 0,
          revisedTraumaScore_RTS: 7.841,
          tashScore: 2,
          lethalTriadIndex: {
            hypothermiaPresent: false,
            acidosisPresent: false,
            coagulopathyPresent: false,
            triadCount: 0,
            mortalityRiskPercent: 10
          }
        },
        allergies: ['Codeine (Nausea)'],
        intubationStatus: 'NATURAL_SPONTANEOUS',
        vascularAccess: {
          cordisIntroducerSites: [],
          peripheralIvGauges: ['Right Forearm 18G', 'Left Hand 20G'],
          intraosseousNeedleSites: [],
          arterialLineSites: []
        },
        activeAlerts: [],
        resuscitationEventsTimeline: [
          {
            timestamp: '40 mins ago',
            phase: 'PRE_HOSPITAL_TRIAGE',
            event: 'Admitted following mechanical slip on ice. Hematoma over left parietal scalp.',
            provider: 'David Miller, RN'
          }
        ]
      },
      {
        id: 'TRM-9407',
        mrn: 'MRN-7718902',
        name: 'Carlos Mendoza',
        age: 42,
        gender: 'MALE',
        traumaBayNumber: 'TB-07 (ANGIO/IR RESUS)',
        admissionTime: '50 mins ago',
        triageLevel: 'LEVEL_1_STAT_ALPHA',
        injuryMechanism: 'Forklift Crushing Injury against Concrete Pillar with Splenic & Diaphragmatic Rupture',
        mechanismCategory: 'CRUSH_INDUSTRIAL',
        primarySurgeon: 'Dr. Tariq Al-Mansoor, MD (Trauma & IR)',
        leadTraumaNurse: 'Brian Walker, BSN, RN',
        currentPhase: 'ANGIOGRAPHIC_EMBOLIZATION',
        shockClass: 'CLASS_III_MODERATE_SHOCK',
        vitals: {
          heartRate: 118,
          systolicBp: 86,
          diastolicBp: 52,
          meanArterialPressure: 63,
          pulsePressure: 34,
          spO2: 95,
          respiratoryRate: 22,
          endTidalCo2: 30,
          coreTemperatureCelsius: 35.2,
          temperatureProbeSite: 'BLADDER',
          invasiveArterialLineSite: 'RIGHT_RADIAL',
          isShockIndexElevated: true
        },
        gcs: {
          eyeResponse: 3,
          verbalResponse: 3,
          motorResponse: 5,
          totalGcs: 11,
          pupilReactivity: 'BILATERAL_REACTIVE',
          motorDeficitSide: 'SYMMETRIC'
        },
        abg: {
          ph: 7.24,
          pao2: 90,
          paco2: 33,
          baseExcessDeficit: -7.6,
          lactateMmolL: 5.4,
          lactateClearance2HrPercent: 18,
          ionizedCalciumMmolL: 1.04,
          hemoglobinGdl: 7.8,
          hematocritPercent: 24,
          plateletCountK: 112,
          inr: 1.48,
          fibrinogenMgDl: 145,
          glucoseMgDl: 175,
          potassiumMeqL: 4.8,
          timestamp: '15 mins ago'
        },
        fastExam: {
          pericardialSubxiphoid: 'NEGATIVE',
          rightUpperQuadrantMorisons: 'NEGATIVE',
          leftUpperQuadrantSplenorenal: 'POSITIVE_FREE_FLUID',
          pelvicSuprapubic: 'POSITIVE_FREE_FLUID',
          rightThoraxHemothorax: 'NEGATIVE',
          leftThoraxHemothorax: 'POSITIVE_FREE_FLUID',
          rightLungPneumothoraxSlide: 'PRESENT_NORMAL',
          leftLungPneumothoraxSlide: 'PRESENT_NORMAL',
          totalPositiveQuadrants: 3,
          performedTimestamp: '42 mins ago',
          sonographer: 'Dr. Al-Mansoor'
        },
        reboa: {
          status: 'STANDBY_SHEATH_IN_SITU',
          zone: 'ZONE_1_THORACIC',
          sheathSizeFr: 7,
          balloonInflationVolumeMl: 0,
          elapsedInflationMinutes: 0,
          maxRecommendedInflationMinutes: 30,
          distalPerfusionCheckPassed: true,
          proximalAorticMapMmHg: 63
        },
        txaStatus: {
          indicated: true,
          bolusAdministered: true,
          bolusTime: '40 mins ago',
          infusionRunning: true,
          infusionStartTime: '35 mins ago',
          injuryToTxaMinutes: 52,
          withinCrash2ThreeHourWindow: true,
          infusionRateMgPerHour: 125,
          totalTxaAdministeredGrams: 2.0
        },
        bloodLedger: {
          prbcUnitsTransfused: 6,
          ffpUnitsTransfused: 5,
          plateletPheresisUnitsTransfused: 1,
          cryoprecipitatePoolsTransfused: 1,
          wholeBloodUnitsTransfused: 0,
          cellSaverVolumeMl: 350,
          calciumChlorideGramsAdministered: 1.0,
          calciumDeficitUnitsPending: 0.5,
          prbcToFfpRatio: 1.2,
          prbcToPlateletRatio: 6.0,
          isBalancedMtpRatio: true,
          rapidInfuserFlowRateMlMin: 180,
          bloodWarmerTempCelsius: 41.0,
          activeCoolerNumber: 2,
          totalCoolersRequested: 2
        },
        tegRotem: {
          modality: 'TEG_6S',
          reactionTimeMinutes_R: 9.8,
          clotKineticsMinutes_K: 3.1,
          alphaAngleDegrees: 51.0,
          maximumAmplitudeMm_MA: 48.0,
          clotLysisPercentage30Min_LY30: 2.4,
          estimatedFibrinogenContribution: 140,
          functionalFibrinogenMA: 14.0,
          coagulopathyInterpretation: 'Moderate coagulopathy with low fibrinogen contribution and borderline platelet amplitude.',
          recommendedIntervention: 'ADMINISTER_CRYOPRECIPITATE',
          sampleTimestamp: '12 mins ago'
        },
        aisIss: {
          headNeck: 0,
          face: 0,
          chest: 3,
          abdomenPelvis: 5,
          extremitiesPelvicGirdle: 2,
          externalBurns: 0,
          injurySeverityScore_ISS: 38,
          issMortalityCategory: 'CRITICAL_25_TO_49'
        },
        scores: {
          shockIndex: 1.37,
          ageAdjustedShockIndex: 57.5,
          reverseShockIndexTimesGcs: 8.02,
          abcScore: 2,
          revisedTraumaScore_RTS: 6.643,
          tashScore: 15,
          lethalTriadIndex: {
            hypothermiaPresent: false,
            acidosisPresent: true,
            coagulopathyPresent: false,
            triadCount: 1,
            mortalityRiskPercent: 25
          }
        },
        allergies: ['Iodine Contrast (Pre-treated)'],
        intubationStatus: 'ETT_VENTILATED',
        ventilatorSettings: {
          mode: 'VC',
          fio2: 0.6,
          peep: 6,
          tidalVolumeMl: 460,
          peakPressureCmH2O: 26
        },
        vascularAccess: {
          cordisIntroducerSites: ['Right Femoral 8.5Fr'],
          peripheralIvGauges: ['Left Forearm 16G'],
          intraosseousNeedleSites: [],
          arterialLineSites: ['Right Radial 20G']
        },
        activeAlerts: [],
        resuscitationEventsTimeline: [
          {
            timestamp: '50 mins ago',
            phase: 'PRE_HOSPITAL_TRIAGE',
            event: 'Transferred from industrial facility following crush injury.',
            provider: 'Brian Walker, RN'
          }
        ]
      },
      {
        id: 'TRM-9408',
        mrn: 'MRN-9021844',
        name: 'Wyatt Sterling',
        age: 51,
        gender: 'MALE',
        traumaBayNumber: 'TB-08 (STEP-DOWN STABILIZED)',
        admissionTime: '2 hours ago',
        triageLevel: 'LEVEL_3_URGENT_CHARLIE',
        injuryMechanism: 'Agricultural Grain Auger Machinery Entanglement with Right Forearm Compound Fracture',
        mechanismCategory: 'ASSAULT_BLUNT',
        primarySurgeon: 'Dr. Jonathan Ross, MD (Orthopedic Trauma)',
        leadTraumaNurse: 'Hannah Keller, RN',
        currentPhase: 'STABILIZED',
        shockClass: 'CLASS_I_COMPENSATED',
        vitals: {
          heartRate: 82,
          systolicBp: 124,
          diastolicBp: 76,
          meanArterialPressure: 92,
          pulsePressure: 48,
          spO2: 98,
          respiratoryRate: 18,
          endTidalCo2: 38,
          coreTemperatureCelsius: 37.0,
          temperatureProbeSite: 'TYMPANIC',
          isShockIndexElevated: false
        },
        gcs: {
          eyeResponse: 4,
          verbalResponse: 5,
          motorResponse: 6,
          totalGcs: 15,
          pupilReactivity: 'BILATERAL_REACTIVE',
          motorDeficitSide: 'SYMMETRIC'
        },
        abg: {
          ph: 7.39,
          pao2: 96,
          paco2: 40,
          baseExcessDeficit: -0.8,
          lactateMmolL: 1.4,
          lactateClearance2HrPercent: 65,
          ionizedCalciumMmolL: 1.25,
          hemoglobinGdl: 12.8,
          hematocritPercent: 38,
          plateletCountK: 245,
          inr: 1.08,
          fibrinogenMgDl: 290,
          glucoseMgDl: 118,
          potassiumMeqL: 4.0,
          timestamp: '30 mins ago'
        },
        fastExam: {
          pericardialSubxiphoid: 'NEGATIVE',
          rightUpperQuadrantMorisons: 'NEGATIVE',
          leftUpperQuadrantSplenorenal: 'NEGATIVE',
          pelvicSuprapubic: 'NEGATIVE',
          rightThoraxHemothorax: 'NEGATIVE',
          leftThoraxHemothorax: 'NEGATIVE',
          rightLungPneumothoraxSlide: 'PRESENT_NORMAL',
          leftLungPneumothoraxSlide: 'PRESENT_NORMAL',
          totalPositiveQuadrants: 0,
          performedTimestamp: '1 hr 45 min ago',
          sonographer: 'Dr. Ross'
        },
        reboa: {
          status: 'NOT_INDICATED',
          zone: 'NONE',
          sheathSizeFr: 0,
          balloonInflationVolumeMl: 0,
          elapsedInflationMinutes: 0,
          maxRecommendedInflationMinutes: 30,
          distalPerfusionCheckPassed: true,
          proximalAorticMapMmHg: 92
        },
        txaStatus: {
          indicated: false,
          bolusAdministered: false,
          infusionRunning: false,
          injuryToTxaMinutes: 0,
          withinCrash2ThreeHourWindow: true,
          infusionRateMgPerHour: 0,
          totalTxaAdministeredGrams: 0
        },
        bloodLedger: {
          prbcUnitsTransfused: 0,
          ffpUnitsTransfused: 0,
          plateletPheresisUnitsTransfused: 0,
          cryoprecipitatePoolsTransfused: 0,
          wholeBloodUnitsTransfused: 0,
          cellSaverVolumeMl: 0,
          calciumChlorideGramsAdministered: 0,
          calciumDeficitUnitsPending: 0,
          prbcToFfpRatio: 1.0,
          prbcToPlateletRatio: 1.0,
          isBalancedMtpRatio: true,
          rapidInfuserFlowRateMlMin: 0,
          bloodWarmerTempCelsius: 37.0,
          activeCoolerNumber: 0,
          totalCoolersRequested: 0
        },
        tegRotem: {
          modality: 'STANDARD_LABS',
          reactionTimeMinutes_R: 6.2,
          clotKineticsMinutes_K: 1.7,
          alphaAngleDegrees: 67.0,
          maximumAmplitudeMm_MA: 65.0,
          clotLysisPercentage30Min_LY30: 0.5,
          estimatedFibrinogenContribution: 280,
          functionalFibrinogenMA: 22.0,
          coagulopathyInterpretation: 'Standard hemostatic profile.',
          recommendedIntervention: 'NONE_NORMAL',
          sampleTimestamp: '45 mins ago'
        },
        aisIss: {
          headNeck: 0,
          face: 0,
          chest: 0,
          abdomenPelvis: 0,
          extremitiesPelvicGirdle: 3,
          externalBurns: 1,
          injurySeverityScore_ISS: 10,
          issMortalityCategory: 'MODERATE_9_TO_15'
        },
        scores: {
          shockIndex: 0.66,
          ageAdjustedShockIndex: 33.7,
          reverseShockIndexTimesGcs: 22.68,
          abcScore: 0,
          revisedTraumaScore_RTS: 7.841,
          tashScore: 1,
          lethalTriadIndex: {
            hypothermiaPresent: false,
            acidosisPresent: false,
            coagulopathyPresent: false,
            triadCount: 0,
            mortalityRiskPercent: 10
          }
        },
        allergies: ['NKDA'],
        intubationStatus: 'NATURAL_SPONTANEOUS',
        vascularAccess: {
          cordisIntroducerSites: [],
          peripheralIvGauges: ['Left Forearm 18G'],
          intraosseousNeedleSites: [],
          arterialLineSites: []
        },
        activeAlerts: [],
        resuscitationEventsTimeline: [
          {
            timestamp: '2 hours ago',
            phase: 'PRE_HOSPITAL_TRIAGE',
            event: 'Admitted with right arm avulsion wound and radial pulse intact.',
            provider: 'Hannah Keller, RN'
          }
        ]
      }
    ];
  }

  public exportFhirBundle(patientId: string): any {
    const patient = this.getPatientById(patientId);
    if (!patient) return null;

    return {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: [
        {
          fullUrl: 'urn:uuid:' + patient.id,
          resource: {
            resourceType: 'Patient',
            id: patient.id,
            identifier: [
              { system: 'http://hospital.medtrack.org/mrn', value: patient.mrn }
            ],
            name: [{ text: patient.name }],
            gender: patient.gender.toLowerCase(),
            extension: [
              { url: 'http://medtrack.org/fhir/triage-level', valueString: patient.triageLevel },
              { url: 'http://medtrack.org/fhir/shock-class', valueString: patient.shockClass }
            ]
          }
        },
        {
          resource: {
            resourceType: 'Observation',
            id: 'obs-hemodynamics-' + patient.id,
            status: 'final',
            code: { text: 'Trauma Hemodynamics Panel' },
            component: [
              { code: { text: 'Heart Rate' }, valueQuantity: { value: patient.vitals.heartRate, unit: 'bpm' } },
              { code: { text: 'Systolic BP' }, valueQuantity: { value: patient.vitals.systolicBp, unit: 'mmHg' } },
              { code: { text: 'Shock Index' }, valueQuantity: { value: patient.scores.shockIndex, unit: 'ratio' } },
              { code: { text: 'rSIG Score' }, valueQuantity: { value: patient.scores.reverseShockIndexTimesGcs, unit: 'points' } }
            ]
          }
        },
        {
          resource: {
            resourceType: 'Observation',
            id: 'obs-mtp-' + patient.id,
            status: 'final',
            code: { text: 'Massive Transfusion Protocol Ledger' },
            component: [
              { code: { text: 'pRBC Units' }, valueQuantity: { value: patient.bloodLedger.prbcUnitsTransfused, unit: 'units' } },
              { code: { text: 'FFP Units' }, valueQuantity: { value: patient.bloodLedger.ffpUnitsTransfused, unit: 'units' } },
              { code: { text: 'Platelet Units' }, valueQuantity: { value: patient.bloodLedger.plateletPheresisUnitsTransfused, unit: 'units' } },
              { code: { text: 'Ratio Balanced' }, valueBoolean: patient.bloodLedger.isBalancedMtpRatio }
            ]
          }
        },
        {
          resource: {
            resourceType: 'DiagnosticReport',
            id: 'diag-teg-' + patient.id,
            status: 'final',
            code: { text: 'Viscoelastic Thromboelastography (TEG/ROTEM)' },
            conclusion: patient.tegRotem.coagulopathyInterpretation
          }
        }
      ]
    };
  }

  public exportCsvSummary(patientId: string): string {
    const p = this.getPatientById(patientId);
    if (!p) return '';

    const headers = [
      'Patient ID', 'MRN', 'Name', 'Age', 'Gender', 'Bay', 'Triage Level', 'Shock Class',
      'Heart Rate', 'Systolic BP', 'Diastolic BP', 'MAP', 'SpO2', 'RR', 'Temp C',
      'GCS Total', 'Shock Index', 'rSIG', 'ABC Score', 'RTS', 'ISS',
      'pRBC Units', 'FFP Units', 'Platelet Units', 'Cryo Pools', 'MTP Balanced',
      'REBOA Status', 'REBOA Zone', 'REBOA Elapsed Min',
      'TEG R-Time', 'TEG K-Time', 'TEG Angle', 'TEG MA', 'TEG LY30', 'TEG Interpretation',
      'pH', 'Base Deficit', 'Lactate', 'Ionized Ca', 'INR', 'Platelets K',
      'Lethal Triad Count', 'Mortality Risk %'
    ];

    const values = [
      p.id, p.mrn, '"' + p.name + '"', p.age, p.gender, '"' + p.traumaBayNumber + '"', p.triageLevel, p.shockClass,
      p.vitals.heartRate, p.vitals.systolicBp, p.vitals.diastolicBp, p.vitals.meanArterialPressure, p.vitals.spO2, p.vitals.respiratoryRate, p.vitals.coreTemperatureCelsius,
      p.gcs.totalGcs, p.scores.shockIndex, p.scores.reverseShockIndexTimesGcs, p.scores.abcScore, p.scores.revisedTraumaScore_RTS, p.aisIss.injurySeverityScore_ISS,
      p.bloodLedger.prbcUnitsTransfused, p.bloodLedger.ffpUnitsTransfused, p.bloodLedger.plateletPheresisUnitsTransfused, p.bloodLedger.cryoprecipitatePoolsTransfused, p.bloodLedger.isBalancedMtpRatio,
      p.reboa.status, p.reboa.zone, p.reboa.elapsedInflationMinutes.toFixed(1),
      p.tegRotem.reactionTimeMinutes_R, p.tegRotem.clotKineticsMinutes_K, p.tegRotem.alphaAngleDegrees, p.tegRotem.maximumAmplitudeMm_MA, p.tegRotem.clotLysisPercentage30Min_LY30, '"' + p.tegRotem.coagulopathyInterpretation + '"',
      p.abg.ph, p.abg.baseExcessDeficit, p.abg.lactateMmolL, p.abg.ionizedCalciumMmolL, p.abg.inr, p.abg.plateletCountK,
      p.scores.lethalTriadIndex.triadCount, p.scores.lethalTriadIndex.mortalityRiskPercent + '%'
    ];

    return headers.join(',') + '\n' + values.join(',');
  }
}
