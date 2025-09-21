import { Request, Response } from 'express';
import logger from '../config/logger.js';
import llmService from '../services/llm.service.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
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

  async generateCareerRecommendations(req: Request, res: Response) {
    try {
      const { profileId } = req.body;

      if (!profileId) {
        throw new ApiError(400, 'profileText is required');
      }

      const recommendations =
        await llmService.generateCareerRecommendations(profileId);

      const response = new ApiResponse(
        200,
        { recommendations },
        'Career recommendations generated successfully'
      );
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error generating career recommendations', error);
      const err = new ApiError(400, error.message || 'Something went wrong');
      return res.status(400).json(err);
    }
  }

  async generateCareerRoadmap(req: Request, res: Response) {
    try {
      const { studentId } = req.body;

      if (!studentId) {
        throw new ApiError(400, 'Profile Id required');
      }

      const roadmap = await llmService.generateCareerRoadmap(studentId);

      const response = new ApiResponse(
        200,
        { roadmap },
        'Career roadmap generated successfully'
      );
      return res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error generating career roadmap', error);
      const err = new ApiError(400, error.message || 'Something went wrong');
      return res.status(400).json(err);
    }
  }
}

export default new LLMHandler();
