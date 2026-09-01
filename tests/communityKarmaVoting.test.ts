import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  toggleVote,
  calculateHotScore,
} from '../src/api/controllers/voteController';
import { getPosts } from '../src/api/controllers/communityController';

describe('Community Content Upvoting & Reddit-style Karma (#925)', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      user: { id: 'user_voter_1', uid: 'user_voter_1', role: 'student' },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('1. HackerNews Time-Decay Formula (Score / (Age + 2)^1.8)', () => {
    it('should compute higher hot scores for recent posts with high upvotes', () => {
      const recentHot = calculateHotScore(20, 2, new Date(Date.now() - 1 * 60 * 60 * 1000)); // 1 hour ago
      const olderHot = calculateHotScore(20, 2, new Date(Date.now() - 48 * 60 * 60 * 1000)); // 48 hours ago

      expect(recentHot).toBeGreaterThan(olderHot);
    });
  });

  describe('2. Atomic Vote Controller (upvotes/downvotes array manipulation)', () => {
    it('should cleanly add user to upvotes and recalculate hotScore', async () => {
      req.body = {
        targetId: 'post_test_a',
        targetType: 'thread',
        voteType: 'upvote',
      };

      await toggleVote(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          upvotesCount: expect.any(Number),
          downvotesCount: expect.any(Number),
          hotScore: expect.any(Number),
          userVote: 'upvote',
        })
      );
    });

    it('should reverse upvote when upvote is clicked again by the same user', async () => {
      req.body = {
        targetId: 'post_test_b',
        targetType: 'thread',
        voteType: 'upvote',
      };

      // First click -> upvote
      await toggleVote(req, res);
      const firstCall = res.json.mock.calls[0][0];
      expect(firstCall.userVote).toBe('upvote');

      // Second click -> reverse upvote
      res.json.mockClear();
      await toggleVote(req, res);
      const secondCall = res.json.mock.calls[0][0];
      expect(secondCall.userVote).toBeNull();
    });

    it('should cleanly switch downvote to upvote without double-voting', async () => {
      // 1. Downvote
      req.body = {
        targetId: 'post_test_c',
        targetType: 'thread',
        voteType: 'downvote',
      };
      await toggleVote(req, res);
      expect(res.json.mock.calls[0][0].userVote).toBe('downvote');

      // 2. Switch to Upvote
      res.json.mockClear();
      req.body = {
        targetId: 'post_test_c',
        targetType: 'thread',
        voteType: 'upvote',
      };
      await toggleVote(req, res);
      expect(res.json.mock.calls[0][0].userVote).toBe('upvote');
    });

    it('should return 400 when required fields are missing', async () => {
      req.body = { targetId: 'post_test_d' }; // missing voteType

      await toggleVote(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Missing required fields'),
        })
      );
    });
  });

  describe('3. Default Forum View Sorting by Hot Score', () => {
    it('should default forum post queries to sort by hot score descending', async () => {
      req.query = {}; // default view

      await getPosts(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.any(Array),
        })
      );

      const items = res.json.mock.calls[0][0].items;
      if (items.length >= 2) {
        expect(items[0].hotScore).toBeGreaterThanOrEqual(items[1].hotScore);
      }
    });
  });
});
