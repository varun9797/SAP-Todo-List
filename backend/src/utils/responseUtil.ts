import { Response } from 'express';
import { ApiResponse } from '../types';
import { HTTP_STATUS, HttpStatusCode } from '../constants';

/**
 * Utility class for standardized API responses
 * Provides consistent response formatting across all controllers
 */
export class ResponseUtil {
  /**
   * Send a success response
   */
  static success<T = any>(
    res: Response<ApiResponse>,
    data?: T,
    message?: string,
    statusCode: HttpStatusCode = HTTP_STATUS.OK
  ): Response<ApiResponse> {
    return res.status(statusCode).json({
      success: true,
      data,
      message
    });
  }

  /**
   * Send an error response
   */
  static error(
    res: Response<ApiResponse>,
    error: string,
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR
  ): Response<ApiResponse> {
    return res.status(statusCode).json({
      success: false,
      error
    });
  }

  /**
   * Send a not found response
   */
  static notFound(
    res: Response<ApiResponse>,
    message: string
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, HTTP_STATUS.NOT_FOUND);
  }

  /**
   * Send a created response
   */
  static created<T = any>(
    res: Response<ApiResponse>,
    data: T,
    message: string
  ): Response<ApiResponse> {
    return ResponseUtil.success(res, data, message, HTTP_STATUS.CREATED);
  }

  /**
   * Send a bad request response
   */
  static badRequest(
    res: Response<ApiResponse>,
    message: string
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, HTTP_STATUS.BAD_REQUEST);
  }

  /**
   * Send an internal server error response
   */
  static internalServerError(
    res: Response<ApiResponse>,
    message: string
  ): Response<ApiResponse> {
    return ResponseUtil.error(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Logger utility for consistent error logging
 */
export class LoggerUtil {
  /**
   * Log error with consistent formatting
   */
  static error(message: string, error: any): void {
    console.error(message, error);
  }

  /**
   * Log info with consistent formatting
   */
  static info(message: string, data?: any): void {
    console.log(message, data);
  }

  /**
   * Log warning with consistent formatting
   */
  static warn(message: string, data?: any): void {
    console.warn(message, data);
  }
}
