import { describe, it, expect, vi, beforeEach } from 'vitest';
import { markBulkRead } from '../src/api/controllers/notificationController.js';

// Mock the db dependencies
let mockNotifications: any[] = [];

vi.mock('../src/api/db.js', () => {
  return {
    dbCommand: {
      isMock: true,
      collection: (name: string) => {
        if (name === "notifications") {
          return {
            data: mockNotifications,
            updateMany: vi.fn() // Just in case it calls it, but we set isMock: true
          };
        }
      }
    }
  };
});

// Since safeObjectId is used, we might need to mock it if it breaks, but it's safe to let it run
vi.mock('../src/lib/utils.js', () => {
  return {
    safeObjectId: (id: string) => id // Mock safeObjectId to just return the string for testing
  };
});

describe('Bulk Notifications API - markBulkRead', () => {
  
  beforeEach(() => {
    // Reset mock data before each test
    mockNotifications = [
      { id: "notif1", userId: "testUser1", read: false, type: "test" },
      { id: "notif2", userId: "testUser1", read: false, type: "test" },
      { id: "notif3", userId: "testUser1", read: true, type: "test" },
      { id: "notif4", userId: "otherUser", read: false, type: "test" }
    ];
  });

  it('should mark specific notifications as read using notificationIds array', async () => {
    let responseData: any;
    let statusCode = 200;

    const req = {
      user: { uid: 'testUser1' },
      body: { notificationIds: ['notif1'] }
    } as any;

    const res = {
      status: vi.fn().mockImplementation((code: number) => { statusCode = code; return res; }),
      json: vi.fn().mockImplementation((data: any) => { responseData = data; return res; })
    } as any;

    await markBulkRead(req, res);

    expect(statusCode).toBe(200);
    expect(responseData).toBeDefined();
    expect(responseData.updatedCount).toBe(1);
    
    // Verify it updated in the array
    const n1 = mockNotifications.find(n => n.id === 'notif1');
    expect(n1.read).toBe(true);
    expect(n1.isRead).toBe(true);
    
    // Ensure others were not affected
    const n2 = mockNotifications.find(n => n.id === 'notif2');
    expect(n2.read).toBe(false);
  });

  it('should mark all unread notifications as read when all=true', async () => {
    let responseData: any;
    let statusCode = 200;

    const req = {
      user: { uid: 'testUser1' },
      body: { all: true }
    } as any;

    const res = {
      status: vi.fn().mockImplementation((code: number) => { statusCode = code; return res; }),
      json: vi.fn().mockImplementation((data: any) => { responseData = data; return res; })
    } as any;

    await markBulkRead(req, res);

    expect(statusCode).toBe(200);
    expect(responseData).toBeDefined();
    expect(responseData.updatedCount).toBe(2); // notif1 and notif2 were unread
    
    // Verify it updated in the array
    const n1 = mockNotifications.find(n => n.id === 'notif1');
    const n2 = mockNotifications.find(n => n.id === 'notif2');
    expect(n1.read).toBe(true);
    expect(n2.read).toBe(true);
    
    // Ensure other user's notification wasn't affected
    const n4 = mockNotifications.find(n => n.id === 'notif4');
    expect(n4.read).toBe(false);
  });

  it('should return 400 Bad Request if neither notificationIds nor all is provided', async () => {
    let responseData: any;
    let statusCode = 200;

    const req = {
      user: { uid: 'testUser1' },
      body: {}
    } as any;

    const res = {
      status: vi.fn().mockImplementation((code: number) => { statusCode = code; return res; }),
      json: vi.fn().mockImplementation((data: any) => { responseData = data; return res; })
    } as any;

    await markBulkRead(req, res);

    expect(statusCode).toBe(400);
    expect(responseData.error).toMatch(/Invalid payload/);
  });
});
