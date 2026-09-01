import { Router } from 'express';
import {
  generateHackathonIdeas,
  createTeamWorkspace,
  getTeamWorkspace,
} from '../controllers/workspaceController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.post('/workspace/generate-ideas', generateHackathonIdeas);
router.post('/workspace', authMiddleware, createTeamWorkspace);
router.get('/workspace/:workspaceId', getTeamWorkspace);

export default router;
