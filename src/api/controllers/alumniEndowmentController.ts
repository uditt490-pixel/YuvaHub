import { Request, Response } from "express";
import { AlumniEndowmentEngine } from "../../services/alumniEndowmentEngine.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";

export const getAlumniEndowments = async (req: Request, res: Response) => {
  const campusName = (req.query.campusName as string) || undefined;
  const fundCategory = (req.query.fundCategory as string) || undefined;
  const grantStatus = (req.query.grantStatus as string) || undefined;
  const search = (req.query.search as string) || undefined;

  const endowments = await AlumniEndowmentEngine.getEndowments({
    campusName,
    fundCategory,
    grantStatus,
    search,
  });

  return sendSuccess(res, { endowments, count: endowments.length });
};

export const createAlumniEndowment = async (req: Request, res: Response) => {
  const {
    fundName,
    campusName,
    donorName,
    donorAlumniBatchYear,
    fundCategory,
    targetAmountUsd,
    initialContributionUsd,
    matchingGrantEnabled,
    matchingRatio,
    description,
  } = req.body;

  if (
    !fundName ||
    !campusName ||
    !donorName ||
    donorAlumniBatchYear === undefined ||
    !fundCategory ||
    targetAmountUsd === undefined ||
    initialContributionUsd === undefined ||
    !description
  ) {
    throw AppError.badRequest("Missing required alumni endowment fields");
  }

  const endowment = await AlumniEndowmentEngine.createEndowment({
    fundName,
    campusName,
    donorName,
    donorAlumniBatchYear: Number(donorAlumniBatchYear),
    fundCategory,
    targetAmountUsd: Number(targetAmountUsd),
    initialContributionUsd: Number(initialContributionUsd),
    matchingGrantEnabled: Boolean(matchingGrantEnabled),
    matchingRatio: matchingRatio !== undefined ? Number(matchingRatio) : 1.5,
    description,
  });

  return sendSuccess(res, { endowment }, 201);
};

export const contributeToAlumniEndowment = async (
  req: Request,
  res: Response
) => {
  const paramFundId = req.params.fundId;
  const bodyFundId = req.body.fundId;
  const fundId = (Array.isArray(paramFundId) ? paramFundId[0] : paramFundId) || (Array.isArray(bodyFundId) ? bodyFundId[0] : bodyFundId);
  const donationAmountUsd = Number(
    req.body.donationAmountUsd || req.body.amountUsd || 1000
  );

  if (!fundId) {
    throw AppError.badRequest("Missing fundId parameter");
  }

  if (isNaN(donationAmountUsd) || donationAmountUsd <= 0) {
    throw AppError.badRequest("Invalid contribution amount specified");
  }

  const updatedFund = await AlumniEndowmentEngine.contributeToFund(
    fundId as string,
    donationAmountUsd
  );

  if (!updatedFund) {
    throw AppError.notFound("Alumni endowment fund not found");
  }

  return sendSuccess(res, {
    endowment: updatedFund,
    message: "Micro-grant contribution processed successfully",
  });
};
