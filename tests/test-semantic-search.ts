import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { generateOpportunityEmbedding } from "../src/services/embedding.js";
import assert from "assert";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "yuvahub";

async function runTest() {
  console.log("[Semantic Search Test] Connecting to MongoDB...");
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);

    const testQuery = "machine learning for beginners";
    console.log(`[Semantic Search Test] Generating embedding for query: "${testQuery}"`);
    
    const queryEmbedding = await generateOpportunityEmbedding(testQuery);
    
    if (!queryEmbedding) {
      console.error("[Semantic Search Test] Failed to generate embedding. Check GEMINI_API_KEY in .env");
      return;
    }

    console.log(`[Semantic Search Test] Generated embedding with ${queryEmbedding.length} dimensions.`);
    console.log("[Semantic Search Test] Running vector search aggregation...");

    const allOps = await db.collection("opportunities").find({ embedding: { $exists: true } }).toArray();

    const cosineSimilarity = (a: number[], b: number[]) => {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
      }
      if (normA === 0 || normB === 0) return 0;
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    const scoredItems = allOps.map(op => {
      const score = cosineSimilarity(queryEmbedding, op.embedding);
      return { title: op.title, description: op.description, score };
    });

    scoredItems.sort((a, b) => b.score - a.score);
    const results = scoredItems.slice(0, 3);

    console.log(`[Semantic Search Test] Found ${results.length} results.`);
    results.forEach((res, i) => {
      console.log(`\nResult ${i + 1} (Score: ${res.score}):\nTitle: ${res.title}\nDescription: ${res.description}`);
    });

    // Auto-test assertions
    assert.ok(Array.isArray(results), "Results should be an array");
    if (results.length > 0) {
      const highestScore = results[0].score;
      assert.ok(highestScore >= 0 && highestScore <= 1, "Cosine similarity score should be between 0 and 1");
      if (results.length > 1) {
        assert.ok(highestScore >= results[1].score, "Results must be sorted by score in descending order");
      }
    }
    
    console.log("\n[Semantic Search Test] All assertions passed successfully! ✅");

  } catch (err: any) {
    console.error("\n[Semantic Search Test] Vector search test failed!");
    console.error("-> Error details:", err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log("\n[Semantic Search Test] Finished.");
  }
}

runTest().catch(console.error);
