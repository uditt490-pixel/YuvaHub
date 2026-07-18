import { MongoClient } from 'mongodb';
import { spawn } from 'child_process';
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

async function runTest() {
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || 'yuvahub');
  const collection = db.collection("analytics");

  // Clean old test data
  console.log("Cleaning old test analytics events...");
  await collection.deleteMany({ isTest: true });

  console.log("Starting server process...");
  const serverProcess = spawn("node", ["--import", "tsx", serverPath], {
    env: { ...process.env, NODE_ENV: "production" }
  });

  serverProcess.stdout.on("data", (data) => {
    console.log(`[Server] ${data.toString().trim()}`);
  });

  serverProcess.stderr.on("data", (data) => {
    console.error(`[Server Error] ${data.toString().trim()}`);
  });

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("Firing 5,000 analytics events...");
  const durations: number[] = [];
  const start = Date.now();

  let okCount = 0;
  let slowCount = 0;
  const chunkSize = 500;

  for (let i = 0; i < 5000; i += chunkSize) {
    const chunkPromises: Promise<number>[] = [];
    for (let j = 0; j < chunkSize && i + j < 5000; j++) {
      const idx = i + j;
      const reqStart = performance.now();
      const p = fetch("http://localhost:5173/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "click",
          element: `button_${idx}`,
          timestamp: new Date().toISOString(),
          isTest: true
        })
      }).then(async (res) => {
        const duration = performance.now() - reqStart;
        if (res.status === 202) {
          okCount++;
        }
        if (duration > 15) {
          slowCount++;
        }
        return duration;
      }).catch(err => {
        console.error(`Failed request ${idx}:`, err.message);
        return -1;
      });
      chunkPromises.push(p);
    }
    const chunkDurations = await Promise.all(chunkPromises);
    durations.push(...chunkDurations);
  }
  const end = Date.now();
  const totalTime = end - start;

  const validDurations = durations.filter(d => d >= 0);
  const avgDuration = validDurations.reduce((sum, d) => sum + d, 0) / validDurations.length;

  console.log(`Fired 5,000 events in ${totalTime}ms.`);
  console.log(`Response Stats:`);
  console.log(`- 202 Accepted Count: ${okCount}`);
  console.log(`- Average Response Time: ${avgDuration.toFixed(2)}ms`);
  console.log(`- Requests taking >15ms: ${slowCount}`);

  // Wait 7 seconds for the interval flush (5s interval)
  console.log("Waiting 7 seconds for AnalyticsBuffer to auto-flush...");
  await new Promise((resolve) => setTimeout(resolve, 7000));

  let docCount = await collection.countDocuments({ isTest: true });
  console.log(`Documents in MongoDB after auto-flush: ${docCount}`);

  // Test Graceful Shutdown
  // Fire 100 more events and immediately send SIGTERM to verify graceful shutdown flushes remaining
  console.log("Firing 100 more events...");
  const extraPromises: Promise<any>[] = [];
  for (let i = 0; i < 100; i++) {
    extraPromises.push(
      fetch("http://localhost:5173/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "view",
          element: `extra_${i}`,
          timestamp: new Date().toISOString(),
          isTest: true
        })
      })
    );
  }
  await Promise.all(extraPromises);

  console.log("Triggering graceful shutdown via API endpoint...");
  try {
    await fetch("http://localhost:5173/api/analytics/shutdown", { method: "POST" });
  } catch (err: any) {
    console.log("Failed to send shutdown API request, killing process directly:", err.message);
    serverProcess.kill("SIGTERM");
  }

  // Wait for server to exit
  await new Promise((resolve) => setTimeout(resolve, 3000));

  docCount = await collection.countDocuments({ isTest: true });
  console.log(`Documents in MongoDB after graceful shutdown: ${docCount}`);

  await client.close();

  if (docCount === 5100) {
    console.log("SUCCESS: All 5,100 events were successfully written to MongoDB!");
    process.exit(0);
  } else {
    console.error(`FAILURE: Expected 5100 documents, found ${docCount}`);
    process.exit(1);
  }
}

runTest().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
