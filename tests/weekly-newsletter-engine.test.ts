import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../src/services/emailService.js', () => ({
  emailService: {
    sendTransactionalNotification: vi.fn().mockResolvedValue({ id: 'mock_email_123' }),
  },
}));

vi.mock('../src/api/genai.js', () => ({
  getGenAI: vi.fn(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: 'Hi Aarav, based on your React and TypeScript background, here are 5 exceptional opportunities. Explore leading roles and hackathons to jumpstart your career this week!',
      }),
    },
  })),
  getAIFallback: vi.fn(() => 'Fallback intro text'),
}));

import {
  generateNewsletterIntro,
  buildNewsletterHtml,
  rankOpportunitiesForUser,
  runWeeklyNewsletterBatch,
} from '../src/services/newsletterEngine';
import { emailService } from '../src/services/emailService';

describe('Personalized Weekly Career Newsletter Engine (#903)', () => {
  const mockOpportunities = [
    {
      _id: 'opp_1',
      id: 'opp_1',
      title: 'Senior Frontend Developer Intern',
      organization: 'Vercel',
      type: 'Internship',
      tags: ['React', 'TypeScript', 'Next.js'],
      description: 'Build fast web experiences with React and Next.js',
      registeredCount: 45,
    },
    {
      _id: 'opp_2',
      id: 'opp_2',
      title: 'AI Systems Engineer Fellowship',
      organization: 'Anthropic',
      type: 'Fellowship',
      tags: ['Python', 'PyTorch', 'LLMs'],
      description: 'Train and align frontier AI models',
      registeredCount: 88,
    },
    {
      _id: 'opp_3',
      id: 'opp_3',
      title: 'Full Stack Open Source Contributor',
      organization: 'Linux Foundation',
      type: 'Open Source',
      tags: ['TypeScript', 'Node.js', 'Go'],
      description: 'Contribute to core open source systems',
      registeredCount: 20,
    },
    {
      _id: 'opp_4',
      id: 'opp_4',
      title: 'Global Hackathon Championship 2026',
      organization: 'Devfolio',
      type: 'Hackathon',
      tags: ['Hackathon', 'Web3', 'React'],
      description: 'Compete for $50k prize pool',
      registeredCount: 310,
    },
    {
      _id: 'opp_5',
      id: 'opp_5',
      title: 'Cybersecurity Research Scholar',
      organization: 'CERT-In',
      type: 'Research',
      tags: ['Security', 'Cryptography', 'Linux'],
      description: 'Vulnerability assessment and crypto systems research',
      registeredCount: 15,
    },
    {
      _id: 'opp_6',
      id: 'opp_6',
      title: 'Product Design & UI/UX Intern',
      organization: 'Figma',
      type: 'Internship',
      tags: ['Design', 'Figma', 'UI/UX'],
      description: 'Design community components and systems',
      registeredCount: 12,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. AI Opportunity Ranking & Tag Matching', () => {
    it('should select exactly 5 top opportunities ranked by skill and tag alignment', () => {
      const user = {
        email: 'aarav@example.com',
        name: 'Aarav',
        skills: ['React', 'TypeScript', 'Node.js'],
        field: 'Software Engineering',
      };

      const top5 = rankOpportunitiesForUser(mockOpportunities, user, 5);

      expect(top5.length).toBe(5);
      // Top match should be the highest-relevance React/TypeScript opportunity
      expect(top5[0].title).toBe('Senior Frontend Developer Intern');
      expect(top5.map(o => o.title)).toContain('Full Stack Open Source Contributor');
    });
  });

  describe('2. AI Personalized Intro Generation', () => {
    it('should generate a 2-sentence intro mentioning candidate background', async () => {
      const user = {
        email: 'aarav@example.com',
        name: 'Aarav',
        skills: ['React', 'TypeScript'],
      };

      const topOpps = rankOpportunitiesForUser(mockOpportunities, user, 5);
      const intro = await generateNewsletterIntro(user, topOpps);

      expect(typeof intro).toBe('string');
      expect(intro).toContain('Aarav');
      expect(intro.length).toBeGreaterThan(30);
    });
  });

  describe('3. Responsive HTML Template & Unsubscribe URL', () => {
    it('should generate responsive HTML email with exactly 5 opportunities and reliable unsubscribe link', () => {
      const user = {
        email: 'aarav@example.com',
        name: 'Aarav Sharma',
        skills: ['React', 'TypeScript'],
      };

      const topOpps = rankOpportunitiesForUser(mockOpportunities, user, 5);
      const unsubUrl = 'https://yuvahub.xyz/api/v1/newsletter/unsubscribe?email=aarav%40example.com';
      const html = buildNewsletterHtml(user, 'Custom intro message.', topOpps, unsubUrl);

      expect(html).toContain('YuvaHub Weekly Dispatch');
      expect(html).toContain('Senior Frontend Developer Intern');
      expect(html).toContain(unsubUrl);
      expect(html).toContain('Unsubscribe');
    });
  });

  describe('4. Batch Queue Processing Engine', () => {
    it('should process user base in memory-safe batches and dispatch personalized newsletters', async () => {
      const mockUsers = [
        {
          email: 'user1@example.com',
          name: 'User 1',
          skills: ['React'],
          newsletter_subscribed: true,
        },
        {
          email: 'user2@example.com',
          name: 'User 2',
          skills: ['Python'],
          newsletter_subscribed: false, // Unsubscribed
        },
        {
          email: 'user3@example.com',
          name: 'User 3',
          skills: ['Security'],
          newsletter_subscribed: true,
        },
      ];

      const mockDb = {
        collection: (name: string) => {
          if (name === 'opportunities') {
            return {
              find: () => ({ limit: () => ({ toArray: async () => mockOpportunities }) }),
            };
          }
          if (name === 'users') {
            return {
              countDocuments: async () => mockUsers.length,
              find: () => ({
                skip: (s: number) => ({
                  limit: (l: number) => ({
                    toArray: async () => mockUsers.slice(s, s + l),
                  }),
                }),
              }),
            };
          }
          return {};
        },
      };

      const result = await runWeeklyNewsletterBatch(mockDb as any, {
        batchSize: 2,
        dryRun: false,
      });

      expect(result.processed).toBe(3);
      expect(result.sent).toBe(2); // 2 subscribed
      expect(result.skipped).toBe(1); // 1 unsubscribed
      expect(result.errors).toBe(0);

      expect(emailService.sendTransactionalNotification).toHaveBeenCalledTimes(2);
    });
  });
});
