import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { generateOpportunityEmbedding } from "../src/services/embedding.js";

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

    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index", 
          path: "embedding",
          queryVector: queryEmbedding,
          limit: 3,
          exact: true
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];

    const results = await db.collection("opportunities").aggregate(pipeline).toArray();

    console.log(`[Semantic Search Test] Found ${results.length} results.`);
    results.forEach((res, i) => {
      console.log(`\nResult ${i + 1} (Score: ${res.score}):\nTitle: ${res.title}\nDescription: ${res.description}`);
    });

  } catch (err: any) {
    console.error("\n[Semantic Search Test] Vector search failed!");
    console.error("-> Did you configure the 'vector_index' Atlas index in the dashboard? It is required for this to work.");
    console.error("-> Error details:", err.message);
  } finally {
    await client.close();
    console.log("\n[Semantic Search Test] Finished.");
  }
}

runTest().catch(console.error);
