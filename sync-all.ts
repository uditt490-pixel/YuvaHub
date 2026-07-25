import { MongoClient } from 'mongodb';
import { meiliClient } from './src/services/searchSync.js';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "yuvahub";

async function syncAll() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    const db = client.db(dbName);
    
    const opportunities = await db.collection('opportunities').find({}).toArray();
    console.log(`Found ${opportunities.length} opportunities. Syncing to Meilisearch...`);

    const formatted = opportunities.map(doc => {
      const copy: any = { ...doc, id: doc._id.toString() };
      delete copy._id;
      return copy;
    });

    if (formatted.length > 0) {
      const res = await meiliClient.index('opportunities').addDocuments(formatted);
      console.log("Meilisearch Task Enqueued:", res);
    } else {
      console.log("No data to sync.");
    }
  } catch (err) {
    console.error("Sync error:", err);
  } finally {
    await client.close();
  }
}

syncAll();
