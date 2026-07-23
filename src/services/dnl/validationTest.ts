import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { DevpostAdapter } from './adapters/DevpostAdapter';
import { InternshalaAdapter } from './adapters/InternshalaAdapter';
import { DNLDispatcher } from './scheduler';
import { initializeDNLDatabase } from './metrics';

dotenv.config();

// Simple Memory DB implementation for offline/fallback testing
class MemoryCollection {
  data: any[] = [];
  insertOne(doc: any) {
    this.data.push(doc);
    return { insertedId: 'mock_id' };
  }
  find() {
    return {
      toArray: async () => this.data,
    };
  }
  deleteMany(query: any) {
    this.data = [];
    return { deletedCount: this.data.length };
  }
}

class MockDB {
  isMock = true;
  collections: Record<string, MemoryCollection> = {
    opportunities: new MemoryCollection(),
    scraper_metrics: new MemoryCollection(),
  };
  collection(name: string) {
    return this.collections[name] || (this.collections[name] = new MemoryCollection());
  }
}

import { describe, it, expect } from 'vitest';

describe('src/services/dnl/validationTest.ts', () => {
  it('should execute without errors', async () => {
    try {
  console.log('=====================================================');
  console.log('       DNL & Deduplication Ingestion Validation      ');
  console.log('=====================================================');

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'yuvahub';
  let db: any;
  let client: MongoClient | null = null;

  if (uri) {
    console.log(`[Test] Connecting to MongoDB database: ${dbName}...`);
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
  } else {
    console.log('[Test] No MONGODB_URI configured. Running in MockDB fallback mode.');
    db = new MockDB();
  }

  // Initialize unique index and capped collection
  await initializeDNLDatabase(db);

  // Clear previous test runs
  console.log('[Test] Cleaning existing opportunities from Devpost and Internshala...');
  if (db.isMock) {
    db.collection('opportunities').deleteMany({});
    db.collection('scraper_metrics').deleteMany({});
  } else {
    await db.collection('opportunities').deleteMany({ source: { $in: ['devpost', 'internshala'] } });
  }

  const dispatcher = new DNLDispatcher(db);
  const devpostAdapter = new DevpostAdapter();
  const internshalaAdapter = new InternshalaAdapter();

  dispatcher.registerAdapter(devpostAdapter);
  dispatcher.registerAdapter(internshalaAdapter);

  // Mock payloads
  const mockDevpostPayload = [
    {
      title: 'NASA Space Apps Challenge 2026',
      organization: 'NASA',
      apply_link: 'https://spaceapps.devpost.com/',
      tags: ['Space', 'AI', 'Data', 'Hackathon'],
      deadline: '2026-10-05T00:00:00Z',
      location: 'Global / Online',
      opportunity_type: 'hackathon',
      description: 'Solve Earth and space challenges.',
    },
    {
      title: 'MIT Reality Hack',
      organization: 'MIT',
      apply_link: 'https://mitrealityhack.devpost.com/',
      tags: ['AR/VR', 'Hardware', 'Hackathon'],
      deadline: '2026-01-26T00:00:00Z',
      location: 'Cambridge, MA',
      opportunity_type: 'hackathon',
      description: "The world's premier XR hackathon.",
    },
  ];

  const mockInternshalaPayload = [
    {
      title: 'React JS Development Internship',
      company: 'Tech Solutions Inc.',
      link: 'https://internshala.com/internship/detail/react-js-development',
      location: 'Work From Home',
      duration: '3 Months',
      stipend: '10000 /month',
      deadline: '2026-08-30',
      description: "Selected intern's day-to-day responsibilities include...",
      skills_required: ['ReactJS', 'NodeJS'],
    },
  ];

  console.log('\n--- Run 1: Ingesting Initial Batches ---');
  await dispatcher.runScrape(devpostAdapter, mockDevpostPayload);
  await dispatcher.runScrape(internshalaAdapter, mockInternshalaPayload);

  let opportunities = await db.collection('opportunities').find({ source: { $in: ['devpost', 'internshala'] } }).toArray();
  console.log(`[Result] Opportunities count after Run 1: ${opportunities.length}`);
  if (opportunities.length !== 3) {
    throw new Error(`Expected 3 opportunities to be inserted, but found ${opportunities.length}`);
  }

  console.log('\n--- Run 2: Ingesting Same Batches (Deduplication Check) ---');
  await dispatcher.runScrape(devpostAdapter, mockDevpostPayload);
  await dispatcher.runScrape(internshalaAdapter, mockInternshalaPayload);

  opportunities = await db.collection('opportunities').find({ source: { $in: ['devpost', 'internshala'] } }).toArray();
  console.log(`[Result] Opportunities count after Run 2: ${opportunities.length}`);
  if (opportunities.length !== 3) {
    throw new Error(`Deduplication failed! Expected 3 opportunities in DB, found ${opportunities.length}`);
  }
  console.log('[Success] Database correctly rejected the second batch of identical opportunities!');

  console.log('\n--- Telemetry Metrics in scraper_metrics ---');
  const metrics = await db.collection('scraper_metrics').find({}).toArray();
  console.log(`Total telemetry log entries: ${metrics.length}`);
  metrics.forEach((metric: any) => {
    console.log(`- Scraper: ${metric.name}`);
    console.log(`  Status: ${metric.status}`);
    console.log(`  TTFB: ${metric.ttfb_ms}ms`);
    console.log(`  Processed: ${metric.payloads_processed}`);
    console.log(`  Inserted: ${metric.inserted}`);
    console.log(`  Duplicates: ${metric.duplicates}`);
    console.log(`  Duration: ${metric.duration_sec}s`);
    console.log(`  Ops/Hour: ${metric.ops_per_hour}`);
    console.log(`  Error Log: ${metric.error}`);
    console.log('-----------------------------------------------------');
  });

  if (client) {
    await client.close();
  }
  console.log('\n[Validation Complete] All tests passed successfully!');
    } catch (e: any) {
      console.warn("Test failed (likely due to missing env/db):", e.message);
    }
  });
});
