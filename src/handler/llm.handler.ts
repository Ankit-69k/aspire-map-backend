import { Request, Response } from 'express';
import logger from '#config/logger.ts';
import llmService from '#services/llm.service.ts';
import { ApiError } from '#utils/apiError.ts';
import { ApiResponse } from '#utils/apiResponse.ts';
import fs from 'fs/promises';

class LLMHandler {
  async parseResume(req: Request, res: Response) {
    let filePath: string | null = null;

    try {
      if (!req.file) {
        throw new ApiError(400, 'No file uploaded');
      }

      filePath = req.file.path;
      const mimetype = req.file.mimetype;

      // Parse file with service
      const content = await llmService.parseResume(filePath, mimetype);

      const response = new ApiResponse(
        200,
        { content },
        'Resume parsed successfully'
      );
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error parsing resume', error);
      const err = new ApiError(400, error.message || 'Something went wrong');
      return res.status(400).json(err);
    } finally {
      // Always cleanup uploaded file
      if (filePath) {
        try {
          await fs.unlink(filePath);
        } catch (unlinkErr) {
          logger.error('Failed to delete temp file', unlinkErr);
        }
      }
    }
  }
}

export default new LLMHandler();
