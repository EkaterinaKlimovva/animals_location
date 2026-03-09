import type { Request, Response, NextFunction, RequestHandler } from 'express';

// Wraps an async route handler and forwards errors to Express error middleware
export function asyncHandler<TReq extends Request = Request, TRes extends Response = Response>(
  fn: (req: TReq, res: TRes, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as TReq, res as TRes, next)).catch(next);
  };
}
