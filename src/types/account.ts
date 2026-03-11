import type { Account } from '../generated/prisma/client';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export type SafeAccount = Omit<Account, 'password' | 'createdAt' | 'updatedAt'>;

