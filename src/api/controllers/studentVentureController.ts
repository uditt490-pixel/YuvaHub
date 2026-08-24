import { Request, Response } from "express";
import { StudentVentureEngine } from "../../services/studentVentureEngine.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";

export const getStudentVentures = async (req: Request, res: Response) => {
  const campusName = (req.query.campusName as string) || undefined;
  const sectorDomain = (req.query.sectorDomain as string) || undefined;
  const fundingStage = (req.query.fundingStage as string) || undefined;
  const search = (req.query.search as string) || undefined;

  const ventures = await StudentVentureEngine.getVentures({
    campusName,
    sectorDomain,
    fundingStage,
    search,
  });

  return sendSuccess(res, { ventures, count: ventures.length });
};

export const registerStudentVenture = async (req: Request, res: Response) => {
  const {
    startupName,
    campusName,
    studentFounderName,
    sectorDomain,
    fundingStage,
    targetInvestmentUsd,
    pitchDeckUrl,
    executiveSummary,
  } = req.body;

  if (
    !startupName ||
    !campusName ||
    !studentFounderName ||
    !sectorDomain ||
    !fundingStage ||
    targetInvestmentUsd === undefined ||
    !executiveSummary
  ) {
    throw AppError.badRequest("Missing required student venture registration fields");
  }

  const venture = await StudentVentureEngine.registerVenture({
    startupName,
    campusName,
    studentFounderName,
    sectorDomain,
    fundingStage,
    targetInvestmentUsd: Number(targetInvestmentUsd),
    pitchDeckUrl: pitchDeckUrl || "#",
    executiveSummary,
  });

  return sendSuccess(res, { venture }, 201);
};

export const commitStudentVentureInvestment = async (
  req: Request,
  res: Response
) => {
  const ventureId = (req.params.ventureId as string) || (req.body.ventureId as string);
  const investmentAmountUsd = Number(
    req.body.investmentAmountUsd || req.body.amountUsd || 1000
  );

  if (!ventureId) {
    throw AppError.badRequest("Missing ventureId parameter");
  }

  if (isNaN(investmentAmountUsd) || investmentAmountUsd <= 0) {
    throw AppError.badRequest("Invalid investment amount specified");
  }

  const updatedVenture = await StudentVentureEngine.commitInvestment(
    ventureId as string,
    investmentAmountUsd
  );

  if (!updatedVenture) {
    throw AppError.notFound("Student venture startup not found");
  }

  return sendSuccess(res, {
    venture: updatedVenture,
    message: "Capital investment committed successfully",
  });
};
