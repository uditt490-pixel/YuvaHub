import { Router } from 'express';
import { requestCredential, getUserWallet, exportCredential } from '../controllers/credentialController';

const router = Router();

router.post('/request', requestCredential);
router.get('/wallet', getUserWallet);
router.get('/export/:credentialId', exportCredential);

export default router;
