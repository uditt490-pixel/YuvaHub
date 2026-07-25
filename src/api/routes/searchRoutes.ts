import { Router } from "express";
import { searchHandler } from "../controllers/searchController.js";

const router = Router();

router.get("/search", searchHandler);
// We will alias /api/opportunities/search in the main router

export default router;
