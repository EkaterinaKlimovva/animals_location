import type { Account } from '../generated/prisma/client';

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
