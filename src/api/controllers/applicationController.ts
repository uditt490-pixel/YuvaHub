import { Request, Response } from "express";
import { generateApplicationDraft } from "../../services/applicationGenerator.js";
import { addApplicationJob } from "../../queues/applicationQueue.js";

export const generateDraft = async (req: Request, res: Response) => {
  try {
    const { opportunity, profile } = req.body;

    if (!opportunity?.title) {
      return res.status(400).json({ error: "Opportunity details required" });
    }

    const draft = await generateApplicationDraft({
      opportunityTitle: opportunity.title,
      organization: opportunity.organization || opportunity.org,
      profile
    });

    return res.json({ success: true, content: draft });
  } catch (error) {
    console.error("Application draft generation failed:", error);
    return res.status(500).json({ error: "Failed to generate application draft" });
  }
};

export const queueApplication = async (req: Request, res: Response) => {
  try {
    const job = await addApplicationJob({
      userId: req.body.userId,
      opportunityId: req.body.opportunityId,
      opportunityTitle: req.body.opportunityTitle,
      organization: req.body.organization,
      profile: req.body.profile,
      action: req.body.action || "generate_draft"
    });

    return res.json({ success: true, jobId: job.id });
  } catch (error) {
    console.error("Application queue error:", error);
    return res.status(500).json({ error: "Unable to queue application" });
  }
};
