import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  searchCandidates,
  initiateEmployerConnection,
} from '../src/api/controllers/employerController';
import { emailService } from '../src/services/emailService';

vi.mock('../src/services/emailService.js', () => ({
  emailService: {
    sendTransactionalNotification: vi.fn().mockResolvedValue({ id: 'mock_email_job' }),
    sendMaskedIntroductionEmail: vi.fn().mockResolvedValue({ id: 'mock_email_job' }),
  },
}));

describe('B2B Employer Portal for Direct Hiring & Candidate Search (#927)', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {},
      user: { id: 'emp_999', uid: 'emp_999', role: 'employer' },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    vi.clearAllMocks();
  });

  describe('1. Candidate Search Backend (< 200ms Latency)', () => {
    it('should search candidates by skills, location, and graduation year within latency SLA', async () => {
      req.query = {
        skills: 'React',
        location: 'Bangalore',
        graduation_year: '2025',
        minAtsScore: '80',
      };

      await searchCandidates(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          candidates: expect.arrayContaining([
            expect.objectContaining({
              name: 'Aarav Sharma',
              graduation_year: 2025,
            }),
          ]),
          responseTimeMs: expect.any(Number),
        })
      );

      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.responseTimeMs).toBeLessThan(200);
    });
  });

  describe('2. Direct Connection Invitation Router', () => {
    it('should successfully initiate connection request for verified employers and trigger email notification', async () => {
      req.body = {
        studentId: 'cand_1',
        invitationMessage: 'We would love to invite you for an interview at TechCorp.',
      };

      await initiateEmployerConnection(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: 'Connection invitation transmitted successfully.',
          connectionId: expect.any(String),
        })
      );

      expect(emailService.sendTransactionalNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.any(String),
          subject: expect.stringContaining('Employer Connection Request'),
          body: expect.stringContaining('TechCorp'),
        })
      );
    });

    it('should enforce role boundary and return 403 for non-employer users', async () => {
      req.user = { id: 'student_1', uid: 'student_1', role: 'student' };
      req.body = {
        studentId: 'cand_1',
        invitationMessage: 'Hello candidate!',
      };

      await initiateEmployerConnection(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied. Operation restricted to verified employers.',
      });
    });

    it('should return 404 when candidate profile is not found', async () => {
      req.body = {
        studentId: 'non_existent_candidate_id_9999',
        invitationMessage: 'Hello!',
      };

      await initiateEmployerConnection(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Candidate profile not found.',
      });
    });

    it('should return 400 when required fields are missing', async () => {
      req.body = { studentId: 'cand_1' }; // missing invitationMessage

      await initiateEmployerConnection(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('Missing required fields'),
        })
      );
    });
  });
});
