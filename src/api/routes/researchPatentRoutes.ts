import { Router } from "express";
import {
  executePatentLicensingAgreement,
  getResearchPatents,
  registerResearchPatent,
} from "../controllers/researchPatentController.js";

const router = Router();

router.get("/campus/patents", getResearchPatents);
router.post("/campus/patents", registerResearchPatent);
router.post("/campus/patents/:patentId/license", executePatentLicensingAgreement);

export default router;
