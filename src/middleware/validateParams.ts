import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { ParamsDictionary } from 'express-serve-static-core';

export const validateParams = <T>(schema: z.ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === 'params' ? req.params : source === 'query' ? req.query : req.body;
      const validatedData = schema.parse(data);

      // Replace the request data with validated data
      // Merge validated params with existing params to preserve other route parameters
      if (source === 'params') {
        req.params = { ...req.params, ...validatedData } as ParamsDictionary;
      } else if (source === 'query') {
        req.query = validatedData as any;
      } else {
        req.body = validatedData;
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
          message,
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
      // Validate params - merge with existing params to preserve other route parameters
      const validatedParams = paramsSchema.parse(req.params) as Record<string, unknown>;
      req.params = { ...req.params, ...validatedParams } as ParamsDictionary;

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
          message,
          details,
        });
      }
      next(error);
    }
  };
};
