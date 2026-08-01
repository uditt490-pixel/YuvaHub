import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleExportResumeToPDF } from '../src/api/controllers/resumeController.js';
import * as dbModule from '../src/api/db.js';

vi.mock('../src/api/db.js', () => ({
  dbQuery: {
    collection: vi.fn(),
  },
  dbCommand: {
    collection: vi.fn(),
  }
}));

describe('Resume PDF Export', () => {
  let mockReq: any;
  let mockRes: any;
  let mockUsersCol: any;

  beforeEach(() => {
    mockReq = {
      user: { uid: 'test-user-123' },
      params: { id: 'dummy-resume-id' }
    };
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setHeader: vi.fn(),
      send: vi.fn()
    };

    mockUsersCol = {
      findOne: vi.fn()
    };

    (dbModule.dbQuery as any).collection.mockReturnValue(mockUsersCol);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = null;
    await handleExportResumeToPDF(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('should return 404 if user profile is not found', async () => {
    mockUsersCol.findOne.mockResolvedValue(null);
    await handleExportResumeToPDF(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'User profile not found' });
  });

  it('should generate PDF and return as buffer stream', async () => {
    mockUsersCol.findOne.mockResolvedValue({
      uid: 'test-user-123',
      name: 'John Doe',
      email: 'john@example.com',
      education: [
        { degree: 'B.S. Computer Science', institution: 'State University', dates: '2016-2020', gpa: '3.8' }
      ],
      workExperience: [
        { role: 'Software Engineer', company: 'Tech Corp', dates: '2020-Present', impact: 'Built cool stuff' }
      ],
      skills: ['TypeScript', 'React', 'Node.js']
    });

    await handleExportResumeToPDF(mockReq, mockRes);

    expect(mockUsersCol.findOne).toHaveBeenCalledWith({ uid: 'test-user-123' });
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="john_doe_resume.pdf"');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalled();
    
    const sendArg = mockRes.send.mock.calls[0][0];
    expect(Buffer.isBuffer(sendArg)).toBe(true);
  });

  it('should handle missing fields gracefully without crashing', async () => {
    mockUsersCol.findOne.mockResolvedValue({
      uid: 'test-user-123',
      name: 'Jane Smith'
      // Missing education, experience, skills, email
    });

    await handleExportResumeToPDF(mockReq, mockRes);

    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="jane_smith_resume.pdf"');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalled();
  });
});
