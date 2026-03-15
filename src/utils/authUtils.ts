import type { AuthenticatedRequest } from '../middleware/auth';
import type { Response } from 'express';
import { sendControllerForbidden } from './controllerUtils';

export function requireAuthenticatedUser(req: AuthenticatedRequest): number {
  if (!req.user) {
    throw new Error('Authentication required');
  }
  return req.user.id;
}

export function requireOwnership(req: AuthenticatedRequest, resourceId: number): void {
  const userId = requireAuthenticatedUser(req);
  if (userId !== resourceId) {
    throw new Error('Access denied: insufficient permissions');
  }
}

export function handleAuthError(res: Response, context: string): void {
  sendControllerForbidden(res, `${context} - Authentication/Authorization failed`);
}
