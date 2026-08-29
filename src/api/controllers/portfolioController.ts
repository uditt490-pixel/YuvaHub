import { Request, Response } from "express";
import { PortfolioService } from "../../services/portfolioService.js";
import { sendSuccess, sendError } from "../../lib/apiResponse.js";

/**
 * Controller for Customizable Portfolio Website Generator (#917)
 */
export const getPortfolioHandler = async (req: Request, res: Response) => {
  const rawUsername = req.params.username;
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;

  try {
    const payload = await PortfolioService.getPortfolioPayload(username);
    return res.status(200).json(payload);
  } catch (error: any) {
    if (error.statusCode === 404 || (error.message && error.message.includes("not found"))) {
      return res.status(404).json({ error: "Portfolio not found" });
    }
    console.error("Error fetching portfolio payload:", error);
    return res.status(500).json({ error: "Failed to fetch portfolio data" });
  }
};

export const updatePortfolioSettingsHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?.uid || (req.user as any)?._id || "user_demo";
  const { template, primaryColor, visibleSections } = req.body;

  try {
    const updated = await PortfolioService.updatePortfolioSettings(userId, {
      template,
      primaryColor,
      visibleSections,
    });

    return sendSuccess(res, {
      message: "Portfolio settings updated successfully.",
      settings: updated,
    });
  } catch (error) {
    console.error("Error updating portfolio settings:", error);
    return sendError(res, "Failed to update portfolio settings.", 500);
  }
};
