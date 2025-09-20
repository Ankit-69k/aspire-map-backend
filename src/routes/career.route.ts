import careerHandler from '../handler/career.handler.js';
import { Router } from 'express';

const router = Router();

router.post('/', careerHandler.create);
router.get('/:profileId', careerHandler.getByProfile);

export default router;
