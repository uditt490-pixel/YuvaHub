import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "yuvahub";

async function checkIndex() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    console.log("Checking Atlas Search Indexes on 'opportunities' collection...");
    const indexes = await db.collection("opportunities").listSearchIndexes().toArray();
    
    if (indexes.length === 0) {
      console.log("❌ NO ATLAS SEARCH INDEXES FOUND. You have not created the index in the MongoDB Atlas dashboard yet!");
    } else {
      console.log(`✅ Found ${indexes.length} search index(es):`);
      indexes.forEach(idx => {
        console.log(`\n- Name: ${idx.name}`);
        console.log(`- Status: ${idx.status}`);
        console.log(`- Queryable: ${idx.queryable}`);
        if (idx.latestDefinition) {
           console.log(`- Definition: ${JSON.stringify(idx.latestDefinition, null, 2)}`);
        }
      });
    }
  } catch(e: any) {
    console.error("Error fetching indexes (maybe not Atlas?):", e.message);
  } finally {
    await client.close();
  }
}
checkIndex();
