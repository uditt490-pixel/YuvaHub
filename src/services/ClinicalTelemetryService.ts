import {
  ClinicalPatientRecord,
  ClinicalFilterQuery,
  TelemetrySummaryMetrics,
  ClinicalCalculationResult,
  ClinicalAlert,
  EmergencyProtocolEscalation,
  EmergencyProtocolType,
  TelemetryVitals,
  ClinicalDomain,
  ClinicalAcuityLevel,
  TelemetryTrendPoint,
  BioAiBiomarkers,
} from '../types/clinicalTelemetry';

export class ClinicalTelemetryService {
  // Clinical Calculation Engine
  public static calculateMAP(sbp: number, dbp: number): number {
    return Math.round(((sbp + 2 * dbp) / 3) * 10) / 10;
  }

  public static calculateCardiacPowerOutput(map: number, cardiacOutput: number): number {
    if (!cardiacOutput || cardiacOutput <= 0) return 0;
    return Math.round(((map * cardiacOutput) / 451) * 100) / 100;
  }

  public static calculateShockIndex(hr: number, sbp: number): number {
    if (!sbp || sbp <= 0) return 0;
    return Math.round((hr / sbp) * 100) / 100;
  }

  public static calculateModifiedShockIndex(hr: number, map: number): number {
    if (!map || map <= 0) return 0;
    return Math.round((hr / map) * 100) / 100;
  }

  public static calculateqSOFA(
    respiratoryRate: number,
    systolicBp: number,
    gcs: number
  ): { score: number; highRisk: boolean; interpretation: string } {
    let score = 0;
    if (respiratoryRate >= 22) score += 1;
    if (systolicBp <= 100) score += 1;
    if (gcs < 15) score += 1;

    const highRisk = score >= 2;
    const interpretation = highRisk
      ? 'High Risk: Greater than or equal to 2 qSOFA points. High likelihood of poor clinical outcome / in-hospital mortality due to sepsis.'
      : 'Low to Moderate Risk: qSOFA score < 2. Continue clinical monitoring.';

    return { score, highRisk, interpretation };
  }

  public static calculateNEWS2(vitals: TelemetryVitals): {
    score: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  } {
    let score = 0;

    // Respiration Rate
    if (vitals.respiratoryRateMin <= 8) score += 3;
    else if (vitals.respiratoryRateMin >= 9 && vitals.respiratoryRateMin <= 11) score += 1;
    else if (vitals.respiratoryRateMin >= 21 && vitals.respiratoryRateMin <= 24) score += 2;
    else if (vitals.respiratoryRateMin >= 25) score += 3;

    // SpO2
    if (vitals.spO2Percent <= 91) score += 3;
    else if (vitals.spO2Percent >= 92 && vitals.spO2Percent <= 93) score += 2;
    else if (vitals.spO2Percent >= 94 && vitals.spO2Percent <= 95) score += 1;

    // Systolic BP
    if (vitals.systolicBpMmHg <= 90) score += 3;
    else if (vitals.systolicBpMmHg >= 91 && vitals.systolicBpMmHg <= 100) score += 2;
    else if (vitals.systolicBpMmHg >= 101 && vitals.systolicBpMmHg <= 110) score += 1;
    else if (vitals.systolicBpMmHg >= 220) score += 3;

    // Pulse / HR
    if (vitals.heartRateBpm <= 40) score += 3;
    else if (vitals.heartRateBpm >= 41 && vitals.heartRateBpm <= 50) score += 1;
    else if (vitals.heartRateBpm >= 91 && vitals.heartRateBpm <= 110) score += 1;
    else if (vitals.heartRateBpm >= 111 && vitals.heartRateBpm <= 130) score += 2;
    else if (vitals.heartRateBpm >= 131) score += 3;

    // Temperature
    if (vitals.temperatureCelsius <= 35.0) score += 3;
    else if (vitals.temperatureCelsius >= 35.1 && vitals.temperatureCelsius <= 36.0) score += 1;
    else if (vitals.temperatureCelsius >= 38.1 && vitals.temperatureCelsius <= 39.0) score += 1;
    else if (vitals.temperatureCelsius >= 39.1) score += 2;

    // Consciousness (GCS)
    if (vitals.gcsScore < 15) score += 3;

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (score >= 7) riskLevel = 'HIGH';
    else if (score >= 5 || (score >= 1 && vitals.gcsScore < 15)) riskLevel = 'MEDIUM';

    return { score, riskLevel };
  }

  public static evaluateKDIGO(
    creatinineCurrent: number,
    urineOutputMlKgHr: number
  ): { stage: 0 | 1 | 2 | 3; interpretation: string } {
    if (creatinineCurrent >= 4.0 || urineOutputMlKgHr < 0.3) {
      return { stage: 3, interpretation: 'KDIGO Stage 3: Severe AKI or Anuria. Immediate Nephrology/CRRT Review Required.' };
    }
    if (creatinineCurrent >= 2.5 || urineOutputMlKgHr < 0.5) {
      return { stage: 2, interpretation: 'KDIGO Stage 2: Moderate AKI. Oliguria present (> 12 hrs).' };
    }
    if (creatinineCurrent >= 1.5 || urineOutputMlKgHr < 0.8) {
      return { stage: 1, interpretation: 'KDIGO Stage 1: Mild AKI. Creatinine elevated 1.5-1.9x baseline.' };
    }
    return { stage: 0, interpretation: 'KDIGO Stage 0: No Acute Kidney Injury detected.' };
  }

