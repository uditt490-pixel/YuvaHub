import { Router } from "express";
import {
  getOpportunities,
  getTrendingOpportunities,
  semanticSearch,
  getLatestOpportunities,
  submitOpportunity,
  getOpportunityById,
  updateOpportunity,
  toggleBookmark,
  getSimilarOpportunities,
  getOpportunityCalendar,
  ingestOpportunity,
  compareOpportunities
} from "../controllers/opportunityController.js";
import { authMiddleware, adminOnly } from "../middlewares/auth.js";
import { cacheMiddleware } from "../middlewares/cacheMiddleware.js";
import { markdownNegotiation } from "../middlewares/markdownNegotiation.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { z } from "zod";

const submitOpportunitySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  organization: z.string().min(2).max(100),
  type: z.string().min(2),
  tags: z.array(z.string()).optional().default([]),
  link: z.string().url().optional(),
  deadline: z.string().optional(),
  eligibility: z.object({
    location: z.string().optional(),
  }).optional(),
  contactEmail: z.string().email().optional(),
});

const router = Router();

// ── New Ingestion Route ──────────────────────────────────────────────────
/**
 * @route   POST /api/opportunities/ingest
 * @desc    Ingest a new scraped opportunity into the deduplication queue
 * @access  Private (Scraper Service)
 */
router.post('/ingest', ingestOpportunity);

// ── Public & Cached Routes ───────────────────────────────────────────────
router.get("/opportunities", getOpportunities);
router.get("/opportunities/trending", cacheMiddleware(300), getTrendingOpportunities);
router.get("/opportunities/semantic-search", semanticSearch);
router.get("/opportunities/latest", getLatestOpportunities);

// ── Authenticated User Routes ────────────────────────────────────────────
router.post("/opportunities", authMiddleware, validateRequest(z.object({ body: submitOpportunitySchema })), submitOpportunity);
router.post("/opportunities/compare", authMiddleware, compareOpportunities);
router.post("/opportunities/:id/bookmark", authMiddleware, toggleBookmark);

// ── Specific Opportunity Routes ──────────────────────────────────────────
router.get("/opportunity/:id", cacheMiddleware(3600, (req: any) => `opportunity:${req.params.id}`), markdownNegotiation, getOpportunityById);
router.put("/opportunity/:id", authMiddleware, adminOnly, updateOpportunity);
router.get("/opportunities/:id/similar", cacheMiddleware(3600, (req: any) => `opportunity:${req.params.id}:similar`), getSimilarOpportunities);
router.get("/opportunities/:id/calendar", getOpportunityCalendar);

export default router;
