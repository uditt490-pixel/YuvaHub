import { Router } from 'express';
import { generateRoadmap, updateNodeStatus } from '../controllers/roadmapController';
// import { authenticate } from '../../middleware/auth'; // Assume this exists

const router = Router();

// router.use(authenticate);
router.post('/generate', generateRoadmap);
router.patch('/update-node', updateNodeStatus);

export default router;
