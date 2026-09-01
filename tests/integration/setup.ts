import { beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Express } from 'express';

// Set deterministic test environment variables BEFORE importing server
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
delete process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

let mongod: MongoMemoryServer;

export let app: Express;
export let server: any;
export let io: any;
export let redisClient: any;
export let db: any;
export let mongoClient: MongoClient;
export let request: supertest.SuperTest<supertest.Test>;

beforeAll(async () => {
  // Spin up an in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();
  process.env.MONGODB_URI = mongoUri; // Ensure app uses the same DB
  
  mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  db = mongoClient.db();

  // Import createApp after ENV is set
  const { createApp } = await import('../../server.js');

  // Start the application
  const appInstances = await createApp();
  app = appInstances.app;
  server = appInstances.server;
  io = appInstances.io;
  redisClient = appInstances.redisClient;
  
  // Set up supertest request agent
  request = supertest(app);
});

afterAll(async () => {
  // Graceful teardown
  if (mongoClient) {
    await mongoClient.close();
  }
  if (mongod) {
    await mongod.stop();
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (io) {
    io.close();
  }
  if (redisClient) {
    redisClient.quit();
  }
});
