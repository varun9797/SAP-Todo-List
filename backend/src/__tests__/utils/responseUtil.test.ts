import { ResponseUtil, LoggerUtil } from '../../utils/responseUtil';
import { Response } from 'express';
import { ApiResponse } from '../../types';
import { HTTP_STATUS } from '../../constants';

describe('ResponseUtil', () => {
  let res: Partial<Response<ApiResponse>>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    res = {
      status: mockStatus,
      json: mockJson
    };

    jest.clearAllMocks();
  });

  describe('success', () => {
    it('should send success response with default status code', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Operation successful';

      ResponseUtil.success(res as Response<ApiResponse>, data, message);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data,
        message
      });
    });

    it('should send success response with custom status code', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Created successfully';

      ResponseUtil.success(res as Response<ApiResponse>, data, message, HTTP_STATUS.CREATED);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data,
        message
      });
    });

    it('should send success response without data and message', () => {
      ResponseUtil.success(res as Response<ApiResponse>);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: undefined,
        message: undefined
      });
    });
  });

  describe('error', () => {
    it('should send error response with default status code', () => {
      const errorMessage = 'Something went wrong';

      ResponseUtil.error(res as Response<ApiResponse>, errorMessage);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: errorMessage
      });
    });

    it('should send error response with custom status code', () => {
      const errorMessage = 'Bad request';

      ResponseUtil.error(res as Response<ApiResponse>, errorMessage, HTTP_STATUS.BAD_REQUEST);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: errorMessage
      });
    });
  });

  describe('notFound', () => {
    it('should send not found response', () => {
      const message = 'Resource not found';

      ResponseUtil.notFound(res as Response<ApiResponse>, message);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: message
      });
    });
  });

  describe('created', () => {
    it('should send created response', () => {
      const data = { id: 1, name: 'New Item' };
      const message = 'Item created successfully';

      ResponseUtil.created(res as Response<ApiResponse>, data, message);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data,
        message
      });
    });
  });

  describe('badRequest', () => {
    it('should send bad request response', () => {
      const message = 'Invalid input data';

      ResponseUtil.badRequest(res as Response<ApiResponse>, message);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: message
      });
    });
  });

  describe('internalServerError', () => {
    it('should send internal server error response', () => {
      const message = 'Internal server error occurred';

      ResponseUtil.internalServerError(res as Response<ApiResponse>, message);

      expect(mockStatus).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: message
      });
    });
  });
});

describe('LoggerUtil', () => {
  let consoleSpy: jest.SpyInstance;

  afterEach(() => {
    if (consoleSpy) {
      consoleSpy.mockRestore();
    }
  });

  describe('error', () => {
    it('should log error messages', () => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const message = 'Error occurred';
      const error = new Error('Test error');

      LoggerUtil.error(message, error);

      expect(consoleSpy).toHaveBeenCalledWith(message, error);
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const message = 'Info message';
      const data = { key: 'value' };

      LoggerUtil.info(message, data);

      expect(consoleSpy).toHaveBeenCalledWith(message, data);
    });

    it('should log info messages without data', () => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const message = 'Info message';

      LoggerUtil.info(message);

      expect(consoleSpy).toHaveBeenCalledWith(message, undefined);
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const message = 'Warning message';
      const data = { warning: 'data' };

      LoggerUtil.warn(message, data);

      expect(consoleSpy).toHaveBeenCalledWith(message, data);
    });

    it('should log warning messages without data', () => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const message = 'Warning message';

      LoggerUtil.warn(message);

      expect(consoleSpy).toHaveBeenCalledWith(message, undefined);
    });
  });
});
