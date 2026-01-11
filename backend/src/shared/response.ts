import { NextFunction, Request, Response } from 'express';

type SuccessPayload<T> = {
  status: 'success';
  data: T;
};

type ErrorPayload = {
  status: 'error';
  code: string;
  message: string;
  details?: unknown;
};

declare module 'express-serve-static-core' {
  interface Response {
    success<T>(data: T, statusCode?: number): Response<SuccessPayload<T>>;
    fail(
      payload: Omit<ErrorPayload, 'status'>,
      statusCode?: number,
    ): Response<ErrorPayload>;
  }
}

export const responseMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.success = function success<T>(
    data: T,
    statusCode = 200,
  ): Response<SuccessPayload<T>> {
    return this.status(statusCode).json({
      status: 'success',
      data,
    });
  };

  res.fail = function fail(
    payload: Omit<ErrorPayload, 'status'>,
    statusCode = 400,
  ): Response<ErrorPayload> {
    return this.status(statusCode).json({
      status: 'error',
      ...payload,
    });
  };

  next();
};
