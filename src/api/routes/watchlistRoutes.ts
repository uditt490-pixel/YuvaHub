import { Router } from "express";
import { 
  getWatchlists, 
  createWatchlist, 
  updateWatchlist, 
  deleteWatchlist, 
  getWatchlistMatches 
} from "../controllers/watchlistController.js";
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

// Apply auth middleware to all watchlist routes
router.use(authMiddleware);

router.get("/", getWatchlists);
router.post("/", createWatchlist);
router.put("/:id", updateWatchlist);
router.delete("/:id", deleteWatchlist);
router.get("/:id/matches", getWatchlistMatches);

export default router;
