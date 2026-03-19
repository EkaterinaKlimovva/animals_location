import bcrypt from 'bcrypt';
import { accountRepository } from '../repositories/accountRepository';
import type { RegisterData, RegisterResponse } from '../types';
import { AUTH_CONSTANTS } from '../common';

export class AuthService {
  async register(data: RegisterData): Promise<RegisterResponse> {
    const existing = await accountRepository.findByEmail(data.email);
    if (existing) {
      return { conflict: true as const, account: existing };
    }

    const hash = await bcrypt.hash(data.password, AUTH_CONSTANTS.SALT_ROUNDS);

    const account = await accountRepository.create({
      ...data,
      password: hash,
    });

    return { conflict: false as const, account };
  }
}

export const authService = new AuthService();
