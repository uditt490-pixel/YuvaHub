import { describe, it, expect } from 'vitest';
import { request } from '../setup.js';

describe('Health Check API', () => {
  it('should return 200 OK for /health', async () => {
    const response = await request.get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
  });
});
