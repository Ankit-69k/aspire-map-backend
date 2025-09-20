import llmHandler from '#handler/llm.handler.ts';
import { Router } from 'express';
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/resumeUpload', upload.single('file'), (req, res) =>
  llmHandler.parseResume(req, res)
);

router.post('/careerRecommendations', (req, res) =>
  llmHandler.generateCareerRecommendations(req, res)
);

export default router;
