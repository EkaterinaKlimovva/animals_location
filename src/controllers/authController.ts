import type { Response } from 'express';
import { authService } from '../services/authService';
import type { RegisterRequest } from '../types';
import type { AuthenticatedRequest } from '../common';

interface AuthenticatedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthenticatedRegisterRequest extends RegisterRequest {
  user?: AuthenticatedUser;
}

export async function register(req: AuthenticatedRegisterRequest, res: Response): Promise<void> {
  // Check if user is already authenticated
  if (req.user) {
    res.status(403).json({ message: 'Already authenticated users cannot create new accounts' });
    return;
  }

  console.log('[AUTH_CONTROLLER] register called with body:', { ...req.body, password: '[REDACTED]' });
  const { email, password, firstName, lastName }: { email: string; password: string; firstName: string; lastName: string } = req.body;

  if (!email || !password || !firstName || !lastName) {
    console.log('[AUTH_CONTROLLER] Missing required fields - returning 400');
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  const result = await authService.register({
    email,
    password,
    firstName,
    lastName,
  });

  if (result.conflict) {
    console.log(`[AUTH_CONTROLLER] Account already exists for email: ${email} - returning 409`);
    res.status(409).json({ message: 'Account already exists' });
    return;
  }

  const account = result.account;
  console.log(`[AUTH_CONTROLLER] Account registered successfully with id: ${account.id}`);

  res.status(201).json({
    id: account.id,
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
  });
}

