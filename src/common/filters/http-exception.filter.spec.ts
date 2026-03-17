import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { AppError } from '../errors/app-error';
import { NotFoundError } from '../errors/not-found.error';
import { ValidationError } from '../errors/validation.error';
import { AuthenticationError } from '../errors/authentication.error';
import { ConflictError } from '../errors/conflict.error';

const mockJson = jest.fn();
const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
const mockWarn = jest.fn();
const mockError = jest.fn();

const mockGetResponse = jest.fn().mockReturnValue({
  status: mockStatus,
});
const mockGetRequest = jest.fn().mockReturnValue({
  method: 'GET',
  url: '/api/v1/test',
});

const mockHost = {
  switchToHttp: () => ({
    getResponse: mockGetResponse,
    getRequest: mockGetRequest,
  }),
} as unknown as ArgumentsHost;

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    jest
      .spyOn((filter as any)['logger'], 'error')
      .mockImplementation(mockError);
    jest.spyOn((filter as any)['logger'], 'warn').mockImplementation(mockWarn);
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
    mockStatus.mockReturnValue({ json: mockJson });
    mockGetResponse.mockReturnValue({ status: mockStatus });
    mockGetRequest.mockReturnValue({ method: 'GET', url: '/api/v1/test' });
  });

  describe('AppError subclasses', () => {
    it('handles NotFoundError → 404 with NOT_FOUND code', () => {
      filter.catch(new NotFoundError('User not found'), mockHost);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'User not found',
          code: 'NOT_FOUND',
          statusCode: 404,
        }),
      );
    });

    it('handles ValidationError → 400', () => {
      filter.catch(new ValidationError(), mockHost);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        }),
      );
    });

    it('handles AuthenticationError → 401', () => {
      filter.catch(new AuthenticationError('Token expired'), mockHost);
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, statusCode: 401 }),
      );
    });

    it('handles ConflictError → 409', () => {
      filter.catch(new ConflictError('Email already exists'), mockHost);
      expect(mockStatus).toHaveBeenCalledWith(409);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'CONFLICT',
          statusCode: 409,
        }),
      );
    });

    it('handles custom AppError with custom statusCode', () => {
      filter.catch(
        new AppError('Custom error', 422, 'UNPROCESSABLE'),
        mockHost,
      );
      expect(mockStatus).toHaveBeenCalledWith(422);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'UNPROCESSABLE' }),
      );
    });
  });

  describe('NestJS HttpException', () => {
    it('handles HttpException with string message', () => {
      filter.catch(
        new HttpException('Not allowed', HttpStatus.FORBIDDEN),
        mockHost,
      );
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, statusCode: 403 }),
      );
    });

    it('handles HttpException with object message', () => {
      filter.catch(
        new HttpException(
          { message: 'Bad request details', statusCode: 400 },
          400,
        ),
        mockHost,
      );
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Bad request details',
        }),
      );
    });
  });

  describe('Unknown errors', () => {
    it('handles unknown error → 500 INTERNAL_SERVER_ERROR', () => {
      filter.catch(new Error('Something crashed'), mockHost);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'INTERNAL_SERVER_ERROR',
          statusCode: 500,
        }),
      );
    });

    it('handles non-Error thrown values → 500', () => {
      filter.catch('a plain string thrown', mockHost);
      expect(mockStatus).toHaveBeenCalledWith(500);
    });
  });

  describe('Response shape', () => {
    it('never includes timestamp and path', () => {
      filter.catch(new NotFoundError(), mockHost);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const payload = mockJson.mock.calls[0][0] as Record<string, unknown>;
      expect(payload).not.toHaveProperty('timestamp');
      expect(payload).not.toHaveProperty('path');
    });
  });
});
