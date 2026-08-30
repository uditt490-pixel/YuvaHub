import { Router } from 'express';

import {
  getProfileData,
  upsertResumeDraftHandler,
  getResumeDraftHandler,
  generatePdfHandler,
} from '../controllers/resumeBuilderController.js';

const router = Router();



// Hydrate data from user profile
router.get('/profile/resume-data', getProfileData);

// Draft upsert and fetch
router.post('/draft', upsertResumeDraftHandler);
router.get('/draft', getResumeDraftHandler);

// Generate PDF
router.post('/generate-pdf', generatePdfHandler);

export default router;
