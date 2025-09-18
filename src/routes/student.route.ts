import studentHandler from '#handler/student.handler.ts';
import { Router } from 'express';

const router = Router();

router.post('/', studentHandler.create);
router.get('/:id', studentHandler.get);

export default router;
