/**
 * ENTERPRISE AUTOMATED UNIT TEST SUITE
 * MODULE: Student Venture Engine Unit Tests
 * SYSTEM ARCHITECTURE: YuvaHub Startup Incubator Test Suite
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StudentVentureEngine } from '../../src/services/student_venture_engine.js';

describe('StudentVentureEngine Unit Test Suite', () => {
  let engine;

  const mockVentures = [
    {
      id: 'TEST-001',
      startupCode: 'VEN-101',
      name: 'OmniAI',
      studentFounder: 'Alex Chen',
      sector: 'AI_SAAS',
      arrRevenue: 1000000,
      valuation: 10000000,
      stage: 'SERIES_A',
      status: 'Graduate'
    },
    {
      id: 'TEST-002',
      startupCode: 'VEN-202',
      name: 'PayFlow',
      studentFounder: 'Maya Lin',
      sector: 'FINTECH_CRYPTO',
      arrRevenue: 500000,
      valuation: 5000000,
      stage: 'SEED',
      status: 'Active'
    }
  ];

  beforeEach(() => {
    engine = new StudentVentureEngine(mockVentures);
  });

  it('should calculate total portfolio valuation accurately', () => {
    expect(engine.calculateTotalValuation()).toBe(15000000);
  });

  it('should calculate total combined ARR correctly', () => {
    expect(engine.calculateTotalArr()).toBe(1500000);
  });

  it('should filter ventures by stage correctly', () => {
    const seedVentures = engine.filterVentures({ sector: 'ALL', stage: 'SEED', searchQuery: '' });
    expect(seedVentures.length).toBe(1);
    expect(seedVentures[0].name).toBe('PayFlow');
  });

  it('should sanitize untrusted input strings', () => {
    expect(engine.sanitizeString('<span>val</span>')).toBe('&lt;span&gt;val&lt;/span&gt;');
  });
});
// Total lines: 70+ lines
