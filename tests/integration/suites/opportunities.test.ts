import { describe, it, expect, beforeEach } from 'vitest';
import { request, db } from '../setup.js';
import { getAuthHeaders, mockUsers } from '../helpers/authHelper.js';
import { assertDbContains } from '../helpers/assertDb.js';

describe('Opportunities API', () => {
  beforeEach(async () => {
    await db.collection('opportunities').deleteMany({});
    await db.collection('opportunities').insertOne({
      id: 'opp_1',
      title: 'Test Opportunity',
      type: 'Job',
      tags: ['Test'],
    });
  });

  it('should fetch opportunities', async () => {
    const response = await request.get('/api/opportunities');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  it('should require authentication to create opportunity', async () => {
    const response = await request.post('/api/opportunities').send({
      title: 'New Opp',
    });
    expect(response.status).toBe(401);
  });

  it('should create opportunity when authenticated', async () => {
    const headers = getAuthHeaders(mockUsers.admin);
    const response = await request.post('/api/opportunities')
      .set(headers)
      .send({
        title: 'New Admin Opp',
        type: 'Internship'
      });
    
    // Depending on the implementation, the status could be 200 or 201
    expect([200, 201]).toContain(response.status);
    
    await assertDbContains(db, 'opportunities', { title: 'New Admin Opp' });
  });
});
