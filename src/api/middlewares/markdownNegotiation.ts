import express from "express";
import { dbQuery } from "../db.js";
import { safeObjectId } from "../../lib/utils.js";

/**
 * Content negotiation middleware for AI agents requesting text/markdown.
 * If Accept header includes text/markdown, serves markdown content instead of HTML.
 */
export const markdownNegotiation = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.method === "GET" && req.headers.accept && req.headers.accept.includes("text/markdown")) {
    if (req.path.startsWith("/api/") || req.path.startsWith("/.well-known/")) {
      return next();
    }

    const oppMatch = req.path.match(/^\/opportunity\/([^\/]+)/);
    if (oppMatch && dbQuery) {
      const id = oppMatch[1];
      try {
        const oid = safeObjectId(id);
        const query = oid ? { _id: oid } : { id: id };
        const item = await dbQuery.collection("opportunities").findOne(query);
        if (item) {
          let md = `# ${item.title}\n\n`;
          md += `**Organization:** ${item.org || item.organization || 'Unknown'}\n`;
          md += `**Category:** ${item.category || item.type || 'Opportunity'}\n`;
          if (item.deadline) {
            md += `**Deadline:** ${item.deadline}\n`;
          }
          md += `\n${item.description || "No description provided."}\n\n`;
          md += `[Apply Here](${item.applyLink || item.apply_link || ""})`;

          res.set("Content-Type", "text/markdown");
          res.set("x-markdown-tokens", "150");
          return res.send(md);
        }
      } catch (e) {
        // Ignore and fallback to generic
      }
    }

    const genericMd = `# YuvaHub\n\nYuvaHub is a discovery platform for hackathons, internships, scholarships, and open source programs tailored for students.\n\nExplore opportunities at https://yuvahub.xyz`;
    res.set("Content-Type", "text/markdown");
    res.set("x-markdown-tokens", "25");
    return res.send(genericMd);
  }
  next();
};
