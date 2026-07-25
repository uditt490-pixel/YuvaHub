import { describe, it, expect, beforeAll } from 'vitest';
import { authSync, refreshTokens, logout } from '../src/api/controllers/authController.js';
import { initializeDatabase, dbCommand } from '../src/api/db.js';
import jwt from 'jsonwebtoken';

// Mock express Req/Res
const mockReq = (body = {}, headers = {}) => ({
  body,
  headers,
});

const mockRes = () => {
  const res: any = {};
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.data = data;
    return res;
  };
  return res;
};

// authSync expects a 3-part JWT for the mock token.
const mockFirebaseToken = jwt.sign({ user_id: 'mock_user_123', email: 'test@example.com' }, 'dummy_secret');

describe('Auth Controller - Refresh Token Rotation', () => {
  beforeAll(async () => {
    // We intentionally don't set MONGODB_URI so it falls back to MockDB
    process.env.MONGODB_URI = "";
    process.env.ENABLE_MOCK_AUTH = "true";
    process.env.NODE_ENV = "development"; // Ensure useMockAuth = true
    process.env.JWT_SECRET = "test_secret";
    process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
    
    await initializeDatabase();
  });

  let validRefreshToken: string;
  let validAccessToken: string;
  let initialRefreshToken: string;

  it('1. authSync should generate custom JWT and refresh token', async () => {
    const req = mockReq(
      { name: "Test User", email: "test@example.com" }, 
      { authorization: `Bearer ${mockFirebaseToken}` }
    );
    const res = mockRes();

    await authSync(req as any, res as any);

    expect(res.data.status).toBe("success");
    expect(res.data.accessToken).toBeDefined();
    expect(res.data.refreshToken).toBeDefined();
    
    validAccessToken = res.data.accessToken;
    validRefreshToken = res.data.refreshToken;
    initialRefreshToken = res.data.refreshToken;

    // Verify token was signed with our secret
    const decoded = jwt.verify(validAccessToken, "test_secret");
    expect((decoded as any).uid).toBe("mock_user_123");
  });

  it('2. refreshTokens should issue new tokens when given a valid refresh token', async () => {
    // Wait 1 second so the newly generated JWT has a different 'iat' timestamp.
    // Otherwise, fast tests generate identical tokens and the DB $pull/$push cancels out!
    await new Promise(r => setTimeout(r, 1000));

    const req = mockReq({ refreshToken: validRefreshToken });
    const res = mockRes();

    await refreshTokens(req as any, res as any);

    expect(res.data.status).toBe("success");
    expect(res.data.accessToken).toBeDefined();
    expect(res.data.refreshToken).toBeDefined();
    
    // The new token shouldn't match the old one 
    expect(res.data.accessToken).not.toBe(validAccessToken);
    expect(res.data.refreshToken).not.toBe(validRefreshToken);

    // Save the newly issued refresh token for the next test
    validRefreshToken = res.data.refreshToken;
  });

  it('3. refreshTokens should revoke all sessions on token reuse', async () => {
    // We try to use the initial token from step 1, which was rotated in step 2.
    // It is mathematically valid but no longer exists in the user's active session array.
    
    const req = mockReq({ refreshToken: initialRefreshToken });
    const res = mockRes();

    await refreshTokens(req as any, res as any);

    expect(res.statusCode).toBe(401);
    expect(res.data.error).toBe("Session revoked due to token reuse");
  });

  it('4. logout should remove the refresh token from the database', async () => {
    // Let's do a fresh login to get a new active token
    const loginReq = mockReq(
      { name: "Test User", email: "test@example.com" }, 
      { authorization: `Bearer ${mockFirebaseToken}` }
    );
    const loginRes = mockRes();
    await authSync(loginReq as any, loginRes as any);
    
    const activeRefreshToken = loginRes.data.refreshToken;

    // Call logout
    const logoutReq = mockReq({ refreshToken: activeRefreshToken });
    const logoutRes = mockRes();
    
    await logout(logoutReq as any, logoutRes as any);
    expect(logoutRes.data.status).toBe("success");

    // Attempting to refresh with the logged-out token should trigger reuse/revocation
    const refreshReq = mockReq({ refreshToken: activeRefreshToken });
    const refreshRes = mockRes();
    
    await refreshTokens(refreshReq as any, refreshRes as any);
    expect(refreshRes.statusCode).toBe(401);
  });
});
