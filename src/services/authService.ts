import bcrypt from 'bcrypt';
import { accountRepository } from '../repositories/accountRepository';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const existing = await accountRepository.findByEmail(data.email);
    if (existing) {
      return { conflict: true as const, account: existing };
    }

    const hash = await bcrypt.hash(data.password, 10);

    const account = await accountRepository.create({
      ...data,
      password: hash,
    });

    return { conflict: false as const, account };
  }
}

export const authService = new AuthService();

