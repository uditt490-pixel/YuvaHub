import { IResearchPatentIp, ResearchPatentIpSchema } from '../models/researchPatentSchema';

export interface PatentFilterQuery {
  campusName?: string;
  technologyDomain?: string;
  patentStatus?: string;
  search?: string;
}

const inMemoryPatents: IResearchPatentIp[] = [
  {
    patentId: 'PAT-701',
    patentTitle: 'Neuromorphic Optical Computing Array',
    campusName: 'IISc Bangalore',
    leadInventorName: 'Dr. Ramesh Sundaram',
    patentApplicationNumber: 'IN-2025-99812',
    technologyDomain: 'QUANTUM',
    patentStatus: 'FILED',
    licensingFeeUsd: 120000,
    royaltySharePercent: 7.5,
    commercialPartnerAssigned: undefined,
    abstractDescription: 'Ultra-low latency sub-nanosecond photonics architecture for real-time edge AI inference.',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    patentId: 'PAT-702',
    patentTitle: 'Bio-Degradable Solid State Battery Electrolyte',
    campusName: 'IIT Delhi',
    leadInventorName: 'Prof. Priya Verma',
    patentApplicationNumber: 'IN-2024-44109',
    technologyDomain: 'CLEANTECH',
    patentStatus: 'LICENSED',
    licensingFeeUsd: 85000,
    royaltySharePercent: 5.0,
    commercialPartnerAssigned: 'Tata Cleantech Ventures',
    abstractDescription: 'High energy density non-flammable organic electrolyte for urban EV storage solutions.',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export class ResearchPatentEngine {
  public static async registerPatent(payload: {
    patentTitle: string;
    campusName: string;
    leadInventorName: string;
    patentApplicationNumber: string;
    technologyDomain: 'ARTIFICIAL_INTELLIGENCE' | 'BIOTECH' | 'CLEANTECH' | 'QUANTUM' | 'SEMICONDUCTORS';
    licensingFeeUsd: number;
    royaltySharePercent: number;
    abstractDescription: string;
  }): Promise<IResearchPatentIp> {
    const patent: IResearchPatentIp = {
      ...payload,
      patentId: `PAT-${Date.now()}`,
      patentStatus: 'FILED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validated = ResearchPatentIpSchema.parse(patent);
    inMemoryPatents.unshift(validated as IResearchPatentIp);
    return validated as IResearchPatentIp;
  }

  public static async getPatents(filters: PatentFilterQuery): Promise<IResearchPatentIp[]> {
    return inMemoryPatents.filter(item => {
      if (filters.campusName && filters.campusName !== 'All' && item.campusName !== filters.campusName) return false;
      if (filters.technologyDomain && filters.technologyDomain !== 'All' && item.technologyDomain !== filters.technologyDomain) return false;
      if (filters.patentStatus && filters.patentStatus !== 'All' && item.patentStatus !== filters.patentStatus) return false;
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.toLowerCase();
        const matchesTitle = item.patentTitle.toLowerCase().includes(q);
        const matchesInventor = item.leadInventorName.toLowerCase().includes(q);
        const matchesAppNo = item.patentApplicationNumber.toLowerCase().includes(q);
        if (!matchesTitle && !matchesInventor && !matchesAppNo) return false;
      }
      return true;
    });
  }

  public static async executeLicensingAgreement(
    patentId: string,
    commercialPartnerName: string
  ): Promise<IResearchPatentIp | null> {
    const patent = inMemoryPatents.find(item => item.patentId === patentId || item.patentApplicationNumber === patentId);
    if (patent) {
      patent.commercialPartnerAssigned = commercialPartnerName;
      patent.patentStatus = 'LICENSED';
      patent.updatedAt = new Date();
      return patent;
    }
    return null;
  }

  public static resetInMemoryPatents(patents?: IResearchPatentIp[]) {
    inMemoryPatents.length = 0;
    if (patents) {
      inMemoryPatents.push(...patents);
    }
  }
}
