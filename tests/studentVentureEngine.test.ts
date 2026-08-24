import { describe, it, expect, beforeEach } from 'vitest';
import { StudentVentureEngine } from '../src/services/studentVentureEngine';
import { StudentVentureFundSchema } from '../src/models/studentVentureSchema';

describe('StudentVentureEngine Unit Tests', () => {
  const initialMockVentures = [
    {
      ventureId: 'VENT-TEST-101',
      startupName: 'QuantumPay Labs',
      campusName: 'IIT Bombay',
      studentFounderName: 'Aditya Sharma',
      sectorDomain: 'FINTECH' as const,
      fundingStage: 'PRE_SEED' as const,
      targetInvestmentUsd: 100000,
      committedInvestmentUsd: 25000,
      investorCount: 2,
      investmentStatus: 'DUE_DILIGENCE' as const,
      pitchDeckUrl: 'https://yuvahub.xyz/decks/quantumpay.pdf',
      executiveSummary: 'Zero-latency cross-border micro-payments for gig workers.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      ventureId: 'VENT-TEST-102',
      startupName: 'BioHealth AI',
      campusName: 'BITS Pilani',
      studentFounderName: 'Meera Deshmukh',
      sectorDomain: 'HEALTH_TECH' as const,
      fundingStage: 'SEED' as const,
      targetInvestmentUsd: 150000,
      committedInvestmentUsd: 150000,
      investorCount: 8,
      investmentStatus: 'FULLY_COMMITTED' as const,
      pitchDeckUrl: 'https://yuvahub.xyz/decks/biohealth.pdf',
      executiveSummary: 'AI diagnostic copilot for rural healthcare clinics.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    StudentVentureEngine.resetInMemoryVentures(
      initialMockVentures.map((item) => ({ ...item }))
    );
  });

  describe('Startup Registration & Zod Schema Validation', () => {
    it('should register a new student startup with valid schema and default OPEN status', async () => {
      const venture = await StudentVentureEngine.registerVenture({
        startupName: 'OmniSaaS AI',
        campusName: 'IIIT Hyderabad',
        studentFounderName: 'Siddharth Varma',
        sectorDomain: 'SAAS',
        fundingStage: 'PRE_SEED',
        targetInvestmentUsd: 75000,
        executiveSummary: 'Automated CRM workflow engine for indie developers.',
      });

      expect(venture.ventureId).toBeDefined();
      expect(venture.startupName).toBe('OmniSaaS AI');
      expect(venture.committedInvestmentUsd).toBe(0);
      expect(venture.investorCount).toBe(0);
      expect(venture.investmentStatus).toBe('OPEN');

      const parsed = StudentVentureFundSchema.safeParse(venture);
      expect(parsed.success).toBe(true);
    });
  });

  describe('Filtering & Searching Student Startups', () => {
    it('should filter ventures by campusName', async () => {
      const results = await StudentVentureEngine.getVentures({ campusName: 'IIT Bombay' });
      expect(results.length).toBe(1);
      expect(results[0].startupName).toBe('QuantumPay Labs');
    });

    it('should filter ventures by sectorDomain', async () => {
      const results = await StudentVentureEngine.getVentures({ sectorDomain: 'HEALTH_TECH' });
      expect(results.length).toBe(1);
      expect(results[0].startupName).toBe('BioHealth AI');
    });

    it('should filter ventures by fundingStage', async () => {
      const results = await StudentVentureEngine.getVentures({ fundingStage: 'SEED' });
      expect(results.length).toBe(1);
      expect(results[0].startupName).toBe('BioHealth AI');
    });

    it('should search ventures by startup name, founder, or campus', async () => {
      const nameResults = await StudentVentureEngine.getVentures({ search: 'QuantumPay' });
      expect(nameResults.length).toBe(1);

      const founderResults = await StudentVentureEngine.getVentures({ search: 'Meera' });
      expect(founderResults.length).toBe(1);

      const campusResults = await StudentVentureEngine.getVentures({ search: 'BITS' });
      expect(campusResults.length).toBe(1);
    });

    it('should return all ventures when filters are set to "All"', async () => {
      const results = await StudentVentureEngine.getVentures({
        campusName: 'All',
        sectorDomain: 'All',
        fundingStage: 'All',
      });
      expect(results.length).toBe(2);
    });
  });

  describe('Capital Investment Commitments & Status Transitions', () => {
    it('should record investment, update committed capital, increment investor count, and set DUE_DILIGENCE status', async () => {
      const updated = await StudentVentureEngine.commitInvestment('VENT-TEST-101', 25000);

      expect(updated).not.toBeNull();
      expect(updated?.committedInvestmentUsd).toBe(50000);
      expect(updated?.investorCount).toBe(3);
      expect(updated?.investmentStatus).toBe('DUE_DILIGENCE');
    });

    it('should transition status to FULLY_COMMITTED when target investment is reached or exceeded', async () => {
      const updated = await StudentVentureEngine.commitInvestment('VENT-TEST-101', 80000);

      expect(updated).not.toBeNull();
      expect(updated?.committedInvestmentUsd).toBe(105000);
      expect(updated?.investmentStatus).toBe('FULLY_COMMITTED');
    });

    it('should return null when committing investment to a non-existent venture ID', async () => {
      const result = await StudentVentureEngine.commitInvestment('INVALID-VENT-ID', 10000);
      expect(result).toBeNull();
    });
  });
});
