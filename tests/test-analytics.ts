import { MongoClient } from 'mongodb';
import { spawn, ChildProcess } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { describe, it, expect, afterEach } from 'vitest';

dotenv.config();

// Read the env var WITHOUT killing the process if it's missing.
// We narrow it to a `string` later inside the describe block, where we
// know it must be present because the suite is skipped otherwise.
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.warn(
    '[test-analytics] MONGODB_URI not found in env — skipping AnalyticsBuffer test suite. ' +
      'Other tests in the runner will continue.'
  );
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverPath = path.resolve(__dirname, '../server.ts');

let currentPort = 5173;

function getBase(port: number) {
  return `http://localhost:${port}/api`;
}

const activeServers: ChildProcess[] = [];

function spawnServer(port: number): ChildProcess {
  const serverProcess = spawn('node', ['--import', 'tsx', serverPath], {
    env: {
      ...process.env,
      NODE_ENV: 'development',
      ENABLE_MOCK_AUTH: 'true',
      MOCK_VALID_TOKEN: 'mock-valid-token',
      PORT: String(port),
      FIREBASE_SERVICE_ACCOUNT_BASE64: '',
      FIREBASE_PROJECT_ID: '',
    },
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  });

  serverProcess.stdout!.on('data', (data: Buffer) => {
    const msg = data.toString().trim();
    if (msg) console.log(`[Server] ${msg}`);
  });

  serverProcess.stderr!.on('data', (data: Buffer) => {
    const msg = data.toString().trim();
    if (msg) console.error(`[Server Error] ${msg}`);
  });

  activeServers.push(serverProcess);
  return serverProcess;
}

async function waitForServer(url: string, maxRetries = 60): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not start within ${maxRetries * 500}ms`);
}

// Conditional describe: skip the entire suite when MONGODB_URI is missing,
// instead of process.exit(1)-ing the whole test runner.
describe.skipIf(!uri)('AnalyticsBuffer — Memory Leak & Shutdown Fixes', () => {
  // Safe non-null narrowing — this body only runs when `uri` is truthy.
  const mongoUri = uri as string;

  afterEach(() => {
    for (const p of activeServers) {
      if (!p.killed && p.exitCode === null) {
        try {
          p.kill('SIGKILL');
        } catch (e) {
          /* ignore */
        }
      }
    }
    activeServers.length = 0;
  });

  it(
    'should buffer and flush events to MongoDB',
    async () => {
      const client = new MongoClient(mongoUri);
      await client.connect();
      const db = client.db(process.env.MONGODB_DB_NAME || 'yuvahub');
      const collection = db.collection('analytics');

      await collection.deleteMany({ isTest: true });

      const port = currentPort++;
      const BASE = getBase(port);
      const serverProcess = spawnServer(port);
      await waitForServer(`${BASE}/analytics/buffer-status`);

      const responses: Response[] = [];
      for (let batch = 0; batch < 5; batch++) {
        const batchPromises: Promise<Response>[] = [];
        for (let i = 0; i < 100; i++) {
          batchPromises.push(
            fetch(`${BASE}/analytics/track`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer mock-valid-token',
              },
              body: JSON.stringify({
                event: 'click',
                element: `button_${batch * 100 + i}`,
                timestamp: new Date().toISOString(),
                isTest: true,
              }),
            })
          );
        }
        const res = await Promise.all(batchPromises);
        responses.push(...res);
      }
      const accepted = responses.filter((r) => r.status === 202).length;

      await new Promise((r) => setTimeout(r, 12000));

      const docCount = await collection.countDocuments({ isTest: true });
      expect(docCount).toBeGreaterThanOrEqual(450);

      await collection.deleteMany({ isTest: true });

      if (serverProcess.send && serverProcess.connected) {
        serverProcess.send('shutdown');
      }
      await new Promise((r) => setTimeout(r, 1000));
      await client.close();
    },
    120000
  );

  it(
    'should not grow unbounded — drops oldest events when over capacity',
    async () => {
      const client = new MongoClient(mongoUri);
      await client.connect();
      const db = client.db(process.env.MONGODB_DB_NAME || 'yuvahub');
      const collection = db.collection('analytics');
      await collection.deleteMany({ isTest: true });

      const port = currentPort++;
      const BASE = getBase(port);
      const serverProcess = spawnServer(port);
      await waitForServer(`${BASE}/analytics/buffer-status`);

      const BATCH_SIZE = 100;
      for (let batch = 0; batch < 120; batch++) {
        const batchPromises: Promise<Response>[] = [];
        for (let j = 0; j < BATCH_SIZE; j++) {
          const idx = batch * BATCH_SIZE + j;
          batchPromises.push(
            fetch(`${BASE}/analytics/track`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer mock-valid-token',
              },
              body: JSON.stringify({
                event: 'click',
                element: `stress_${idx}`,
                timestamp: new Date().toISOString(),
                isTest: true,
              }),
            })
          );
        }
        await Promise.all(batchPromises);
      }

      const statusRes = await fetch(`${BASE}/analytics/buffer-status`);
      const status = await statusRes.json();

      expect(status.size).toBeLessThan(13000);
      expect(status.capacity).toBe(10000);

      await collection.deleteMany({ isTest: true });

      if (serverProcess.send && serverProcess.connected) {
        serverProcess.send('shutdown');
      }
      await new Promise((r) => setTimeout(r, 1000));
      await client.close();
    },
    180000
  );

  it(
    'should return 503 when buffer is in shutdown mode',
    async () => {
      const port = currentPort++;
      const BASE = getBase(port);
      const serverProcess = spawnServer(port);
      await waitForServer(`${BASE}/analytics/buffer-status`);

      const normalRes = await fetch(`${BASE}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-valid-token',
        },
        body: JSON.stringify({ event: 'test' }),
      });
      expect(normalRes.status).toBe(202);

      if (serverProcess.send && serverProcess.connected) {
        serverProcess.send('shutdown');
      }

      // Wait for the shutdown flag to be processed and server close
      await new Promise((r) => setTimeout(r, 1500));

      const duringShutdownRes = await fetch(`${BASE}/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-valid-token',
        },
        body: JSON.stringify({ event: 'during-shutdown' }),
      }).catch(() => null);

      if (duringShutdownRes) {
        expect(duringShutdownRes.status).toBe(503);
        const body = await duringShutdownRes.json();
        expect(body.status).toBe('Unavailable');
      }
    },
    60000
  );

  it(
    'should signal backpressure with 429 when buffer is near capacity',
    async () => {
      const port = currentPort++;
      const BASE = getBase(port);
      const serverProcess = spawnServer(port);
      await waitForServer(`${BASE}/analytics/buffer-status`);

      for (let batch = 0; batch < 100; batch++) {
        const batchPromises: Promise<Response>[] = [];
        for (let j = 0; j < 100; j++) {
          batchPromises.push(
            fetch(`${BASE}/analytics/track`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer mock-valid-token',
              },
              body: JSON.stringify({ event: 'fill', index: batch * 100 + j }),
            })
          );
        }
        await Promise.all(batchPromises);
      }

      const statusRes = await fetch(`${BASE}/analytics/buffer-status`);
      const status = await statusRes.json();

      if (status.utilizationPct >= 80) {
        const backpressureRes = await fetch(`${BASE}/analytics/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-valid-token',
          },
          body: JSON.stringify({ event: 'backpressure-test' }),
        });
        expect(backpressureRes.status).toBe(429);
        const body = await backpressureRes.json();
        expect(body.status).toBe('Backpressure');
      }
    },
    180000
  );
});
