import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { isToxic } from '../src/services/toxicity.js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

import { describe, it, expect } from 'vitest';

dotenv.config();

async function runTests() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in .env!");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || 'yuvahub');
  console.log("Connected to MongoDB for Testing...");

  // 1. Clear old test posts and comments
  await db.collection("posts").deleteMany({ isTest: true });
  await db.collection("comments").deleteMany({ isTest: true });

  // 2. Create a test post
  const post = {
    title: "Test Post",
    content: "This is a test post content.",
    author: "test_user",
    upvotes: 0,
    upvoted_by: [] as string[],
    createdAt: new Date(),
    updatedAt: new Date(),
    isTest: true
  };
  const postResult = await db.collection("posts").insertOne(post);
  const postId = postResult.insertedId;
  console.log(`Created test post with ID: ${postId}`);

  // 3. Concurrency test: 100 concurrent upvotes on the same post
  console.log("Simulating 100 concurrent upvotes on the same post...");
  const userIds = Array.from({ length: 100 }).map((_, idx) => `user_${idx}`);

  // Execute concurrent updates
  await Promise.all(
    userIds.map(async (userId) => {
      await (db.collection("posts") as any).updateOne(
        { _id: postId, upvoted_by: { $ne: userId } },
        { $inc: { upvotes: 1 }, $push: { upvoted_by: userId } }
      );
    })
  );

  // Fetch post after upvotes
  const updatedPost = await db.collection("posts").findOne({ _id: postId });
  if (!updatedPost) {
    console.error("❌ Failed to find the updated post!");
    process.exit(1);
  }
  console.log(`Final upvotes count: ${updatedPost.upvotes}`);
  console.log(`upvoted_by array length: ${updatedPost.upvoted_by.length}`);

  if (updatedPost.upvotes === 100 && updatedPost.upvoted_by.length === 100) {
    console.log("✅ Concurrency upvotes test passed! Atomic update succeeded without race conditions.");
  } else {
    console.error("❌ Concurrency upvotes test failed!");
    process.exit(1);
  }

  // 4. Test Materialized Path for comments
  console.log("Testing Materialized Path comments...");
  const c1Id = new ObjectId();
  const c1Path = `,${postId.toString()},${c1Id.toString()},`;
  await db.collection("comments").insertOne({
    _id: c1Id,
    postId: postId.toString(),
    parentId: null,
    content: "Root comment 1",
    author: "author_root",
    path: c1Path,
    createdAt: new Date(),
    isTest: true
  });
});
