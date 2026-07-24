import { Worker, Job } from "bullmq";
import { connection } from "../queues/connection";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
// @ts-expect-error — pdf-parse ESM bundle lacks default export; CJS fallback works at runtime
import pdfParse from "pdf-parse";
import { GoogleGenAI, Type } from "@google/genai";
import { normalizeSkills } from "../services/skillTaxonomy";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "yuvahub";
const mongoClient = new MongoClient(uri);
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

mongoClient.connect().catch((err) => {
  console.error("[Resume Worker] MongoDB connection error:", err);
});

export const resumeWorker = new Worker(
  "resume-parser",
  async (job: Job) => {
    const { userId, resumeUrl } = job.data;
    if (!userId || !resumeUrl) {
      throw new Error("Missing userId or resumeUrl in job data");
    }

    try {
      console.log(`[Resume Worker] Fetching resume for user ${userId} from ${resumeUrl}`);
      // Fetch the PDF
      const response = await fetch(resumeUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch resume from URL: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Parse PDF
      console.log(`[Resume Worker] Parsing PDF for user ${userId}`);
      const pdfData = await pdfParse(buffer);
      const text = pdfData.text;

      // Extract Structured Data using Gemini
      console.log(`[Resume Worker] Extracting data using Gemini for user ${userId}`);
      
      const prompt = `Extract structured data from the following resume text. Return JSON ONLY with this schema:
      {
        "education": [{"degree": "...", "institution": "...", "dates": "...", "gpa": "..."}],
        "workExperience": [{"company": "...", "role": "...", "dates": "...", "impact": "..."}],
        "rawSkills": ["skill1", "skill2"]
      }
      
      Resume Text:
      ${text}`;

      const responseObj = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    dates: { type: Type.STRING },
                    gpa: { type: Type.STRING }
                  }
                }
              },
              workExperience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    dates: { type: Type.STRING },
                    impact: { type: Type.STRING }
                  }
                }
              },
              rawSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });

      const extractedData = JSON.parse(responseObj.text || "{}");

      // Normalize Skills
      console.log(`[Resume Worker] Normalizing skills for user ${userId}`);
      const canonicalSkills = await normalizeSkills(extractedData.rawSkills || []);

      // Update User Profile
      console.log(`[Resume Worker] Updating profile for user ${userId}`);
      const db = mongoClient.db(dbName);
      
      await db.collection("users").updateOne(
        { uid: userId },
        {
          $set: {
            education: extractedData.education || [],
            workExperience: extractedData.workExperience || [],
            canonicalSkills: canonicalSkills
          }
        }
      );

      console.log(`[Resume Worker] Successfully processed resume for user ${userId}`);
      
      // We would ideally call the matching score update here
      // For now, it will be automatically reflected next time the feed is loaded

    } catch (err: any) {
      console.error(`[Resume Worker] Error processing resume for user ${userId}:`, err);
      throw err; // Trigger BullMQ retry
    }
  },
  { connection }
);
