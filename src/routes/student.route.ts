import studentHandler from '../handler/student.handler.js';
import { Router } from 'express';

const router = Router();

router.post('/', studentHandler.create);
router.post('/login', studentHandler.login);
router.get('/:id', studentHandler.get);

export default router;