  public static computeCalculations(vitals: TelemetryVitals, creatinine: number): ClinicalCalculationResult {
    const map = this.calculateMAP(vitals.systolicBpMmHg, vitals.diastolicBpMmHg);
    const cpo = this.calculateCardiacPowerOutput(map, vitals.cardiacOutputLMin);
    const si = this.calculateShockIndex(vitals.heartRateBpm, vitals.systolicBpMmHg);
    const msi = this.calculateModifiedShockIndex(vitals.heartRateBpm, map);
    const qsofa = this.calculateqSOFA(vitals.respiratoryRateMin, vitals.systolicBpMmHg, vitals.gcsScore);
    const news2 = this.calculateNEWS2(vitals);
    const kdigo = this.evaluateKDIGO(creatinine, vitals.urineOutputMlKgHr);
    const pfRatio = Math.round((95 / (vitals.fiO2Percent / 100)) * 10) / 10;

    return {
      meanArterialPressure: map,
      cardiacPowerOutput: cpo,
      shockIndex: si,
      modifiedShockIndex: msi,
      qSofaScore: qsofa.score,
      qSofaHighRisk: qsofa.highRisk,
      news2Score: news2.score,
      news2RiskLevel: news2.riskLevel,
      kdigoAkiStage: kdigo.stage,
      kdigoInterpretation: kdigo.interpretation,
      pao2Fio2Ratio: pfRatio,
    };
  }

  public static generateAlerts(
    patientId: string,
    vitals: TelemetryVitals,
    biomarkers: BioAiBiomarkers,
    calcs: ClinicalCalculationResult
  ): ClinicalAlert[] {
    const alerts: ClinicalAlert[] = [];
    const now = new Date().toISOString();

    if (vitals.spO2Percent < 90) {
      alerts.push({
        id: ,
        patientId,
        timestamp: now,
        severity: vitals.spO2Percent < 85 ? 'CRITICAL' : 'HIGH',
        metric: 'SpO2 Saturation',
        value: ,
        expectedRange: '95 - 100%',
        description: 'Severe arterial hypoxemia detected. Risk of critical tissue hypoxia.',
        suggestedEscalation: 'Increase FiO2, titrate PEEP, verify airway patency and endotracheal position.',
        protocolAction: 'RAPID_RESPONSE_TEAM',
        acknowledged: false,
      });
    }

    if (calcs.shockIndex >= 1.0 || calcs.meanArterialPressure < 65) {
      alerts.push({
        id: ,
        patientId,
        timestamp: now,
        severity: calcs.meanArterialPressure < 60 ? 'CRITICAL' : 'HIGH',
        metric: 'Hemodynamic Perfusion (MAP / Shock Index)',
        value: ,
        expectedRange: 'MAP > 65 mmHg | SI < 0.7',
        description: 'Inadequate systemic tissue perfusion and hemodynamic instability.',
        suggestedEscalation: 'Initiate vasopressor support (Norepinephrine), administer fluid challenge if fluid-responsive.',
        protocolAction: 'SEPSIS_PROTOCOL',
        acknowledged: false,
      });
    }

    if (calcs.qSofaHighRisk || biomarkers.sepsisBiomarkerIndex > 70) {
      alerts.push({
        id: ,
        patientId,
        timestamp: now,
        severity: 'CRITICAL',
        metric: 'Sepsis Biomarker Index & qSOFA',
        value: ,
        expectedRange: 'qSOFA < 2 | Sepsis Index < 30',
        description: 'High risk of acute septic shock and systemic multi-organ dysfunction.',
        suggestedEscalation: 'Activate 1-Hour Sepsis Bundle: Draw blood cultures, administer broad-spectrum IV antibiotics, measure lactate.',
        protocolAction: 'SEPSIS_PROTOCOL',
        acknowledged: false,
      });
    }

    if (biomarkers.aiDeteriorationRiskScore >= 0.75) {
      alerts.push({
        id: ,
        patientId,
        timestamp: now,
        severity: 'HIGH',
        metric: 'Bio-AI Predictive Deterioration Model',
        value: ,
        expectedRange: 'Risk Score < 30%',
        description: ,
        suggestedEscalation: 'Pre-alert ICU rapid response team; review central line venous access and continuous arterial line waveform.',
        protocolAction: 'RAPID_RESPONSE_TEAM',
        acknowledged: false,
      });
    }

    if (vitals.heartRateBpm > 135 || vitals.heartRateBpm < 45) {
      alerts.push({
        id: ,
        patientId,
        timestamp: now,
        severity: vitals.heartRateBpm > 150 || vitals.heartRateBpm < 40 ? 'CRITICAL' : 'WARNING',
        metric: 'Cardiac Rhythm / Heart Rate',
        value: ,
        expectedRange: '60 - 100 bpm',
        description: vitals.heartRateBpm > 135 ? 'Severe sustained tachyarrhythmia detected.' : 'Severe symptomatic bradycardia detected.',
        suggestedEscalation: 'Acquire 12-lead ECG; evaluate serum electrolytes (K+, Mg2+); prepare ACLS resuscitation pharmacology.',
        protocolAction: vitals.heartRateBpm > 150 ? 'CODE_BLUE' : 'RAPID_RESPONSE_TEAM',
        acknowledged: false,
      });
    }

    return alerts;
  }

