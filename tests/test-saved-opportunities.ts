import dotenv from 'dotenv';
dotenv.config();
import { spawn } from 'child_process';
import fetch from 'node-fetch';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const PORT = Math.floor(Math.random() * 10000) + 10000;

describe('test-saved-opportunities.ts', () => {
  it('should toggle bookmarks and retrieve saved opportunities', async () => {
    try {
      console.log('=====================================================');
      console.log('      Saved Opportunities Integration Test           ');
      console.log('=====================================================');

      console.log(`[Test] Starting server.ts on port ${PORT} in Mock mode...`);
      const serverProcess = spawn('npx', ['tsx', 'server.ts'], {
        shell: true,
        env: {
          ...process.env,
          PORT: PORT.toString(),
          MONGODB_URI: '', // Force MockDB mode
          MONGODB_COMMAND_URI: '',
          MONGODB_QUERY_URI: '',
          ENABLE_MOCK_AUTH: 'true',
          FIREBASE_PROJECT_ID: '', // Force Mock Auth Mode
          FIREBASE_SERVICE_ACCOUNT_BASE64: '', // Force Mock Auth Mode
          NODE_ENV: 'development'
        },
        stdio: 'pipe',
      });

      // Wait for server to start
      await new Promise<void>((resolve, reject) => {
        let started = false;
        let fullOutput = "";
        serverProcess.stdout?.on('data', (data) => {
          fullOutput += data.toString();
          if (fullOutput.includes('Server running on') && !started) {
            started = true;
            setTimeout(resolve, 1000);
          }
        });
        serverProcess.on('error', reject);
      });

      console.log(`[Test] Server is up! Executing Saved Opportunities validations...`);

      const payload = {
        user_id: "mock_user_123",
        email: "mock@example.com",
        name: "Mock User",
        picture: "https://avatar.url"
      };
      const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64");
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64");
      const syncToken = `${header}.${encodedPayload}.mocksignature`;

      console.log(`[Test] Syncing user profile to initialize mock user...`);
      const syncRes = await fetch(`http://127.0.0.1:${PORT}/api/v1/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${syncToken}`
        },
        body: JSON.stringify({
          name: "Mock User",
          college: "Test University",
          year: "3rd Year",
          field: "Computer Science",
          skills: ["React", "TypeScript"]
        })
      });
      if (!syncRes.ok) throw new Error(`Sync failed with status: ${syncRes.status}`);

      const mockToken = process.env.MOCK_VALID_TOKEN || "MOCK_VALID_TOKEN";
      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      };

      // 1. Fetch available opportunities
      const oppsRes = await fetch(`http://127.0.0.1:${PORT}/api/v1/opportunities`);
      if (!oppsRes.ok) throw new Error(`Failed to fetch opportunities: ${oppsRes.status}`);
      const oppsData = (await oppsRes.json()) as any;
      const opportunityId = oppsData.items[0]?.id || "mock_opp_id_999";
      console.log(`[Test] Target opportunity ID: ${opportunityId}`);

      // 2. Fetch initially saved opportunities (should be empty)
      const fetchInitialRes = await fetch(`http://127.0.0.1:${PORT}/api/v1/users/me/saved-opportunities`, {
        headers: authHeaders
      });
      const fetchInitialData = await fetchInitialRes.json() as any;
      console.log(`[Test] fetchInitialData:`, JSON.stringify(fetchInitialData));
      expect(fetchInitialData.items.length).toBe(0);
      expect(fetchInitialData.total).toBe(0);

      // 3. Toggle Bookmark (Add)
      const toggleRes1 = await fetch(`http://127.0.0.1:${PORT}/api/v1/opportunities/${opportunityId}/bookmark`, {
        method: 'POST',
        headers: authHeaders
      });
      const toggleData1 = await toggleRes1.json() as any;
      expect(toggleData1.saved).toBe(true);

      // 4. Fetch saved opportunities (should have 1)
      const fetchAfterAddRes = await fetch(`http://127.0.0.1:${PORT}/api/v1/users/me/saved-opportunities`, {
        headers: authHeaders
      });
      const fetchAfterAddData = await fetchAfterAddRes.json() as any;
      expect(fetchAfterAddData.items.length).toBe(1);
      expect(fetchAfterAddData.total).toBe(1);
      expect(fetchAfterAddData.items[0].id).toBe(opportunityId);

      // 5. Toggle Bookmark (Remove)
      const toggleRes2 = await fetch(`http://127.0.0.1:${PORT}/api/v1/opportunities/${opportunityId}/bookmark`, {
        method: 'POST',
        headers: authHeaders
      });
      const toggleData2 = await toggleRes2.json() as any;
      expect(toggleData2.saved).toBe(false);

      // 6. Fetch saved opportunities (should be empty again)
      const fetchAfterRemoveRes = await fetch(`http://127.0.0.1:${PORT}/api/v1/users/me/saved-opportunities`, {
        headers: authHeaders
      });
      const fetchAfterRemoveData = await fetchAfterRemoveRes.json() as any;
      expect(fetchAfterRemoveData.items.length).toBe(0);
      expect(fetchAfterRemoveData.total).toBe(0);

      console.log(`[Test] All Saved Opportunities validations passed.`);
      
      serverProcess.kill('SIGKILL');
      
    } catch (error: any) {
      console.error(error);
      throw error;
    }
  }, 30000); // 30s timeout
});
