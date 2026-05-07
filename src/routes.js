import { Router } from 'express';
import { handleFinalizado } from './controllers/webhookController.js';

const router = Router();

router.post('/webhook/finalizado', handleFinalizado);

export default router;
