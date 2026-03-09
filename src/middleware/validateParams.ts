import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { handleControllerError } from '../utils/controllerUtils';

/**
 * Middleware factory for validating request parameters using Zod schemas
 * Returns 400 for validation errors before authorization checks
 */
export function validateParams<T>(schema: ZodSchema<T>, source: 'params' | 'query' | 'body' = 'params') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[source]);
      
      // Attach validated data to request for controllers to use
      (req as any).validatedData = data;
      
      next();
    } catch (error) {
      handleControllerError(res, error, 'VALIDATION_MIDDLEWARE');
    }
  };
}

/**
 * Middleware for validating multiple sources (params + body)
 * Useful for update operations that need both
 */
export function validateComposite<TParams, TBody>(
  paramsSchema: ZodSchema<TParams>,
  bodySchema: ZodSchema<TBody>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = paramsSchema.parse(req.params);
      const body = bodySchema.parse(req.body);
      
      // Attach both validated data sets to request
      (req as any).validatedParams = params;
      (req as any).validatedBody = body;
      
      next();
    } catch (error) {
      handleControllerError(res, error, 'VALIDATION_MIDDLEWARE');
    }
  };
}
