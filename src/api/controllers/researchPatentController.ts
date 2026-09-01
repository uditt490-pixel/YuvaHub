import { Request, Response } from "express";
import { ResearchPatentEngine } from "../../services/researchPatentEngine.js";
import { AppError } from "../../lib/AppError.js";
import { sendSuccess } from "../../lib/apiResponse.js";

export const getResearchPatents = async (req: Request, res: Response) => {
  const campusName = (req.query.campusName as string) || undefined;
  const technologyDomain = (req.query.technologyDomain as string) || undefined;
  const patentStatus = (req.query.patentStatus as string) || undefined;
  const search = (req.query.search as string) || undefined;

  const patents = await ResearchPatentEngine.getPatents({
    campusName,
    technologyDomain,
    patentStatus,
    search,
  });

  return sendSuccess(res, { patents, count: patents.length });
};

export const registerResearchPatent = async (req: Request, res: Response) => {
  const {
    patentTitle,
    campusName,
    leadInventorName,
    patentApplicationNumber,
    technologyDomain,
    licensingFeeUsd,
    royaltySharePercent,
    abstractDescription,
  } = req.body;

  if (
    !patentTitle ||
    !campusName ||
    !leadInventorName ||
    !patentApplicationNumber ||
    !technologyDomain ||
    licensingFeeUsd === undefined ||
    !abstractDescription
  ) {
    throw AppError.badRequest("Missing required patent registration fields");
  }

  const patent = await ResearchPatentEngine.registerPatent({
    patentTitle,
    campusName,
    leadInventorName,
    patentApplicationNumber,
    technologyDomain,
    licensingFeeUsd: Number(licensingFeeUsd),
    royaltySharePercent: Number(royaltySharePercent || 5.0),
    abstractDescription,
  });

  return sendSuccess(res, { patent }, 201);
};

export const executePatentLicensingAgreement = async (
  req: Request,
  res: Response
) => {
  const paramPatentId = req.params.patentId;
  const bodyPatentId = req.body.patentId;
  const patentId = (Array.isArray(paramPatentId) ? paramPatentId[0] : paramPatentId) || (Array.isArray(bodyPatentId) ? bodyPatentId[0] : bodyPatentId);
  const commercialPartnerName =
    req.body.commercialPartnerName || req.body.commercialPartner || "Intel Capital Technologies";

  if (!patentId) {
    throw AppError.badRequest("Missing patentId parameter");
  }

  const updatedPatent = await ResearchPatentEngine.executeLicensingAgreement(
    patentId as string,
    commercialPartnerName
  );

  if (!updatedPatent) {
    throw AppError.notFound("Research patent record not found");
  }

  return sendSuccess(res, {
    patent: updatedPatent,
    message: "Licensing agreement executed successfully",
  });
};
