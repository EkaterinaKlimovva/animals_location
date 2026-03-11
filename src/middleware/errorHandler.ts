import type { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { Prisma } from '../generated/prisma/client';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  console.log(`[ERROR_HANDLER] Error occurred for ${req.method} ${req.originalUrl}:`, err);

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.log(`[ERROR_HANDLER] Prisma known error - code: ${err.code}`);
    if (err.code === 'P2025') {
      console.log('[ERROR_HANDLER] Returning 404 - Resource not found');
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    if (err.code === 'P2002') {
      console.log('[ERROR_HANDLER] Returning 409 - Unique constraint violation');
      res.status(409).json({ message: 'Unique constraint violation' });
      return;
    }
  }

  // Prisma validation error
  if (err instanceof Prisma.PrismaClientValidationError) {
    console.log('[ERROR_HANDLER] Prisma validation error - returning 400');
    res.status(400).json({ message: 'Validation error', details: String(err.message) });
    return;
  }

  // JSON parse error
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    console.log('[ERROR_HANDLER] JSON parse error - returning 400');
    res.status(400).json({ message: 'Invalid JSON' });
    return;
  }

  // Zod validation error
  if (err instanceof ZodError) {
    console.log('[ERROR_HANDLER] Zod validation error - returning 400');
    const errorMessages: string[] = err.issues.map((e: any) => e.message);
    res.status(400).json({ message: errorMessages.join(', ') });
    return;
  }

  // Fallback
  console.log('[ERROR_HANDLER] Unhandled error - returning 500');

  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
};
