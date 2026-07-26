import { describe, it, expect } from 'vitest';
import { ProjectIncubationSchema, AIVentureEvaluationSchema } from '../src/models/incubationSchema';

describe('AI Project Incubation & Venture Studio Schema Tests', () => {
  it('should validate a valid venture incubation proposal', () => {
    const validProject = {
      title: 'DevPulse AI',
      tagline: 'Autonomous AI Code Reviewer and Security Inspector for Student Repositories',
      problemStatement: 'Student developers lack real-time enterprise-grade code security reviews.',
      solutionOverview: 'AI agent that runs static vulnerability audits and AST tree parsing on pull requests.',
      targetMarket: 'CS Students & Hackathon Participants',
      category: 'AI & Machine Learning',
      stage: 'MVP Built',
      fundingRequestedINR: 250000,
      valuationINR: 2500000
    };

    const parsed = ProjectIncubationSchema.parse(validProject);
    expect(parsed.title).toBe('DevPulse AI');
    expect(parsed.category).toBe('AI & Machine Learning');
    expect(parsed.stage).toBe('MVP Built');
    expect(parsed.aiFeasibilityScore).toBe(85);
  });

  it('should validate AI venture evaluation response schema', () => {
    const evaluation = {
      overallViabilityScore: 92,
      feasibilityRating: 'High - Robust architectural design and clear student target market.',
      marketOpportunityRating: 'Substantial - Growing TAM in Indian student ecosystem.',
      keyStrengths: ['Strong AI pipeline', 'Scalable architecture'],
      riskFactors: ['High competition from incumbents'],
      suggestedPivots: ['Freemium model for campus ambassadors'],
      grantEligibilityScore: 90,
      recommendedFundingTierINR: 200000
    };

    const parsed = AIVentureEvaluationSchema.parse(evaluation);
    expect(parsed.overallViabilityScore).toBe(92);
    expect(parsed.keyStrengths.length).toBe(2);
    expect(parsed.grantEligibilityScore).toBe(90);
  });
});
