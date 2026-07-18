import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function runTest() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found!");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'yuvahub');
    const collection = db.collection("opportunities");

    console.log("Seeding an opportunity for testing...");
    const testId = new ObjectId();
    await collection.insertOne({
      _id: testId,
      title: "Unique Developer Hackathon 2026",
      description: "Come join us for a premium developer hackathon event.",
      company: "YuvaCorp",
      tags: ["hackathon", "developer", "node"],
      location: "Remote",
      created_at: new Date(),
      isTestSearch: true
    });

    // We will wait a little longer to ensure Atlas Search registers the new document
    console.log("Waiting 6 seconds for search index to sync the new document...");
    await new Promise(r => setTimeout(r, 6000));

    // Test querying the DB using $search stage directly
    console.log("Testing aggregation with $search stage on DB directly...");
    const pipeline = [
      {
        $search: {
          index: "default",
          compound: {
            should: [
              {
                text: {
                  query: "develper Hckathon", // Typos of developer and Hackathon
                  path: ["title", "tags"],
                  fuzzy: { maxEdits: 2 }
                }
              },
              {
                text: {
                  query: "develper Hckathon",
                  path: ["company", "description"]
                }
              }
            ]
          },
          highlight: {
            path: ["title", "tags", "company", "description"]
          }
        }
      },
      {
        $project: {
          title: 1,
          company: 1,
          tags: 1,
          description: 1,
          highlights: { $meta: "searchHighlights" },
          score: { $meta: "searchScore" }
        }
      }
    ];

    const startTime = Date.now();
    const results = await collection.aggregate(pipeline).toArray();
    const duration = Date.now() - startTime;

    console.log(`Aggregation search query executed in ${duration}ms.`);
    console.log(`Found ${results.length} matching opportunities.`);
    
    const matched = results.find(r => r._id.toString() === testId.toString());
    if (matched) {
      console.log("Success! Found the test opportunity via fuzzy matching!");
      console.log("Matched document:", JSON.stringify(matched, null, 2));
    } else {
      console.log("Warning: Did not find test opportunity yet. The index might still be updating.");
      if (results.length > 0) {
        console.log("Sample result found:", JSON.stringify(results[0], null, 2));
      }
    }

    // Clean up
    await collection.deleteOne({ _id: testId });
  } catch (err) {
    console.error("Test failed with error:", err);
  } finally {
    await client.close();
  }
}

runTest();
