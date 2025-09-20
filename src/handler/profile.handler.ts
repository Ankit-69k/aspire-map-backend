import logger from '#config/logger.ts';
import profileService from '#services/profile.service.ts';
import { ApiError } from '#utils/apiError.ts';
import { ApiResponse } from '#utils/apiResponse.ts';
import { Request, Response } from 'express';

class ProfileHandler {
  /**
   * Create a new profile for a student
   */
  async create(req: Request, res: Response) {
    try {
      const { studentId, ...profileData } = req.body;

      if (!studentId) {
        const err = new ApiError(400, 'studentId is required');
        return res.status(400).json(err);
      }

      const profile = await profileService.createProfile(
        studentId,
        profileData
      );

      const response = new ApiResponse(
        201,
        profile,
        'Profile created successfully'
      );
      logger.info('Profile created successfully', { studentId });
      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Error creating profile', error);
      const err = new ApiError(400, 'Something went wrong', error.errors || []);
      res.status(400).json(err);
    }
  }

  /**
   * Get a student's complete profile
   */
  async get(req: Request, res: Response) {
    try {
      const { studentId } = req.params;

      if (!studentId) {
        const err = new ApiError(400, 'studentId is required');
        return res.status(400).json(err);
      }

      const profile = await profileService.getCompleteProfile(studentId);

      if (!profile) {
        const err = new ApiError(404, 'Profile not found');
        logger.warn('Profile not found', { studentId });
        return res.status(404).json(err);
      }

      const response = new ApiResponse(
        200,
        profile,
        'Profile retrieved successfully'
      );
      logger.info('Profile retrieved successfully', { studentId });
      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error retrieving profile', error);
      const err = new ApiError(400, 'Something went wrong', error.errors || []);
      res.status(400).json(err);
    }
  }
}

export default new ProfileHandler();
