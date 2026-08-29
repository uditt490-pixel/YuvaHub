import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SchedulingService } from '../src/services/schedulingService';
import {
  getAvailability,
  bookInterviewHandler,
  saveCalendarTokenHandler,
} from '../src/api/controllers/schedulingController';

describe('Smart Interview Scheduling & Calendar Integration (#918)', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      user: { id: 'emp_123', uid: 'emp_123', role: 'employer' },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('1. Availability Engine (calculateFreeSlots & getStudentAvailability)', () => {
    it('should calculate un-allocated 30-min free slots within working hours (09:00 - 18:00)', () => {
      const busy = [
        {
          start: '2026-09-01T10:00:00Z',
          end: '2026-09-01T11:00:00Z',
        },
      ];

      const freeSlots = SchedulingService.calculateFreeSlots(
        busy,
        '2026-09-01T09:00:00Z',
        '2026-09-01T12:00:00Z'
      );

      expect(freeSlots).toHaveLength(4); // 09:00-09:30, 09:30-10:00, 11:00-11:30, 11:30-12:00
      expect(freeSlots[0].start).toContain('09:00:00');
    });

    it('should throw error when student has not linked a calendar', async () => {
      await expect(
        SchedulingService.getStudentAvailability('unlinked_student_id')
      ).rejects.toThrow('Student has not linked a calendar.');
    });

    it('should return 404 with error message when candidate calendar is unlinked', async () => {
      req.params = { studentId: 'unlinked_student_id' };

      await getAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Student has not linked a calendar.',
      });
    });
  });

  describe('2. Automated Invites & Video Provisioning Engine (bookInterview)', () => {
    it('should book interview and auto-generate Google Meet video conferencing link', async () => {
      const slotStart = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const slotEnd = new Date(Date.now() + 24 * 3600 * 1000 + 1800 * 1000).toISOString();

      const booking = await SchedulingService.bookInterview(
        'emp_123',
        'student_456',
        slotStart,
        slotEnd
      );

      expect(booking).toHaveProperty('hangoutLink');
      expect(booking.hangoutLink).toContain('https://meet.google.com/yuvahub-meet-');
      expect(booking.summary).toBe('YuvaHub Interview Session');
    });

    it('should handle bookInterview HTTP request and return 201 with hangoutLink', async () => {
      const slotStart = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const slotEnd = new Date(Date.now() + 24 * 3600 * 1000 + 1800 * 1000).toISOString();

      req.body = {
        studentId: 'student_456',
        slotStart,
        slotEnd,
      };

      await bookInterviewHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          hangoutLink: expect.stringContaining('https://meet.google.com/yuvahub-meet-'),
          summary: 'YuvaHub Interview Session',
        })
      );
    });

    it('should return 400 when required booking fields are missing', async () => {
      req.body = { studentId: 'student_456' }; // missing slotStart & slotEnd

      await bookInterviewHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Missing required fields'),
        })
      );
    });
  });

  describe('3. Calendar Token Persistence (saveCalendarToken)', () => {
    it('should connect Google/Outlook OAuth token successfully', async () => {
      req.body = {
        provider: 'google',
        accessToken: 'mock_access_token_123',
        refreshToken: 'mock_refresh_token_123',
        expiryDate: new Date().toISOString(),
      };

      await saveCalendarTokenHandler(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Calendar OAuth token connected successfully.',
          provider: 'google',
        })
      );
    });
  });
});
