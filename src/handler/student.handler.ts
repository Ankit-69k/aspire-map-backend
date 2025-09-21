import logger from '../config/logger.js';
import studentService from '../services/student.service.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { Request, Response } from 'express';

class StudentHandler {
  async create(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const student = await studentService.createStudent(name, email, password);
      const response = new ApiResponse(
        201,
        student,
        'Student created successfully'
      );
      logger.info('Student created successfully', { studentId: student.id });
      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Error creating student', error);
      const err = new ApiError(400, 'Something went wrong', error.errors || []);
      res.status(400).json(err);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const student = await studentService.getStudentByEmailAndPassword(
        email,
        password
      );
      const response = new ApiResponse(
        200,
        student,
        'Student logged in successfully'
      );
      logger.info('Student logged in successfully', { studentId: student.id });
      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error logging in student', error);
      const err = new ApiError(400, 'Something went wrong', error.errors || []);
      res.status(400).json(err);
    }
  }

  async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = await studentService.getStudentById(id);
      if (!student) {
        const err = new ApiError(404, 'Student not found');
        logger.warn('Student not found', { studentId: id });
        return res.status(404).json(err);
      }
      logger.info('Student retrieved successfully', { studentId: id });
      const response = new ApiResponse(
        200,
        student,
        'Student retrieved successfully'
      );
      res.status(200).json(response);
    } catch (error: any) {
      logger.error('Error retrieving student', error);
      const err = new ApiError(400, 'Something went wrong', error.errors || []);
      res.status(400).json(err);
    }
  }
}

export default new StudentHandler();
