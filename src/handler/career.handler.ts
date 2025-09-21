import { Request, Response } from 'express';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import careerService from '../services/career.service.js';
import logger from '../config/logger.js';

class CareerHandler {
  async create(req: Request, res: Response) {
    try {
      const { studentId, careerData } = req.body;
      if (!studentId || !careerData) {
        const err = new ApiError(400, 'profileId and careerData are required');
        return res.status(400).json(err);
      }
      const career = await careerService.createCareer(studentId, careerData);
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