  // In-Memory Patient Telemetry Database
  private static patients: ClinicalPatientRecord[] = [
    {
      id: 'PT-101',
      mrn: 'MRN-2026-90412',
      fullName: 'Rajeshwar Sharma',
      age: 58,
      sex: 'M',
      ward: 'Medical Intensive Care Unit (MICU)',
      bedNumber: 'Bed 04',
      primaryDiagnosis: 'Severe Septic Shock secondary to Multilobar Klebsiella Pneumonia',
      domain: 'ICU_TELEMETRY',
      acuityLevel: 'CRITICAL',
      attendingPhysician: 'Dr. Devika Mukherjee, MD, FCCP',
      admissionDate: '2026-08-20T04:30:00.000Z',
      vitals: {
        heartRateBpm: 124,
        systolicBpMmHg: 84,
        diastolicBpMmHg: 48,
        meanArterialPressureMmHg: 60,
        spO2Percent: 88,
        respiratoryRateMin: 28,
        temperatureCelsius: 39.4,
        etCO2MmHg: 26,
        lactateMmolL: 4.8,
        cardiacOutputLMin: 4.2,
        cardiacIndexLMinM2: 2.1,
        creatinineMgDl: 2.9,
        urineOutputMlKgHr: 0.25,
        cvpMmHg: 6,
        fiO2Percent: 65,
        peepCmH2O: 12,
        gcsScore: 11,
      },
      biomarkers: {
        troponinINgMl: 0.14,
        procalcitoninNgMl: 18.5,
        dDimerMcgMl: 4.2,
        crpMgL: 142,
        bnpPgMl: 340,
        sepsisBiomarkerIndex: 88,
        genomicMutationBurdenMutsMb: 3.2,
        aiDeteriorationRiskScore: 0.89,
        predictiveShockHorizonMinutes: 25,
        immunoOncologyResponseProb: 0.12,
      },
      calculations: {
        meanArterialPressure: 60,
        cardiacPowerOutput: 0.56,
        shockIndex: 1.48,
        modifiedShockIndex: 2.07,
        qSofaScore: 3,
        qSofaHighRisk: true,
        news2Score: 14,
        news2RiskLevel: 'HIGH',
        kdigoAkiStage: 3,
        kdigoInterpretation: 'KDIGO Stage 3: Severe AKI with marked oliguria.',
        pao2Fio2Ratio: 146.2,
      },
      alerts: [
        {
          id: 'ALT-101-1',
          patientId: 'PT-101',
          timestamp: '2026-08-23T18:45:00.000Z',
          severity: 'CRITICAL',
          metric: 'Mean Arterial Pressure & Lactate',
          value: 'MAP: 60 mmHg | Lactate: 4.8 mmol/L',
          expectedRange: 'MAP > 65 mmHg | Lactate < 2.0 mmol/L',
          description: 'Refractory septic shock with persistent hyperlactatemia.',
          suggestedEscalation: 'Titrate Norepinephrine to MAP >= 65; initiate Vasopressin 0.03 units/min adjunct.',
          protocolAction: 'SEPSIS_PROTOCOL',
          acknowledged: false,
        },
        {
          id: 'ALT-101-2',
          patientId: 'PT-101',
          timestamp: '2026-08-23T18:50:00.000Z',
          severity: 'CRITICAL',
          metric: 'SpO2 Desaturation',
          value: '88% on FiO2 65%',
          expectedRange: '95 - 100%',
          description: 'Moderate-Severe ARDS with worsening alveolar-capillary diffusion deficit.',
          suggestedEscalation: 'Increase PEEP to 14 cmH2O; perform lung recruitment maneuver; consider prone positioning.',
          protocolAction: 'RAPID_RESPONSE_TEAM',
          acknowledged: false,
        }
      ],
      trendHistory: [
        { timestamp: '14:00', heartRate: 110, map: 72, spO2: 94, lactate: 2.8, aiRiskScore: 0.52 },
        { timestamp: '15:00', heartRate: 115, map: 68, spO2: 92, lactate: 3.4, aiRiskScore: 0.68 },
        { timestamp: '16:00', heartRate: 118, map: 65, spO2: 90, lactate: 4.1, aiRiskScore: 0.79 },
        { timestamp: '17:00', heartRate: 122, map: 62, spO2: 89, lactate: 4.5, aiRiskScore: 0.85 },
        { timestamp: '18:00', heartRate: 124, map: 60, spO2: 88, lactate: 4.8, aiRiskScore: 0.89 },
      ],
      activeEscalations: [
        {
          id: 'ESC-901',
          patientId: 'PT-101',
          protocolType: 'SEPSIS_PROTOCOL',
          triggeredBy: 'Dr. Devika Mukherjee',
          timestamp: '2026-08-23T18:46:12.000Z',
          clinicalRationale: 'Refractory septic shock despite 30 mL/kg crystalloid bolus; ongoing vasopressor requirements.',
          teamPagingStatus: 'ON_SCENE',
          vitalSnapshot: {
            heartRateBpm: 124,
            systolicBpMmHg: 84,
            diastolicBpMmHg: 48,
            meanArterialPressureMmHg: 60,
            spO2Percent: 88,
            respiratoryRateMin: 28,
            temperatureCelsius: 39.4,
            etCO2MmHg: 26,
            lactateMmolL: 4.8,
            cardiacOutputLMin: 4.2,
            cardiacIndexLMinM2: 2.1,
            creatinineMgDl: 2.9,
            urineOutputMlKgHr: 0.25,
            cvpMmHg: 6,
            fiO2Percent: 65,
            peepCmH2O: 12,
            gcsScore: 11,
          },
          auditSignature: 'VERIFIED_DIGITAL_SIG_DEV_MUKHERJEE_MD_2026',
        }
      ],
      isTelemetryLive: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'PT-102',
      mrn: 'MRN-2026-88120',
      fullName: 'Ananya Sengupta',
      age: 42,
      sex: 'F',
      ward: 'Coronary Care Unit (CCU)',
      bedNumber: 'Bed 08',
      primaryDiagnosis: 'Post-PCI Anterior STEMI with Impending Cardiogenic Shock',
      domain: 'CARDIOVASCULAR',
      acuityLevel: 'HIGH',
      attendingPhysician: 'Dr. Arvind Swaminathan, MD, FACC',
      admissionDate: '2026-08-21T11:15:00.000Z',
      vitals: {
        heartRateBpm: 108,
        systolicBpMmHg: 92,
        diastolicBpMmHg: 62,
        meanArterialPressureMmHg: 72,
        spO2Percent: 93,
        respiratoryRateMin: 22,
        temperatureCelsius: 37.2,
        etCO2MmHg: 34,
        lactateMmolL: 2.7,
        cardiacOutputLMin: 3.1,
        cardiacIndexLMinM2: 1.7,
        creatinineMgDl: 1.4,
        urineOutputMlKgHr: 0.65,
        cvpMmHg: 14,
        fiO2Percent: 40,
        peepCmH2O: 6,
        gcsScore: 14,
      },
      biomarkers: {
        troponinINgMl: 14.8,
        procalcitoninNgMl: 0.4,
        dDimerMcgMl: 1.1,
        crpMgL: 28,
        bnpPgMl: 1480,
        sepsisBiomarkerIndex: 22,
        genomicMutationBurdenMutsMb: 1.1,
        aiDeteriorationRiskScore: 0.65,
        predictiveShockHorizonMinutes: 45,
        immunoOncologyResponseProb: 0.05,
      },
      calculations: {
        meanArterialPressure: 72,
        cardiacPowerOutput: 0.50,
        shockIndex: 1.17,
        modifiedShockIndex: 1.50,
        qSofaScore: 2,
        qSofaHighRisk: true,
        news2Score: 7,
        news2RiskLevel: 'HIGH',
        kdigoAkiStage: 0,
        kdigoInterpretation: 'Normal baseline renal function.',
        pao2Fio2Ratio: 237.5,
      },
      alerts: [
        {
          id: 'ALT-102-1',
          patientId: 'PT-102',
          timestamp: '2026-08-23T18:30:00.000Z',
          severity: 'HIGH',
          metric: 'Cardiac Power Output & Cardiac Index',
          value: 'CPO: 0.50 W | CI: 1.7 L/min/m2',
          expectedRange: 'CPO > 0.6 W | CI > 2.2 L/min/m2',
          description: 'Low cardiac power output indicative of cardiogenic pump failure.',
          suggestedEscalation: 'Evaluate for mechanical circulatory support (Impella CP / IABP); initiate Dobutamine infusion.',
          protocolAction: 'CODE_STEMI',
          acknowledged: false,
        }
      ],
      trendHistory: [
        { timestamp: '14:00', heartRate: 95, map: 85, spO2: 97, lactate: 1.8, aiRiskScore: 0.35 },
        { timestamp: '15:00', heartRate: 98, map: 82, spO2: 96, lactate: 2.1, aiRiskScore: 0.44 },
        { timestamp: '16:00', heartRate: 102, map: 78, spO2: 94, lactate: 2.4, aiRiskScore: 0.55 },
        { timestamp: '17:00', heartRate: 106, map: 74, spO2: 93, lactate: 2.6, aiRiskScore: 0.62 },
        { timestamp: '18:00', heartRate: 108, map: 72, spO2: 93, lactate: 2.7, aiRiskScore: 0.65 },
      ],
      activeEscalations: [],
      isTelemetryLive: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'PT-103',
      mrn: 'MRN-2026-77319',
      fullName: 'Vikramaditya Iyer',
      age: 67,
      sex: 'M',
      ward: 'Nephrology Critical Care & CRRT Unit',
      bedNumber: 'Bed 02',
      primaryDiagnosis: 'Oliguric AKI on Continuous Veno-Venous Hemodiafiltration (CVVHDF)',
      domain: 'NEPHROLOGY_CRRT',
      acuityLevel: 'WARNING',
      attendingPhysician: 'Dr. Radhika Kulkarni, DM (Nephrology)',
      admissionDate: '2026-08-19T16:00:00.000Z',
      vitals: {
        heartRateBpm: 82,
        systolicBpMmHg: 138,
        diastolicBpMmHg: 84,
        meanArterialPressureMmHg: 102,
        spO2Percent: 96,
        respiratoryRateMin: 18,
        temperatureCelsius: 36.8,
        etCO2MmHg: 38,
        lactateMmolL: 1.6,
        cardiacOutputLMin: 5.4,
        cardiacIndexLMinM2: 2.7,
        creatinineMgDl: 4.8,
        urineOutputMlKgHr: 0.15,
        cvpMmHg: 11,
        fiO2Percent: 30,
        peepCmH2O: 5,
        gcsScore: 15,
      },
      biomarkers: {
        troponinINgMl: 0.04,
        procalcitoninNgMl: 0.9,
        dDimerMcgMl: 0.8,
        crpMgL: 34,
        bnpPgMl: 680,
        sepsisBiomarkerIndex: 35,
        genomicMutationBurdenMutsMb: 0.9,
        aiDeteriorationRiskScore: 0.38,
        predictiveShockHorizonMinutes: 120,
        immunoOncologyResponseProb: 0.08,
      },
      calculations: {
        meanArterialPressure: 102,
        cardiacPowerOutput: 1.22,
        shockIndex: 0.59,
        modifiedShockIndex: 0.80,
        qSofaScore: 0,
        qSofaHighRisk: false,
        news2Score: 2,
        news2RiskLevel: 'LOW',
        kdigoAkiStage: 3,
        kdigoInterpretation: 'KDIGO Stage 3: Severe AKI with dialysis dependency.',
        pao2Fio2Ratio: 316.7,
      },
      alerts: [
        {
          id: 'ALT-103-1',
          patientId: 'PT-103',
          timestamp: '2026-08-23T17:15:00.000Z',
          severity: 'WARNING',
          metric: 'CRRT Circuit Transmembrane Pressure',
          value: 'TMP: 280 mmHg | Blood Flow: 200 mL/min',
          expectedRange: 'TMP < 250 mmHg',
          description: 'Elevated transmembrane pressure indicates early dialyzer filter clotting.',
          suggestedEscalation: 'Check regional citrate anticoagulation infusion rate; prepare replacement Prismaflex filter set.',
          protocolAction: 'CRRT_EMERGENCY',
          acknowledged: true,
          acknowledgedBy: 'Dr. Radhika Kulkarni',
          acknowledgedAt: '2026-08-23T17:22:00.000Z',
        }
      ],
      trendHistory: [
        { timestamp: '14:00', heartRate: 85, map: 108, spO2: 95, lactate: 1.9, aiRiskScore: 0.45 },
        { timestamp: '15:00', heartRate: 84, map: 105, spO2: 96, lactate: 1.8, aiRiskScore: 0.42 },
        { timestamp: '16:00', heartRate: 83, map: 104, spO2: 96, lactate: 1.7, aiRiskScore: 0.40 },
        { timestamp: '17:00', heartRate: 82, map: 102, spO2: 96, lactate: 1.6, aiRiskScore: 0.39 },
        { timestamp: '18:00', heartRate: 82, map: 102, spO2: 96, lactate: 1.6, aiRiskScore: 0.38 },
      ],
      activeEscalations: [],
      isTelemetryLive: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'PT-104',
      mrn: 'MRN-2026-65481',
      fullName: 'Meera Sundaram',
      age: 34,
      sex: 'F',
      ward: 'Precision Oncology & Bone Marrow Unit',
      bedNumber: 'Bed 11',
      primaryDiagnosis: 'Relapsed Acute Myeloid Leukemia (AML) s/p Induction Chemotherapy with Febrile Neutropenia',
      domain: 'PRECISION_ONCOLOGY',
      acuityLevel: 'MONITOR',
      attendingPhysician: 'Dr. Jayant Chawla, DM (Medical Oncology)',
      admissionDate: '2026-08-22T08:00:00.000Z',
      vitals: {
        heartRateBpm: 94,
        systolicBpMmHg: 114,
        diastolicBpMmHg: 72,
        meanArterialPressureMmHg: 86,
        spO2Percent: 98,
        respiratoryRateMin: 16,
        temperatureCelsius: 38.6,
        etCO2MmHg: 39,
        lactateMmolL: 1.4,
        cardiacOutputLMin: 6.2,
        cardiacIndexLMinM2: 3.4,
        creatinineMgDl: 0.9,
        urineOutputMlKgHr: 1.2,
        cvpMmHg: 8,
        fiO2Percent: 21,
        peepCmH2O: 0,
        gcsScore: 15,
      },
      biomarkers: {
        troponinINgMl: 0.01,
        procalcitoninNgMl: 2.4,
        dDimerMcgMl: 1.8,
        crpMgL: 92,
        bnpPgMl: 85,
        sepsisBiomarkerIndex: 48,
        genomicMutationBurdenMutsMb: 12.8,
        aiDeteriorationRiskScore: 0.42,
        predictiveShockHorizonMinutes: 180,
        immunoOncologyResponseProb: 0.74,
      },
      calculations: {
        meanArterialPressure: 86,
        cardiacPowerOutput: 1.18,
        shockIndex: 0.82,
        modifiedShockIndex: 1.09,
        qSofaScore: 0,
        qSofaHighRisk: false,
        news2Score: 4,
        news2RiskLevel: 'LOW',
        kdigoAkiStage: 0,
        kdigoInterpretation: 'Normal renal clearance.',
        pao2Fio2Ratio: 452.4,
      },
      alerts: [
        {
          id: 'ALT-104-1',
          patientId: 'PT-104',
          timestamp: '2026-08-23T17:40:00.000Z',
          severity: 'MONITOR',
          metric: 'Absolute Neutrophil Count & Core Temperature',
          value: 'Temp: 38.6 C | ANC: 120 cells/uL',
          expectedRange: 'ANC > 1500 cells/uL',
          description: 'High-risk febrile neutropenia in immunocompromised leukemia patient.',
          suggestedEscalation: 'Maintain Cefepime + Vancomycin broad spectrum coverage; monitor G-CSF stimulation protocol.',
          acknowledged: true,
          acknowledgedBy: 'Dr. Jayant Chawla',
          acknowledgedAt: '2026-08-23T17:45:00.000Z',
        }
      ],
      trendHistory: [
        { timestamp: '14:00', heartRate: 88, map: 90, spO2: 99, lactate: 1.2, aiRiskScore: 0.32 },
        { timestamp: '15:00', heartRate: 90, map: 88, spO2: 98, lactate: 1.3, aiRiskScore: 0.36 },
        { timestamp: '16:00', heartRate: 92, map: 87, spO2: 98, lactate: 1.4, aiRiskScore: 0.39 },
        { timestamp: '17:00', heartRate: 94, map: 86, spO2: 98, lactate: 1.4, aiRiskScore: 0.42 },
        { timestamp: '18:00', heartRate: 94, map: 86, spO2: 98, lactate: 1.4, aiRiskScore: 0.42 },
      ],
      activeEscalations: [],
      isTelemetryLive: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'PT-105',
      mrn: 'MRN-2026-51204',
      fullName: 'Kavita Deshmukh',
      age: 29,
      sex: 'F',
      ward: 'Emergency Trauma Resuscitation Suite',
      bedNumber: 'Bay 01',
      primaryDiagnosis: 'Motor Vehicle Collision Poly-Trauma with Hemothorax and Flail Chest',
      domain: 'EMERGENCY_MEDICINE',
      acuityLevel: 'HIGH',
      attendingPhysician: 'Dr. Sameer Joshi, MS, FACS (Trauma Lead)',
      admissionDate: '2026-08-23T15:30:00.000Z',
      vitals: {
        heartRateBpm: 128,
        systolicBpMmHg: 96,
        diastolicBpMmHg: 54,
        meanArterialPressureMmHg: 68,
        spO2Percent: 91,
        respiratoryRateMin: 32,
        temperatureCelsius: 35.8,
        etCO2MmHg: 30,
        lactateMmolL: 5.2,
        cardiacOutputLMin: 4.8,
        cardiacIndexLMinM2: 2.6,
        creatinineMgDl: 1.2,
        urineOutputMlKgHr: 0.45,
        cvpMmHg: 5,
        fiO2Percent: 80,
        peepCmH2O: 8,
        gcsScore: 12,
      },
      biomarkers: {
        troponinINgMl: 0.08,
        procalcitoninNgMl: 0.8,
        dDimerMcgMl: 8.9,
        crpMgL: 65,
        bnpPgMl: 120,
        sepsisBiomarkerIndex: 30,
        genomicMutationBurdenMutsMb: 0.5,
        aiDeteriorationRiskScore: 0.78,
        predictiveShockHorizonMinutes: 18,
        immunoOncologyResponseProb: 0.01,
      },
      calculations: {
        meanArterialPressure: 68,
        cardiacPowerOutput: 0.72,
        shockIndex: 1.33,
        modifiedShockIndex: 1.88,
        qSofaScore: 3,
        qSofaHighRisk: true,
        news2Score: 13,
        news2RiskLevel: 'HIGH',
        kdigoAkiStage: 1,
        kdigoInterpretation: 'Early pre-renal azotemia / hypovolemia.',
        pao2Fio2Ratio: 113.8,
      },
      alerts: [
        {
          id: 'ALT-105-1',
          patientId: 'PT-105',
          timestamp: '2026-08-23T18:20:00.000Z',
          severity: 'HIGH',
          metric: 'Shock Index & Acute Blood Loss',
          value: 'Shock Index: 1.33 | Lactate: 5.2 mmol/L',
          expectedRange: 'Shock Index < 0.7 | Lactate < 2.0 mmol/L',
          description: 'Hemorrhagic hypovolemic shock Class III secondary to thoracic trauma.',
          suggestedEscalation: 'Activate Massive Transfusion Protocol (1:1:1 PRBC, FFP, Platelets); transfer to OR for emergent thoracotomy.',
          protocolAction: 'MASSIVE_TRANSFUSION',
          acknowledged: false,
        }
      ],
      trendHistory: [
        { timestamp: '15:30', heartRate: 110, map: 82, spO2: 95, lactate: 3.2, aiRiskScore: 0.50 },
        { timestamp: '16:00', heartRate: 116, map: 76, spO2: 94, lactate: 3.8, aiRiskScore: 0.62 },
        { timestamp: '17:00', heartRate: 122, map: 71, spO2: 92, lactate: 4.6, aiRiskScore: 0.72 },
        { timestamp: '18:00', heartRate: 128, map: 68, spO2: 91, lactate: 5.2, aiRiskScore: 0.78 },
      ],
      activeEscalations: [],
      isTelemetryLive: true,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'PT-106',
      mrn: 'MRN-2026-44019',
      fullName: 'Arjun Nair',
      age: 63,
      sex: 'M',
      ward: 'Bio-AI Predictive Diagnostics Suite',
      bedNumber: 'Bed 06',
      primaryDiagnosis: 'Transient Ischemic Attack with Deep Neural AI Microvascular Monitoring',
      domain: 'BIO_AI_DIAGNOSTICS',
      acuityLevel: 'STABLE',
      attendingPhysician: 'Dr. Nandini Rao, DM (Neurology), PhD',
      admissionDate: '2026-08-23T09:00:00.000Z',
      vitals: {
        heartRateBpm: 68,
        systolicBpMmHg: 126,
        diastolicBpMmHg: 78,
        meanArterialPressureMmHg: 94,
        spO2Percent: 99,
        respiratoryRateMin: 14,
        temperatureCelsius: 36.6,
        etCO2MmHg: 40,
        lactateMmolL: 1.0,
        cardiacOutputLMin: 5.8,
        cardiacIndexLMinM2: 3.0,
        creatinineMgDl: 1.0,
        urineOutputMlKgHr: 1.4,
        cvpMmHg: 7,
        fiO2Percent: 21,
        peepCmH2O: 0,
        gcsScore: 15,
      },
      biomarkers: {
        troponinINgMl: 0.01,
        procalcitoninNgMl: 0.1,
        dDimerMcgMl: 0.4,
        crpMgL: 6,
        bnpPgMl: 45,
        sepsisBiomarkerIndex: 12,
        genomicMutationBurdenMutsMb: 0.4,
        aiDeteriorationRiskScore: 0.15,
        predictiveShockHorizonMinutes: 360,
        immunoOncologyResponseProb: 0.05,
      },
      calculations: {
        meanArterialPressure: 94,
        cardiacPowerOutput: 1.21,
        shockIndex: 0.54,
        modifiedShockIndex: 0.72,
        qSofaScore: 0,
        qSofaHighRisk: false,
        news2Score: 0,
        news2RiskLevel: 'LOW',
        kdigoAkiStage: 0,
        kdigoInterpretation: 'Normal organ systems and hemodynamics.',
        pao2Fio2Ratio: 471.4,
      },
      alerts: [],
      trendHistory: [
        { timestamp: '14:00', heartRate: 70, map: 96, spO2: 99, lactate: 1.0, aiRiskScore: 0.16 },
        { timestamp: '15:00', heartRate: 69, map: 95, spO2: 99, lactate: 1.0, aiRiskScore: 0.15 },
        { timestamp: '16:00', heartRate: 68, map: 94, spO2: 99, lactate: 1.0, aiRiskScore: 0.15 },
        { timestamp: '17:00', heartRate: 68, map: 94, spO2: 99, lactate: 1.0, aiRiskScore: 0.15 },
        { timestamp: '18:00', heartRate: 68, map: 94, spO2: 99, lactate: 1.0, aiRiskScore: 0.15 },
      ],
      activeEscalations: [],
      isTelemetryLive: true,
      lastUpdated: new Date().toISOString(),
    }
  ];

