import { dbQuery, dbCommand } from "../db.js";
import { AppError } from "../../lib/AppError.js";
import { Testimonial } from "../../models/testimonialSchema.js";
import { ObjectId } from "mongodb";

// Basic profanity filter mock
const PROFANE_WORDS = ["badword1", "badword2", "spam"];
function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return PROFANE_WORDS.some(word => lower.includes(word));
}

export class TestimonialService {
  static async createTestimonial(testimonialData: Omit<Testimonial, "id" | "status" | "isHighlighted" | "createdAt" | "updatedAt">) {
    if (!dbCommand) throw new AppError(500, "Database connection not available");

    if (testimonialData.authorId === testimonialData.recipientId) {
      throw AppError.badRequest("You cannot write a testimonial for yourself.");
    }

    if (containsProfanity(testimonialData.content)) {
      throw AppError.badRequest("Testimonial contains inappropriate content.");
    }

    const db = dbCommand;

    // Check limit
    const existingCount = await db.collection("testimonials").countDocuments({
      authorId: testimonialData.authorId,
      recipientId: testimonialData.recipientId
    });

    if (existingCount >= 3) {
      throw AppError.badRequest("You can only write up to 3 testimonials for the same user.");
    }

    const testimonial = {
      ...testimonialData,
      status: "pending",
      isHighlighted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection("testimonials").insertOne(testimonial);
    return { id: result.insertedId.toString(), ...testimonial };
  }

  static async getPublicTestimonials(uid: string) {
    if (!dbQuery) return [];
    
    // We only fetch approved ones for public view
    const testimonials = await dbQuery.collection("testimonials")
      .find({ recipientId: uid, status: "approved" })
      .sort({ isHighlighted: -1, createdAt: -1 })
      .toArray();

    return testimonials.map(t => ({ ...t, id: t._id.toString() }));
  }

  static async getTestimonialInbox(uid: string) {
    if (!dbQuery) return { received: [], given: [] };

    const [received, given] = await Promise.all([
      dbQuery.collection("testimonials").find({ recipientId: uid }).sort({ createdAt: -1 }).toArray(),
      dbQuery.collection("testimonials").find({ authorId: uid }).sort({ createdAt: -1 }).toArray()
    ]);

    return {
      received: received.map(t => ({ ...t, id: t._id.toString() })),
      given: given.map(t => ({ ...t, id: t._id.toString() }))
    };
  }

  static async updateStatus(uid: string, testimonialId: string, status: string) {
    if (!dbCommand) throw new AppError(500, "Database connection not available");
    
    if (!["approved", "rejected", "hidden"].includes(status)) {
      throw AppError.badRequest("Invalid status");
    }

    const db = dbCommand;
    const result = await db.collection("testimonials").findOneAndUpdate(
      { _id: new ObjectId(testimonialId), recipientId: uid },
      { $set: { status, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      throw AppError.notFound("Testimonial not found or not authorized");
    }

    return result.value;
  }

  static async toggleHighlight(uid: string, testimonialId: string, isHighlighted: boolean) {
    if (!dbCommand) throw new AppError(500, "Database connection not available");

    const db = dbCommand;

    if (isHighlighted) {
      // Check if already 3 highlighted
      const highlightedCount = await db.collection("testimonials").countDocuments({
        recipientId: uid,
        isHighlighted: true
      });

      if (highlightedCount >= 3) {
        throw AppError.badRequest("You can only highlight up to 3 testimonials.");
      }
    }

    const result = await db.collection("testimonials").findOneAndUpdate(
      { _id: new ObjectId(testimonialId), recipientId: uid, status: "approved" },
      { $set: { isHighlighted, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      throw AppError.notFound("Testimonial not found, not approved, or not authorized");
    }

    return result.value;
  }
}
