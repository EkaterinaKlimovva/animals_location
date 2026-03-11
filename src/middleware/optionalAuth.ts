import type { Request, Response, NextFunction } from 'express';
import { Buffer } from 'buffer';
import { accountService } from '../services/accountService';

interface AuthenticatedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Optional authentication middleware
 * If Authorization header is present, validates it
 * If absent or invalid, continues without user context
 * Supports both Stage 0 (no auth required) and Stage 1/2 (auth optional)
 */
export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // Check for Basic authentication
  const authHeader: string | undefined = req.headers.authorization;

  // No auth header - continue without user context (Stage 0 compatibility)
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    next();
    return;
  }

  // Auth header present - try to validate it (Stage 1/2)
  try {
    const base64Credentials: string = authHeader.substring(6); // Remove 'Basic ' prefix
    const credentials: string = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password]: string[] = credentials.split(':');

    if (!email || !password) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Verify account exists and credentials are correct
    const account = await accountService.findByEmail(email);

    if (!account) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Verify credentials
    const isValidCredentials = await accountService.verifyCredentials(email, password);

    if (!isValidCredentials) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Attach account info to request for later use
    req.user = {
      id: account.id,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
    };

    next();
  } catch {
    // Invalid Base64 encoding or other error - return 401 since auth was attempted
    res.status(401).json({ message: 'Unauthorized' });
  }
}
