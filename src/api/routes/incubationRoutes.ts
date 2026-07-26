import { Router } from 'express';
import {
  createIncubationProject,
  getIncubationProjects,
  getIncubationProjectById,
  evaluateVentureWithAI
} from '../controllers/incubationController.js';

const router = Router();

router.post('/projects', createIncubationProject);
router.get('/projects', getIncubationProjects);
router.get('/projects/:id', getIncubationProjectById);
router.post('/ai-evaluate', evaluateVentureWithAI);

export default router;
