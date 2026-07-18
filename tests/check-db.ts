import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "yuvahub";

async function checkDb() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    const count = await db.collection("opportunities").countDocuments();
    console.log(`Total opportunities in DB: ${count}`);

    const withEmbedding = await db.collection("opportunities").countDocuments({ embedding: { $exists: true } });
    console.log(`Opportunities with 'embedding' field: ${withEmbedding}`);

    const sample = await db.collection("opportunities").findOne({ embedding: { $exists: true } });
    if (sample) {
      console.log(`Sample opportunity: ${sample.title}`);
      console.log(`Embedding is array? ${Array.isArray(sample.embedding)}`);
      console.log(`Embedding length: ${sample.embedding.length}`);
      console.log(`First 5 values: ${sample.embedding.slice(0, 5)}`);
    } else {
      console.log("No sample found with an embedding!");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}
checkDb();
