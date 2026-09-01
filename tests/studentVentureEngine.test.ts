import { describe, it, expect } from 'vitest';
import { StudentVentureEngine } from '../src/services/studentVentureEngine';

describe('Student Ventures & Campus Startup Capital Engine (#ECSoC_2026)', () => {
  it('should retrieve list of student startups', async () => {
    const ventures = await StudentVentureEngine.getVentures({});
    expect(ventures.length).toBeGreaterThan(0);
    expect(ventures[0]).toHaveProperty('ventureId');
    expect(ventures[0]).toHaveProperty('targetInvestmentUsd');
  });

  it('should filter ventures by sector domain', async () => {
    const hardwareStartups = await StudentVentureEngine.getVentures({
      sectorDomain: 'HARDWARE',
    });
    expect(hardwareStartups.every(v => v.sectorDomain === 'HARDWARE')).toBe(true);
  });

  it('should register a new student venture', async () => {
    const created = await StudentVentureEngine.registerVenture({
      startupName: 'SolarFlow Agrotech',
      campusName: 'IIT Roorkee',
      founderStudentName: 'Devansh Pandey',
      sectorDomain: 'HARDWARE',
      fundingStage: 'PRE_SEED',
      targetInvestmentUsd: 30000,
      pitchSummary: 'IoT and solar-powered micro-irrigation controller networks for smallholder farms.',
    });

    expect(created.ventureId).toBeDefined();
    expect(created.investmentStatus).toBe('OPEN');
    expect(created.committedInvestmentUsd).toBe(0);
  });

  it('should commit micro-investments to a venture', async () => {
    const ventures = await StudentVentureEngine.getVentures({});
    const target = ventures[0];
    const initialCommitted = target.committedInvestmentUsd;

    const updated = await StudentVentureEngine.investInVenture(target.ventureId!, 10000, 'Campus VC Club');
    expect(updated).not.toBeNull();
    expect(updated!.committedInvestmentUsd).toBeGreaterThan(initialCommitted);
    expect(updated!.investorCount).toBeGreaterThan(0);
  });
});
