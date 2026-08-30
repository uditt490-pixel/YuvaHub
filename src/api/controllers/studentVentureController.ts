import { Request, Response } from "express";
import { StudentVentureEngine } from "../../services/studentVentureEngine.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";

/**
 * Controller for Student Ventures & Campus Startup Capital Suite
 */
export const getVentures = async (req: Request, res: Response) => {
  const { campusName, sectorDomain, fundingStage, search } = req.query;

  const filters = {
    campusName: typeof campusName === 'string' ? campusName : undefined,
    sectorDomain: typeof sectorDomain === 'string' ? sectorDomain : undefined,
    fundingStage: typeof fundingStage === 'string' ? fundingStage : undefined,
    search: typeof search === 'string' ? search : undefined,
  };

  const results = await StudentVentureEngine.getVentures(filters);
  return sendSuccess(res, { data: results, count: results.length });
};

export const registerVenture = async (req: Request, res: Response) => {
  const {
    startupName,
    campusName,
    founderStudentName,
    sectorDomain,
    fundingStage,
    targetInvestmentUsd,
    pitchSummary,
  } = req.body;

  if (!startupName || !campusName || !founderStudentName || !sectorDomain || !fundingStage) {
    throw AppError.badRequest("Missing required student venture fields");
  }

  const created = await StudentVentureEngine.registerVenture({
    startupName,
    campusName,
    founderStudentName,
    sectorDomain,
    fundingStage,
    targetInvestmentUsd: Number(targetInvestmentUsd) || 25000,
    pitchSummary: pitchSummary || "",
  });

  return sendSuccess(res, { data: created }, 201);
};

export const commitVentureInvestment = async (req: Request, res: Response) => {
  const paramId = req.params.id;
  const id = Array.isArray(paramId) ? paramId[0] : paramId;
  const { investmentAmountUsd, investorName } = req.body;

  if (!id) throw AppError.badRequest("Venture ID is required");
  if (!investmentAmountUsd || Number(investmentAmountUsd) <= 0) {
    throw AppError.badRequest("Valid investment amount is required");
  }

  const updated = await StudentVentureEngine.investInVenture(
    id,
    Number(investmentAmountUsd),
    investorName || "Angel Syndicate"
  );

  if (!updated) {
    throw AppError.notFound("Student venture startup not found");
  }

  return sendSuccess(res, { data: updated });
};
