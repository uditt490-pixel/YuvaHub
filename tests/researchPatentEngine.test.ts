import { describe, it, expect, beforeEach } from 'vitest';
import { ResearchPatentEngine } from '../src/services/researchPatentEngine';
import { ResearchPatentIpSchema } from '../src/models/researchPatentSchema';

describe('ResearchPatentEngine Unit Tests', () => {
  const initialMockPatents = [
    {
      patentId: 'PAT-TEST-701',
      patentTitle: 'Quantum Photonics Qubit Transceiver',
      campusName: 'IISc Bangalore',
      leadInventorName: 'Dr. Ramesh Sundaram',
      patentApplicationNumber: 'IN-2025-99812',
      technologyDomain: 'QUANTUM' as const,
      patentStatus: 'FILED' as const,
      licensingFeeUsd: 120000,
      royaltySharePercent: 7.5,
      commercialPartnerAssigned: undefined,
      abstractDescription: 'Ultra-low latency sub-nanosecond photonics architecture for real-time edge AI inference.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      patentId: 'PAT-TEST-702',
      patentTitle: 'Solid State Electrolyte Battery Cell',
      campusName: 'IIT Delhi',
      leadInventorName: 'Prof. Priya Verma',
      patentApplicationNumber: 'IN-2024-44109',
      technologyDomain: 'CLEANTECH' as const,
      patentStatus: 'LICENSED' as const,
      licensingFeeUsd: 85000,
      royaltySharePercent: 5.0,
      commercialPartnerAssigned: 'Tata Cleantech Ventures',
      abstractDescription: 'High energy density non-flammable organic electrolyte for urban EV storage solutions.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    ResearchPatentEngine.resetInMemoryPatents(
      initialMockPatents.map((item) => ({ ...item }))
    );
  });

  describe('Patent Filing Registration & Zod Schema Validation', () => {
    it('should register a new research patent with valid schema and default FILED status', async () => {
      const patent = await ResearchPatentEngine.registerPatent({
        patentTitle: 'Gallium Nitride Power Microchip',
        campusName: 'IIT Bombay',
        leadInventorName: 'Dr. Vikramaditya Rao',
        patentApplicationNumber: 'IN-2026-11902',
        technologyDomain: 'SEMICONDUCTORS',
        licensingFeeUsd: 65000,
        royaltySharePercent: 4.5,
        abstractDescription: 'High-frequency GaN power transistors for satellite communications.',
      });

      expect(patent.patentId).toBeDefined();
      expect(patent.patentTitle).toBe('Gallium Nitride Power Microchip');
      expect(patent.patentStatus).toBe('FILED');
      expect(patent.royaltySharePercent).toBe(4.5);

      const parsed = ResearchPatentIpSchema.safeParse(patent);
      expect(parsed.success).toBe(true);
    });
  });

  describe('Filtering & Searching Patent Portfolios', () => {
    it('should filter patents by campusName', async () => {
      const results = await ResearchPatentEngine.getPatents({ campusName: 'IISc Bangalore' });
      expect(results.length).toBe(1);
      expect(results[0].patentTitle).toBe('Quantum Photonics Qubit Transceiver');
    });

    it('should filter patents by technologyDomain', async () => {
      const results = await ResearchPatentEngine.getPatents({ technologyDomain: 'CLEANTECH' });
      expect(results.length).toBe(1);
      expect(results[0].patentTitle).toBe('Solid State Electrolyte Battery Cell');
    });

    it('should filter patents by patentStatus', async () => {
      const results = await ResearchPatentEngine.getPatents({ patentStatus: 'LICENSED' });
      expect(results.length).toBe(1);
      expect(results[0].patentId).toBe('PAT-TEST-702');
    });

    it('should search patents by title, lead inventor, or application number', async () => {
      const titleResults = await ResearchPatentEngine.getPatents({ search: 'Quantum Photonics' });
      expect(titleResults.length).toBe(1);

      const inventorResults = await ResearchPatentEngine.getPatents({ search: 'Priya Verma' });
      expect(inventorResults.length).toBe(1);

      const appNumResults = await ResearchPatentEngine.getPatents({ search: 'IN-2025-99812' });
      expect(appNumResults.length).toBe(1);
    });

    it('should return all patents when filters are set to "All"', async () => {
      const results = await ResearchPatentEngine.getPatents({
        campusName: 'All',
        technologyDomain: 'All',
        patentStatus: 'All',
      });
      expect(results.length).toBe(2);
    });
  });

  describe('Commercial Patent Licensing & Status Transitions', () => {
    it('should assign commercial partner and update status to LICENSED by patentId', async () => {
      const updated = await ResearchPatentEngine.executeLicensingAgreement(
        'PAT-TEST-701',
        'Intel Capital Technologies'
      );

      expect(updated).not.toBeNull();
      expect(updated?.commercialPartnerAssigned).toBe('Intel Capital Technologies');
      expect(updated?.patentStatus).toBe('LICENSED');
    });

    it('should assign commercial partner by patentApplicationNumber', async () => {
      const updated = await ResearchPatentEngine.executeLicensingAgreement(
        'IN-2025-99812',
        'NVIDIA Research Labs'
      );

      expect(updated).not.toBeNull();
      expect(updated?.commercialPartnerAssigned).toBe('NVIDIA Research Labs');
      expect(updated?.patentStatus).toBe('LICENSED');
    });

    it('should return null when executing licensing agreement for non-existent patent ID', async () => {
      const result = await ResearchPatentEngine.executeLicensingAgreement(
        'PAT-NON-EXISTENT',
        'Acme Corp'
      );
      expect(result).toBeNull();
    });
  });
});
