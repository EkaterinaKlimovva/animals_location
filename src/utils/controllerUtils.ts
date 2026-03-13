import type { Response } from 'express';
import { HTTP_STATUS, VALIDATION_MESSAGES } from './constants';
import { ZodError } from 'zod';

// Centralized error handling functions
export function handleControllerError(res: Response, error: unknown, context: string): void {
  let message: string;

  if (error instanceof ZodError) {
    // Extract clean error messages from Zod validation errors
    message = error.issues.map(e => e.message).join(', ');
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = VALIDATION_MESSAGES.VALIDATION_ERROR;
  }

  console.error(`${context} - Error:`, error);
  res.status(HTTP_STATUS.BAD_REQUEST).json({ message });
}

export function handleControllerNotFound(res: Response, context: string, entity: string): void {
  const message = `${entity} not found`;
  console.log(`${context} - ${message}`);
  res.status(HTTP_STATUS.NOT_FOUND).json({ message });
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
