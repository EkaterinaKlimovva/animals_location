import type { Response } from 'express';
import { authService } from '../services/authService';
import type { RegisterRequest } from '../types';

export async function register(req: RegisterRequest, res: Response): Promise<void> {
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

