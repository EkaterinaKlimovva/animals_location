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

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // Check for Basic authentication
  const authHeader: string | undefined = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Basic ')) {
    try {
      const base64Credentials: string = authHeader.substring(6); // Remove 'Basic ' prefix
      const credentials: string = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [email, password]: string[] = credentials.split(':');

      if (!email || !password) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Verify account exists and credentials are correct
      const account = await accountService.findByEmailWithPassword(email);

      if (!account) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Here you would typically verify the password hash
      // For now, we'll assume the account service can verify credentials
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
      // Invalid Base64 encoding or other error
      res.status(401).json({ message: 'Unauthorized' });
    }
  } else {
    // No valid authorization header found
    res.status(401).json({ message: 'Unauthorized' });
  }
}


