import type { Request, Response, NextFunction } from 'express';
import { Buffer } from 'buffer';
import { accountService } from '../services/accountService';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Check for Basic authentication
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Basic ')) {
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

      // Here you would typically verify the password hash
      // For now, we'll assume the account service can verify credentials
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
      // Invalid Base64 encoding or other error
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }

  // No valid authorization header found
  return res.status(401).json({ message: 'Unauthorized' });
}


