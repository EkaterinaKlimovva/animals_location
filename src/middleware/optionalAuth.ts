import type { Request, Response, NextFunction } from 'express';
import { Buffer } from 'buffer';
import { accountService } from '../services/accountService';

/**
 * Optional authentication middleware
 * If Authorization header is present, validates it
 * If absent or invalid, continues without user context
 * Supports both Stage 0 (no auth required) and Stage 1/2 (auth optional)
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Check for Basic authentication
  const authHeader = req.headers.authorization;

  // No auth header - continue without user context (Stage 0 compatibility)
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return next();
  }

  // Auth header present - try to validate it (Stage 1/2)
  try {
    const base64Credentials = authHeader.substring(6); // Remove 'Basic ' prefix
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify account exists and credentials are correct
    const account = await accountService.findByEmail(email);

    if (!account) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify credentials
    const isValidCredentials = await accountService.verifyCredentials(email, password);

    if (!isValidCredentials) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Attach account info to request for later use
    (req as any).user = {
      id: account.id,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
    };

    return next();
  } catch {
    // Invalid Base64 encoding or other error - return 401 since auth was attempted
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
