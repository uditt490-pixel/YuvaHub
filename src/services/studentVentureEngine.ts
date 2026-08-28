import { IStudentVentureFund, StudentVentureFundSchema } from '../models/studentVentureSchema';

export interface VentureFilterQuery {
  campusName?: string;
  sectorDomain?: string;
  fundingStage?: string;
  search?: string;
}

const inMemoryVentures: IStudentVentureFund[] = [
  {
    ventureId: 'VENT-301',
    startupName: 'NeuralEdge Labs',
    campusName: 'IIT Bombay',
    studentFounderName: 'Vikramaditya Rao',
    sectorDomain: 'SAAS',
    fundingStage: 'PRE_SEED',
    targetInvestmentUsd: 150000,
    committedInvestmentUsd: 95000,
    investorCount: 6,
    investmentStatus: 'DUE_DILIGENCE',
    pitchDeckUrl: 'https://yuvahub.xyz/decks/neuraledge.pdf',
    executiveSummary: 'Autonomous edge-AI compiler pipeline reducing inference latency by 40%.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    ventureId: 'VENT-302',
    startupName: 'AgriSense Robotics',
    campusName: 'IIT Kharagpur',
    studentFounderName: 'Priya Mukherjee',
    sectorDomain: 'HARDWARE',
    fundingStage: 'SEED',
    targetInvestmentUsd: 200000,
    committedInvestmentUsd: 200000,
    investorCount: 12,
    investmentStatus: 'FULLY_COMMITTED',
    pitchDeckUrl: 'https://yuvahub.xyz/decks/agrisense.pdf',
    executiveSummary: 'Solar-powered autonomous soil analysis droids for precision yield forecasting.',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export class StudentVentureEngine {
  public static async registerVenture(payload: {
    startupName: string;
    campusName: string;
    studentFounderName?: string;
    founderStudentName?: string;
    sectorDomain: 'FINTECH' | 'HEALTH_TECH' | 'ED_TECH' | 'SAAS' | 'HARDWARE';
    fundingStage: 'PRE_SEED' | 'SEED' | 'SERIES_A' | 'STUDENT_GRANT';
    targetInvestmentUsd: number;
    pitchDeckUrl?: string;
    executiveSummary?: string;
    pitchSummary?: string;
  }): Promise<IStudentVentureFund> {
    const studentFounderName = payload.studentFounderName || payload.founderStudentName || 'Student Founder';
    const executiveSummary = payload.executiveSummary || payload.pitchSummary || 'Campus Venture Startup Summary';

    const venture: IStudentVentureFund = {
      startupName: payload.startupName,
      campusName: payload.campusName,
      studentFounderName,
      sectorDomain: payload.sectorDomain,
      fundingStage: payload.fundingStage,
      targetInvestmentUsd: payload.targetInvestmentUsd,
      ventureId: `VENT-${Date.now()}`,
      committedInvestmentUsd: 0,
      investorCount: 0,
      investmentStatus: 'OPEN',
      pitchDeckUrl: payload.pitchDeckUrl || '#',
      executiveSummary,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validated = StudentVentureFundSchema.parse(venture);
    inMemoryVentures.unshift(validated as IStudentVentureFund);
    return validated as IStudentVentureFund;
  }

  public static async getVentures(filters: VentureFilterQuery): Promise<IStudentVentureFund[]> {
    return inMemoryVentures.filter(item => {
      if (filters.campusName && filters.campusName !== 'All' && item.campusName !== filters.campusName) return false;
      if (filters.sectorDomain && filters.sectorDomain !== 'All' && item.sectorDomain !== filters.sectorDomain) return false;
      if (filters.fundingStage && filters.fundingStage !== 'All' && item.fundingStage !== filters.fundingStage) return false;
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesName = item.startupName.toLowerCase().includes(q);
        const matchesFounder = item.studentFounderName.toLowerCase().includes(q);
        const matchesCampus = item.campusName.toLowerCase().includes(q);
        if (!matchesName && !matchesFounder && !matchesCampus) return false;
      }
      return true;
    });
  }

  public static async commitInvestment(
    ventureId: string,
    investmentAmountUsd: number
  ): Promise<IStudentVentureFund | null> {
    const venture = inMemoryVentures.find(item => item.ventureId === ventureId);
    if (!venture) return null;

    venture.committedInvestmentUsd += investmentAmountUsd;
    venture.investorCount += 1;
    if (venture.committedInvestmentUsd >= venture.targetInvestmentUsd) {
      venture.investmentStatus = 'FULLY_COMMITTED';
    } else {
      venture.investmentStatus = 'DUE_DILIGENCE';
    }
    venture.updatedAt = new Date();

    return venture;
  }

  public static async investInVenture(
    ventureId: string,
    investmentAmountUsd: number,
    _investorName?: string
  ): Promise<IStudentVentureFund | null> {
    return this.commitInvestment(ventureId, investmentAmountUsd);
  }
}

