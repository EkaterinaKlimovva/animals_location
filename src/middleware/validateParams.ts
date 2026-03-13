import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { ParamsDictionary } from 'express-serve-static-core';

export const validateParams = <T = any>(schema: z.ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') => {
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
        const details = error.issues.map((e) => ({
          path: e.path.join('.'),
          code: e.code,
          message: e.message,
        }));
        const message = error.issues.length > 0 ? error.issues[0].message : 'Validation failed';
        return res.status(400).json({
          error: message,
          details,
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
        const details = error.issues.map((e) => ({
          path: e.path.join('.'),
          code: e.code,
          message: e.message,
        }));
        const message = error.issues.length > 0 ? error.issues[0].message : 'Validation failed';
        return res.status(400).json({
          error: message,
          details,
        });
      }
      next(error);
    }
  };
};
