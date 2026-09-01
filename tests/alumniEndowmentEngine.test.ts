import { describe, it, expect, beforeEach } from 'vitest';
import { AlumniEndowmentEngine } from '../src/services/alumniEndowmentEngine';
import { AlumniEndowmentFundSchema } from '../src/models/alumniEndowmentSchema';

describe('AlumniEndowmentEngine Unit Tests', () => {
  const initialMockFunds = [
    {
      fundId: 'ENDOW-TEST-101',
      fundName: 'Quantum Computing Research Fellowship',
      campusName: 'IIT Madras',
      donorName: 'Dr. Vikram Seth',
      donorAlumniBatchYear: 2012,
      fundCategory: 'RESEARCH_GRANT' as const,
      targetAmountUsd: 50000,
      currentAmountRaisedUsd: 35000,
      totalDonorsCount: 14,
      grantStatus: 'ACTIVE' as const,
      matchingGrantEnabled: true,
      matchingRatio: 1.5,
      description: 'Supporting high-impact quantum cryptography research labs for undergrads.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      fundId: 'ENDOW-TEST-102',
      fundName: 'Women in Tech STEM Scholarship',
      campusName: 'BITS Pilani',
      donorName: 'Sneha Kapur',
      donorAlumniBatchYear: 2016,
      fundCategory: 'STUDENT_SCHOLARSHIP' as const,
      targetAmountUsd: 25000,
      currentAmountRaisedUsd: 25000,
      totalDonorsCount: 28,
      grantStatus: 'FULLY_FUNDED' as const,
      matchingGrantEnabled: false,
      matchingRatio: 1.0,
      description: 'Full tuition micro-grants for outstanding female engineering students.',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    AlumniEndowmentEngine.resetInMemoryEndowments(
      initialMockFunds.map((item) => ({ ...item }))
    );
  });

  describe('Fund Proposal Creation & Corporate Matching Calculations', () => {
    it('should create a fund with 1.5x matching grant corporate multiplier', async () => {
      const fund = await AlumniEndowmentEngine.createEndowment({
        fundName: 'AI Innovation Lab Endowment',
        campusName: 'IIT Bombay',
        donorName: 'Anil Agarwal',
        donorAlumniBatchYear: 2008,
        fundCategory: 'LAB_EQUIPMENT',
        targetAmountUsd: 40000,
        initialContributionUsd: 10000,
        matchingGrantEnabled: true,
        matchingRatio: 1.5,
        description: 'Sponsoring GPU workstation clusters for AI student researchers.',
      });

      expect(fund.fundId).toBeDefined();
      expect(fund.currentAmountRaisedUsd).toBe(15000); // 10000 * 1.5
      expect(fund.totalDonorsCount).toBe(1);
      expect(fund.grantStatus).toBe('ACTIVE');

      const parsed = AlumniEndowmentFundSchema.safeParse(fund);
      expect(parsed.success).toBe(true);
    });

    it('should create a fund with 1.0x ratio when matching grant is disabled', async () => {
      const fund = await AlumniEndowmentEngine.createEndowment({
        fundName: 'Robotics Hackathon Prize Pool',
        campusName: 'IIT Kharagpur',
        donorName: 'Rahul Mehra',
        donorAlumniBatchYear: 2015,
        fundCategory: 'HACKATHON_SPONSORSHIP',
        targetAmountUsd: 10000,
        initialContributionUsd: 5000,
        matchingGrantEnabled: false,
        description: 'Cash prizes for autonomous drone navigation hackathon.',
      });

      expect(fund.currentAmountRaisedUsd).toBe(5000);
      expect(fund.matchingRatio).toBe(1.0);
    });
  });

  describe('Filtering & Searching Endowment Portfolios', () => {
    it('should filter funds by campusName', async () => {
      const results = await AlumniEndowmentEngine.getEndowments({ campusName: 'IIT Madras' });
      expect(results.length).toBe(1);
      expect(results[0].fundName).toBe('Quantum Computing Research Fellowship');
    });

    it('should filter funds by fundCategory', async () => {
      const results = await AlumniEndowmentEngine.getEndowments({ fundCategory: 'STUDENT_SCHOLARSHIP' });
      expect(results.length).toBe(1);
      expect(results[0].fundId).toBe('ENDOW-TEST-102');
    });

    it('should filter funds by grantStatus', async () => {
      const results = await AlumniEndowmentEngine.getEndowments({ grantStatus: 'FULLY_FUNDED' });
      expect(results.length).toBe(1);
      expect(results[0].fundName).toBe('Women in Tech STEM Scholarship');
    });

    it('should search funds by fund name, donor, or campus', async () => {
      const nameResults = await AlumniEndowmentEngine.getEndowments({ search: 'Quantum' });
      expect(nameResults.length).toBe(1);

      const donorResults = await AlumniEndowmentEngine.getEndowments({ search: 'Sneha' });
      expect(donorResults.length).toBe(1);

      const campusResults = await AlumniEndowmentEngine.getEndowments({ search: 'Pilani' });
      expect(campusResults.length).toBe(1);
    });

    it('should return all funds when filters are set to "All"', async () => {
      const results = await AlumniEndowmentEngine.getEndowments({
        campusName: 'All',
        fundCategory: 'All',
        grantStatus: 'All',
      });
      expect(results.length).toBe(2);
    });
  });

  describe('Micro-Grant Contributions & FULLY_FUNDED Status Transitions', () => {
    it('should process donation contribution, apply matching multiplier, and increment donor count', async () => {
      const updated = await AlumniEndowmentEngine.contributeToFund('ENDOW-TEST-101', 2000);

      expect(updated).not.toBeNull();
      expect(updated?.currentAmountRaisedUsd).toBe(38000); // 35000 + (2000 * 1.5)
      expect(updated?.totalDonorsCount).toBe(15);
      expect(updated?.grantStatus).toBe('ACTIVE');
    });

    it('should transition grantStatus to FULLY_FUNDED when target is reached', async () => {
      const updated = await AlumniEndowmentEngine.contributeToFund('ENDOW-TEST-101', 12000);

      expect(updated).not.toBeNull();
      expect(updated?.currentAmountRaisedUsd).toBe(53000); // 35000 + (12000 * 1.5) = 53000 >= 50000
      expect(updated?.grantStatus).toBe('FULLY_FUNDED');
    });

    it('should return null when contributing to a non-existent fund ID', async () => {
      const result = await AlumniEndowmentEngine.contributeToFund('ENDOW-INVALID-ID', 1000);
      expect(result).toBeNull();
    });
  });
});
