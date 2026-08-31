import { Request, Response } from "express";
import { dbCommand, dbQuery } from "../db.js";
import { runWeeklyNewsletterBatch, rankOpportunitiesForUser, generateNewsletterIntro, buildNewsletterHtml } from "../../services/newsletterEngine.js";
import { CURATED_FALLBACKS } from "../../services/staticFallbacks.js";
import { sendSuccess, sendError } from "../../lib/apiResponse.js";
import { config } from "../../config/env.js";

/**
 * Trigger Weekly Newsletter Dispatch (Admin / Cron Worker Endpoint)
 */
export const triggerWeeklyNewsletter = async (req: Request, res: Response) => {
  const { batchSize, dryRun } = req.body || {};
  try {
    const activeDb = dbQuery || dbCommand;
    const result = await runWeeklyNewsletterBatch(activeDb, {
      batchSize: batchSize ? Number(batchSize) : 50,
      dryRun: Boolean(dryRun),
    });

    return sendSuccess(res, {
      message: "Weekly newsletter processing completed.",
      ...result,
    });
  } catch (error: any) {
    console.error("Error triggering weekly newsletter:", error);
    return sendError(res, "Failed to execute weekly newsletter dispatch.", 500);
  }
};

/**
 * Preview Weekly Newsletter for current user or given email/skills
 */
export const previewNewsletter = async (req: Request, res: Response) => {
  try {
    const activeDb = dbQuery || dbCommand;
    const user = {
      email: req.body?.email || req.user?.email || "preview@yuvahub.xyz",
      name: req.body?.name || req.user?.name || "Student Innovator",
      skills: req.body?.skills || req.user?.skills || ["React", "TypeScript", "Python"],
      field: req.body?.field || "Software Engineering",
    };

    let allOpps: any[] = [];
    if (activeDb) {
      allOpps = await activeDb.collection("opportunities").find({}).limit(50).toArray();
    }
    if (!allOpps || allOpps.length === 0) {
      allOpps = CURATED_FALLBACKS;
    }

    const topOpps = rankOpportunitiesForUser(allOpps, user, 5);
    const intro = await generateNewsletterIntro(user, topOpps);
    const baseUrl = config.APP_URL || "https://yuvahub.xyz";
    const unsubUrl = `${baseUrl}/api/v1/newsletter/unsubscribe?email=${encodeURIComponent(user.email)}`;
    const html = buildNewsletterHtml(user, intro, topOpps, unsubUrl);

    return sendSuccess(res, {
      recipient: user,
      intro,
      opportunities: topOpps,
      html,
    });
  } catch (error: any) {
    console.error("Error generating newsletter preview:", error);
    return sendError(res, "Failed to generate newsletter preview.", 500);
  }
};

/**
 * Unsubscribe / Update User Newsletter Preferences
 */
export const unsubscribeNewsletter = async (req: Request, res: Response) => {
  const email = (req.query.email as string) || req.body?.email;

  if (!email) {
    return res.status(400).send(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #dc2626;">Invalid Request</h2>
          <p>Email address parameter is missing.</p>
        </body>
      </html>
    `);
  }

  try {
    const activeDb = dbCommand || dbQuery;
    if (activeDb) {
      await activeDb.collection("users").updateMany(
        { email: { $regex: new RegExp(`^${email}$`, "i") } },
        { $set: { newsletter_subscribed: false, unsubscribed_at: new Date() } }
      );
    }

    if (req.headers.accept?.includes("application/json")) {
      return sendSuccess(res, { message: `Successfully unsubscribed ${email} from weekly newsletters.` });
    }

    // Return clean user-facing unsubscribe confirmation page
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed from YuvaHub Newsletter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 40px 16px; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 80vh;">
        <div style="max-width: 480px; width: 100%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <div style="width: 52px; height: 52px; background: #fee2e2; color: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; font-size: 24px; font-weight: bold;">
            &check;
          </div>
          <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">You're Unsubscribed</h2>
          <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 24px 0;">
            <strong>${email}</strong> has been successfully removed from our weekly opportunity dispatch. You won't receive these emails anymore.
          </p>
          <a href="${config.APP_URL || "https://yuvahub.xyz"}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 20px; border-radius: 8px;">
            Return to YuvaHub
          </a>
        </div>
      </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Error updating newsletter unsubscribe:", error);
    return res.status(500).send("Internal error while processing unsubscribe.");
  }
};
