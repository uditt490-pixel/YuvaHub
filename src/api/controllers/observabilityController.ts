import { Request, Response } from "express";
import { ObservabilityService } from "../../services/ObservabilityService.js";
import { sendSuccess, sendError } from "../../lib/apiResponse.js";

/**
 * Controller for Enterprise Observability & Uptime Monitor Hub (#851)
 */
export const getObservabilityMetrics = async (req: Request, res: Response) => {
  try {
    const metrics = ObservabilityService.getServiceMetrics();
    const health = ObservabilityService.getSystemHealthScore();
    return sendSuccess(res, { metrics, health });
  } catch (error) {
    console.error("Error fetching observability metrics:", error);
    return sendError(res, "Failed to fetch observability metrics.", 500);
  }
};

export const getObservabilityIncidents = async (req: Request, res: Response) => {
  try {
    const incidents = ObservabilityService.getActiveIncidents();
    return sendSuccess(res, { incidents });
  } catch (error) {
    console.error("Error fetching observability incidents:", error);
    return sendError(res, "Failed to fetch observability incidents.", 500);
  }
};

export const getObservabilitySLA = async (req: Request, res: Response) => {
  try {
    const sla = ObservabilityService.getSLATracking();
    return sendSuccess(res, { sla });
  } catch (error) {
    console.error("Error fetching SLA tracking:", error);
    return sendError(res, "Failed to fetch SLA tracking.", 500);
  }
};
