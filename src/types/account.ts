import type { Request } from 'express';
import type { Account } from '../generated/prisma/client';

// ==============================
// Core Entity Types
// ==============================

/**
 * Safe account model - excludes sensitive fields (password, timestamps)
 * Used for API responses to protect user data
 */
export interface SafeAccount {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Legacy type alias for backward compatibility
export type SafeAccountLegacy = Omit<Account, 'password' | 'createdAt' | 'updatedAt'>;

// ==============================
// Authentication Types
// ==============================

interface AuthenticatedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
