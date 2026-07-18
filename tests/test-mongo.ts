import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function testPipeline() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("No MONGODB_URI found in .env!");
    return;
  }
  
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'yuvahub');
    console.log("Connected to MongoDB Atlas!");
    
    // Clear old test data
    await db.collection("opportunities").deleteMany({ isTest: true });
    await db.collection("interactions").deleteMany({ isTest: true });
    
    const oppsCollection = db.collection('opportunities');
    const interactionsCollection = db.collection('interactions');

    // Seed Opportunities
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));
    const oldOppId = new ObjectId();
    const newOppId = new ObjectId();

    console.log("Seeding test opportunities...");
    await oppsCollection.insertMany([
      {
        _id: oldOppId,
        title: "Old AI Research Fellowship",
        description: "Research machine learning models in a remote environment.",
        location: "Remote",
        tags: ["machine learning", "ai", "python"],
        source_quality_score: 50,
        created_at: twoDaysAgo,
        isTest: true
      },
      {
        _id: newOppId,
        title: "New React Developer Intern",
        description: "Build robust frontends using React and Tailwind.",
        location: "San Francisco",
        tags: ["react", "javascript", "frontend"],
        source_quality_score: 90,
        created_at: now,
        isTest: true
      }
    ]);

    // Seed Interactions (Make the old one trending)
    console.log("Seeding interactions...");
    const interactions = Array.from({ length: 15 }).map(() => ({
      opportunity_id: oldOppId.toString(),
      timestamp: now, // all recent
      isTest: true
    }));
    // Add one interaction to the new one
    interactions.push({
      opportunity_id: newOppId.toString(),
      timestamp: now,
      isTest: true
    });
    
    await interactionsCollection.insertMany(interactions as any);
    console.log("Database Seeded Successfully! You can now start the server with `npm run dev` and hit the API.");
    
  } catch(e) {
    console.error("Error testing pipeline:", e);
  } finally {
    await client.close();
  }
}
testPipeline();
