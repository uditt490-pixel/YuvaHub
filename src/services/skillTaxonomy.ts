import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("[Skill Taxonomy] MONGODB_URI environment variable is required.");
}
const dbName = process.env.MONGODB_DB_NAME || "yuvahub";
const mongoClient = new MongoClient(uri, {
  maxPoolSize: 50,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

mongoClient.connect().catch((err) => {
  console.error("[Skill Taxonomy] MongoDB connection error:", err);
  process.exit(1);
});

export interface SkillTaxonomy {
  _id: string; // the canonical ID, e.g. "react"
  displayName: string; // e.g. "React.js"
  aliases: string[]; // e.g. ["ReactJS", "React 18"]
}

export async function normalizeSkills(rawSkills: string[]): Promise<string[]> {
  const db = mongoClient.db(dbName);
  const taxonomyCol = db.collection<SkillTaxonomy>("skills_taxonomy");
  const canonicalSkillIds: Set<string> = new Set();

  for (const skill of rawSkills) {
    if (!skill || typeof skill !== 'string') continue;
    
    // Normalize string for searching
    const lowerSkill = skill.toLowerCase().trim();

    // Find if it exists as an exact ID, displayName (lowercased comparison), or in aliases
    const existing = await taxonomyCol.findOne({
      $or: [
        { _id: lowerSkill },
        { displayName: { $regex: new RegExp(`^${skill}$`, "i") } },
        { aliases: { $regex: new RegExp(`^${skill}$`, "i") } }
      ]
    });

    if (existing) {
      canonicalSkillIds.add(existing._id);
    } else {
      // Create new canonical entry
      const newCanonicalId = lowerSkill.replace(/[^a-z0-9]/g, "-");
      try {
        await taxonomyCol.insertOne({
          _id: newCanonicalId,
          displayName: skill,
          aliases: [lowerSkill]
        });
        canonicalSkillIds.add(newCanonicalId);
      } catch (err) {
        // Handle duplicate key error gracefully if created simultaneously
        canonicalSkillIds.add(newCanonicalId);
      }
    }
  }

  return Array.from(canonicalSkillIds);
}
