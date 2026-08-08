import { MongoClient } from 'mongodb';
import { runDeadlineChecks, runWeeklyDigest } from '../src/services/deadlineScheduler';
import { matchOpportunityAndNotify } from '../src/services/opportunityMatcher';
import dotenv from 'dotenv';
dotenv.config();

async function testSchedulers() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || "yuvahub");
    
    console.log("Running deadline checks...");
    await runDeadlineChecks(db);
    console.log("Deadline checks finished.");

    console.log("Running weekly digest...");
    await runWeeklyDigest(db);
    console.log("Weekly digest finished.");

    console.log("Running opportunity matcher...");
    await matchOpportunityAndNotify(db, {
      title: "Test Opportunity",
      category: "hackathon",
      _id: "test-id"
    });
    console.log("Opportunity matcher finished.");

  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    await client.close();
  }
}

testSchedulers();
