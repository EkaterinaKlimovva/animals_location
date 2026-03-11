import bcrypt from 'bcrypt';
import { accountRepository } from '../repositories/accountRepository';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface RegisterResult {
  conflict: true;
  account: any;
}

interface RegisterSuccess {
  conflict: false;
  account: any;
}

type RegisterResponse = RegisterResult | RegisterSuccess;

export class AuthService {
  async register(data: RegisterData): Promise<RegisterResponse> {
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

