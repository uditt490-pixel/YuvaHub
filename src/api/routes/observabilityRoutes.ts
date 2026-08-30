import { Router } from "express";
import {
  getObservabilityMetrics,
  getObservabilityIncidents,
  getObservabilitySLA,
} from "../controllers/observabilityController.js";

const router = Router();

router.get("/observability/metrics", getObservabilityMetrics);
router.get("/observability/incidents", getObservabilityIncidents);
router.get("/observability/sla", getObservabilitySLA);

export default router;