  public static async getPatients(filters: ClinicalFilterQuery): Promise<ClinicalPatientRecord[]> {
    return this.patients.filter((pt) => {
      if (filters.domain && filters.domain !== 'ALL' && pt.domain !== filters.domain) {
        return false;
      }
      if (filters.acuityLevel && filters.acuityLevel !== 'ALL' && pt.acuityLevel !== filters.acuityLevel) {
        return false;
      }
      if (filters.ward && filters.ward !== 'ALL' && !pt.ward.toLowerCase().includes(filters.ward.toLowerCase())) {
        return false;
      }
      if (filters.alertsOnly && pt.alerts.length === 0) {
        return false;
      }
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesName = pt.fullName.toLowerCase().includes(q);
        const matchesMrn = pt.mrn.toLowerCase().includes(q);
        const matchesBed = pt.bedNumber.toLowerCase().includes(q);
        const matchesDx = pt.primaryDiagnosis.toLowerCase().includes(q);
        const matchesDoc = pt.attendingPhysician.toLowerCase().includes(q);
        if (!matchesName && !matchesMrn && !matchesBed && !matchesDx && !matchesDoc) {
          return false;
        }
      }
      return true;
    });
  }

  public static async getPatientById(id: string): Promise<ClinicalPatientRecord | null> {
    const pt = this.patients.find((p) => p.id === id || p.mrn === id);
    return pt ? { ...pt } : null;
  }

  public static async admitPatient(payload: {
    fullName: string;
    age: number;
    sex: 'M' | 'F' | 'OTHER';
    ward: string;
    bedNumber: string;
    primaryDiagnosis: string;
    domain: ClinicalDomain;
    attendingPhysician: string;
    vitals: TelemetryVitals;
    biomarkers: BioAiBiomarkers;
  }): Promise<ClinicalPatientRecord> {
    const id = 'PT-' + Date.now().toString().slice(-4);
    const mrn = 'MRN-2026-' + Math.floor(10000 + Math.random() * 90000);

    const calcs = this.computeCalculations(payload.vitals, payload.vitals.creatinineMgDl);
    const alerts = this.generateAlerts(id, payload.vitals, payload.biomarkers, calcs);

    let acuityLevel: ClinicalAcuityLevel = 'STABLE';
    if (alerts.some((a) => a.severity === 'CRITICAL') || calcs.news2RiskLevel === 'HIGH') {
      acuityLevel = 'CRITICAL';
    } else if (alerts.some((a) => a.severity === 'HIGH') || calcs.news2RiskLevel === 'MEDIUM') {
      acuityLevel = 'HIGH';
    } else if (alerts.some((a) => a.severity === 'WARNING')) {
      acuityLevel = 'WARNING';
    } else if (alerts.some((a) => a.severity === 'MONITOR')) {
      acuityLevel = 'MONITOR';
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: ClinicalPatientRecord = {
      id,
      mrn,
      ...payload,
      acuityLevel,
      admissionDate: now.toISOString(),
      calculations: calcs,
      alerts,
      trendHistory: [
        {
          timestamp: timeStr,
          heartRate: payload.vitals.heartRateBpm,
          map: calcs.meanArterialPressure,
          spO2: payload.vitals.spO2Percent,
          lactate: payload.vitals.lactateMmolL,
          aiRiskScore: payload.biomarkers.aiDeteriorationRiskScore,
        }
      ],
      activeEscalations: [],
      isTelemetryLive: true,
      lastUpdated: now.toISOString(),
    };

    this.patients.unshift(newRecord);
    return newRecord;
  }

  public static async acknowledgeAlert(patientId: string, alertId: string, clinicianName: string): Promise<boolean> {
    const pt = this.patients.find((p) => p.id === patientId);
    if (!pt) return false;
    const alert = pt.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = clinicianName;
    alert.acknowledgedAt = new Date().toISOString();
    pt.lastUpdated = new Date().toISOString();
    return true;
  }

  public static async triggerEmergencyEscalation(payload: {
    patientId: string;
    protocolType: EmergencyProtocolType;
    triggeredBy: string;
    clinicalRationale: string;
  }): Promise<EmergencyProtocolEscalation | null> {
    const pt = this.patients.find((p) => p.id === payload.patientId);
    if (!pt) return null;

    const escalation: EmergencyProtocolEscalation = {
      id: 'ESC-' + Date.now().toString().slice(-4),
      patientId: payload.patientId,
      protocolType: payload.protocolType,
      triggeredBy: payload.triggeredBy,
      timestamp: new Date().toISOString(),
      clinicalRationale: payload.clinicalRationale,
      teamPagingStatus: 'DISPATCHED',
      vitalSnapshot: { ...pt.vitals },
      auditSignature: 'DIGITAL_SIG_' + payload.triggeredBy.toUpperCase().replace(/\s+/g, '_') + '_' + Date.now(),
    };

    pt.activeEscalations.unshift(escalation);
    pt.acuityLevel = 'CRITICAL';
    pt.lastUpdated = new Date().toISOString();
    return escalation;
  }

  public static async tickTelemetryStream(): Promise<void> {
    this.patients.forEach((pt) => {
      if (!pt.isTelemetryLive) return;

      // Small realistic stochastic vital fluctuation
      const hrDelta = (Math.random() - 0.5) * 2;
      const sbpDelta = (Math.random() - 0.5) * 3;
      const dbpDelta = (Math.random() - 0.5) * 2;
      const spo2Delta = (Math.random() - 0.48) * 0.5;

      pt.vitals.heartRateBpm = Math.max(35, Math.min(180, Math.round(pt.vitals.heartRateBpm + hrDelta)));
      pt.vitals.systolicBpMmHg = Math.max(60, Math.min(230, Math.round(pt.vitals.systolicBpMmHg + sbpDelta)));
      pt.vitals.diastolicBpMmHg = Math.max(30, Math.min(130, Math.round(pt.vitals.diastolicBpMmHg + dbpDelta)));
      pt.vitals.spO2Percent = Math.max(70, Math.min(100, Math.round((pt.vitals.spO2Percent + spo2Delta) * 10) / 10));
      pt.vitals.meanArterialPressureMmHg = this.calculateMAP(pt.vitals.systolicBpMmHg, pt.vitals.diastolicBpMmHg);

      pt.calculations = this.computeCalculations(pt.vitals, pt.vitals.creatinineMgDl);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      pt.trendHistory.push({
        timestamp: timeStr,
        heartRate: pt.vitals.heartRateBpm,
        map: pt.calculations.meanArterialPressure,
        spO2: pt.vitals.spO2Percent,
        lactate: pt.vitals.lactateMmolL,
        aiRiskScore: pt.biomarkers.aiDeteriorationRiskScore,
      });

      if (pt.trendHistory.length > 15) {
        pt.trendHistory.shift();
      }

      pt.lastUpdated = new Date().toISOString();
    });
  }

  public static async getSummaryMetrics(): Promise<TelemetrySummaryMetrics> {
    const total = this.patients.length;
    const critical = this.patients.filter((p) => p.acuityLevel === 'CRITICAL').length;
    const warning = this.patients.filter((p) => p.acuityLevel === 'HIGH' || p.acuityLevel === 'WARNING').length;
    const stable = this.patients.filter((p) => p.acuityLevel === 'STABLE' || p.acuityLevel === 'MONITOR').length;
    const sepsis = this.patients.filter((p) => p.calculations.qSofaHighRisk || p.biomarkers.sepsisBiomarkerIndex > 60).length;
    const escalations = this.patients.reduce((acc, p) => acc + p.activeEscalations.length, 0);

    const avgRisk = total > 0
      ? this.patients.reduce((acc, p) => acc + p.biomarkers.aiDeteriorationRiskScore, 0) / total
      : 0;

    return {
      totalMonitored: total,
      criticalCount: critical,
      warningCount: warning,
      stableCount: stable,
      sepsisRiskCount: sepsis,
      activeEscalationsCount: escalations,
      avgAiRiskScore: Math.round(avgRisk * 100) / 100,
      telemetryUptimePercent: 99.98,
    };
  }

  public static generateFHIRDiagnosticCSV(patient: ClinicalPatientRecord): string {
    const headers = [
      'Record_ID',
      'MRN',
      'Patient_Name',
      'Age',
      'Sex',
      'Ward',
      'Bed',
      'Primary_Diagnosis',
      'Attending_Physician',
      'Heart_Rate_BPM',
      'Systolic_BP_mmHg',
      'Diastolic_BP_mmHg',
      'MAP_mmHg',
      'SpO2_Percent',
      'RR_Min',
      'Temperature_C',
      'Lactate_mmolL',
      'Cardiac_Output_LMin',
      'Shock_Index',
      'qSOFA_Score',
      'NEWS2_Score',
      'KDIGO_Stage',
      'BioAI_Deterioration_Risk',
      'Active_Alerts_Count',
      'Timestamp'
    ];

    const row = [
      patient.id,
      patient.mrn,
      '"' + patient.fullName + '"',
      patient.age,
      patient.sex,
      '"' + patient.ward + '"',
      patient.bedNumber,
      '"' + patient.primaryDiagnosis + '"',
      '"' + patient.attendingPhysician + '"',
      patient.vitals.heartRateBpm,
      patient.vitals.systolicBpMmHg,
      patient.vitals.diastolicBpMmHg,
      patient.calculations.meanArterialPressure,
      patient.vitals.spO2Percent,
      patient.vitals.respiratoryRateMin,
      patient.vitals.temperatureCelsius,
      patient.vitals.lactateMmolL,
      patient.vitals.cardiacOutputLMin,
      patient.calculations.shockIndex,
      patient.calculations.qSofaScore,
      patient.calculations.news2Score,
      patient.calculations.kdigoAkiStage,
      (patient.biomarkers.aiDeteriorationRiskScore * 100).toFixed(1) + '%',
      patient.alerts.length,
      patient.lastUpdated,
    ];

    return headers.join(',') + '
' + row.join(',');
  }
}
