import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { shutdownGuard } from '../src/api/middlewares/security/shutdownGuard.js';

describe('Shutdown Guard Middleware', () => {
  let app: express.Express;
  const originalAdminSecret = process.env.ADMIN_SECRET;

  beforeAll(() => {
    app = express();
    app.post('/api/analytics/shutdown', shutdownGuard, (req, res) => {
      res.status(200).json({ status: 'Shutting down' });
    });
  });

  afterAll(() => {
    process.env.ADMIN_SECRET = originalAdminSecret;
  });

  it('should reject if ADMIN_SECRET is not set in environment', async () => {
    delete process.env.ADMIN_SECRET;
    
    const res = await request(app)
      .post('/api/analytics/shutdown')
      .set('Authorization', 'Bearer some-token');
      
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Shutdown endpoint disabled');
  });

  it('should reject unauthenticated requests', async () => {
    process.env.ADMIN_SECRET = 'super-secret-admin-key';
    
    const res = await request(app).post('/api/analytics/shutdown');
      
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('should reject if token does not match ADMIN_SECRET', async () => {
    process.env.ADMIN_SECRET = 'super-secret-admin-key';
    
    const res = await request(app)
      .post('/api/analytics/shutdown')
      .set('Authorization', 'Bearer wrong-token');
      
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('should allow if valid Bearer token matches ADMIN_SECRET', async () => {
    process.env.ADMIN_SECRET = 'super-secret-admin-key';
    
    const res = await request(app)
      .post('/api/analytics/shutdown')
      .set('Authorization', 'Bearer super-secret-admin-key');
      
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Shutting down');
  });
});
