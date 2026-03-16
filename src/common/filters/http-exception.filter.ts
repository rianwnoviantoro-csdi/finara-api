import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from '../errors/app-error';
import { errorResponse } from '../../utils/response';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let code: string | undefined;

    if (exception instanceof AppError) {
      status = exception.statusCode;
      message = exception.message;
      code = exception.errorCode;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const httpResponse = exception.getResponse();
      message =
        typeof httpResponse === 'object' &&
        httpResponse !== null &&
        'message' in httpResponse
          ? String((httpResponse as { message: unknown }).message)
          : typeof httpResponse === 'string'
            ? httpResponse
            : JSON.stringify(httpResponse);
      code =
        (Object.keys(HttpStatus) as Array<keyof typeof HttpStatus>).find(
          (k) => HttpStatus[k] === (status as HttpStatus),
        ) ?? 'HTTP_ERROR';
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      code = 'INTERNAL_SERVER_ERROR';
    }

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} → ${status}: ${message}`,
      );
    }

    res.status(status).json({
      ...errorResponse(message, code),
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
