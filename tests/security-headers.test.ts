import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { securityPipeline } from '../src/api/middlewares/security/index.js';

describe('Security Headers Middleware', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(securityPipeline());
    app.get('/test', (req, res) => res.status(200).json({ ok: true }));
    app.post('/test-post', (req, res) => res.status(200).json({ ok: true }));
  });

  it('should set Helmet headers (CSP, HSTS, etc.)', async () => {
    const res = await request(app).get('/test');
    
    // Check for CSP
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    
    // Check for HSTS
    expect(res.headers['strict-transport-security']).toBeDefined();
    
    // Check for other standard Helmet headers
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should strip X-Powered-By header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('should set X-Request-Id header', async () => {
    const res = await request(app).get('/test');
    expect(res.headers['x-request-id']).toBeDefined();
    expect(typeof res.headers['x-request-id']).toBe('string');
    expect(res.headers['x-request-id'].length).toBeGreaterThan(0);
  });

  it('should set CSRF cookie and reject POST without CSRF header', async () => {
    const getRes = await request(app).get('/test');
    const cookies = getRes.headers['set-cookie'];
    expect(cookies).toBeDefined();
    
    let csrfCookie = '';
    if (Array.isArray(cookies)) {
      csrfCookie = cookies.find(c => c.startsWith('_csrf=')) || '';
    } else {
      csrfCookie = (cookies as string).startsWith('_csrf=') ? cookies as string : '';
    }
    
    expect(csrfCookie).toBeTruthy();

    // Now try to POST without the header
    const postRes = await request(app).post('/test-post').set('Cookie', csrfCookie);
    expect(postRes.status).toBe(403);
    expect(postRes.body.error).toBe('CSRF token validation failed');
  });
});
