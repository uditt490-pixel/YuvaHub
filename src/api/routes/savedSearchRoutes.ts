import { Router } from "express";
import { 
  getSavedSearches, 
  createSavedSearch, 
  updateSavedSearch, 
  deleteSavedSearch, 
  previewSavedSearch 
} from "../controllers/savedSearchController.js";
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get("/saved-searches", getSavedSearches);
router.post("/saved-searches", createSavedSearch);
router.put("/saved-searches/:id", updateSavedSearch);
router.delete("/saved-searches/:id", deleteSavedSearch);
router.post("/saved-searches/preview", previewSavedSearch);

export default router;
