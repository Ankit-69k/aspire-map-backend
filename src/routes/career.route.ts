import careerHandler from '#handler/career.handler.ts';
import { Router } from 'express';

const router = Router();

router.post('/', careerHandler.create);
router.get('/:profileId', careerHandler.getByProfile);

export default router;
