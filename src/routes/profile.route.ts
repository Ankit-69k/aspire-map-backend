import profileHandler from '#handler/profile.handler.ts';
import { Router } from 'express';

const router = Router();

router.post('/', profileHandler.create);
router.get('/:studentId', profileHandler.get);

export default router;
