export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: unknown;
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export const successResponse = <T = unknown>(
  data: T,
  meta?: unknown,
): SuccessResponse<T> => ({
  success: true,
  data,
  ...(meta !== undefined && { meta }),
});

export const errorResponse = (error: string, code?: string): ErrorResponse => ({
  success: false,
  error,
  ...(code && { code }),
});
