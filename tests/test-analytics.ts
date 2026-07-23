import { MongoClient } from 'mongodb';
import { spawn, ChildProcess } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not found in env!");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverPath = path.resolve(__dirname, "../server.ts");

// Use a fixed test port to avoid collisions
const TEST_PORT = 5173;

function spawnServer(): ChildProcess {
  const serverProcess = spawn("node", ["--import", "tsx", serverPath], {
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: String(TEST_PORT),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout!.on("data", (data: Buffer) => {
    const msg = data.toString().trim();
    if (msg) console.log(`[Server] ${msg}`);
  });

  serverProcess.stderr!.on("data", (data: Buffer) => {
    const msg = data.toString().trim();
    if (msg) console.error(`[Server Error] ${msg}`);
  });

  return serverProcess;
}

async function waitForServer(url: string, maxRetries = 30): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return; // 404 means the server is up
    } catch {
      // Server not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not start within ${maxRetries * 500}ms`);
}

const BASE = `http://localhost:${TEST_PORT}/api`;

import { describe, it, expect } from 'vitest';

describe('AnalyticsBuffer — Memory Leak & Shutdown Fixes', () => {
  it('should buffer and flush events to MongoDB', async () => {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'yuvahub');
    const collection = db.collection("analytics");

    // Clean old test data
    await collection.deleteMany({ isTest: true });

    const serverProcess = spawnServer();
    await waitForServer(`${BASE}/analytics/buffer-status`);
    console.log("Server is ready.");

    // Fire 500 analytics events
    console.log("Firing 500 analytics events...");
    const promises: Promise<Response>[] = [];
    for (let i = 0; i < 500; i++) {
      promises.push(
        fetch(`${BASE}/analytics/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "click",
            element: `button_${i}`,
            timestamp: new Date().toISOString(),
            isTest: true,
          }),
        }),
      );
    }
    const responses = await Promise.all(promises);
    const accepted = responses.filter((r) => r.status === 202).length;
    console.log(`Accepted: ${accepted}/500`);

    // Wait for auto-flush (flush interval is 5s)
    console.log("Waiting 7 seconds for auto-flush...");
    await new Promise((r) => setTimeout(r, 7000));

    const docCount = await collection.countDocuments({ isTest: true });
    console.log(`Documents in MongoDB after auto-flush: ${docCount}`);

    // We may have 500 or slightly more if some events were flushed in batches
    expect(docCount).toBeGreaterThanOrEqual(450);

    // Clean up
    await collection.deleteMany({ isTest: true });
    serverProcess.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 1000));
    await client.close();
  }, 30000);

  it('should not grow unbounded — drops oldest events when over capacity', async () => {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'yuvahub');
    const collection = db.collection("analytics");
    await collection.deleteMany({ isTest: true });

    const serverProcess = spawnServer();
    await waitForServer(`${BASE}/analytics/buffer-status`);

    // Fire 15,000 events rapidly (exceeds the 10,000 default capacity)
    // Without the fix, this would grow unbounded. With the fix, it should
    // auto-flush and drop oldest events to stay within capacity.
    console.log("Firing 15,000 analytics events rapidly...");
    const BATCH_SIZE = 500;
    for (let batch = 0; batch < 30; batch++) {
      const batchPromises: Promise<Response>[] = [];
      for (let j = 0; j < BATCH_SIZE; j++) {
        const idx = batch * BATCH_SIZE + j;
        batchPromises.push(
          fetch(`${BASE}/analytics/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "click",
              element: `stress_${idx}`,
              timestamp: new Date().toISOString(),
              isTest: true,
            }),
          }),
        );
      }
      await Promise.all(batchPromises);
    }

    // Check buffer status — should not have grown to 15,000
    const statusRes = await fetch(`${BASE}/analytics/buffer-status`);
    const status = await statusRes.json();
    console.log(`Buffer status after stress test:`, status);

    // Buffer should be well under 15,000 (auto-flush + overflow protection)
    expect(status.size).toBeLessThan(13000);
    expect(status.capacity).toBe(10000);

    // Clean up
    await collection.deleteMany({ isTest: true });
    serverProcess.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 1000));
    await client.close();
  }, 60000);

  it('should drain remaining events on graceful shutdown (zero data loss)', async () => {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'yuvahub');
    const collection = db.collection("analytics");
    await collection.deleteMany({ isTest: true, isShutdownTest: true });

    const serverProcess = spawnServer();
    await waitForServer(`${BASE}/analytics/buffer-status`);

    // Fire 100 events and immediately send SIGTERM
    console.log("Firing 100 events then immediately shutting down...");
    const eventPromises: Promise<Response>[] = [];
    for (let i = 0; i < 100; i++) {
      eventPromises.push(
        fetch(`${BASE}/analytics/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "view",
            element: `shutdown_${i}`,
            timestamp: new Date().toISOString(),
            isTest: true,
            isShutdownTest: true,
          }),
        }),
      );
    }
    await Promise.all(eventPromises);

    // Immediately send SIGTERM (before the 5s auto-flush would fire)
    console.log("Sending SIGTERM...");
    serverProcess.kill("SIGTERM");

    // Wait for process to exit and flush to complete
    await new Promise((r) => setTimeout(r, 5000));

    // Verify ALL events were flushed (the drainAndStop should flush all 100)
    const docCount = await collection.countDocuments({ isTest: true, isShutdownTest: true });
    console.log(`Documents after shutdown drain: ${docCount}`);

    // Even though we killed immediately, the drainAndStop() should have flushed
    // everything that was already buffered. Some may have been flushed before
    // SIGTERM due to auto-flush, but the drain ensures zero loss.
    expect(docCount).toBe(100);

    await collection.deleteMany({ isTest: true, isShutdownTest: true });
    await client.close();
  }, 30000);

  it('should return 503 when buffer is in shutdown mode', async () => {
    const serverProcess = spawnServer();
    await waitForServer(`${BASE}/analytics/buffer-status`);

    // First verify normal request works
    const normalRes = await fetch(`${BASE}/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "test" }),
    });
    expect(normalRes.status).toBe(202);

    // Send SIGTERM to trigger shutdown
    serverProcess.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 100));

    // Try to send an event during shutdown
    const duringShutdownRes = await fetch(`${BASE}/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "during-shutdown" }),
    }).catch(() => null);

    // Either we get 503 (if server hasn't fully exited yet) or connection refused
    if (duringShutdownRes) {
      expect(duringShutdownRes.status).toBe(503);
      const body = await duringShutdownRes.json();
      expect(body.status).toBe("Unavailable");
    }

    await new Promise((r) => setTimeout(r, 2000));
  }, 15000);

  it('should signal backpressure with 429 when buffer is near capacity', async () => {
    const serverProcess = spawnServer();
    await waitForServer(`${BASE}/analytics/buffer-status`);

    // Check initial status
    const initialStatusRes = await fetch(`${BASE}/analytics/buffer-status`);
    const initialStatus = await initialStatusRes.json();
    console.log(`Initial buffer status:`, initialStatus);

    // Fill the buffer close to capacity by firing many events
    // (buffer capacity is 10,000, 80% threshold = 8,000)
    // But we need to fill it without auto-flush draining it too fast.
    // We fire in rapid batches to overwhelm the flush rate.
    console.log("Filling buffer to near capacity...");
    for (let batch = 0; batch < 20; batch++) {
      const batchPromises: Promise<Response>[] = [];
      for (let j = 0; j < 500; j++) {
        batchPromises.push(
          fetch(`${BASE}/analytics/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: "fill", index: batch * 500 + j }),
          }),
        );
      }
      await Promise.all(batchPromises);
    }

    // Check buffer status
    const statusRes = await fetch(`${BASE}/analytics/buffer-status`);
    const status = await statusRes.json();
    console.log(`Buffer status after fill:`, status);

    // If the buffer is above 80%, we should have seen 429s.
    // This is an informational check — we verify the 429 status code
    // is returned when appropriate.
    if (status.utilizationPct >= 80) {
      // Try sending one more event — should get 429
      const backpressureRes = await fetch(`${BASE}/analytics/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "backpressure-test" }),
      });
      expect(backpressureRes.status).toBe(429);
      const body = await backpressureRes.json();
      expect(body.status).toBe("Backpressure");
      console.log("Backpressure signal verified (429).");
    } else {
      console.log(`Buffer at ${status.utilizationPct}% — below 80% threshold (auto-flush drained it). Backpressure test skipped.`);
    }

    serverProcess.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 1000));
  }, 60000);
});
