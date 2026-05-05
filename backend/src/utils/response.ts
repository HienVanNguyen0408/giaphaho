import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  errors?: unknown[];
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = '',
  statusCode = 200,
): void => {
  res.status(statusCode).json({ success: true, data, message } satisfies ApiResponse<T>);
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created'): void => {
  sendSuccess(res, data, message, 201);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown[],
): void => {
  res.status(statusCode).json({ success: false, data: null, message, errors } satisfies ApiResponse);
};
