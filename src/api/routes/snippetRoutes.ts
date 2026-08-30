import { Router } from 'express';
import { createSnippet, getSnippet, getPublicSnippets } from '../controllers/snippetController';

const router = Router();

router.post('/', createSnippet);
router.get('/public', getPublicSnippets);
router.get('/:id', getSnippet);

export default router;