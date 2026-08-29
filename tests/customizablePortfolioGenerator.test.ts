import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PortfolioService } from '../src/services/portfolioService';
import {
  getPortfolioHandler,
  updatePortfolioSettingsHandler,
} from '../src/api/controllers/portfolioController';

describe('Customizable Portfolio Website Generator (#917)', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      user: { id: 'user_dev_1', uid: 'user_dev_1', username: 'aarav_sharma' },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('1. Unified Profile Aggregation Service (getPortfolioPayload)', () => {
    it('should aggregate user profile data, badges, and portfolio settings into a unified JSON structure', async () => {
      const payload = await PortfolioService.getPortfolioPayload('aarav_sharma');

      expect(payload).toHaveProperty('meta');
      expect(payload.meta).toHaveProperty('username', 'aarav_sharma');
      expect(payload).toHaveProperty('settings');
      expect(payload.settings).toHaveProperty('template');
      expect(payload).toHaveProperty('projects');
      expect(payload).toHaveProperty('badges');
    });

    it('should throw status 404 error when portfolio username is not found', async () => {
      await expect(
        PortfolioService.getPortfolioPayload('nonexistent_user')
      ).rejects.toThrow('Portfolio not found');
    });

    it('should return 404 HTTP status code when portfolio is not found', async () => {
      req.params = { username: 'nonexistent_user' };

      await getPortfolioHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Portfolio not found' });
    });
  });

  describe('2. Portfolio Customization & Settings Update', () => {
    it('should update user portfolio settings (template, primaryColor, visibleSections)', async () => {
      const updated = await PortfolioService.updatePortfolioSettings('user_dev_1', {
        template: 'terminal',
        primaryColor: '#10B981',
        visibleSections: { bio: true, projects: true, badges: false, experience: true },
      });

      expect(updated.template).toBe('terminal');
      expect(updated.primaryColor).toBe('#10B981');
      expect(updated.visibleSections.badges).toBe(false);
    });

    it('should handle HTTP PUT updatePortfolioSettingsHandler request successfully', async () => {
      req.body = {
        template: 'creative',
        primaryColor: '#8B5CF6',
        visibleSections: { bio: true, projects: true, badges: true, experience: true },
      };

      await updatePortfolioSettingsHandler(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Portfolio settings updated'),
          settings: expect.objectContaining({
            template: 'creative',
            primaryColor: '#8B5CF6',
          }),
        })
      );
    });
  });
});
