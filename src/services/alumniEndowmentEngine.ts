import { IAlumniEndowmentFund, AlumniEndowmentFundSchema } from '../models/alumniEndowmentSchema';

export interface EndowmentFilterQuery {
  campusName?: string;
  fundCategory?: string;
  grantStatus?: string;
  search?: string;
}

const inMemoryEndowments: IAlumniEndowmentFund[] = [
  {
    fundId: 'ENDOW-101',
    fundName: 'Quantum Computing Research Grant',
    campusName: 'IIT Madras',
    donorName: 'Dr. Vikram Seth',
    donorAlumniBatchYear: 2012,
    fundCategory: 'RESEARCH_GRANT',
    targetAmountUsd: 50000,
    currentAmountRaisedUsd: 35000,
    totalDonorsCount: 14,
    grantStatus: 'ACTIVE',
    matchingGrantEnabled: true,
    matchingRatio: 1.5,
    description: 'Supporting high-impact quantum cryptography research labs for undergrads.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    fundId: 'ENDOW-102',
    fundName: 'Women in Tech STEM Scholarship',
    campusName: 'BITS Pilani',
    donorName: 'Sneha Kapur',
    donorAlumniBatchYear: 2016,
    fundCategory: 'STUDENT_SCHOLARSHIP',
    targetAmountUsd: 25000,
    currentAmountRaisedUsd: 25000,
    totalDonorsCount: 28,
    grantStatus: 'FULLY_FUNDED',
    matchingGrantEnabled: false,
    matchingRatio: 1.0,
    description: 'Full tuition micro-grants for outstanding female engineering students.',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export class AlumniEndowmentEngine {
  public static async createEndowment(payload: {
    fundName: string;
    campusName: string;
    donorName: string;
    donorAlumniBatchYear: number;
    fundCategory: 'RESEARCH_GRANT' | 'STUDENT_SCHOLARSHIP' | 'LAB_EQUIPMENT' | 'HACKATHON_SPONSORSHIP';
    targetAmountUsd: number;
    initialContributionUsd: number;
    matchingGrantEnabled: boolean;
    matchingRatio?: number;
    description: string;
  }): Promise<IAlumniEndowmentFund> {
    const matchingRatio = payload.matchingGrantEnabled ? payload.matchingRatio || 1.5 : 1.0;
    const effectiveContribution = payload.matchingGrantEnabled
      ? payload.initialContributionUsd * matchingRatio
      : payload.initialContributionUsd;

    const fund: IAlumniEndowmentFund = {
      ...payload,
      fundId: `ENDOW-${Date.now()}`,
      currentAmountRaisedUsd: effectiveContribution,
      totalDonorsCount: 1,
      grantStatus: effectiveContribution >= payload.targetAmountUsd ? 'FULLY_FUNDED' : 'ACTIVE',
      matchingRatio,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validated = AlumniEndowmentFundSchema.parse(fund);
    inMemoryEndowments.unshift(validated as IAlumniEndowmentFund);
    return validated as IAlumniEndowmentFund;
  }

  public static async getEndowments(filters: EndowmentFilterQuery): Promise<IAlumniEndowmentFund[]> {
    return inMemoryEndowments.filter(item => {
      if (filters.campusName && filters.campusName !== 'All' && item.campusName !== filters.campusName) return false;
      if (filters.fundCategory && filters.fundCategory !== 'All' && item.fundCategory !== filters.fundCategory) return false;
      if (filters.grantStatus && filters.grantStatus !== 'All' && item.grantStatus !== filters.grantStatus) return false;
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesName = item.fundName.toLowerCase().includes(q);
        const matchesDonor = item.donorName.toLowerCase().includes(q);
        const matchesCampus = item.campusName.toLowerCase().includes(q);
        if (!matchesName && !matchesDonor && !matchesCampus) return false;
      }
      return true;
    });
  }

  public static async contributeToFund(
    fundId: string,
    donationAmountUsd: number
  ): Promise<IAlumniEndowmentFund | null> {
    const fund = inMemoryEndowments.find(item => item.fundId === fundId);
    if (!fund) return null;

    const addedValue = fund.matchingGrantEnabled
      ? donationAmountUsd * fund.matchingRatio
      : donationAmountUsd;

    fund.currentAmountRaisedUsd += addedValue;
    fund.totalDonorsCount += 1;
    if (fund.currentAmountRaisedUsd >= fund.targetAmountUsd) {
      fund.grantStatus = 'FULLY_FUNDED';
    }
    fund.updatedAt = new Date();

    return fund;
  }

  public static resetInMemoryEndowments(funds?: IAlumniEndowmentFund[]) {
    inMemoryEndowments.length = 0;
    if (funds) {
      inMemoryEndowments.push(...funds);
    }
  }
}
