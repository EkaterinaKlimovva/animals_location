import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { ParamsDictionary } from 'express-serve-static-core';

export const validateParams = (schema: z.ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validatedData = schema.parse(data);

      // Replace the request data with validated data
      if (source === 'params') {
        req.params = validatedData as ParamsDictionary;
      } else {
        req[source] = validatedData;
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues,
        });
      }
      next(error);
    }
  };
};

export const validateComposite = (paramsSchema: z.ZodSchema, bodySchema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate params
      const validatedParams = paramsSchema.parse(req.params);
      req.params = validatedParams as ParamsDictionary;

      // Validate body
      const validatedBody = bodySchema.parse(req.body);
      req.body = validatedBody;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues,
        });
      }
      next(error);
    }
  };
};
