import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/api/db.js', () => {
  return {
    dbCommand: null,
    dbQuery: null,
  };
});

import { ApplicationDocumentSchema, ApplicationStatusSchema } from '../src/models/applicationSchema.js';
import {
  createApplication,
  updateApplicationStatus,
  deleteApplication,
  getUserApplications,
  MEMORY_APPLICATIONS
} from '../src/api/controllers/applicationController.js';

describe('Opportunity Application Tracker Schema Validation', () => {
  it('should validate valid tracker application document with custom notes and statuses', () => {
    const doc = {
      userId: 'user_12345',
      opportunityId: 'opp_7788',
      opportunity: {
        title: 'Backend Engineer Intern',
        organization: 'Tech Corp',
        applyUrl: 'https://example.com/apply',
        type: 'Internship',
        location: 'Remote'
      },
      status: 'saved',
      notes: 'Reviewed JD, need to polish Redis and Docker on resume.',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const parsed = ApplicationDocumentSchema.safeParse(doc);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe('saved');
      expect(parsed.data.notes).toContain('Redis');
    }
  });

  it('should allow all Kanban statuses in ApplicationStatusSchema', () => {
    const validStatuses = ['saved', 'applied', 'submitted', 'interview', 'interviewing', 'offer', 'selected', 'rejected'];
    validStatuses.forEach(st => {
      expect(ApplicationStatusSchema.safeParse(st).success).toBe(true);
    });
  });

  it('should reject application without title or userId', () => {
    const invalidDoc = {
      userId: '',
      opportunityId: 'opp_123',
      opportunity: { title: '' },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const parsed = ApplicationDocumentSchema.safeParse(invalidDoc);
    expect(parsed.success).toBe(false);
  });
});

describe('Opportunity Application Tracker Controller API', () => {
  let mockRes: any;

  beforeEach(() => {
    MEMORY_APPLICATIONS.length = 0;
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
  });

  it('should create and save an application to tracker with notes', async () => {
    const req = {
      user: { uid: 'user_tester_01' },
      body: {
        opportunityId: 'opp_google_swe',
        opportunity: {
          title: 'Software Engineering Summer Intern',
          organization: 'Google',
          applyUrl: 'https://careers.google.com/jobs/123',
          location: 'Bangalore / Remote'
        },
        status: 'saved',
        notes: 'Submitted referral request via alumni'
      }
    } as any;

    await createApplication(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.application).toBeDefined();
    expect(body.application.status).toBe('saved');
    expect(body.application.notes).toBe('Submitted referral request via alumni');
    expect(MEMORY_APPLICATIONS.length).toBe(1);
  });

  it('should retrieve user applications with status filter', async () => {
    MEMORY_APPLICATIONS.push(
      {
        _id: 'app_1',
        userId: 'user_tester_01',
        opportunityId: 'opp_1',
        opportunity: { title: 'Frontend Developer', organization: 'Meta' },
        status: 'saved',
        notes: 'Need to review React hooks',
        platform: 'YuvaHub',
        retryCount: 0,
        userConfirmed: false,
        auditLogs: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: 'app_2',
        userId: 'user_tester_01',
        opportunityId: 'opp_2',
        opportunity: { title: 'AI Research Assistant', organization: 'OpenAI' },
        status: 'interviewing',
        notes: 'Round 1 technical scheduled for Friday',
        platform: 'YuvaHub',
        retryCount: 0,
        userConfirmed: false,
        auditLogs: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    const req = {
      user: { uid: 'user_tester_01' },
      query: { status: 'interviewing' }
    } as any;

    await getUserApplications(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.applications.length).toBe(1);
    expect(body.applications[0].opportunity.title).toBe('AI Research Assistant');
  });

  it('should update application status and private notes (drag-and-drop / modal save)', async () => {
    MEMORY_APPLICATIONS.push({
      _id: 'app_edit_test',
      userId: 'user_tester_01',
      opportunityId: 'opp_123',
      opportunity: { title: 'DevOps Engineer', organization: 'Netflix' },
      status: 'submitted',
      notes: '',
      platform: 'YuvaHub',
      retryCount: 0,
      userConfirmed: false,
      auditLogs: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const req = {
      user: { uid: 'user_tester_01' },
      params: { id: 'app_edit_test' },
      body: {
        status: 'interviewing',
        notes: 'Passed screening, behavioral round next.'
      }
    } as any;

    await updateApplicationStatus(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(MEMORY_APPLICATIONS[0].status).toBe('interviewing');
    expect(MEMORY_APPLICATIONS[0].notes).toBe('Passed screening, behavioral round next.');
  });

  it('should delete an application from the tracker', async () => {
    MEMORY_APPLICATIONS.push({
      _id: 'app_delete_me',
      userId: 'user_tester_01',
      opportunityId: 'opp_delete',
      opportunity: { title: 'Intern' },
      status: 'saved',
      platform: 'YuvaHub',
      retryCount: 0,
      userConfirmed: false,
      auditLogs: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const req = {
      user: { uid: 'user_tester_01' },
      params: { id: 'app_delete_me' }
    } as any;

    await deleteApplication(req, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(MEMORY_APPLICATIONS.length).toBe(0);
  });
});
