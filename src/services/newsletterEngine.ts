import { getGenAI, getAIFallback } from "../api/genai.js";
import { emailService } from "./emailService.js";
import { CURATED_FALLBACKS } from "./staticFallbacks.js";
import { config } from "../config/env.js";

export interface NewsletterRecipient {
  uid?: string;
  email: string;
  name?: string;
  skills?: string[] | string;
  field?: string;
  interests?: string[];
  newsletter_subscribed?: boolean;
}

export interface NewsletterOpportunity {
  id: string;
  title: string;
  organization: string;
  type: string;
  location?: string;
  stipend?: string;
  deadline?: string;
  apply_link?: string;
  tags?: string[];
  description?: string;
}

/**
 * Generate a personalized 2-sentence AI intro based on student skills and background
 */
export async function generateNewsletterIntro(
  recipient: NewsletterRecipient,
  opportunities: NewsletterOpportunity[]
): Promise<string> {
  const name = recipient.name || "there";
  const skills = Array.isArray(recipient.skills)
    ? recipient.skills.join(", ")
    : recipient.skills || "Engineering, Software Development";
  const oppTitles = opportunities.map(o => o.title).slice(0, 3).join(", ");

  const fallbackIntro = `Hi ${name}, here are 5 curated opportunities handpicked for your background in ${skills} this week. Explore top roles including ${oppTitles} to accelerate your career!`;

  const ai = getGenAI();
  if (!ai) {
    return fallbackIntro;
  }

  try {
    const prompt = `You are a personalized career advisor for YuvaHub. Write a concise, energetic 2-sentence personalized newsletter intro paragraph for a student.

Student Name: ${name}
Student Skills/Interests: ${skills}
Top Curated Opportunities For Them This Week: ${oppTitles}

Requirements:
- Exactly 2 sentences.
- Enthusiastic, direct, actionable.
- Mention their skills or top opportunities naturally.
- Return ONLY the 2-sentence plain text paragraph.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text?.trim();
    return text && text.length > 20 ? text : fallbackIntro;
  } catch (err) {
    return fallbackIntro;
  }
}

/**
 * Build clean, responsive HTML email template for the weekly newsletter
 */
export function buildNewsletterHtml(
  recipient: NewsletterRecipient,
  introText: string,
  opportunities: NewsletterOpportunity[],
  unsubscribeUrl: string
): string {
  const name = recipient.name || "Student";
  const baseUrl = config.APP_URL || "https://yuvahub.xyz";

  const oppCardsHtml = opportunities
    .map(
      (opp, idx) => `
    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <span style="background-color: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: 6px;">
          #${idx + 1} &bull; ${opp.type || "Opportunity"}
        </span>
        ${opp.deadline ? `<span style="font-size: 11px; color: #dc2626; font-weight: 600;">Deadline: ${opp.deadline}</span>` : ""}
      </div>
      <h3 style="margin: 6px 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
        ${opp.title}
      </h3>
      <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #64748b;">
        ${opp.organization || "Verified Organization"} &bull; ${opp.location || "Remote / Hybrid"}
      </p>
      ${opp.description ? `<p style="margin: 0 0 12px 0; font-size: 12px; color: #475569; line-height: 1.5;">${opp.description.slice(0, 140)}...</p>` : ""}
      <div style="margin-top: 12px;">
        <a href="${opp.apply_link || `${baseUrl}`}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 8px;">
          View & Apply Direct &rarr;
        </a>
      </div>
    </div>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly YuvaHub Opportunities</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 16px;">
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #603620 0%, #231f20 100%); padding: 28px 24px; border-radius: 16px; text-align: center; color: #ffffff; margin-bottom: 20px;">
      <h1 style="margin: 0 0 6px 0; font-size: 24px; font-weight: 800; color: #f3e4bd;">YuvaHub Weekly Dispatch ✨</h1>
      <p style="margin: 0; font-size: 13px; color: #e8ded1;">Top 5 Handpicked Opportunities Tailored For You</p>
    </div>

    <!-- AI Personalized Greeting Card -->
    <div style="background-color: #ffffff; border: 1px solid #f3e4bd; border-left: 4px solid #603620; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b; font-weight: 500;">
        ${introText}
      </p>
    </div>

    <!-- Opportunities List -->
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 15px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">
        This Week's Top Matches
      </h2>
      ${oppCardsHtml}
    </div>

    <!-- Footer & Unsubscribe Mechanism -->
    <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
      <p style="margin: 0 0 8px 0;">You are receiving this personalized weekly digest because you are registered on YuvaHub.</p>
      <p style="margin: 0;">
        <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Manage Preferences or Unsubscribe</a> &bull; 
        <a href="${baseUrl}" style="color: #64748b; text-decoration: underline;">Explore YuvaHub</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Score & rank opportunities for a specific student profile
 */
export function rankOpportunitiesForUser(
  opportunities: any[],
  user: NewsletterRecipient,
  limit: number = 5
): NewsletterOpportunity[] {
  const userSkills = Array.isArray(user.skills)
    ? user.skills.map(s => s.toLowerCase().trim())
    : (user.skills || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);

  const userField = (user.field || "").toLowerCase().trim();

  const scored = opportunities.map(opp => {
    // Base popularity score (scaled 0-20 to avoid overshadowing profile match)
    let score = Math.min(20, (opp.registeredCount || 0) / 10);
    const tags = Array.isArray(opp.tags) ? opp.tags.map((t: string) => t.toLowerCase()) : [];
    const oppText = `${opp.title || ""} ${opp.description || ""} ${opp.category || ""} ${opp.type || ""}`.toLowerCase();

    // Match skills (strong weighting)
    userSkills.forEach(skill => {
      if (tags.some(t => t.includes(skill) || skill.includes(t)) || oppText.includes(skill)) {
        score += 60;
      }
    });

    // Match field
    if (userField && oppText.includes(userField)) {
      score += 40;
    }

    return {
      opp: {
        id: String(opp._id || opp.id),
        title: opp.title,
        organization: opp.organization || opp.org || "YuvaHub Partner",
        type: opp.type || opp.category || "Internship",
        location: opp.location || "Remote",
        stipend: opp.stipend || opp.salary,
        deadline: opp.deadline,
        apply_link: opp.apply_link || opp.applyUrl,
        tags: opp.tags,
        description: opp.description,
      },
      score,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.opp);
}

/**
 * Weekly Newsletter Batch Processing Engine
 * Iterates through users in batches (chunkSize) to prevent memory bottlenecks.
 */
export async function runWeeklyNewsletterBatch(
  db: any,
  options: { batchSize?: number; dryRun?: boolean } = {}
): Promise<{ processed: number; sent: number; skipped: number; errors: number }> {
  const batchSize = options.batchSize || 50;
  const dryRun = options.dryRun || false;

  let processed = 0;
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // 1. Fetch available opportunities
    let allOpps: any[] = [];
    if (db) {
      allOpps = await db.collection("opportunities").find({}).limit(100).toArray();
    }
    if (!allOpps || allOpps.length === 0) {
      allOpps = CURATED_FALLBACKS;
    }

    // 2. Query subscribed users count
    let totalUsers = 0;
    if (db) {
      totalUsers = await db.collection("users").countDocuments({
        $or: [
          { newsletter_subscribed: { $ne: false } },
          { newsletter_subscribed: { $exists: false } },
        ],
      });
    }

    let skip = 0;
    const hasDbUsers = totalUsers > 0;

    do {
      let userBatch: NewsletterRecipient[] = [];
      if (db && hasDbUsers) {
        userBatch = await db
          .collection("users")
          .find({
            $or: [
              { newsletter_subscribed: { $ne: false } },
              { newsletter_subscribed: { $exists: false } },
            ],
          })
          .skip(skip)
          .limit(batchSize)
          .toArray();
      } else {
        // Mock fallback recipient batch for testing
        userBatch = [
          {
            uid: "cand_1",
            email: "student@example.com",
            name: "Aarav Sharma",
            skills: ["React", "TypeScript", "Node.js"],
            field: "Full Stack Development",
            newsletter_subscribed: true,
          },
        ];
      }

      if (userBatch.length === 0) break;

      for (const user of userBatch) {
        processed++;
        if (!user.email || user.newsletter_subscribed === false) {
          skipped++;
          continue;
        }

        try {
          const topOpps = rankOpportunitiesForUser(allOpps, user, 5);
          const intro = await generateNewsletterIntro(user, topOpps);
          const baseUrl = config.APP_URL || "https://yuvahub.xyz";
          const unsubUrl = `${baseUrl}/api/v1/newsletter/unsubscribe?email=${encodeURIComponent(user.email)}`;

          const html = buildNewsletterHtml(user, intro, topOpps, unsubUrl);

          if (!dryRun) {
            await emailService.sendTransactionalNotification({
              to: user.email,
              subject: "🚀 Your Weekly YuvaHub Career & Opportunity Digest",
              body: intro,
              html,
            });
          }

          sent++;
        } catch (itemErr) {
          console.error(`[Newsletter Engine] Failed to dispatch to ${user.email}:`, itemErr);
          errors++;
        }
      }

      skip += batchSize;
    } while (hasDbUsers && skip < totalUsers);

    return { processed, sent, skipped, errors };
  } catch (err) {
    console.error("[Newsletter Engine] Fatal batch execution error:", err);
    throw err;
  }
}
