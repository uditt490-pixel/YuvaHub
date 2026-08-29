import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createMentorshipIntroduction,
  getAlumniDirectory,
  updateAlumniProfileStatus,
} from '../src/api/controllers/alumniMentorshipController';

vi.mock('../src/services/emailService.js', () => ({
  emailService: {
    sendMaskedIntroductionEmail: vi.fn().mockResolvedValue({ id: 'mock_email_job' }),
  },
}));

describe('Alumni Network Directory & Mentorship Matching (#929)', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      user: { id: 'student_123', uid: 'student_123' },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('1. Profile Extension & Status Update', () => {
    it('should allow user to transition profile from student to alumni with mentoring opt-in', async () => {
      req.body = {
        alumni_status: 'alumni',
        graduation_year: 2024,
        current_company: 'Google',
        is_open_to_mentoring: true,
      };

      await updateAlumniProfileStatus(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Alumni profile status updated successfully.',
          profile: expect.objectContaining({
            alumni_status: 'alumni',
            graduation_year: 2024,
            current_company: 'Google',
            is_open_to_mentoring: true,
          }),
        })
      );
    });

    it('should reject invalid alumni status values', async () => {
      req.body = { alumni_status: 'invalid_status' };
      await expect(updateAlumniProfileStatus(req, res)).rejects.toThrow();
    });
  });

  describe('2. Searchable Alumni Directory', () => {
    it('should filter alumni by university, company, role, and mentorship opt-in status', async () => {
      req.query = {
        college: 'BITS Pilani',
        company: 'Microsoft',
        role: 'Tech Lead',
        isOpenToMentoring: 'true',
      };

      await getAlumniDirectory(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          count: 1,
          alumni: expect.arrayContaining([
            expect.objectContaining({
              name: 'Kavya Nair',
              college: 'BITS Pilani',
              current_company: 'Microsoft',
              is_open_to_mentoring: true,
            }),
          ]),
        })
      );
    });
  });

  describe('3. Masked Mentorship Introduction System', () => {
    it('should successfully create mentorship introduction for opted-in alumni', async () => {
      req.body = {
        alumniId: 'alm_1',
        requestType: 'resume_review',
        messageBody: 'Hello, please review my resume for SWE positions.',
      };

      await createMentorshipIntroduction(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: 'Mentorship request securely forwarded to the alumnus.',
        })
      );
    });

    it('should reject mentorship request if alumni is not accepting mentorship requests', async () => {
      req.body = {
        alumniId: 'alm_3', // Rohan Sharma is_open_to_mentoring: false
        requestType: 'quick_chat',
        messageBody: 'Can we chat?',
      };

      await createMentorshipIntroduction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Alumni user is not accepting mentorship requests.',
      });
    });

    it('should return 400 when required fields are missing', async () => {
      req.body = { alumniId: 'alm_1' }; // missing requestType & messageBody

      await createMentorshipIntroduction(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Missing required fields'),
        })
      );
    });
  });
});
