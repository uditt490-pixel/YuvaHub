import { Router } from 'express';
import { uploadDocument, generateShareLink, getUserDocuments } from '../controllers/documentController';

const router = Router();

router.post('/upload', uploadDocument);
router.get('/my-documents', getUserDocuments);
router.post('/:documentId/share', generateShareLink);

export default router;
