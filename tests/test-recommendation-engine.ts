import { describe, it, expect } from 'vitest';
import {
  extractSkillsAndInterestsFromText,
  calculateProfileCompletenessScore,
  calculateOpportunityMatch,
  rankRecommendationsForUser
} from '../src/services/recommendationEngine.js';

describe('AI Recommendation Engine', () => {
  it('should extract canonical skills and interest categories from raw text', () => {
    const text = "Experienced student developer working with React, TypeScript, Python, and PyTorch. Loves participating in open source GSoC projects and global hackathons.";
    const result = extractSkillsAndInterestsFromText(text);

    expect(result.skills).toContain('React');
    expect(result.skills).toContain('TypeScript');
    expect(result.skills).toContain('Python');
    expect(result.skills).toContain('PyTorch');

    expect(result.interests).toContain('Open Source');
    expect(result.interests).toContain('Hackathon');
  });

  it('should calculate accurate 0-100% profile completeness scores and breakdown', () => {
    const fullProfile = {
      name: "Chirag Dwivedi",
      email: "chirag@example.com",
      college: "Delhi Technological University",
      field: "Computer Science",
      skills: ["React", "Node.js", "Python"],
      bio: "Full stack developer interested in AI and Open Source.",
      resumeUrl: "https://example.com/resume.pdf",
      interests: ["Open Source", "Hackathon"]
    };

    const result = calculateProfileCompletenessScore(fullProfile, 1);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.breakdown.resume.earned).toBe(20);
    expect(result.breakdown.skills.earned).toBe(20);
  });

  it('should calculate 0-100% dynamic match score for candidate and opportunity', () => {
    const candidateProfile = {
      name: "Chirag Dwivedi",
      field: "Computer Science",
      skills: ["Python", "C++", "Git", "React"],
      canonicalSkills: ["Python", "Git", "C++"],
      interests: ["Open Source", "Grant"]
    };

    const opportunity = {
      id: "opp_gsoc",
      title: "Google Summer of Code 2026",
      organization: "Google",
      type: "Open Source Grant",
      tags: ["Python", "C++", "Git", "Open Source"],
      description: "Contribute to open source software using Python and C++.",
      location: "Remote"
    };

    const matchDetails = calculateOpportunityMatch(candidateProfile, opportunity);

    expect(matchDetails.matchScore).toBeGreaterThanOrEqual(75);
    expect(matchDetails.matchingSkills).toContain('Python');
    expect(matchDetails.matchingSkills).toContain('Git');
    expect(matchDetails.typeMatch).toBe(true);
  });

  it('should rank opportunities descending by match score and filter by minScore', () => {
    const candidateProfile = {
      skills: ["Solidity", "TypeScript", "React"],
      interests: ["Hackathon", "Web3"]
    };

    const opps = [
      { id: "1", title: "General Research", type: "Research", tags: ["Physics"] },
      { id: "2", title: "ETHGlobal Web3 Hackathon", type: "Hackathon", tags: ["Solidity", "TypeScript", "React"] }
    ];

    const result = rankRecommendationsForUser(candidateProfile, opps, [], undefined, { minScore: 50 });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].id).toBe("2");
    expect(result.items[0].matchScore).toBeGreaterThan(result.items[1]?.matchScore || 0);
  });
});
