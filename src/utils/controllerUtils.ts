import type { Response } from 'express';
import { ZodError } from 'zod';
import { HTTP_STATUS, VALIDATION_MESSAGES, AppError, ERROR_CODES, createValidationError, createNotFoundError } from '../common';

// Centralized error handling functions
export function handleControllerError(res: Response, error: unknown, context: string): void {
  console.error(`${context} - Error:`, error);

  if (error instanceof AppError) {
    // Handle our standardized AppError
    const errorResponse = error.toJSON();
    res.status(error.statusCode).json({
      message: errorResponse.message,
      code: errorResponse.code,
      details: errorResponse.details,
    });
  } else if (error instanceof ZodError) {
    // Handle Zod validation errors with standardized format
    const details = error.issues.map(e => ({
      path: e.path.join('.'),
      code: e.code,
      message: e.message,
    }));
    
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: error.issues.length > 0 ? error.issues[0].message : 'Validation failed',
      code: ERROR_CODES.VALIDATION_ERROR,
      details,
    });
  } else if (error instanceof Error) {
    // Handle generic errors
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: error.message,
      code: ERROR_CODES.VALIDATION_ERROR,
    });
  } else {
    // Handle unknown errors
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'An unexpected error occurred',
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }
}

export function handleControllerNotFound(res: Response, context: string, entity: string): void {
  console.log(`${context} - ${entity} not found`);
  res.status(HTTP_STATUS.NOT_FOUND).json({ 
    message: `${entity} not found`,
    code: ERROR_CODES.ANIMAL_NOT_FOUND, // This will be overridden by specific error codes
  });
}

// New helper functions for standardized error responses
export function handleNotFoundError(res: Response, entity: string, id?: number): void {
  const error = createNotFoundError(entity, id);
  res.status(error.statusCode).json({
    message: error.message,
    code: error.code,
  });
}

export function handleValidationError(res: Response, field: string, message?: string): void {
  const error = createValidationError(field, message);
  res.status(error.statusCode).json({
    message: error.message,
    code: error.code,
  });
}

export function handleBusinessLogicError(res: Response, code: ERROR_CODES, message?: string): void {
  const error = new AppError(code, message);
  res.status(error.statusCode).json({
    message: error.message,
    code: error.code,
  });
}

export function handleAuthError(res: Response, context: string): void {
  console.log(`${context} - Unauthorized`);
  res.status(HTTP_STATUS.UNAUTHORIZED).json({
    message: 'Unauthorized access',
    code: ERROR_CODES.UNAUTHORIZED,
  });
}

export function sendControllerSuccess<T>(res: Response, data: T, message?: string): void {
  if (message) {
    console.log(message);
  }
  res.status(HTTP_STATUS.OK).json(data);
}

export function sendControllerCreated<T>(res: Response, data: T, message?: string): void {
  if (message) {
    console.log(message);
  }
  res.status(HTTP_STATUS.CREATED).json(data);
}

export function sendControllerNoContent(res: Response, message?: string): void {
  if (message) {
    console.log(message);
  }
  res.status(HTTP_STATUS.NO_CONTENT).send();
}

export function sendControllerForbidden(res: Response, message?: string): void {
  if (message) {
    console.log(message);
  }
  res.status(HTTP_STATUS.FORBIDDEN).send();
}

export function validateControllerTypeId(typeId: unknown): number {
  const num = Number(typeId);
  if (!Number.isInteger(num) || num <= 0) {
    throw new Error(VALIDATION_MESSAGES.INVALID_TYPE_ID);
  }
  return num;
}
