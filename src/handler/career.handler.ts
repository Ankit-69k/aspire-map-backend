import { Request, Response } from 'express';
import { ApiError } from '#utils/apiError.ts';
import careerService from '#services/career.service.ts';
import { ApiResponse } from '#utils/apiResponse.ts';
import logger from '#config/logger.ts';

class CareerHandler {
  async create(req: Request, res: Response) {
    try {
      const { profileId, careerData } = req.body;
      if (!profileId || !careerData) {
        const err = new ApiError(400, 'profileId and careerData are required');
        return res.status(400).json(err);
      }
      const career = await careerService.createCareer(profileId, careerData);
      const response = new ApiResponse(
        201,
        career,
        'Career created successfully'
      );
      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Error creating career', error);
      const err = new ApiError(400, 'Something went wrong', error.errors || []);
      res.status(400).json(err);
    }
  }

  async getByProfile(req: Request, res: Response) {
    try {
      const { profileId } = req.params;
      if (!profileId) {
        const err = new ApiError(400, 'profileId is required');
        return res.status(400).json(err);
      }
      const careers = await careerService.getCareersByProfile(profileId);
      const response = new ApiResponse(
        200,
        careers,
        'Careers fetched successfully'
      );
      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error fetching careers', error);
      const err = new ApiError(400, 'Something went wrong', error.errors || []);
      res.status(400).json(err);
    }
  }
}

export default new CareerHandler();
