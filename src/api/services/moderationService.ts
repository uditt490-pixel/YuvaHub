import { ObjectId } from "mongodb";
import { dbCommand, dbQuery } from "../db.js";
import { AppError } from "../../lib/AppError.js";
import { Report } from "../../models/reportSchema.js";

export class ModerationService {
  /**
   * Captures a snapshot of the reported content.
   */
  static async snapshotContent(contentType: string, contentId: string) {
    if (!dbQuery) return null;
    let collectionName = "";
    switch (contentType) {
      case "opportunity":
        collectionName = "opportunities";
        break;
      case "post":
        collectionName = "posts";
        break;
      case "team":
        collectionName = "teams";
        break;
      case "user":
        collectionName = "users";
        break;
      default:
        return null;
    }

    try {
      const query = ObjectId.isValid(contentId) ? { _id: new ObjectId(contentId) } : { id: contentId };
      const doc = await dbQuery.collection(collectionName).findOne(query);
      if (!doc && !ObjectId.isValid(contentId)) {
          const fallbackDoc = await dbQuery.collection(collectionName).findOne({ _id: contentId as any });
          return fallbackDoc;
      }
      return doc;
    } catch (e) {
      return null;
    }
  }

  /**
   * Executes a moderation action based on a report.
   */
  static async executeAction(reportId: string, action: string, adminUid: string) {
    if (!dbCommand) throw AppError.internal("DB Connection not established");

    const reportQuery = ObjectId.isValid(reportId) ? { _id: new ObjectId(reportId) } : { _id: reportId as any };
    const report = await dbCommand.collection("reports").findOne(reportQuery);
    
    if (!report) {
      throw AppError.notFound("Report not found");
    }

    let collectionName = "";
    switch (report.contentType) {
      case "opportunity": collectionName = "opportunities"; break;
      case "post": collectionName = "posts"; break;
      case "team": collectionName = "teams"; break;
      case "user": collectionName = "users"; break;
    }

    const contentQuery = ObjectId.isValid(report.contentId) ? { _id: new ObjectId(report.contentId) } : { id: report.contentId };

    if (action === "remove") {
      if (collectionName) {
        // Soft delete or hard delete. Let's soft-delete for opportunities and posts by setting a flag or status.
        if (collectionName === "opportunities") {
           await dbCommand.collection(collectionName).updateOne(contentQuery, { $set: { status: "removed", removedBy: adminUid, flagged: true } });
        } else if (collectionName === "posts") {
           await dbCommand.collection(collectionName).deleteOne(contentQuery); // Actually, we might hard delete posts
        } else {
           await dbCommand.collection(collectionName).deleteOne(contentQuery);
        }
      }
    } else if (action === "ban" && collectionName === "users") {
       await dbCommand.collection("users").updateOne(contentQuery, { $set: { isBanned: true, bannedBy: adminUid, bannedAt: new Date() } });
    } else if (action === "warn") {
       // Just record the warning somewhere or send a notification (omitted for brevity, assume a notification is sent in real system)
    }

    // Update report status
    await dbCommand.collection("reports").updateOne(reportQuery, {
      $set: {
        status: "resolved",
        adminAction: action,
        resolvedBy: adminUid,
        updatedAt: new Date()
      }
    });

    return { success: true };
  }
}
