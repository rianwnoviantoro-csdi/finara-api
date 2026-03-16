import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { successResponse, SuccessResponse } from '../../utils/response';

export interface WithMeta<T> {
  data: T;
  meta: unknown;
}

function hasMetaShape<T>(value: unknown): value is WithMeta<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'meta' in value
  );
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((payload) => {
        if (hasMetaShape<T>(payload)) {
          return {
            ...successResponse(payload.data, payload.meta),
            statusCode: response.statusCode,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          ...successResponse(payload),
          statusCode: response.statusCode,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
