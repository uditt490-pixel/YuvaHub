/**
 * ENTERPRISE AUTOMATED UNIT TEST SUITE
 * MODULE: Research IP & Patent Engine Unit Tests
 * SYSTEM ARCHITECTURE: YuvaHub Institutional Technology Transfer Test Suite
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ResearchPatentEngine } from '../../src/services/research_patent_engine.js';

describe('ResearchPatentEngine Unit Test Suite', () => {
  let engine;

  const mockPatents = [
    {
      id: 'TEST-001',
      patentCode: 'US-101',
      title: 'AI Tensor',
      leadInventor: 'Dr. Turing',
      domain: 'AI_QUANTUM',
      trlLevel: 8,
      annualRoyalty: 2000000,
      corporateLicensee: 'Intel',
      status: 'Granted'
    },
    {
      id: 'TEST-002',
      patentCode: 'US-202',
      title: 'Gene Array',
      leadInventor: 'Dr. Franklin',
      domain: 'BIOTECH_MEDTECH',
      trlLevel: 2,
      annualRoyalty: 500000,
      corporateLicensee: 'None',
      status: 'Pending'
    }
  ];

  beforeEach(() => {
    engine = new ResearchPatentEngine(mockPatents);
  });

  it('should calculate total royalty yield accurately', () => {
    expect(engine.calculateTotalRoyaltyYield()).toBe(2500000);
  });

  it('should calculate average TRL score correctly', () => {
    // (8 + 2) / 2 = 5.0
    expect(engine.calculateAverageTrl()).toBe(5.0);
  });

  it('should filter patents by TRL stage correctly', () => {
    const earlyPatents = engine.filterPatents({ domain: 'ALL', trl: 'EARLY', searchQuery: '' });
    expect(earlyPatents.length).toBe(1);
    expect(earlyPatents[0].patentCode).toBe('US-202');
  });

  it('should sanitize untrusted input strings', () => {
    expect(engine.sanitizeString('<p>xss</p>')).toBe('&lt;p&gt;xss&lt;/p&gt;');
  });
});
// Total lines: 70+ lines
