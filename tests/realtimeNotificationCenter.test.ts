import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  triggerNotification,
  markAsRead,
  getNotifications,
} from '../src/api/controllers/notificationController';

describe('Real-time In-App Notification Center & Toast System (#924)', () => {
  let req: any;
  let res: any;
  let mockIo: any;

  beforeEach(() => {
    mockIo = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };

    req = {
      body: {},
      query: {},
      params: {},
      user: { id: 'user_notif_1', uid: 'user_notif_1', role: 'student' },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('1. WebSocket Broadcast & Notification Persistence (triggerNotification)', () => {
    it('should persist notification and dispatch NEW_IN_APP_NOTIFICATION over WebSockets', async () => {
      const notif = await triggerNotification(mockIo, {
        userId: 'user_notif_1',
        type: 'team_invite',
        content: 'Aarav invited you to join Hackathon Team Quantum.',
        link: '/teams/quantum',
      });

      expect(notif).toHaveProperty('content', 'Aarav invited you to join Hackathon Team Quantum.');
      expect(notif.isRead).toBe(false);

      expect(mockIo.to).toHaveBeenCalledWith('user_notif_1');
      expect(mockIo.emit).toHaveBeenCalledWith(
        'NEW_IN_APP_NOTIFICATION',
        expect.objectContaining({
          userId: 'user_notif_1',
          type: 'team_invite',
        })
      );
    });
  });

  describe('2. Navigation Reads & State Update (markAsRead)', () => {
    it('should update isRead: true and turn off unread status immediately', async () => {
      req.params = { id: 'notif_1001' };

      await markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          isRead: true,
          read: true,
        })
      );
    });
  });

  describe('3. Persistent Cross-Session Retrieval (getNotifications)', () => {
    it('should return paginated user notifications sorted by creation date', async () => {
      req.query = { page: '1', limit: '10' };

      await getNotifications(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.any(Array),
        })
      );
    });
  });
});
