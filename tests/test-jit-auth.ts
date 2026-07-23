import { describe, it, expect, vi } from 'vitest';
import { MongoClient } from 'mongodb';

// Configure environment variables before importing modules that evaluate them on load
process.env.NODE_ENV = 'development';
process.env.ENABLE_MOCK_AUTH = 'true';

const { authenticateUser, deleteFirebaseUser, authMiddleware } = await import('../src/middleware/auth.js');
const dbModule = await import('../src/api/db.js');

// Mock request and response
const mockReq = (token: string): any => ({
  headers: {
    authorization: `Bearer ${token}`
  }
});

const mockRes = (): any => ({
  status: (code: number) => ({
    json: (data: any) => {
      // console.log(`Response ${code}:`, data);
    }
  })
});

describe('JIT Authentication Middleware Tests', () => {
  it('should prevent user duplication when JIT profile creation runs concurrently', async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/?connectTimeoutMS=2000&serverSelectionTimeoutMS=2000';
    const client = new MongoClient(uri);

    let isMongoAvailable = false;
    try {
      await client.connect();
      isMongoAvailable = true;
    } catch (err: any) {
      console.warn("Skipping real MongoDB tests because database is unavailable:", err.message);
    }

    if (!isMongoAvailable) {
      await client.close();
      return; // Safe exit of the test when external service is offline
    }

    try {
      const db = client.db('yuvahub_test');
      const usersCollection = db.collection('users');

      await usersCollection.deleteMany({ firebaseUid: "mock_user_123" });
      try {
        await usersCollection.createIndex({ firebaseUid: 1 }, { unique: true });
      } catch (e) {
        // Safe to ignore only index-exists conflicts
      }

      // Spy on console.error to track database upsert failures
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // 1. Test JIT Profile Creation (simulating 3 concurrent requests) with explicit DB injection
      const localAuthMiddleware = authenticateUser(db);
      const nextFn = () => {};

      await Promise.all([
        localAuthMiddleware(mockReq("MOCK_VALID_TOKEN"), mockRes(), nextFn),
        localAuthMiddleware(mockReq("MOCK_VALID_TOKEN"), mockRes(), nextFn),
        localAuthMiddleware(mockReq("MOCK_VALID_TOKEN"), mockRes(), nextFn)
      ]);

      // Expect no database errors were printed (indicating all requests finished without duplicate key violations)
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();

      const users = await usersCollection.find({ firebaseUid: "mock_user_123" }).toArray();
      expect(users.length).toBe(1);

      // Clean up local test db entries
      await deleteFirebaseUser("mock_user_123");
      await usersCollection.deleteOne({ firebaseUid: "mock_user_123" });
      const afterDelete = await usersCollection.find({ firebaseUid: "mock_user_123" }).toArray();
      expect(afterDelete.length).toBe(0);

    } finally {
      await client.close();
    }
  });

  it('should successfully fallback to module-level dbCommand at runtime, handle role propagation, and existing profile synchronization', async () => {
    // 2. Initialize the database which populates module-level dbCommand (either MockDB or real MongoClient)
    await dbModule.initializeDatabase();
    expect(dbModule.dbCommand).not.toBeNull();

    const usersCollection = dbModule.dbCommand.collection('users');
    await usersCollection.deleteOne({ firebaseUid: "mock_user_123" });

    // Seed existing profile with custom role
    await usersCollection.insertOne({
      firebaseUid: "mock_user_123",
      email: "stale@example.com",
      name: "Stale Name",
      role: "admin",
      created_at: new Date()
    });

    // Call the exported authMiddleware (its closure is initialized with null, but must dynamically resolve dbCommand at runtime)
    const req = mockReq("MOCK_VALID_TOKEN");
    const nextFn = () => {};
    await authMiddleware(req, mockRes(), nextFn);

    // Verify role is correctly propagated from the seeded database document
    expect(req.user.role).toBe("admin");

    // Verify no duplicates were created
    const users = await usersCollection.find({ firebaseUid: "mock_user_123" }).toArray();
    expect(users.length).toBe(1);

    // Clean up
    await deleteFirebaseUser("mock_user_123");
    await usersCollection.deleteOne({ firebaseUid: "mock_user_123" });
  });

  it('should be atomic under concurrent findOneAndUpdate calls on MemoryCollection', async () => {
    const mockCollection = new dbModule.MemoryCollection([]);
    const query = { firebaseUid: "concurrent_test" };
    const update = {
      $setOnInsert: {
        firebaseUid: "concurrent_test",
        created_at: new Date()
      }
    };
    const options = { upsert: true };

    // Fire 10 concurrent upserts to simulate JIT concurrency
    await Promise.all([
      mockCollection.findOneAndUpdate(query, update, options),
      mockCollection.findOneAndUpdate(query, update, options),
      mockCollection.findOneAndUpdate(query, update, options),
      mockCollection.findOneAndUpdate(query, update, options),
      mockCollection.findOneAndUpdate(query, update, options),
      mockCollection.findOneAndUpdate(query, update, options),
      mockCollection.findOneAndUpdate(query, update, options),
      mockCollection.findOneAndUpdate(query, update, options),
      mockCollection.findOneAndUpdate(query, update, options),
      mockCollection.findOneAndUpdate(query, update, options),
    ]);

    // Assert only one item was created
    expect(mockCollection.data.length).toBe(1);
  });
});
