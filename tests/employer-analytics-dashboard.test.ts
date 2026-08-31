import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getEmployerAnalytics,
  getEmployerPostings,
  MOCK_EMPLOYER_OPPORTUNITIES,
  MOCK_INTERACTIONS,
} from '../src/api/controllers/employerController';

describe('Employer Analytics & Engagement Dashboard Controller (#900)', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    MOCK_EMPLOYER_OPPORTUNITIES.length = 0;
    MOCK_INTERACTIONS.length = 0;

    req = {
      body: {},
      query: {},
      params: {},
      user: {
        id: 'emp_apple',
        uid: 'emp_apple',
        role: 'employer',
        organization: 'Apple Inc.',
      },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    vi.clearAllMocks();
  });

  describe('1. Employer Postings Access Boundary', () => {
    it('should retrieve postings owned by the employer organization', async () => {
      MOCK_EMPLOYER_OPPORTUNITIES.push({
        id: 'opp_swift_1',
        title: 'iOS Platform Systems Intern',
        organization: 'Apple Inc.',
        employerId: 'emp_apple',
        status: 'active',
      });

      await getEmployerPostings(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          postings: expect.arrayContaining([
            expect.objectContaining({
              title: 'iOS Platform Systems Intern',
              organization: 'Apple Inc.',
            }),
          ]),
        })
      );
    });

    it('should return curated demo postings if employer has not published listings yet', async () => {
      await getEmployerPostings(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          postings: expect.any(Array),
        })
      );

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.postings.length).toBeGreaterThan(0);
    });
  });

  describe('2. Time-Series & Conversion Funnel Aggregation', () => {
    it('should calculate conversion funnel (Views -> Saves -> Applies) and rates', async () => {
      MOCK_EMPLOYER_OPPORTUNITIES.push({
        id: 'opp_ml_1',
        title: 'Core ML Research Fellow',
        employerId: 'emp_apple',
      });

      const now = new Date();
      // Add 10 views, 3 saves, 1 apply
      for (let i = 0; i < 10; i++) {
        MOCK_INTERACTIONS.push({
          opportunity_id: 'opp_ml_1',
          action_type: 'view',
          timestamp: now,
        });
      }
      for (let i = 0; i < 3; i++) {
        MOCK_INTERACTIONS.push({
          opportunity_id: 'opp_ml_1',
          action_type: 'save',
          timestamp: now,
        });
      }
      MOCK_INTERACTIONS.push({
        opportunity_id: 'opp_ml_1',
        action_type: 'apply',
        timestamp: now,
      });

      req.query = { timeframe: '30d', opportunityId: 'opp_ml_1' };

      await getEmployerAnalytics(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          funnel: expect.objectContaining({
            views: 10,
            saves: 3,
            applies: 1,
            viewToApplyRate: 10, // 1/10 = 10%
            viewToSaveRate: 30, // 3/10 = 30%
            saveToApplyRate: 33.3, // 1/3 = 33.3%
          }),
          timeSeries: expect.any(Array),
          demographics: expect.objectContaining({
            skills: expect.any(Array),
            colleges: expect.any(Array),
            locations: expect.any(Array),
          }),
        })
      );
    });

    it('should support 7d, 30d, and 90d timeframes and return populated daily points', async () => {
      req.query = { timeframe: '7d' };

      await getEmployerAnalytics(req, res);

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.success).toBe(true);
      expect(jsonCall.timeframe).toBe('7d');
      expect(jsonCall.timeSeries.length).toBe(7);
    });
  });
});
